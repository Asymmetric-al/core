---
name: babysit
description: Execute via @babysitter. Use this skill when asked to babysit a task, do anything that is structured process-driven (even a loop) or whenever it is called explicitly. (babysit, babysitter, with a process, orchestrate, orchestrate a run, workflow, loop until, etc.)
allowed-tools: Read, Grep, Write, Task, Bash, Edit, Grep, Glob, WebFetch, WebSearch, Search, AskUserQuestion, TodoWrite, TodoRead, Skill, BashOutput, KillShell, MultiEdit, LS
version: 0.1.3
---

# babysit

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Cursor has no Stop hook that can drive the orchestration loop between turns.
Use in-turn iteration: run the full babysitter loop in a single session turn.
Reconcile this overlay after upstream refreshes before running
`bun run skills:sync`.

### Triggers

- The user asks to babysit, orchestrate, or run a structured process through
  `@babysitter`.

### Workflow

1. Resolve the exact SDK pin from `docs/ai/skills/babysit/versions.json`.
   Do not fall back to an unpinned package tag or a global install.
2. Drive `$CLI run:iterate` repeatedly in the same turn until the run
   completes or needs user input.
3. Keep scratch checkouts under `/tmp`, not under `.a5c/runs/*/work`.

### Checklist

- [ ] The CLI used the reviewed exact pin through `npm exec`
- [ ] Iteration happened in-turn, without relying on a Stop hook
- [ ] No run-dir worktree was left behind

<!-- CORE-OVERLAY-END -->

Follow the commands below exactly. but apply judgement and creativity to get the job done. no matter how small or simple the task may seem, you must use the babysitter SDK and run lifecycle to execute it. This is non-negotiable. If you are asked to do something that seems like it could be done with a simple tool call, you must still use the babysitter SDK to create a run, define tasks, execute them, and complete the run. This is how you will learn and demonstrate mastery of the babysitter system. Always follow the full process, even for trivial tasks.

Subagents that need a scratch checkout or working directory must create it under
`/tmp/<descriptive-name>/`, not under `.a5c/runs/<runId>/work`. Before returning
deliverables, validate that no run-dir worktree was left behind, for example:

```bash
find .a5c/runs -maxdepth 3 -name work -type d -print
```

That command should print nothing. If it prints a non-empty work directory, move
or remove only the scratch data you created before returning.

## Dependencies

### Babysitter SDK and CLI

Resolve the repository root and read the reviewed SDK version from
`docs/ai/skills/babysit/versions.json`. Stop immediately if the repository root
or an exact package version cannot be resolved:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel) || exit 1
SDK_VERSION=$(
  node -e '
const fs = require("node:fs");
const path = require("node:path");

const versionsPath = path.join(
  process.argv[1],
  "docs/ai/skills/babysit/versions.json",
);
const exactVersionPattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

try {
  const versions = JSON.parse(fs.readFileSync(versionsPath, "utf8"));
  const sdkVersion = versions.sdkVersion;

  if (typeof sdkVersion !== "string" || !exactVersionPattern.test(sdkVersion)) {
    throw new Error("sdkVersion must be a nonempty exact package version");
  }

  process.stdout.write(sdkVersion);
} catch (error) {
  console.error(`Unable to resolve the pinned Babysitter SDK version: ${error.message}`);
  process.exit(1);
}
' "$REPO_ROOT"
) || exit 1

CLI="npm exec --yes --package @a5c-ai/babysitter-sdk@$SDK_VERSION -- babysitter"
```

### jq

Make sure `jq` is installed and available in the path. If not, install it.

## Instructions

Run the non-interactive Cursor harness instructions so they can be reconciled
with the Core overlay's in-turn loop:

```bash
$CLI instructions:babysit-skill --harness cursor --no-interactive
```

Follow the returned instructions only where they do not conflict with this
file's Core overlay. In Cursor, keep driving `$CLI run:iterate` in this same
turn; do not switch to interactive mode or rely on a Stop hook.
