# Windows PowerShell — Free-First Provider Setup

This procedure is intentionally written for a **zero-paid-spend** setup. Do not paste API keys into ChatGPT, GitHub, `.env`, Markdown files, screenshots, issues, or PR comments.

## 1. Install and authenticate Google Antigravity CLI

Open a normal Windows PowerShell window and run the official installer:

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
```

Close/reopen PowerShell if `agy` is not immediately found, then run:

```powershell
agy
```

Complete Google's interactive sign-in with the Google account you want to use for Antigravity. Exit the TUI after authentication.

Verify the installed model catalog:

```powershell
agy models
```

Verify quota visibility:

```powershell
agy -p /usage --output-format text
```

## 2. Confirm paid-credit fallback is off

Inside `agy`, open:

```text
/settings
```

Confirm **Use G1 Credits** is **Off**.

The persistent settings file is normally:

```text
%USERPROFILE%\.gemini\antigravity-cli\settings.json
```

The official CLI default for `useG1Credits` is `false`, but the Free-First preflight refuses certification when it finds the setting explicitly enabled.

Do not enable automatic paid-credit overages for a zero-spend Workflow OS configuration.

## 3. Configure an independent free provider

Full certification requires Antigravity plus a second independent real provider.

### Preferred zero-price fallback: OpenRouter Free Models Router

Create a normal OpenRouter account/key and use only the `openrouter/free` route configured by Workflow OS. Do not replace it with a paid model ID.

### Higher free-rate-limit option: Groq Free Plan

Create a Groq account/API key and keep the account on the **Free Plan**. Workflow OS cannot independently guarantee that you will not later upgrade that external account, so it requires a separate explicit local acknowledgment before treating Groq as a zero-incremental route.

You may configure both. Workflow OS can then rotate among Antigravity, Groq Free Plan, and OpenRouter Free according to capability/quota state.

## 4. Put keys only in the current PowerShell process

This helper accepts a secret without echoing it and stores it only in the current process environment:

```powershell
function Set-SecretProcessEnv {
    param([Parameter(Mandatory=$true)][string]$Name)
    $secure = Read-Host "Enter $Name" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        [Environment]::SetEnvironmentVariable($Name, $plain, 'Process')
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}
```

For OpenRouter:

```powershell
Set-SecretProcessEnv OPENROUTER_API_KEY
```

For Groq:

```powershell
Set-SecretProcessEnv GROQ_API_KEY
$env:WORKFLOW_OS_GROQ_FREE_PLAN_ACK = 'yes'
```

Set the Groq acknowledgment only if that key really belongs to a Groq Free Plan account.

## 5. Preflight before consuming model quota

From the Workflow OS repository:

```powershell
git switch main
git pull
npm run verify
npm run phase21:preflight
```

Preflight checks:

- Antigravity CLI can discover models;
- Antigravity quota can be queried;
- paid-credit fallback is not enabled;
- a second independent free provider is present;
- secret **presence** only, never secret values.

A preflight does not execute the representative Project WorkItem.

## 6. Run full free live certification

Only after preflight reports ready:

```powershell
$env:WORKFLOW_OS_FREE_FIRST_RUN = 'yes'
npm run phase21:certify
```

The harness creates a fresh synthetic local SQLite certification database, starts a loopback Antigravity bridge, discovers the current Antigravity model catalog, records quota state, executes one bounded synthetic WorkItem with independent real verification, and attempts the cross-provider portability drill.

It asserts that its certification Workspace produced:

```text
SpendEnvelope count = 0
CostRecord count    = 0
```

The opt-in flag authorizes **free quota consumption**, not paid spend.

## 7. Clear process secrets after the run

```powershell
Remove-Item Env:WORKFLOW_OS_FREE_FIRST_RUN -ErrorAction SilentlyContinue
Remove-Item Env:OPENROUTER_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:GROQ_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:WORKFLOW_OS_GROQ_FREE_PLAN_ACK -ErrorAction SilentlyContinue
```

Then close that PowerShell window.

## Automatic switching policy

Default Workflow OS policy is intentionally conservative:

```text
quota >= 40%    -> normal use
15% to 40%      -> conserve
10% to 15%      -> reserve scarce capacity
below 10%       -> stop ordinary routing on that quota bucket
```

Routine work receives an economy-model preference. Complex/critical work may receive a stronger-model preference while capacity remains.

If a route fails or becomes exhausted, Phase 2 may re-broker to another eligible Free-First route. It must not silently enter a paid route.

If no independent free verifier remains, the correct result is **Needs My Attention / wait for quota reset**, not self-verification and not automatic payment.

## Troubleshooting

### `agy` not found

Restart PowerShell after installation. The Windows installer normally adds the Antigravity CLI user binary directory to PATH.

### Authentication required

Run interactive `agy` once and complete sign-in. Headless mode uses the cached authenticated session.

### Free-First certification says second provider is missing

Set either `OPENROUTER_API_KEY`, or `GROQ_API_KEY` together with `WORKFLOW_OS_GROQ_FREE_PLAN_ACK=yes`, in the current PowerShell process.

### Antigravity quota exhausted

Do not enable credits to make the test pass. Let the quota reset or use the independent eligible free route for work that does not require Antigravity-specific certification.

### Provider returns 429 / rate limit

Workflow OS records/falls back where another eligible free route exists. Do not add an unbounded retry loop: failed free requests may still consume a provider's request allowance.

## Provider documentation used by this implementation

- Antigravity CLI install/auth: <https://antigravity.google/docs/cli/install/>
- Antigravity headless mode: <https://antigravity.google/docs/cli/headless/>
- Antigravity models: <https://antigravity.google/docs/models>
- Antigravity quota `/usage`: <https://antigravity.google/docs/cli/commands/usage>
- Antigravity settings/credit control: <https://antigravity.google/docs/cli/settings/>
- Groq Responses API: <https://console.groq.com/docs/responses-api>
- Groq rate limits: <https://console.groq.com/docs/rate-limits>
- OpenRouter Free Models Router: <https://openrouter.ai/openrouter/free>
- OpenRouter Responses API: <https://openrouter.ai/docs/api/api-reference/responses/create-responses>
