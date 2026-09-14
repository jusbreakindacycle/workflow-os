INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase40_external_action_contract', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

CREATE TABLE external_action_plans (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  project_version INTEGER NOT NULL CHECK (project_version >= 1),
  work_item_version INTEGER CHECK (work_item_version IS NULL OR work_item_version >= 1),
  adapter_class TEXT NOT NULL,
  action_kind TEXT NOT NULL,
  target_json TEXT NOT NULL,
  input_sha256 TEXT NOT NULL,
  plan_sha256 TEXT NOT NULL,
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('R0','R1','R2','R3')),
  action_class TEXT NOT NULL CHECK (action_class IN ('read_only','durable_external_mutation','production_or_destructive')),
  required_authority TEXT NOT NULL CHECK (required_authority IN ('none','exact_approval','approval_and_spend')),
  approval_id TEXT,
  spend_envelope_id TEXT,
  idempotency_key TEXT NOT NULL,
  verification_json TEXT NOT NULL DEFAULT '{}',
  recovery_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','authorized','executing','reconciling','verified','complete','rejected','blocked','failed','uncertain','superseded')),
  expires_at TEXT,
  authorized_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  UNIQUE (workspace_id, idempotency_key),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (approval_id, project_id, workspace_id) REFERENCES approvals(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (spend_envelope_id, project_id, workspace_id) REFERENCES spend_envelopes(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;
