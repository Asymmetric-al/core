Asymmetrical: Daily Developer Workflow (Quick Reference)
How to pick up a GitHub issue, fix it, and submit a PR (AL-### flow)
Base branch: develop | Quality gate: bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit

At a Glance
Work is tracked as GitHub issues with keys like AL-123 (must appear in branch and PR).
Prefer the Cursor commands for speed and consistency: /issue-draft, /issue-start, /issue-implement, /issue-commit, /issue-ship.
Fork the repo, create feature branches from develop, and open PRs against develop.
Keep your fork's develop in sync with upstream develop.
Before marking a PR ready, run the quality gate locally and fix failures.
Issue / PR Lifecycle
Issue is selected (or assigned) -> issue is drafted (if needed)
Branch + draft PR created -> implementation happens on the feature branch
Draft PR -> Ready for review (after checks pass)
Approved -> Merged -> Issue closed
Fork + Upstream Setup (first time)
Fork the repo in GitHub, then:
git clone git@github.com:<your-username>/core.git
cd core
git remote add upstream git@github.com:Asymmetric-al/core.git
git fetch upstream
git checkout develop
git branch --set-upstream-to=upstream/develop develop
git pull upstream develop
git push origin develop
Daily Workflow Table
Step
Goal
Cursor command (preferred)
Manual equivalent
1
Pick an issue
(No command) Find an AL-### issue in GitHub
Filter by label/assignee; choose one that is clear + small.
2
Make the issue implementation-ready
/issue-draft AL-123
Add context, affected files, acceptance criteria, and testing notes to the issue.
3
Create branch + draft PR
/issue-start AL-123
git checkout develop && git pull upstream develop && git checkout -b al-123-short-title; push to fork; open draft PR to upstream develop.
4
Implement
/issue-implement AL-123
Edit code in small steps; run targeted tests while you go; commit often.
5
Commit changes
/issue-commit
Commit staged changes with a Conventional Commit message and ref AL-### when applicable.
6
Finalize & mark ready
/issue-ship
Run quality gate; ensure PR description includes fixes AL-123; request reviewers; mark PR ready.
7
Merge & clean up
(GitHub UI)
Squash merge (preferred unless told otherwise); delete branch; sync develop from upstream to your fork.

Step-by-Step 0) Start of Day (5 minutes)
Sync your local repo and make sure your working tree is clean.
Pull the latest upstream develop so you branch from the correct base.
If you do not have an upstream remote, see Fork + Upstream Setup (first time).
git status
git fetch upstream
git checkout develop
git pull upstream develop
git push origin develop

1. Pick an Issue (AL-###)
   Prefer issues that are small, well-scoped, and testable in one PR.
   Avoid “mega” issues; if it needs multiple PRs, split it into smaller issues.
2. Make the Issue Implementation-Ready
   Run /issue-draft to add missing context and make acceptance criteria testable.
   A good issue includes: what/why, impacted files, approach, acceptance criteria, and explicit testing commands.
   /issue-draft AL-123
3. Start Work (Branch + Draft PR)
   Use /issue-start to create a feature branch from develop and open a draft PR targeting upstream develop.
   Branch format: al-123-short-kebab-title
   PR title format: AL-123: <issue title>
   PR body must include: fixes AL-123 (one per line if multiple issues)
   /issue-start AL-123
   If you must do it manually, use:
   git checkout develop
   git pull upstream develop
   git checkout -b al-123-short-title
   git push -u origin al-123-short-title
4. Implement (Small, Testable Changes)
   Keep diffs minimal and directly tied to acceptance criteria.
   Commit frequently (small, readable commits).
   Run targeted checks during development (unit tests, lint, typecheck) to avoid big surprises at the end.
   /issue-implement AL-123
5. Commit changes
   Use /issue-commit for staged changes and commit message generation.
   Commit Message Guidelines
   Use conventional prefixes when possible: feat:, fix:, chore:, test:, refactor: …
   Include the issue reference in the commit body: ref AL-123
   Keep commits focused (one logical change per commit).
   git commit -m "fix(ui): correct empty state" -m "ref AL-123"
6. Finalize the PR (Quality Gate + Ready for Review)
   Before marking ready, run the full quality gate locally and fix failures.
   Scan for unintended TODO/FIXME in changed files.
   Update PR description with summary + testing notes and ensure it contains fixes AL-123.
   Request reviewers based on CODEOWNERS (if applicable).
   bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit
   /issue-ship
7. Merge & Post-Merge Cleanup
   Once approved, merge via GitHub UI (squash merge preferred unless instructed otherwise).
   Delete the feature branch (GitHub offers a button after merge).
   Pull develop locally and update your fork, then delete your local branch if desired.
   git checkout develop
   git pull upstream develop
   git push origin develop
   git branch -d al-123-short-title
   Troubleshooting
   PR doesn’t auto-close the issue
   Confirm the PR description includes exactly: fixes AL-123 (not fix AL-123).
   Confirm the issue key is correct and matches the issue number.
   You created a branch from the wrong base
   Stop, rebase or recreate the branch from develop (ask for help if you are unsure).
   Avoid merging develop into your branch repeatedly; prefer rebase unless repo policy says otherwise.
   Quality gate fails
   Read the first failure carefully; fix that first (often cascades).
   Re-run the failing command until it passes; then run the full quality gate again.
   Common Mistakes to Avoid
   Working directly on develop (always use a feature branch).
   Starting implementation before acceptance criteria are clear.
   Large PRs that mix unrelated changes.
   Marking PR ready before checks pass.
   Forgetting fixes AL-123 in the PR description.
