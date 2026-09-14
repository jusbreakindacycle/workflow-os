CREATE TABLE action_reconciliation_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('confirmed','not_applied','drifted','uncertain')),
  state_hash TEXT NOT NULL,
  evidence_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (plan_id, project_id, workspace_id) REFERENCES external_action_plans(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (attempt_id, project_id, workspace_id) REFERENCES external_action_attempts(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;
