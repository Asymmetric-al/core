# Design (provisional Eve label EVE-DESIGN-0014): Eve Strict Auto-Merge Policy

> **Numbering:** `EVE-DESIGN-0014` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0014**, the strict-auto-merge-policy decision required by issue #432. It
> builds on **EVE-DESIGN-0012** (#430, `add-eve-github-read-review-path`) and **EVE-DESIGN-0013** (#431,
> `add-eve-autonomous-pr-operator`), and does not restate them — it operationalizes the single merge decision in
> which Eve merges **only** when strict safe policy passes and protected areas are absent, blocks auto-merge for
> repo-aware protected areas, and escalates to a human on an explicit path, while the release switch stays off
> per #418. When accepted into `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR
> location (using the next available canonical number per `docs/adr/README.md`). Every grounded claim carries a `[VERIFIED-REPO: path:line]`
> citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:248]

## Status

Proposed (partner draft for #432). Supersedes nothing. Builds on EVE-DESIGN-0012 (#430) and EVE-DESIGN-0013 (#431).
Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 16 (#432, "Strict Auto-Merge Policy") as a **HITL** slice **blocked by
slices 14 and 15** — the GitHub read-and-review path (#430) and the autonomous PR operator (#431) — and covering
user stories 12, 13, 31, and 32. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:250]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:251]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:252] What it must prove is that
"Eve can merge only when strict safe policy passes and protected areas are absent," with acceptance that
"auto-merge passes for safe PRs with required checks and reviews satisfied," that "auto-merge blocks for
repo-aware protected areas," and that "human escalation path is explicit."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]

The platform constraints already fix the decision's shape. A maintainer wants Eve to "auto-merge only when
strict safe policy is satisfied, so that useful automation does not bypass protected review boundaries" (US-12),
and wants "protected areas to block auto-merge, so that auth, payments, tenant resolution, admin access control,
data boundaries, package changes, runtime changes, GitHub workflows, Vercel config, agent instructions, Eve
config, migrations, RLS, secrets, and production settings remain human-controlled" (US-13).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:92]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:96] The behavior
constraint states the merge rule and the protected-area set directly: "Eve may auto-merge only when strict safe
policy passes," and "auto-merge is blocked for repo-aware protected areas: auth, donations, payments, secrets,
environment config, Supabase migrations, RLS, production deployment config, tenant resolution, admin access
control, data-access boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config, package
changes, dependency changes, and runtime changes."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389] A platform
owner wants Eve "blocked from broad customer, donor, payment, identity, tenant ownership, auth, secret,
migration, and destructive production writes without stricter approval" (US-31) and "rich audit records for
every meaningful Eve action" (US-32).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:165]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170] The
GitHub-operator test constraint requires tests to cover "protected-area detection, strict auto-merge pass,
strict auto-merge block, and accountability metadata."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:547]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:548]

The implementation plan deliberately separates the operator's action set from the merge decision: slice 14
(#430) is the read-and-review subset, slice 15 (#431) is the mutating PR operator and work initiation — which
performs **no merge** — and slice 16 (#432) owns **strict auto-merge** alone.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236] This ADR fixes #432 at exactly
the merge decision, reuses #430's accountable bot identity and #431's operator surface, reads #417's
protected-area set, and defers every non-merge PR operation to #431.

**Partner-boundary note.** This is the program's **highest-authority** autonomous action: the one operation that
lands code on a protected branch and is not internally undoable the way a label or a comment is. The fleet
data-boundary law forbids donor PII, payments, secrets, one-time codes, and tenant facts from ever touching this
infra or GitHub. This ADR therefore makes the merge **strict-pass-only** (the default is to not merge),
**blocks** every repo-aware protected area from auto-merge so it stays human-controlled, and makes the **human
escalation path explicit** for everything that does not pass — a HITL slice by construction.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258] The merge **never** bypasses
GitHub branch protection or required reviews. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
Model calls resolve **only through #421's policy** (Vercel AI Gateway primary, direct providers as controlled
fallbacks) via the #425 runtime — keeping any partner GPU gateway a proposed, non-default, revocable route
rather than a hardcoded default. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]

## Decision

1. **Auto-merge only when strict safe policy passes.** Eve MAY auto-merge a PR **only** when strict safe policy
   passes: the PR is safe, its required checks are satisfied, its required reviews are satisfied, and no
   protected area is touched. The default outcome is **not to merge**; merge is the exception a strict pass
   earns. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
2. **Protected-area merge-block.** Auto-merge MUST be blocked for repo-aware protected areas — auth, donations,
   payments, secrets, environment config, Supabase migrations, RLS, production deployment config, tenant
   resolution, admin access control, data-access boundary changes, GitHub workflows, Vercel config, agent
   instructions, Eve config, package changes, dependency changes, and runtime changes — so those areas remain
   human-controlled. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:100]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]
3. **Explicit human escalation.** When auto-merge does not pass — because a required check or review is
   unsatisfied, or a protected area is present — the path MUST escalate to a human on an **explicit** path; it
   neither merges nor silently drops the PR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]
4. **Never bypass branch protection or required reviews.** A passing auto-merge MUST honor GitHub branch
   protection, required reviews, and repository policy; the strict policy is **additional** to them, never a way
   around them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
5. **Accountable, policy-gated, and audited merge decision.** Every merge decision — pass or block — MUST
   execute through **#430's accountable bot identity** recording the accountable admin, GitHub sender, schedule,
   or system trigger; MUST be **gated by #423's approval/budget policy** (a merge Eve is not authorized to take
   is withheld, and model spend stays under #423's hard budgets); and MUST emit an **audit record in #419's
   shape** (who/what initiated, tool/subagent, model role, policy applied, evidence used, what changed).
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
6. **Subordinate; grants no new authority.** The path runs on the **#425 runtime**, reuses **#431's** operator
   surface and **#430's** accountable bot identity, reads **#417's** protected-area set to block merges,
   resolves any model through **#421** (Gateway-primary; never hardcoded), spends under **#423** hard budgets,
   honors **#420's** `disable GitHub actions` kill switch (reading persisted state, never a prompt/model/tool
   claim), does not bypass GitHub branch protection or required reviews, stays **disabled by default while the
   release switch is off**, and never bypasses **#417** protected-area/production-write/approval limits or
   **#418** emergency-off precedence. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and the protected-area set at spec level. #432
  reads that set to block auto-merge; it does not define it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#418 (ADR-0019, governance kernel):** owns disabled-by-default and emergency-off precedence. #432 stays off
  while the release switch is off and never overrides emergency-off; it does not define the kernel.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- **#419 (ADR-0020, audit):** owns the audit-record shape. #432 emits a merge-decision audit record in that
  shape; it does not redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
- **#420 (EVE-DESIGN-0004, kill-switch):** owns the kill-switch state, including "disable GitHub actions." #432 honors
  that switch; it does not persist switch state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
- **#421 (EVE-DESIGN-0006, model policy):** owns named roles and Gateway-primary routing. #432 resolves any model
  through that policy via the #425 runtime; it does not define routing.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns trust-zone approval and hard budgets. #432's merge decisions are
  gated by that policy and its model spend stays under those budgets; it does not define them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#425 (EVE-DESIGN-0007, runtime foundation):** owns the isolated runtime package. #432 is merge behavior that runs
  on it; it is not the runtime. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- **#429 (EVE-DESIGN-0011, sandbox):** owns the contained writable checkout. #432 evaluates PRs prepared from that
  sandbox checkout; it is not the sandbox. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- **#430 (EVE-DESIGN-0012, read-and-review):** owns the accountable bot identity and the review/comment/inline-finding
  subset. #432 reuses that identity to record the merge decision; it does not review.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **#431 (EVE-DESIGN-0013, autonomous PR operator):** owns issue-first work initiation and the mutating PR operations,
  and performs **no merge**. #432 adds the single merge decision on top of that operator surface; it does not
  label, rerun CI, push, or open PRs. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-strict-auto-merge-policy --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — protected-area detection, strict auto-merge pass, strict auto-merge
  block, and accountability metadata — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:548]

## Consequences

- Positive: Eve's highest-authority action — landing code on a protected branch — becomes survivable because
  auto-merge is strict-pass-only, every repo-aware protected area is blocked and stays human-controlled, the
  human escalation path is explicit for everything that does not pass, the merge never bypasses branch
  protection or required reviews, and every merge decision executes through an accountable bot identity (#430),
  is policy-gated (#423) and audited (#419). The policy cannot merge a protected-area PR, cannot merge without
  required checks and reviews, cannot hardcode a model provider, cannot spend past #423 budgets, and cannot run
  while the release switch is off.
- Cost: the discipline of refusing to merge whenever any strict condition is unmet — even a PR that looks safe —
  and of routing every non-passing PR to an explicit human escalation rather than a best-effort merge.
- Risk if skipped: an ungoverned merge policy could land protected-area changes (auth, payments, migrations,
  RLS, secrets, workflows) on a protected branch autonomously, merge past unsatisfied required checks or
  reviews, bypass branch protection, or drop non-passing PRs with no human escalation — exactly the failures the
  strict-pass-only, protected-area-block, and explicit-escalation acceptance forbids.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]

## Alternatives considered

- **Fold auto-merge into the PR operator (#431).** Rejected: the implementation plan separates the mutating PR
  operator (#431, slice 15) from strict auto-merge (#432, slice 16) so the operator ships and is verified before
  any autonomous merge, and #431 performs no merge.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **Merge safe PRs even when a protected area is touched, if checks pass.** Rejected: auto-merge is blocked for
  repo-aware protected areas so they remain human-controlled, independent of check status.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
- **Silently defer non-passing PRs instead of escalating.** Rejected: the human escalation path must be
  explicit. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]
- **Let strict policy stand in for branch protection.** Rejected: the strict policy is additional to GitHub
  branch protection and required reviews, and does not bypass them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
- **Enable strict auto-merge by default.** Rejected: the release switch must remain off until governance, auth,
  audit, evals, protected-area policy, kill switches, and rollback paths are verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

The auto-merge executor, the protected-area detector, the required-check/required-review evaluator, the human
escalation router, the GitHub App code, the mutating PR operations and work initiation (#431), the
accountable-identity implementation (#430), the protected-area set definition (#417), the kill-switch state
store (#420), the audit-record store (#419), the approval/budget policy (#423), the model-policy capability
(#421), the isolated runtime package (#425), the sandbox (#429), any Supabase schema or Mission Control UI, and
any live autonomy — all deferred to later, separately-gated slices or owned by the blockers.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
