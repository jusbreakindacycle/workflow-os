// @ts-check
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT_MS = 10 * 60_000;
const MAX_BUFFER = 4 * 1024 * 1024;

/**
 * Discover installed Antigravity model slugs without making a model call.
 * @param {{runCommand?: typeof defaultRunCommand}} [options]
 */
export async function discoverAntigravityModels(options = {}) {
  const runCommand = options.runCommand ?? defaultRunCommand;
  const result = await runCommand('agy', ['models'], { timeoutMs: 30_000 });
  return parseAntigravityModels(result.stdout);
}

/**
 * Best-effort quota probe. `/usage` is an Antigravity CLI command and does not
 * execute a project WorkItem. The raw output is always retained so future CLI
 * format changes do not silently become invented quota data.
 * @param {{runCommand?: typeof defaultRunCommand}} [options]
 */
export async function probeAntigravityUsage(options = {}) {
  const runCommand = options.runCommand ?? defaultRunCommand;
  const result = await runCommand('agy', ['-p', '/usage', '--output-format', 'text'], { timeoutMs: 30_000 });
  return { raw: result.stdout, quotas: parseAntigravityUsage(result.stdout) };
}

/**
 * Run one bounded, sandboxed Antigravity prompt. No `--dangerously-skip-permissions`
 * flag is ever used here. Headless permission denials are surfaced explicitly
 * instead of being collapsed into a generic empty-output failure.
 * @param {{prompt:string,model:string,maxOutputTokens?:number,timeoutMs?:number,runCommand?:typeof defaultRunCommand}} input
 */
export async function runAntigravityPrompt({ prompt, model, maxOutputTokens = 800, timeoutMs = DEFAULT_TIMEOUT_MS, runCommand = defaultRunCommand }) {
  if (typeof prompt !== 'string' || !prompt.trim()) throw new TypeError('antigravity_prompt_required');
  if (typeof model !== 'string' || !model.trim()) throw new TypeError('antigravity_model_required');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-agy-'));
  try {
    const args = [
      '-p', prompt,
      '--model', model,
      '--output-format', 'json',
      '--sandbox',
      '--print-timeout', `${Math.max(1, Math.ceil(timeoutMs / 60_000))}m`
    ];
    const result = await runCommand('agy', args, { cwd: tempDir, timeoutMs });
    let payload;
    try { payload = JSON.parse(result.stdout); }
    catch { throw new Error('antigravity_invalid_json'); }

    const deniedActions = antigravityDeniedActions(payload);
    const context = antigravitySafeContext(payload);
    if (deniedActions.length) {
      throw new Error(`antigravity_permission_denied:${deniedActions.join(',')};${context}`);
    }
    if (payload?.status !== 'SUCCESS') {
      throw new Error(`antigravity_error:${String(payload?.error ?? payload?.status ?? 'unknown').slice(0, 400)};${context}`);
    }
    const text = typeof payload.response === 'string' ? payload.response.trim() : '';
    if (!text) throw new Error(`antigravity_empty_output;${context}`);
    const usage = payload.usage && typeof payload.usage === 'object' ? payload.usage : {};
    return {
      text,
      externalRef: typeof payload.conversation_id === 'string' ? payload.conversation_id : null,
      usage: { ...usage, antigravity_model: model, max_output_tokens_requested: maxOutputTokens },
      actualCostMinor: 0
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Start a loopback-only OpenAI Responses-compatible bridge to Antigravity CLI.
 * This lets the existing Phase 2 normalized `openai_responses` adapter call a
 * local subscription/free-quota runtime without making Antigravity canonical.
 * @param {{runCommand?:typeof defaultRunCommand,host?:string,timeoutMs?:number}} [options]
 */
export async function startAntigravityBridge(options = {}) {
  const runCommand = options.runCommand ?? defaultRunCommand;
  const host = options.host ?? '127.0.0.1';
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const server = http.createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/responses') return sendJson(response, 404, { error: { message: 'not_found' } });
    try {
      const body = await readJson(request);
      const prompt = typeof body.input === 'string' ? body.input : '';
      const model = typeof body.model === 'string' ? body.model : '';
      const maxOutputTokens = Number.isInteger(body.max_output_tokens) ? body.max_output_tokens : 800;
      const result = await runAntigravityPrompt({ prompt, model, maxOutputTokens, timeoutMs, runCommand });
      return sendJson(response, 200, {
        id: result.externalRef ?? `agy_${crypto.randomUUID()}`,
        object: 'response',
        status: 'completed',
        output_text: result.text,
        output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: result.text }] }],
        usage: result.usage
      });
    } catch (error) {
      return sendJson(response, 502, { error: { message: error instanceof Error ? error.message : String(error) } });
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => { server.off('error', reject); resolve(undefined); });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('antigravity_bridge_address_unavailable');
  return {
    endpointUrl: `http://${host}:${address.port}/v1/responses`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve(undefined)))
  };
}

export function parseAntigravityModels(text) {
  const models = [];
  for (const rawLine of String(text ?? '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([a-z0-9][a-z0-9._-]{2,})\s{2,}(.+)$/i) ?? line.match(/^([a-z0-9][a-z0-9._-]{2,})\s+(.+)$/i);
    if (!match) continue;
    const slug = match[1];
    const label = match[2].trim();
    if (!slug.includes('-')) continue;
    models.push({ slug, label, tier: classifyAntigravityModel(slug, label) });
  }
  return dedupeBy(models, (model) => model.slug);
}

export function parseAntigravityUsage(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const result = [];
  let currentLabel = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!/%/.test(line) && /gemini|claude|gpt|model/i.test(line)) currentLabel = line.replace(/[:|]+$/g, '').trim();
    const percents = [...line.matchAll(/(\d{1,3}(?:\.\d+)?)\s*%/g)].map((match) => Number(match[1])).filter((value) => value >= 0 && value <= 100);
    if (!percents.length) continue;
    const labelMatch = line.match(/^(.*?)(?=\d{1,3}(?:\.\d+)?\s*%)/);
    const label = (labelMatch?.[1] || currentLabel || 'unknown').replace(/[|:=-]+$/g, '').trim() || 'unknown';
    result.push({
      label,
      remainingFraction: Math.min(...percents) / 100,
      percentages: percents
    });
  }
  return dedupeBy(result, (entry) => `${entry.label}:${entry.remainingFraction}`);
}

export function classifyAntigravityModel(slug, label = '') {
  const value = `${slug} ${label}`.toLowerCase();
  if (value.includes('opus') || value.includes('pro-high')) return 'frontier';
  if (value.includes('sonnet') || value.includes('gpt-oss') || value.includes('flash-high')) return 'balanced';
  if (value.includes('flash')) return 'economy';
  return 'balanced';
}

async function defaultRunCommand(command, args, options = {}) {
  try {
    const { stdout = '', stderr = '' } = await execFileAsync(command, args, {
      cwd: options.cwd,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      windowsHide: true,
      env: process.env
    });
    return { stdout: String(stdout), stderr: String(stderr) };
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown';
    const stderr = error && typeof error === 'object' && 'stderr' in error ? String(error.stderr ?? '') : '';
    const stdout = error && typeof error === 'object' && 'stdout' in error ? String(error.stdout ?? '') : '';
    throw new Error(`antigravity_cli_failed:${code}:${(stderr || stdout || String(error)).slice(0, 500)}`);
  }
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 512 * 1024) throw new TypeError('antigravity_bridge_body_too_large');
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError('antigravity_bridge_json_object_required');
  return parsed;
}

function sendJson(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'content-length': body.length, 'cache-control': 'no-store' });
  response.end(body);
}

function antigravityDeniedActions(payload) {
  if (!Array.isArray(payload?.denied_actions)) return [];
  return [...new Set(payload.denied_actions.map((entry) => {
    if (entry && typeof entry === 'object' && typeof entry.action === 'string') return entry.action.trim();
    return '';
  }).filter(Boolean))];
}

function antigravitySafeContext(payload) {
  const parts = [`status=${String(payload?.status ?? 'unknown').slice(0, 40)}`];
  if (typeof payload?.conversation_id === 'string' && payload.conversation_id.trim()) {
    parts.push(`conversation_id=${payload.conversation_id.trim().slice(0, 120)}`);
  }
  const totalTokens = Number(payload?.usage?.total_tokens);
  if (Number.isInteger(totalTokens) && totalTokens >= 0) parts.push(`total_tokens=${totalTokens}`);
  return parts.join(';');
}

function dedupeBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
