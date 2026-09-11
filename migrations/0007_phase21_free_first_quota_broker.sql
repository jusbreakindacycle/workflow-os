INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase21_free_first', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

CREATE TABLE free_routing_policies (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  zero_spend_lock INTEGER NOT NULL DEFAULT 1 CHECK (zero_spend_lock IN (0,1)),
  healthy_threshold_bp INTEGER NOT NULL DEFAULT 4000 CHECK (healthy_threshold_bp BETWEEN 1 AND 10000),
  reserve_threshold_bp INTEGER NOT NULL DEFAULT 1500 CHECK (reserve_threshold_bp BETWEEN 0 AND 9999),
  verifier_reserve_bp INTEGER NOT NULL DEFAULT 1000 CHECK (verifier_reserve_bp BETWEEN 0 AND 9999),
  openrouter_daily_request_limit INTEGER NOT NULL DEFAULT 50 CHECK (openrouter_daily_request_limit >= 1),
  unknown_quota_behavior TEXT NOT NULL DEFAULT 'allow_fallback' CHECK (unknown_quota_behavior IN ('allow_fallback','reserve_only','block')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id),
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CHECK (verifier_reserve_bp <= reserve_threshold_bp),
  CHECK (reserve_threshold_bp < healthy_threshold_bp)
) STRICT;

CREATE TABLE quota_snapshots (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_connection_id TEXT NOT NULL,
  route_id TEXT,
  provider_key TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('antigravity_cli','provider_headers','local_counter','manual','unknown')),
  status TEXT NOT NULL CHECK (status IN ('healthy','conserve','reserved','exhausted','unknown')),
  remaining_fraction_bp INTEGER CHECK (remaining_fraction_bp IS NULL OR remaining_fraction_bp BETWEEN 0 AND 10000),
  remaining_requests INTEGER CHECK (remaining_requests IS NULL OR remaining_requests >= 0),
  remaining_tokens INTEGER CHECK (remaining_tokens IS NULL OR remaining_tokens >= 0),
  reset_at TEXT,
  detail_json TEXT NOT NULL DEFAULT '{}',
  observed_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_connection_id, workspace_id) REFERENCES provider_connections(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE provider_usage_counters (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_connection_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  period_kind TEXT NOT NULL CHECK (period_kind IN ('day','week','session')),
  period_key TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id, route_id, period_kind, period_key),
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_connection_id, workspace_id) REFERENCES provider_connections(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE provider_usage_accounted_attempts (
  attempt_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  accounted_at TEXT NOT NULL,
  FOREIGN KEY (attempt_id, workspace_id) REFERENCES execution_attempts(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE INDEX idx_quota_snapshots_route_observed
  ON quota_snapshots(workspace_id, route_id, observed_at DESC);
CREATE INDEX idx_quota_snapshots_bucket_observed
  ON quota_snapshots(workspace_id, provider_key, bucket_key, observed_at DESC);
CREATE INDEX idx_provider_usage_route_period
  ON provider_usage_counters(workspace_id, route_id, period_kind, period_key);
