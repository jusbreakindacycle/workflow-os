INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase2_gate', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

ALTER TABLE cost_records ADD COLUMN basis TEXT NOT NULL DEFAULT 'actual'
  CHECK (basis IN ('actual','conservative_estimate','reconciled'));

CREATE TABLE capability_definitions (
  id TEXT PRIMARY KEY,
  capability_key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  level_scale_json TEXT NOT NULL DEFAULT '[0,1,2,3]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE provider_connections (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_key TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('api_key','oauth','subscription_cli','local_service','self_hosted','other')),
  billing_mode TEXT NOT NULL CHECK (billing_mode IN ('zero_incremental','included_subscription','metered','unknown')),
  status TEXT NOT NULL DEFAULT 'unavailable' CHECK (status IN ('available','degraded','unavailable','disabled')),
  credential_ref TEXT,
  endpoint_url TEXT,
  locality TEXT NOT NULL DEFAULT 'remote' CHECK (locality IN ('local','remote','hybrid')),
  allowed_data_classes_json TEXT NOT NULL DEFAULT '["Public","Internal"]',
  entitlement_json TEXT NOT NULL DEFAULT '{}',
  health_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  last_health_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE execution_routes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_connection_id TEXT NOT NULL,
  route_name TEXT NOT NULL,
  model_key TEXT,
  runtime_key TEXT NOT NULL,
  adapter_kind TEXT NOT NULL CHECK (adapter_kind IN ('fixture','openai_responses','anthropic_messages')),
  capabilities_json TEXT NOT NULL DEFAULT '[]',
  allowed_data_classes_json TEXT NOT NULL DEFAULT '["Public","Internal"]',
  independence_group TEXT NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 50 CHECK (quality_score BETWEEN 0 AND 100),
  reliability_score INTEGER NOT NULL DEFAULT 50 CHECK (reliability_score BETWEEN 0 AND 100),
  latency_score INTEGER NOT NULL DEFAULT 50 CHECK (latency_score BETWEEN 0 AND 100),
  estimated_cost_minor INTEGER CHECK (estimated_cost_minor IS NULL OR estimated_cost_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  config_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  UNIQUE (workspace_id, route_name),
  FOREIGN KEY (provider_connection_id, workspace_id) REFERENCES provider_connections(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE provider_health_checks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider_connection_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available','degraded','unavailable','disabled')),
  detail_json TEXT NOT NULL DEFAULT '{}',
  checked_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (provider_connection_id, workspace_id) REFERENCES provider_connections(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE route_decisions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  assignment_id TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('worker','verifier')),
  route_id TEXT NOT NULL,
  candidate_snapshot_json TEXT NOT NULL DEFAULT '[]',
  rationale_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE execution_attempts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  route_decision_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('worker','verifier')),
  iteration INTEGER NOT NULL CHECK (iteration >= 1),
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','failed','timed_out','canceled')),
  input_sha256 TEXT NOT NULL,
  output_sha256 TEXT,
  output_text TEXT,
  error_code TEXT,
  usage_json TEXT NOT NULL DEFAULT '{}',
  external_ref TEXT,
  estimated_cost_minor INTEGER CHECK (estimated_cost_minor IS NULL OR estimated_cost_minor >= 0),
  actual_cost_minor INTEGER CHECK (actual_cost_minor IS NULL OR actual_cost_minor >= 0),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (assignment_id, project_id, workspace_id) REFERENCES assignments(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (route_decision_id, project_id, workspace_id) REFERENCES route_decisions(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE skill_definitions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  skill_key TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','superseded')),
  description TEXT NOT NULL,
  required_capabilities_json TEXT NOT NULL DEFAULT '[]',
  instructions_text TEXT NOT NULL,
  risk_tier TEXT NOT NULL DEFAULT 'R0' CHECK (risk_tier IN ('R0','R1','R2','R3')),
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id, skill_key, version),
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE project_bootstraps (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_pack_version_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current','superseded','stale')),
  compiler_version TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (project_id, version),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (project_pack_version_id, project_id, workspace_id) REFERENCES project_pack_versions(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE UNIQUE INDEX idx_project_bootstrap_current
  ON project_bootstraps(project_id)
  WHERE status = 'current';

CREATE TABLE instruction_bundles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  project_pack_version_id TEXT NOT NULL,
  context_slice_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  compiler_version TEXT NOT NULL,
  skill_refs_json TEXT NOT NULL DEFAULT '[]',
  instructions_text TEXT NOT NULL,
  projections_json TEXT NOT NULL DEFAULT '{}',
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (project_pack_version_id, project_id, workspace_id) REFERENCES project_pack_versions(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (context_slice_id, project_id, workspace_id) REFERENCES context_slices(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE loop_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  worker_route_id TEXT NOT NULL,
  verifier_route_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('running','passed','failed','blocked','exhausted','canceled')),
  max_iterations INTEGER NOT NULL CHECK (max_iterations BETWEEN 1 AND 20),
  current_iteration INTEGER NOT NULL DEFAULT 0 CHECK (current_iteration >= 0),
  max_minutes INTEGER NOT NULL CHECK (max_minutes BETWEEN 1 AND 1440),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  last_feedback TEXT,
  stop_reason TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (assignment_id, project_id, workspace_id) REFERENCES assignments(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (worker_route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (verifier_route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE loop_iterations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  loop_run_id TEXT NOT NULL,
  iteration INTEGER NOT NULL CHECK (iteration >= 1),
  worker_attempt_id TEXT NOT NULL,
  verifier_attempt_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('pass','retry','error','blocked')),
  feedback TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (loop_run_id, iteration),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (loop_run_id, project_id, workspace_id) REFERENCES loop_runs(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (worker_attempt_id, project_id, workspace_id) REFERENCES execution_attempts(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (verifier_attempt_id, project_id, workspace_id) REFERENCES execution_attempts(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE phase2_certifications (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  route_id TEXT,
  certification_type TEXT NOT NULL CHECK (certification_type IN ('first_real_execution','independent_verifier','portability_drill')),
  status TEXT NOT NULL CHECK (status IN ('pending','passed','failed')),
  evidence_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id, workspace_id) REFERENCES execution_routes(id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE INDEX idx_provider_connections_workspace ON provider_connections(workspace_id, status);
CREATE INDEX idx_execution_routes_workspace ON execution_routes(workspace_id, enabled);
CREATE INDEX idx_route_decisions_work_item ON route_decisions(work_item_id, purpose, created_at);
CREATE INDEX idx_execution_attempts_assignment ON execution_attempts(assignment_id, iteration, purpose);
CREATE INDEX idx_skills_workspace ON skill_definitions(workspace_id, skill_key, status);
CREATE INDEX idx_loop_runs_work_item ON loop_runs(work_item_id, status);
