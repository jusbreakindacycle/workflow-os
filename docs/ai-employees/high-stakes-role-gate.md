# High-Stakes AI Employee Role Gate

## Purpose

Some proposed AI Employee roles can materially affect a person's rights, livelihood, health, safety, access to essential services, or significant financial/legal interests.

Those roles require a stronger governance gate than ordinary operations automation.

## High-stakes domains

Examples include:

- employment/hiring, promotion, performance, discipline, or termination;
- credit/lending/insurance eligibility or pricing;
- medical/health decisions or recommendations used for care;
- legal advice, legal commitments, compliance determinations with material consequences;
- physical safety/security decisions;
- significant financial transactions or investment decisions;
- education admissions or similar access decisions;
- government/public-benefit eligibility or enforcement;
- other regulated or rights-affecting decisions.

This list is illustrative, not exhaustive.

## Gate rule

Every AI Employee Spec declares:

- `high_stakes_domains`;
- whether `special_review_required` is true.

If any high-stakes domain applies, special review must be true.

## Special review

Before implementation/promotion, obtain the appropriate domain, legal/compliance, security/privacy, and human-process review for the actual client and jurisdiction.

Workflow OS does not claim that a generic technical control automatically satisfies sector-specific law or professional obligations.

## Default autonomy posture

For high-stakes roles:

- prefer decision support over autonomous final decisions;
- preserve a meaningful human decision where required/appropriate;
- make evidence and reasoning inputs reviewable at the level needed for the task;
- use least privilege;
- restrict sensitive data;
- define contest/correction/escalation paths where applicable;
- use stricter evaluation and monitoring;
- avoid relying on model confidence as authority.

R3 actions remain human-approved under the global risk model.

## Prohibited shortcut

Do not approve a high-stakes role merely because:

- the model performs well on a demo;
- a vendor markets the capability;
- a human can theoretically intervene later;
- the role is labeled “assistant” rather than “decision maker.”

Review the actual effect of the system.

## Human impact

Workflow OS should not be used to create covert employee surveillance or opaque scoring systems simply because the AI Employee concept exists.

When a role affects humans, explicitly identify:

- who is affected;
- what decision/action impacts them;
- how errors are detected/corrected;
- what human owner is accountable;
- whether disclosure/appeal/review is required by client policy or law.

## Promotion

High-stakes roles may require a stricter lifecycle than the generic Test -> Shadow -> Supervised -> Active flow.

A client/domain-specific policy may permanently cap the role at Shadow or Supervised for certain decisions.
