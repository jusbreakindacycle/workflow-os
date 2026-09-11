UPDATE app_metadata SET value = '3', updated_at = CURRENT_TIMESTAMP WHERE key = 'foundation_gate';

CREATE TABLE project_intakes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL UNIQUE,
  input_class TEXT NOT NULL CHECK (input_class IN ('client_request','internal_idea','user_problem','operational_pain','change_request','maintenance_need')),
  raw_request TEXT NOT NULL,
  requested_solution TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','discovery','review','accepted','abandoned')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  accepted_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (project_id, workspace_id) REFERENCES projects(id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE discovery_responses (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  question_key TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response_state TEXT NOT NULL CHECK (response_state IN ('answered','unknown','skipped')),
  answer_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (response_state = 'answered' AND answer_text IS NOT NULL AND length(trim(answer_text)) > 0)
    OR (response_state IN ('unknown','skipped') AND answer_text IS NULL)
  ),
  UNIQUE (intake_id, question_key),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE delivery_strategy_decisions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('process_change','adopt_existing','configure','integrate','automate','custom_build','hybrid','research_pilot','defer')),
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working','accepted','superseded')),
  created_at TEXT NOT NULL,
  accepted_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX idx_delivery_strategy_current
  ON delivery_strategy_decisions(intake_id)
  WHERE status IN ('working','accepted');

CREATE INDEX idx_project_intakes_workspace_status ON project_intakes(workspace_id, status);
CREATE INDEX idx_discovery_responses_intake ON discovery_responses(intake_id, question_key);
