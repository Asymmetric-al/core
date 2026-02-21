# 5-ship-working-tree

**Name:** `5-ship-working-tree`  
**Purpose:** Turn **local, uncommitted changes** into a clean feature branch + (draft) PR, request the correct CODEOWNERS reviewers, push to GitHub, and **watch CI checks** until pass/fail—then notify the user and offer troubleshooting on failures.

**Applies when:** You have meaningful local changes (staged/unstaged/untracked) that you want shipped via PR.  
**Do not use when:** You are mid-rebase/merge, you suspect secrets are present, or you need a multi-commit / multi-PR breakdown.

---

## Rules

- **Never lose work.** Create a patch backup before any branch switching or stashing.
- **PR base must be explicit.** The command must list remote branches and choose a base (default: `epic` if present, else the repo default branch).
- **Branch name must be derived from a summary of changes.**
  - Format: `<ticket?>-<kebab-summary>` (ticket optional, e.g. `al-123-...`)
- **Local quality gates should run before opening/marking a PR ready.**
  - For this repo, the canonical gate set is:
    - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
  - If formatting fails, fix with `bun run format`, then re-run `bun run format:check`.
- **Secrets safety is mandatory.** If secret-like content is detected, stop and require explicit user override.
- **CODEOWNERS must drive reviewer selection.**
  - Parse CODEOWNERS patterns and choose owners relevant to the files changed.
  - Then **explicitly request reviews** in GitHub (CODEOWNERS alone does not always auto-request).
- **PR should be created as Draft by default.**
  - When all checks pass, flip to “Ready for review.”
- **After PR creation, the command must watch checks and report pass/fail.**
  - On failure: summarize failing checks and ask permission to troubleshoot.
  - On success: summarize the PR, requested reviewers, and checks status.

---

## Inputs

- Optional: ticket key(s) like `AL-123` (if present, include in branch/commit/PR title).
- Optional: desired PR base branch (if omitted, the command must present options and pick a sensible default).
- Optional: reviewer override (only if CODEOWNERS resolution yields none).

---

## Hard stops (abort the command)

Abort immediately if any of the following are true:

- `.git` indicates an in-progress operation:
  - merge (`.git/MERGE_HEAD`)
  - rebase (`.git/rebase-apply` or `.git/rebase-merge`)
  - cherry-pick (`.git/CHERRY_PICK_HEAD`)
- There are **no** changes in the working tree:
  - `git status --porcelain` is empty
- The repo remote is not GitHub, or GitHub auth is unavailable and PR creation is requested:
  - `gh auth status` fails
- Potential secrets are detected and the user does **not** approve override

---

## Workflow

### 1) Pre-flight: identify repo + inventory changes

Run:

```bash
git rev-parse --show-toplevel
git status --porcelain=v1
git diff --name-status
git diff --stat
git ls-files --others --exclude-standard
```

Record:

- staged/unstaged counts
- untracked file list
- file change list + diff stats (for summary generation)
- current branch + HEAD commit:
  - `git branch --show-current`
  - `git rev-parse --short HEAD`

Create a **backup patch** (must happen early):

```bash
mkdir -p .git/autoship
git diff > .git/autoship/working-tree.patch
git diff --staged > .git/autoship/staged.patch
git ls-files --others --exclude-standard > .git/autoship/untracked.txt
```

> If the command fails later, the user can recover with these patch files.

---

### 2) Remote + auth checks (GitHub + branch list)

Fetch and list branches:

```bash
git fetch origin --prune
git remote -v
git branch -r
```

If using GitHub CLI:

```bash
gh auth status
gh repo view --json defaultBranchRef,nameWithOwner -q '.defaultBranchRef.name'
```

The command must show the user a **short list of candidate PR base branches**:

- If `origin/epic` exists → include `epic` and default to it
- Else default to the repo’s default branch (from `gh repo view`)
- Also include common alternatives if they exist: `develop`, `main`

---

### 3) Choose PR base branch (explicit) + update it

Choose base branch using this priority:

1. user-specified base (if valid on origin)
2. `epic` if it exists on origin
3. repo default branch (from GitHub)
4. otherwise: current branch (last resort) **with warning**

Update base cleanly (ff-only). Because there are local changes, stash first:

```bash
git stash push -u -m "autoship: pre-base-update"
git switch <base>
git pull --ff-only origin <base>
```

If `ff-only` fails (diverged history), **stop** and ask the user to resolve (do not auto-merge).

Create the feature branch:

```bash
git switch -c <new-branch>
git stash pop
```

If `stash pop` results in conflicts:

- Stop and notify the user.
- Do **not** proceed to commit/PR creation until conflicts are resolved.

---

### 4) Generate a high-quality summary (branch name + PR title)

The command must generate:

- **Short summary** (5–10 words) describing intent
- **Kebab slug** derived from the short summary
- Optional ticket prefix (if `AL-###` was provided or detected)

Inputs for summarization:

- `git diff --stat`
- `git diff` (limit to a manageable amount if huge)
- file paths changed (high signal)

Rules:

- Keep slug under ~40 chars if possible.
- Avoid generic titles like “updates” or “changes”.
- Prefer action verbs (add/fix/refactor/remove/improve).

Examples:

- `al-123-fix-auth-redirect-loop`
- `add-admin-user-search-filters`
- `refactor-api-client-retry-logic`

PR title rules:

- If ticket present: `AL-123: <short summary>`
- Else: `<short summary>`

---

### 5) Safety scan: secrets + dangerous files

Before staging and again before committing, scan for likely secrets and accidental sensitive files.

Minimum checks:

- Blocklist filenames (unless user explicitly overrides):
  - `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`, `credentials.*`
- Grep common secret patterns in the diff (heuristic):
  - `BEGIN (RSA|OPENSSH) PRIVATE KEY`
  - AWS keys (`AKIA...`)
  - GitHub tokens (`ghp_`, `github_pat_`)
  - Stripe keys (`sk_live_`, `rk_live_`)
  - “Bearer ” tokens

Suggested commands:

```bash
git diff | rg -n "BEGIN (RSA|OPENSSH) PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9\-\._]+"
```

If anything matches:

- Print what matched (redact most of the value).
- Stop and ask for explicit permission to continue.

---

### 6) Stage changes intentionally

Default behavior: stage **everything** that is not ignored.

```bash
git add -A
git status --porcelain=v1
git diff --staged --stat
```

If the staged set is extremely large (e.g., lockfile churn + generated files):

- Warn that review will be hard.
- Suggest splitting or excluding specific paths.

---

### 7) Run local quality gates (pre-PR)

Run the repo gate set:

```bash
bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit
```

#### If `format:check` fails

1. Collect a **failure inventory** (for scope classification):

```bash
git diff --name-only --staged > /tmp/autoship_staged_files.txt
bun run format:check
```

2. Attempt a **safe formatting remediation**:

```bash
bun run format
bun run format:check
```

3. Classify the result:

- **Case A — fixed and diff is reasonable** (mostly within your staged/expected files):
  - Continue to lint/typecheck/build/unit.
- **Case B — fixed but touched many pre-existing/unrelated files** (repo-wide drift):
  - The command must stop and ask which path to take (see “Gate stop decision” below).
- **Case C — still failing**:
  - Treat as a gate failure; stop and offer troubleshooting.

#### Gate stop decision (required)

If any gate fails (including `format:check`), the command must print a concise summary and offer **three** options:

1. **Abort now**  
   Keep branch + changes intact. No PR is created.

2. **Proceed anyway**  
   Create a **Draft PR** with the current changes and watch CI. Expect red checks.

3. **Troubleshoot & fix now (recommended)**  
   The command enters **Troubleshooting Mode** for the failing category, attempts minimal fixes, re-runs the relevant gate(s), and only continues if they pass.

Default should be: **stop and wait for the user to choose 1/2/3**.

---

### 7A) Troubleshooting Mode: formatting drift (repo-wide)

This mode exists specifically for the case you reported: `format:check` fails because **many pre-existing files** are not formatted, even if you didn’t touch them.

The command must offer two remediation strategies:

#### Strategy 1 — Fix formatting in the current branch (fastest, noisier PR)

- Warn that this may create a large diff and make review harder.
- If user chooses this:
  1. Run `bun run format` (already done above, repeat only if needed).
  2. Show `git diff --stat` and top changed paths.
  3. Stage and commit formatting changes in a **separate commit**:

```bash
git add -A
git commit -m "chore: format baseline" -m "ref autoship"
```

4. Re-run the full gate chain. If it passes, continue to PR creation.

#### Strategy 2 — Split formatting into a dedicated PR (best practice)

Recommended when formatting drift is repo-wide. Keeps your feature PR focused.

If user chooses this:

1. Create a **format baseline branch** off the chosen PR base:

```bash
git stash push -u -m "autoship: before format baseline split"
git switch <base>
git pull --ff-only origin <base>
git switch -c chore-format-baseline-YYYYMMDD
git stash pop
```

> If you stashed feature work, immediately stash it again after switching branches to avoid mixing. The goal is: **baseline PR contains only formatting**.

2. Ensure the branch contains **only formatting** changes:

- Reset any non-format changes (if present) and keep only the formatter output.

3. Run:

```bash
bun run format
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
```

4. Commit + push:

```bash
git add -A
git commit -m "chore: format baseline" -m "ref autoship"
git push -u origin chore-format-baseline-YYYYMMDD
```

5. Create a **Draft PR** for the baseline:

```bash
gh pr create --base <base> --head chore-format-baseline-YYYYMMDD --title "chore: format baseline" --body "Repo-wide formatting drift fix." --draft
```

6. Request CODEOWNERS reviewers (same process as Step 11) and watch checks.

7. After the baseline PR is merged:

- Return to your feature branch and rebase onto updated base:

```bash
git switch <new-branch>
git fetch origin --prune
git rebase origin/<base>
```

- Then re-run the gate chain and continue with normal PR creation.

> If you have permission and prefer automation, optionally enable auto-merge on the baseline PR once checks pass. Otherwise, prompt the user to merge it manually.

---

### 8) Commit (message quality + traceability)

Commit message format:

- If ticket present: `AL-123: <short summary>`
- Else: `<short summary>`

Include a body line for traceability:

- If ticket present: `ref AL-123`
- Else: `ref autoship`

Commands:

```bash
git commit -m "<title>" -m "ref <ticket-or-autoship>"
```

If no changes are staged (should not happen), stop.

---

### 9) Push branch to GitHub (with upstream)

```bash
git push -u origin <new-branch>
```

> “Which branch to push to” means: confirm the **remote** (`origin`) and the **feature branch name**. The PR base branch is chosen separately.

---

### 10) Create PR (Draft by default) + structured body

Create PR via `gh`:

```bash
gh pr create \
  --base <base> \
  --head <new-branch> \
  --title "<pr-title>" \
  --body-file <generated-body-file> \
  --draft
```

PR body must include:

- Summary
- Why
- How to test (include the exact local commands you ran)
- Risk notes / rollout notes
- If ticket present, include a linking line (your repo convention):
  - `fixes AL-123`

Optional but recommended:

- Add labels like `autoship` or `needs-review` (if your repo uses labels).

---

### 11) Resolve CODEOWNERS → request review in GitHub

**Important:** CODEOWNERS does not always auto-request reviews unless repo settings/branch protection require it. Always explicitly request reviewers.

Steps:

1. Locate CODEOWNERS file (first found wins):
   - `.github/CODEOWNERS`
   - `CODEOWNERS`
   - `docs/CODEOWNERS`
2. Determine changed files:
   - `git diff --name-only origin/<base>...HEAD`
3. Resolve owners:
   - Apply CODEOWNERS pattern matching in order (last matching pattern wins, per GitHub behavior).
   - Owners can be `@user` or `@org/team`.
4. Build a reviewer set:
   - Prefer owners for the most files changed.
   - De-duplicate.
   - If result is empty → fall back to:
     - repo default owner, or
     - prompt user for a reviewer.

Then request reviews:

```bash
gh pr edit --add-reviewer "<owner1>" --add-reviewer "<owner2>"
```

Also set PR assignee to the author:

```bash
gh pr edit --add-assignee "@me"
```

---

### 12) Watch CI checks until pass/fail

Watch checks:

```bash
gh pr checks --watch
```

On **success**:

- Convert draft → ready:

```bash
gh pr ready
```

Then report to the user:

- PR URL
- base + head branches
- reviewers requested
- checks passed

On **failure**:

- Print a concise failure summary:
  - which checks failed
  - link(s) to failing runs
  - likely category (format/lint/typecheck/build/unit/e2e)
- Prompt the user:
  - “Do you want me to attempt troubleshooting and fixes?”

Do not start troubleshooting unless the user explicitly approves.

---

## Troubleshooting mode (only if user approves)

When approved, the command should:

1. Pull failing check details:
   - `gh pr checks`
   - (optional) `gh run list --branch <new-branch> --limit 5`
2. Map failing check → local command:
   - lint → `bun run lint`
   - typecheck → `bun run typecheck`
   - build → `bun run build`
   - unit → `bun run test:unit`
   - format → `bun run format && bun run format:check`
3. Attempt minimal fixes, then:
   - re-run the relevant local gate
   - commit with message `AL-123: fix CI <category>` (or `fix CI <category>`)
   - push
   - re-watch checks

Stop after a reasonable number of attempts and ask the user before continuing if failures persist.

---

## Post-Ship: Local cleanup (required prompt)

After the PR is created and checks have reached a terminal state (pass/fail), the command must prompt the user to put the local repo into a clean, predictable state.

### Step PS1) Confirm local working tree is clean

Run and display:

```bash
git status --porcelain=v1
```

- If the working tree is **not** clean, the command must stop and ask the user whether to:
  - stash (`git stash push -u -m "autoship: post-ship cleanup"`) or
  - keep working without cleanup.

### Step PS2) Present the 3 cleanup options

The command must present **exactly these options** and wait for the user’s choice:

1. **Keep working on this PR branch locally** (stay on the feature branch)
2. **Switch back to base branch (`<base>`) and keep the feature branch** (recommended default)
3. **Switch back to base branch (`<base>`) and delete the local feature branch** (only if you’re done)

Default suggestion: **Option 2**.

### Step PS3) Implement the chosen option

#### Option 1 — Keep working on the PR branch

- Do nothing other than printing a reminder:
  - “You’re staying on `<new-branch>`. If you make changes, commit/push to update the same PR.”

#### Option 2 — Switch to base, keep feature branch (recommended)

```bash
git fetch origin --prune
git switch <base>
git pull --ff-only origin <base>
```

- Print how to return to the PR branch:

```bash
git switch <new-branch>
```

#### Option 3 — Switch to base, delete local feature branch

Preconditions (must all be true):

- working tree clean (PS1)
- the feature branch exists locally
- branch has been pushed (command already did `git push -u`)

Then run:

```bash
git fetch origin --prune
git switch <base>
git pull --ff-only origin <base>
git branch -d <new-branch>
```

If `git branch -d` refuses (not merged into local base), the command must stop and offer a force-delete opt-in:

- Keep branch (recommended)
- Force delete:

```bash
git branch -D <new-branch>
```

### Step PS4) Remote branch cleanup (never automatic)

The command must **not** delete the remote branch automatically. It may optionally print:

- “After the PR is merged, delete the remote branch (either in GitHub UI or via `git push origin --delete <new-branch>`), then prune locally.”

If the user explicitly asks to clean up the remote branch **and** the PR is confirmed merged, then it may proceed.

\1- Local cleanup choice executed (Option 1/2/3) and resulting current branch

- Base branch used (PR base)
- Feature branch name (head)
- Commit hash
- PR URL
- Reviewers requested (from CODEOWNERS)
- CI checks: pass/fail + failing check names (if any)
- Location of patch backups:
  - `.git/autoship/working-tree.patch`
  - `.git/autoship/staged.patch`
  - `.git/autoship/untracked.txt`

---

## Notes / quality control best practices

- Default to **Draft PR** for “ship my working tree” flows.
- Prefer **small PRs**: if diff is too large, suggest splitting.
- Dependency churn (`package.json`, lockfiles) should add a “Why” section in PR body.
- If UI changes are detected (components/pages), nudge for screenshots or a short recording.
- If migrations/schema changes are detected, require explicit mention in PR body + test steps.
