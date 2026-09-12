INSERT INTO app_metadata (key, value, updated_at)
VALUES ('phase22_authority_hardening', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

-- A WorkItem may only be born in a creation state. Later states must be reached
-- through explicit transition / verification paths rather than caller-supplied
-- INSERT values.
CREATE TRIGGER trg_work_item_initial_status_guard
BEFORE INSERT ON work_items
FOR EACH ROW
WHEN NEW.status NOT IN ('draft','ready')
BEGIN
  SELECT RAISE(ABORT, 'work_item_initial_status_invalid');
END;

-- Spend requests created before this migration did not persist the Project /
-- WorkItem versions that existed when authority was requested. Pending legacy
-- requests are therefore fail-closed rather than retroactively treated as fresh.
UPDATE approvals
SET status = 'superseded', resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP)
WHERE status = 'requested'
  AND id IN (
    SELECT approval_id FROM spend_requests WHERE status = 'requested'
  );

UPDATE spend_requests
SET status = 'superseded', resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP)
WHERE status = 'requested';

ALTER TABLE spend_requests ADD COLUMN project_version INTEGER;
ALTER TABLE spend_requests ADD COLUMN work_item_version INTEGER;

UPDATE spend_requests
SET project_version = (
      SELECT p.version
      FROM projects p
      WHERE p.id = spend_requests.project_id
        AND p.workspace_id = spend_requests.workspace_id
    ),
    work_item_version = CASE
      WHEN work_item_id IS NULL THEN NULL
      ELSE (
        SELECT w.version
        FROM work_items w
        WHERE w.id = spend_requests.work_item_id
          AND w.project_id = spend_requests.project_id
          AND w.workspace_id = spend_requests.workspace_id
      )
    END;

CREATE UNIQUE INDEX idx_spend_requests_approval_unique
  ON spend_requests(approval_id);

CREATE UNIQUE INDEX idx_spend_envelopes_approval_unique
  ON spend_envelopes(approval_id)
  WHERE approval_id IS NOT NULL;

-- Approval subjects are polymorphic but not arbitrary. Existing canonical
-- subjects must exist in the same Workspace/Project at the exact bound version.
-- spend_envelope is intentionally a future-resource subject: the requested
-- authority is provisional here and cannot become approved until a matching
-- canonical spend_request exists (see the approval-update guard below).
CREATE TRIGGER trg_approval_subject_insert_guard
BEFORE INSERT ON approvals
FOR EACH ROW
WHEN NOT (
  (
    NEW.subject_type = 'work_item'
    AND EXISTS (
      SELECT 1 FROM work_items w
      WHERE w.id = NEW.subject_id
        AND w.workspace_id = NEW.workspace_id
        AND w.project_id = NEW.project_id
        AND w.version = NEW.subject_version
    )
  )
  OR (
    NEW.subject_type = 'work_item_proposal'
    AND NEW.subject_version = 1
    AND EXISTS (
      SELECT 1 FROM work_item_proposals p
      WHERE p.id = NEW.subject_id
        AND p.workspace_id = NEW.workspace_id
        AND p.project_id = NEW.project_id
        AND p.status = 'proposed'
    )
  )
  OR (
    NEW.subject_type = 'repository_proposal'
    AND EXISTS (
      SELECT 1
      FROM repository_proposals r
      JOIN projects p
        ON p.id = r.project_id
       AND p.workspace_id = r.workspace_id
      WHERE r.id = NEW.subject_id
        AND r.workspace_id = NEW.workspace_id
        AND r.project_id = NEW.project_id
        AND r.status = 'proposed'
        AND r.brief_version = NEW.subject_version
        AND p.current_brief_version = NEW.subject_version
    )
  )
  OR (
    NEW.subject_type = 'spend_envelope'
    AND NEW.subject_version = 1
    AND json_valid(NEW.bounds_json)
    AND json_extract(NEW.bounds_json, '$.requestId') IS NOT NULL
    AND json_extract(NEW.bounds_json, '$.purpose') IS NOT NULL
    AND json_extract(NEW.bounds_json, '$.currency') IS NOT NULL
    AND CAST(json_extract(NEW.bounds_json, '$.maxAmountMinor') AS INTEGER) >= 0
  )
)
BEGIN
  SELECT RAISE(ABORT, 'approval_subject_invalid_or_stale');
END;

-- The authority-bearing identity and bounds of an Approval are immutable after
-- creation. Resolution may change status/evidence/timestamps, never the thing
-- that was actually approved.
CREATE TRIGGER trg_approval_authority_immutable
BEFORE UPDATE OF workspace_id, project_id, subject_type, subject_id, subject_version, authority_reason, bounds_json ON approvals
FOR EACH ROW
WHEN OLD.workspace_id <> NEW.workspace_id
  OR OLD.project_id <> NEW.project_id
  OR OLD.subject_type <> NEW.subject_type
  OR OLD.subject_id <> NEW.subject_id
  OR OLD.subject_version <> NEW.subject_version
  OR OLD.authority_reason <> NEW.authority_reason
  OR OLD.bounds_json <> NEW.bounds_json
BEGIN
  SELECT RAISE(ABORT, 'approval_authority_immutable');
END;

CREATE TRIGGER trg_approval_status_transition_guard
BEFORE UPDATE OF status ON approvals
FOR EACH ROW
WHEN OLD.status <> NEW.status
  AND NOT (
    (OLD.status = 'requested' AND NEW.status IN ('approved','rejected','expired','superseded'))
    OR (OLD.status = 'approved' AND NEW.status IN ('expired','superseded'))
  )
BEGIN
  SELECT RAISE(ABORT, 'approval_status_transition_invalid');
END;

-- A provisional spend approval becomes anchored when the corresponding
-- spend_request is inserted. The bounds must exactly match the request.
CREATE TRIGGER trg_spend_request_approval_binding_guard
BEFORE INSERT ON spend_requests
FOR EACH ROW
WHEN NEW.approval_id IS NULL
  OR NOT EXISTS (
    SELECT 1
    FROM approvals a
    WHERE a.id = NEW.approval_id
      AND a.workspace_id = NEW.workspace_id
      AND a.project_id = NEW.project_id
      AND a.status = 'requested'
      AND a.subject_type = 'spend_envelope'
      AND a.subject_version = 1
      AND json_extract(a.bounds_json, '$.requestId') = NEW.id
      AND json_extract(a.bounds_json, '$.purpose') = NEW.purpose
      AND json_extract(a.bounds_json, '$.currency') = NEW.currency
      AND CAST(json_extract(a.bounds_json, '$.maxAmountMinor') AS INTEGER) = NEW.max_amount_minor
  )
BEGIN
  SELECT RAISE(ABORT, 'spend_request_approval_binding_invalid');
END;

-- Capture the exact canonical Project / WorkItem version at request time.
CREATE TRIGGER trg_spend_request_capture_authority_version
AFTER INSERT ON spend_requests
FOR EACH ROW
BEGIN
  UPDATE spend_requests
  SET project_version = (
        SELECT p.version
        FROM projects p
        WHERE p.id = NEW.project_id
          AND p.workspace_id = NEW.workspace_id
      ),
      work_item_version = CASE
        WHEN NEW.work_item_id IS NULL THEN NULL
        ELSE (
          SELECT w.version
          FROM work_items w
          WHERE w.id = NEW.work_item_id
            AND w.project_id = NEW.project_id
            AND w.workspace_id = NEW.workspace_id
        )
      END
  WHERE id = NEW.id
    AND workspace_id = NEW.workspace_id
    AND project_id = NEW.project_id;
END;

-- Approval is authority only if the subject is still current at the instant the
-- approval changes to approved. This closes stale-version / approval TOCTOU at
-- the resolution boundary.
CREATE TRIGGER trg_approval_approved_subject_current_guard
BEFORE UPDATE OF status ON approvals
FOR EACH ROW
WHEN NEW.status = 'approved'
  AND OLD.status <> 'approved'
  AND NOT (
    (
      NEW.subject_type = 'work_item'
      AND EXISTS (
        SELECT 1 FROM work_items w
        WHERE w.id = NEW.subject_id
          AND w.workspace_id = NEW.workspace_id
          AND w.project_id = NEW.project_id
          AND w.version = NEW.subject_version
      )
    )
    OR (
      NEW.subject_type = 'work_item_proposal'
      AND NEW.subject_version = 1
      AND EXISTS (
        SELECT 1 FROM work_item_proposals p
        WHERE p.id = NEW.subject_id
          AND p.workspace_id = NEW.workspace_id
          AND p.project_id = NEW.project_id
          AND p.status = 'proposed'
      )
    )
    OR (
      NEW.subject_type = 'repository_proposal'
      AND EXISTS (
        SELECT 1
        FROM repository_proposals r
        JOIN projects p
          ON p.id = r.project_id
         AND p.workspace_id = r.workspace_id
        WHERE r.id = NEW.subject_id
          AND r.workspace_id = NEW.workspace_id
          AND r.project_id = NEW.project_id
          AND r.status = 'proposed'
          AND r.brief_version = NEW.subject_version
          AND p.current_brief_version = NEW.subject_version
      )
    )
    OR (
      NEW.subject_type = 'spend_envelope'
      AND NEW.subject_version = 1
      AND EXISTS (
        SELECT 1
        FROM spend_requests s
        JOIN projects p
          ON p.id = s.project_id
         AND p.workspace_id = s.workspace_id
        LEFT JOIN work_items w
          ON w.id = s.work_item_id
         AND w.project_id = s.project_id
         AND w.workspace_id = s.workspace_id
        WHERE s.approval_id = NEW.id
          AND s.id = json_extract(NEW.bounds_json, '$.requestId')
          AND s.workspace_id = NEW.workspace_id
          AND s.project_id = NEW.project_id
          AND s.status = 'requested'
          AND s.purpose = json_extract(NEW.bounds_json, '$.purpose')
          AND s.currency = json_extract(NEW.bounds_json, '$.currency')
          AND s.max_amount_minor = CAST(json_extract(NEW.bounds_json, '$.maxAmountMinor') AS INTEGER)
          AND s.project_version = p.version
          AND (
            s.work_item_id IS NULL
            OR (
              w.id IS NOT NULL
              AND s.work_item_version = w.version
            )
          )
      )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'approval_subject_invalid_or_stale');
END;

-- Repository execution must re-check authority at use time, not merely trust
-- that an approval happened earlier.
CREATE TRIGGER trg_repository_mock_authority_guard
BEFORE INSERT ON repository_mock_results
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM repository_proposals r
  JOIN approvals a
    ON a.id = r.approval_id
   AND a.workspace_id = r.workspace_id
   AND a.project_id = r.project_id
  JOIN projects p
    ON p.id = r.project_id
   AND p.workspace_id = r.workspace_id
  WHERE r.id = NEW.repository_proposal_id
    AND r.workspace_id = NEW.workspace_id
    AND r.project_id = NEW.project_id
    AND r.status = 'approved'
    AND a.status = 'approved'
    AND a.subject_type = 'repository_proposal'
    AND a.subject_id = r.id
    AND a.subject_version = r.brief_version
    AND p.current_brief_version = r.brief_version
)
BEGIN
  SELECT RAISE(ABORT, 'repository_authority_stale_or_missing');
END;

DROP TRIGGER IF EXISTS trg_spend_envelope_requires_approval;

-- A SpendEnvelope is created from one exact approved request. Amount, currency,
-- purpose, scope, and canonical versions must still match at envelope creation.
CREATE TRIGGER trg_spend_envelope_requires_approval
BEFORE INSERT ON spend_envelopes
FOR EACH ROW
WHEN NEW.approval_id IS NULL
  OR NOT EXISTS (
    SELECT 1
    FROM approvals a
    JOIN spend_requests s
      ON s.approval_id = a.id
     AND s.workspace_id = a.workspace_id
     AND s.project_id = a.project_id
    JOIN projects p
      ON p.id = s.project_id
     AND p.workspace_id = s.workspace_id
    LEFT JOIN work_items w
      ON w.id = s.work_item_id
     AND w.project_id = s.project_id
     AND w.workspace_id = s.workspace_id
    WHERE a.id = NEW.approval_id
      AND a.workspace_id = NEW.workspace_id
      AND a.project_id = NEW.project_id
      AND a.subject_type = 'spend_envelope'
      AND a.subject_id = NEW.id
      AND a.subject_version = 1
      AND a.status = 'approved'
      AND s.status = 'requested'
      AND s.purpose = NEW.purpose
      AND s.currency = NEW.currency
      AND s.max_amount_minor = NEW.max_amount_minor
      AND (
        (s.work_item_id IS NULL AND NEW.work_item_id IS NULL)
        OR s.work_item_id = NEW.work_item_id
      )
      AND s.project_version = p.version
      AND (
        s.work_item_id IS NULL
        OR (
          w.id IS NOT NULL
          AND s.work_item_version = w.version
        )
      )
  )
BEGIN
  SELECT RAISE(ABORT, 'approved_spend_authority_required');
END;

CREATE TRIGGER trg_spend_request_resolution_guard
BEFORE UPDATE OF status ON spend_requests
FOR EACH ROW
WHEN OLD.status <> NEW.status
  AND NEW.status IN ('approved','rejected')
  AND NOT (
    (
      NEW.status = 'rejected'
      AND EXISTS (
        SELECT 1 FROM approvals a
        WHERE a.id = NEW.approval_id
          AND a.workspace_id = NEW.workspace_id
          AND a.project_id = NEW.project_id
          AND a.status = 'rejected'
      )
    )
    OR (
      NEW.status = 'approved'
      AND EXISTS (
        SELECT 1
        FROM approvals a
        JOIN spend_envelopes e
          ON e.approval_id = a.id
         AND e.workspace_id = a.workspace_id
         AND e.project_id = a.project_id
        WHERE a.id = NEW.approval_id
          AND a.workspace_id = NEW.workspace_id
          AND a.project_id = NEW.project_id
          AND a.status = 'approved'
          AND a.subject_type = 'spend_envelope'
          AND a.subject_id = e.id
          AND e.purpose = NEW.purpose
          AND e.currency = NEW.currency
          AND e.max_amount_minor = NEW.max_amount_minor
          AND (
            (NEW.work_item_id IS NULL AND e.work_item_id IS NULL)
            OR NEW.work_item_id = e.work_item_id
          )
      )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'spend_request_resolution_authority_invalid');
END;

DROP TRIGGER IF EXISTS trg_cost_record_envelope_guard;

-- Spend authority is re-checked again when money is actually recorded. An
-- envelope whose Project/WorkItem version has become stale is not reusable.
CREATE TRIGGER trg_cost_record_envelope_guard
BEFORE INSERT ON cost_records
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM spend_envelopes e
  JOIN approvals a
    ON a.id = e.approval_id
   AND a.workspace_id = e.workspace_id
   AND a.project_id = e.project_id
  JOIN spend_requests s
    ON s.approval_id = a.id
   AND s.workspace_id = a.workspace_id
   AND s.project_id = a.project_id
  JOIN projects p
    ON p.id = s.project_id
   AND p.workspace_id = s.workspace_id
  LEFT JOIN work_items w
    ON w.id = s.work_item_id
   AND w.project_id = s.project_id
   AND w.workspace_id = s.workspace_id
  WHERE e.id = NEW.spend_envelope_id
    AND e.project_id = NEW.project_id
    AND e.workspace_id = NEW.workspace_id
    AND e.currency = NEW.currency
    AND e.status = 'approved'
    AND a.status = 'approved'
    AND s.status = 'approved'
    AND s.project_version = p.version
    AND (
      s.work_item_id IS NULL
      OR (
        w.id IS NOT NULL
        AND s.work_item_version = w.version
      )
    )
    AND e.spent_amount_minor + NEW.amount_minor <= e.max_amount_minor
)
BEGIN
  SELECT RAISE(ABORT, 'spend_envelope_stale_exceeded_or_unavailable');
END;
