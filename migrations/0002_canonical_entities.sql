UPDATE app_metadata SET value = '2', updated_at = CURRENT_TIMESTAMP WHERE key = 'foundation_gate';

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE engagements (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  client_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','proposed_to_client','client_accepted','active','paused','complete','canceled')),
  scope_summary TEXT,
  price_summary TEXT,
  deadline_at TEXT,
  maintenance_summary TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  FOREIGN KEY (client_id, workspace_id) REFERENCES clients(id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  engagement_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('client_delivery','internal_product','experiment')),
  title TEXT NOT NULL,
  lifecycle_phase TEXT NOT NULL DEFAULT 'intake' CHECK (lifecycle_phase IN ('intake','research','definition','architecture','planning','build','verification','review','deployment','production','maintenance','closed')),
  operational_status TEXT NOT NULL DEFAULT 'draft' CHECK (operational_status IN ('draft','ready','running','waiting_external','needs_attention','blocked','failed','complete','canceled')),
  health TEXT NOT NULL DEFAULT 'unknown' CHECK (health IN ('healthy','at_risk','blocked','unknown')),
  current_brief_version INTEGER,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE RESTRICT,
  FOREIGN KEY (engagement_id, workspace_id) REFERENCES engagements(id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE project_briefs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1),
  status TEXT NOT NULL CHECK (status IN ('draft','accepted','superseded')),
  problem TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  requested_solution TEXT,
  delivery_strategy TEXT NOT NULL CHECK (delivery_strategy IN ('process_change','adopt_existing','configure','integrate','automate','custom_build','hybrid','research_pilot','defer')),
  working_scope_json TEXT NOT NULL,
  accepted_at TEXT,
  created_at TEXT NOT NULL,
  CHECK (status <> 'accepted' OR accepted_at IS NOT NULL),
  UNIQUE (project_id, version),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE project_revisions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL CHECK (revision_number >= 1),
  from_brief_id TEXT,
  to_brief_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  impact_status TEXT NOT NULL DEFAULT 'pending' CHECK (impact_status IN ('pending','assessed','applied')),
  impact_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (project_id, revision_number),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (from_brief_id, project_id, workspace_id) REFERENCES project_briefs(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (to_brief_id, project_id, workspace_id) REFERENCES project_briefs(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE work_items (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  class TEXT NOT NULL,
  title TEXT NOT NULL,
  outcome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','running','waiting_external','needs_attention','blocked','failed','complete','canceled','stale','superseded')),
  priority INTEGER NOT NULL DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  acceptance_json TEXT NOT NULL DEFAULT '{}',
  risk_tier TEXT NOT NULL DEFAULT 'R0' CHECK (risk_tier IN ('R0','R1','R2','R3')),
  stale_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE work_dependencies (
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  depends_on_work_item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (work_item_id, depends_on_work_item_id),
  CHECK (work_item_id <> depends_on_work_item_id),
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE work_item_proposals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  source_work_item_id TEXT,
  title TEXT NOT NULL,
  outcome TEXT NOT NULL,
  proposed_class TEXT NOT NULL,
  impact_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','superseded')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (source_work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','superseded','canceled')),
  recommendation_json TEXT,
  resolution_json TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  subject_version INTEGER NOT NULL CHECK (subject_version >= 1),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','expired','superseded')),
  authority_reason TEXT NOT NULL,
  bounds_json TEXT NOT NULL DEFAULT '{}',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  expires_at TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE artifact_references (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  uri TEXT NOT NULL,
  sha256 TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'internal' CHECK (sensitivity IN ('public','internal','confidential','restricted')),
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE evidence_references (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  artifact_id TEXT,
  level TEXT NOT NULL CHECK (level IN ('L0','L1','L2','L3','L4','L5')),
  evidence_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (artifact_id, project_id, workspace_id) REFERENCES artifact_references(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE project_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_version INTEGER,
  reason TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  sensitivity TEXT NOT NULL DEFAULT 'internal' CHECK (sensitivity IN ('public','internal','confidential','restricted')),
  idempotency_key TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (workspace_id, idempotency_key),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE project_pack_versions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  brief_version INTEGER NOT NULL CHECK (brief_version >= 1),
  version INTEGER NOT NULL CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current','stale','superseded')),
  content_sha256 TEXT NOT NULL,
  provenance_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (project_id, version),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id, brief_version) REFERENCES project_briefs(project_id, version) ON DELETE RESTRICT
) STRICT;

CREATE TABLE context_slices (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_pack_version_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  work_item_version INTEGER NOT NULL CHECK (work_item_version >= 1),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  purpose TEXT NOT NULL,
  context_json TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (project_pack_version_id, project_id, workspace_id) REFERENCES project_pack_versions(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE spend_envelopes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  approval_id TEXT,
  purpose TEXT NOT NULL,
  currency TEXT NOT NULL,
  max_amount_minor INTEGER NOT NULL CHECK (max_amount_minor >= 0),
  spent_amount_minor INTEGER NOT NULL DEFAULT 0 CHECK (spent_amount_minor >= 0),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','exhausted','expired','superseded','canceled')),
  created_at TEXT NOT NULL,
  expires_at TEXT,
  CHECK (spent_amount_minor <= max_amount_minor),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (approval_id, project_id, workspace_id) REFERENCES approvals(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE cost_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  spend_envelope_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL,
  external_ref TEXT,
  incurred_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (spend_envelope_id, project_id, workspace_id) REFERENCES spend_envelopes(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  work_item_version INTEGER NOT NULL CHECK (work_item_version >= 1),
  context_slice_id TEXT,
  assignee_kind TEXT NOT NULL CHECK (assignee_kind IN ('human','internal_ai','workflow','external_runtime','tool')),
  assignee_ref TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','running','execution_finished','blocked','failed','canceled','superseded')),
  budget_json TEXT NOT NULL DEFAULT '{}',
  side_effect_policy_json TEXT NOT NULL DEFAULT '{}',
  stop_conditions_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (context_slice_id, project_id, workspace_id) REFERENCES context_slices(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TRIGGER trg_context_slice_work_item_version
BEFORE INSERT ON context_slices
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM work_items
  WHERE id = NEW.work_item_id
    AND project_id = NEW.project_id
    AND workspace_id = NEW.workspace_id
    AND version = NEW.work_item_version
)
BEGIN
  SELECT RAISE(ABORT, 'context_slice_work_item_version_mismatch');
END;

CREATE TRIGGER trg_assignment_work_item_version
BEFORE INSERT ON assignments
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM work_items
  WHERE id = NEW.work_item_id
    AND project_id = NEW.project_id
    AND workspace_id = NEW.workspace_id
    AND version = NEW.work_item_version
)
BEGIN
  SELECT RAISE(ABORT, 'assignment_work_item_version_mismatch');
END;

CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_engagements_workspace ON engagements(workspace_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_project_briefs_project ON project_briefs(project_id, version);
CREATE INDEX idx_work_items_project_status ON work_items(project_id, status);
CREATE INDEX idx_events_project_time ON project_events(project_id, created_at);
CREATE INDEX idx_assignments_work_item ON assignments(work_item_id, status);
