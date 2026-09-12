// @ts-check

export const CERTIFICATION_EXPECTED_ARTIFACT = Object.freeze({
  authority_owner: 'workflow_os',
  paid_spend_allowed: false,
  production_side_effects_allowed: false,
  independent_verification_required: true,
  scope_change_requires_approval: true
});

export const CERTIFICATION_EXPECTED_ARTIFACT_JSON = JSON.stringify(CERTIFICATION_EXPECTED_ARTIFACT);

export const CERTIFICATION_TOOL_FREE_CONSTRAINT = [
  'Synthetic data only; zero paid spend; no production/destructive side effects.',
  'Do not invoke tools, commands, files, network, or external side effects; answer only from the supplied context.',
  'This WorkItem is text-only: the returned JSON artifact itself is the observable execution result.',
  'Do not claim that independent verification has occurred; Workflow OS records verification after worker execution.',
  'Do not invent hashes, HTTP/status codes, command results, external actions, or other execution evidence.'
].join(' ');

export const CERTIFICATION_ARTIFACT_OBJECTIVE = [
  'Produce exactly one JSON object and no markdown, commentary, code fences, or extra fields.',
  `The object must be exactly: ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}`,
  'Do not claim that verification has occurred.',
  'Do not invent hashes, status codes, commands, external actions, or execution evidence.'
].join(' ');

export const CERTIFICATION_VERIFICATION_ACCEPTANCE = [
  `Accept only a candidate JSON object that exactly matches ${CERTIFICATION_EXPECTED_ARTIFACT_JSON}.`,
  'For this text-only WorkItem, the candidate output itself is the observable artifact and is sufficient evidence of artifact production.',
  'Do not require proof of tools, commands, files, network calls, hashes, HTTP status codes, or external side effects because those actions are explicitly forbidden.',
  'Do not accept a candidate that claims independent verification already occurred; Workflow OS proves verification separately from canonical execution records.'
].join(' ');

/**
 * Parse the certification artifact using a deliberately strict contract.
 * Whitespace is allowed, but markdown/code fences, prose, missing fields, extra
 * fields, or changed values are rejected.
 * @param {unknown} text
 */
export function parseCertificationArtifact(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  let value;
  try { value = JSON.parse(text.trim()); }
  catch { return null; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const expectedKeys = Object.keys(CERTIFICATION_EXPECTED_ARTIFACT).sort();
  const actualKeys = Object.keys(value).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) return null;
  for (const key of expectedKeys) {
    if (value[key] !== CERTIFICATION_EXPECTED_ARTIFACT[key]) return null;
  }
  return value;
}

/**
 * Pick a real worker projection for portability certification.
 * Verifier projections may have equal or higher quality scores, but they are
 * never valid worker substitutes.
 * @param {Array<Record<string, any>>} routes
 * @param {string} providerKey
 */
export function selectBestWorkerRoute(routes, providerKey) {
  if (!Array.isArray(routes) || typeof providerKey !== 'string' || !providerKey.trim()) return null;
  return routes
    .filter((route) => {
      const config = route?.config && typeof route.config === 'object' && !Array.isArray(route.config)
        ? route.config
        : parseJson(route?.config_json, {});
      const capabilities = parseJson(route?.capabilities_json, []);
      return route?.provider_key === providerKey
        && route?.enabled === 1
        && Number(route?.quality_score ?? 0) > 0
        && config.route_role === 'worker'
        && Array.isArray(capabilities)
        && capabilities.includes('reasoning');
    })
    .sort((a, b) => Number(b.quality_score ?? 0) - Number(a.quality_score ?? 0))[0] ?? null;
}

function parseJson(text, fallback) {
  try { return typeof text === 'string' && text ? JSON.parse(text) : fallback; }
  catch { return fallback; }
}
