UPDATE app_metadata SET value = '10', updated_at = CURRENT_TIMESTAMP WHERE key = 'foundation_gate';

ALTER TABLE project_pack_versions ADD COLUMN content_json TEXT;
ALTER TABLE assignments ADD COLUMN project_pack_version_id TEXT;
ALTER TABLE assignments ADD COLUMN role TEXT;
ALTER TABLE assignments ADD COLUMN objective TEXT;
ALTER TABLE assignments ADD COLUMN evidence_required_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE assignments ADD COLUMN escalation_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE assignments ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified','passed','failed'));

CREATE UNIQUE INDEX idx_project_pack_current
  ON project_pack_versions(project_id)
  WHERE status = 'current';

CREATE TABLE repository_proposals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  brief_version INTEGER NOT NULL CHECK (brief_version >= 1),
  reason TEXT NOT NULL,
  desired_visibility TEXT NOT NULL DEFAULT 'private' CHECK (desired_visibility IN ('private','public')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected','executed','superseded')),
  approval_id TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (project_id, brief_version) REFERENCES project_briefs(project_id, version) ON DELETE RESTRICT,
  FOREIGN KEY (approval_id, project_id, workspace_id) REFERENCES approvals(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE repository_mock_results (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  repository_proposal_id TEXT NOT NULL,
  repository_ref TEXT NOT NULL,
  result_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  UNIQUE (repository_proposal_id),
  FOREIGN KEY (repository_proposal_id, project_id, workspace_id) REFERENCES repository_proposals(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE verification_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  work_item_id TEXT NOT NULL,
  work_item_version INTEGER NOT NULL CHECK (work_item_version >= 1),
  outcome TEXT NOT NULL CHECK (outcome IN ('pass','fail')),
  level TEXT NOT NULL CHECK (level IN ('L1','L2','L3','L4','L5')),
  summary TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  CHECK (outcome <> 'pass' OR evidence_json <> '[]'),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (assignment_id, project_id, workspace_id) REFERENCES assignments(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE spend_requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  purpose TEXT NOT NULL,
  currency TEXT NOT NULL,
  max_amount_minor INTEGER NOT NULL CHECK (max_amount_minor >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','superseded')),
  approval_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (approval_id, project_id, workspace_id) REFERENCES approvals(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TABLE metered_actions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  work_item_id TEXT,
  spend_envelope_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  estimated_amount_minor INTEGER NOT NULL CHECK (estimated_amount_minor >= 0),
  actual_amount_minor INTEGER,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'authorized' CHECK (status IN ('authorized','executed','blocked','canceled')),
  created_at TEXT NOT NULL,
  executed_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id, project_id, workspace_id) REFERENCES work_items(id, project_id, workspace_id) ON DELETE RESTRICT,
  FOREIGN KEY (spend_envelope_id, project_id, workspace_id) REFERENCES spend_envelopes(id, project_id, workspace_id) ON DELETE RESTRICT
) STRICT;

CREATE TRIGGER trg_assignment_work_item_version_update
BEFORE UPDATE OF work_item_version ON assignments
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

CREATE TRIGGER trg_spend_envelope_requires_approval
BEFORE INSERT ON spend_envelopes
FOR EACH ROW
WHEN NEW.approval_id IS NULL OR NOT EXISTS (
  SELECT 1 FROM approvals
  WHERE id = NEW.approval_id
    AND project_id = NEW.project_id
    AND workspace_id = NEW.workspace_id
    AND subject_type = 'spend_envelope'
    AND subject_id = NEW.id
    AND status = 'approved'
)
BEGIN
  SELECT RAISE(ABORT, 'approved_spend_authority_required');
END;

CREATE TRIGGER trg_cost_record_envelope_guard
BEFORE INSERT ON cost_records
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1 FROM spend_envelopes
  WHERE id = NEW.spend_envelope_id
    AND project_id = NEW.project_id
    AND workspace_id = NEW.workspace_id
    AND currency = NEW.currency
    AND status = 'approved'
    AND spent_amount_minor + NEW.amount_minor <= max_amount_minor
)
BEGIN
  SELECT RAISE(ABORT, 'spend_envelope_exceeded_or_unavailable');
END;

CREATE TRIGGER trg_cost_record_apply
AFTER INSERT ON cost_records
FOR EACH ROW
BEGIN
  UPDATE spend_envelopes
  SET spent_amount_minor = spent_amount_minor + NEW.amount_minor,
      status = CASE WHEN spent_amount_minor + NEW.amount_minor >= max_amount_minor THEN 'exhausted' ELSE status END
  WHERE id = NEW.spend_envelope_id
    AND project_id = NEW.project_id
    AND workspace_id = NEW.workspace_id;
END;

CREATE INDEX idx_repository_proposals_project ON repository_proposals(project_id, status);
CREATE INDEX idx_verification_runs_assignment ON verification_runs(assignment_id, created_at);
CREATE INDEX idx_spend_requests_project ON spend_requests(project_id, status);
CREATE INDEX idx_metered_actions_project ON metered_actions(project_id, status);
