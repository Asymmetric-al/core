# PR Pipeline Bots — advisory reviewer roster (paste-ready prompts)

The bots you are running after consolidation: **10 reviewers + 2 gate bots = 12** (7 consolidated +
3 curated keepers). All 12 bots are advisory reviewers. Full prompts for every reviewer are in
[`ALL-BOT-PROMPTS.md`](./ALL-BOT-PROMPTS.md).

> **Single paste-ready document:** [`ALL-BOT-PROMPTS.md`](./ALL-BOT-PROMPTS.md) collects every
> reviewer's full prompt, tools, and tier in one openable file. Use it when setting up the bots.

## Universal settings (every reviewer)

- **Trigger:** GitHub → **Checks completed** (repo `Asymmetric-al/core`).
- **Model:** `composer-2.5` for reviewers; strongest model for Final Merge Gate + Safe-Fix Planner.
- **Tools:** Comment on Pull Request (**Don't Allow PR Approval**). Trim MCPs to the lane (don't attach all of Supabase/Nia/Context7/Stripe/Vercel/Resend by default).
- **First line of every reviewer prompt (guard) — tier-specific:**
  - Tier 1 (re-run every commit — Critical Bug Check, Pre-Mortem Bug Finder, Vulnerability Check):
    `SKIP-IF-DONE: If a comment titled "<this bot's title>" already exists on this PR's current head commit, exit without posting.`
  - Tier 2 (run once per PR — all other reviewers):
    `SKIP-IF-DONE: If a comment titled "<this bot's title>" already exists anywhere on this PR, exit without posting.`
  - See the tier cheat-sheet in [`ALL-BOT-PROMPTS.md`](./ALL-BOT-PROMPTS.md).
- **Last line of every reviewer comment (severity):**
  `SEVERITY: Blocker | High | Medium | Suggestion | None`

## The 7 consolidated bots (create these — full prompts in this folder)

| File                                      | Automation name                     | Comment title                     |
| ----------------------------------------- | ----------------------------------- | --------------------------------- |
| `bot-systematic-bug-correctness.md`       | Systematic Bug & Correctness        | Critical Bug Check                |
| `bot-adversarial-pre-mortem.md`           | Adversarial Pre-Mortem & Blind-Spot | Pre-Mortem Bug Finder             |
| `bot-architecture-coupling-complexity.md` | Architecture, Coupling & Complexity | Architecture & Complexity Review  |
| `bot-clean-code-readability.md`           | Clean Code & Readability            | Clean Code Review                 |
| `bot-react-nextjs-correctness.md`         | React & Next.js Correctness         | React & Next.js Review            |
| `bot-ui-design-system.md`                 | UI & Design-System                  | UI / Design-System Review         |
| `bot-intent-product-alignment.md`         | Intent & Product Alignment          | Intent & Product Alignment Review |

## The 2 gate bots (full prompts in this folder)

| File                              | Automation name          | Comment title             |
| --------------------------------- | ------------------------ | ------------------------- |
| `bot-final-merge-gate.md`         | Final Merge Gate         | General Merge Gate Review |
| `bot-minimal-safe-fix-planner.md` | Minimal Safe-Fix Planner | Simple Safe-Fix Plan      |

These bots do not approve, merge, patch, or otherwise mutate PR branches unless a human separately
uses their review comments as guidance.

## The 3 kept bots (curated from the 10 originals; full tightened prompts in `ALL-BOT-PROMPTS.md`)

The other 7 supplied bots were dropped as redundant. For each keeper: set trigger to **Checks
completed / On Any Completion**, use the tightened prompt (it already includes the guard + `SEVERITY:`
line), and trim MCPs as noted. Use the working `nia` (not `Nia_MCP`).

| Automation name              | Comment title                       | Tier | MCPs                                 |
| ---------------------------- | ----------------------------------- | ---- | ------------------------------------ |
| Find Vulnerabilities         | Vulnerability Check                 | 1    | Supabase, Nia                        |
| Accessibility Regression     | Accessibility Regression Review     | 2    | Nia                                  |
| Contract & API Compatibility | Contract & API Compatibility Review | 2    | Supabase, Nia (+ Stripe if payments) |

**Dropped (7):** Invariant & State-Machine, Mutation Resistance, TypeScript Checker, Docs/Setup/Runbook,
Frontend/UX, File-by-File Semantic Diff, API Quality (merged into Contract & API). Rationale in
`ALL-BOT-PROMPTS.md`.

## Deleted (21 originals replaced by the 7 consolidations)

Critical Bug Finding · Bug Finder 2.0 · Thermonuclear Cursor Code Review · Pre-Mortem Bug Finder ·
Catch-All Blind Spot · Intuition Reviewer · Improve Codebase Architecture · Technical Debt PR Review ·
Overengineering Review · Architecture/Boundaries/Coupling · Clean Code Check · Style/Clarity/Readability ·
React & Next.js Review · Cache Components Review · Next.js Hydration & SSR · Shadcn UI Review · GUI Check ·
PR Intent Accomplishment · Product Intent Alignment.
