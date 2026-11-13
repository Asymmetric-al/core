// Qualification probe: record what identity a script node receives and, in
// boundary mode, prepare an allowed root and a forbidden target for the guard.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { factoryPaths, loadConfig } from "../../.shared/config.mjs";
import { ensureInitialRunIdentity } from "../../.shared/identity.mjs";
import { writeRunContext } from "../../.shared/runctx.mjs";

const mode = String(process.env.INPUTS_MODE ?? "identity");
const runId = process.env.WORKFLOW_ID!;
const config = loadConfig();
if (mode === "boundary") await ensureInitialRunIdentity({ config, runId });
const paths = factoryPaths(config);
const runDir = path.posix.join(paths.runs, runId);
const view = path.posix.join(paths.views, runId, "probe");
mkdirSync(view, { recursive: true });
mkdirSync(runDir, { recursive: true });
writeFileSync(path.posix.join(view, "allowed.txt"), "factory-probe-allowed\n");
const forbidden = path.posix.join(config.root, "control", "core-factory.json");
writeRunContext(
  {
    v: 1,
    runId,
    issue: 0,
    round: 0,
    nodes: {
      boundary: {
        role: "micaiah",
        read: [view],
        check: {
          workspaceRoot: path.posix.dirname(view),
          workspaceDirectory: view,
          workspaceTarget: "/candidate",
          mounts: [],
        },
      },
    },
  },
  paths.runs,
);
writeFileSync(
  path.posix.join(runDir, "identity.json"),
  JSON.stringify(
    {
      workflowId: runId,
      nodeExecution: JSON.parse(process.env.ARCHON_NODE_EXECUTION ?? "null"),
      cliCommand: process.env.ARCHON_CLI_COMMAND ?? null,
      claudeConfigDir: process.env.CLAUDE_CONFIG_DIR ?? null,
      home: process.env.HOME,
      overrides: [
        "ANTHROPIC_API_KEY",
        "CLAUDE_CODE_OAUTH_TOKEN",
        "ANTHROPIC_BASE_URL",
        "IS_SANDBOX",
      ].filter((key) => process.env[key]),
    },
    null,
    2,
  ),
);
process.stdout.write(
  JSON.stringify({
    boundary: mode === "boundary" ? "yes" : "no",
    allowed: path.posix.join(view, "allowed.txt"),
    forbidden,
    forbidden_write: path.posix.join(config.root, "control", "probe-write.txt"),
    reason: `identity recorded in ${runDir}/identity.json`,
  }) + "\n",
);
