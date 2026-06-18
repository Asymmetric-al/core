# PR Pipeline — Build Spec (Cursor automations + auto-merge)

> Apply-ready spec. Bots are configured in your Cursor dashboard (I can't edit those for you); the
> auto-merge piece is a GitHub change I can push on your go. Last updated 2026-06-16.

## 0. Hands-off auto-merge (the one required GitHub Action)

Cursor has no merge tool and no way to arm GitHub's per-PR auto-merge, so zero-interaction merge needs
one small Action. It is the **gate**: it merges a PR only when the **Final Merge Gate approved** it and
required checks are green. No labels, no per-PR clicks.

**No branch-protection change needed** — `develop` already requires `ci-gate` + `integration-gate`,
and the Action enforces the "gate approved" condition itself (so we don't depend on a bot approval
counting toward branch protection).

`.github/workflows/auto-merge.yml`:

```yaml
name: Auto-merge gate-approved PRs
on:
  pull_request_review:
    types: [submitted]
  check_suite:
    types: [completed]
  schedule:
    - cron: "*/10 * * * *"
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
  checks: read
jobs:
  automerge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { persist-credentials: false }
      - name: Arm auto-merge on gate-approved, green PRs
        env:
          GH_TOKEN: ${{ github.token }}
        run: node scripts/github/auto-merge-coordinator.mjs
```

`scripts/github/auto-merge-coordinator.mjs` (logic): for each open, non-draft PR into `develop` that
does **not** carry `needs-human`, enable auto-merge when **both** hold:

1. An **approving review** exists whose body contains the marker `<!-- gate:approved -->` (emitted by
   the Final Merge Gate when it approves — see §5), on the current head SHA.
2. Required checks `ci-gate` and `integration-gate` are `success`.

Then run the equivalent of `gh pr merge <n> --auto --merge`. GitHub completes the merge the moment the
conditions are satisfied. If the head changes (Merge Captain pushed a fix), the gate's approval is
dismissed and must re-approve the new head — the cron re-evaluates. (I'll write the full script when
you say go; ~60 lines, mirrors the existing `pr-signal-coordinator.mjs` style.)

**Repo setting:** "Allow auto-merge" is already enabled.

---

## 1. Shared review contract (apply to EVERY reviewer)

Set these on all reviewer automations:

- **Trigger:** GitHub → **Checks completed** (repo `Asymmetric-al/core`). Replaces all the
  `PR opened` / `Draft opened` triggers. This waits for CI and never runs on raw drafts.
- **Model:** `composer-2.5` for reviewers. Strongest available model only for the **Final Merge Gate**,
  **Minimal Safe-Fix Planner**, and **Merge Captain**.
- **Tools:** Comment on Pull Request (**Don't Allow PR Approval** — except the Final Merge Gate).
  MCPs: attach only what the lane needs (most lanes: none or Nia; security/backend: Supabase; payments:
  Stripe). Drop the blanket Supabase+Nia+Context7+Stripe+Vercel+Resend stack everywhere else.
- **Prompt guard (first line):** `If a comment titled "<this bot's title>" already exists on the PR's current head commit, exit without commenting.`
- **Output (last line, every bot):** `SEVERITY: Blocker | High | Medium | Suggestion | None`
- Keep each bot's existing "explain technically AND in plain language" instruction.

---

## 2. Final roster (19): from 31

**Kept (10) — apply §1 universal fixes only, keep their existing prompt:**
Find Vulnerabilities · Invariant & State-Machine Checker · Accessibility Regression Checker ·
Mutation Resistance Checker · Contract Compatibility Checker · TypeScript Checker ·
Docs/Setup/Runbook/Consistency · Frontend, UX & Client-Behavior · File-by-File Semantic Diff ·
API Quality Check.

**Consolidated (7 new) — create these, paste prompts from §4:**
Systematic Bug & Correctness · Adversarial Pre-Mortem & Blind-Spot · Architecture, Coupling &
Complexity · Clean Code & Readability · React & Next.js Correctness · UI & Design-System · Intent &
Product Alignment.

**Gate (2) — update per §5:** Final Merge Gate · Minimal Safe-Fix Planner.

---

## 3. DELETE these 21 (replaced by the 7 consolidations)

- → **Systematic Bug & Correctness:** Critical Bug Finding, Bug Finder 2.0, Thermonuclear Cursor Code Review
- → **Adversarial Pre-Mortem & Blind-Spot:** Pre-Mortem Bug Finder, Catch-All Blind Spot Reviewer, Intuition Reviewer
- → **Architecture, Coupling & Complexity:** Improve Codebase Architecture, Technical Debt PR Review, Overengineering Review, Architecture/Boundaries/Coupling
- → **Clean Code & Readability:** Clean Code Check, Style/Clarity/Readability Reviewer
- → **React & Next.js Correctness:** React & Next.js Review, Cache Components Review, Next.js Hydration & SSR
- → **UI & Design-System:** Shadcn UI Review, GUI Check
- → **Intent & Product Alignment:** PR Intent Accomplishment Review, Product Intent Alignment

(Also note: the old **Critical Bug Finding** could open fix PRs — that mutator behavior is gone; the
new Systematic Bug bot is review-only, and the **Merge Captain** owns all fixes.)

---

## 4. The 7 consolidated prompts

Each one: follow the §1 shared contract (trigger, guard, severity line, technical+plain wording).
Review against the PR's **target base branch + merged state**, read root/nested `AGENTS.md` and
relevant `openspec/**` first, report **only high-confidence findings with `file:line` evidence**,
separate Blocker/High/Medium/Suggestion, and end with the verdict + the `SEVERITY:` line.

### Systematic Bug & Correctness — title: `Critical Bug Check`

Find real correctness bugs and regressions introduced or exposed by this PR: data loss/corruption,
race conditions, null/undefined in critical paths, auth/permission bypass, broken contracts, swallowed
errors, wrong status/branch logic, async/await mistakes. Trace each to root cause through the caller
chain — never stop at the symptom line. You must describe a concrete trigger scenario; no speculation,
no style nits. Note whether existing tests would catch it. **Review-only: do not edit code or open
PRs.** For each: root cause, evidence, smallest safe fix, must-fix-before-merge or not.

### Adversarial Pre-Mortem & Blind-Spot — title: `Pre-Mortem Bug Finder`

Hunt failures that haven't surfaced yet, then step back for a whole-PR senior read. Use these lenses:
invariants (what must always hold), input boundaries/edge classes, dangerous valid-input combinations,
state transitions (duplicate submit, cancel mid-flow, stale response, fail-then-retry), and
mutation-mindset ("what tiny logic change would survive the current tests?"). Then add the wide-angle
pass: suspicious absences (changed behavior with no test/doc), comment-pattern signals (many small
comments circling one deeper issue), false-confidence (green CI that proves nothing), and
merged-state surprises. Stay grounded — every "feels off" must cite concrete evidence. Name the input
class / combination / transition / missing assertion, not vague worries.

### Architecture, Coupling & Complexity — title: `Architecture & Complexity Review`

Judge how this PR fits the system: module depth vs shallow fragmentation, leverage, locality,
ownership boundaries, and the repo's data-access boundary (thin route handlers; business logic in
`@asym/api`; no direct Supabase imports in app routes). Flag new/worsened coupling (name the exact
dependency + blast radius), needless complexity / overengineering / premature abstraction, and
technical debt **introduced** by this PR (vs pre-existing or paid-down) with who pays the future cost.
Use the deletion test on suspect abstractions. Don't demand rewrites where a small boundary-safe fix
works; don't turn taste into a blocker.

### Clean Code & Readability — title: `Clean Code Review`

High-signal readability/maintainability only (the formatter owns style). Flag: vague names in wide
scope or exported APIs; functions/components/hooks doing too much; mixed abstraction levels; dishonest
names hiding side effects; too many args / flag args; meaningful duplication of business rules;
comments that paraphrase code or hide confusing code; deep nesting/condition chains that should be
named predicates; tests that are hard to read because the production unit does too much. Apply the
Boy-Scout rule for small wins. Skip trivial nits.

### React & Next.js Correctness — title: `React & Next.js Review`

Next.js App Router + RSC correctness for the installed version (read `node_modules/next/dist/docs`
before version-specific claims). Cover: file conventions / route structure; server vs client boundary
(no async client components, no `'use client'` pushed too high, no server-only leaks); async APIs
(`params`/`searchParams`/`cookies`/`headers`); serialization across the boundary; **hydration/SSR
mismatches** (browser APIs / `Date` / random in render, `suppressHydrationWarning` masking); **Cache
Components** (`use cache`, `cacheLife`, `cacheTag`, `revalidateTag`/`updateTag`, no runtime APIs inside
a cached scope, missing `Suspense`, missing invalidation after mutation); data-fetching waterfalls;
bundle/rerender hot paths. Don't fight intentional patterns; flag real risk only.

### UI & Design-System — title: `UI / Design-System Review`

shadcn/ui + Maia theme + Tailwind v4 + Base UI correctness. Check: right component for the job and
valid composition (overlays have titles, group items inside groups, Avatar fallback, Card structure);
`base` vs `radix` API correctness; forms use Field/FieldGroup with proper validation/labels; semantic
tokens not raw Tailwind colors or manual `dark:` overrides; correct icon library + `data-icon`; Maia
softness/spacing/radius cohesion; no custom markup where a shadcn primitive exists. Then name the
smallest right test level (static / component / browser / visual / e2e) for the changed UI. Don't
nitpick visual taste; flag real design-system drift, a11y structure breaks, and API misuse.

### Intent & Product Alignment — title: `Intent & Product Alignment Review`

Two questions, grounded in `openspec/**` + repo docs: (1) Does the PR actually accomplish its stated
goal, fully and correctly, in a repo-appropriate way — or does it under-deliver, overreach, fix a
symptom, or only make success plausible? (2) Does it fit documented product intent for the touched
surface (admin / donor / missionary / shared), or does it drift, change durable behavior without
updating OpenSpec, or land in the wrong boundary? Distinguish stated-goal vs actual-code-behavior, and
proof vs assumption. If durable behavior changed without an OpenSpec/doc update, that's a finding.

---

## 5. Gate bots (keep, update)

### Final Merge Gate — title: `General Merge Gate Review` — KEEP `allowApprove: true`

- Trigger: **Checks completed** (per §1). Strongest model.
- Add settle-guard: _only proceed if the expected reviewer comments are present on this head, or it has
  been quiet ~10 min since the last review comment; else exit._
- It already approves/requests-changes. **When it approves, the approving review body must end with the
  exact marker `<!-- gate:approved -->`** (this is what the auto-merge Action keys on). When it is not
  satisfied, request changes (no marker).

### Minimal Safe-Fix Planner — title: `Simple Safe-Fix Plan`

- Trigger: **Checks completed** (runs alongside the gate). Strongest model. Keep prompt.
- Add final marker line: `<!-- fix-plan blocking=<N> split=<yes|no> -->`. The Merge Captain reads this.

### Merge Captain (Slack-triggered — new automation)

- Trigger: Slack message matching `/merge\s+#?\d+/` in your chosen channel. Strongest model.
- Tools: Comment on PR, Open PR, push commits, Send to Slack.
- Prompt: parse the PR # from Slack; read the `Simple Safe-Fix Plan` + `General Merge Gate Review`;
  implement only the **must-fix / blocking** items and write the flagged missing tests; keep the branch
  current; never weaken tests/CI; never push to `production`; post a plain-English `Merge Report`. It
  does **not** merge — once it pushes, the gate re-approves the new head and the auto-merge Action lands
  it. Cap: ≤5 fix rounds / ≤6 pushes (tracked in a pinned `<!-- merge-captain-state -->` comment) then
  label `needs-human` and stop.

---

## 6. What you do vs what I do

**You (Cursor dashboard):** delete the 21 in §3; create the 7 in §4 + the Merge Captain in §5; apply
the §1 universal fixes (trigger → Checks completed, severity line, guard, MCP trim) to the 10 kept + 2
gate bots; add the two gate markers (§5).

**Me (on your go):** add `auto-merge.yml` + `auto-merge-coordinator.mjs` (via a PR), confirm the
`needs-human` label exists, and verify the loop on one real PR end-to-end.
