// @ts-check
import crypto from 'node:crypto';
import { Phase1ControlPlane } from './phase1-control-plane.js';
import { Phase32Workforce } from './phase32-workforce.js';

export class Phase34Delivery {
  /** @param {import('node:sqlite').DatabaseSync} db @param {{workspaceRuntime:any}} options */
  constructor(db, { workspaceRuntime }) {
    this.db = db;
    this.phase1 = new Phase1ControlPlane(db);
    this.phase32 = new Phase32Workforce(db);
    this.workspaceRuntime = workspaceRuntime;
  }

  createAssignment({ workspaceId, projectId, workItemId }) {
    const spec = this.phase32.specFor({ workspaceId, projectId, workItemId });
    const item = this.#item(workspaceId, projectId, workItemId);
    const node = this.phase1.getWorkGraph({ workspaceId, projectId }).nodes.find((row) => row.id === workItemId);
    if (!node || node.readiness !== 'eligible') throw new Error(`phase3_work_item_not_ready:${workItemId}:${(node?.readiness_reasons ?? []).join('|')}`);
    const slice = this.phase1.createContextSlice({ workspaceId, projectId, workItemId, purpose: 'phase3_delivery_assignment' });
    const pack = this.db.prepare('SELECT * FROM project_pack_versions WHERE id=? AND workspace_id=? AND project_id=?').get(slice.project_pack_version_id, workspaceId, projectId);
    if (!pack) throw new Error('phase3_project_pack_missing');
    const id = crypto.randomUUID();
    const budget = { max_iterations: spec.independent_verification_required ? 1 : 3, max_minutes: 10, max_incremental_cost: 0, spend_envelope_ref: null };
    const sideEffect = {
      max_risk_tier: spec.risk_tier,
      production_allowed: false,
      destructive_allowed: false,
      authority_requirement: spec.authority_requirement,
      action_class: spec.action_class
    };
    this.db.prepare(`INSERT INTO assignments
      (id,workspace_id,project_id,work_item_id,work_item_version,context_slice_id,assignee_kind,assignee_ref,status,budget_json,side_effect_policy_json,stop_conditions_json,created_at,project_pack_version_id,role,objective,evidence_required_json,escalation_json)
      VALUES (?,?,?,?,?,?,'tool',?,'created',?,?,?,?,?,?,?,?,?)`).run(
        id, workspaceId, projectId, workItemId, item.version, slice.id, `phase3:${spec.logical_role}`,
        JSON.stringify(budget), JSON.stringify(sideEffect), JSON.stringify(spec.stopConditions), now(), pack.id,
        spec.logical_role, item.outcome, JSON.stringify(spec.evidenceRequired), JSON.stringify(['material_scope_change','authority_missing_or_stale','unexpected_side_effect','verification_blocked'])
      );
    this.db.prepare("UPDATE phase3_workforce_activations SET status='active' WHERE workspace_id=? AND project_id=? AND work_item_id=? AND status='required'").run(workspaceId, projectId, workItemId);
    this.#event(workspaceId, projectId, workItemId, 'phase3.assignment.created', 'assignment', id, { role: spec.logical_role, capabilities: spec.capabilities, actionClass: spec.action_class });
    return this.phase1.startAssignment({ workspaceId, projectId, assignmentId: id });
  }

  completeAssignment({ workspaceId, projectId, assignmentId, evidenceType, evidenceLevel, summary, verificationSummary }) {
    const assignment = this.#assignment(workspaceId, projectId, assignmentId);
    if (assignment.status === 'running') this.phase1.finishAssignmentExecution({ workspaceId, projectId, assignmentId });
    const current = this.#assignment(workspaceId, projectId, assignmentId);
    if (current.status !== 'execution_finished') throw new Error(`phase3_assignment_not_execution_finished:${current.status}`);
    const evidence = this.phase1.addAssignmentEvidence({ workspaceId, projectId, assignmentId, level: evidenceLevel, summary, evidenceType });
    const result = this.phase1.verifyAssignment({ workspaceId, projectId, assignmentId, outcome: 'pass', level: evidenceLevel, summary: verificationSummary });
    this.db.prepare("UPDATE phase3_workforce_activations SET status='satisfied' WHERE workspace_id=? AND project_id=? AND work_item_id=?").run(workspaceId, projectId, assignment.work_item_id);
    this.phase1.refreshDerivedReadiness({ workspaceId, projectId });
    return { evidence, ...result };
  }

  failAssignment({ workspaceId, projectId, assignmentId, evidenceType, evidenceLevel = 'L2', summary, verificationSummary }) {
    const assignment = this.#assignment(workspaceId, projectId, assignmentId);
    if (assignment.status === 'running') this.phase1.finishAssignmentExecution({ workspaceId, projectId, assignmentId });
    this.phase1.addAssignmentEvidence({ workspaceId, projectId, assignmentId, level: evidenceLevel, summary, evidenceType });
    return this.phase1.verifyAssignment({ workspaceId, projectId, assignmentId, outcome: 'fail', level: evidenceLevel, summary: verificationSummary });
  }

  recordRepair({ workspaceId, projectId, workItemId, failureClass, actionSummary, status = 'applied' }) {
    if (!['planned','applied','failed','escalated'].includes(status)) throw new TypeError('phase3_repair_status_invalid');
    this.#item(workspaceId, projectId, workItemId);
    const attempt = Number(this.db.prepare('SELECT COALESCE(MAX(attempt_number),0) AS n FROM phase3_repair_attempts WHERE workspace_id=? AND project_id=? AND work_item_id=?').get(workspaceId, projectId, workItemId).n) + 1;
    if (attempt > 2) throw new Error('phase3_repair_budget_exhausted');
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO phase3_repair_attempts
      (id,workspace_id,project_id,work_item_id,attempt_number,failure_class,action_summary,status,created_at,finished_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, workspaceId, projectId, workItemId, attempt, failureClass, actionSummary, status, now(), status === 'planned' ? null : now());
    this.#event(workspaceId, projectId, workItemId, 'phase34.repair.recorded', 'phase3_repair_attempt', id, { attempt, failureClass, status });
    return this.db.prepare('SELECT * FROM phase3_repair_attempts WHERE id=?').get(id);
  }

  runDeterministicChecks({ workspaceId, projectId, workItemId, testPath = 'tests.test.js' }) {
    const syntax = this.workspaceRuntime.runCommand({ workspaceId, projectId, workItemId, commandClass: 'syntax_check', relativePath: 'server.js' });
    const tests = this.workspaceRuntime.runCommand({ workspaceId, projectId, workItemId, commandClass: 'test', relativePath: testPath });
    return { passed: syntax.passed && tests.passed, syntax, tests };
  }

  async runLocalLeadFlow({ workspaceId, projectId, workItemId }) {
    const server = await this.workspaceRuntime.startLocalServer({ workspaceId, projectId, workItemId, relativePath: 'server.js' });
    try {
      const page = await fetch(`${server.origin}/`);
      const html = await page.text();
      const invalid = await fetch(`${server.origin}/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '', email: 'not-an-email' }) });
      const valid = await fetch(`${server.origin}/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Synthetic Lead', email: 'lead@example.test' }) });
      const validBody = await valid.json();
      const countResponse = await fetch(`${server.origin}/leads/count`);
      const count = await countResponse.json();
      const passed = page.status === 200 && /synthetic offer/i.test(html) && /lead form/i.test(html) && invalid.status === 400 && valid.status === 201 && validBody.ok === true && count.count === 1;
      return { passed, pageStatus: page.status, invalidStatus: invalid.status, validStatus: valid.status, validBody, count, observableSuccess: validBody.message ?? null };
    } finally {
      await this.workspaceRuntime.stopProcess({ workspaceId, projectId, processId: server.processId });
    }
  }

  independentReview({ workspaceId, projectId, workItemId }) {
    const project = this.#project(workspaceId, projectId);
    const brief = this.db.prepare("SELECT * FROM project_briefs WHERE workspace_id=? AND project_id=? AND version=? AND status='accepted'").get(workspaceId, projectId, project.current_brief_version);
    if (!brief) throw new Error('phase34_current_brief_missing');
    const ws = this.workspaceRuntime.get({ workspaceId, projectId });
    const evidence = this.db.prepare('SELECT * FROM evidence_references WHERE workspace_id=? AND project_id=? ORDER BY created_at,id').all(workspaceId, projectId);
    const automated = evidence.some((row) => row.evidence_type === 'automated_test_result' && ['L2','L3','L4','L5'].includes(row.level));
    const flow = evidence.some((row) => row.evidence_type === 'local_flow_result' && ['L3','L4','L5'].includes(row.level));
    const requiredFiles = ['app-core.js','package.json','server.js','tests.test.js'];
    const manifestPaths = new Set(ws.manifest.map((entry) => entry.path));
    const filesPresent = requiredFiles.every((file) => manifestPaths.has(file));
    const processRecords = this.db.prepare('SELECT * FROM execution_processes WHERE workspace_id=? AND project_id=? ORDER BY started_at,id').all(workspaceId, projectId);
    const testObserved = processRecords.some((row) => row.command_class === 'test' && row.exit_code === 0);
    const localServerObserved = processRecords.some((row) => row.command_class === 'local_server' && ['stopped','exited'].includes(row.status));
    const findings = [];
    if (!automated) findings.push('missing_L2_automated_evidence');
    if (!flow) findings.push('missing_L3_local_flow_evidence');
    if (!filesPresent) findings.push('required_artifact_files_missing');
    if (!testObserved) findings.push('successful_test_process_not_observed');
    if (!localServerObserved) findings.push('local_server_process_not_observed');
    if (ws.policy.network !== 'loopback_only') findings.push('workspace_network_policy_not_loopback_only');
    return { passed: findings.length === 0, mechanism: 'deterministic_independent_reconciler', workerSelfReportTrusted: false, briefVersion: brief.version, findings, evidenceIds: evidence.map((row) => row.id), workspaceRef: ws.id, workItemId };
  }

  createDeliveryRecord({ workspaceId, projectId, executionWorkspaceId, evidenceBundle, limitations = [], nextAction = 'none_for_synthetic_certification' }) {
    const project = this.#project(workspaceId, projectId);
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO phase3_delivery_records
      (id,workspace_id,project_id,brief_version,execution_workspace_id,status,evidence_bundle_json,limitations_json,next_action,created_at,delivered_at)
      VALUES (?,?,?,?,?,'delivered',?,?,?,?,?)`).run(id, workspaceId, projectId, project.current_brief_version, executionWorkspaceId, JSON.stringify(evidenceBundle), JSON.stringify(limitations), nextAction, now(), now());
    this.#event(workspaceId, projectId, null, 'phase34.delivery.recorded', 'phase3_delivery_record', id, { briefVersion: project.current_brief_version, nextAction });
    return this.db.prepare('SELECT * FROM phase3_delivery_records WHERE id=?').get(id);
  }

  #assignment(workspaceId, projectId, id) {
    const row = this.db.prepare('SELECT * FROM assignments WHERE id=? AND workspace_id=? AND project_id=?').get(id, workspaceId, projectId);
    if (!row) throw new Error(`assignment_not_found_in_project:${id}`);
    return row;
  }
  #item(workspaceId, projectId, id) {
    const row = this.db.prepare('SELECT * FROM work_items WHERE id=? AND workspace_id=? AND project_id=?').get(id, workspaceId, projectId);
    if (!row) throw new Error(`work_item_not_found_in_project:${id}`);
    return row;
  }
  #project(workspaceId, projectId) {
    const row = this.db.prepare('SELECT * FROM projects WHERE id=? AND workspace_id=?').get(projectId, workspaceId);
    if (!row) throw new Error(`project_not_found_in_workspace:${projectId}`);
    return row;
  }
  #event(workspaceId, projectId, workItemId, eventType, entityType, entityId, payload) {
    this.db.prepare(`INSERT INTO project_events
      (id,workspace_id,project_id,work_item_id,event_type,actor_type,entity_type,entity_id,payload_json,sensitivity,created_at)
      VALUES (?,?,?,?,?,'system',?,?,?,'internal',?)`).run(crypto.randomUUID(), workspaceId, projectId, workItemId, eventType, entityType, entityId, JSON.stringify(payload), now());
  }
}

export function syntheticLeadGenFiles() {
  return {
    'package.json': JSON.stringify({ name: 'workflow-os-phase3-synthetic-leadgen', private: true, type: 'module' }, null, 2) + '\n',
    'app-core.js': `export function validateLead(input) {\n  const name = typeof input?.name === 'string' ? input.name.trim() : '';\n  const email = typeof input?.email === 'string' ? input.email.trim() : '';\n  if (!name) return { ok: false, error: 'name_required' };\n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return { ok: false, error: 'email_invalid' };\n  return { ok: true, lead: { name, email } };\n}\n`,
    'server.js': `import http from 'node:http';\nimport { validateLead } from './app-core.js';\nconst leads = [];\nconst page = '<!doctype html><html><body><main><h1>Synthetic Offer</h1><p>Request a synthetic follow-up.</p><form id="lead-form"><label>Name <input name="name" required></label><label>Email <input name="email" type="email" required></label><button>Send</button></form><p id="success" hidden>Thanks. Your synthetic lead was received.</p></main></body></html>';\nconst server = http.createServer(async (req, res) => {\n  if (req.method === 'GET' && req.url === '/') { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); return res.end(page); }\n  if (req.method === 'GET' && req.url === '/leads/count') { res.writeHead(200, {'content-type':'application/json'}); return res.end(JSON.stringify({ count: leads.length })); }\n  if (req.method === 'POST' && req.url === '/leads') {\n    let body=''; for await (const chunk of req) { body += chunk; if (body.length > 10000) { res.writeHead(413); return res.end(); } }\n    let input; try { input = JSON.parse(body || '{}'); } catch { res.writeHead(400, {'content-type':'application/json'}); return res.end(JSON.stringify({ok:false,error:'invalid_json'})); }\n    const result = validateLead(input);\n    if (!result.ok) { res.writeHead(400, {'content-type':'application/json'}); return res.end(JSON.stringify(result)); }\n    leads.push(result.lead); res.writeHead(201, {'content-type':'application/json'}); return res.end(JSON.stringify({ok:true,message:'Synthetic lead received',count:leads.length}));\n  }\n  res.writeHead(404); res.end();\n});\nserver.listen(0, '127.0.0.1', () => console.log('READY ' + server.address().port));\n`,
    'tests.test.js': `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { validateLead } from './app-core.js';\ntest('lead validation rejects missing name', () => assert.deepEqual(validateLead({name:'',email:'a@example.test'}), {ok:false,error:'name_required'}));\ntest('lead validation rejects invalid email', () => assert.deepEqual(validateLead({name:'A',email:'bad'}), {ok:false,error:'email_invalid'}));\ntest('lead validation accepts synthetic lead', () => assert.equal(validateLead({name:'Synthetic',email:'lead@example.test'}).ok, true));\n`,
    'README.md': '# Synthetic lead-generation artifact\n\nGenerated only for the Workflow OS Phase 3 local golden-path certification. No real client data, messaging, ads, analytics, CRM, deployment or external endpoints are used.\n'
  };
}

function now() { return new Date().toISOString(); }
