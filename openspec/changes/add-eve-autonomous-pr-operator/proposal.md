# Proposal: Eve autonomous PR operator and work initiation

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #431 ("Eve: Autonomous PR Operator and Work Initiation").** Staged in the
> Gitea `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on #423** (`add-eve-approval-budget-policy`,
> EVE-DESIGN-0005), **#429** (`add-eve-sandbox-engineering-worker`, EVE-DESIGN-0011), and **#430**
> (`add-eve-github-read-review-path`, EVE-DESIGN-0012) — the three slices the implementation plan names as #431's
> blockers — and stands on #417 (ADR-0018), #418 (ADR-0019), #419 (ADR-0020), #420 (ADR-0021), #421 (ADR-0022),
> and #425 (EVE-DESIGN-0007). It does not restate their contracts; it defines the **mutating PR operator and work
> initiation** path in which Eve creates issues, branches, PRs, and pushes, and labels, reruns CI, pushes safe
> fixes, and updates PR state — issue-first, engineering-only, each operation with policy, audit, and an
> accountable initiator, while the release switch stays off. It **never merges** (that is #432) and **never**
> writes broad business data. Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from
> `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 15 as the **Autonomous PR Operator and Work Initiation**, issue **#431**,
an **AFK** slice **blocked by slices 7, 13, and 14** — the approval/budget policy (#423), the sandbox
engineering worker (#429), and the GitHub read-and-review path (#430).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:238]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:239] All three blockers are
already proposed, so #431 is unblocked. Its stated purpose is to prove that "Eve can create issues, branches,
PRs, labels, rerun CI, push safe fixes, and update PR state under policy," with acceptance that "Eve-initiated
work follows issue-first flow," that "engineering autonomy is allowed while business-data writes stay blocked,"
and that "every GitHub operation has policy, audit, and accountable initiator."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:241]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:245]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:246] It covers user stories 11,
14, 15, 16, 30, and 31. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:240]

The platform constraints already fix the shape. A maintainer wants "Eve to act as an autonomous PR operator"
that can "label, rerun CI, push safe fixes, update PR state, and coordinate follow-up work under policy" (US-11);
a platform owner wants "Eve to create issues, branches, PRs, and pushes for work it discovers, so that safe
improvements do not wait for manual task creation" (US-14); a product owner wants "Eve to propose and implement
new product features only through a spec-first path" (US-15) and "Eve-created product work to update OpenSpec
before implementation proceeds" (US-16); a platform owner wants "Eve to write operational production records
under policy" — "tasks, notes, labels, internal statuses, workflow metadata, memory, model settings, and review
artifacts" (US-30) — and wants "Eve blocked from broad customer, donor, payment, identity, tenant ownership,
auth, secret, migration, and destructive production writes without stricter approval" (US-31).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:88]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:106]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:109]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:161]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:165] The behavior
constraint enumerates the operator's full action set: "Eve may act as an autonomous PR operator in GitHub. It
may review, comment, create inline findings, label, rerun CI, push safe fixes, update PR state, create issues,
create branches, and open PRs under policy."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]

This is the first slice where Eve **mutates** an external surface — it writes to GitHub, not just reviews it
(#430). Four boundaries make that survivable. First, **issue-first work initiation**: work Eve discovers becomes
an issue, then a branch, then a PR, so autonomous work is legible and never a silent push.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102] Second,
**engineering-only autonomy**: Eve may write operational production records under policy but MUST NOT
autonomously write "broad customer, donor, payment, identity, tenant ownership, auth, secret, migration,
destructive production, or production deployment records."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:419]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423] Third, **no
merge**: this path may open and update PRs but never merges — auto-merge, and its protected-area block, remain
#432 (slice 16), and this path does not bypass GitHub branch protection or required reviews.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629] Fourth,
**spec-first for product direction**: features Eve invents require a spec-first PR path, and product-direction
changes require OpenSpec before merge — Eve-created product work updates OpenSpec before implementation proceeds.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:395]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:109] Every
operation still executes through the accountable bot identity (#430), is gated by #423, audited by #419, and
resolves models through #421 on the #425 runtime inside the #429 sandbox — honoring the fleet data-boundary law
on an external surface.

## What Changes

- Add a new OpenSpec capability `eve-autonomous-pr-operator` (spec delta in
  `specs/eve-autonomous-pr-operator/spec.md`) stating: Eve-initiated work follows an **issue-first flow** (work
  it discovers becomes an issue, then a branch, then a PR, never a silent push); Eve may perform the **mutating
  PR operations** under policy — **label, rerun CI, push safe fixes, update PR state, create issues, create
  branches, open PRs** — but **never merges** (auto-merge is #432) and never bypasses GitHub branch protection
  or required reviews; **engineering autonomy is allowed while business-data writes stay blocked** (operational
  production records under policy are permitted, but broad customer/donor/payment/identity/tenant-ownership/
  auth/secret/migration/destructive-production/deployment writes are refused without stricter approval);
  **product-direction changes are spec-first** (Eve-invented features go through a spec-first PR path and update
  OpenSpec before implementation proceeds); and **every GitHub operation has policy, audit, and an accountable
  initiator** — each op executes through #430's accountable bot identity, is gated by #423, audited in #419's
  record shape, resolves models through #421, runs on the #425 runtime inside the #429 sandbox checkout, spends
  under #423 budgets, honors #420's `disable GitHub actions` switch, stays disabled by default while the release
  switch is off, and never bypasses #417 protected-area/approval limits or #418 emergency-off precedence.
- Record the decision under provisional Eve design label **EVE-DESIGN-0013** in this change's `design.md`, building on EVE-DESIGN-0005 (#423), EVE-DESIGN-0011
  (#429), and EVE-DESIGN-0012 (#430).

## What Does Not Change

- This change adds **no GitHub App code, no work-initiation/issue-opener, no branch/PR creator, no label/CI-rerun
  caller, no safe-fix pusher, and no business-data guard implementation**; it defines the PR-operator and
  work-initiation capability, its issue-first and engineering-only boundaries, its accountability/policy/audit
  contract, and its verification boundary while the system stays disabled by default (per #418) and the release
  switch stays off. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- **Strict auto-merge** and its protected-area **block** remain the auto-merge policy's scope (#432, slice 16);
  this path may open and update PRs, it never merges and never bypasses branch protection or required reviews.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
- The **read-and-review path** — reviewing a PR and posting a summary plus inline findings — remains #430's
  scope; this path performs the **mutating** operations #430 explicitly excludes, and reuses #430's accountable
  bot identity rather than redefining it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- The **audit-record shape** remains #419's scope; each operation emits an audit record **in** that shape. The
  **approval/budget policy** remains #423's scope; every operation is gated **by** it and model spend stays
  **under** it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- The **isolated runtime package** remains #425's scope and the **contained sandbox** remains #429's scope; #431
  is the operator behavior that **runs on** the runtime **inside** the sandbox checkout, not either of them. The
  **model-policy capability** remains #421's scope; the operator resolves models **through** it, never hardcoding
  a provider. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- No donor PII, payments, secrets, one-time codes, or tenant facts are written to GitHub or enter this path, and
  no broad business-data record is written autonomously — those boundaries are reinforced here, never relaxed. No
  Supabase schema, Mission Control UI, or provider-client code lands. This change does not bypass GitHub branch
  protection, required reviews, or repository policy. #417's contract, `AGENTS.md`, `openspec/project.md`,
  `openspec/specs/**`, and existing CI gates remain authoritative and unchanged; this change is subordinate to
  them. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:627]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-autonomous-pr-operator --strict`) that makes the
  PR-operator and work-initiation path — issue-first initiation, the mutating PR operations under policy, no
  merge, engineering-only autonomy with business-data writes blocked, spec-first product direction, and every
  operation with policy, audit, and an accountable initiator — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Provisional Eve design decision `EVE-DESIGN-0013` for the autonomous PR operator and work initiation, traceable from EVE-DESIGN-0005 (#423),
  EVE-DESIGN-0011 (#429), and EVE-DESIGN-0012 (#430).
- A clear boundary: #430 owns read-and-review and the accountable bot identity; #423 owns approval/budget; #419
  owns the audit shape; #421 owns model policy; #425 owns the runtime; #429 owns the sandbox; #432 owns strict
  auto-merge; #431 owns the **mutating PR operations and work initiation** those compose in, and it stays off
  until governance is verified. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
