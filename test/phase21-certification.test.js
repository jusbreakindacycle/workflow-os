import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  CERTIFICATION_ARTIFACT_OBJECTIVE,
  CERTIFICATION_EXPECTED_ARTIFACT,
  CERTIFICATION_EXPECTED_ARTIFACT_JSON,
  CERTIFICATION_TOOL_FREE_CONSTRAINT,
  CERTIFICATION_VERIFICATION_ACCEPTANCE,
  parseCertificationArtifact,
  selectBestWorkerRoute
} from '../src/runtime/phase21-certification.js';

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

test('certification synthetic work is explicitly tool-free and forbids self-certification claims', () => {
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /do not invoke tools, commands, files, network/i);
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /zero paid spend/i);
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /do not claim that independent verification has occurred/i);
  assert.match(CERTIFICATION_TOOL_FREE_CONSTRAINT, /do not invent hashes, HTTP\/status codes, command results, external actions/i);
  assert.match(CERTIFICATION_ARTIFACT_OBJECTIVE, /exactly one JSON object/i);
  assert.match(CERTIFICATION_ARTIFACT_OBJECTIVE, /do not claim that verification has occurred/i);
});

test('certification artifact contract is strict, deterministic, and rejects invented wrapper content', () => {
  assert.deepEqual(parseCertificationArtifact(CERTIFICATION_EXPECTED_ARTIFACT_JSON), CERTIFICATION_EXPECTED_ARTIFACT);
  assert.deepEqual(parseCertificationArtifact(`  ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}\n`), CERTIFICATION_EXPECTED_ARTIFACT);
  assert.equal(parseCertificationArtifact(`\`\`\`json\n${CERTIFICATION_EXPECTED_ARTIFACT_JSON}\n\`\`\``), null);
  assert.equal(parseCertificationArtifact(JSON.stringify({ ...CERTIFICATION_EXPECTED_ARTIFACT, verification_status: 'passed' })), null);
  assert.equal(parseCertificationArtifact(JSON.stringify({ ...CERTIFICATION_EXPECTED_ARTIFACT, paid_spend_allowed: true })), null);
});

test('certification verifier treats the text artifact as observable evidence without demanding forbidden side effects', () => {
  assert.match(CERTIFICATION_VERIFICATION_ACCEPTANCE, /candidate output itself is the observable artifact/i);
  assert.match(CERTIFICATION_VERIFICATION_ACCEPTANCE, /do not require proof of tools, commands, files, network calls, hashes, HTTP status codes, or external side effects/i);
  assert.match(CERTIFICATION_VERIFICATION_ACCEPTANCE, /Workflow OS proves verification separately/i);
});

test('live certification creates a dedicated WorkItem and proves claims from canonical records', () => {
  const source = fs.readFileSync(new URL('../scripts/phase21-free-first-certify.js', import.meta.url), 'utf8');
  assert.match(source, /createWorkItem\s*\(\s*\{/);
  assert.match(source, /class:\s*'certification'/);
  assert.match(source, /title:\s*'Produce deterministic free-first certification artifact'/);
  assert.doesNotMatch(source, /ensureInitialWorkGraph/);
  assert.match(source, /FROM execution_attempts/);
  assert.match(source, /FROM loop_iterations/);
  assert.match(source, /FROM verification_runs/);
  assert.match(source, /FROM spend_envelopes/);
  assert.match(source, /FROM cost_records/);
  assert.match(source, /certification_type = 'portability_drill'/);
});

test('certification failure path unwinds resources instead of forcing process.exit', () => {
  const source = fs.readFileSync(new URL('../scripts/phase21-free-first-certify.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /process\.exit\s*\(/);
  assert.match(source, /process\.exitCode\s*=\s*1/);
  assert.match(source, /await bridge\.close\(\)/);
});
