import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';

const migrationsDir = path.resolve('migrations');

function createStore() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-os-gate3-'));
  const databasePath = path.join(dataDir, 'test.sqlite');
  const opened = openDatabase({ databasePath, dataDir, migrationsDir });
  return { ...opened, store: new CanonicalStore(opened.db) };
}

test('internal intake preserves raw/requested solution, unknowns, strategy and accepted brief', () => {
  const { db, store } = createStore();
  try {
    const workspace = store.createWorkspace({ name: 'Solo Builder' });
    let snapshot = store.startProjectIntake({
      workspaceId: workspace.id,
      mode: 'internal',
      title: 'Inventory helper',
      rawRequest: 'I keep losing track of stock updates.',
      requestedSolution: 'Maybe a mobile app'
    });

    assert.equal(snapshot.project.kind, 'internal_product');
    assert.equal(snapshot.engagement, null);
    assert.equal(snapshot.client, null);
    assert.equal(snapshot.intake.raw_request, 'I keep losing track of stock updates.');
    assert.equal(snapshot.intake.requested_solution, 'Maybe a mobile app');

    snapshot = store.saveDiscoveryResponses({
      workspaceId: workspace.id,
      intakeId: snapshot.intake.id,
      responses: [
        { questionKey: 'problem', responseState: 'answered', answerText: 'Stock changes are recorded inconsistently.' },
        { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'See reliable stock status quickly.' },
        { questionKey: 'primary_users', responseState: 'answered', answerText: 'Owner and staff' },
        { questionKey: 'constraints', responseState: 'unknown' },
        { questionKey: 'success', responseState: 'answered', answerText: 'No duplicate or missing stock updates in the test flow.' }
      ]
    });
    assert.equal(snapshot.responses.find((row) => row.question_key === 'constraints').response_state, 'unknown');

    snapshot = store.setWorkingDeliveryStrategy({ workspaceId: workspace.id, intakeId: snapshot.intake.id, strategy: 'research_pilot', rationale: 'Validate the process before committing to custom software.' });
    assert.equal(snapshot.strategy.status, 'working');

    snapshot = store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });
    assert.equal(snapshot.intake.status, 'accepted');
    assert.equal(snapshot.acceptedBrief.version, 1);
    assert.equal(snapshot.acceptedBrief.requested_solution, 'Maybe a mobile app');
    assert.equal(snapshot.acceptedBrief.delivery_strategy, 'research_pilot');
    assert.equal(snapshot.project.lifecycle_phase, 'definition');
    assert.equal(snapshot.project.operational_status, 'ready');
    const scope = JSON.parse(snapshot.acceptedBrief.working_scope_json);
    assert.deepEqual(scope.unknowns, ['constraints']);
  } finally {
    db.close();
  }
});

test('required discovery stays explicit and internal approval does not fabricate client acceptance', () => {
  const { db, store } = createStore();
  try {
    const workspace = store.createWorkspace({ name: 'Client Work' });
    let snapshot = store.startProjectIntake({
      workspaceId: workspace.id,
      mode: 'client',
      title: 'Booking site',
      rawRequest: 'Client asked for a website with reservations.',
      requestedSolution: 'Website with booking system',
      clientName: 'Synthetic Cafe'
    });
    assert.equal(snapshot.engagement.status, 'draft');

    snapshot = store.saveDiscoveryResponses({
      workspaceId: workspace.id,
      intakeId: snapshot.intake.id,
      responses: [
        { questionKey: 'problem', responseState: 'unknown' },
        { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'Customers can reserve a table.' }
      ]
    });
    snapshot = store.setWorkingDeliveryStrategy({ workspaceId: workspace.id, intakeId: snapshot.intake.id, strategy: 'custom_build' });
    assert.throws(
      () => store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version }),
      /discovery_required:problem/
    );

    snapshot = store.saveDiscoveryResponses({
      workspaceId: workspace.id,
      intakeId: snapshot.intake.id,
      responses: [{ questionKey: 'problem', responseState: 'answered', answerText: 'Reservations are currently handled manually in messages.' }]
    });
    snapshot = store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });
    assert.equal(snapshot.acceptedBrief.status, 'accepted');
    assert.equal(snapshot.engagement.status, 'draft');
    assert.equal(snapshot.strategy.status, 'accepted');
  } finally {
    db.close();
  }
});
