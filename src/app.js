// @ts-check
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertFoundationStatus } from './domain/foundation-status.js';
import { openDatabase } from './db/database.js';
import { handleApi, statusForApiError } from './http/intake-api.js';
import { handleControlPlaneApi, statusForControlPlaneError } from './http/control-plane-api.js';
import { handlePhase2Api, statusForPhase2Error } from './http/phase2-api.js';
import { handleFreeFirstApi, statusForFreeFirstError } from './http/free-first-api.js';
import { handlePhase31Api, statusForPhase31Error } from './http/phase31-api.js';
import { handlePhase3Api, statusForPhase3Error } from './http/phase3-api.js';
import { handlePhase40PlanApi, statusForPhase40Error } from './http/phase40-plan-api.js';
import { handlePhase40AttemptApi } from './http/phase40-attempt-api.js';
import { handlePhase40CommandCenterApi } from './http/phase40-command-center-api.js';
import { handlePhase41SourceControlApi, statusForPhase41Error } from './http/phase41-source-control-api.js';
import { GovernedWorkspace } from './runtime/governed-workspace.js';
import { FixtureSourceControlAdapter } from './runtime/fixture-source-control-adapter.js';
import { GitHubSourceControlAdapter } from './runtime/github-source-control-adapter.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '..');
const defaultPublicDir = path.join(repoRoot, 'public');
const defaultMigrationsDir = path.join(repoRoot, 'migrations');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

/** @param {{databasePath:string,dataDir:string,publicDir?:string,migrationsDir?:string}} options */
export function createApp(options) {
  const publicDir = options.publicDir ?? defaultPublicDir;
  const migrationsDir = options.migrationsDir ?? defaultMigrationsDir;
  const { db, migrations } = openDatabase({ databasePath: options.databasePath, dataDir: options.dataDir, migrationsDir });
  const workspaceRuntime = new GovernedWorkspace(db, { rootDir: path.join(options.dataDir, 'execution-workspaces') });
  const sourceControlAdapters = {
    fixture: new FixtureSourceControlAdapter(),
    github: new GitHubSourceControlAdapter()
  };

  const status = {
    service: 'workflow-os',
    phase: 'phase-4.1',
    gate: 'governed-source-control-adapter-implemented',
    database: { status: 'ready', migrations }
  };
  assertFoundationStatus(status);

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://local.workflow-os');
      if (request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, status);

      if (url.pathname.startsWith('/api/')) {
        const intakeResult = await handleApi({ request, url, db });
        if (intakeResult) return sendJson(response, intakeResult.status, intakeResult.body);
        const phase31Result = await handlePhase31Api({ request, url, db });
        if (phase31Result) return sendJson(response, phase31Result.status, phase31Result.body);
        const phase3Result = await handlePhase3Api({ request, url, db });
        if (phase3Result) return sendJson(response, phase3Result.status, phase3Result.body);
        const phase41Result = await handlePhase41SourceControlApi({ request, url, db, workspaceRuntime, adapters: sourceControlAdapters });
        if (phase41Result) return sendJson(response, phase41Result.status, phase41Result.body);
        const phase40PlanResult = await handlePhase40PlanApi({ request, url, db });
        if (phase40PlanResult) return sendJson(response, phase40PlanResult.status, phase40PlanResult.body);
        const phase40AttemptResult = await handlePhase40AttemptApi({ request, url, db });
        if (phase40AttemptResult) return sendJson(response, phase40AttemptResult.status, phase40AttemptResult.body);
        const phase40CommandCenterResult = handlePhase40CommandCenterApi({ request, url, db });
        if (phase40CommandCenterResult) return sendJson(response, phase40CommandCenterResult.status, phase40CommandCenterResult.body);
        const controlPlaneResult = await handleControlPlaneApi({ request, url, db });
        if (controlPlaneResult) return sendJson(response, controlPlaneResult.status, controlPlaneResult.body);
        const phase2Result = await handlePhase2Api({ request, url, db });
        if (phase2Result) return sendJson(response, phase2Result.status, phase2Result.body);
        const freeFirstResult = await handleFreeFirstApi({ request, url, db });
        if (freeFirstResult) return sendJson(response, freeFirstResult.status, freeFirstResult.body);
        return sendJson(response, 404, { error: 'not_found' });
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'method_not_allowed' });
      return serveStatic(publicDir, url.pathname, request.method === 'HEAD', response);
    } catch (error) {
      console.error(error);
      if ((request.url ?? '').startsWith('/api/')) {
        const statusCode = Math.max(statusForApiError(error), statusForPhase31Error(error), statusForPhase3Error(error), statusForPhase41Error(error), statusForPhase40Error(error), statusForControlPlaneError(error), statusForPhase2Error(error), statusForFreeFirstError(error));
        return sendJson(response, statusCode || 500, { error: error instanceof Error ? error.message : 'request_failed' });
      }
      return sendJson(response, 500, { error: 'internal_error' });
    }
  });

  return { server, close() { db.close(); } };
}

function serveStatic(publicDir, pathname, headOnly, response) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(publicDir, relativePath);
  const root = path.resolve(publicDir);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return sendJson(response, 403, { error: 'forbidden' });
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return sendJson(response, 404, { error: 'not_found' });
  const body = fs.readFileSync(candidate);
  response.writeHead(200, { 'content-type': contentTypes.get(path.extname(candidate)) ?? 'application/octet-stream', 'content-length': body.byteLength, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  response.end(headOnly ? undefined : body);
}

function sendJson(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'content-length': body.byteLength, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  response.end(body);
}
