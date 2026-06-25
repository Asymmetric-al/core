# Re-run tiers + activation

## 1. Re-run tiers (the cost vs. bugs answer)

A fix commit must re-verify the **change**, not restart the whole battery. Two guard variants —
only the guard line differs:

- **Tier 1 — re-run on every commit** (per-commit guard):
  `SKIP-IF-DONE: If a comment titled "<title>" already exists on the PR's current head commit, exit.`
- **Tier 2 — run once per PR** (per-PR guard):
  `SKIP-IF-DONE: If a comment titled "<title>" already exists anywhere on this PR, exit.`

| Tier                      | Bots                                                                                                                                                                               | Why                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **0 (always, automatic)** | CI (`ci-gate`, `integration-gate`) + the **GitHub merge coordinator**                                                                                                              | tests must re-run; the coordinator re-reads every head's verdicts each tick — the catch-all backstop |
| **1 — per-commit**        | **Systematic Bug & Correctness · Adversarial Pre-Mortem & Blind-Spot · Find Vulnerabilities (Security)**                                                                           | a hasty fix is the #1 source of new bugs; these catch it on the changed code                         |
| **2 — once per PR**       | Architecture & Complexity · Clean Code & Readability · UI / Design-System · React & Next.js · Intent & Product Alignment · Accessibility Regression · Contract & API Compatibility | a small scoped fix rarely flips these verdicts; their value is the first deep pass                   |

**Minimal Safe-Fix Planner:** per-commit (re-plans each head; its `blocking=N` marker is what the
merge coordinator reads to decide merge vs. fix). **Final Merge Gate:** per-commit, **advisory** —
the GitHub merge coordinator, not this bot, decides the merge.

Result: on a fix, only **CI + the 2 per-commit bug bots + the Safe-Fix Planner** re-run (≈3 vs 17+),
so a fix-introduced bug gets caught on the changed code while the expensive perspective lenses don't
re-fire. The GitHub coordinator re-reads the verdicts on every tick. That's the convergence + cost fix.

## 2. The two GitHub Actions (the merge brain lives here, not in Cursor)

- `.github/workflows/auto-merge.yml` + `scripts/github/merge-coordinator.mjs` — **the merge
  coordinator.** Runs on a schedule (every 10 min) and on each CI completion (`check_suite`). For
  each open develop PR on its current head it reads the **`cursor[bot]` PR reviews** (the bots post
  verdicts as reviews, not issue comments) — their `SEVERITY:` lines + the Safe-Fix Plan's
  `blocking=N` — plus CI, then:
  - clean (CI green, bug bots fresh, no Blocker/High, plan clear, settled) → **arm GitHub auto-merge**;
  - branch **behind** develop → **update the branch** (merge develop in; no AI), capped then escalates;
  - branch **conflicts** with develop (`dirty`) → **escalate to `needs-human`** (recoverable) for a
    person/agent to rebase — we do **not** auto-resolve conflicts with an automated agent;
  - Safe-Fix Plan blockers present → **dispatch `autofix.yml`**;
  - CI green but a Tier-1 bot review is missing past the stale window → **re-run CI to re-fire the
    reviewers** (a "nudge", capped) before giving up;
  - otherwise → wait for the next tick.
    This is why nothing in Cursor needs to "decide" the merge — the coordinator re-checks as often as
    needed, so clean PRs never stall.
- `.github/workflows/autofix.yml` + `scripts/github/autofix-guard.mjs` — dispatched by the
  coordinator. A headless `cursor-agent` implements the Safe-Fix Plan's blocking items and commits to
  the PR branch. 3-round cap → `needs-human`; a no-op fix also escalates to `needs-human`.

### Self-healing escalation (no permanent trapdoors)

`needs-human` is no longer a one-way door:

- **Dispatch failures are not terminal.** Launching `autofix.yml` retries inline, and if it still
  fails the coordinator just waits and retries on the next tick — only after a per-head attempt
  budget does it escalate (recoverably). Update-branch failures are bounded the same way.
- **"Stale" first nudges.** If CI is green but a Tier-1 bot never posted, the coordinator re-runs CI
  to re-fire the reviewers (up to a small budget) before escalating.
- **Reversible escalation.** Escalations the coordinator makes carry the `automation:auto-escalated`
  label and are **auto-cleared** when the head changes (someone pushed a fix) or the PR becomes
  merge-ready. A **human-set** `needs-human` (no marker) is a hard stop the coordinator never touches.

Per-head counters (fix/update/nudge attempts) live in a single self-updating
`<!-- coord-state … -->` PR comment that resets when the head changes.

> **Why these must live on `production`:** GitHub runs schedule / comment / check-triggered workflows
> from the **default branch** (here `production`), and `workflow_dispatch` targets need to exist on it
> too. So both workflows must be on `production` to fire — even though they operate on **develop** PRs.

## 3. Activation (one-time)

1. **Secrets — DONE** (verified): `CURSOR_API_KEY` (org secret, visible to `core`) and the PAT.
   The PAT needs **contents:write** + **pull-requests:write** (both present) and **actions:write**
   (so the coordinator can dispatch autofix — confirm this is enabled). `core` is public, so the org
   secret works. Used for the fix **push** so it re-triggers CI + reviews (a `GITHUB_TOKEN` push does
   **not**), and for the merge commit to attribute to an allow-listed identity (passes
   `verify:git-attribution`).
2. **Confirm** the `needs-human` label exists (it does) and repo "Allow auto-merge" is on (it is).
3. **Land the files on `develop`, then release `develop → production`.** The workflows are inert
   until they reach `production` (the default branch) — see the note in section 2.
4. **Cursor side:** every reviewer has "Comment on Pull Request" (approval can be OFF on all of them
   now); the Safe-Fix Planner emits `<!-- fix-plan blocking=N -->`. No bot needs push/merge/approval.
5. **Smoke test** on one PR: open it → reviewers comment → coordinator arms auto-merge → it merges;
   or a reviewer flags a blocker + the planner lists it → coordinator dispatches autofix → fix pushed
   → re-review → coordinator merges.

## 4. End-to-end (final)

PR opens → CI → reviewers comment (Tier-2 once, Tier-1 each head) + Safe-Fix Planner posts
`blocking=N`. The **merge coordinator** (cron + PR events) reads those: **clean → arms auto-merge →
GitHub merges**; **blocking items → dispatches autofix**, which runs `cursor-agent`, pushes the fix to
the same branch → CI + Tier-1 bots + planner re-run → coordinator re-checks → merges. Bounded by the
3-round cap. No human interaction in the steady state.

> Note (verify before relying): `cursor-agent` install path / flags (`-p`, `--force`, `--model`) per
> `cursor-agent --help`; that a headless run authenticates via `CURSOR_API_KEY`; and run one real
> smoke test, since the coordinator's CI/severity parsing can't be exercised from a sandbox.
