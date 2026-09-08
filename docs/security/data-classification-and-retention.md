# Data Classification and Retention

Workflow OS should retain the minimum data required to operate, diagnose, and evidence workflows.

## Classification

### Public
Information intentionally public and safe to use in repository examples.

### Internal
Non-public operational metadata whose disclosure has limited impact.

### Confidential
Client/business information, workflow details, communications, or business records whose disclosure could cause meaningful harm.

### Restricted
Highly sensitive information requiring the strongest handling policy, such as reusable authentication material, regulated/high-impact business records, or data explicitly designated restricted by a client/policy.

## Default rules

- Public repository artifacts use **Public synthetic data only**.
- WIR stores references and schemas rather than reusable authentication material.
- Logs favor metadata/redacted summaries over complete payloads.
- A workflow declares the highest data class it is expected to process.
- A tool declares which data classes it is allowed to receive.
- Sending data to a provider requires policy compatibility with the workflow's data class.

## Retention

Retention should be configurable by data category, not “keep everything forever.”

Candidate classes:

- workflow definitions/versions: long-lived while needed for audit/history
- execution metadata: according to client/support requirements
- raw payloads: avoid by default; short-lived only when explicitly required
- AI inputs/outputs: retain only what evaluation/audit requires and policy permits
- incident evidence: retain according to incident/client policy
- integration material: managed by the designated secure store, not WIR

## Deletion

Deletion must respect workflow/version audit requirements and client obligations. Deleting a client workspace later must have an explicit plan for backups, logs, and external engine artifacts.

## Client requirements

Before production client use, document applicable contractual, privacy, residency, or regulatory requirements. Workflow OS does not claim universal regulatory compliance merely by implementing this classification model.
