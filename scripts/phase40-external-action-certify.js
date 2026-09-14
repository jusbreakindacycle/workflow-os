import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';
import { FixtureExternalActionAdapter } from '../src/runtime/fixture-external-action-adapter.js';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase40-cert-'));
const { db, migrations } = openDatabase({ databasePath: path.join(dataDir, 'cert.sqlite'), dataDir, migrationsDir: path.resolve('migrations') });

try {
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase 4.0 Certification' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Governed external action certification' });
  const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'Create bounded fixture effect', outcome: 'Prove governed external action chain', status: 'ready', riskTier: 'R2' });
  const actions = new Phase40ExternalActions(db);
  const adapter = new FixtureExternalActionAdapter();

  const plan = actions.createPlan({
    workspaceId: workspace.id,
    projectId: project.id,
    workItemId: item.id,
    adapterClass: 'fixture_external',
    actionKind: 'create_exact_record',
    target: { namespace: 'phase40-certification', key: 'exact-effect' },
    preconditions: { expected: 'absent' },
    inputRefs: ['synthetic:verified-artifact'],
    inputSha256: '0'.repeat(64),
    riskTier: 'R2',
    actionClass: 'durable_external_mutation',
    requiredAuthority: 'exact_approval',
    verification: { minimum: 'L3', reconcile: true },
    recovery: { maxAttempts: 2, onUncertain: 'reconcile_before_retry' }
  });

  const requested = actions.requestAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
  actions.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, decision: 'approved', evidence: ['synthetic-operator-authority'] });
  const preflight = actions.preflight({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
  if (!preflight.ok) throw new Error(`phase40_certification_preflight_failed:${preflight.blockers.join('|')}`);

  const attempt = actions.startAttempt({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, adapterProvider: adapter.provider, adapterVersion: adapter.version, operationKind: plan.action_kind, requestDescriptor: { certification: true } });
  const effect = adapter.execute(actions.getPlan({ workspaceId: workspace.id, projectId: project.id, planId: plan.id }));
  actions.finishAttempt({ workspaceId: workspace.id, projectId: project.id, attemptId: attempt.id, outcome: effect.outcome, result: effect.result, providerOperationRef: effect.providerOperationRef, providerResourceRef: effect.providerResourceRef, errorClass: effect.errorClass });
  const observation = adapter.reconcile(actions.getPlan({ workspaceId: workspace.id, projectId: project.id, planId: plan.id }));
  actions.reconcile({ workspaceId: workspace.id, projectId: project.id, attemptId: attempt.id, classification: observation.classification, observedState: observation.observedState });
  const completed = actions.complete({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });

  if (completed.status !== 'complete') throw new Error(`phase40_certification_not_complete:${completed.status}`);
  if (completed.reconciliations.at(-1)?.classification !== 'confirmed') throw new Error('phase40_certification_not_confirmed');
  if (completed.mappings.length !== 1) throw new Error('phase40_certification_mapping_missing');
  if (requested.approval?.status !== 'requested') throw new Error('phase40_certification_approval_not_requested');

  console.log(JSON.stringify({
    phase: 'phase-4.0',
    passed: true,
    migrations,
    provider: 'fixture',
    realExternalSideEffects: false,
    planStatus: completed.status,
    planSha256: completed.plan_sha256,
    attemptCount: completed.attempts.length,
    reconciliation: completed.reconciliations.at(-1)?.classification,
    mappingCount: completed.mappings.length,
    approvalBound: Boolean(completed.approval),
    evidenceLevel: 'L3'
  }, null, 2));
} finally {
  db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
}
