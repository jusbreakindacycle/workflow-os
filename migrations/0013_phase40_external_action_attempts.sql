CREATE TABLE external_action_attempts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
  adapter_provider TEXT NOT NULL,
  adapter_version TEXT NOT NULL,
  operation_kind TEXT NOT NULL,
  request_sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','succeeded','failed','uncertain')),
  normalized_result TEXT,
  provider_operation_ref TEXT,
  provider_resource_ref TEXT,
  error_class TEXT,
  result_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL,
  finished_at TEXT,
  UNIQUE (plan_id, attempt_number),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (plan_id, project_id, workspace_id) REFERENCES external_action_plans(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE INDEX idx_external_action_attempts_plan ON external_action_attempts(plan_id, attempt_number);
