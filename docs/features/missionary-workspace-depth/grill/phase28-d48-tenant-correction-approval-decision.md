# Phase 28 D48 — tenant-controlled posted-gift correction approval

October 18, 2026. **Q48 answered A; accepted as selected.** The founder chose
**“Let the organization choose”**, adding **“keep flexible for the tenant and
how they want to work.”** This settles C-01's product-policy conflict. Formal
owner reconciliation and implementation qualification remain required.

## Decision

The organization chooses whether staff-initiated corrections to already-posted
gifts require a **different authorized approver**. Follow the P13 light default:
no blanket second-approver requirement, while current capability, required reason,
immutable correction history and independently required risk/money-out controls
continue to apply. If the organization requires independent approval, the
requester cannot satisfy it using another role, profile or session.

Keep the flexibility already specified by P13/P12: authorized policy managers
can require review generally or for supported correction categories and qualified
amount thresholds. Use the existing permission/approval-policy owner. Do not
narrow this to only one all-or-nothing switch, invent an arbitrary rule builder
or add a per-correction bypass. Supported conditions and authority must be
qualified; this decision does not claim a ready policy editor exists.

Tenant policy cannot waive an independently required safeguard. Authenticated
bank/provider settlement, return and dispute evidence remains source-owned and
does not wait for this staff-review ceremony. This decision grants no missionary
correction powers, expands no refund authority, changes no receipt ownership and
never permits editing an immutable posted financial row in place.

## Small, flexible staff journey

Use the existing organization permissions/approval settings destination. Explain
the effective correction policy in plain language, with supported category or
amount conditions shown only where needed. Distinguish the organization's
chosen requirements from requirements it cannot relax. Show before/after policy
meaning and truthful saved state; no parallel approval console or new workflow
designer is needed.

In the existing gift-correction review, show the proposed change, required reason
and applicable outcome before the primary action:

- **Apply correction** when current policy and authority permit immediate action.
- **Request approval** when a different authorized person must review it; the
  status then says **Awaiting approval**, not Corrected.

An approved or applied result must come from the authoritative source. Failed or
uncertain submission reconciles the same operation, with no duplicate corrective
entry. The original gift and its correction history remain understandable.
No extra approval step is displayed merely because the system supports one.
Reuse shared Base UI/base-maia components, visible focus, accessible status
feedback, phone layouts and locale-aware amounts with explicit currencies.

## Policy changes, defaults and pending work

Only current policy-management authority may change the organization's rules;
permission to correct a gift alone is insufficient. Preserve existing explicit
tenant policies during migration. Explicitly initialize the selected light default
through qualified source configuration for new organizations. A missing, invalid
or unreadable policy on an existing tenant must not silently become permission
to bypass review.

Recheck the current policy, actor authority, source revision and exact correction
before acceptance/application, using the existing authoritative command. A
stricter policy applies to an uncommitted correction; an older open form cannot
avoid it. Relaxing policy never automatically approves or applies waiting work.
An authorized person must deliberately continue the existing correction under
current rules, with fresh review if its facts changed. Preserve its history and
effect identity; do not clone it to obtain a different approval result.

Completed corrections retain their actual evidence and outcome. A later policy
change does not reinterpret them. Stale approvals, duplicate clicks, restore and
concurrent policy edits cannot create another effect or override current rules.

## Exact owner reconciliation and current reality

The selected rule narrowly replaces P15 Mod3's unconditional requester/different-
approver rule for staff-initiated post-commit amendments with the effective
P12/P13 tenant policy plus independently binding controls. It does not reopen
[ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md)
or ordinary entry's [ADR-0009](../../../adr/0009-validate-equals-post-default.md).

Required formal reconciliation targets are P13's C-01 notice and D5 policy;
P15's C-01 notice, Mod3 and affected acceptance clauses; the program/audit gate
status; and each declared owner/OpenSpec projection and P27/P28 consumer. These
formal sources remain unchanged under the research-only session boundary.
Their old pending notices do not negate this explicit answer; they identify the
remaining integration work. Policy selection is complete, activation is not.

Current [approval-policy source](../../../../packages/api/src/admin/contribution-operations/approval-policy.ts)
already represents tenant modes, category suppression and stronger categories,
but defaults absent/invalid modes to separation of duties. Its decision helper
compares nullable profile identities only under that mode. These are inspected
implementation facts, not proof of D48's policy, complete same-human enforcement
or deployed correctness. Qualify trusted canonical actor identity through P12,
current tenant/entity scope, both old/new state authority and all source/database
entry paths. Do not copy legacy defaults, nullable-actor shortcuts or internal
mode names into the intended user journey. No implementation or migration was
performed here.

## Adversarial check

### What could go wrong with this answer?

A policy relaxation could release a waiting queue automatically, or a requester
could self-approve through another identity representation. Require deliberate
current-authority continuation, stable effect identity and same-human enforcement
where independence is required. Preserve stronger controls in every policy mode.

### What hidden assumptions are we making?

Tenant policy management and supported categories/thresholds need actual owner
qualification. Code representing a policy does not establish a working editor
or safe migration. No prevalence of single-person finance teams is assumed.

### How does this affect the whole product?

C-01 now has a founder ruling. P13/P15/P12 must express it consistently before
affected implementation activates. Gift reports consume authoritative corrected
facts; P28 does not acquire financial write authority or a second approval system.

### How does this affect the end-user experience?

Organizations choose their working method. Staff see the effective requirement
at the correction, with one appropriate action and honest progress. Waiting work
does not disappear or silently apply when policy changes.

### Does this follow modern best practices?

This follows P13's existing configurable-control direction and the
[recorded C-01 recommendation](../../../ai/audits/2026-09-23-contract-congruence.md#one-unresolved-owner-decision).
It balances independent review with operating flexibility without removing
auditability. That is a repository-backed product judgment, not proof that one
approval policy suits every nonprofit or a new empirical fraud-reduction claim.

### Does this fit Asym's existing repo and product direction?

Yes as selected intent: reuse P12's policy/authority owner and P13's append-only
correction boundary. Existing code is a partial precedent requiring reconciliation,
not unquestioned authority. Preserve tenant isolation and the shared design system.

### Should we adjust the recommendation?

**Accept.** Record tenant choice with its supported policy flexibility. The
current-rule, identity, history and pending-work safeguards preserve the answer;
no extra approval question or new policy setting is necessary to record it.

## Future proof and status

Require outcome proof for immediate and independently approved corrections;
tenant/category/amount policy and exact currency boundaries; same-human alternate
hats; wrong-tenant and unauthorized policy changes; tightened/relaxed policy
during review; stale facts; lost responses/retries; preservation of existing
policies; unknown legacy configuration; immutable history; mandatory controls
in every mode; and source settlement/returns unaffected by this staff ceremony.
Prove accessible correction and policy journeys with actual source/database roles.

These are future obligations. No prior program/model was executed, no formal
specification or issue was produced, and no application/schema, live setting,
GitHub state or real communication changed. The glossary needs no new term.
Earlier packet statuses remain separate. E7 campaign attribution remains open;
the [session continuation](phase28-session.md#next-conversation-step) owns the
next question. Phase 28 is not declared complete.
