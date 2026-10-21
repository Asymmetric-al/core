# eve-admin-auth-session-ownership normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-f06ba04c2843f3387935"></a>

## Background Jobs Use A Service Identity With Explicit Initiator Metadata

<!-- BEGIN CONTRACT {"id":"f06ba04c2843f3387935","name":"Background Jobs Use A Service Identity With Explicit Initiator Metadata"} -->

Background jobs, schedules, and system-initiated work MUST run under a **distinct service identity** that
carries **explicit initiator metadata** naming the accountable human or trigger. System work MUST NOT be
attributed to a real admin user without a recorded initiator, so scheduled and system work stays accountable.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:74]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b77bac5cab982504be38"></a>

## The Auth Boundary Grants No New Authority And Keeps Release Disabled

<!-- BEGIN CONTRACT {"id":"b77bac5cab982504be38","name":"The Auth Boundary Grants No New Authority And Keeps Release Disabled"} -->

The auth/session-ownership implementation MUST NOT widen Eve's authority, bypass #417 protected-area,
production-write, or approval limits, or bypass #418 emergency-off precedence. The **release switch MUST stay
off until auth is verified**. This slice MAY add server-side route auth and minimal app-owned session ACL
metadata, but MUST NOT add a live model/provider, operational tool, sandbox, deployment, admin UI, or Next.js
mount. It MUST NOT redefine the audit-record shape (#419), private-memory content (#422), approval/budget
policy (#423), retention/replay policy (#424), or Eve-owned session durability (#425).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d83238b45dabd4a8e9fc"></a>

## Eve Acts As The Current Admin Identity In Mission Control

<!-- BEGIN CONTRACT {"id":"d83238b45dabd4a8e9fc","name":"Eve Acts As The Current Admin Identity In Mission Control"} -->

For admin UI requests, Eve MUST act as the **authenticated current admin user**, so its product actions inherit
that user's **tenant, role, and permissions**. Eve MUST NOT act outside, or elevate beyond, the acting user's
tenant, role, or permissions. Every such admin action MUST be **audited under that acting identity** so the
organization can tell who initiated each operation; the audit-record shape itself remains #419's scope.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:67]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ad6fbe0a96f3141eda57"></a>

## Tenant And User Are Derived From Verified Session Context Only

<!-- BEGIN CONTRACT {"id":"ad6fbe0a96f3141eda57","name":"Tenant And User Are Derived From Verified Session Context Only"} -->

Tenant and user MUST be derived **only from verified route or admin session context**. Tenant or user IDs
supplied by **prompts, model output, tool input, or remote responses MUST never be authority** and MUST be
ignored for identity resolution, so Eve never accepts a tenant or user identity that a prompt or tool claims.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f1307ebb46ad698f674e"></a>

## Session And Governance-Artifact Access Enforces User And Tenant Ownership

<!-- BEGIN CONTRACT {"id":"f1307ebb46ad698f674e","name":"Session And Governance-Artifact Access Enforces User And Tenant Ownership"} -->

Eve MUST enforce **user and tenant ownership** on every session and governance-artifact access path —
**session create, continue, stream, approval response, memory read/write, audit read, and replay/debug artifact
access**. A request whose verified context does not own the target session or artifact MUST be denied, so a
user cannot access another tenant's or another user's durable session or artifacts. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:177]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
