# Proposal: Eve GitHub read and review path

**Prepared by the Eve partner fleet for Eve / Asymmetric.**

> **Partner DRAFT for GitHub issue #430 ("Eve: GitHub App Read and Review Path").** Staged in the Gitea
> `proposals` repo; NOT a change to `Asymmetric-al/core`, and enters that repo only through Asymmetric's
> OpenSpec workflow after operator/maintainer sign-off. **Builds on #419** (`add-eve-audit-tracer-bullet`,
> ADR-0003), **#423** (`add-eve-approval-budget-policy`, ADR-0005), **#425** (`add-eve-runtime-foundation`,
> ADR-0007), and **#429** (`add-eve-sandbox-engineering-worker`, ADR-0011) — the four slices the implementation
> plan names as #430's blockers. It does not restate their contracts; it defines the **read-and-review path** in
> which Eve responds to a GitHub PR trigger by reviewing and posting a summary plus inline findings through an
> accountable bot identity, policy-gated and audited, with protected-area detection visible — while the release
> switch stays off. Every grounded claim carries a `[VERIFIED-REPO: path:line]` citation read from
> `Asymmetric-al/core` at commit `f535c035` on 2026-07-04.

## Why

The implementation plan scopes slice 14 as the **GitHub App Read and Review Path**, issue **#430**, an **AFK**
slice **blocked by slices 3, 7, 9, and 13** — the audit tracer bullet (#419), the approval/budget policy
(#423), the standalone runtime foundation (#425), and the sandbox engineering worker (#429).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:224]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:226]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:227] All four blockers are already
proposed, so #430 is unblocked. Its stated purpose is to prove that "Eve can respond to GitHub PR triggers by
reviewing and posting summary plus inline findings with accountability metadata," with acceptance that a
"GitHub bot identity executes actions while accountable trigger is recorded," that "review comments are
policy-gated and audited," and that "protected-area detection is visible in review output."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:232]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:233]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:234] It covers user stories 8, 9,
10, 32, 34, and 60. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:228]

The platform constraints already fix the shape. A platform owner wants "Eve's GitHub actions to execute through
a bot while recording the accountable human or trigger, so that GitHub automation is practical and auditable"
(US-8); a reviewer wants Eve to "automatically review PRs, so that risks are surfaced quickly" (US-9) and to
"post inline findings and summary comments, so that feedback is close to the code and easy to act on" (US-10); a
platform owner wants "rich audit records for every meaningful Eve action" that reconstruct "who or what
initiated the action, which tool or subagent ran, which model role was used, what policy applied, what evidence
was used, and what changed" (US-32); an admin user wants "high-quality decision summaries instead of raw model
reasoning" without "exposing hidden reasoning or sensitive internals" (US-34); and a platform owner wants Eve to
"monitor ... protected-area PRs ... so that engineering health is continuously visible" (US-60).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:78]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:82]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:85]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:278] The behavior
constraint is explicit: "GitHub actions execute through a GitHub App or bot identity, but every action records
the accountable admin, GitHub sender, schedule, or system trigger."
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]

This is the first slice where Eve writes to a surface **outside** the fleet — a PR review posted to GitHub. Two
boundaries make that survivable. First, it is **read-and-review only**: this path reviews and posts a summary
plus inline findings; the mutating PR operations — label, rerun CI, push safe fixes, update PR state, create
issues/branches/PRs, and any auto-merge — remain the autonomous PR operator's scope (#431, slice 15) and the
strict-auto-merge policy's scope (#432, slice 16), never this change.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236] Second, every posted comment
is **policy-gated** (#423) and **audited** (#419) through an **accountable bot identity**, protected-area
detection is **surfaced in the review output** rather than hidden, and the output is a **decision summary** that
never carries donor PII, payments, secrets, or unredacted logs onto GitHub — honoring the fleet data-boundary
law on an external surface. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:627]

## What Changes

- Add a new OpenSpec capability `eve-github-read-review-path` (spec delta in
  `specs/eve-github-read-review-path/spec.md`) stating: every GitHub review action executes through a **bot
  identity with the accountable admin/sender/schedule/system trigger recorded**; on a **GitHub PR trigger** Eve
  **reviews the PR and posts a summary plus inline findings**, and this path performs **no mutating PR
  operations** (no label, CI rerun, push, issue/branch/PR creation, PR-state change, or merge); every posted
  comment is **policy-gated by #423**; every review action is **audited in #419's record shape**; **protected-area
  detection is visible in the review output**; the review is a **decision summary, not raw model reasoning**, and
  carries **no PII/payments/secrets/unredacted logs** onto GitHub; and the path **grants no new authority** — it
  runs on the #425 runtime inside the #429 sandbox checkout, resolves models through #421, spends under #423,
  honors #420's `disable GitHub actions` switch, does not bypass GitHub branch protection or required reviews,
  stays disabled by default while the release switch is off, and never bypasses #417 protected-area or #418
  emergency-off precedence.
- Record the decision as **ADR-0012** in this change's `design.md`, building on ADR-0003 (#419), ADR-0005
  (#423), ADR-0007 (#425), and ADR-0011 (#429).

## What Does Not Change

- This change adds **no GitHub App code, no webhook/trigger handler, no review-comment poster, and no
  protected-area detector implementation**; it defines the read-and-review capability, its accountability and
  policy-gating contract, and its verification boundary while the system stays disabled by default (per #418) and
  the release switch stays off. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
- The **mutating PR operations** — label, rerun CI, push safe fixes, update PR state, create issues/branches/PRs
  — remain the **autonomous PR operator's** scope (#431, slice 15); this path only reviews and posts findings.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]
- **Strict auto-merge** and its protected-area **block** remain the auto-merge policy's scope (#432, slice 16);
  #430 makes protected-area detection **visible in review**, it does not gate or perform merges.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
- The **audit-record shape** remains #419's scope; the path emits review-action audit records **in** that shape,
  it does not redefine it. The **approval/budget policy** remains #423's scope; posted comments are gated **by**
  it and model spend stays **under** it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
- The **isolated runtime package** remains #425's scope and the **contained sandbox** remains #429's scope; #430
  is the review behavior that **runs on** the runtime **inside** the sandbox checkout, not either of them. The
  **model-policy capability** remains #421's scope; the review resolves models **through** it, never hardcoding a
  provider. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:210]
- No donor PII, payments, secrets, one-time codes, or tenant facts are posted to GitHub or enter this path — that
  boundary is reinforced here, never relaxed. No Supabase schema, Mission Control UI, or provider-client code
  lands. This change does not bypass GitHub branch protection, required reviews, or repository policy. #417's
  contract, `AGENTS.md`, `openspec/project.md`, `openspec/specs/**`, and existing CI gates remain authoritative
  and unchanged; this change is subordinate to them.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
  [VERIFIED-REPO: AGENTS.md] [VERIFIED-REPO: openspec/project.md]

## Expected Outcome

- A validated OpenSpec change
  (`bunx @fission-ai/openspec@latest validate add-eve-github-read-review-path --strict`) that makes the
  read-and-review path — accountable bot identity, PR-triggered review with summary plus inline findings, no
  mutating PR operations, policy-gated and audited comments, visible protected-area detection, and a decision
  summary with no sensitive data on GitHub — a durable, spec-level contract.
  [VERIFIED-REPO: docs/ai/rules/openspec.md]
- ADR-0012 of record for the GitHub read and review path, traceable from ADR-0003 (#419), ADR-0005 (#423),
  ADR-0007 (#425), and ADR-0011 (#429).
- A clear boundary: #419 owns the audit shape; #423 owns approval/budget; #425 owns the runtime; #429 owns the
  sandbox; #421 owns model policy; #431 owns mutating PR operations; #432 owns strict auto-merge; #430 owns the
  **read-and-review path** those compose in, and it stays off until governance is verified.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
