# Merge Captain — autonomous PR-to-merge pipeline

This is the runbook for how a pull request gets from "open and bot-reviewed" to "merged into
`develop`" with **no human approval gate**. It is written to be understood without reading code.

## The short version

1. A human (with AI help) opens a PR into `develop`.
2. CI and three review bots check it automatically.
3. **Merge Captain** (an agent loop you start on demand) fixes whatever they find, closes test
   gaps, and arms auto-merge.
4. **GitHub** merges the PR the moment the required tests pass — no one has to approve it.
5. You get a plain-English report on the PR and a label you can use to audit it later.

You are never required in the middle. You read the result afterward.

## The stages in detail

### Stage 1 — PR opens

Authored as usual: multiple commits per PR, draft first, conventional titles. Nothing here changes.

### Stage 2 — The five machine signals

Within ~20 minutes of a push, five checks settle:

| Signal                   | What it checks                                 | Blocks merge?      |
| ------------------------ | ---------------------------------------------- | ------------------ |
| `ci-gate`                | format, lint, types, build, unit tests         | **Yes (required)** |
| `integration-gate`       | DB migrations + app boot + browser smoke suite | **Yes (required)** |
| Greptile                 | repo-aware bug review                          | No (advisory)      |
| Cursor Bugbot            | independent bug pass                           | No (advisory)      |
| Cursor Security Reviewer | vulnerability pass                             | No (advisory)      |

Greptile automatically chains a Codex review. The **PR Signal Coordinator** watches all of these
and stamps the PR with `automation:*` labels, ending at `automation:pr-intake-ready` when they have
all settled. (That label means "signals are in" — **not** "ready to merge".)

> Note: the coordinator's scheduled/event triggers run from the default branch (`production`). It
> only works once `develop` has been released to `production` — see "Activating the coordinator".

### Stage 3 — Merge Captain (you start this)

Run the loop when you want PRs processed:

```
/loop merge-captain            # self-paced
/loop 15m merge-captain        # every 15 minutes
```

Or run it as a Claude Code **cloud session** or **routine** so it works with your laptop closed and
on whatever model you've pinned in that agent's config. (The loop itself is model-agnostic.)

For each open, non-draft PR into `develop` (skipping any already labeled `needs-human`), it works
in strict priority order:

1. **Red required CI** → reproduces locally with `bun run ci:preflight`, fixes the code, pushes.
   One flaky re-run allowed; never deletes or skips a test to pass.
2. **Stale or conflicted branch** → merges `develop` in (real conflicts are escalated, not guessed).
3. **Review findings** → sorts every bot comment into **Fix** (change it, reply), **Dismiss**
   (reply with the reason — this is the audit trail and trains the bots to be quieter), or
   **Escalate**. High-severity findings (Codex P0/P1, above-threshold Greptile, any Bugbot or
   Security finding) must be fixed or rebutted; nits are noted and batched, not chased.
4. **Test-gap pass** → because no human reads the diff, untested new behavior gets a unit test in
   the same PR; oversized gaps become tracked follow-up issues.
5. **Finalize** → posts the Merge Report, labels the PR, and arms auto-merge.

It has hard limits: at most 5 fix-rounds and 6 pushes per PR, then it labels `needs-human` and
moves on. Escalation is a normal outcome, not a failure.

### Stage 4 — GitHub merges it

Auto-merge completes only when `ci-gate` and `integration-gate` are green. There is no required
review, so no human approval is needed — but the tests are non-negotiable, and they apply even to
admins. `develop` then deploys to previews where you test UI/UX.

### Stage 5 — You get notified and can audit

Every merged PR carries:

- a **Merge Captain report** comment (what it does, risk tier, findings fixed/dismissed, tests), and
- one label: `captain:merged-clean`, or `captain:merged-with-findings` for anything that had
  high-severity findings handled along the way.

To audit, filter PRs by `captain:merged-with-findings` and read the reports. Turn on GitHub
repo notifications (web/mobile/email) to get a push the moment something merges.

## The GitHub settings that make this work

- **Repository → auto-merge:** enabled.
- **`develop` branch protection:** required checks `ci-gate` + `integration-gate`, strict
  up-to-date branches, `enforce_admins` on, **required reviews removed** (this is the "no human
  gate" change).
- **Labels:** `needs-human`, `captain:merged-clean`, `captain:merged-with-findings`.
- **Token:** the agent uses a fine-grained PAT (the `II-ricky-bobby-II` identity) with Contents,
  Pull requests, Issues, Checks, Administration, and **Workflows** write. Locally it is wired
  through `.git/bin/gh` (and a curl helper `.git/bin/ghapi`); in cloud it is the `GH_TOKEN`
  environment variable.

## How to reverse each change

- **Re-add the human gate on `develop`:**
  `gh api -X PATCH repos/Asymmetric-al/core/branches/develop/protection/required_pull_request_reviews -f required_approving_review_count=1`
- **Disable auto-merge:** Settings → General → uncheck "Allow auto-merge" (or PATCH
  `allow_auto_merge=false`).
- **Stop the loop:** just don't start it; nothing runs on a schedule.

## Activating the coordinator

The PR Signal Coordinator and release-source gate live on `develop` but run from the default branch
(`production`). Release `develop` → `production` to activate them:

```
bun run release:production -- --create-pr
```

Merge the resulting release PR only after its four required gates (`release-source-gate`,
`ci-gate`, `integration-gate`, `e2e-gate`) pass.

## Known follow-ups

- Pare the Cursor review "lens" battery down to Bugbot + Security Reviewer (operator-side, in the
  Cursor dashboard); identify the "Blake's Automation" check.
- Add the highest-value missing tests: donor checkout in Stripe test mode, and a signed Stripe
  webhook test through the real route handlers.
- Fix the CMS e2e suite's silent-skip behavior, then consider making browser/e2e suites required
  checks on `develop` after a burn-in period.
