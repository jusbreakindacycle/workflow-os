# Repository Security Policy

Workflow OS is currently public and specification-only.

## Public-repository rule

Use synthetic examples only. Do not commit real client/customer content or reusable authentication material.

## Report a repository security concern

Until a private disclosure process is configured, do not post exploitable details in a public issue. The repository owner should configure GitHub private vulnerability reporting before production use.

## Product security model

See `docs/security/security-model.md` for the engineering contract.

Core rules:

- least privilege
- workspace isolation
- indirect integration references in WIR
- sensitive-value redaction
- explicit action authorization
- highest-risk actions require human approval
- inbound authenticity checks where supported
- safe outbound-request controls
- auditable sensitive actions
