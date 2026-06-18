# Re-run tiers + activation

## 1. Re-run tiers (the cost vs. bugs answer)

A fix commit must re-verify the **change**, not restart the whole battery. Two guard variants —
only the guard line differs:

- **Tier 1 — re-run on every commit** (per-commit guard):
  `SKIP-IF-DONE: If a comment titled "<title>" already exists on the PR's current head commit, exit.`
- **Tier 2 — run once per PR** (per-PR guard):
  `SKIP-IF-DONE: If a comment titled "<title>" already exists anywhere on this PR, exit.`

| Tier                      | Bots                                                                                                                                                                                                                                                                               | Why                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **0 (always, automatic)** | CI (`ci-gate`, `integration-gate`) + **Final Merge Gate**                                                                                                                                                                                                                          | tests must re-run; the gate re-reads the whole diff and re-approves the new head — the catch-all backstop |
| **1 — per-commit**        | **Systematic Bug & Correctness · Adversarial Pre-Mortem & Blind-Spot · Find Vulnerabilities (Security)**                                                                                                                                                                           | a hasty fix is the #1 source of new bugs; these catch it on the changed code                              |
| **2 — once per PR**       | Architecture & Complexity · Clean Code & Readability · UI / Design-System · React & Next.js · Accessibility · Frontend/UX · Intent & Product Alignment · TypeScript · Contract Compatibility · API Quality · Mutation Resistance · Invariant & State-Machine · Docs · File-by-File | a small scoped fix rarely flips these verdicts; their value is the first deep pass                        |

**Minimal Safe-Fix Planner:** per-PR, but re-runs when the gate requests changes again (so it
reflects the current head). **Final Merge Gate:** per-commit (no skip — it must judge each head).

Result: on a fix, only **CI + 3 correctness bots + the gate** re-run (≈4 vs 17+), so a
fix-introduced bug gets two independent catches (Tier-1 bots _and_ the gate re-reading everything)
while the expensive perspective lenses don't re-fire. That's the convergence + cost fix.

## 2. The two GitHub Actions (built — in this repo)

- `.github/workflows/auto-merge.yml` + `scripts/github/auto-merge-coordinator.mjs` — arms native
  auto-merge when the gate approved (`<!-- gate:approved -->` on the head). GitHub merges when the
  required checks pass. No branch-protection change needed.
- `.github/workflows/autofix.yml` + `scripts/github/autofix-guard.mjs` — on a gate
  "request changes," a headless `cursor-agent` implements the Safe-Fix Plan's blocking items and
  commits to the PR branch. 3-round cap → `needs-human`.

## 3. Activation (one-time)

1. **Add two repo secrets** (Settings → Secrets and variables → Actions):
   - `PIPELINE_PAT` — the fine-grained PAT for `II-ricky-bobby-II` (contents:write,
     pull-requests:write). Used for the fix **push** so it re-triggers CI + reviews (a `GITHUB_TOKEN`
     push does **not** re-trigger workflows), and for arming auto-merge so the merge commit attributes
     to an allow-listed identity (passes `verify:git-attribution`).
   - `CURSOR_API_KEY` — Cursor → Settings → API keys.
2. **Confirm** the `needs-human` label exists (it does) and repo "Allow auto-merge" is on (it is).
3. **Land the four files** (open a PR into `develop`, merge it). Until merged they're inert.
4. **Verify the Cursor side:** the Final Merge Gate automation has "Comment on PR → Allow PR Approval"
   ON and its prompt emits `<!-- gate:approved -->` only on approval (see `bot-final-merge-gate.md`);
   the Safe-Fix Planner emits `<!-- fix-plan blocking=N -->`.
5. **Smoke test** on one PR: open it → gate approves → it auto-merges; or gate requests changes →
   autofix pushes a fix → re-review → approve → auto-merge.

## 4. End-to-end (final)

PR opens → CI → review battery (Tier-2 once, Tier-1 + gate this head) → Safe-Fix Planner →
Final Merge Gate. **Approved** → auto-merge lands it. **Changes requested** → autofix Action runs
`cursor-agent`, pushes the fix to the same branch → CI + Tier-1 bots + gate re-run → approve →
auto-merge. Bounded by the 3-round cap. No human interaction in the steady state.

> Note (verify before relying): `cursor-agent` install path / flags (`-p`, `--force`, `--model`) per
> `cursor-agent --help`; and that a `cursor-agent` headless run authenticates via `CURSOR_API_KEY`.
> Adjust the one `cursor-agent` line in `autofix.yml` if the CLI surface differs.
