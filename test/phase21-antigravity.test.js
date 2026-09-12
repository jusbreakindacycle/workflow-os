import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAntigravityModels, parseAntigravityUsage, runAntigravityPrompt, startAntigravityBridge } from '../src/runtime/antigravity-bridge.js';
import { executeProviderRoute } from '../src/runtime/provider-adapters.js';

test('Antigravity model discovery classifies economy, balanced, and frontier routes', () => {
  const models = parseAntigravityModels(`
    gemini-3.8-flash-medium   Gemini 3.8 Flash (Medium)
    gemini-3.1-pro-high       Gemini 3.1 Pro (High)
    claude-sonnet-4-6         Claude Sonnet 4.6 (Thinking)
    claude-opus-4-6           Claude Opus 4.6 (Thinking)
  `);
  assert.deepEqual(models.map((model) => [model.slug, model.tier]), [
    ['gemini-3.8-flash-medium', 'economy'],
    ['gemini-3.1-pro-high', 'frontier'],
    ['claude-sonnet-4-6', 'balanced'],
    ['claude-opus-4-6', 'frontier']
  ]);
});

test('Antigravity usage parser keeps quota percentages conservative', () => {
  const quotas = parseAntigravityUsage(`
    Gemini models | Weekly Limit Remaining 82% | Five Hour Limit Remaining 61%
    Claude and GPT models | Weekly Limit Remaining 19% | Five Hour Limit Remaining 12%
  `);
  assert.equal(quotas.length, 2);
  assert.equal(quotas[0].remainingFraction, 0.61);
  assert.equal(quotas[1].remainingFraction, 0.12);
});

test('Antigravity permission denial is reported distinctly from empty output', async () => {
  const runCommand = async () => ({
    stdout: JSON.stringify({
      conversation_id: 'agy-denied-conversation',
      status: 'SUCCESS',
      response: '',
      usage: { input_tokens: 100, output_tokens: 12, total_tokens: 112 },
      denied_actions: [{ action: 'command', display_name: 'RunCommand' }]
    }),
    stderr: ''
  });

  await assert.rejects(
    () => runAntigravityPrompt({ prompt: 'Return text only.', model: 'gemini-3.8-flash-medium', runCommand }),
    /antigravity_permission_denied:command;status=SUCCESS;conversation_id=agy-denied-conversation;total_tokens=112/
  );
});

test('loopback Antigravity bridge works through normalized OpenAI Responses adapter without a secret', async (t) => {
  const runCommand = async (_command, args) => {
    assert.ok(args.includes('--sandbox'));
    assert.ok(!args.includes('--dangerously-skip-permissions'));
    return {
      stdout: JSON.stringify({
        conversation_id: 'agy-test-conversation',
        status: 'SUCCESS',
        response: 'bounded live-like output',
        usage: { input_tokens: 10, output_tokens: 4, total_tokens: 14 }
      }),
      stderr: ''
    };
  };
  const bridge = await startAntigravityBridge({ runCommand });
  t.after(async () => bridge.close());

  const result = await executeProviderRoute({
    route: { adapter_kind: 'openai_responses', model_key: 'gemini-3.8-flash-medium', config_json: '{"max_output_tokens":100}' },
    connection: { id: 'agy', provider_key: 'google-antigravity', connection_type: 'local_service', endpoint_url: bridge.endpointUrl },
    prompt: 'Explain one bounded invariant.'
  });

  assert.equal(result.text, 'bounded live-like output');
  assert.equal(result.externalRef, 'agy-test-conversation');
  assert.equal(result.actualCostMinor, null);
  assert.equal(result.usage.total_tokens, 14);
});
