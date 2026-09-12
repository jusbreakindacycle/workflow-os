// @ts-check

export const CERTIFICATION_TOOL_FREE_CONSTRAINT = 'Synthetic data only; zero paid spend; no production/destructive side effects; do not invoke tools, commands, files, network, or external side effects; answer only from the supplied context.';

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
