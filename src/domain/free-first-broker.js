// @ts-check
import crypto from 'node:crypto';
import { Phase2AutonomyKernel } from './phase2-autonomy-kernel.js';

const FREE_SOURCE = 'phase-2.1-free-first';
const DEFAULT_POLICY = Object.freeze({
  healthyThresholdBp: 4000,
  reserveThresholdBp: 1500,
  verifierReserveBp: 1000,
  openrouterDailyRequestLimit: 50,
  unknownQuotaBehavior: 'allow_fallback'
});

export class FreeFirstBroker {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
    this.phase2 = new Phase2AutonomyKernel(db);
  }

  ensurePolicy({ workspaceId, ...overrides }) {
    this.#workspace(workspaceId);
    const existing = this.db.prepare('SELECT * FROM free_routing_policies WHERE workspace_id = ?').get(workspaceId);
    const values = {
      healthyThresholdBp: integerOr(overrides.healthyThresholdBp, existing?.healthy_threshold_bp, DEFAULT_POLICY.healthyThresholdBp),
      reserveThresholdBp: integerOr(overrides.reserveThresholdBp, existing?.reserve_threshold_bp, DEFAULT_POLICY.reserveThresholdBp),
      verifierReserveBp: integerOr(overrides.verifierReserveBp, existing?.verifier_reserve_bp, DEFAULT_POLICY.verifierReserveBp),
      openrouterDailyRequestLimit: integerOr(overrides.openrouterDailyRequestLimit, existing?.openrouter_daily_request_limit, DEFAULT_POLICY.openrouterDailyRequestLimit),
      unknownQuotaBehavior: overrides.unknownQuotaBehavior ?? existing?.unknown_quota_behavior ?? DEFAULT_POLICY.unknownQuotaBehavior
    };
    assertPolicy(values);
    const now = isoNow();
    if (!existing) {
      const id = crypto.randomUUID();
      this.db.prepare(`INSERT INTO free_routing_policies
        (id, workspace_id, enabled, zero_spend_lock, healthy_threshold_bp, reserve_threshold_bp, verifier_reserve_bp,
         openrouter_daily_request_limit, unknown_quota_behavior, created_at, updated_at)
        VALUES (?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, workspaceId, values.healthyThresholdBp, values.reserveThresholdBp, values.verifierReserveBp,
        values.openrouterDailyRequestLimit, values.unknownQuotaBehavior, now, now
      );
    } else {
      this.db.prepare(`UPDATE free_routing_policies SET enabled = 1, zero_spend_lock = 1,
        healthy_threshold_bp = ?, reserve_threshold_bp = ?, verifier_reserve_bp = ?, openrouter_daily_request_limit = ?,
        unknown_quota_behavior = ?, updated_at = ? WHERE workspace_id = ?`).run(
        values.healthyThresholdBp, values.reserveThresholdBp, values.verifierReserveBp,
        values.openrouterDailyRequestLimit, values.unknownQuotaBehavior, now, workspaceId
      );
    }
    return this.getPolicy({ workspaceId });
  }

  getPolicy({ workspaceId }) {
    this.#workspace(workspaceId);
    const row = this.db.prepare('SELECT * FROM free_routing_policies WHERE workspace_id = ?').get(workspaceId);
    if (!row) throw new Error(`free_routing_policy_not_found:${workspaceId}`);
    return row;
  }

  /**
   * Provision zero-incremental routes. Credentials are references only.
   * Every provider/model gets separate worker and verifier projections so a
   * quota bucket can be reserved for verification without remaining eligible
   * as an ordinary worker route.
   */
  provisionFreeRoutes({ workspaceId, antigravity = null, groq = null, openrouter = null }) {
    this.ensurePolicy({ workspaceId });

    if (antigravity?.endpointUrl && Array.isArray(antigravity.models) && antigravity.models.length) {
      const connection = this.#ensureConnection({
        workspaceId,
        providerKey: 'google-antigravity',
        connectionType: 'local_service',
        billingMode: 'zero_incremental',
        endpointUrl: antigravity.endpointUrl,
        locality: 'local',
        entitlement: { plan: 'free-baseline', overages: 'never', source: 'operator_google_account' }
      });
      const discoveredNames = new Set();
      for (const model of antigravity.models) {
        if (!model?.slug) continue;
        const tier = ['economy', 'balanced', 'frontier'].includes(model.tier) ? model.tier : 'balanced';
        const base = tier === 'frontier' ? 95 : tier === 'balanced' ? 84 : 70;
        const latency = tier === 'economy' ? 90 : tier === 'balanced' ? 75 : 60;
        const common = {
          free_first: true,
          source: FREE_SOURCE,
          provider_family: 'antigravity',
          model_tier: tier,
          display_label: model.label ?? model.slug,
          quota_bucket_key: antigravityBucket(model.slug, model.label),
          base_quality_score: base,
          discovered_active: true,
          max_output_tokens: 800
        };
        const workerName = `free-antigravity-${model.slug}`;
        const verifierName = `${workerName}-verifier`;
        discoveredNames.add(workerName);
        discoveredNames.add(verifierName);
        this.#ensureRoute({
          workspaceId, connection, routeName: workerName, modelKey: model.slug,
          runtimeKey: 'antigravity-cli-bridge', adapterKind: 'openai_responses',
          capabilities: ['reasoning', 'structured_output'], independenceGroup: 'antigravity-free-account',
          qualityScore: base, reliabilityScore: 75, latencyScore: latency,
          config: { ...common, route_role: 'worker' }
        });
        this.#ensureRoute({
          workspaceId, connection, routeName: verifierName, modelKey: model.slug,
          runtimeKey: 'antigravity-cli-bridge', adapterKind: 'openai_responses',
          capabilities: ['verification'], independenceGroup: 'antigravity-free-account',
          qualityScore: base, reliabilityScore: 75, latencyScore: latency,
          config: { ...common, route_role: 'verifier' }
        });
      }
      this.#disableStaleRoutes(workspaceId, connection.id, 'antigravity', discoveredNames);
    }

    if (groq?.credentialRef) {
      const connection = this.#ensureConnection({
        workspaceId,
        providerKey: 'groq',
        connectionType: 'api_key',
        billingMode: 'zero_incremental',
        credentialRef: groq.credentialRef,
        endpointUrl: groq.endpointUrl ?? 'https://api.groq.com/openai/v1/responses',
        locality: 'remote',
        entitlement: { plan: 'free', free_only_asserted: true, source: 'operator_account' }
      });
      const common = {
        free_first: true,
        source: FREE_SOURCE,
        provider_family: 'groq',
        model_tier: 'balanced',
        quota_bucket_key: 'groq:free-api',
        base_quality_score: 86,
        discovered_active: true,
        daily_request_limit: groq.dailyRequestLimit ?? 1000,
        max_output_tokens: 800
      };
      this.#ensureRoute({
        workspaceId, connection, routeName: 'free-groq-gpt-oss-120b', modelKey: groq.model ?? 'openai/gpt-oss-120b',
        runtimeKey: 'groq-responses-api', adapterKind: 'openai_responses', capabilities: ['reasoning', 'structured_output'],
        independenceGroup: 'groq-free-account', qualityScore: 86, reliabilityScore: 90, latencyScore: 95,
        config: { ...common, route_role: 'worker' }
      });
      this.#ensureRoute({
        workspaceId, connection, routeName: 'free-groq-gpt-oss-120b-verifier', modelKey: groq.model ?? 'openai/gpt-oss-120b',
        runtimeKey: 'groq-responses-api', adapterKind: 'openai_responses', capabilities: ['verification'],
        independenceGroup: 'groq-free-account', qualityScore: 86, reliabilityScore: 90, latencyScore: 95,
        config: { ...common, route_role: 'verifier' }
      });
    }

    if (openrouter?.credentialRef) {
      const connection = this.#ensureConnection({
        workspaceId,
        providerKey: 'openrouter',
        connectionType: 'api_key',
        billingMode: 'zero_incremental',
        credentialRef: openrouter.credentialRef,
        endpointUrl: openrouter.endpointUrl ?? 'https://openrouter.ai/api/v1/responses',
        locality: 'remote',
        entitlement: { plan: 'free-route-only', free_router_only: true, source: 'operator_account' }
      });
      const common = {
        free_first: true,
        source: FREE_SOURCE,
        provider_family: 'openrouter',
        model_tier: 'fallback',
        quota_bucket_key: 'openrouter:free-router',
        base_quality_score: 65,
        discovered_active: true,
        daily_request_limit: this.getPolicy({ workspaceId }).openrouter_daily_request_limit,
        max_output_tokens: 800
      };
      this.#ensureRoute({
        workspaceId, connection, routeName: 'free-openrouter-router', modelKey: 'openrouter/free',
        runtimeKey: 'openrouter-responses-api', adapterKind: 'openai_responses', capabilities: ['reasoning', 'structured_output'],
        independenceGroup: 'openrouter-free-account', qualityScore: 65, reliabilityScore: 55, latencyScore: 60,
        config: { ...common, route_role: 'worker' }
      });
      this.#ensureRoute({
        workspaceId, connection, routeName: 'free-openrouter-router-verifier', modelKey: 'openrouter/free',
        runtimeKey: 'openrouter-responses-api', adapterKind: 'openai_responses', capabilities: ['verification'],
        independenceGroup: 'openrouter-free-account', qualityScore: 65, reliabilityScore: 55, latencyScore: 60,
        config: { ...common, route_role: 'verifier' }
      });
    }
    return { policy: this.getPolicy({ workspaceId }), routes: this.listFreeRoutes({ workspaceId }) };
  }

  listFreeRoutes({ workspaceId }) {
    this.#workspace(workspaceId);
    return this.db.prepare(`SELECT r.*, c.provider_key, c.billing_mode, c.status AS connection_status, c.enabled AS connection_enabled
      FROM execution_routes r
      JOIN provider_connections c ON c.id = r.provider_connection_id AND c.workspace_id = r.workspace_id
      WHERE r.workspace_id = ? ORDER BY r.route_name`).all(workspaceId)
      .filter((row) => parseJson(row.config_json, {}).free_first === true);
  }

  recordAntigravityUsage({ workspaceId, usage }) {
    const routes = this.listFreeRoutes({ workspaceId }).filter((route) => parseJson(route.config_json, {}).provider_family === 'antigravity');
    const byBucket = new Map();
    for (const entry of usage?.quotas ?? []) {
      const label = String(entry.label ?? '');
      const bucket = /gemini/i.test(label) ? 'antigravity:gemini' : /claude|gpt/i.test(label) ? 'antigravity:third-party' : null;
      if (!bucket || !Number.isFinite(entry.remainingFraction)) continue;
      const current = byBucket.get(bucket);
      const remaining = Math.max(0, Math.min(1, Number(entry.remainingFraction)));
      if (current === undefined || remaining < current) byBucket.set(bucket, remaining);
    }
    const written = [];
    for (const route of routes) {
      const config = parseJson(route.config_json, {});
      const bucket = config.quota_bucket_key ?? 'antigravity:unknown';
      const remaining = byBucket.get(bucket);
      written.push(this.recordQuotaSnapshot({
        workspaceId,
        providerConnectionId: route.provider_connection_id,
        routeId: route.id,
        providerKey: route.provider_key,
        bucketKey: bucket,
        source: remaining === undefined ? 'unknown' : 'antigravity_cli',
        remainingFraction: remaining,
        detail: { raw: truncate(String(usage?.raw ?? ''), 4000) }
      }));
    }
    return written;
  }

  recordQuotaSnapshot({ workspaceId, providerConnectionId, routeId = null, providerKey, bucketKey, source, remainingFraction = null, remainingRequests = null, remainingTokens = null, resetAt = null, detail = {} }) {
    this.#workspace(workspaceId);
    const policy = this.ensurePolicy({ workspaceId });
    const bp = remainingFraction === null ? null : Math.round(clamp(Number(remainingFraction), 0, 1) * 10000);
    const status = quotaStatus(bp, policy);
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO quota_snapshots
      (id, workspace_id, provider_connection_id, route_id, provider_key, bucket_key, source, status,
       remaining_fraction_bp, remaining_requests, remaining_tokens, reset_at, detail_json, observed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, workspaceId, providerConnectionId, routeId, providerKey, bucketKey, source, status,
      bp, nullableInt(remainingRequests), nullableInt(remainingTokens), resetAt, JSON.stringify(detail ?? {}), isoNow()
    );
    return this.db.prepare('SELECT * FROM quota_snapshots WHERE id = ?').get(id);
  }

  syncUsageFromAttempts({ workspaceId }) {
    this.#workspace(workspaceId);
    const attempts = this.db.prepare(`SELECT a.*, r.provider_connection_id, r.config_json, c.provider_key
      FROM execution_attempts a
      JOIN execution_routes r ON r.id = a.route_id AND r.workspace_id = a.workspace_id
      JOIN provider_connections c ON c.id = r.provider_connection_id AND c.workspace_id = r.workspace_id
      LEFT JOIN provider_usage_accounted_attempts x ON x.attempt_id = a.id
      WHERE a.workspace_id = ? AND a.status = 'succeeded' AND x.attempt_id IS NULL
      ORDER BY a.started_at`).all(workspaceId)
      .filter((row) => parseJson(row.config_json, {}).free_first === true);
    const snapshots = [];
    for (const attempt of attempts) {
      const usage = parseJson(attempt.usage_json, {});
      const config = parseJson(attempt.config_json, {});
      this.#incrementCounter({ workspaceId, attempt, usage });
      const rate = usage.rate_limits && typeof usage.rate_limits === 'object' ? usage.rate_limits : null;
      if (rate) {
        const limit = toInt(rate.limit_requests);
        const remaining = toInt(rate.remaining_requests);
        if (limit !== null && limit > 0 && remaining !== null) {
          snapshots.push(this.recordQuotaSnapshot({
            workspaceId,
            providerConnectionId: attempt.provider_connection_id,
            routeId: attempt.route_id,
            providerKey: attempt.provider_key,
            bucketKey: config.quota_bucket_key ?? `${attempt.provider_key}:default`,
            source: 'provider_headers',
            remainingFraction: remaining / limit,
            remainingRequests: remaining,
            remainingTokens: toInt(rate.remaining_tokens),
            detail: { limitRequests: limit, limitTokens: toInt(rate.limit_tokens), resetRequests: rate.reset_requests ?? null, resetTokens: rate.reset_tokens ?? null }
          }));
        }
      }
      if (attempt.provider_key === 'openrouter') snapshots.push(this.#snapshotFromLocalCounter({ workspaceId, attempt, config, defaultLimit: this.getPolicy({ workspaceId }).openrouter_daily_request_limit }));
      if (attempt.provider_key === 'groq' && !rate) snapshots.push(this.#snapshotFromLocalCounter({ workspaceId, attempt, config, defaultLimit: 1000 }));
      this.db.prepare('INSERT INTO provider_usage_accounted_attempts (attempt_id, workspace_id, route_id, accounted_at) VALUES (?, ?, ?, ?)')
        .run(attempt.id, workspaceId, attempt.route_id, isoNow());
    }
    return { attemptsAccounted: attempts.length, snapshots };
  }

  /**
   * Apply quota reservation and task-aware preference by updating only derived
   * operational route scores/eligibility. Canonical Project meaning is untouched.
   */
  applyPolicy({ workspaceId, taskClass = 'standard' }) {
    const policy = this.ensurePolicy({ workspaceId });
    if (!['routine', 'standard', 'complex', 'critical'].includes(taskClass)) throw new TypeError('invalid_task_class');
    const routes = this.listFreeRoutes({ workspaceId });
    const states = [];
    for (const route of routes) {
      const config = parseJson(route.config_json, {});
      const latest = this.#latestQuota(workspaceId, route);
      const status = latest?.status ?? 'unknown';
      const base = Number.isInteger(config.base_quality_score) ? config.base_quality_score : route.quality_score;
      const tier = config.model_tier ?? 'balanced';
      const role = ['worker', 'verifier'].includes(config.route_role) ? config.route_role : 'both';
      const discoveredActive = config.discovered_active !== false;
      const freeConnection = route.billing_mode === 'zero_incremental';
      const connectionReady = route.connection_enabled === 1 && ['available', 'degraded'].includes(route.connection_status);
      const roleAllowed = routeAllowedForQuota({ status, role, unknownQuotaBehavior: policy.unknown_quota_behavior });
      const enabled = freeConnection && connectionReady && discoveredActive && roleAllowed;
      const quality = enabled
        ? clampInt(base + taskTierAdjustment(taskClass, tier, role) + quotaAdjustment(status, role), 0, 100)
        : 0;
      this.db.prepare('UPDATE execution_routes SET enabled = ?, quality_score = ?, updated_at = ? WHERE id = ? AND workspace_id = ?')
        .run(enabled ? 1 : 0, quality, isoNow(), route.id, workspaceId);
      states.push({
        routeId: route.id,
        routeName: route.route_name,
        providerKey: route.provider_key,
        role,
        tier,
        quotaStatus: status,
        allowed: enabled,
        enabled,
        qualityScore: quality,
        remainingFractionBp: latest?.remaining_fraction_bp ?? null
      });
    }
    return { policy, taskClass, routes: states };
  }

  async runFreeFirstWorkItem({ workspaceId, projectId, workItemId, taskClass = null, maxIterations = 2, maxMinutes = 10 }) {
    const workItem = this.db.prepare('SELECT * FROM work_items WHERE id = ? AND workspace_id = ? AND project_id = ?').get(workItemId, workspaceId, projectId);
    if (!workItem) throw new Error(`work_item_not_found_in_project:${workItemId}:${projectId}`);
    this.syncUsageFromAttempts({ workspaceId });
    const resolvedTaskClass = taskClass ?? taskClassFromRisk(workItem.risk_tier);
    const policyState = this.applyPolicy({ workspaceId, taskClass: resolvedTaskClass });
    if (!policyState.policy.zero_spend_lock) throw new Error('free_first_zero_spend_lock_required');
    this.#assertNoEligibleNonFreeRoute(workspaceId);

    const candidates = this.listFreeRoutes({ workspaceId }).map((route) => ({ route, config: parseJson(route.config_json, {}) }));
    const workerCandidates = candidates.filter(({ route, config }) =>
      route.enabled === 1 && route.billing_mode === 'zero_incremental' && ['available', 'degraded'].includes(route.connection_status) &&
      (config.route_role ?? 'both') !== 'verifier' && parseJson(route.capabilities_json, []).includes('reasoning')
    );
    if (!workerCandidates.length) throw new Error('free_first_worker_quota_unavailable');
    workerCandidates.sort((a, b) => b.route.quality_score - a.route.quality_score);
    const likelyWorker = workerCandidates[0].route;
    const verifierCandidates = candidates.filter(({ route, config }) =>
      route.enabled === 1 && route.billing_mode === 'zero_incremental' && ['available', 'degraded'].includes(route.connection_status) &&
      route.independence_group !== likelyWorker.independence_group && (config.route_role ?? 'both') !== 'worker' &&
      parseJson(route.capabilities_json, []).includes('verification')
    );
    if (!verifierCandidates.length) throw new Error('free_first_independent_verifier_unavailable');

    const result = await this.phase2.runWorkItem({
      workspaceId,
      projectId,
      workItemId,
      maxIterations,
      maxMinutes,
      maxIncrementalCostMinor: 0,
      spendEnvelopeId: null,
      spendPurpose: 'phase21_free_first_execution',
      requireIndependentVerifier: true
    });
    const usage = this.syncUsageFromAttempts({ workspaceId });
    return { mode: 'free_first', zeroSpendLock: true, taskClass: resolvedTaskClass, policyState, result, usage };
  }

  getState({ workspaceId }) {
    const policy = this.ensurePolicy({ workspaceId });
    const routes = this.listFreeRoutes({ workspaceId });
    return {
      policy,
      routes: routes.map((route) => ({ ...route, config: parseJson(route.config_json, {}), latestQuota: this.#latestQuota(workspaceId, route) })),
      counters: this.db.prepare('SELECT * FROM provider_usage_counters WHERE workspace_id = ? ORDER BY updated_at DESC').all(workspaceId)
    };
  }

  #ensureConnection({ workspaceId, providerKey, connectionType, billingMode, credentialRef = null, endpointUrl = null, locality, entitlement }) {
    let row = this.db.prepare('SELECT * FROM provider_connections WHERE workspace_id = ? AND provider_key = ? ORDER BY created_at LIMIT 1').get(workspaceId, providerKey);
    if (!row) return this.phase2.createProviderConnection({ workspaceId, providerKey, connectionType, billingMode, credentialRef, endpointUrl, locality, entitlement });
    this.db.prepare(`UPDATE provider_connections SET connection_type = ?, billing_mode = ?, credential_ref = ?, endpoint_url = ?, locality = ?,
      entitlement_json = ?, enabled = 1, status = CASE WHEN status = 'disabled' THEN 'degraded' ELSE status END, updated_at = ? WHERE id = ? AND workspace_id = ?`).run(
      connectionType, billingMode, credentialRef, endpointUrl, locality, JSON.stringify(entitlement ?? {}), isoNow(), row.id, workspaceId
    );
    if (connectionType === 'api_key') this.phase2.refreshProviderConnectionHealth({ workspaceId, connectionId: row.id });
    return this.db.prepare('SELECT * FROM provider_connections WHERE id = ? AND workspace_id = ?').get(row.id, workspaceId);
  }

  #ensureRoute({ workspaceId, connection, routeName, modelKey, runtimeKey, adapterKind, capabilities, independenceGroup, qualityScore, reliabilityScore, latencyScore, config }) {
    const existing = this.db.prepare('SELECT * FROM execution_routes WHERE workspace_id = ? AND route_name = ?').get(workspaceId, routeName);
    if (!existing) return this.phase2.createExecutionRoute({
      workspaceId,
      providerConnectionId: connection.id,
      routeName,
      modelKey,
      runtimeKey,
      adapterKind,
      capabilities,
      independenceGroup,
      qualityScore,
      reliabilityScore,
      latencyScore,
      estimatedCostMinor: 0,
      currency: 'USD',
      config,
      enabled: true
    });
    this.db.prepare(`UPDATE execution_routes SET provider_connection_id = ?, model_key = ?, runtime_key = ?, adapter_kind = ?, capabilities_json = ?,
      independence_group = ?, quality_score = ?, reliability_score = ?, latency_score = ?, estimated_cost_minor = 0, currency = 'USD',
      config_json = ?, enabled = 1, updated_at = ? WHERE id = ? AND workspace_id = ?`).run(
      connection.id, modelKey, runtimeKey, adapterKind, JSON.stringify(capabilities), independenceGroup, qualityScore, reliabilityScore, latencyScore,
      JSON.stringify(config), isoNow(), existing.id, workspaceId
    );
    return this.db.prepare('SELECT * FROM execution_routes WHERE id = ? AND workspace_id = ?').get(existing.id, workspaceId);
  }

  #disableStaleRoutes(workspaceId, connectionId, providerFamily, discoveredNames) {
    const rows = this.db.prepare('SELECT * FROM execution_routes WHERE workspace_id = ? AND provider_connection_id = ?').all(workspaceId, connectionId);
    for (const row of rows) {
      const config = parseJson(row.config_json, {});
      if (config.provider_family !== providerFamily || discoveredNames.has(row.route_name)) continue;
      config.discovered_active = false;
      this.db.prepare('UPDATE execution_routes SET enabled = 0, config_json = ?, updated_at = ? WHERE id = ? AND workspace_id = ?')
        .run(JSON.stringify(config), isoNow(), row.id, workspaceId);
    }
  }

  #latestQuota(workspaceId, route) {
    const config = parseJson(route.config_json, {});
    return this.db.prepare(`SELECT * FROM quota_snapshots
      WHERE workspace_id = ? AND (route_id = ? OR bucket_key = ?)
      ORDER BY observed_at DESC LIMIT 1`).get(workspaceId, route.id, config.quota_bucket_key ?? '');
  }

  #incrementCounter({ workspaceId, attempt, usage }) {
    const periodKey = String(attempt.started_at).slice(0, 10);
    const input = nonNegativeInt(usage.input_tokens ?? usage.prompt_tokens);
    const output = nonNegativeInt(usage.output_tokens ?? usage.completion_tokens);
    const total = nonNegativeInt(usage.total_tokens) || input + output;
    const existing = this.db.prepare("SELECT * FROM provider_usage_counters WHERE workspace_id = ? AND route_id = ? AND period_kind = 'day' AND period_key = ?").get(workspaceId, attempt.route_id, periodKey);
    if (!existing) {
      this.db.prepare(`INSERT INTO provider_usage_counters
        (id, workspace_id, provider_connection_id, route_id, period_kind, period_key, request_count, input_tokens, output_tokens, total_tokens, updated_at)
        VALUES (?, ?, ?, ?, 'day', ?, 1, ?, ?, ?, ?)`).run(crypto.randomUUID(), workspaceId, attempt.provider_connection_id, attempt.route_id, periodKey, input, output, total, isoNow());
    } else {
      this.db.prepare(`UPDATE provider_usage_counters SET request_count = request_count + 1, input_tokens = input_tokens + ?, output_tokens = output_tokens + ?,
        total_tokens = total_tokens + ?, updated_at = ? WHERE id = ?`).run(input, output, total, isoNow(), existing.id);
    }
  }

  #snapshotFromLocalCounter({ workspaceId, attempt, config, defaultLimit }) {
    const periodKey = String(attempt.started_at).slice(0, 10);
    const aggregate = this.db.prepare(`SELECT COALESCE(SUM(request_count), 0) AS requests
      FROM provider_usage_counters WHERE workspace_id = ? AND provider_connection_id = ? AND period_kind = 'day' AND period_key = ?`)
      .get(workspaceId, attempt.provider_connection_id, periodKey);
    const limit = Number.isInteger(config.daily_request_limit) ? config.daily_request_limit : defaultLimit;
    const remaining = Math.max(0, limit - Number(aggregate?.requests ?? 0));
    return this.recordQuotaSnapshot({
      workspaceId,
      providerConnectionId: attempt.provider_connection_id,
      routeId: attempt.route_id,
      providerKey: attempt.provider_key,
      bucketKey: config.quota_bucket_key ?? `${attempt.provider_key}:daily`,
      source: 'local_counter',
      remainingFraction: remaining / limit,
      remainingRequests: remaining,
      detail: { requestLimit: limit, periodKey, requestsAcrossConnection: Number(aggregate?.requests ?? 0) }
    });
  }

  #assertNoEligibleNonFreeRoute(workspaceId) {
    const rows = this.db.prepare(`SELECT r.*, c.billing_mode FROM execution_routes r JOIN provider_connections c
      ON c.id = r.provider_connection_id AND c.workspace_id = r.workspace_id WHERE r.workspace_id = ? AND r.enabled = 1`).all(workspaceId);
    for (const row of rows) {
      const config = parseJson(row.config_json, {});
      if (config.free_first === true) continue;
      if (['zero_incremental', 'included_subscription'].includes(row.billing_mode)) throw new Error(`free_first_non_policy_route_present:${row.id}`);
    }
  }

  #workspace(workspaceId) {
    const row = this.db.prepare('SELECT id FROM workspaces WHERE id = ?').get(workspaceId);
    if (!row) throw new Error(`workspace_not_found:${workspaceId}`);
    return row;
  }
}

function quotaStatus(bp, policy) {
  if (bp === null) return 'unknown';
  if (bp >= policy.healthy_threshold_bp) return 'healthy';
  if (bp >= policy.reserve_threshold_bp) return 'conserve';
  if (bp >= policy.verifier_reserve_bp) return 'reserved';
  return 'exhausted';
}

function routeAllowedForQuota({ status, role, unknownQuotaBehavior }) {
  if (status === 'exhausted') return false;
  if (status === 'reserved') return role === 'verifier';
  if (status === 'unknown') {
    if (unknownQuotaBehavior === 'block') return false;
    if (unknownQuotaBehavior === 'reserve_only') return role === 'verifier';
    return true;
  }
  return true;
}

function taskClassFromRisk(riskTier) {
  if (riskTier === 'R3') return 'critical';
  if (riskTier === 'R2') return 'complex';
  if (riskTier === 'R0') return 'routine';
  return 'standard';
}

function taskTierAdjustment(taskClass, tier, role) {
  if (role === 'verifier') return tier === 'frontier' ? 10 : tier === 'balanced' ? 8 : tier === 'economy' ? 2 : 0;
  const table = {
    routine: { economy: 20, balanced: 0, frontier: -25, fallback: -15 },
    standard: { economy: 10, balanced: 12, frontier: -5, fallback: -15 },
    complex: { economy: -15, balanced: 12, frontier: 22, fallback: -10 },
    critical: { economy: -25, balanced: 10, frontier: 30, fallback: -10 }
  };
  return table[taskClass]?.[tier] ?? 0;
}

function quotaAdjustment(status, role) {
  if (status === 'healthy') return 10;
  if (status === 'conserve') return -5;
  if (status === 'reserved') return role === 'verifier' ? 5 : -100;
  if (status === 'exhausted') return -100;
  return -20;
}

function antigravityBucket(slug, label = '') {
  return /gemini/i.test(`${slug} ${label}`) ? 'antigravity:gemini' : 'antigravity:third-party';
}

function assertPolicy(values) {
  for (const key of ['healthyThresholdBp', 'reserveThresholdBp', 'verifierReserveBp']) {
    if (!Number.isInteger(values[key]) || values[key] < 0 || values[key] > 10000) throw new TypeError(`${key}_invalid`);
  }
  if (!(values.verifierReserveBp <= values.reserveThresholdBp && values.reserveThresholdBp < values.healthyThresholdBp)) throw new TypeError('quota_threshold_order_invalid');
  if (!Number.isInteger(values.openrouterDailyRequestLimit) || values.openrouterDailyRequestLimit < 1) throw new TypeError('openrouterDailyRequestLimit_invalid');
  if (!['allow_fallback', 'reserve_only', 'block'].includes(values.unknownQuotaBehavior)) throw new TypeError('unknownQuotaBehavior_invalid');
}

function integerOr(...values) { for (const value of values) if (Number.isInteger(value)) return value; return 0; }
function nullableInt(value) { return Number.isInteger(value) && value >= 0 ? value : null; }
function nonNegativeInt(value) { const number = Number(value); return Number.isInteger(number) && number >= 0 ? number : 0; }
function toInt(value) { const number = Number(value); return Number.isInteger(number) && number >= 0 ? number : null; }
function parseJson(text, fallback) { try { return text ? JSON.parse(text) : fallback; } catch { return fallback; } }
function isoNow() { return new Date().toISOString(); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function clampInt(value, min, max) { return Math.round(clamp(Number(value), min, max)); }
function truncate(value, max) { const text = String(value ?? ''); return text.length <= max ? text : `${text.slice(0, max - 1)}…`; }
