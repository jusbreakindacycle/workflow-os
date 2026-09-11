import assert from 'node:assert/strict';
import test from 'node:test';
import { executeProviderRoute, inspectConnectionHealth } from '../src/runtime/provider-adapters.js';

function response(body, status = 200, headers = {}) {
  const normalized = new Map(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)]));
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get(name) { return normalized.get(String(name).toLowerCase()) ?? null; } },
    async json() { return body; }
  };
}

test('OpenAI Responses adapter normalizes text and never needs a raw secret in route state', async () => {
  const connection = { id: 'c1', provider_key: 'openai', connection_type: 'api_key', credential_ref: 'TEST_OPENAI_KEY', enabled: 1, status: 'degraded', endpoint_url: null };
  const route = { id: 'r1', adapter_kind: 'openai_responses', model_key: 'synthetic-model', config_json: '{"max_output_tokens":100}' };
  let request;
  const result = await executeProviderRoute({
    connection,
    route,
    prompt: 'synthetic prompt',
    env: { TEST_OPENAI_KEY: 'secret-not-persisted' },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response({ id: 'resp_1', output: [{ content: [{ type: 'output_text', text: 'normalized result' }] }], usage: { input_tokens: 10 } });
    }
  });
  assert.equal(result.text, 'normalized result');
  assert.equal(result.externalRef, 'resp_1');
  assert.match(request.options.headers.authorization, /^Bearer /);
  assert.equal(JSON.parse(request.options.body).store, false);
  assert.doesNotMatch(JSON.stringify(route), /secret-not-persisted/);
  assert.doesNotMatch(JSON.stringify(connection), /secret-not-persisted/);
});

test('Groq-compatible Responses route omits unsupported store field and retains quota headers', async () => {
  const connection = { id: 'groq', provider_key: 'groq', connection_type: 'api_key', credential_ref: 'TEST_GROQ_KEY', enabled: 1, status: 'degraded', endpoint_url: 'https://api.groq.com/openai/v1/responses' };
  const route = { id: 'groq-route', adapter_kind: 'openai_responses', model_key: 'openai/gpt-oss-120b', config_json: '{"max_output_tokens":100}' };
  let body;
  const result = await executeProviderRoute({
    connection,
    route,
    prompt: 'synthetic prompt',
    env: { TEST_GROQ_KEY: 'secret-not-persisted' },
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return response(
        { id: 'groq_1', output_text: 'free result', usage: { input_tokens: 12, output_tokens: 3, total_tokens: 15 } },
        200,
        {
          'x-ratelimit-limit-requests': '1000',
          'x-ratelimit-remaining-requests': '998',
          'x-ratelimit-limit-tokens': '8000',
          'x-ratelimit-remaining-tokens': '7900',
          'x-ratelimit-reset-requests': '1h',
          'x-ratelimit-reset-tokens': '2s'
        }
      );
    }
  });
  assert.equal('store' in body, false);
  assert.equal(result.text, 'free result');
  assert.equal(result.usage.rate_limits.remaining_requests, '998');
  assert.equal(result.usage.rate_limits.remaining_tokens, '7900');
});

test('Anthropic Messages adapter normalizes text blocks', async () => {
  const connection = { id: 'c2', provider_key: 'anthropic', connection_type: 'api_key', credential_ref: 'TEST_ANTHROPIC_KEY', enabled: 1, status: 'degraded', endpoint_url: null };
  const route = { id: 'r2', adapter_kind: 'anthropic_messages', model_key: 'synthetic-model', config_json: '{}' };
  const result = await executeProviderRoute({
    connection,
    route,
    prompt: 'synthetic prompt',
    env: { TEST_ANTHROPIC_KEY: 'secret-not-persisted' },
    fetchImpl: async () => response({ id: 'msg_1', content: [{ type: 'text', text: 'first' }, { type: 'text', text: 'second' }], usage: { input_tokens: 5 } })
  });
  assert.equal(result.text, 'first\nsecond');
  assert.equal(result.externalRef, 'msg_1');
});

test('missing credentials make API-key connection unavailable and execution fails closed', async () => {
  const connection = { id: 'c3', provider_key: 'openai', connection_type: 'api_key', credential_ref: 'MISSING_TEST_KEY', enabled: 1, status: 'unavailable', endpoint_url: null };
  assert.equal(inspectConnectionHealth(connection, {}).status, 'unavailable');
  await assert.rejects(() => executeProviderRoute({
    connection,
    route: { id: 'r3', adapter_kind: 'openai_responses', model_key: 'synthetic-model', config_json: '{}' },
    prompt: 'synthetic prompt',
    env: {},
    fetchImpl: async () => { throw new Error('network_should_not_be_reached'); }
  }), /provider_credential_missing:MISSING_TEST_KEY/);
});

test('fixture adapter supports deterministic failure for broker fallback tests', async () => {
  await assert.rejects(() => executeProviderRoute({
    connection: { id: 'fixture', provider_key: 'fixture', enabled: 1, status: 'available' },
    route: { id: 'fail', adapter_kind: 'fixture', config_json: '{"always_fail":true}' },
    prompt: 'test'
  }), /fixture_route_failure:fail/);
});
