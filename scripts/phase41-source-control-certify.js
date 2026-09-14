import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase41SourceControl } from '../src/domain/phase41-source-control.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';
import { FixtureSourceControlAdapter } from '../src/runtime/fixture-source-control-adapter.js';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase41-cert-'));
const { db, migrations } = openDatabase({ databasePath: path.join(dataDir, 'cert.sqlite'), dataDir, migrationsDir: path.resolve('migrations') });

try {
  const store = new CanonicalStore(db);
  const workspace = store.createWorkspace({ name: 'Phase 4.1 Certification' });
  const project = store.createProject({ workspaceId: workspace.id, kind: 'internal_product', title: 'Governed source control certification' });
  const item = store.createWorkItem({ workspaceId: workspace.id, projectId: project.id, class: 'delivery', title: 'Deliver verified artifact through source control', outcome: 'Create exact fixture branch + commit + PR', status: 'ready', riskTier: 'R2' });
  const runtime = new GovernedWorkspace(db, { rootDir: path.join(dataDir, 'execution-workspaces') });
  runtime.prepare({ workspaceId: workspace.id, projectId: project.id });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'index.html', content: '<main>phase 4.1 synthetic artifact</main>\n' });
  runtime.writeFile({ workspaceId: workspace.id, projectId: project.id, relativePath: 'app.js', content: "console.log('phase41 synthetic');\n" });
  db.prepare(`INSERT INTO evidence_references
    (id,workspace_id,project_id,work_item_id,level,evidence_type,summary,created_at)
    VALUES (?,?,?,?, 'L3','independent_verification','Synthetic Phase 4.1 artifact independently verified.',?)`).run(crypto.randomUUID(), workspace.id, project.id, item.id, new Date().toISOString());

  const adapter = new FixtureSourceControlAdapter({ baseCommit: 'phase41-base-0001' });
  const source = new Phase41SourceControl(db, { workspaceRuntime: runtime, adapter });
  const compiled = source.compilePlan({
    workspaceId: workspace.id,
    projectId: project.id,
    workItemId: item.id,
    repository: 'fixture/phase41-certification',
    baseRef: 'main',
    baseCommit: 'phase41-base-0001',
    deliveryBranch: 'workflow-os/phase41-certification',
    commitMessage: 'feat: certify governed source control',
    prTitle: 'Certify governed source control',
    prBody: 'Synthetic credential-free Phase 4.1 certification.',
    checksPolicy: { required: false }
  });
  const requested = source.requestAuthority({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: compiled.external_action_plan_id });
  source.resolveAuthority({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: compiled.external_action_plan_id, decision: 'approved', evidence: ['synthetic-operator-authority'] });
  const completed = await source.execute({ workspaceId: workspace.id, projectId: project.id, externalActionPlanId: compiled.external_action_plan_id });

  if (completed.status !== 'complete') throw new Error(`phase41_certification_not_complete:${completed.status}`);
  if (completed.externalAction.attempts.length !== 1) throw new Error('phase41_certification_attempt_count_invalid');
  if (completed.externalAction.reconciliations.at(-1)?.classification !== 'confirmed') throw new Error('phase41_certification_not_confirmed');
  if (completed.externalAction.mappings.length !== 1) throw new Error('phase41_certification_mapping_missing');
  if (requested.approval?.status !== 'requested') throw new Error('phase41_certification_approval_not_requested');
  if (completed.delivery_branch === 'main') throw new Error('phase41_certification_default_branch_write');

  console.log(JSON.stringify({
    phase: 'phase-4.1',
    passed: true,
    migrations,
    provider: 'fixture',
    realExternalSideEffects: false,
    repository: completed.repository_ref,
    baseRef: completed.base_ref,
    deliveryBranch: completed.delivery_branch,
    artifactCount: completed.artifactManifest.length,
    projectedTreeSha256: completed.projected_tree_sha256,
    planStatus: completed.status,
    attemptCount: completed.externalAction.attempts.length,
    reconciliation: completed.externalAction.reconciliations.at(-1)?.classification,
    mappingCount: completed.externalAction.mappings.length,
    approvalBound: Boolean(completed.externalAction.approval),
    mergeAuthority: false,
    evidenceLevel: 'L3'
  }, null, 2));
} finally {
  db.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
}
