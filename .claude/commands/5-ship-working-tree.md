# 5-ship-working-tree

**Name:** `5-ship-working-tree`  
**Purpose:** Turn **local, uncommitted changes** into a clean feature branch + (draft) PR, request the correct **CODEOWNERS reviewer(s)** (only) immediately, push to GitHub, and **watch CI checks** until pass/fail—then notify the user and offer troubleshooting on failures. **Additional reviewer routing happens later via Greptile-triggered GitHub Action** using `.github/reviewers.yml`.

**Applies when:** You have meaningful local changes (staged/unstaged/untracked) that you want shipped via PR.  
**Do not use when:** You are mid-rebase/merge, you suspect secrets are present, or you need a multi-commit / multi-PR breakdown.

---

## Rules

- **Never lose work.**

---

## Known hiccups and how this command avoids them

- **Untracked file restore fails after base switch:** avoid relying on stash internals; archive untracked files to `.git/autoship/untracked.tgz` and restore from there if needed.
- **`gh` 401 “Bad credentials” even when logged in:** if `GITHUB_TOKEN` is set, run `gh` as `env -u GITHUB_TOKEN gh ...`.
- **Build gate fails locally due missing env vars:** offer a decision; recommended is temporarily exporting from root `.env.local` without printing/committing secrets.
- **CODEOWNERS resolves only to PR author:** GitHub blocks self-review; prompt for a fallback reviewer/team.
- **Cleanup ran without user choice:** hard rule to wait for `1/2/3` before running cleanup commands.
  Create a patch backup before any branch switching or stashing.
- **PR base must be explicit.** The command must list remote branches and choose a base (default: `production` if present, else the repo default branch).
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

Create a **backup bundle** (must happen early):

```bash
mkdir -p .git/autoship
git diff > .git/autoship/working-tree.patch
git diff --staged > .git/autoship/staged.patch
git ls-files --others --exclude-standard > .git/autoship/untracked.txt

# optional but strongly recommended: archive untracked file contents (prevents stash restore collisions)
# run from repo root
if [ -s .git/autoship/untracked.txt ]; then
  tar -czf .git/autoship/untracked.tgz -T .git/autoship/untracked.txt 2>/dev/null || true
fi
```

> If the command fails later, the user can recover from `.git/autoship/*`. The `untracked.tgz` avoids a common failure mode where an “untracked” file becomes tracked on the base branch before restore.

---

### 2) Remote + auth checks (GitHub + branch list)

**Important (common hiccup):** If `GITHUB_TOKEN` is set in the environment, GitHub CLI (`gh`) will prefer it over its stored login and can produce `HTTP 401: Bad credentials`.

- If `echo $GITHUB_TOKEN` is non-empty, the command must run all `gh ...` calls as: `env -u GITHUB_TOKEN gh ...`

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

- If `origin/production` exists → include `production` and default to it
- Else default to the repo’s default branch (from `gh repo view`)
- Also include common alternatives if they exist: `develop`, `main`

---

### 3) Choose PR base branch (explicit) + update it

Choose base branch using this priority:

1. user-specified base (if valid on origin)
2. `production` if it exists on origin
3. repo default branch (from GitHub)
4. otherwise: current branch (last resort) **with warning**

Update base cleanly (ff-only). Because there are local changes, stash first:

```bash
git stash push -u -m "autoship: pre-base-update"
git switch <base>
git pull --ff-only origin <base>
```

**If `git stash pop` later fails with** `error: could not restore untracked files from stash`:

- This usually means an “untracked” file became **tracked on `<base>`** before restore.
- Recovery order (use the autoship backups, not stash internals):
  1. Confirm the file(s) exist on `<base>`: `git ls-tree -r HEAD --name-only | rg '<path>'`
  2. Restore your local version from `.git/autoship/untracked.tgz` (preferred) or `working-tree.patch`.
  3. Continue the flow once `git status` shows your intended modifications.

After a successful stash pop and `git status` is clean (no conflicts), **drop the autoship stash** to avoid leaving stray stashes:

```bash
# drop only the autoship stash entry you created
git stash list | rg "autoship: pre-base-update" || true
# if it's the most recent and already applied:
git stash drop stash@{0} || true
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

### 7B) Troubleshooting Mode: build requires env vars (common in this repo)

If the gate chain fails at `build` with missing env vars (example: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), the command must **stop** and offer a decision:

1. **Load from root `.env.local` and retry build** _(recommended if `.env.local` exists)_
2. **Manually provide env vars for this session and retry build**
3. **Proceed anyway (Draft PR) and let CI validate**

Implementation for option 1 (never print secrets; never commit env files):

```bash
test -f ./.env.local || (echo ".env.local not found; choose option 2 or 3" && exit 1)
set -a && . ./.env.local && set +a
env | rg '^NEXT_PUBLIC_SUPABASE_(URL|ANON_KEY)=' | sed 's/=.*$/=<redacted>/' || true
bun run build
```

Then rerun the remaining gates (at minimum `test:unit`) in the same env-loaded shell session.

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

Create PR via `gh` (always run with `GITHUB_TOKEN` unset if it exists):

```bash
env -u GITHUB_TOKEN gh --version >/dev/null 2>&1 || true

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

### 11) Resolve CODEOWNERS → request review in GitHub (CODEOWNERS only)

**Important:** CODEOWNERS does not always auto-request reviews unless repo settings/branch protection require it. Always explicitly request reviewers.

**Goal:** Request **only** the relevant **CODEOWNER(s)** (prefer individuals).  
This command **must not** request an additional reviewer—reviewer routing happens later via GitHub Actions after Greptile posts.

#### 11.1) Resolve CODEOWNERS (source-of-truth)

1. Locate CODEOWNERS file (first found wins):
   - `.github/CODEOWNERS`
   - `CODEOWNERS`
   - `docs/CODEOWNERS`
2. Determine changed files:
   - `git fetch origin --prune`
   - `git diff --name-only origin/<base>...HEAD`
3. Resolve owners:
   - Apply CODEOWNERS pattern matching in order (**last matching pattern wins**, per GitHub behavior).
   - Owners can be `@user` or `@org/team`.

Build a **codeowner reviewer set**:

- De-duplicate.
- If empty → prompt the user for a reviewer.

> If CODEOWNERS returns only teams but you prefer individuals, you may try to expand team members via GitHub API (`read:org`). If expansion fails, request the team as-is.

#### 11.2) Request CODEOWNERS via GitHub (explicit)

Request CODEOWNERS:

```bash
env -u GITHUB_TOKEN gh pr edit --add-reviewer "<codeowner1>" --add-reviewer "<codeowner2>"
```

**Edge case: CODEOWNER == PR author**
GitHub does **not** allow requesting review from the PR author (`HTTP 422: Review cannot be requested from pull request author.`).  
If the only resolved CODEOWNER(s) are the PR author:

- Do **not** request reviewers.
- Leave a short PR comment noting: “CODEOWNER is PR author; cannot request self-review.”

(Optional) Set PR assignee to the author:

```bash
env -u GITHUB_TOKEN gh pr edit --add-assignee "@me"
```

### 12) Watch CI checks until pass/fail

Watch checks:

```bash
gh pr checks --watch
```

Greptile (async reviewer routing):

- **Do not block/wait** for Greptile inside Cursor.
- When Greptile submits its PR review, GitHub Actions (`.github/workflows/greptile-informer.yml`) will:
  - read Greptile’s **Confidence Score (1–5)** (if present),
  - combine it with PR file/line heuristics,
  - and request **1 additional reviewer** from `.github/reviewers.yml`.
- It will also post a short comment documenting the decision.

Optional one-time check:

```bash
gh pr view --comments | rg -n "greptile|Reviewer routing|Assigned additional reviewer|difficulty" || true
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

After PR + checks reach a terminal state (pass/fail), the command must prompt for local cleanup.

**Hard rule:** Do **not** run any cleanup commands until the user replies with `1`, `2`, or `3`.

### Step PS1) Confirm working tree is clean

```bash
git status --porcelain=v1
```

If not clean: stop and ask whether to stash or skip cleanup.

### Step PS2) Offer exactly 3 options (Option 1 is recommended)

1. **Keep working on this PR branch** _(recommended)_
2. **Switch to `<base>`**
3. **Switch to `<base>` + delete local feature branch**

### Step PS3) Implement the chosen option

#### Option 1 — Keep working

No action. Print:

- “Staying on `<new-branch>` (updates to this branch update the same PR).”

#### Option 2 — Switch to base

```bash
git fetch origin --prune
git switch <base>
git pull --ff-only origin <base>
```

#### Option 3 — Switch + delete local branch (safe)

```bash
git fetch origin --prune
git switch <base>
git pull --ff-only origin <base>
git branch -d <new-branch>
```

If `git branch -d` refuses (not merged): **stop** and ask:

- keep branch, or
- force delete with:

```bash
git branch -D <new-branch>
```

### Step PS4) Remote branch cleanup (never automatic)

Never delete the remote branch automatically. You may print:

- “After merge, delete the remote branch in GitHub UI or `git push origin --delete <new-branch>`, then `git fetch --prune`.”
