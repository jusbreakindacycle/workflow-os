CREATE TABLE external_action_plan_details (
  plan_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  assignment_id TEXT,
  preconditions_json TEXT NOT NULL DEFAULT '{}',
  input_refs_json TEXT NOT NULL DEFAULT '[]',
  supersedes_plan_id TEXT,
  UNIQUE (plan_id, project_id, workspace_id),
  FOREIGN KEY (plan_id, project_id, workspace_id) REFERENCES external_action_plans(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;
