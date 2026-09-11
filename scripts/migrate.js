// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/database.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = loadConfig();
const { db, migrations } = openDatabase({ databasePath: config.databasePath, dataDir: config.dataDir, migrationsDir: path.join(repoRoot, 'migrations') });
console.log(`Database ready: ${config.databasePath} (${migrations} migrations)`);
db.close();
