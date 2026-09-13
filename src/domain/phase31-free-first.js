import crypto from 'node:crypto';
import { FreeFirstBroker } from './free-first-broker.js';

export class Phase31FreeFirst {
  constructor(db) { this.db = db; this.broker = new FreeFirstBroker(db); }

  select({ workspaceId }) {
    this.broker.ensurePolicy({ workspaceId });
    this.broker.syncUsageFromAttempts({ workspaceId });
    this.broker.applyPolicy({ workspaceId, taskClass: 'standard' });
    const routes = this.broker.listFreeRoutes({ workspaceId }).filter((route) => {
      const cfg = json(route.config_json, {});
      const caps = json(route.capabilities_json, []);
      const classes = json(route.allowed_data_classes_json, []);
      return route.enabled === 1 && route.billing_mode === 'zero_incremental' && ['available', 'degraded'].includes(route.connection_status)
        && (cfg.route_role ?? 'both') !== 'verifier' && caps.includes('reasoning') && caps.includes('structured_output') && classes.includes('Internal');
    }).sort((a, b) => (b.quality_score - a.quality_score) || a.route_name.localeCompare(b.route_name));
    if (!routes.length) throw new Error('phase31_free_first_reasoning_route_unavailable');
    const route = routes[0];
    const connection = this.db.prepare('SELECT * FROM provider_connections WHERE id = ? AND workspace_id = ?').get(route.provider_connection_id, workspaceId);
    if (!connection) throw new Error('phase31_provider_connection_missing');
    return { route, connection };
  }

  account({ workspaceId, route, result }) {
    const cfg = json(route.config_json, {});
    if (cfg.free_first !== true) return;
    const now = new Date().toISOString();
    const day = now.slice(0, 10);
    const usage = result.usage ?? {};
    const input = integer(usage.input_tokens ?? usage.prompt_tokens);
    const output = integer(usage.output_tokens ?? usage.completion_tokens);
    const total = integer(usage.total_tokens) || input + output;
    const row = this.db.prepare("SELECT * FROM provider_usage_counters WHERE workspace_id = ? AND route_id = ? AND period_kind = 'day' AND period_key = ?").get(workspaceId, route.id, day);
    if (!row) this.db.prepare(`INSERT INTO provider_usage_counters (id, workspace_id, provider_connection_id, route_id, period_kind, period_key, request_count, input_tokens, output_tokens, total_tokens, updated_at) VALUES (?, ?, ?, ?, 'day', ?, 1, ?, ?, ?, ?)`)
      .run(crypto.randomUUID(), workspaceId, route.provider_connection_id, route.id, day, input, output, total, now);
    else this.db.prepare('UPDATE provider_usage_counters SET request_count=request_count+1,input_tokens=input_tokens+?,output_tokens=output_tokens+?,total_tokens=total_tokens+?,updated_at=? WHERE id=?')
      .run(input, output, total, now, row.id);

    const rate = usage.rate_limits && typeof usage.rate_limits === 'object' ? usage.rate_limits : null;
    const limit = rate ? asInt(rate.limit_requests) : (Number.isInteger(cfg.daily_request_limit) ? cfg.daily_request_limit : null);
    if (!limit || limit <= 0) return;
    const headerRemaining = rate ? asInt(rate.remaining_requests) : null;
    const count = Number(this.db.prepare("SELECT COALESCE(SUM(request_count),0) AS n FROM provider_usage_counters WHERE workspace_id=? AND provider_connection_id=? AND period_kind='day' AND period_key=?").get(workspaceId, route.provider_connection_id, day).n);
    const remaining = headerRemaining ?? Math.max(0, limit - count);
    this.broker.recordQuotaSnapshot({ workspaceId, providerConnectionId: route.provider_connection_id, routeId: route.id, providerKey: route.provider_key, bucketKey: cfg.quota_bucket_key ?? `${route.provider_key}:daily`, source: headerRemaining === null ? 'local_counter' : 'provider_headers', remainingFraction: remaining / limit, remainingRequests: remaining, detail: { requestLimit: limit, phase: '3.1' } });
  }
}

function json(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function integer(value) { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : 0; }
function asInt(value) { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : null; }
