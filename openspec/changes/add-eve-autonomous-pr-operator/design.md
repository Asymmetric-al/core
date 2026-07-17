# Design (provisional Eve label EVE-DESIGN-0013): Eve Autonomous PR Operator and Work Initiation

> **Numbering:** `EVE-DESIGN-0013` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0013**, the autonomous-PR-operator-and-work-initiation decision required by
> issue #431. It builds on **EVE-DESIGN-0005** (#423, `add-eve-approval-budget-policy`), **EVE-DESIGN-0011** (#429,
> `add-eve-sandbox-engineering-worker`), and **EVE-DESIGN-0012** (#430, `add-eve-github-read-review-path`), and does not
> restate them — it operationalizes the path in which Eve initiates work issue-first and performs the mutating
> GitHub PR operations (label, rerun CI, push safe fixes, update PR state, create issues/branches/PRs) under
> policy, engineering-only, never merging, while the release switch stays off per #418. When accepted into
> `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR location (same convention chosen for
> ADR-0018). Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from `Asymmetric-al/core`
> at commit `f535c035` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]

## Status

Proposed (partner draft for #431). Supersedes nothing. Builds on EVE-DESIGN-0005 (#423), EVE-DESIGN-0011 (#429), and EVE-DESIGN-0012
(#430). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 15 (#431, "Autonomous PR Operator and Work Initiation") as an **AFK** slice
**blocked by slices 7, 13, and 14** — the approval/budget policy (#423), the sandbox engineering worker (#429),
and the GitHub read-and-review path (#430) — and covering user stories 11, 14, 15, 16, 30, and 31.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:239]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:240] What it must prove is that
"Eve can create issues, branches, PRs, labels, rerun CI, push safe fixes, and update PR state under policy," with
acceptance that "Eve-initiated work follows issue-first flow," that "engineering autonomy is allowed while
business-data writes stay blocked," and that "every GitHub operation has policy, audit, and accountable
initiator." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:241]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:245]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:246]

The platform constraints already fix the path's shape. A maintainer wants Eve to act as an autonomous PR
operator able to "label, rerun CI, push safe fixes, update PR state, and coordinate follow-up work under policy"
(US-11), and the behavior constraint enumerates the full action set: "review, comment, create inline findings,
label, rerun CI, push safe fixes, update PR state, create issues, create branches, and open PRs under policy."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:88]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383] A platform
owner wants Eve to "create issues, branches, PRs, and pushes for work it discovers, so that safe improvements do
not wait for manual task creation" (US-14).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102] A product
owner wants product features implemented "only through a spec-first path" (US-15) with "Eve-created product work
to update OpenSpec before implementation proceeds" (US-16).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:106]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:109] A platform
owner wants Eve to "write operational production records under policy" — "tasks, notes, labels, internal
statuses, workflow metadata, memory, model settings, and review artifacts" (US-30) — but wants Eve "blocked from
broad customer, donor, payment, identity, tenant ownership, auth, secret, migration, and destructive production
writes without stricter approval" (US-31).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:161]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:165] The
GitHub-operator test constraint requires tests to "cover PR review, inline comments, labels, CI reruns, branch
pushes, issue creation, PR creation, protected-area detection, strict auto-merge pass, strict auto-merge block,
and accountability metadata." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:546]

The implementation plan deliberately splits the operator's action set across three slices: slice 14 (#430) is
the **read-and-review** subset (review, comment, inline findings), slice 15 (#431) is the **mutating PR operator
and work initiation** (label, rerun CI, push safe fixes, update PR state, create issues/branches/PRs), and slice
16 (#432) owns **strict auto-merge**. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
This ADR fixes #431 at exactly the mutating-operator-and-initiation subset, reuses #430's accountable bot
identity, and defers every merge decision to #432.

**Partner-boundary note.** This is the program's first slice that **mutates** an external surface — it writes to
GitHub (opens issues/branches/PRs, pushes fixes, changes PR state), where #430 only reviewed. The fleet
data-boundary law forbids donor PII, payments, secrets, one-time codes, and tenant facts from ever touching this
infra, and forbids them from being written onto GitHub. This ADR therefore confines Eve to **engineering
autonomy** — operational production records under policy — and **blocks broad business-data writes**
(customer/donor/payment/identity/tenant-ownership/auth/secret/migration/destructive-production/deployment)
without stricter approval. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:419]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423] It **never
merges** and does not bypass GitHub branch protection or required reviews — a human or #432's strict policy still
owns the merge. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
Model calls resolve **only through #421's policy** (Vercel AI Gateway primary, direct providers as controlled
fallbacks) via the #425 runtime — keeping any partner GPU gateway a proposed, non-default, revocable route rather
than a hardcoded default. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]

## Decision

1. **Issue-first work initiation.** Work Eve discovers is initiated **issue-first** — it becomes an issue, then a
   branch, then a PR — never a silent push. Eve may create issues, branches, PRs, and pushes for work it
   discovers so safe improvements do not wait for manual task creation, and the initiating trigger is recorded.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102]
2. **Mutating PR operations under policy; never merge.** On authorized work, Eve may **label, rerun CI, push
   safe fixes, update PR state, create issues, create branches, and open PRs** under policy. This path performs
   **no merge** — auto-merge and its protected-area block are #432 (slice 16) — and it does not bypass GitHub
   branch protection or required reviews. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
3. **Engineering autonomy allowed; business-data writes blocked.** Eve may write **operational production
   records under policy** — tasks, notes, labels, internal statuses, workflow metadata, memory, model settings,
   review artifacts. Eve MUST NOT autonomously write **broad customer, donor, payment, identity, tenant
   ownership, auth, secret, migration, destructive production, or production deployment records** without
   stricter approval. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:419]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423]
4. **Spec-first product direction.** Product features Eve invents require a **spec-first PR path**;
   product-direction changes require **OpenSpec before merge**, and Eve-created product work **updates OpenSpec
   before implementation proceeds**. A discovered improvement that changes product direction is not pushed as
   code first. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:395]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:109]
5. **Accountable initiator on every operation.** Every GitHub operation executes through **#430's accountable
   bot identity** and records the **accountable admin, GitHub sender, schedule, or system trigger**; no operation
   is anonymous, and system-initiated work carries explicit initiator metadata.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]
6. **Policy-gated and audited.** Every operation is **gated by #423's approval/budget policy** before it runs —
   an operation Eve is not authorized to take is withheld, not taken, and model spend stays under #423's hard
   budgets — and every operation emits an **audit record in #419's shape** (who/what initiated, tool/subagent,
   model role, policy applied, evidence used, what changed). The path gates and emits; it does not redefine the
   policy or the audit contract. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
7. **Subordinate; grants no new authority.** The path runs on the **#425 runtime** inside the **#429 sandbox
   checkout**, resolves every model through **#421** (Gateway-primary; never hardcoded), spends under **#423**
   hard budgets, reuses **#430's** accountable bot identity, honors **#420's** `disable GitHub actions` kill
   switch (reading persisted state, never a prompt/model/tool claim), does not bypass GitHub branch protection or
   required reviews, stays **disabled by default while the release switch is off**, and never bypasses **#417**
   protected-area/production-write/approval limits or **#418** emergency-off precedence.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and protected-area set at spec level. #431's
  business-data block and protected-area deference read that contract; they do not define it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#418 (EVE-DESIGN-0002, governance kernel):** owns disabled-by-default and emergency-off precedence. #431 stays off
  while the release switch is off and never overrides emergency-off; it does not define the kernel.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- **#419 (EVE-DESIGN-0003, audit):** owns the audit-record shape. #431 emits an operation audit record in that shape;
  it does not redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
- **#420 (EVE-DESIGN-0004, kill-switch):** owns the kill-switch state, including "disable GitHub actions." #431 honors
  that switch; it does not persist switch state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
- **#421 (EVE-DESIGN-0006, model policy):** owns named roles and Gateway-primary routing. #431 resolves operator models
  through that policy via the #425 runtime; it does not define routing.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns trust-zone approval and hard budgets. #431's operations are gated
  by that policy and its model spend stays under those budgets; it does not define them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#425 (EVE-DESIGN-0007, runtime foundation):** owns the isolated runtime package. #431 is operator behavior that
  runs on it; it is not the runtime. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- **#429 (EVE-DESIGN-0011, sandbox):** owns the contained writable checkout. #431 prepares branches, safe fixes, and
  PRs from that sandbox checkout; it is not the sandbox.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- **#430 (EVE-DESIGN-0012, read-and-review):** owns the accountable bot identity and the review/comment/inline-finding
  subset. #431 reuses that identity and performs the **mutating** operations #430 excludes; it does not review.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **#432 (slice 16, strict auto-merge):** owns merge gating and the protected-area merge-block. #431 may open and
  update PRs but never merges; every merge decision is #432's.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-autonomous-pr-operator --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — labels, CI reruns, branch pushes, issue creation, PR creation, and
  accountability metadata — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:546]

## Consequences

- Positive: Eve's first mutating external write becomes survivable because work is initiated issue-first, the
  operator is confined to engineering autonomy with broad business-data writes blocked, it never merges and never
  bypasses branch protection, product-direction changes are spec-first, and every operation executes through an
  accountable bot identity (#430), is policy-gated (#423) and audited (#419). The operator cannot hardcode a
  model provider, cannot spend past #423 budgets, cannot merge, and cannot run while the release switch is off.
- Cost: the discipline of the issue-first flow (a discovered fix opens an issue before a PR), of refusing
  business-data writes even when a change looks safe, and of routing product-direction changes through OpenSpec
  before code.
- Risk if skipped: an ungoverned PR operator could push silent changes with no issue trail, write broad
  business-data records autonomously, merge past branch protection, or take unaudited GitHub actions with no
  accountable initiator — exactly the failures the issue-first, business-data-block, and
  policy/audit/accountable-initiator acceptance forbids.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:246]

## Alternatives considered

- **Fold mutating operations and auto-merge into one slice.** Rejected: the implementation plan separates the
  mutating PR operator (#431, slice 15) from strict auto-merge (#432, slice 16) so the operator ships and is
  verified before any autonomous merge. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **Let Eve push discovered fixes directly without opening an issue.** Rejected: Eve-initiated work must follow
  the issue-first flow so autonomous work is legible.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
- **Allow the operator to write business-data records when a change looks safe.** Rejected: engineering autonomy
  is allowed while broad customer/donor/payment/identity/tenant/auth/secret/migration/destructive-production
  writes stay blocked without stricter approval.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423]
- **Give the operator its own accountable-identity or kill-switch state.** Rejected: the accountable bot identity
  is #430's and the kill-switch state is #420's; #431 reuses the identity and honors the `disable GitHub actions`
  switch. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
- **Enable the PR operator by default.** Rejected: the release switch must remain off until governance, auth,
  audit, evals, protected-area policy, kill switches, and rollback paths are verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

The GitHub App code, the work-initiation/issue-opener, the branch/PR creator, the label/CI-rerun caller, the
safe-fix pusher, the business-data guard implementation, the spec-first enforcement code, strict auto-merge and
its protected-area block (#432), the accountable-identity implementation (#430), the kill-switch state store
(#420), the audit-record store (#419), the approval/budget policy (#423), the isolated runtime package (#425),
the sandbox (#429), the model-policy capability (#421), any Supabase schema or Mission Control UI, and any live
autonomy — all deferred to later, separately-gated slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:241]
