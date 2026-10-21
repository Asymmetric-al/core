# eve-audit-tracer normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-46e6085ada9d3b411bf5"></a>

## Redacted Replay And Debug Packages Never Store Unsafe Raw Data

<!-- BEGIN CONTRACT {"id":"46e6085ada9d3b411bf5","name":"Redacted Replay And Debug Packages Never Store Unsafe Raw Data"} -->

Eve MUST be able to produce a redacted replay/debug package for a failed or reviewable action so failures can
be investigated without storing unsafe raw data. The package MUST carry metadata and a redacted evidence
summary only and MUST NEVER contain payment data, secrets, one-time codes, tenant PII, or raw model
reasoning. The redaction rules MUST be represented in tests. This change defines the package's redacted
**shape**; its retention, expiry, and holds are governed separately (#424).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0cda6204cfc5cb61a1a4"></a>

## Every Meaningful Eve Action Produces A Rich Audit Record

<!-- BEGIN CONTRACT {"id":"0cda6204cfc5cb61a1a4","name":"Every Meaningful Eve Action Produces A Rich Audit Record"} -->

Every meaningful Eve action MUST produce a rich audit record sufficient to reconstruct who or what
initiated the action, which tool or subagent ran, which model role was used, which policy applied, what
evidence was used, and what changed. The record MUST capture at least: actor, initiator, identity mode,
policy, action, target, result, model-role placeholder, and evidence summary. The record MUST be written as
app-owned governance data, not derived from or overridable by prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-70fe792736e41808422d"></a>

## Audit Records Capture Accountable Identity From Verified Context

<!-- BEGIN CONTRACT {"id":"70fe792736e41808422d","name":"Audit Records Capture Accountable Identity From Verified Context"} -->

The audit record MUST capture accountable identity from verified context, never from prompt or tool input:
admin actions MUST be recorded under the acting admin's identity; background jobs MUST be recorded under a
service identity with explicit initiator metadata; and GitHub actions MUST record the bot actor together with
the accountable human or trigger. The recorded identity mode MUST match the identity resolved by the #417
auth boundary and MUST NOT be selectable by prompt or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b16ac06c4ab1d9294495"></a>

## The Audit Tracer Grants No New Authority And Is Subordinate To #417 And #418

<!-- BEGIN CONTRACT {"id":"b16ac06c4ab1d9294495","name":"The Audit Tracer Grants No New Authority And Is Subordinate To #417 And #418"} -->

The audit tracer MUST be record-only: producing an audit record or debug package MUST NOT initiate,
authorize, or widen any autonomous action, and MUST NOT override the #417 contract or the #418 governance
gate. Audit writes MUST go to the app-owned governance store the kernel already governs; the tracer MUST NOT
introduce live autonomous behavior. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
