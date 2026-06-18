# PR Pipeline Bots — final roster (paste-ready prompts)

The bots you are running after consolidation: **17 reviewers + 2 gate bots + Merge Captain = 20**.
Full prompts for the new/changed ones are in this folder (one file each). The 10 kept bots use their
existing prompt **plus** the two universal lines below.

## Universal settings (every reviewer)

- **Trigger:** GitHub → **Checks completed** (repo `Asymmetric-al/core`).
- **Model:** `composer-2.5` for reviewers; strongest model for Final Merge Gate, Safe-Fix Planner, Merge Captain.
- **Tools:** Comment on Pull Request (**Don't Allow PR Approval**, except the Final Merge Gate). Trim MCPs to the lane (don't attach all of Supabase/Nia/Context7/Stripe/Vercel/Resend by default).
- **First line of every reviewer prompt (guard):**
  `SKIP-IF-DONE: If a comment titled "<this bot's title>" already exists on the PR's current head commit, exit without posting.`
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

## The 2 gate bots + Merge Captain (full prompts in this folder)

| File                              | Automation name                        | Comment title             |
| --------------------------------- | -------------------------------------- | ------------------------- |
| `bot-final-merge-gate.md`         | Final Merge Gate (keep `allowApprove`) | General Merge Gate Review |
| `bot-minimal-safe-fix-planner.md` | Minimal Safe-Fix Planner               | Simple Safe-Fix Plan      |
| `bot-merge-captain.md`            | Merge Captain (Slack-triggered)        | Merge Report              |

## The 10 kept bots (keep existing prompt + the two universal lines)

For each: change trigger to **Checks completed**, prepend the SKIP-IF-DONE guard (with the title
shown), append the `SEVERITY:` line, and trim MCPs as noted.

| Automation name                    | Comment title                                     | Suggested MCPs                       |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------ |
| Find Vulnerabilities               | Vulnerability Check                               | Supabase, Nia                        |
| Invariant & State-Machine Checker  | Invariant & State-Machine Review                  | Nia (+ Supabase if data)             |
| Accessibility Regression Checker   | Accessibility Regression Review                   | none (or Nia)                        |
| Mutation Resistance Checker        | Mutation Resistance Review                        | Supabase, Nia                        |
| Contract Compatibility Checker     | Contract Compatibility Review                     | Supabase, Nia (+ Stripe if payments) |
| TypeScript Checker                 | TypeScript Correctness Review                     | Nia, Context7                        |
| Docs, Setup, Runbook & Consistency | Docs, Setup, Runbook, and Repo-Consistency Review | Nia                                  |
| Frontend, UX & Client-Behavior     | Frontend, UX, and Client-Behavior Review          | Nia                                  |
| File by File Semantic Diff         | File by File Semantic Diff Reviewer               | Nia                                  |
| API Quality Check                  | API Quality Review                                | Supabase, Nia                        |

## Deleted (21 originals replaced by the 7 consolidations)

Critical Bug Finding · Bug Finder 2.0 · Thermonuclear Cursor Code Review · Pre-Mortem Bug Finder ·
Catch-All Blind Spot · Intuition Reviewer · Improve Codebase Architecture · Technical Debt PR Review ·
Overengineering Review · Architecture/Boundaries/Coupling · Clean Code Check · Style/Clarity/Readability ·
React & Next.js Review · Cache Components Review · Next.js Hydration & SSR · Shadcn UI Review · GUI Check ·
PR Intent Accomplishment · Product Intent Alignment.
