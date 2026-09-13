INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase31_adaptive_discovery', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

CREATE TABLE phase31_discovery_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 3),
  route_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','failed')),
  input_sha256 TEXT NOT NULL,
  output_sha256 TEXT,
  output_json TEXT,
  usage_json TEXT,
  external_ref TEXT,
  error_text TEXT,
  created_at TEXT NOT NULL,
  finished_at TEXT,
  UNIQUE (intake_id, round_number),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES execution_routes(id)
) STRICT;

CREATE TABLE phase31_discovery_questions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL,
  question_key TEXT NOT NULL,
  prompt TEXT NOT NULL,
  materiality_reason TEXT NOT NULL,
  impact_areas_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','unknown','skipped','superseded')),
  answer_text TEXT,
  created_at TEXT NOT NULL,
  answered_at TEXT,
  CHECK (
    (status = 'answered' AND answer_text IS NOT NULL AND length(trim(answer_text)) > 0)
    OR (status IN ('open','unknown','skipped','superseded') AND answer_text IS NULL)
  ),
  UNIQUE (analysis_run_id, question_key),
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (analysis_run_id, project_id, workspace_id) REFERENCES phase31_discovery_runs(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE phase31_discovery_findings (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL,
  finding_type TEXT NOT NULL CHECK (finding_type IN ('client_stated','operator_answer','model_inference','assumption','unknown','challenge')),
  statement TEXT NOT NULL,
  canonical_status TEXT NOT NULL CHECK (canonical_status IN ('proposed','accepted','rejected','superseded')),
  source_ref TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (analysis_run_id, project_id, workspace_id) REFERENCES phase31_discovery_runs(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE phase31_research_decisions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL UNIQUE,
  research_required INTEGER NOT NULL CHECK (research_required IN (0,1)),
  rationale TEXT NOT NULL,
  topics_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','superseded')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (analysis_run_id, project_id, workspace_id) REFERENCES phase31_discovery_runs(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE phase31_strategy_recommendations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  intake_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL UNIQUE,
  strategy TEXT NOT NULL CHECK (strategy IN ('process_change','adopt_existing','configure','integrate','automate','custom_build','hybrid','research_pilot','defer')),
  rationale TEXT NOT NULL,
  alternatives_json TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','superseded')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  UNIQUE (id, project_id, workspace_id),
  FOREIGN KEY (analysis_run_id, project_id, workspace_id) REFERENCES phase31_discovery_runs(id, project_id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (intake_id, project_id, workspace_id) REFERENCES project_intakes(id, project_id, workspace_id) ON DELETE CASCADE
) STRICT;

CREATE INDEX idx_phase31_runs_intake ON phase31_discovery_runs(workspace_id, intake_id, round_number);
CREATE INDEX idx_phase31_questions_open ON phase31_discovery_questions(workspace_id, intake_id, status);
CREATE INDEX idx_phase31_findings_intake ON phase31_discovery_findings(workspace_id, intake_id, canonical_status);
CREATE INDEX idx_phase31_strategy_intake ON phase31_strategy_recommendations(workspace_id, intake_id, status);
