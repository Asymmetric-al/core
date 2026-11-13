import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
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
const require = createRequire(path.join(root, "package.json"));
const typescript = require("typescript");
const prettier = require("prettier");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const save = (name, value) =>
  writeFileSync(path.join(output, name), value, { flag: "wx" });
const json = (name, value) => save(name, JSON.stringify(value, null, 2) + "\n");
const fresh =
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/round13r2-20261111T205100Z-fresh";
const unresolved = JSON.parse(
  readFileSync(path.join(root, fresh, "v2-unresolved-review.json"), "utf8"),
);
const findings = unresolved.findings.filter(
  (entry) => entry.diagnostic.severity === "error",
);
if (findings.length !== 2) throw new Error("Unexpected unresolved error count");
json("diagnostics.json", {
  source: `${fresh}/v2-unresolved-review.json`,
  status: unresolved.status,
  wholeLedgerValid: unresolved.wholeLedgerValid,
  wholeLedgerFailure: unresolved.wholeLedgerFailure,
  applicableDiagnostics: unresolved.applicableDiagnostics,
  unresolvedDiagnostics:
    unresolved.freshUnresolvedAfterMechanicallyExactPriorSubset,
  disclaimer: unresolved.disclaimer,
  findings,
});

const commands = [
  [
    "direct-consumers",
    [
      "rg",
      "-n",
      "DataGridColumnHeader|DataGridScrollArea|data-grid-column-header|data-grid-scroll-area",
      "apps",
      "packages",
      "tests",
      "--glob",
      "*.{ts,tsx}",
    ],
  ],
  [
    "feature-flags",
    [
      "rg",
      "-n",
      "columnsMovable|columnsPinnable|headerSticky",
      "apps",
      "packages/ui",
      "tests",
      "--glob",
      "*.{ts,tsx}",
    ],
  ],
  [
    "test-owner-imports",
    [
      "rg",
      "-n",
      "components/(reui|shadcn)/data-grid|DataGridColumnHeader|DataGridScrollArea",
      "tests",
      "--glob",
      "*.{ts,tsx}",
    ],
  ],
  [
    "spec-search",
    [
      "rg",
      "-n",
      "-i",
      "column.?order|custom vertical|resizeobserver|data.grid|react.doctor",
      "openspec/project.md",
      "openspec/specs",
      "openspec/changes",
      "--glob",
      "*.md",
      "--max-count",
      "6",
    ],
  ],
];
const commandRecords = [];
for (const [name, argv] of commands) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  save(`${name}.stdout.log`, result.stdout || "");
  save(`${name}.stderr.log`, result.stderr || "");
  commandRecords.push({
    name,
    argv,
    cwd: root,
    startedAt,
    endedAt: new Date().toISOString(),
    exitCode: result.status,
    error: result.error?.message || null,
  });
  if (result.error || ![0, 1].includes(result.status))
    throw new Error(`Search failed: ${name}`);
}
json("analysis-commands.json", commandRecords);

const snapshots = [
  [
    "header-owner",
    "packages/ui/components/reui/data-grid/data-grid-column-header.tsx",
  ],
  [
    "scroll-owner",
    "packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx",
  ],
  [
    "panel-consumer",
    "packages/ui/components/data-grid-panel/data-grid-panel.tsx",
  ],
  [
    "engine-boundary",
    "packages/ui/components/data-grid-panel/data-grid-engine.ts",
  ],
];
mkdirSync(path.join(output, "sources"), { recursive: true });
const inputs = [];
for (const [name, relative] of snapshots) {
  const bytes = readFileSync(path.join(root, relative));
  inputs.push(relative);
  save(
    `sources/${name}.txt`,
    `${relative}\nSHA256 ${digest(bytes)}\n\n` +
      bytes
        .toString("utf8")
        .split("\n")
        .map((line, index) => `${index + 1}: ${line}`)
        .join("\n"),
  );
}
inputs.push(
  "AGENTS.md",
  "packages/ui/AGENTS.md",
  ".agents/skills/react-doctor/SKILL.md",
  "docs/guides/development/react-doctor.md",
  "doctor.config.json",
  "package.json",
  "packages/ui/package.json",
  "packages/ui/components.json",
  "vitest.config.mts",
  "tests/setup/unit-env.ts",
  `${fresh}/report.md`,
  `${fresh}/v2-unresolved-review.json`,
  `${fresh}/strict/packages-ui.json`,
);
for (const line of readFileSync(
  path.join(output, "direct-consumers.stdout.log"),
  "utf8",
).split("\n")) {
  const match = line.match(/^(.+?):\d+:/);
  if (match) inputs.push(match[1].replaceAll("\\", "/"));
}
inputs.push(
  "packages/ui/components/reui/data-grid/data-grid.tsx",
  "packages/ui/components/reui/data-grid/data-grid-table.tsx",
  "packages/ui/components/reui/data-grid/data-grid-table-virtual.tsx",
  "tests/unit/packages/ui/data-grid-panel.test.tsx",
  "tests/unit/packages/ui/data-grid-context-publication.test.tsx",
  "tests/unit/apps/admin/app/contributions-hub-grid.test.tsx",
  "tests/unit/apps/admin/web-studio-collection-grid.test.tsx",
  "tests/unit/apps/admin/app/ui-improvement-grid-headers.test.tsx",
  "tests/e2e/react-cleanup-grid.spec.ts",
);
const inputRecords = [...new Set(inputs)].sort().map((relative) => {
  try {
    const bytes = readFileSync(path.join(root, relative));
    return { path: relative, bytes: bytes.length, sha256: digest(bytes) };
  } catch (error) {
    return { path: relative, unavailable: error.code };
  }
});
json("analysis-inputs.json", {
  capturedAt: new Date().toISOString(),
  root,
  files: inputRecords,
});

const scannerRoot =
  "C:/Users/Conrad/.bun/install/cache/oxlint-plugin-react-doctor@0.9.18@@@1";
const scannerFile = path.join(scannerRoot, "dist/index.js");
const scannerBytes = readFileSync(scannerFile);
const scannerText = scannerBytes.toString("utf8");
const scannerSource = typescript.createSourceFile(
  scannerFile,
  scannerText,
  typescript.ScriptTarget.Latest,
  true,
  typescript.ScriptKind.JS,
);
const wanted = new Set([
  "Su",
  "Fde",
  "nd",
  "Xde",
  "Zde",
  "Qde",
  "ad",
  "Od",
  "Id",
  "sfe",
  "Rd",
  "mfe",
  "Mfe",
  "Nfe",
  "Rfe",
  "zfe",
  "Lfe",
  "jfe",
  "mf",
  "bf",
  "Bfe",
  "Sf",
  "Ff",
  "uXe",
  "dXe",
  "fXe",
  "cp",
]);
const symbols = [];
const visit = (node) => {
  if (
    typescript.isVariableDeclaration(node) &&
    wanted.has(node.name.getText(scannerSource))
  ) {
    const name = node.name.getText(scannerSource);
    const start = node.getStart(scannerSource);
    const end = node.getEnd();
    symbols.push({
      name,
      startUtf16: start,
      endUtf16: end,
      startByte: Buffer.byteLength(scannerText.slice(0, start)),
      originalLine: scannerSource.getLineAndCharacterOfPosition(start).line + 1,
      text: scannerText.slice(start, end),
    });
  }
  typescript.forEachChild(node, visit);
};
visit(scannerSource);
json("scanner-excerpts.json", {
  package: JSON.parse(
    readFileSync(path.join(scannerRoot, "package.json"), "utf8"),
  ),
  file: scannerFile,
  sha256: digest(scannerBytes),
  bytes: scannerBytes.length,
  symbols,
});
let formatted =
  "# Pinned scanner implementation excerpts\n\nVerbatim symbol initializers from the local 0.9.18 bundle; formatting only for readability. Offsets and raw text are in scanner-excerpts.json. No scanner execution, private API or code transform was used.\n\n";
for (const symbol of symbols) {
  formatted +=
    `## ${symbol.name}\n\nBundle UTF-16 offsets ${symbol.startUtf16}-${symbol.endUtf16}; original line ${symbol.originalLine}.\n\n\`\`\`javascript\n` +
    (await prettier.format(`const ${symbol.text};`, { parser: "babel" })) +
    "\n```\n\n";
}
save("scanner-excerpts.md", formatted);
console.log(
  JSON.stringify(
    {
      capturedFindings: findings.length,
      searches: commands.length,
      sourceSnapshots: snapshots.length,
      inputHashes: inputRecords.length,
      scannerSymbols: symbols.length,
      scannerSha256: digest(scannerBytes),
    },
    null,
    2,
  ),
);
