# Merge Captain / the fixer — capability reality + options

**Cursor automations cannot commit to an existing PR branch.**

- Slack-triggered automations expose only **Comment on PR** + **Request Reviewers** (confirmed in UI) — no code tools at all.
- GitHub-triggered automations can get an **"Open Pull Request"** tool, but that opens a **new `cursor/…` PR**, it does **not** amend the original PR's branch.
- So Cursor is excellent for **review + approve**, and the wrong tool for **fixing a PR in place**.

**Same-branch commits ARE best practice** (one reviewable unit, coherent history, CI re-runs on the
same PR, auto-merge targets it). Stacked/separate fix-PRs fragment review and complicate merge. So the
fixer must push to the PR's own branch — which Cursor can't do. The fixer therefore lives outside Cursor.

## Who applies the fixes (pick one)

- **(A) Author-driven (reliable, today):** when the Final Merge Gate requests changes + the Safe-Fix
  Planner posts the plan, you run your own coding agent (Claude Code / Cursor IDE / Codex) and tell it
  "apply the Simple Safe-Fix Plan on PR #N." It pushes to the PR branch. Reliable, but you initiate it.
- **(B) Autofix GitHub Action (hands-off, optional later):** a small Action runs a headless coding
  agent (Claude Code Action, `cursor-agent` CLI, or Codex) that reads the Safe-Fix Plan and **commits
  to the PR branch**. Actions CAN push to branches (Cursor automations can't). This is the only
  fully-hands-off, same-branch fixer. It's a second small Action alongside auto-merge.

## What this Slack automation becomes

Repurpose it as a **notifier**, not a fixer: on `/merge #NN` it posts a "Merge Report" comment +
Slack summary of the gate verdict and the Safe-Fix Plan status. It does not edit code. (Or delete it
and rely on the Gate's approval + auto-merge directly.)

## Re-run model on a fix push (see brainstorm)

- CI (`ci-gate`, `integration-gate`): **always re-runs** on every push — required, non-negotiable.
- Final Merge Gate: **re-runs** (re-approves the new head) — required for auto-merge.
- Specialist battery: **run once per PR** (guard per-PR, not per-commit) to control cost + avoid
  nit-loops; the Gate is the backstop for fix-introduced issues. Optionally let the 2 correctness bots
  (Systematic Bug, Adversarial Pre-Mortem) re-run per-commit.
