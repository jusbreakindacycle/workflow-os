// @ts-check
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertFoundationStatus } from './domain/foundation-status.js';
import { openDatabase } from './db/database.js';

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
    phase: 'phase-1',
    gate: 'gate-2-canonical-entities',
    database: { status: 'ready', migrations }
  };
  assertFoundationStatus(status);

  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://local.workflow-os');
      if (request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, status);
      if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'method_not_allowed' });
      return serveStatic(publicDir, url.pathname, request.method === 'HEAD', response);
    } catch (error) {
      console.error(error);
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
