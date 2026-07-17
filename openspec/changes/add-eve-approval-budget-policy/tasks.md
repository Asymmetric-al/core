<!-- Partner DRAFT for GitHub issue #423. Task list for the `add-eve-approval-budget-policy`
OpenSpec change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off.
Acceptance and scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
and [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the approval/budget OpenSpec contract

- [ ] 1.1 Add the `eve-approval-budget-policy` capability via this change's spec delta
      (`specs/eve-approval-budget-policy/spec.md`), building on #418 (consult gate/state), #419 (audit),
      #420 (kill-switch), and #421 (model roles/subagents) without restating them
- [ ] 1.2 State the five requirements as spec: approval separated by trust zone; operational production
      writes allowed under policy; sensitive/business-data writes blocked without stricter approval; hard
      budgets/rate limits with audited emergency override; decisions app-owned, audited, and grant no new
      authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-approval-budget-policy --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0005 (approval and budget policy)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0005 in this change's `design.md`, traceable from EVE-DESIGN-0002 (#418), EVE-DESIGN-0003 (#419), and
      EVE-DESIGN-0004 (#420)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #423

## 3. Trust-zone approval rules

- [ ] 3.1 Enumerate the three trust zones at spec level: engineering, product/admin, and memory
- [ ] 3.2 State that each zone has its own approval rule set and that a looser zone's allowance never
      authorizes a stricter zone's action
- [ ] 3.3 State that zone rules are persisted app-owned policy, never derived from prompt/model/tool input

## 4. Operational vs. business-data write classification

- [ ] 4.1 Enumerate operational production writes allowed under policy: tasks, notes, labels, internal
      statuses, workflow metadata, memory, model settings, review artifacts
- [ ] 4.2 Enumerate the blocked business-data write class requiring stricter approval: customer, donor,
      payment, identity, tenant ownership, auth, secret, migration, and destructive production writes
- [ ] 4.3 State that an operational-write allowance never authorizes a business-data write and that an
      unclassifiable write defaults to the stricter class

## 5. Hard budgets, rate limits, and emergency override

- [ ] 5.1 State that hard budgets/rate limits apply to model roles, subagents, dynamic workflows, evals,
      judge models, and expensive features, and that exceeding a limit pauses or denies the action
- [ ] 5.2 State that budget/limit state is persisted app-owned state consumed by the policy check and never
      satisfiable by a prompt/model/tool/memory claim
- [ ] 5.3 State that the emergency override requires a dedicated permission and emits a #419 audit record,
      and is never selectable by prompt/model/tool input

## 6. Audit, non-bypass, and subordination

- [ ] 6.1 State that every decision (allow/deny/pause/override) is consumed by the #418 consult gate and
      emits a #419 audit record with actor/initiator, trust zone, write class or budget, decision, and reason
- [ ] 6.2 State that where kill-switch state and budget/approval policy disagree, the more restrictive result
      wins, and that #417 protected-area/approval limits and #420 force-approval still apply
- [ ] 6.3 State that this change grants no new authority and introduces no live autonomous surface

## 7. Acceptance checks (HITL)

- [ ] 7.1 Maintainer review of the trust-zone split, the operational-vs-business-data classification, the
      budget set, and the no-new-authority boundary
- [ ] 7.2 Confirm the tracer-bullet acceptance: one operational action can be allowed, denied, or paused by
      trust-zone policy and budget state
- [ ] 7.3 Confirm no Supabase schema, admin UI, or runtime code is included in this change
- [ ] 7.4 Confirm the change is subordinate to #417/#418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates
- [ ] 7.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
