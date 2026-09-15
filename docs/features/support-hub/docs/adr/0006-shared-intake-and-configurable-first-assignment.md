# Shared intake and configurable first assignment

**Status:** Fully founder-ratified Phase 26 D6, 10 September 2026, including every amendment, adjustment, change and update. The founder selected A, Shared Unassigned intake as default, with common tenant configuration. D6-R01–R20, P01–P22, all 23 review categories, the full configuration blueprint and adopted evidence corrections are ratified in full. D1–D5 remain fully ratified. This is a grooming ADR, not a formal specification or implemented behavior.

## Decision

New Support inboxes default to Shared: safe new conversations stay visibly Unassigned in their responsible inbox with explicitly named human coverage until staff claim/assign. Tenants can choose Round-robin, which takes turns, or Balanced, which chooses the eligible person with the fewest assigned Open Support conversations in that tenant, with rotating ties. A one-person automatic pool covers fixed-person needs.

Use qualified staff/Support-team operational membership and current Phase12 identity/access; membership grants no new authority. Coverage can share the same people association without a new steward role. A candidate-pool team is not implicitly the responsible conversation team. Validate the effective person/team relationship even when team is preserved by a person-only change.

Receive new Support assignments is an explicit per-person/tenant flag, Off until deliberately enabled, independent of browser/login/presence. An optional positive Automatic assignment limit counts complete tenant-wide assigned D3 Open, including deferral; No limit is explicit and Waiting responsibilities remain visible. Every automatic path shares the gate. Existing reopened/manual work may exceed it without loss, unassignment or false status changes.

## Why this tradeoff

Shared avoids assuming a staffing pattern before the tenant configures it and supports deliberate triage. It requires real coverage and complete discoverability. Automatic rotation is the strongest first-use alternative for immediate individual ownership; Balanced accommodates uneven actionable counts but neither estimates effort. All three are complete capabilities to qualify, not disabled prototypes. Common pool, receiving and limit controls provide flexibility without a workforce system or another rules/CRM platform.

## Invariants and corrections

Specific ordered initial-assignment rules precede the default through Phase34 vocabulary and permitted owner facts. First match gives one typed result; consequential Unknown never falls through as false. Shared default can coexist with automatic specific rules. Elapsed-wait predicates only apply to pending automatic initial intents using original elapsed UTC age, including Pause; no timer later adopts completed Shared work.

One durable initial-source identity is distinct from a null assignee. Shared-by-policy is a completed manual disposition; pending automatic work is recoverable. Claim/manual unassign/move/end fences old automation. Continuations, reopenings, moved/previously owned and historical Shared work do not become new intake. Preserve Core's governing move eligibility/Unassigned behavior and D4 no assign-on-Send.

One canonical conditional transaction owns assignment, actual actor/effective team, history, initial result, current policy/control guards, relevant rotation/capacity admission and durable secondary intents. Complete counts and current authorization are checked at admission; client snapshots, old leases and late receipts cannot overwrite current control. Grants/RLS/service-role/RPC/old writers must preserve this boundary.

Settings publication shows its scope: new plus still-pending automatic first assignments. Re-evaluate that pending scope under current policy, retain initial identity and old/new lineage, and exclude intervening human control. This refines the unanswered Q6 future-only shorthand; it is not a general backlog sweep. Automatic-to-Shared releases now-default pending work; later automatic enable never reenrolls it. Pause all automatic assignments holds every applicable rule/default; Resume rechecks current facts.

Per-inbox Save edits only its own versioned fields. Person receiving/limits are read-only summaries there and have a separate tenant-labelled management save. Self receiving and inbox Pause/Resume are independent immediate commands with pending feedback; inbox Cancel cannot undo them. Use existing Support and shared UI patterns, not duplicate toggles or a new routing dashboard.

Assignment changes no email audience, work state/reminder/ending reason or CRM/giving/care owner fact. CRM context/actions retain owner authorization. Internal assignment history does not emit another outbound communication event; already-qualified staff notifications derive from the effect once through shared capabilities. D6 adds no donor notice or provider call.

## Complete ratified record

- [Exact D6-R01–R20, 23 categories, P01–P22 and ordered operational synthesis](../../grill/phase26-d6-adversarial-review.md)
- [Common configuration, defaults, Save/Pause and staff/admin UX](../../grill/phase26-d6-routing-configuration-blueprint.md)
- [Current Core/primary vendor evidence, independent corrections and proof limits](../../grill/phase26-d6-evidence.md)
- [Six executed pure-selector checks](../../grill/phase26-d6-source-probe.json)
- [Ratified D3 work meanings](0003-explicit-waiting-and-dependable-follow-up.md)
- [Ratified D4 Send behavior](0004-send-with-explicit-work-intent-and-prepared-replies.md)
- [Ratified D5 follow-up ending](0005-explicit-no-response-ending-and-honest-awareness.md)

**Historical disposition: Accept with required amendments. The exact corrected decision and full amendments are now fully founder-ratified.** Six current-source checks demonstrate current selector behavior, not deployed routing/auth/concurrency/UI proof. No implementation, formal OpenSpec/PRD, tickets, publication, provider/DNS configuration or real messages are authorized or performed. Continue to the next unresolved researched question; do not seek repeat D6 approval.

The founder explicitly confirmed: “Yes, I ratify this, including all the amendments, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session.” The full20 clauses and22 proof groups remain unchanged in the accepted review.
