# Proposal: Eve strict auto-merge policy

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #432 ("Eve: Strict Auto-Merge Policy").** Staged in the Gitea `proposals`
> repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's OpenSpec workflow
> after operator/maintainer sign-off. **Builds on #430** (`add-eve-github-read-review-path`, EVE-DESIGN-0012) and
> **#431** (`add-eve-autonomous-pr-operator`, EVE-DESIGN-0013) — the two slices the implementation plan names as #432's
> blockers — and stands on #417 (ADR-0018), #418 (ADR-0019), #419 (ADR-0020), #420 (ADR-0021), #421 (EVE-DESIGN-0006),
> #423 (EVE-DESIGN-0005), #425 (EVE-DESIGN-0007), and #429 (EVE-DESIGN-0011). It does not restate their contracts; it defines the
> single **strict auto-merge** decision — Eve may merge **only** when strict safe policy passes and protected
> areas are absent, auto-merge is **blocked** for repo-aware protected areas, and the **human escalation path is
> explicit** — while the release switch stays off. This is a **HITL** slice. Every grounded claim carries a
> `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 16 as the **Strict Auto-Merge Policy**, issue **#432**, a **HITL** slice
**blocked by slices 14 and 15** — the GitHub read-and-review path (#430) and the autonomous PR operator (#431).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:248]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:250]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:251] Both blockers are already
proposed, so #432 is unblocked. Its stated purpose is to prove that "Eve can merge only when strict safe policy
passes and protected areas are absent," with acceptance that "auto-merge passes for safe PRs with required
checks and reviews satisfied," that "auto-merge blocks for repo-aware protected areas," and that "human
escalation path is explicit." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258] It covers user stories 12,
13, 31, and 32. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:252]

The platform constraints already fix the shape. A maintainer wants "Eve to auto-merge only when strict safe
policy is satisfied, so that useful automation does not bypass protected review boundaries" (US-12), and wants
"protected areas to block auto-merge, so that auth, payments, tenant resolution, admin access control, data
boundaries, package changes, runtime changes, GitHub workflows, Vercel config, agent instructions, Eve config,
migrations, RLS, secrets, and production settings remain human-controlled" (US-13).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:92]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:96] A platform
owner wants "Eve blocked from broad customer, donor, payment, identity, tenant ownership, auth, secret,
migration, and destructive production writes without stricter approval, so that critical records remain
protected" (US-31), and wants "rich audit records for every meaningful Eve action" (US-32).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:165]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170] The behavior
constraint states the merge rule directly: "Eve may auto-merge only when strict safe policy passes," and
"auto-merge is blocked for repo-aware protected areas: auth, donations, payments, secrets, environment config,
Supabase migrations, RLS, production deployment config, tenant resolution, admin access control, data-access
boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config, package changes, dependency
changes, and runtime changes." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]

This is the program's **highest-authority** autonomous action — the one operation that lands code on a protected
branch. Three boundaries make it survivable, and all three are HITL by construction. First, **strict-pass-only**:
auto-merge passes **only** for safe PRs with required checks and required reviews satisfied and no protected area
touched — the default is not to merge. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
Second, **protected-area block**: any PR touching the repo-aware protected set is blocked from auto-merge and
stays human-controlled. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:100] Third,
**explicit human escalation**: when auto-merge does not pass, the path escalates to a human on an explicit path
rather than merging or silently dropping the PR. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]
The merge never bypasses GitHub branch protection or required reviews, executes through #430's accountable bot
identity, is gated by #423, audited by #419, and resolves any models through #421 on the #425 runtime — honoring
the fleet data-boundary law on the one surface where an autonomous action is irreversible-into-`develop`.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]

## What Changes

- Add a new OpenSpec capability `eve-strict-auto-merge-policy` (spec delta in
  `specs/eve-strict-auto-merge-policy/spec.md`) stating: Eve MAY **auto-merge only when strict safe policy
  passes** — a safe PR with required checks and required reviews satisfied and no protected area touched, never
  bypassing GitHub branch protection or required reviews; **auto-merge is blocked for repo-aware protected
  areas** (auth, donations, payments, secrets, environment config, Supabase migrations, RLS, production
  deployment config, tenant resolution, admin access control, data-access boundary changes, GitHub workflows,
  Vercel config, agent instructions, Eve config, package changes, dependency changes, and runtime changes),
  which stay human-controlled; the **human escalation path is explicit** when auto-merge does not pass; **every
  merge decision has policy, audit, and an accountable initiator** — it executes through #430's accountable bot
  identity, is gated by #423, audited in #419's record shape, resolves models through #421, runs on the #425
  runtime, honors #420's `disable GitHub actions` switch, stays disabled by default while the release switch is
  off, and never bypasses #417 protected-area/approval limits or #418 emergency-off precedence.
- Record the decision under provisional Eve design label **EVE-DESIGN-0014** in this change's `design.md`, building on EVE-DESIGN-0012 (#430) and EVE-DESIGN-0013
  (#431).

## What Does Not Change

- This change adds **no auto-merge executor, no protected-area detector, no required-check/required-review
  evaluator, no escalation router, and no GitHub App code**; it defines the strict-auto-merge capability, its
  strict-pass-only rule, its protected-area block, its explicit human escalation, and its
  accountability/policy/audit contract, while the system stays disabled by default (per #418) and the release
  switch stays off. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **mutating PR operations and work initiation** — label, rerun CI, push safe fixes, update PR state, create
  issues/branches/PRs — remain #431's scope; this path adds **only** the merge decision on top and reuses #431's
  operator surface rather than redefining it. #431 explicitly performs **no merge**; #432 owns it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- The **read-and-review path** and the **accountable bot identity** remain #430's scope; each merge decision
  reuses that identity rather than redefining it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- The **audit-record shape** remains #419's scope; each merge decision emits an audit record **in** that shape.
  The **approval/budget policy** remains #423's scope; every merge decision is gated **by** it and model spend
  stays **under** it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- The **protected-area set** itself is #417's contract; #432 reads that set to block merges, it does not define
  it. The **isolated runtime** remains #425's scope, the **sandbox** remains #429's scope, and the
  **model-policy capability** remains #421's scope; #432 is the merge behavior that runs on them and resolves
  models through them, never hardcoding a provider.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- No donor PII, payments, secrets, one-time codes, or tenant facts enter this path or are written to GitHub, and
  no protected-area merge is performed autonomously — those boundaries are reinforced here, never relaxed. No
  Supabase schema, Mission Control UI, or provider-client code lands. This change does not bypass GitHub branch
  protection, required reviews, or repository policy. #417's contract, `AGENTS.md`, `openspec/project.md`,
  `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this change is subordinate to
  them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:627]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-strict-auto-merge-policy --strict`) that makes the strict
  auto-merge policy — merge only when strict safe policy passes, protected-area merge-block, explicit human
  escalation, and every merge decision with policy, audit, and an accountable initiator — a durable, spec-level
  contract. [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0014` for the strict auto-merge policy, traceable from EVE-DESIGN-0012 (#430) and EVE-DESIGN-0013 (#431).
- A clear boundary: #430 owns read-and-review and the accountable bot identity; #431 owns the mutating PR
  operations and work initiation (and performs no merge); #417 owns the protected-area set; #419 owns the audit
  shape; #423 owns approval/budget; #421 owns model policy; #425 owns the runtime; #429 owns the sandbox; #432
  owns the **strict auto-merge decision** those compose in, and it stays off until governance is verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
