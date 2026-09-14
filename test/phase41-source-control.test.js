import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase41SourceControl } from '../src/domain/phase41-source-control.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';
import { FixtureSourceControlAdapter } from '../src/runtime/fixture-source-control-adapter.js';

const migrationsDir = path.resolve('migrations');

function setup({ behavior = 'success', adapterBaseCommit = 'base-0001' } = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-p41-'));
  const { db } = openDatabase({ databasePath: path.join(dataDir, 'db.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase 4.1 Fixture' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Source control delivery fixture' });
  const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'Deliver verified artifact', outcome: 'Create one exact branch, commit and PR', status: 'ready', riskTier: 'R2' });
  const runtime = new GovernedWorkspace(db, { rootDir: path.join(dataDir, 'execution-workspaces') });
  runtime.prepare({ workspaceId: workspace.id, projectId: project.id });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'index.html', content: '<h1>synthetic delivery</h1>\n' });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'app.js', content: "console.log('synthetic');\n" });
  db.prepare(`INSERT INTO evidence_references
    (id,workspace_id,project_id,work_item_id,level,evidence_type,summary,created_at)
    VALUES (?,?,?,?, 'L3','independent_verification','Synthetic independent verification passed.',?)`).run(crypto.randomUUID(), workspace.id, project.id, item.id, new Date().toISOString());
  const adapter = new FixtureSourceControlAdapter({ behavior, baseCommit: adapterBaseCommit });
  const source = new Phase41SourceControl(db, { workspaceRuntime: runtime, adapter });
  return { dataDir, db, store, workspace, project, item, runtime, adapter, source };
}

function compile(ctx, overrides = {}) {
  return ctx.source.compilePlan({
    workspaceId: ctx.workspace.id,
    projectId: ctx.project.id,
    workItemId: ctx.item.id,
    repository: 'fixture/acme-demo',
    baseRef: 'main',
    baseCommit: 'base-0001',
    deliveryBranch: 'workflow-os/delivery-1',
    commitMessage: 'feat: deliver verified synthetic artifact',
    prTitle: 'Deliver verified synthetic artifact',
    prBody: 'Exact synthetic Phase 4.1 delivery fixture.',
    checksPolicy: { required: false },
    ...overrides
  });
}

function approve(ctx, compiled) {
  const requested = ctx.source.requestAuthority({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: compiled.external_action_plan_id });
  assert.equal(requested.approval.status, 'requested');
  const resolved = ctx.source.resolveAuthority({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: compiled.external_action_plan_id, decision: 'approved', evidence: ['operator-approved-phase41-fixture'] });
  assert.equal(resolved.plan.status, 'authorized');
  return resolved.sourceControl;
}

test('Phase 4.1 fixture creates and reconciles one exact branch + commit + PR bundle', async () => {
  const ctx = setup();
  try {
    const plan = approve(ctx, compile(ctx));
    const result = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(result.status, 'complete');
    assert.deepEqual(result.allowedOperations, ['create_delivery_branch','write_verified_snapshot','open_pull_request','read_checks','reconcile']);
    assert.equal(result.externalAction.attempts.length, 1);
    assert.equal(result.externalAction.reconciliations.at(-1).classification, 'confirmed');
    assert.equal(result.externalAction.mappings.length, 1);
    assert.match(result.externalAction.mappings[0].resource_ref, /^fixture:\/\//);
    const observed = JSON.parse(ctx.db.prepare('SELECT summary FROM evidence_references WHERE workspace_id=? AND project_id=? AND evidence_type=? ORDER BY created_at DESC LIMIT 1').get(ctx.workspace.id, ctx.project.id, 'external_action_reconciliation').summary);
    assert.equal(observed.sourceControl, true);
    assert.equal(observed.classification, 'confirmed');
  } finally { ctx.db.close(); }
});

test('re-running a completed Phase 4.1 plan is idempotent and creates no second attempt', async () => {
  const ctx = setup();
  try {
    const plan = approve(ctx, compile(ctx));
    const first = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    const second = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(first.status, 'complete');
    assert.equal(second.status, 'complete');
    assert.equal(second.externalAction.attempts.length, 1);
    assert.equal(second.externalAction.reconciliations.filter((row) => row.classification === 'confirmed').length, 1);
  } finally { ctx.db.close(); }
});

test('uncertain applied source-control effect reconciles without duplicate mutation', async () => {
  const ctx = setup({ behavior: 'uncertain_applied' });
  try {
    const plan = approve(ctx, compile(ctx));
    const result = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(result.status, 'complete');
    assert.equal(result.externalAction.attempts.length, 1);
    assert.equal(result.externalAction.attempts[0].status, 'uncertain');
    assert.equal(result.externalAction.reconciliations.at(-1).classification, 'confirmed');
  } finally { ctx.db.close(); }
});

test('uncertain not-applied source-control effect must reconcile before bounded retry', async () => {
  const ctx = setup({ behavior: 'uncertain_not_applied' });
  try {
    const plan = approve(ctx, compile(ctx));
    const first = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(first.status, 'authorized');
    assert.equal(first.externalAction.reconciliations.at(-1).classification, 'not_applied');
    ctx.adapter.behavior = 'success';
    const second = await ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(second.status, 'complete');
    assert.equal(second.externalAction.attempts.length, 2);
  } finally { ctx.db.close(); }
});

test('artifact drift after approval blocks source-control mutation before an attempt', async () => {
  const ctx = setup();
  try {
    const plan = approve(ctx, compile(ctx));
    ctx.runtime.writeFile({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, relativePath: 'app.js', content: "console.log('changed after approval');\n" });
    await assert.rejects(() => ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id }), /source_control_artifact_manifest_drift/);
    const state = ctx.source.get({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(state.status, 'blocked');
    assert.equal(state.externalAction.attempts.length, 0);
  } finally { ctx.db.close(); }
});

test('base drift blocks source-control mutation before an attempt', async () => {
  const ctx = setup({ adapterBaseCommit: 'base-CHANGED' });
  try {
    const plan = approve(ctx, compile(ctx));
    await assert.rejects(() => ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id }), /source_control_base_drift/);
    const state = ctx.source.get({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(state.status, 'blocked');
    assert.equal(state.externalAction.attempts.length, 0);
  } finally { ctx.db.close(); }
});

test('default branch is never a Phase 4.1 write target even when base ref differs', async () => {
  const ctx = setup();
  try {
    const plan = approve(ctx, compile(ctx, { baseRef: 'release', deliveryBranch: 'main' }));
    await assert.rejects(() => ctx.source.execute({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id }), /source_control_default_branch_write_forbidden/);
    const state = ctx.source.get({ workspaceId: ctx.workspace.id, projectId: ctx.project.id, externalActionPlanId: plan.external_action_plan_id });
    assert.equal(state.status, 'blocked');
    assert.equal(state.externalAction.attempts.length, 0);
  } finally { ctx.db.close(); }
});
