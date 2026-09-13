# Phase 3.3 — Governed Local Execution Workspace

## Status

Implemented and CI-verified as part of the Phase 3 end-to-end golden path.

## Objective

Give an authorized worker a real place to create and exercise Project files without turning model access into unrestricted host or GitHub authority.

The workspace is deliberately separate from:

- the Workflow OS source repository;
- unrelated local repositories/files;
- credential stores;
- a shared Git remote;
- deployment/production targets;
- external communication systems.

## Authority model

The first Phase 3 execution workspace is an **R1 isolated/reversible synthetic environment**.

Its policy is fixed to:

- synthetic data only;
- local per-Project workspace under a Workflow-OS-configured root;
- loopback-only application networking;
- bounded file operations;
- deny-by-default command classes;
- no shared-remote authority;
- no production/deployment authority;
- no credential-store access;
- no external messaging;
- no package publishing;
- no privilege elevation or host configuration mutation.

Local R1 authority never becomes GitHub R2 authority merely because a worker needs another capability.

## Filesystem enforcement

`src/runtime/governed-workspace.js` owns filesystem enforcement outside model reasoning.

A worker cannot choose an arbitrary host root. The configured execution root is resolved first, then every Project path is checked against it.

The runtime rejects:

- `..` parent traversal;
- absolute-path escape;
- targets outside the configured root;
- symlink-component escape;
- workspace-root deletion;
- deletion of non-file/symlink targets through the bounded file-delete path.

Allowed operations are limited to read/create/update and bounded deletion inside the Project workspace.

Every generated file is represented in a manifest containing its relative path, size and SHA-256 digest.

## Command enforcement

The first golden path does not expose a general shell.

Allowed command classes are currently:

- `syntax_check` — executes the configured Node runtime with `--check` against a file inside the workspace;
- `test` — executes Node's test runner against a file inside the workspace;
- `local_server` — starts the known local application entry point for loopback verification.

Unknown/arbitrary command classes fail closed.

Commands run with `shell: false` and a minimal environment rather than inheriting the operator's complete environment/credentials.

## Process lifecycle

Local servers are attributable to an exact Workspace/Project execution record. The runtime records:

- process/record ID;
- Project and execution-workspace identity;
- associated WorkItem when supplied;
- command class;
- PID for the spawned server;
- stdout/stderr;
- start/finish state;
- exit code.

Cleanup/stop operations act only on process objects created and owned by that runtime instance for that Workspace/Project. The implementation does not scan for or kill unrelated host processes.

## Network boundary

The synthetic application binds only to `127.0.0.1` on an ephemeral port.

The governed workspace policy states `loopback_only`. The certification artifact contains no Meta, CRM, email, SMS, analytics or production endpoint.

Phase 3.3 therefore proves local application exercise, not production-network autonomy.

## Tests

Automated tests prove that:

- valid workspace-local write/read succeeds;
- parent traversal is rejected;
- absolute-path escape is rejected;
- symlink escape is rejected;
- an arbitrary `shell` command class is rejected;
- an allowed syntax check executes successfully;
- the persisted workspace policy remains loopback-only.

The Phase 3.5 certification additionally proves that a real generated application can be started and stopped through this governed process boundary.

## Exit condition

Phase 3.3 is complete when Workflow OS—not a prompt—can enforce where local implementation files live and which local process actions are available, while preserving a hard boundary between isolated local work and shared/external effects.

The next dependency is Phase 3.4: prove completion from observable deterministic and real-flow evidence, with bounded repair and delivery reconciliation.
