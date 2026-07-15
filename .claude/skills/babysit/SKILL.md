---
name: babysit
description: >-
  Orchestrate via @babysitter. Use this skill when asked to babysit a run,
  orchestrate a process or whenever it is called explicitly. (babysit,
  babysitter, orchestrate, orchestrate a run, workflow, etc.)
---

# babysit

Orchestrate `.a5c/runs/<runId>/` through iterative execution.

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

CLI="npx -y @a5c-ai/babysitter-sdk@$SDK_VERSION"
```

### jq

Make sure `jq` is installed and available in the path. If not, install it.

## Instructions

Run the following command to get full orchestration instructions:

```bash
$CLI instructions:babysit-skill --harness cursor --json
```

Follow the instructions returned by the command above to orchestrate the run.

## Cursor -- In-Turn Loop Model

**IMPORTANT**: Cursor does NOT have a Stop hook that can drive the orchestration
loop between turns. Unlike Claude Code, there is no hook mechanism to
automatically re-enter the orchestration loop.

Therefore, you MUST use **in-turn iteration**: run the full orchestration loop
within a single session turn. The pattern is:

1. `$CLI run:iterate --json` -- get pending actions
2. For each pending action: execute it (run tasks, post results via `task:post`)
3. `$CLI run:iterate --json` -- check for more pending actions
4. Repeat steps 2-3 until run completes or reaches a breakpoint requiring user input
5. If a breakpoint requires user input, ask the user and post the response, then continue iterating

All iteration happens within the same turn -- do NOT rely on hooks to re-enter
the orchestration loop. The agent drives the loop directly by calling
`run:iterate` repeatedly until completion.

### Loop Example

```bash
# Initial iterate
RESULT=$($CLI run:iterate --run-id "$RUN_ID" --json)
STATUS=$(echo "$RESULT" | jq -r '.status')

while [ "$STATUS" != "completed" ] && [ "$STATUS" != "failed" ]; do
  # Process pending actions from RESULT
  # ... execute tasks, post results ...

  # Iterate again
  RESULT=$($CLI run:iterate --run-id "$RUN_ID" --json)
  STATUS=$(echo "$RESULT" | jq -r '.status')
done
```
