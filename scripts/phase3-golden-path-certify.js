// @ts-check
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { GovernedWorkspace } from '../src/runtime/governed-workspace.js';
import { Phase35Certification } from '../src/domain/phase35-certification.js';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-phase3-cert-'));
const databasePath = path.join(dataDir, 'workflow-os.sqlite');
const migrationsDir = path.resolve('migrations');
const executionRoot = path.join(dataDir, 'execution-root');
const { db, migrations } = openDatabase({ databasePath, dataDir, migrationsDir });

try {
  const runtime = new GovernedWorkspace(db, { rootDir: executionRoot });
  const result = await new Phase35Certification(db, { workspaceRuntime: runtime }).run();
  const evidence = db.prepare('SELECT evidence_type,level FROM evidence_references WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(result.workspaceId, result.projectId);
  console.log(JSON.stringify({
    phase: '3.5',
    passed: true,
    migrations,
    strategy: result.acceptedBrief.delivery_strategy,
    projectStatus: result.commandCenter.project.operational_status,
    lifecyclePhase: result.commandCenter.project.lifecycle_phase,
    workItems: result.plan.items.map((item) => ({ title: item.title, status: item.status })),
    workspaceRef: result.executionWorkspace.rootRef,
    artifactCount: result.executionWorkspace.manifest.length,
    evidence,
    deliveryStatus: result.deliveryRecord.status,
    paidSpendRecords: Number(db.prepare('SELECT COUNT(*) AS n FROM cost_records WHERE workspace_id=?').get(result.workspaceId).n)
  }, null, 2));
} finally {
  db.close();
}
