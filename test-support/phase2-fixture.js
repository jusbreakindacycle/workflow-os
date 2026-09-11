import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/database.js';
import { CanonicalStore } from '../src/domain/canonical-store.js';
import { Phase1ControlPlane } from '../src/domain/phase1-control-plane.js';
import { Phase2AutonomyKernel } from '../src/domain/phase2-autonomy-kernel.js';

const migrationsDir = path.resolve('migrations');

export function createPhase2Fixture(prefix = 'workflow-os-phase2-') {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const databasePath = path.join(dataDir, 'test.sqlite');
  const opened = openDatabase({ databasePath, dataDir, migrationsDir });
  return {
    ...opened,
    dataDir,
    databasePath,
    store: new CanonicalStore(opened.db),
    phase1: new Phase1ControlPlane(opened.db),
    phase2: new Phase2AutonomyKernel(opened.db)
  };
}

export function acceptedReadyProject({ store, phase1, mode = 'internal', strategy = 'custom_build', rawRequest = 'I need a reliable internal workflow.' }) {
  const workspace = store.createWorkspace({ name: `Phase 2 Workspace ${Math.random()}` });
  let snapshot = store.startProjectIntake({
    workspaceId: workspace.id,
    mode,
    title: 'Synthetic Phase 2 project',
    rawRequest,
    requestedSolution: 'A custom app',
    clientName: mode === 'client' ? 'Synthetic Client' : null
  });
  snapshot = store.saveDiscoveryResponses({
    workspaceId: workspace.id,
    intakeId: snapshot.intake.id,
    responses: [
      { questionKey: 'problem', responseState: 'answered', answerText: 'Manual handoffs cause avoidable errors.' },
      { questionKey: 'desired_outcome', responseState: 'answered', answerText: 'The handoff becomes reliable and explainable.' },
      { questionKey: 'primary_users', responseState: 'answered', answerText: 'Operator and staff' },
      { questionKey: 'constraints', responseState: 'answered', answerText: 'No production side effects in the test.' },
      { questionKey: 'success', responseState: 'answered', answerText: 'Independent verification accepts the bounded result.' }
    ]
  });
  snapshot = store.setWorkingDeliveryStrategy({ workspaceId: workspace.id, intakeId: snapshot.intake.id, strategy, rationale: 'Synthetic Phase 2 fixture.' });
  snapshot = store.acceptProjectIntake({ workspaceId: workspace.id, intakeId: snapshot.intake.id, expectedProjectVersion: snapshot.project.version });
  const graph = phase1.ensureInitialWorkGraph({ workspaceId: workspace.id, projectId: snapshot.project.id });
  return { workspace, snapshot, graph, workItem: graph.nextReady[0] };
}

export function addFixtureRoute({ phase2, workspaceId, name, group, mode = 'worker', quality = 80, config = {}, capabilities = null }) {
  const connection = phase2.createProviderConnection({
    workspaceId,
    providerKey: 'fixture',
    connectionType: 'local_service',
    billingMode: 'zero_incremental',
    locality: 'local',
    allowedDataClasses: ['Public', 'Internal'],
    entitlement: { fixture: true }
  });
  const route = phase2.createExecutionRoute({
    workspaceId,
    providerConnectionId: connection.id,
    routeName: name,
    runtimeKey: 'fixture-runtime',
    adapterKind: 'fixture',
    capabilities: capabilities ?? (mode === 'verifier' ? ['verification', 'reasoning'] : ['reasoning', 'planning']),
    independenceGroup: group,
    qualityScore: quality,
    reliabilityScore: 95,
    latencyScore: 95,
    estimatedCostMinor: 0,
    config: { mode, ...config }
  });
  return { connection, route };
}
