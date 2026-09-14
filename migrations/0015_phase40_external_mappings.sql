CREATE TABLE external_action_mappings (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  adapter_class TEXT NOT NULL,
  provider TEXT NOT NULL,
  resource_kind TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_ref TEXT,
  observed_hash TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  UNIQUE (workspace_id, adapter_class, provider, resource_kind, resource_id),
  FOREIGN KEY (plan_id, project_id, workspace_id) REFERENCES external_action_plans(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;
