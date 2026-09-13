// @ts-check
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const DEFAULT_POLICY = Object.freeze({
  authorityClass: 'R1',
  syntheticOnly: true,
  network: 'loopback_only',
  allowedFileOperations: ['read','create','update','bounded_delete'],
  allowedCommandClasses: ['syntax_check','test','local_server'],
  forbidden: ['git_remote_mutation','production_deploy','external_messaging','credential_store','privilege_elevation','package_publish','host_configuration']
});

export class GovernedWorkspace {
  /** @param {import('node:sqlite').DatabaseSync} db @param {{rootDir:string}} options */
  constructor(db, { rootDir }) {
    if (!rootDir || typeof rootDir !== 'string') throw new TypeError('execution_workspace_root_required');
    this.db = db;
    this.rootDir = path.resolve(rootDir);
    fs.mkdirSync(this.rootDir, { recursive: true });
    this.rootReal = fs.realpathSync(this.rootDir);
    this.processes = new Map();
  }

  prepare({ workspaceId, projectId, policy = {} }) {
    this.#project(workspaceId, projectId);
    const existing = this.db.prepare('SELECT * FROM execution_workspaces WHERE workspace_id=? AND project_id=?').get(workspaceId, projectId);
    if (existing) return this.#view(existing);
    const id = crypto.randomUUID();
    const dir = path.join(this.rootReal, safeSegment(workspaceId), safeSegment(projectId));
    assertUnder(this.rootReal, dir);
    fs.mkdirSync(dir, { recursive: true });
    const real = fs.realpathSync(dir);
    assertUnder(this.rootReal, real);
    const resolvedPolicy = { ...DEFAULT_POLICY, ...policy, authorityClass: 'R1', syntheticOnly: true, network: 'loopback_only' };
    const time = now();
    this.db.prepare(`INSERT INTO execution_workspaces
      (id,workspace_id,project_id,root_path,status,policy_json,manifest_json,created_at,updated_at)
      VALUES (?,?,?,?, 'prepared',?,'[]',?,?)`).run(id, workspaceId, projectId, real, JSON.stringify(resolvedPolicy), time, time);
    this.#event(workspaceId, projectId, 'phase33.workspace.prepared', id, { rootRef: this.#redactedRoot(real), policy: resolvedPolicy });
    return this.get({ workspaceId, projectId });
  }

  get({ workspaceId, projectId }) {
    const row = this.db.prepare('SELECT * FROM execution_workspaces WHERE workspace_id=? AND project_id=?').get(workspaceId, projectId);
    if (!row) throw new Error(`execution_workspace_not_found:${projectId}`);
    return this.#view(row);
  }

  writeFile({ workspaceId, projectId, relativePath, content }) {
    if (typeof content !== 'string') throw new TypeError('workspace_text_content_required');
    const ws = this.get({ workspaceId, projectId });
    if (!['prepared','active'].includes(ws.status)) throw new Error(`execution_workspace_not_writable:${ws.status}`);
    const target = this.#resolve(ws.root_path, relativePath, { allowMissingLeaf: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    this.#assertNoSymlinkComponents(ws.root_path, path.dirname(target));
    fs.writeFileSync(target, content, 'utf8');
    this.#refreshManifest(workspaceId, projectId, ws.root_path);
    this.db.prepare("UPDATE execution_workspaces SET status='active',updated_at=? WHERE id=?").run(now(), ws.id);
    return { relativePath: normalizeRelative(relativePath), bytes: Buffer.byteLength(content), sha256: sha256(content) };
  }

  readFile({ workspaceId, projectId, relativePath }) {
    const ws = this.get({ workspaceId, projectId });
    const target = this.#resolve(ws.root_path, relativePath, { allowMissingLeaf: false });
    if (!fs.statSync(target).isFile()) throw new Error('workspace_target_not_file');
    return fs.readFileSync(target, 'utf8');
  }

  deleteFile({ workspaceId, projectId, relativePath }) {
    const ws = this.get({ workspaceId, projectId });
    const target = this.#resolve(ws.root_path, relativePath, { allowMissingLeaf: false });
    const stat = fs.lstatSync(target);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('workspace_delete_file_only');
    fs.unlinkSync(target);
    this.#refreshManifest(workspaceId, projectId, ws.root_path);
    return { deleted: normalizeRelative(relativePath) };
  }

  runCommand({ workspaceId, projectId, workItemId = null, commandClass, relativePath }) {
    const ws = this.get({ workspaceId, projectId });
    const target = this.#resolve(ws.root_path, relativePath, { allowMissingLeaf: false });
    const spec = commandSpec(commandClass, target);
    const id = crypto.randomUUID();
    const started = now();
    const result = spawnSync(spec.command, spec.args, { cwd: ws.root_path, env: minimalEnv(), encoding: 'utf8', timeout: 10000, shell: false });
    if (result.error) throw result.error;
    const exitCode = result.status ?? 1;
    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';
    this.db.prepare(`INSERT INTO execution_processes
      (id,workspace_id,project_id,execution_workspace_id,work_item_id,command_class,cwd_relative,status,pid,exit_code,stdout_text,stderr_text,started_at,finished_at)
      VALUES (?,?,?,?,?,?,'.','exited',NULL,?,?,?,?,?)`).run(
        id, workspaceId, projectId, ws.id, workItemId, commandClass, exitCode,
        trim(stdout, 12000), trim(stderr, 12000), started, now()
      );
    return { id, commandClass, exitCode, stdout, stderr, passed: exitCode === 0 };
  }

  async startLocalServer({ workspaceId, projectId, workItemId = null, relativePath, readinessTimeoutMs = 4000 }) {
    const ws = this.get({ workspaceId, projectId });
    const target = this.#resolve(ws.root_path, relativePath, { allowMissingLeaf: false });
    const id = crypto.randomUUID();
    const child = spawn(process.execPath, [target], { cwd: ws.root_path, env: minimalEnv(), stdio: ['ignore','pipe','pipe'], shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    this.db.prepare(`INSERT INTO execution_processes
      (id,workspace_id,project_id,execution_workspace_id,work_item_id,command_class,cwd_relative,status,pid,started_at)
      VALUES (?,?,?,?,?,'local_server','.','running',?,?)`).run(id, workspaceId, projectId, ws.id, workItemId, child.pid ?? null, now());
    this.processes.set(id, { child, workspaceId, projectId, workspaceRef: ws.id, stdout: () => stdout, stderr: () => stderr });
    try {
      const port = await waitReady(child, () => stdout, () => stderr, readinessTimeoutMs);
      return { processId: id, port, origin: `http://127.0.0.1:${port}` };
    } catch (error) {
      await this.stopProcess({ workspaceId, projectId, processId: id, failed: true });
      throw error;
    }
  }

  async stopProcess({ workspaceId, projectId, processId, failed = false }) {
    const record = this.processes.get(processId);
    if (!record || record.workspaceId !== workspaceId || record.projectId !== projectId) throw new Error(`execution_process_not_owned:${processId}`);
    const { child } = record;
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([onceExit(child), delay(1200)]);
      if (child.exitCode === null) {
        child.kill('SIGKILL');
        await Promise.race([onceExit(child), delay(500)]);
      }
    }
    this.db.prepare(`UPDATE execution_processes SET status=?,exit_code=?,stdout_text=?,stderr_text=?,finished_at=? WHERE id=? AND workspace_id=? AND project_id=?`)
      .run(failed ? 'failed' : 'stopped', child.exitCode, trim(record.stdout(),12000), trim(record.stderr(),12000), now(), processId, workspaceId, projectId);
    this.processes.delete(processId);
    return { processId, status: failed ? 'failed' : 'stopped', exitCode: child.exitCode };
  }

  cleanup({ workspaceId, projectId }) {
    const ws = this.get({ workspaceId, projectId });
    for (const [processId, record] of this.processes) if (record.workspaceId === workspaceId && record.projectId === projectId) throw new Error(`execution_workspace_process_still_running:${processId}`);
    assertUnder(this.rootReal, ws.root_path);
    if (ws.root_path === this.rootReal) throw new Error('execution_workspace_root_delete_forbidden');
    fs.rmSync(ws.root_path, { recursive: true, force: true });
    this.db.prepare("UPDATE execution_workspaces SET status='cleaned',manifest_json='[]',updated_at=? WHERE id=?").run(now(), ws.id);
    this.#event(workspaceId, projectId, 'phase33.workspace.cleaned', ws.id, {});
    return this.get({ workspaceId, projectId });
  }

  #resolve(root, relativePath, { allowMissingLeaf }) {
    const rel = normalizeRelative(relativePath);
    if (path.isAbsolute(relativePath) || rel === '..' || rel.startsWith(`..${path.sep}`) || rel.includes('\0')) throw new Error('workspace_path_escape_rejected');
    const target = path.resolve(root, rel);
    assertUnder(root, target);
    this.#assertNoSymlinkComponents(root, allowMissingLeaf ? path.dirname(target) : target);
    if (!allowMissingLeaf && !fs.existsSync(target)) throw new Error(`workspace_path_not_found:${rel}`);
    const existing = nearestExisting(target);
    const realExisting = fs.realpathSync(existing);
    assertUnder(fs.realpathSync(root), realExisting);
    return target;
  }

  #assertNoSymlinkComponents(root, target) {
    assertUnder(root, target);
    const relative = path.relative(root, target);
    let current = root;
    for (const part of relative.split(path.sep).filter(Boolean)) {
      current = path.join(current, part);
      if (!fs.existsSync(current)) break;
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('workspace_symlink_escape_rejected');
    }
  }

  #refreshManifest(workspaceId, projectId, root) {
    const manifest = [];
    walk(root, root, manifest);
    this.db.prepare('UPDATE execution_workspaces SET manifest_json=?,updated_at=? WHERE workspace_id=? AND project_id=?').run(JSON.stringify(manifest), now(), workspaceId, projectId);
  }
  #view(row) { return { ...row, policy: json(row.policy_json, {}), manifest: json(row.manifest_json, []), rootRef: this.#redactedRoot(row.root_path) }; }
  #redactedRoot(root) { return path.relative(this.rootReal, root) || '.'; }
  #project(workspaceId, projectId) {
    const row = this.db.prepare('SELECT id FROM projects WHERE id=? AND workspace_id=?').get(projectId, workspaceId);
    if (!row) throw new Error(`project_not_found_in_workspace:${projectId}:${workspaceId}`);
  }
  #event(workspaceId, projectId, eventType, entityId, payload) {
    this.db.prepare(`INSERT INTO project_events
      (id,workspace_id,project_id,event_type,actor_type,entity_type,entity_id,payload_json,sensitivity,created_at)
      VALUES (?,?,?,?, 'system','execution_workspace',?,?,'internal',?)`).run(crypto.randomUUID(), workspaceId, projectId, eventType, entityId, JSON.stringify(payload), now());
  }
}

function commandSpec(commandClass, target) {
  if (commandClass === 'syntax_check') return { command: process.execPath, args: ['--check', target] };
  if (commandClass === 'test') return { command: process.execPath, args: ['--test', target] };
  throw new Error(`workspace_command_class_forbidden:${commandClass}`);
}
function minimalEnv() { return { PORT: '0', HOST: '127.0.0.1', NODE_ENV: 'test', TZ: 'UTC' }; }
function normalizeRelative(value) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('workspace_relative_path_required');
  return path.normalize(value.trim());
}
function assertUnder(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('workspace_path_escape_rejected');
}
function nearestExisting(target) { let current = target; while (!fs.existsSync(current)) { const parent = path.dirname(current); if (parent === current) throw new Error('workspace_existing_parent_not_found'); current = parent; } return current; }
function walk(root, current, out) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error('workspace_manifest_symlink_rejected');
    if (entry.isDirectory()) walk(root, full, out);
    else if (entry.isFile()) out.push({ path: path.relative(root, full), size: fs.statSync(full).size, sha256: sha256(fs.readFileSync(full)) });
  }
}
function waitReady(child, stdout, stderr, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`local_server_readiness_timeout:${trim(stderr(),500)}`)), timeoutMs);
    const inspect = () => {
      const match = stdout().match(/READY\s+(\d+)/);
      if (match) { clearTimeout(timer); cleanup(); resolve(Number(match[1])); }
    };
    const onExit = (code) => { clearTimeout(timer); cleanup(); reject(new Error(`local_server_exited_before_ready:${code}:${trim(stderr(),500)}`)); };
    const cleanup = () => { child.stdout.off('data', inspect); child.off('exit', onExit); };
    child.stdout.on('data', inspect); child.once('exit', onExit); inspect();
  });
}
function onceExit(child) { return new Promise((resolve) => child.once('exit', resolve)); }
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function safeSegment(value) { return String(value).replace(/[^a-zA-Z0-9._-]/g, '_'); }
function trim(value, max) { const text = String(value ?? ''); return text.length <= max ? text : `${text.slice(0,max)}…`; }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function json(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function now() { return new Date().toISOString(); }
