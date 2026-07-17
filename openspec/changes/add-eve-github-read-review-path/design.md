# Design (provisional Eve label EVE-DESIGN-0012): Eve GitHub Read and Review Path

> **Numbering:** `EVE-DESIGN-0012` is a provisional cross-change label, not a canonical `docs/adr/` number. If this decision is accepted, its implementation PR must allocate the next available canonical number and update every reference, following `docs/adr/README.md`.

> This `design.md` uses provisional Eve design label **EVE-DESIGN-0012**, the GitHub-read-and-review-path decision required by issue #430. It
> builds on **EVE-DESIGN-0003** (#419, `add-eve-audit-tracer-bullet`), **EVE-DESIGN-0005** (#423,
> `add-eve-approval-budget-policy`), **EVE-DESIGN-0007** (#425, `add-eve-runtime-foundation`), and **EVE-DESIGN-0011** (#429,
> `add-eve-sandbox-engineering-worker`), and does not restate them — it operationalizes the path in which Eve
> responds to a GitHub PR trigger by reviewing and posting a summary plus inline findings through an accountable
> bot identity, policy-gated and audited, with protected-area detection visible, while the release switch stays
> off per #418. When accepted into `Asymmetric-al/core`, its ADR body should also be landed at the repo's ADR
> location (using the next available canonical number per `docs/adr/README.md`). Every grounded claim carries a `[VERIFIED-REPO: path:line]`
> citation read from `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.
> [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:224]

## Status

Proposed (partner draft for #430). Supersedes nothing. Builds on EVE-DESIGN-0003 (#419), EVE-DESIGN-0005 (#423), EVE-DESIGN-0007
(#425), and EVE-DESIGN-0011 (#429). Subordinate to OpenSpec and `AGENTS.md`. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

## Context

The implementation plan scopes slice 14 (#430, "GitHub App Read and Review Path") as an **AFK** slice **blocked
by slices 3, 7, 9, and 13** — the audit tracer bullet (#419), the approval/budget policy (#423), the standalone
runtime foundation (#425), and the sandbox engineering worker (#429) — and covering user stories 8, 9, 10, 32,
34, and 60. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:227]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:228] What it must prove is that
"Eve can respond to GitHub PR triggers by reviewing and posting summary plus inline findings with accountability
metadata," with acceptance that a "GitHub bot identity executes actions while accountable trigger is recorded,"
that "review comments are policy-gated and audited," and that "protected-area detection is visible in review
output." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:232]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:233]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:234]

The platform constraints already fix the path's shape. GitHub actions must "execute through a GitHub App or bot
identity, but every action records the accountable admin, GitHub sender, schedule, or system trigger" (US-8,
behavior). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:78]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380] A reviewer
wants Eve to automatically review PRs and post inline findings plus summary comments (US-9, US-10).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:82]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:85] Audit records
must reconstruct "who or what initiated the action, which tool or subagent ran, which model role was used, what
policy applied, what evidence was used, and what changed" (US-32).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170] The admin
wants "high-quality decision summaries instead of raw model reasoning" without "exposing hidden reasoning or
sensitive internals" (US-34). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
The GitHub-operator test constraint requires tests to "cover PR review, inline comments, ... protected-area
detection, ... and accountability metadata."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:546]

The autonomous-PR-operator behavior enumerates the full set of GitHub actions Eve may eventually take —
"review, comment, create inline findings, label, rerun CI, push safe fixes, update PR state, create issues,
create branches, and open PRs under policy." [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
The implementation plan deliberately splits that list: slice 14 (#430) is the **read-and-review** subset
(review, comment, inline findings), and slice 15 (#431) is the **mutating PR operator**, while slice 16 (#432)
owns strict auto-merge. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236] This
ADR fixes #430 at exactly the read-and-review subset and defers every mutating action.

**Partner-boundary note.** This is the program's first write to a surface **outside** the fleet — a review
posted to GitHub. The fleet data-boundary law forbids donor PII, payments, secrets, one-time codes, and tenant
facts from ever touching this infra; here it also forbids them from being **posted onto GitHub**. This ADR
therefore fixes the review output as a **decision summary** (US-34) that excludes raw model reasoning and
sensitive internals, and the path does not bypass GitHub branch protection, required reviews, or repository
policy. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629] Model
calls that produce the review resolve **only through #421's policy** (Vercel AI Gateway primary, direct
providers as controlled fallbacks) via the #425 runtime — keeping any partner GPU gateway a proposed,
non-default, revocable route rather than a hardcoded default.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]

## Decision

1. **Accountable bot identity.** Every GitHub review action — posting a review, a summary comment, or inline
   findings — executes through the GitHub App/bot identity, and every action records the accountable admin,
   GitHub sender, schedule, or system trigger. No review action is anonymous.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:78]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
2. **PR-triggered review, read-and-review only.** On a GitHub PR trigger, Eve reviews the PR and posts a summary
   comment plus inline findings close to the code. This path performs **no mutating PR operation** — no label,
   CI rerun, push, issue/branch/PR creation, PR-state change, or merge; those are #431 (slice 15) and #432
   (slice 16). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:85]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
3. **Policy-gated comments.** Every review comment and finding is gated by #423's approval/budget policy before
   it is posted; a comment Eve is not authorized to post is withheld, not posted, and the model spend to produce
   the review stays under #423's budgets. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:233]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
4. **Audited in the #419 record shape.** Every review action emits an audit record in #419's shape capturing who
   or what initiated it, which tool/subagent ran, which model role was used, what policy applied, what evidence
   was used, and what changed — the path emits, it does not redefine, the audit contract.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
5. **Protected-area detection visible in review output.** When a PR touches a repo-aware protected area (#417's
   set — auth, donations, payments, secrets, migrations, RLS, GitHub workflows, Vercel config, agent
   instructions, Eve config, runtime, dependencies, tenant resolution, admin access control, data-boundary), the
   detection is surfaced in the review output itself, not hidden. This path detects and **surfaces**; it does not
   block or perform a merge (that is #432). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:234]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
6. **Decision summary, no sensitive data on GitHub.** The posted review presents a high-quality decision summary
   — what and why — without raw model reasoning or sensitive internals, and it never carries donor PII, payments,
   secrets, one-time codes, tenant facts, or unredacted logs onto GitHub.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:627]
7. **Subordinate; grants no new authority.** The path runs on the #425 runtime inside the #429 sandbox checkout,
   resolves every model through #421 (Gateway-primary; never hardcoded), spends under #423 hard budgets, honors
   #420's `disable GitHub actions` kill switch (reading persisted state, never a prompt/model/tool claim), does
   not bypass GitHub branch protection or required reviews, stays disabled by default while the release switch is
   off, and never bypasses #417 protected-area/production-write/approval limits or #418 emergency-off precedence.
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
   [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Boundary with adjacent slices

- **#417 (ADR-0018, foundation):** owns the autonomy contract and protected-area set at spec level. #430's
  protected-area detection reads that set to surface it in review; it does not define it.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:52]
- **#419 (EVE-DESIGN-0003, audit):** owns the audit-record shape. #430 emits review-action audit records in that shape;
  it does not redefine it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
- **#420 (EVE-DESIGN-0004, kill-switch):** owns the kill-switch state, including the "disable GitHub actions" switch.
  #430 honors that switch; it does not persist switch state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
- **#421 (EVE-DESIGN-0006, model policy):** owns named roles and Gateway-primary routing. #430 resolves review models
  through that policy via the #425 runtime; it does not define routing.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
- **#423 (EVE-DESIGN-0005, approval/budget):** owns trust-zone approval and hard budgets. #430's comments are gated by
  that policy and its model spend stays under those budgets; it does not define them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- **#425 (EVE-DESIGN-0007, runtime foundation):** owns the isolated runtime package. #430 is review behavior that runs
  on it; it is not the runtime. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
- **#429 (EVE-DESIGN-0011, sandbox):** owns the contained writable checkout. #430 reads the PR/repo from that sandbox
  checkout; it is not the sandbox. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- **#431 (slice 15, PR operator) and #432 (slice 16, strict auto-merge):** own mutating PR operations and merge
  gating. #430 only reviews and posts findings; every mutating action and every merge decision is theirs.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]

## Verification contract

- OpenSpec validates: `bunx @fission-ai/openspec@latest validate add-eve-github-read-review-path --strict`.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- Existing repo gates remain required and unchanged (`format:check`, `skills:verify`, `lint`,
  `verify:workspace-contract`, `verify:eslint`, `typecheck`, `build`, `test:unit`, plus data-boundary
  verification). [VERIFIED-REPO: docs/ai/rules/general.md]
- The slice-specific acceptance tests — PR review, inline comments, protected-area detection, and accountability
  metadata — land with the implementing PR, not this spec/ADR.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:546]

## Consequences

- Positive: Eve's first external write becomes survivable because the path is confined to read-and-review with
  no mutating PR operations, every comment executes through an accountable bot identity, is policy-gated (#423)
  and audited (#419), protected-area detection is visible in the output, and the review is a decision summary
  with no sensitive data on GitHub. The path cannot hardcode a model provider, cannot spend past #423 budgets,
  cannot bypass branch protection, and cannot run while the release switch is off.
- Cost: the discipline of splitting review from mutation (some useful fixes wait for #431), and of keeping every
  posted comment inside the decision-summary and data-boundary contract.
- Risk if skipped: an ungated GitHub reviewer could post anonymous, unaudited comments, leak raw reasoning or
  sensitive internals onto GitHub, or silently take mutating PR actions with no accountability — exactly the
  failure the accountability-metadata and policy-gating acceptance forbids.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:232]

## Alternatives considered

- **Fold review and mutating PR operations into one slice.** Rejected: the implementation plan separates the
  read-and-review path (#430, slice 14) from the autonomous PR operator (#431, slice 15) so the low-stakes review
  surface ships and is verified before any mutating GitHub action.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **Post review comments without recording an accountable trigger.** Rejected: every GitHub action must record
  the accountable admin, sender, schedule, or system trigger.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
- **Post raw model reasoning as the review.** Rejected: the review must be a high-quality decision summary, not
  raw reasoning or sensitive internals.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
- **Give the review path its own kill-switch state.** Rejected: kill-switch state is #420's; #430 honors the
  `disable GitHub actions` switch and reads that persisted state.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
- **Enable the review path by default.** Rejected: the release switch must remain off until governance, auth,
  audit, evals, protected-area policy, kill switches, and rollback paths are verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]

## Out of scope (this change)

The GitHub App code, the PR-trigger/webhook handler, the review-comment poster, the protected-area detector
implementation, the accountability-metadata store, the mutating PR operations and their operator (#431), strict
auto-merge and its protected-area block (#432), the kill-switch state store (#420), the audit-record store
(#419), the approval/budget policy (#423), the isolated runtime package (#425), the sandbox (#429), the
model-policy capability (#421), any Supabase schema or Mission Control UI, and any live autonomy — all deferred
to later, separately-gated slices. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
