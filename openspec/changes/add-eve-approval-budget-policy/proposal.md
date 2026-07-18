# Proposal: Eve approval and budget policy

**Prepared by WNG partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #423 ("Eve: Approval and budget policy tracer bullet").** Staged in the
> Gitea `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through
> Asymmetric's OpenSpec workflow after operator/maintainer sign-off. **Builds on #418**
> (`add-eve-governance-kernel-release-switch`, ADR-0019), **#419** (`add-eve-audit-tracer-bullet`, ADR-0020),
> and **#420** (`add-eve-kill-switch-control-path`, EVE-DESIGN-0004) — it does not restate those contracts. It adds
> the trust-zone approval policy and the hard-budget policy that the governance kernel's single consult gate
> consumes, that every kill-switch and policy check reads, and that emits #419 audit records. Every grounded
> claim carries a `[VERIFIED-REPO: path]` citation read from `Asymmetric-al/core` at commit `d14a2434` on
> 2026-07-02. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

## Why

The PRD requires separate approval policies by trust zone and hard budgets with an audited emergency
override. US-29: "As a platform owner, I want separate approval policies for engineering, product or admin
actions, and memory, so that different trust zones have different rules." US-30: Eve should "write
operational production records under policy … tasks, notes, labels, internal statuses, workflow metadata,
memory, model settings, and review artifacts." US-31: Eve must be "blocked from broad customer, donor,
payment, identity, tenant ownership, auth, secret, migration, and destructive production writes without
stricter approval." US-42: "hard budgets and rate limits with emergency override, so that autonomous runs,
subagents, evals, and judges cannot burn unbounded spend."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

The implementation plan scopes #423 (slice 7) as an **AFK** (ahead-of-full-knowledge) slice **blocked by
slices 2, 3, 4, 5** (#418 governance kernel, #419 audit, #420 kill-switch, #421 model policy). Its stated
purpose — "what it proves" — is that **one operational action can be allowed, denied, or paused by trust-zone
policy and budget state**, with acceptance that (a) engineering, product/admin, and memory policies are
separate; (b) hard budgets and emergency override are enforceable and audited; and (c) operational production
writes are distinct from blocked business-data writes.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

The `platform-boundaries` spec already makes CRM the owner of "operational identity, relationships, giving,
permissions-sensitive records, workflows, approvals, money-related history, and other operational truth" and
treats sensitive operations as server-side-only. This change names the approval/budget policy contract that
sits on top of those boundaries; it adds restrictions and gates, it never relaxes them.
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

## What Changes

- Add a new OpenSpec capability `eve-approval-budget-policy` (spec delta in
  `specs/eve-approval-budget-policy/spec.md`) stating:
  - **Trust-zone approval policy.** Approval policy is separated by trust zone — **engineering** actions,
    **product/admin** actions, and **memory** actions each have their own rules; a policy decision for one
    zone never silently applies another zone's looser rule.
    [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
  - **Operational vs. business-data writes.** Operational production writes (tasks, notes, labels, internal
    statuses, workflow metadata, memory, model settings, review artifacts) are allowed under policy, while
    broad customer, donor, payment, identity, tenant-ownership, auth, secret, migration, and destructive
    production writes are **blocked without stricter approval**.
    [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
  - **Hard budgets and rate limits with audited emergency override.** Hard budgets/rate limits apply to
    model roles, subagents, dynamic workflows, evals, judge models, and expensive features; exceeding a
    budget pauses or denies the action, and the **emergency override requires a dedicated permission and an
    audit record**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
  - **App-owned, non-bypassable, audited, no-new-authority.** Policy and budget decisions read only persisted
    app-owned state (never a prompt/model/tool/memory claim), the single #418 consult gate consumes them,
    every decision (allow/deny/pause/override) emits a #419 audit record, and the change grants no new
    autonomy and stays subordinate to #417.
- Record the decision under provisional Eve design label **EVE-DESIGN-0005** in this change's `design.md`, building on EVE-DESIGN-0004 (#420), ADR-0020
  (#419), and ADR-0019 (#418), which all build on ADR-0018 (#417).

## What Does Not Change

- The **single consult/approval gate** and the disabled-by-default release-switch/emergency-off **state**
  remain #418's scope; #423 defines the _policy content_ (which zone, which write class, which budget) that
  the gate evaluates, not the kernel that enforces the gate.
  [VERIFIED-REPO: openspec/specs/eve-autonomous-operations/spec.md]
- The **audit-record shape** (actor, initiator, identity mode, policy, action, target, result, redacted
  evidence) remains #419's scope; #423 only requires that each policy/budget decision _emits_ one.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The **kill-switch control path** (per-domain switches incl. production-writes and force-approval) remains
  #420's scope; #423's budget/approval checks are consumed _alongside_ kill-switch state, not in place of it,
  and force-approval still overrides any allow this policy would grant.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The **model-policy** capability (named roles, Gateway-primary routing, eval gates) remains #421's scope;
  #423 only applies budgets/rate limits _to_ those roles/subagents/judges and depends on #421 for their
  definition. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The durable trust boundaries — CRM as operational truth, sensitive operations server-side-only, tenant
  isolation — remain `platform-boundaries` scope; this policy inherits and tightens them.
  [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
- #417's contract, `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain
  authoritative and unchanged; this change is subordinate to them. [VERIFIED-REPO: AGENTS.md]
- No Supabase schema, admin UI, or runtime code lands here — those implement this spec in later PRs.

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-approval-budget-policy --strict`) that makes trust-zone
  approval policy and hard-budget policy a durable, spec-level contract, provable before runtime exists.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0005` for the approval/budget policy, traceable from ADR-0019 (#418), ADR-0020 (#419), and
  EVE-DESIGN-0004 (#420).
- A clear boundary: #418 owns the consult gate + state; #419 owns the audit record; #420 owns the
  kill-switch control path; #421 owns model policy; **#423 owns the approval-by-trust-zone rules, the
  operational-vs-business-data write classification, and the hard-budget/rate-limit policy that all of them
  consume.** [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
