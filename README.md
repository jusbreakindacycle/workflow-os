# Workflow OS

Workflow OS is a **spec-first automation engineering control plane** for discovering, modeling, testing, deploying, observing, and reusing deterministic, AI-assisted, agentic, and human-in-the-loop workflows across clients and execution engines.

## Current status

**Phase 0 — Product and engineering contract. No application code yet.**

The repository is intentionally being defined before implementation so that future coding work in VS Code + Codex is constrained by an explicit product goal, MVP boundary, workflow model, architecture decisions, reliability/security policies, tests, and acceptance criteria.

Phase 0 work is developed through reviewable pull requests. Until Phase 0 is approved, implementation directories such as `src/`, `apps/`, `services/`, production infrastructure, and package-manager scaffolding should not be introduced.

## Public-repository rule

This repository is currently public. Do **not** commit client names, client data, credentials, tokens, secrets, private workflow payloads, proprietary SOPs, or other confidential material.

## Navigation

After the Phase 0 specification PR is merged, start with:

1. `AGENTS.md`
2. `docs/index.md`
3. `docs/product/goal.md`
4. `docs/product/scope-mvp.md`
5. `ARCHITECTURE.md`
6. `docs/decisions/index.md`
7. `docs/testing/acceptance-criteria.md`

## Core principle

> Model once, execute through the right engine, govern everything from one place.
