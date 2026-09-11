import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase1ControlPlane } from '../src/domain/phase1-control-plane.js';
import { diffProjectPackVersions } from '../src/domain/project-pack-diff.js';

const migrationsDir = path.resolve('migrations');

test('material accepted revision produces a new Project Pack version with inspectable diff', () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-pack-revision-'));
  const opened = openDatabase({ databasePath: path.join(dataDir, 'test.sqlite'), dataDir, migrationsDir });
  const store = new CanonicalStore(opened.db);
  const control = new Phase1ControlPlane(opened.db);
  try {
    const workspace = store.createWorkspace({ name: 'Pack revision workspace' });
    let intake = store.startProjectIntake({ workspaceId: workspace.id, mode: 'internal', title: 'Pack revision', rawRequest: 'Fix a handoff.' });
    intake = store.saveDiscoveryResponses({
      workspaceId: workspace.id,
      intakeId: intake.intake.id,
      responses: [
        { questionKey: 'problem', responseState: 'answered', answerText: 'The handoff is inconsistent.' },
        { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'The handoff becomes reliable.' },
        { questionKey: 'success', responseState: 'answered', answerText: 'Original acceptance condition passes.' }
      ]
    });
    intake = store.setWorkingDeliveryStrategy({ workspaceId: workspace.id, intakeId: intake.intake.id, strategy: 'custom_build' });
    intake = store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: intake.intake.id, expectedProjectVersion: intake.project.version });
    control.ensureInitialWorkGraph({ workspaceId: workspace.id, projectId: intake.project.id });
    const firstPack = control.generateProjectPack({ workspaceId: workspace.id, projectId: intake.project.id });
    assert.equal(firstPack.version, 1);

    const project = opened.db.prepare('SELECT * FROM projects WHERE id = ?').get(intake.project.id);
    const firstWorkItem = opened.db.prepare('SELECT id FROM work_items WHERE project_id = ? ORDER BY created_at LIMIT 1').get(intake.project.id);
    control.reviseProjectGoal({
      workspaceId: workspace.id,
      projectId: intake.project.id,
      expectedProjectVersion: project.version,
      problem: 'The handoff now includes a second approval step.',
      desiredOutcome: 'The revised two-step handoff becomes reliable.',
      deliveryStrategy: 'custom_build',
      workingScope: { success: 'Revised acceptance condition passes.' },
      reason: 'material_goal_change',
      affectedWorkItemIds: [firstWorkItem.id]
    });

    const secondPack = control.generateProjectPack({ workspaceId: workspace.id, projectId: intake.project.id });
    assert.equal(secondPack.version, 2);
    assert.equal(secondPack.brief_version, 2);
    assert.notEqual(secondPack.content_sha256, firstPack.content_sha256);

    const diff = diffProjectPackVersions(opened.db, { workspaceId: workspace.id, projectId: intake.project.id, fromVersion: 1, toVersion: 2 });
    assert.equal(diff.changed, true);
    assert.ok(diff.changes.some((change) => change.path === '$.project.problem'));
    assert.ok(diff.changes.some((change) => change.path === '$.project.desired_outcome'));
    assert.equal(diff.from.briefVersion, 1);
    assert.equal(diff.to.briefVersion, 2);
  } finally {
    opened.db.close();
  }
});
