import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

import { afterAll, beforeAll, expect, it } from "vitest";

import {
  bin,
  invoke,
  launcher,
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";

const realBackend = join(root, "node_modules/.bin", bin("tsrs-lint"));
const rule = "typescript(no-floating-promises)";
let directory: string;
let source: string;
let recorder: string;
let record: string;
beforeAll(() => {
  directory = mkdtempSync(join(root, ".tmp-quality-tsrs-"));
  source = join(directory, "promise.ts");
  writeFileSync(
    source,
    "export const readValue = (): Promise<number> => Promise.resolve(42);\n\nreadValue();\n",
  );
  writeFileSync(
    join(directory, "plain.js"),
    '/* eslint-disable no-debugger */\ndebugger;\nPromise.resolve(42);\nReflect.get({}, "field");\n',
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        target: "ES2022",
        types: [],
        allowJs: true,
        checkJs: true,
      },
      files: ["promise.ts", "plain.js"],
    }),
  );
  record = join(directory, "backend-calls.jsonl");
  writeFileSync(record, "");
  const recordingScript = join(
    root,
    "tests/fixtures/quality/record-backend.cjs",
  );
  let target = join(directory, "record-backend.cjs");
  recorder = target;
  if (process.platform === "win32") {
    const modules = join(directory, "node_modules");
    target = join(modules, "tsrs/bin/tsrs-lint");
    recorder = join(modules, ".bin/tsrs-lint.exe");
    mkdirSync(dirname(target), { recursive: true });
    mkdirSync(dirname(recorder), { recursive: true });
    copyFileSync(realBackend, recorder);
    copyFileSync(
      join(dirname(realBackend), "tsrs-lint.bunx"),
      join(dirname(recorder), "tsrs-lint.bunx"),
    );
  }
  copyFileSync(recordingScript, target);
  chmodSync(target, 0o755);
  writeFileSync(
    join(dirname(target), "settings.json"),
    JSON.stringify({ backend: realBackend, record }),
  );
});
afterAll(() => removeFixture(root, directory));

const locations = [
  { name: "repository root", cwd: root },
  { name: "workspace", cwd: join(root, "apps/factory-console") },
  { name: "outside repository", cwd: tmpdir() },
];
it.each(locations)(
  "reports the typed finding from $name",
  { timeout },
  ({ cwd }) => {
    const result = invoke(
      [
        "--typed",
        "--format",
        "json",
        cwd === tmpdir() ? source : relative(cwd, source),
      ],
      cwd,
    );
    expect(result.status, result.output).toBe(1);
    expect(JSON.parse(result.stdout).diagnostics).toContainEqual(
      expect.objectContaining({ code: rule }),
    );
  },
);
it.each(locations)(
  "records the real backend invocation from $name",
  { timeout },
  ({ cwd }) => {
    const previous = readFileSync(record, "utf8").length;
    const result = invoke(
      ["--typed", "--format", "json", source],
      cwd,
      launcher,
      recorder,
    );
    expect(result.status, result.output).toBe(1);
    expect(JSON.parse(result.stdout).diagnostics).toContainEqual(
      expect.objectContaining({ code: rule }),
    );
    const calls = readFileSync(record, "utf8")
      .slice(previous)
      .trim()
      .split("\n");
    expect(calls.map((line) => JSON.parse(line))).toContainEqual({
      args: expect.arrayContaining(["headless"]),
      fast: "0",
    });
  },
);
it("does not report the typed rule without --typed", { timeout }, () => {
  const result = invoke(["--format", "json", source]);
  expect(result.status, result.output).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ number_of_files: 1 });
  expect(result.stdout).not.toContain(rule);
});
it(
  "treats a rejected tsconfig as a tool failure even alongside a finding",
  { timeout },
  () => {
    const invalid = join(directory, "invalid");
    mkdirSync(invalid);
    writeFileSync(
      join(invalid, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { allowJs: true, types: [] },
        files: ["issue.ts", "other.js"],
      }),
    );
    writeFileSync(join(invalid, "other.js"), "export const value = 1;\n");
    const issue = join(invalid, "issue.ts");
    writeFileSync(issue, "debugger;\n");
    const result = invoke(["--typed", "--format", "json", issue]);
    expect(result.output).toContain("typescript(tsconfig-error)");
    expect(result.output).toContain("eslint(no-debugger)");
    expect(result.status, result.output).toBe(2);
  },
);
it(
  "keeps JS rules and the bundled plugin active without TS rules or ESLint suppressions",
  { timeout },
  () => {
    const result = invoke([
      "--typed",
      "--format",
      "json",
      join(directory, "plain.js"),
    ]);
    expect(result.status, result.output).toBe(1);
    expect(JSON.parse(result.stdout).diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "eslint(no-debugger)" }),
        expect.objectContaining({ code: "anti-slop(no-reflect-get)" }),
      ]),
    );
    expect(result.stdout).not.toContain(rule);
  },
);
it("reports an absent selected backend as tool failure", { timeout }, () => {
  const result = invoke(
    ["--typed", source],
    root,
    launcher,
    join(directory, "absent-tsrs-lint"),
  );
  expect(result.status, result.output).toBe(2);
  expect(result.output).toContain("absent-tsrs-lint");
});
it(
  "preserves a started backend's failure instead of counting a finding",
  { timeout },
  () => {
    const result = invoke(
      ["--typed", source],
      root,
      launcher,
      process.execPath,
    );
    expect(result.status, result.output).toBe(2);
    expect(result.output).toContain("Error running tsgolint");
  },
);
it("runs the pinned TSRS version", { timeout }, () => {
  const result = spawnSync(
    join(root, "node_modules/.bin", bin("tsrs")),
    ["--version"],
    { encoding: "utf8", shell: false, timeout: timeout - 10_000 },
  );
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toMatch(/\btsrs 7\.1\.0-beta\.tsrs2\b/);
});
it("has no alternate type-aware backend installed", { timeout }, () => {
  for (const name of ["oxlint-tsgolint", "@oxlint-tsgolint"])
    expect(existsSync(join(root, "node_modules", name))).toBe(false);
});
