import { writeFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = realpathSync(process.cwd());
const output = path.dirname(fileURLToPath(import.meta.url));
if (
  root !== "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12" ||
  !output.endsWith("round13r2-grid-qualification")
)
  throw new Error("Wrong workspace");
const common = [
  "node_modules/vitest/vitest.mjs",
  "run",
  "--configLoader",
  "runner",
  "--no-cache",
  "--no-fsModuleCache",
  "--fsModuleCachePath",
  path.join(output, "disabled-module-cache"),
  "--maxWorkers=1",
  "--no-fileParallelism",
  "--reporter=verbose",
  "--no-color",
];
const cases = [
  [
    "context-publication",
    ["tests/unit/packages/ui/data-grid-context-publication.test.tsx"],
  ],
  [
    "contributions-consumer",
    [
      "tests/unit/apps/admin/app/contributions-hub-grid.test.tsx",
      "-t",
      "renders every gift through the ReUI grid|keeps a View choice to show Fund / designation|pins the donor and the row actions",
    ],
  ],
];
const outcomes = [];
for (const [name, filters] of cases) {
  const argv = ["node", ...common, ...filters];
  const startedAt = new Date().toISOString();
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
    timeout: 180000,
  });
  const record = {
    name,
    argv,
    cwd: root,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message || null,
    environmentOverrides: {},
    cachePolicy:
      "CLI configLoader=runner avoids bundled-config temp output; result and filesystem-module caches disabled; dependency optimizer disabled by installed Vitest defaults; no watch, browser, UI or API mode.",
  };
  writeFileSync(path.join(output, `${name}.stdout.log`), result.stdout || "", {
    flag: "wx",
  });
  writeFileSync(path.join(output, `${name}.stderr.log`), result.stderr || "", {
    flag: "wx",
  });
  writeFileSync(
    path.join(output, `${name}.command.json`),
    JSON.stringify(record, null, 2) + "\n",
    { flag: "wx" },
  );
  outcomes.push(record);
  console.log(JSON.stringify(record));
  if (result.error) break;
}
writeFileSync(
  path.join(output, "test-outcomes.json"),
  JSON.stringify(outcomes, null, 2) + "\n",
  { flag: "wx" },
);
if (outcomes.some((record) => record.exitCode !== 0)) process.exitCode = 1;
