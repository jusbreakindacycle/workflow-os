// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { loadConfig } from '../src/config.js';

const config = loadConfig();
if (!fs.existsSync(config.databasePath)) throw new Error(`Database does not exist: ${config.databasePath}`);

const backupDir = path.join(config.dataDir, 'backups');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replaceAll(':', '-');
const target = path.join(backupDir, `workflow-os-${stamp}.sqlite`);
const sqlPath = target.replaceAll("'", "''");

const db = new DatabaseSync(config.databasePath, { timeout: 5000 });
db.exec(`VACUUM INTO '${sqlPath}'`);
db.close();
console.log(`Backup written: ${target}`);
