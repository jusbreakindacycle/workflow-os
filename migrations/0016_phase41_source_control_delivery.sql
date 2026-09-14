INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase41_governed_source_control', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

CREATE TABLE source_control_delivery_plans (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  external_action_plan_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  repository_ref TEXT NOT NULL,
  base_ref TEXT NOT NULL,
  base_commit TEXT NOT NULL,
  delivery_branch TEXT NOT NULL,
  execution_workspace_id TEXT NOT NULL,
  artifact_manifest_json TEXT NOT NULL,
  artifact_manifest_sha256 TEXT NOT NULL,
  projected_tree_sha256 TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  pr_title TEXT NOT NULL,
  pr_body TEXT NOT NULL,
  allowed_operations_json TEXT NOT NULL,
  checks_policy_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed','authorized','executing','reconciling','verified','complete','blocked','failed','uncertain','rejected','superseded')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
  FOREIGN KEY (external_action_plan_id) REFERENCES external_action_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (execution_workspace_id) REFERENCES execution_workspaces(id) ON DELETE RESTRICT
) STRICT;

CREATE INDEX idx_source_control_delivery_project ON source_control_delivery_plans(workspace_id, project_id, created_at);
CREATE UNIQUE INDEX idx_source_control_delivery_active_branch
  ON source_control_delivery_plans(workspace_id, provider, repository_ref, delivery_branch)
  WHERE status NOT IN ('complete','rejected','superseded','failed');
