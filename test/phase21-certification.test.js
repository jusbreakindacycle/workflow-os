import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { CERTIFICATION_TOOL_FREE_CONSTRAINT, selectBestWorkerRoute } from '../src/runtime/phase21-certification.js';

test('portability certification selects a worker projection, never a higher-scored verifier projection', () => {
  const routes = [
    {
      id: 'verifier',
      provider_key: 'openrouter',
      enabled: 1,
      quality_score: 99,
      config: { route_role: 'verifier' },
      capabilities_json: JSON.stringify(['verification'])
    },
    {
      id: 'worker',
      provider_key: 'openrouter',
      enabled: 1,
      quality_score: 65,
      config: { route_role: 'worker' },
      capabilities_json: JSON.stringify(['reasoning', 'structured_output'])
    }
  ];

  const selected = selectBestWorkerRoute(routes, 'openrouter');
  assert.equal(selected?.id, 'worker');
});

test('certification synthetic work is explicitly tool-free', () => {
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /do not invoke tools, commands, files, network/i);
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /zero paid spend/i);
});

test('certification failure path unwinds resources instead of forcing process.exit', () => {
  const source = fs.readFileSync(new URL('../scripts/phase21-free-first-certify.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /process\.exit\s*\(/);
  assert.match(source, /process\.exitCode\s*=\s*1/);
  assert.match(source, /await bridge\.close\(\)/);
});
