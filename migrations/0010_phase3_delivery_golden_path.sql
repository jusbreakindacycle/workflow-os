INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase3_delivery_golden_path', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

CREATE TABLE phase3_work_specs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_item_id TEXT NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  brief_version INTEGER NOT NULL CHECK (brief_version > 0),
  strategy TEXT NOT NULL CHECK (strategy IN ('process_change','adopt_existing','configure','integrate','automate','custom_build','hybrid','research_pilot','defer')),
  logical_role TEXT NOT NULL,
  capability_requirements_json TEXT NOT NULL DEFAULT '[]',
  evidence_required_json TEXT NOT NULL DEFAULT '[]',
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('R0','R1','R2','R3')),
  action_class TEXT NOT NULL,
  authority_requirement TEXT NOT NULL,
  verification_level TEXT NOT NULL CHECK (verification_level IN ('L0','L1','L2','L3','L4','L5')),
  independent_verification_required INTEGER NOT NULL DEFAULT 0 CHECK (independent_verification_required IN (0,1)),
  mutable_resources_json TEXT NOT NULL DEFAULT '[]',
  stop_conditions_json TEXT NOT NULL DEFAULT '[]',
  planner_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (workspace_id, project_id, work_item_id)
);

CREATE TABLE phase3_workforce_activations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_item_id TEXT NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  logical_role TEXT NOT NULL,
  capability TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'required' CHECK (status IN ('required','active','satisfied','superseded')),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (workspace_id, project_id, work_item_id, capability)
);

CREATE TABLE execution_workspaces (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  root_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','active','cleaned','failed')),
  policy_json TEXT NOT NULL,
  manifest_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id, project_id)
);

CREATE TABLE execution_processes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  execution_workspace_id TEXT NOT NULL REFERENCES execution_workspaces(id) ON DELETE CASCADE,
  work_item_id TEXT REFERENCES work_items(id) ON DELETE SET NULL,
  command_class TEXT NOT NULL,
  cwd_relative TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running','exited','stopped','failed')),
  pid INTEGER,
  exit_code INTEGER,
  stdout_text TEXT,
  stderr_text TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE phase3_repair_attempts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  work_item_id TEXT REFERENCES work_items(id) ON DELETE SET NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  failure_class TEXT NOT NULL,
  action_summary TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned','applied','failed','escalated')),
  created_at TEXT NOT NULL,
  finished_at TEXT,
  UNIQUE (workspace_id, project_id, work_item_id, attempt_number)
);

CREATE TABLE phase3_delivery_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  brief_version INTEGER NOT NULL CHECK (brief_version > 0),
  execution_workspace_id TEXT REFERENCES execution_workspaces(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('candidate','verified','delivered','failed')),
  evidence_bundle_json TEXT NOT NULL DEFAULT '{}',
  limitations_json TEXT NOT NULL DEFAULT '[]',
  next_action TEXT,
  created_at TEXT NOT NULL,
  delivered_at TEXT
);

CREATE TRIGGER trg_phase3_work_spec_scope_guard
BEFORE INSERT ON phase3_work_specs
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM work_items wi
  WHERE wi.id = NEW.work_item_id
    AND wi.workspace_id = NEW.workspace_id
    AND wi.project_id = NEW.project_id
)
BEGIN
  SELECT RAISE(ABORT, 'phase3_work_spec_scope_invalid');
END;

CREATE TRIGGER trg_phase3_activation_scope_guard
BEFORE INSERT ON phase3_workforce_activations
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM work_items wi
  WHERE wi.id = NEW.work_item_id
    AND wi.workspace_id = NEW.workspace_id
    AND wi.project_id = NEW.project_id
)
BEGIN
  SELECT RAISE(ABORT, 'phase3_activation_scope_invalid');
END;
