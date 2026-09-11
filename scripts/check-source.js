// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src', 'scripts', 'test', 'public'];
let checked = 0;

for (const root of roots) walk(path.join(repoRoot, root));
for (const json of ['package.json', 'jsconfig.json']) JSON.parse(fs.readFileSync(path.join(repoRoot, json), 'utf8'));
console.log(`Source check passed (${checked} JavaScript files + JSON parse checks).`);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const result = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
    if (result.status !== 0) {
      process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
    checked += 1;
  }
}
