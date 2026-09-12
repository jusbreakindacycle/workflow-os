// @ts-check
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverAntigravityModels, probeAntigravityUsage } from '../src/runtime/antigravity-bridge.js';

const settingsPath = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'settings.json');
const settings = readSettings(settingsPath);
if (settings.useG1Credits === true) fail(`Antigravity paid-credit fallback is enabled in ${settingsPath}. Set Use G1 Credits to off before Free-First certification.`);

let models;
let usage;
try {
  models = await discoverAntigravityModels();
  usage = await probeAntigravityUsage();
} catch (error) {
  fail(`Antigravity preflight failed: ${error instanceof Error ? error.message : String(error)}. Install/authenticate AGY CLI first; no API key belongs in this repository.`);
}

const hasGroq = Boolean(process.env.GROQ_API_KEY);
const groqAcknowledged = process.env.WORKFLOW_OS_GROQ_FREE_PLAN_ACK === 'yes';
const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
const independentFreeProviderReady = hasOpenRouter || (hasGroq && groqAcknowledged);

const report = {
  status: independentFreeProviderReady ? 'ready_for_full_free_certification' : 'antigravity_ready_second_provider_needed',
  zeroSpendGuards: {
    antigravityUseG1Credits: settings.useG1Credits === true ? 'enabled' : 'disabled_or_default_off',
    paidFallbackAllowed: false,
    groqKeyPresent: hasGroq,
    groqFreePlanAcknowledged: groqAcknowledged,
    openrouterKeyPresent: hasOpenRouter
  },
  antigravity: {
    authenticated: true,
    models: models.map((model) => ({ slug: model.slug, label: model.label, tier: model.tier })),
    quota: usage.quotas,
    quotaRawPreview: String(usage.raw ?? '').slice(0, 1200)
  },
  fullCertification: {
    requires: 'Antigravity plus at least one independent free API route (OpenRouter free router, or Groq Free Plan explicitly acknowledged).',
    ready: independentFreeProviderReady
  },
  secrets: 'Only presence is reported. Key values are never printed or persisted.'
};

console.log(JSON.stringify(report, null, 2));
if (!independentFreeProviderReady) process.exitCode = 2;

function readSettings(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail(`Invalid Antigravity settings JSON: ${filePath}`);
    return parsed;
  } catch (error) {
    fail(`Cannot read Antigravity settings: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function fail(message) { console.error(message); process.exit(1); }
