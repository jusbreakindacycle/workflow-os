# Local Development — Phase 1 Gate 1

## Purpose

This is the reproducible local startup/verification path for the first executable Workflow OS slice.

Gate 1 proves only the application shell, local API/domain boundary, SQLite persistence/migrations, runtime schema guard, backup path, and test harness. It does not implement Projects/WorkItems yet.

## Requirements

- Node.js `>=24.15.0`.
- No database server, Docker, AI provider, Paperclip, Activepieces, GitHub credential, or paid service is required.
- Gate 1 has no runtime npm dependencies, so there is no package-install step.

## Start

From the repository root:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4310
```

The server automatically creates `.local/workflow-os.sqlite` and applies pending migrations.

For watch mode:

```bash
npm run dev
```

## Verify

```bash
npm run verify
```

This performs JavaScript syntax/JSON checks and the Node test suite.

The current tests cover safe local configuration defaults, invalid configuration, persistent/idempotent SQL migrations, local HTTP server startup, `/api/health`, and static UI serving.

## Database / migrations

```bash
npm run db:migrate
```

Migration files live under `migrations/` and are applied in lexical numeric order. The runner stores a SHA-256 for every applied file and stops if an already-applied migration is later edited. Add a new migration instead of editing an applied one.

## Development backup

```bash
npm run db:backup
```

Backups are written under `.local/backups/` using SQLite `VACUUM INTO`, avoiding a blind copy of a live WAL-backed file. `.local/` is Git-ignored.

## Configuration

Optional environment variables:

```text
WORKFLOW_OS_HOST=127.0.0.1
WORKFLOW_OS_PORT=4310
WORKFLOW_OS_DATA_DIR=.local
```

The default host is loopback. Exposing the service beyond the local machine is not part of Gate 1.

## Gate 1 evidence

A Gate 1 review should record:

```bash
node --version
npm run verify
npm run db:migrate
npm run db:backup
```

and confirm that the UI loads and `/api/health` reports the database as ready.
