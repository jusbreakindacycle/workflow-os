import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase40ExternalActions } from '../src/domain/phase40-external-actions.js';
import { FixtureExternalActionAdapter } from '../src/runtime/fixture-external-action-adapter.js';

const migrationsDir = path.resolve('migrations');

function setup() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase 4 Fixture' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'External action fixture' });
  const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'Publish artifact', outcome: 'Create exact external effect', status: 'ready', riskTier: 'R2' });
  return { db, store, workspace, project, item, actions: new Phase40ExternalActions(db), adapter: new FixtureExternalActionAdapter() };
}

function createPlan(ctx) {
  return ctx.actions.createPlan({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, workItemId: ctx.item.id, adapterClass: 'fixture_external', actionKind: 'create_exact_record', target: { namespace: 'fixture', key: 'delivery' }, preconditions: { expected: 'absent' }, inputRefs: ['artifact:verified:v1'], inputSha256: 'a'.repeat(64), riskTier: 'R2', actionClass: 'durable_external_mutation', requiredAuthority: 'exact_approval', verification: { minimum: 'L3' }, recovery: { kind: 'escalate' } });
}

function approve(ctx, plan) {
  const requested = ctx.actions.requestAuthority({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: plan.id });
  assert.equal(requested.approval.status, 'requested');
  return ctx.actions.resolveAuthority({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: plan.id, decision: 'approved', evidence: ['operator-approved-fixture'] }).plan;
}

test('Phase 4.0 fixture proves plan -> approval -> attempt -> reconcile -> complete', () => {
  const ctx = setup();
  try {
    const plan = approve(ctx, createPlan(ctx));
    const attempt = ctx.actions.startAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: plan.id, adapterProvider: ctx.adapter.provider, adapterVersion: ctx.adapter.version, operationKind: plan.action_kind, requestDescriptor: { fixture: true } });
    const effect = ctx.adapter.execute(plan);
    ctx.actions.finishAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, outcome: effect.outcome, result: effect.result, providerOperationRef: effect.providerOperationRef, providerResourceRef: effect.providerResourceRef });
    const observed = ctx.adapter.reconcile(plan);
    const reconciled = ctx.actions.reconcile({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, classification: observed.classification, observedState: observed.observedState });
    assert.equal(reconciled.plan.status, 'verified');
    const completed = ctx.actions.complete({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: plan.id });
    assert.equal(completed.status, 'complete');
    assert.equal(completed.attempts.length, 1);
    assert.equal(completed.reconciliations[0].classification, 'confirmed');
    assert.equal(completed.mappings.length, 1);
    assert.equal(completed.mappings[0].provider, 'fixture');
    assert.equal(completed.mappings[0].resource_ref, effect.providerResourceRef);
    const evidence = ctx.db.prepare("SELECT * FROM evidence_references WHERE workspace_id=? AND project_id=? AND evidence_type='external_action_reconciliation'").all(ctx.workspace.id, ctx.project.id);
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0].level, 'L3');
  } finally { ctx.db.close(); }
});
