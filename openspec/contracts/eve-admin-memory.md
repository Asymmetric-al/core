# eve-admin-memory normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-07f7382ed03e0a1afa72"></a>

## Private Admin Memory Is Categorized And Never Authoritative

<!-- BEGIN CONTRACT {"id":"07f7382ed03e0a1afa72","name":"Private Admin Memory Is Categorized And Never Authoritative"} -->

Eve memory MUST start as **private admin memory**, scoped to the admin identity, and organized into
categories for **communication preferences, project working context, and implementation decisions**.
Remembered memory MUST be **advisory only**: it MUST NOT override product intent, repo rules, OpenSpec, or
`AGENTS.md`. Memory MUST NOT be treated as higher authority than verified repo/spec facts.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:116]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:119]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3545f2045a113bc735da"></a>

## Hard Exclusions Keep Sensitive Data Out Of Memory

<!-- BEGIN CONTRACT {"id":"3545f2045a113bc735da","name":"Hard Exclusions Keep Sensitive Data Out Of Memory"} -->

Eve memory MUST **exclude** — never store — secrets, credentials, payment data, donor or customer PII,
private keys, one-time codes, and sensitive tenant facts. This is a **hard boundary at write time**, not a
later redaction pass, so memory cannot become a hidden data leak. The exclusion MUST apply on every write
path, including auto-save.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:124]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0c9cab77b8e253c5b8b8"></a>

## Admin Has Full Memory Control With Change History

<!-- BEGIN CONTRACT {"id":"0c9cab77b8e253c5b8b8","name":"Admin Has Full Memory Control With Change History"} -->

The admin workspace MUST give the admin **full control** over memory: **view, search, edit, delete, disable,
category, scope, and change history**. Edits and deletions MUST be reflected in a **change history** so the
admin can inspect what changed. **Disable** MUST stop future auto-save into a scope/category without
destroying existing entries.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:130]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:126]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1df62edb87a1c8c78b40"></a>

## Future Tenant Memory Is Schema-Ready But Disabled; Access And Retention Enforce Ownership And Grant No Autonomy

<!-- BEGIN CONTRACT {"id":"1df62edb87a1c8c78b40","name":"Future Tenant Memory Is Schema-Ready But Disabled; Access And Retention Enforce Ownership And Grant No Autonomy"} -->

The memory schema MUST be **designed for future tenant-scoped operational memory**, but tenant operational
memory MUST remain **disabled** until its categories, retention, deletion, export, and audit rules are
explicit. Memory **access MUST enforce user and tenant ownership**. Memory **retention** (history and
deleted-entry policy) MUST be controlled **separately** from run-log retention. This capability grants **no
autonomy**: it MUST NOT widen Eve's powers, MUST NOT override #417 protected-area or approval rules, and MUST
remain subordinate to OpenSpec and `AGENTS.md`.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:138]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
[VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
