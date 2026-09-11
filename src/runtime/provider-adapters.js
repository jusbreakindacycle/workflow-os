// @ts-check
import crypto from 'node:crypto';

const DEFAULT_TIMEOUT_MS = 90_000;

/**
 * Inspect configuration without spending money or making a provider call.
 * `available` means a zero-incremental fixture route is ready.
 * Real remote routes remain `degraded` until a live call succeeds.
 */
export function inspectConnectionHealth(connection, env = process.env) {
  if (!connection.enabled || connection.status === 'disabled') {
    return { status: 'disabled', reason: 'connection_disabled' };
  }
  if (connection.provider_key === 'fixture') {
    return { status: 'available', reason: 'local_fixture_ready' };
  }
  if (connection.connection_type === 'api_key') {
    if (!connection.credential_ref) return { status: 'unavailable', reason: 'credential_ref_missing' };
    if (!isSafeCredentialRef(connection.credential_ref)) return { status: 'unavailable', reason: 'credential_ref_invalid' };
    if (!env[connection.credential_ref]) return { status: 'unavailable', reason: 'credential_not_present' };
    return { status: 'degraded', reason: 'credential_present_live_probe_not_run' };
  }
  return { status: 'degraded', reason: 'connection_configured_live_probe_not_run' };
}

/**
 * Execute one normalized model/runtime route.
 * The caller owns authority, spend, loop, and verification semantics.
 */
export async function executeProviderRoute({ route, connection, prompt, env = process.env, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (typeof prompt !== 'string' || prompt.trim() === '') throw new TypeError('provider_prompt_required');
  if (!route?.adapter_kind) throw new TypeError('route_adapter_kind_required');
  if (!connection?.id) throw new TypeError('provider_connection_required');

  if (route.adapter_kind === 'fixture') return executeFixture(route, prompt);
  if (route.adapter_kind === 'openai_responses') {
    return executeOpenAIResponses({ route, connection, prompt, env, fetchImpl, timeoutMs });
  }
  if (route.adapter_kind === 'anthropic_messages') {
    return executeAnthropicMessages({ route, connection, prompt, env, fetchImpl, timeoutMs });
  }
  throw new Error(`unsupported_provider_adapter:${route.adapter_kind}`);
}

function executeFixture(route, prompt) {
  const config = parseJson(route.config_json, {});
  if (config.always_fail === true) throw new Error(`fixture_route_failure:${route.id}`);
  const mode = config.mode ?? 'worker';
  if (mode === 'verifier') {
    const shouldFail = config.always_reject === true || prompt.includes('FORCE_VERIFIER_FAIL');
    const value = shouldFail
      ? { outcome: 'fail', summary: String(config.reject_summary ?? 'Fixture verifier rejected the synthetic result.') }
      : { outcome: 'pass', summary: 'Fixture verifier independently accepted the synthetic result.' };
    return Promise.resolve({
      text: JSON.stringify(value),
      externalRef: `fixture:${route.id}:${crypto.randomUUID()}`,
      usage: { fixture: true, mode },
      actualCostMinor: 0
    });
  }
  const feedback = prompt.match(/<verifier_feedback>([\s\S]*?)<\/verifier_feedback>/)?.[1]?.trim();
  const text = feedback
    ? `Fixture worker produced a bounded revision using verifier feedback: ${feedback}`
    : 'Fixture worker produced bounded synthetic execution evidence.';
  return Promise.resolve({
    text,
    externalRef: `fixture:${route.id}:${crypto.randomUUID()}`,
    usage: { fixture: true, mode },
    actualCostMinor: 0
  });
}

async function executeOpenAIResponses({ route, connection, prompt, env, fetchImpl, timeoutMs }) {
  const apiKey = credentialValue(connection, env);
  const config = parseJson(route.config_json, {});
  const endpoint = connection.endpoint_url || 'https://api.openai.com/v1/responses';
  const body = {
    model: requiredModel(route),
    input: prompt,
    store: false,
    max_output_tokens: positiveInteger(config.max_output_tokens, 1200)
  };
  const headers = {
    authorization: `Bearer ${apiKey}`,
    'content-type': 'application/json'
  };
  if (connection.provider_key === 'openrouter') headers['x-openrouter-metadata'] = 'enabled';
  const response = await timedFetch(fetchImpl, endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  }, timeoutMs);
  const payload = await readResponseJson(response, 'openai_responses');
  const text = extractOpenAIText(payload);
  if (!text) throw new Error('provider_empty_output:openai_responses');
  const usage = payload.usage && typeof payload.usage === 'object' ? payload.usage : {};
  const rateLimits = extractRateLimitHeaders(response.headers);
  return {
    text,
    externalRef: typeof payload.id === 'string' ? payload.id : null,
    usage: Object.keys(rateLimits).length ? { ...usage, rate_limits: rateLimits } : usage,
    actualCostMinor: null
  };
}

async function executeAnthropicMessages({ route, connection, prompt, env, fetchImpl, timeoutMs }) {
  const apiKey = credentialValue(connection, env);
  const config = parseJson(route.config_json, {});
  const endpoint = connection.endpoint_url || 'https://api.anthropic.com/v1/messages';
  const body = {
    model: requiredModel(route),
    max_tokens: positiveInteger(config.max_tokens, 1200),
    messages: [{ role: 'user', content: prompt }]
  };
  const response = await timedFetch(fetchImpl, endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': String(config.anthropic_version ?? '2023-06-01'),
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  }, timeoutMs);
  const payload = await readResponseJson(response, 'anthropic_messages');
  const text = Array.isArray(payload.content)
    ? payload.content.filter((part) => part && part.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('\n').trim()
    : '';
  if (!text) throw new Error('provider_empty_output:anthropic_messages');
  const usage = payload.usage && typeof payload.usage === 'object' ? payload.usage : {};
  const rateLimits = extractRateLimitHeaders(response.headers);
  return {
    text,
    externalRef: typeof payload.id === 'string' ? payload.id : null,
    usage: Object.keys(rateLimits).length ? { ...usage, rate_limits: rateLimits } : usage,
    actualCostMinor: null
  };
}

async function timedFetch(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('provider_timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readResponseJson(response, adapter) {
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error(`provider_invalid_json:${adapter}:${response.status}`); }
  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? `http_${response.status}`;
    const retryAfter = response?.headers?.get?.('retry-after');
    const suffix = retryAfter ? `:retry_after=${String(retryAfter).slice(0, 40)}` : '';
    throw new Error(`provider_http_error:${adapter}:${response.status}:${String(message).slice(0, 220)}${suffix}`);
  }
  return payload;
}

function extractOpenAIText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim();
  if (!Array.isArray(payload.output)) return '';
  const parts = [];
  for (const item of payload.output) {
    if (!item || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content?.type === 'output_text' && typeof content.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

function extractRateLimitHeaders(headers) {
  if (!headers || typeof headers.get !== 'function') return {};
  const mapping = {
    limit_requests: 'x-ratelimit-limit-requests',
    limit_tokens: 'x-ratelimit-limit-tokens',
    remaining_requests: 'x-ratelimit-remaining-requests',
    remaining_tokens: 'x-ratelimit-remaining-tokens',
    reset_requests: 'x-ratelimit-reset-requests',
    reset_tokens: 'x-ratelimit-reset-tokens',
    retry_after: 'retry-after'
  };
  const value = {};
  for (const [key, header] of Object.entries(mapping)) {
    const raw = headers.get(header);
    if (raw !== null && raw !== undefined && String(raw).trim() !== '') value[key] = String(raw).trim();
  }
  return value;
}

function credentialValue(connection, env) {
  if (!connection.credential_ref || !isSafeCredentialRef(connection.credential_ref)) throw new Error('provider_credential_ref_invalid');
  const value = env[connection.credential_ref];
  if (!value) throw new Error(`provider_credential_missing:${connection.credential_ref}`);
  return value;
}

function requiredModel(route) {
  if (typeof route.model_key !== 'string' || route.model_key.trim() === '') throw new Error('route_model_required');
  return route.model_key.trim();
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function isSafeCredentialRef(value) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]{2,127}$/.test(value);
}

function parseJson(text, fallback) {
  try { return text ? JSON.parse(text) : fallback; }
  catch { return fallback; }
}
