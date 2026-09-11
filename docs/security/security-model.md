# Security Model

## Objective

Workflow OS may coordinate client systems, repositories, credentials, paid AI execution, and production actions. Security/isolation are foundational requirements.

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
12. fail closed on unknown authorization semantics.

## Workspace isolation

Every security-relevant canonical entity is Workspace-scoped. For external client work the default is one Client per Workspace.

Authorization must be enforced at the data/action boundary, not by prompt instruction alone.

## Provider credentials

A provider's own tenant boundary is not enough. The integration/control credential used by Workflow OS must have documented actual permissions and acceptable blast radius.

If a provider cannot safely scope control credentials across clients, evaluate stronger per-Workspace instance/account separation.

## Agents/tools

Each Assignment declares an allowlist of tools/capabilities. Role title does not grant permission.

No wildcard production credentials by default.

## Secrets

Canonical Project/WorkItem/ProjectPack/WIR data contains logical refs such as `client-a.supabase.production`, never the reusable secret itself.

A runtime adapter resolves the reference into minimum necessary run-bound/provider binding where possible.

Secret access should be auditable and revocable. Redaction must be systematic, not dependent on workers remembering.

## Paid execution

Spend authorization is a security/authority boundary. Model reasoning cannot grant itself money.

## Generic HTTP / SSRF

Any generic network action must enforce destination policy and block metadata/internal control targets unless explicitly allowed.

## Application baseline

Account for broken authorization, injection, unsafe rendering, CSRF/session risks when applicable, CORS, rate/resource abuse, dependency vulnerabilities, TLS/secure headers, backup confidentiality, and migration safety.

## Public repository

Use synthetic examples only.
