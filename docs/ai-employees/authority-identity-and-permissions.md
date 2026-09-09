# Authority, Identity, and Permissions

## Principle

> Responsibility is not permission.

An AI Employee may be responsible for an outcome while still needing human authorization for certain actions.

## Authority layers

Every proposed action is evaluated against:

1. workspace policy;
2. role-version authority;
3. workflow policy;
4. tool/action risk tier;
5. data classification;
6. runtime/task context;
7. approval state;
8. target-system identity permissions.

The most restrictive applicable rule wins.

## Identity modes

### Role service identity

Use when the business process legitimately belongs to a digital role rather than an individual user.

Examples:

- read a shared operations queue;
- post a system-generated internal update.

The identity must be least-privileged and scoped to the role/workspace.

### Delegated user identity

Use when an action should be attributable to and limited by a specific human user's permissions.

Examples:

- action on behalf of a sales rep;
- accessing a user-specific mailbox.

The AI Employee does not inherit broader rights than the delegating user.

### Mixed explicit

Some tools use a role identity and others use delegated identity.

Each tool/action declares which identity model applies.

## Actor chain

Every sensitive action should preserve an actor chain:

```text
request source / human
 -> Workflow OS task
 -> AI Employee role version
 -> workflow/agent session
 -> tool
 -> target-system principal
```

## No impersonation

The AI Employee must not:

- claim to be a named human;
- send messages that falsely imply human authorship;
- use another user's identity without delegated authorization;
- hide that an action was automated when disclosure is required by client policy/law.

Client-facing communication policy can choose appropriate disclosure wording, but identity records remain accurate internally.

## Capability grants

Tools are allowlisted.

A grant is scoped by:

- workspace;
- role version;
- tool;
- operation;
- risk tier;
- data class;
- target/resource constraints;
- identity mode;
- rate/concurrency;
- approval requirement.

## Forbidden grants

Do not grant:

- wildcard database administration;
- unrestricted shell/host access;
- reusable raw credentials;
- unrestricted arbitrary outbound HTTP;
- cross-workspace search/memory;
- permission to modify the AI Employee's own authority;
- permission to disable audit/policy controls.

## Self-modification

An AI Employee may propose changes to:

- instructions;
- workflows;
- tool set;
- memory policy;
- evaluation cases.

It may not publish those changes to itself.

Material role changes require a new version and human review.

## Approval boundary

R3 remains human-approved.

For R2, the role may act automatically only when:

- the specific action class is allowed;
- the role autonomy class permits it;
- exact parameters satisfy policy;
- no context-specific escalation rule triggers.

## Revocation

Tool/identity access must be revocable without editing historical role versions. Deployment policy can disable or narrow a capability immediately while preserving the historical spec used by past tasks.
