import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const matrix =
  "docs/prds/sitestacker-parity/phase-24-multi-site-management-traceability.md";
const decisionLog =
  "docs/prds/sitestacker-parity/phase-24-multi-site-management-decision-log.md";
let root: string;
let baseline: string;
let logBaseline: string;

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), "phase24-review-"));
  for (const relative of [
    "docs/prds/sitestacker-parity",
    "docs/adr",
    "docs/ai/document-authority.md",
    "openspec/changes/add-multi-site-management",
  ]) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(path.join(repository, relative), path.join(root, relative), {
      recursive: true,
    });
  }
  baseline = readFileSync(path.join(root, matrix), "utf8");
  logBaseline = readFileSync(path.join(root, decisionLog), "utf8");
});
afterEach(() => {
  writeFileSync(path.join(root, matrix), baseline);
  writeFileSync(path.join(root, decisionLog), logBaseline);
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

// Literal cases independently reproduced in Micaiah/Luke review reports.
const cases = [
  {
    name: "malformed ADR",
    owner: "D1",
    column: 1,
    value: "ADR-BOGUS",
    token: "ADR-BOGUS",
  },
  {
    name: "unparsed ADR",
    owner: "D1",
    column: 1,
    value: "ADR-NOT-A-DECLARED-ID",
    token: "ADR-NOT-A-DECLARED-ID",
  },
  {
    name: "appended unknown authority",
    owner: "D1",
    column: 1,
    value: "decision log D1; Unknown Authority",
    token: "Unknown Authority",
  },
  {
    name: "appended invented policy",
    owner: "D1",
    column: 1,
    value: "decision log D1; invented-policy",
    token: "invented-policy",
  },
  {
    name: "URL authority",
    owner: "D1",
    column: 1,
    value: "https://example.invalid/phase-24-multi-site-management.md",
    token: "https://example.invalid/phase-24-multi-site-management.md",
  },
  {
    name: "traversal authority",
    owner: "D1",
    column: 1,
    value: "../phase-24-multi-site-management.md",
    token: "../phase-24-multi-site-management.md",
  },
  {
    name: "unrelated existing basename authority",
    owner: "D7",
    column: 1,
    value: "phase-24-multi-site-management.md",
    token: "phase-24-multi-site-management.md",
  },
  {
    name: "nonexistent founder PRD locus",
    owner: "D1",
    column: 2,
    value: "Nonexistent PRD locus",
    token: "Nonexistent PRD locus",
  },
  {
    name: "nonexistent founder requirement section",
    owner: "D1",
    column: 2,
    value: "Nonexistent Founder Requirement Section",
    token: "Nonexistent Founder Requirement Section",
  },
  {
    name: "missing owned release obligation",
    owner: "US24-036",
    column: 9,
    value: "EV24-LOCALE",
    token: "EV24-DOMAIN",
  },
  {
    name: "noncanonical decision range",
    owner: "US24-001",
    column: 1,
    value: "D01-D02",
    token: "D01-D02",
  },
  {
    name: "duplicate expanded decision",
    owner: "US24-001",
    column: 1,
    value: "D1-D2,D2",
    token: "D2",
  },
  {
    name: "overlapping decision ranges",
    owner: "US24-001",
    column: 1,
    value: "D1-D3,D2-D4",
    token: "D2-D4",
  },
];

it.each(cases)(
  "rejects $name at the owning row",
  ({ owner, column, value, token }) => {
    let row = 0;
    const changed = baseline
      .split("\n")
      .map((line, index) => {
        const cells = line.split("|");
        if (cells[1]?.trim() !== owner) return line;
        row = index + 1;
        cells[column + 1] = ` ${value} `;
        return cells.join("|");
      })
      .join("\n");
    expect(row).toBeGreaterThan(0);
    writeFileSync(path.join(root, matrix), changed);
    const result = spawnSync(
      process.execPath,
      [
        path.join(repository, "scripts/verify/phase24-authority.mjs"),
        "--root",
        root,
        "--json",
      ],
      {
        encoding: "utf8",
        timeout: 20_000,
        env: { PATH: process.env.PATH, LANG: "C", TZ: "UTC" },
        shell: false,
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      diagnostics: Array<{
        file: string;
        line: number;
        owner: string;
        token: string;
      }>;
    };
    expect(
      report.diagnostics.some(
        (diagnostic) =>
          diagnostic.file === matrix &&
          diagnostic.line === row &&
          diagnostic.owner === owner &&
          diagnostic.token.includes(token),
      ),
    ).toBe(true);
    expect(result.stdout).not.toContain(root);
  },
);

it.each(["inside", "outside"])(
  "rejects duplicate historical D19 declarations %s the preserved interval",
  (position) => {
    const heading =
      "\n## D19 — Additional Phase 24 founder decision\n\nThis is a controlling Phase 24 launch decision.\n";
    const changed =
      position === "inside"
        ? logBaseline.replace("## D57 —", `${heading}\n## D57 —`)
        : logBaseline + heading;
    const row = changed
      .slice(0, changed.indexOf("## D19 — Additional"))
      .split("\n").length;
    writeFileSync(path.join(root, decisionLog), changed);
    const result = spawnSync(
      process.execPath,
      [
        path.join(repository, "scripts/verify/phase24-authority.mjs"),
        "--root",
        root,
        "--json",
      ],
      { encoding: "utf8", timeout: 20_000, shell: false },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout).not.toBe(0);
    expect(JSON.parse(result.stdout).diagnostics).toContainEqual(
      expect.objectContaining({
        file: decisionLog,
        line: row,
        owner: "D19",
        token: "D19",
      }),
    );
    expect(result.stdout).not.toContain(root);
  },
);
