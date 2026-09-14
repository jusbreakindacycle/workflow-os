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
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p40-uncertain-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Uncertainty Fixture' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Uncertain action' });
  const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'External mutation', outcome: 'Bounded effect', status: 'ready', riskTier: 'R2' });
  const actions = new Phase40ExternalActions(db);
  const plan = actions.createPlan({ workspaceId: workspace.id, projectId: project.id, workItemId: item.id, adapterClass: 'fixture_external', actionKind: 'mutate', target: { key: 'one' }, inputSha256: 'b'.repeat(64), riskTier: 'R2', actionClass: 'durable_external_mutation', requiredAuthority: 'exact_approval' });
  actions.requestAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id });
  actions.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, planId: plan.id, decision: 'approved' });
  return { db, store, workspace, project, item, actions, plan, adapter: new FixtureExternalActionAdapter() };
}

test('uncertain not-applied effect must reconcile before retry', () => {
  const ctx = setup();
  try {
    ctx.adapter.setNextMode('uncertain_not_applied');
    const attempt = ctx.actions.startAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: ctx.plan.id, adapterProvider: ctx.adapter.provider, adapterVersion: ctx.adapter.version, operationKind: 'mutate' });
    const effect = ctx.adapter.execute(ctx.plan);
    ctx.actions.finishAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, outcome: effect.outcome, result: effect.result, errorClass: effect.errorClass });
    assert.throws(() => ctx.actions.startAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: ctx.plan.id, adapterProvider: 'fixture', adapterVersion: 'phase-4.0-v1', operationKind: 'mutate' }), /preflight_blocked/);
    const observed = ctx.adapter.reconcile(ctx.plan);
    assert.equal(observed.classification, 'not_applied');
    const reconciled = ctx.actions.reconcile({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, classification: observed.classification, observedState: observed.observedState });
    assert.equal(reconciled.plan.status, 'authorized');
    const retry = ctx.actions.startAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: ctx.plan.id, adapterProvider: 'fixture', adapterVersion: 'phase-4.0-v1', operationKind: 'mutate' });
    assert.equal(retry.attempt_number, 2);
  } finally { ctx.db.close(); }
});

test('uncertain applied effect reconciles confirmed without duplicate attempt', () => {
  const ctx = setup();
  try {
    ctx.adapter.setNextMode('uncertain_applied');
    const attempt = ctx.actions.startAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, planId: ctx.plan.id, adapterProvider: ctx.adapter.provider, adapterVersion: ctx.adapter.version, operationKind: 'mutate' });
    const effect = ctx.adapter.execute(ctx.plan);
    ctx.actions.finishAttempt({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, outcome: effect.outcome, result: effect.result, errorClass: effect.errorClass });
    const observed = ctx.adapter.reconcile(ctx.plan);
    const reconciled = ctx.actions.reconcile({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, attemptId: attempt.id, classification: observed.classification, observedState: observed.observedState });
    assert.equal(reconciled.plan.status, 'verified');
    assert.equal(reconciled.plan.attempts.length, 1);
  } finally { ctx.db.close(); }
});
