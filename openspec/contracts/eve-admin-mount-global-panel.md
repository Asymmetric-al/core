# eve-admin-mount-global-panel normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-cb4c52e75e5988388e1f"></a>

## The Admin Mount Uses The Eve Next.js Integration Only After Compatibility Is Proven

<!-- BEGIN CONTRACT {"id":"cb4c52e75e5988388e1f","name":"The Admin Mount Uses The Eve Next.js Integration Only After Compatibility Is Proven"} -->

The admin mount MUST use Eve's Next.js integration **only after compatibility with the repo's installed Next.js
version is proven**; otherwise the mount MUST be **explicitly blocked**. The installed version is `next` **16.3.3**.
Compatibility MUST be proven against 16.3.3 or the mount stays blocked. The Eve runtime MUST remain a **dedicated,
Node-isolated workspace package**, and if Eve requires a newer Next.js release than the repo has installed, the
Next.js upgrade MUST be treated as a **separate prerequisite**, not folded into this mount.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:203]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: package.json:179]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-71d44b642db415dcede4"></a>

## The Mount Is Gated By Verified Session Auth And Enforces Session Ownership

<!-- BEGIN CONTRACT {"id":"71d44b642db415dcede4","name":"The Mount Is Gated By Verified Session Auth And Enforces Session Ownership"} -->

The admin mount MUST be **gated by the #426 admin auth boundary**: tenant and user MUST derive from **verified
session context only** — never from prompts, model output, or tool input — and Eve **session create, continue,
and stream** access through the mount MUST **enforce ownership** so a user cannot access another tenant's or
user's durable session. The mount surfaces and inherits that auth boundary and MUST NOT redefine it.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b19ba66a9fa6420d69f5"></a>

## The Mount And Panel Never Silently Send Raw Or Sensitive Data

<!-- BEGIN CONTRACT {"id":"b19ba66a9fa6420d69f5","name":"The Mount And Panel Never Silently Send Raw Or Sensitive Data"} -->

The mount and panel MUST NOT **silently send** raw records, payment data, donor details, table rows, or
sensitive form values. Global panel tests MUST verify **both** that basic page context is included **and** that
raw records, payment data, donor details, table rows, and sensitive form values are **not** silently included,
so the charter data boundary holds at this admin-visible surface.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-92ecf796620699d47902"></a>

## The Mount Exposes The #427 Shell On The #425 Runtime Without Redefining Them

<!-- BEGIN CONTRACT {"id":"92ecf796620699d47902","name":"The Mount Exposes The #427 Shell On The #425 Runtime Without Redefining Them"} -->

The mount MUST **expose the #427 operations-first workspace shell** and **run on the #425 standalone Eve
runtime**; it renders and hosts them and MUST NOT **redefine** the shell's panel set, decision-summary rule, or
role-gating (#427), nor the runtime's workspace-package or model-policy integration (#425). The global panel is
a lightweight companion to that shell, not a re-implementation of it.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6163c5f117bac5745c70"></a>

## The Mount And Panel Grant No New Authority

<!-- BEGIN CONTRACT {"id":"6163c5f117bac5745c70","name":"The Mount And Panel Grant No New Authority"} -->

The live mount and global panel MUST remain a **HITL** surface, and the **release switch MUST stay off until
verified**. The panel MUST NOT add live tools, provider credentials, production data fetchers, or Supabase
schema. It MUST NOT widen Eve's authority, MUST NOT
bypass #417 protected-area/approval limits, #418 emergency-off precedence, or the #426 auth gate, and MUST NOT
redefine the #425 runtime, #426 auth boundary, #427 shell, or the #418–#424 governance slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fd78c9cff2fd9484af9e"></a>

## The Global Panel Receives Basic Page Context Only

<!-- BEGIN CONTRACT {"id":"fd78c9cff2fd9484af9e","name":"The Global Panel Receives Basic Page Context Only"} -->

The global panel MUST receive **basic page context only**: **route, page identity, selected tenant or org, and
safe UI state**. It MUST NOT **automatically receive** table rows, donor details, payment data, raw form
values, or sensitive records. Basic page context lets Eve know where the admin is without ingesting record
contents. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:205]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
