# ADR-020: Phase 1 Gate 1 implementation stack

**Status:** Accepted

## Context

Phase 1 Gate 1 needs the smallest local implementation foundation that can prove a local web UI, API/domain boundary, persistent database, migrations, runtime/schema validation, tests, backup, and reproducible startup without importing a provider platform or building a premature framework stack.

The product is local-first and provider-independent. Gate 1 is not the point to commit the product to React, Next.js, an ORM, Docker, Supabase, Paperclip, Activepieces, or any AI provider merely because those tools may be useful later.

## Decision

Use a deliberately small Node.js foundation:

- Node.js `>=24.15.0`, ESM;
- built-in `node:http` for the local HTTP/API process;
- standard SQLite file storage through built-in `node:sqlite`;
- ordered SQL migrations with SHA-256 drift detection;
- plain HTML/CSS/browser JavaScript for the Gate 1 UI shell;
- `node:test` + `node:assert` for the test harness;
- JSDoc + `// @ts-check` editor contracts and explicit runtime shape guards for Gate 1 schemas;
- no runtime npm dependencies in Gate 1;
- loopback bind (`127.0.0.1`) by default;
- local data under `.local/`, excluded from Git;
- SQLite `VACUUM INTO` backup command for development data.

The database access code is isolated under `src/db/`. Standard SQLite remains the data format; the application must not make Node's driver API part of canonical domain semantics.

## Why

This is the smallest stack that satisfies the Gate 1 proof while keeping startup cheap on a modest local machine and avoiding framework/provider lock-in.

It also makes the first verification path unusually simple: after Node is installed, there is no package installation step and no external service required to run the application or test suite.

## Trade-offs

- The Gate 1 UI is intentionally not a production design system.
- `node:sqlite` is a runtime implementation detail and may be replaced behind the database boundary if its stability or behavior becomes a measured problem.
- Gate 1 uses runtime guards/JSDoc rather than introducing a full schema/compiler stack before canonical Gate 2 entities exist.
- The synchronous SQLite API is acceptable for a single-operator local control plane at this stage; revisit if measured concurrency/latency requires another access strategy.

## Revisit triggers

Revisit this ADR only when evidence shows one of the following:

- Gate 2 domain schemas require stronger generated/static validation;
- UI complexity justifies a client framework;
- concurrent/multi-process writes exceed the safe local SQLite design;
- desktop packaging imposes a better process boundary;
- `node:sqlite` creates a reproducible compatibility/stability problem;
- a change materially improves agent operability or verification without making a provider canonical.

A later framework/ORM choice must remain replaceable and may not redefine Project/WorkItem semantics.
