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

  const status = {
    service: 'workflow-os',
    phase: 'phase-2.1',
    gate: 'free-first-quota-broker-implemented-live-certification-pending',
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
        const controlPlaneResult = await handleControlPlaneApi({ request, url, db });
        if (controlPlaneResult) return sendJson(response, controlPlaneResult.status, controlPlaneResult.body);
        const phase2Result = await handlePhase2Api({ request, url, db });
        if (phase2Result) return sendJson(response, phase2Result.status, phase2Result.body);
        return sendJson(response, 404, { error: 'not_found' });
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'method_not_allowed' });
      return serveStatic(publicDir, url.pathname, request.method === 'HEAD', response);
    } catch (error) {
      console.error(error);
      if ((request.url ?? '').startsWith('/api/')) {
        const statusCode = Math.max(statusForApiError(error), statusForControlPlaneError(error), statusForPhase2Error(error));
        return sendJson(response, statusCode, { error: error instanceof Error ? error.message : 'request_failed' });
      }
      return sendJson(response, 500, { error: 'internal_error' });
    }
  });

  return {
    server,
    close() { db.close(); }
  };
}

function serveStatic(publicDir, pathname, headOnly, response) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(publicDir, relativePath);
  const root = path.resolve(publicDir);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return sendJson(response, 403, { error: 'forbidden' });
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return sendJson(response, 404, { error: 'not_found' });

  const body = fs.readFileSync(candidate);
  response.writeHead(200, {
    'content-type': contentTypes.get(path.extname(candidate)) ?? 'application/octet-stream',
    'content-length': body.byteLength,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  response.end(headOnly ? undefined : body);
}

function sendJson(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': body.byteLength,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  response.end(body);
}
