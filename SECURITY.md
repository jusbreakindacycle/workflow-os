# Security Policy

This repository is currently public and specification-first.

## Do not commit

- real client names/data unless deliberately approved for publication;
- credentials, tokens, API keys, cookies, private keys, passwords;
- production database values or payloads;
- invoices/payment identifiers;
- proprietary client SOPs/contracts;
- private model/runtime credentials;
- reusable secret values in examples, Project Packs, WIR, prompts, logs, or fixtures.

Use synthetic fixtures only.

## Product security principles

Workflow OS is expected to coordinate privileged tools and client systems. Security is therefore part of the product contract from the first implementation phase.

Required principles:

- Workspace isolation;
- least privilege;
- server-side authorization;
- explicit side-effect policy;
- bounded agent/tool capability;
- secret references rather than raw values;
- auditability for high-impact actions;
- redaction/minimal retention;
- human approval for consequential actions;
- provider credential blast-radius analysis;
- no paid or destructive action through hidden agent authority.

See `docs/security/security-model.md`.
