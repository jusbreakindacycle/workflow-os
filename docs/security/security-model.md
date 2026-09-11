# Security Model

## Objective

Workflow OS may coordinate client systems, repositories, credentials, paid execution, production actions, and untrusted AI/retrieved content. Security/isolation are foundational requirements.

See `agent-threat-and-data-policy.md` for agent threats, data classification, routing compatibility, and retention.

## Principles

1. least privilege;
2. Workspace isolation;
3. capability-scoped tool authority;
4. explicit side-effect policy;
5. human approval for highest consequence;
6. secret references/bindings, not raw values in Project artifacts;
7. sensitive-data minimization/redaction;
8. auditable consequential actions;
9. authenticated/verifiable inbound events;
10. safe outbound network behavior;
11. provider credential blast-radius analysis;
12. untrusted content never grants authority;
13. fail closed on unknown authorization/data-routing semantics.

## Workspace isolation

Every security-relevant canonical entity is Workspace-scoped. For external client work the default is one Client per Workspace. Authorization is enforced at the data/action boundary, not by prompt instruction alone.

## Provider credentials

Provider tenancy is insufficient by itself. Workflow OS control credentials require documented permissions and acceptable blast radius; stronger per-Workspace account/instance isolation is evaluated when safe scoping is unavailable.

## Agents/tools

Each Assignment declares an allowlist of tools/capabilities. Role title does not grant permission. Delegation may only narrow authority unless a new authorized Assignment is created. No wildcard production credentials by default.

## Secrets

Canonical Project/WorkItem/ProjectPack/WIR data contains logical secret/integration references, never reusable secret values. Runtime adapters resolve minimum necessary run-bound/provider bindings where possible. Access should be auditable/revocable and systematically redacted.

## Context minimization

A provider/runtime receives only the minimum authorized Context Slice for the Assignment. A Project Pack reference does not grant blanket permission to transmit every Project/commercial artifact to a model/provider.

## Paid execution

Spend authorization is a security/authority boundary. Model reasoning cannot grant itself money.

## Generic HTTP / SSRF

Generic network actions enforce destination policy and block metadata/internal control targets unless explicitly allowed.

## Application baseline

Account for broken authorization, injection, unsafe rendering, CSRF/session risks when applicable, CORS, rate/resource abuse, dependency vulnerabilities, TLS/secure headers, backup confidentiality, migration safety, local-data-at-rest policy, and safe localhost/network exposure.

## Before real client use

Define/test local database and backup protection, secret-store integration, provider data-class compatibility, retention/deletion, and canonical-state recovery.

## Public repository

Use synthetic examples only.
