# PR Management Pipeline — Cursor Automations Architecture

> **Status:** DRAFT / working document. Local only; do not commit yet.
> **Owners:** Blake + Claude. **Last updated:** 2026-06-16 (rev 5 — real configs ingested, no-Actions constraint).

## The shape (three layers)

1. **WIDE REVIEW** — your ~50 Cursor reviewers (31 ingested) + native bots (Greptile→Codex, Bugbot)
   - CI. Each posts a titled PR comment carrying `<!-- CURSOR_AUTOMATION_ID … -->`.
2. **DIGEST + PLAN** — "Final merge gate and review writer" (→ "General Merge Gate Review", **can
   approve**) consolidates; "Minimal safe-fix planner" (→ "Simple Safe-Fix Plan") gives the fix list.
3. **ACT + MERGE** — Merge Captain (Slack) writes the fixes; **the merge itself is the open question
   (see "The one hard constraint").**

## The one hard constraint: nothing in Cursor can label or merge

You want **no GitHub Actions**. But the Cursor tool list is: Comment on PR (with/without approve),
Open PR, Request Reviewers, Slack/Teams, MCP, Memories. **There is no "add label" tool and no "merge"
tool.** So two functions cannot be a Cursor automation:

- **Labeling** — not actually needed. We drop labels for chaining and use **"Checks completed"
  triggers + self-settle-detection** instead (each agent reads the PR's existing comments and exits
  if its work is already done or prerequisites are missing). This honors "no Actions" cleanly.
- **Merging** — genuinely has no Cursor tool. The three options (pick one — see decision):
  - **(A) You click merge** on PRs the Final Merge Gate approved + checks green. Tiny manual step;
    fully Cursor-native; gives you a 5-second final glance. No Actions.
  - **(B) GitHub native auto-merge**, armed per-PR. Still needs _someone_ to arm it; no Cursor tool
    does, so in practice you arm it or we keep one tiny Action. Not truly hands-off without an Action.
  - **(C) One minimal GitHub Action** that merges when the Final Gate has approved + checks pass.
    Fully hands-off, but it's a GitHub Action (the thing you wanted to avoid).
    **Recommendation: (A)** — it's the only fully-hands-off-of-Actions option, and the Final Merge Gate
    already does the hard part (review + approve). You merge approved+green PRs with one click.

> Note: this also means the `pr-signal-coordinator` GitHub Action and the `automation:*` labels can be
> retired — the Cursor-only design doesn't use them.

## Config findings from the 31 ingested (fix these)

1. **Two bots trigger on `DRAFT_OPENED`, not `OPENED`:** _Next.js Hydration and SSR Consistency
   Review_ and _Architecture, Boundaries, and Coupling reviewer_. They fire on draft creation and
   **never on the real opened PR**. Change both to the standard trigger (Checks completed — see below).
2. **"Critical Bug Finding" is a MUTATOR** — its prompt lets it _implement a fix and open a PR_. That
   breaks "reviews are read-only." Either make it review-only (flag, no PR), or keep it but know it's
   the one reviewer that pushes. **Recommend: make it review-only**; the Merge Captain owns fixes.
3. **Models:** 30 on `composer-2.5`, 1 (_React & Next.js_) on `gpt-5.4-high`. Keep reviewers on the
   cheaper model; reserve the strongest model for the **Digest, Planner, and Merge Captain** only.
4. **MCP bloat:** most bots attach Supabase + Nia + Context7 (+ sometimes Stripe/Vercel/Resend). Each
   connection adds startup cost. Trim each lane to the MCPs it needs (e.g. frontend lanes rarely need
   Stripe/Supabase).
5. **Overlap = your biggest cost lever.** Six bots are general bug/quality reviewers with heavy
   overlap: _Critical Bug Finding, Bug Finder 2.0, Pre-Mortem Bug Finder, Thermonuclear, Catch-All
   Blind Spot, Intuition_. Keeping all six runs 6× the cost for diminishing signal. **Consider merging
   to ~2** (one systematic bug finder + one adversarial pre-mortem). Optional but high-value.

## Triggering (no labels): all reviewers fire on "Checks completed"

- Change every reviewer's trigger from "PR opened"/"Draft opened" to **GitHub → Checks completed**.
  This waits for CI (gates on green-ish build, skips nothing on drafts since drafts don't run the
  full gate), and is the no-Action way to "wait for CI." Add a prompt guard: "if my titled comment
  already exists for this commit, exit."
- Lane scoping (cost): Cursor triggers can't filter by changed path, so true lane-gating needs a
  router that applies a signal — which needs an Action or a label. **Without Actions, the cheapest
  lever is consolidation (finding #5) + putting non-core lanes on a manual/scheduled trigger**, not
  per-PR. Core reviewers run every PR; specialist lanes you can run on demand.

## Per-automation map (ingested 31 of ~53)

Legend: **C**=always-on core · lane · title (parse key) · trigger-fix · model-tier.

| Automation                         | Group               | Comment title                                     | Notes                            |
| ---------------------------------- | ------------------- | ------------------------------------------------- | -------------------------------- |
| Find Vulnerabilities               | **C / security**    | Vulnerability Check                               | core, every PR                   |
| Critical Bug Finding               | **C / correctness** | Critical Bug Check                                | **make read-only**               |
| Bug Finder 2.0                     | correctness         | Bug Finder v2                                     | merge-candidate w/ below         |
| Pre-Mortem Bug Finder              | correctness         | Pre-Mortem Bug Finder                             | merge-candidate                  |
| Thermonuclear Cursor Code Review   | correctness         | Thermo-Nuclear Code Quality Review                | merge-candidate                  |
| Catch-All Blind Spot Reviewer      | correctness         | Blind Spot Review                                 | merge-candidate                  |
| Intuition Reviewer                 | correctness         | Intuition Review                                  | merge-candidate                  |
| Mutation Resistance Checker        | correctness/data    | Mutation Resistance Review                        | strong, keep                     |
| Invariant & State-Machine Checker  | correctness/state   | Invariant & State-Machine Review                  | keep                             |
| TypeScript Checker                 | correctness/types   | TypeScript Correctness Review                     | keep                             |
| Clean Code Check                   | quality             | Clean Code Review                                 | low-severity lane                |
| Overengineering Review             | quality             | Over-Engineering Check                            | low-severity lane                |
| Style, Clarity, and Readability    | quality             | Style, Clarity, and Readability Review            | low-severity lane                |
| Technical Debt PR Review           | architecture        | Technical Debt PR Review                          | structural lane                  |
| Improve Codebase Architecture      | architecture        | Improve Codebase Architecture Review              | structural lane                  |
| Architecture, Boundaries, Coupling | architecture        | Architecture, Boundaries, and Coupling Review     | **fix draft trigger**            |
| File by File Semantic Diff         | architecture        | File by File Semantic Diff Reviewer               | meta lane                        |
| Contract Compatibility Checker     | backend/contracts   | Contract Compatibility Review                     | keep                             |
| API Quality Check                  | backend/api         | API Quality Review                                | backend lane                     |
| Shadcn UI Review                   | frontend            | Shadcn/UI Review                                  | frontend lane                    |
| GUI Check                          | frontend            | GUI Review                                        | frontend lane                    |
| Accessibility Regression Checker   | frontend/a11y       | Accessibility Regression Review                   | frontend lane                    |
| Frontend, UX, client-behavior      | frontend            | Frontend, UX, and Client-Behavior Review          | frontend lane                    |
| React & Next.js Review             | frontend            | React & Next.js Review                            | **gpt-5.4-high → revisit**       |
| Cache Components Review            | frontend/next       | Cache Component Review                            | next lane                        |
| Next.js Hydration & SSR            | frontend/next       | Next.js Hydration and SSR Consistency Review      | **fix draft trigger**            |
| PR Intent Accomplishment           | **C / intent**      | PR Intent Accomplishment Review                   | core                             |
| Product Intent Alignment           | intent              | Product Intent Alignment Review                   | intent lane                      |
| Docs, Setup, Runbook, Consistency  | docs                | Docs, Setup, Runbook, and Repo-Consistency Review | docs lane                        |
| **Final merge gate**               | **DIGEST**          | General Merge Gate Review                         | **allowApprove=true** → the gate |
| **Minimal safe-fix planner**       | **PLAN**            | Simple Safe-Fix Plan                              | feeds Merge Captain              |

## One tight shared line to add to every reviewer prompt

```
End your comment with exactly one final line, nothing after it:
SEVERITY: Blocker | High | Medium | Suggestion | None
```

Most bots already use Blocker/High/Medium/Suggestion, so this just makes it machine-parseable for the
Digest. (The CURSOR_AUTOMATION_ID gives bot identity for free.)

## Flow (no-Actions version)

1. PR opened → CI runs (GitHub) → "Checks completed" fires the reviewers (core every PR; specialist
   lanes per your scoping/consolidation choices).
2. Reviewers comment. Each exits early if its comment already exists for the head commit.
3. **Final Merge Gate** self-detects settle (its prompt already reads PR comments + CI), posts
   "General Merge Gate Review", and **approves** or **requests changes**.
4. **Minimal Safe-Fix Planner** posts "Simple Safe-Fix Plan".
5. You post Slack `/merge #NN` → **Merge Captain** applies the plan (code + tests), pushes.
6. **Merge** per the decision above (recommend: you click merge on approved + green).

## Merge mechanism — DECIDED: GitHub native auto-merge

- Repo "Allow auto-merge" already enabled.
- **Arming:** no Cursor tool can enable auto-merge, so the **PR author clicks "Enable auto-merge"
  once at PR-open** (upfront, then forget). One click per PR; no Action.
- **Branch protection on `develop` (re-add):** require **1 approving review** (satisfied by the Final
  Merge Gate's `allowApprove` review) + required checks (`ci-gate`, `integration-gate`). This
  reverses the earlier "remove required review" change — now the gate's reviewer is the bot, not a human.
- **Sequencing:** the Gate approves clean PRs immediately → auto-merge fires. On PRs with blockers,
  the Merge Captain fixes first, then the Gate re-approves the fixed commit (a push dismisses the
  prior approval). Build the Captain to run before the final Gate approval on blocker PRs.

## Open decisions

1. ~~Merge mechanism~~ — DECIDED above (native auto-merge).
2. **Critical Bug Finding** — make read-only? _Recommend yes._
3. **Consolidate the 6 overlapping bug bots → ~2?** _Recommend yes; biggest cost saver._
4. **Remaining ~22 automations** — send the rest and I'll slot them into this table.

## Parked

- OpenSpec Guardian / QA Foreman (authoring stage). Severity-gate required check. Lane-router (needs
  an Action, so parked under the no-Actions constraint).
