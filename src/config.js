// @ts-check
import path from 'node:path';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4310;
const DEFAULT_DATA_DIR = '.local';

/**
 * @typedef {Object} AppConfig
 * @property {string} host
 * @property {number} port
 * @property {string} dataDir
 * @property {string} databasePath
 */

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @param {string} [cwd]
 * @returns {AppConfig}
 */
export function loadConfig(env = process.env, cwd = process.cwd()) {
  const host = (env.WORKFLOW_OS_HOST ?? DEFAULT_HOST).trim();
  if (!host) throw new Error('WORKFLOW_OS_HOST must not be empty');

  const rawPort = env.WORKFLOW_OS_PORT ?? String(DEFAULT_PORT);
  const port = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('WORKFLOW_OS_PORT must be an integer from 0 to 65535');
  }

  const rawDataDir = (env.WORKFLOW_OS_DATA_DIR ?? DEFAULT_DATA_DIR).trim();
  if (!rawDataDir) throw new Error('WORKFLOW_OS_DATA_DIR must not be empty');

  const dataDir = path.resolve(cwd, rawDataDir);
  return { host, port, dataDir, databasePath: path.join(dataDir, 'workflow-os.sqlite') };
}
