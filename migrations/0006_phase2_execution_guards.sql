UPDATE app_metadata SET value = '8', updated_at = CURRENT_TIMESTAMP WHERE key = 'phase2_gate';

-- ExecutionAttempt must bind the same WorkItem/route described by its Assignment and RouteDecision.
CREATE TRIGGER trg_execution_attempt_binding_guard
BEFORE INSERT ON execution_attempts
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = NEW.assignment_id
      AND a.workspace_id = NEW.workspace_id
      AND a.project_id = NEW.project_id
      AND a.work_item_id = NEW.work_item_id
  ) THEN RAISE(ABORT, 'execution_attempt_assignment_binding_mismatch') END;

  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM route_decisions d
    WHERE d.id = NEW.route_decision_id
      AND d.workspace_id = NEW.workspace_id
      AND d.project_id = NEW.project_id
      AND d.work_item_id = NEW.work_item_id
      AND d.route_id = NEW.route_id
      AND (d.assignment_id IS NULL OR d.assignment_id = NEW.assignment_id)
  ) THEN RAISE(ABORT, 'execution_attempt_route_decision_binding_mismatch') END;
END;

-- Assignment-level incremental-cost budget is distinct from the wider SpendEnvelope.
-- Pre-call estimated cost must fit both. Phase 2 real adapters use the configured
-- conservative estimate as the pre-call bound when authoritative actual cost is unavailable.
CREATE TRIGGER trg_execution_attempt_assignment_budget_guard
BEFORE INSERT ON execution_attempts
WHEN NEW.estimated_cost_minor IS NOT NULL
BEGIN
  SELECT CASE WHEN (
    COALESCE((
      SELECT SUM(COALESCE(e.actual_cost_minor, e.estimated_cost_minor, 0))
      FROM execution_attempts e
      WHERE e.assignment_id = NEW.assignment_id
        AND e.status IN ('running','succeeded')
    ), 0)
    + NEW.estimated_cost_minor
  ) > COALESCE((
    SELECT CAST(ROUND(json_extract(a.budget_json, '$.max_incremental_cost') * 100.0) AS INTEGER)
    FROM assignments a
    WHERE a.id = NEW.assignment_id
      AND a.workspace_id = NEW.workspace_id
      AND a.project_id = NEW.project_id
  ), 0)
  THEN RAISE(ABORT, 'assignment_incremental_cost_budget_exceeded') END;
END;

CREATE TRIGGER trg_loop_assignment_binding_guard
BEFORE INSERT ON loop_runs
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.id = NEW.assignment_id
      AND a.workspace_id = NEW.workspace_id
      AND a.project_id = NEW.project_id
      AND a.work_item_id = NEW.work_item_id
  ) THEN RAISE(ABORT, 'loop_assignment_binding_mismatch') END;
END;
