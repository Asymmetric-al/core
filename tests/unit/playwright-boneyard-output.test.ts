import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, it } from "vitest";

it("preserves earlier raw stage artifacts through real boneyard setup cleanup", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "core-boneyard-output-"));
  const results = path.join(directory, "test-results");
  const priorStages = ["auth-preflight", "production-gate"];
  const surfaces = [
    ["ADMIN_SURFACE", "admin-boneyard"],
    ["MISSIONARY_SURFACE", "missionary-boneyard"],
    ["DONOR_SURFACE", "donor-boneyard"],
  ] as const;
  const captures: string[] = [];
  const playwright = path.resolve("node_modules/@playwright/test/index.mjs");
  const cli = path.resolve("node_modules/@playwright/test/cli.js");
  const shared = path.resolve("tests/e2e/playwright-shared.ts");

  try {
    // The temporary package owns Playwright's default output directory. Never
    // launch cleanup against the caller's checkout or its existing test-results.
    writeFileSync(path.join(directory, "package.json"), "{}");
    for (const stage of priorStages) {
      const sentinel = path.join(results, stage, "retained-trace.txt");
      mkdirSync(path.dirname(sentinel), { recursive: true });
      writeFileSync(sentinel, stage);
    }
    writeFileSync(
      path.join(directory, "capture.spec.ts"),
      `import {test} from ${JSON.stringify(playwright)};
import {mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
test("records a raw capture", async ({}, info) => {
  const capture = info.outputPath("capture.txt");
  mkdirSync(path.dirname(capture), {recursive:true});
  writeFileSync(capture, info.project.name);
  writeFileSync(path.join(${JSON.stringify(directory)}, info.project.name + ".json"), JSON.stringify(capture));
});`,
    );

    for (const [surface, project] of surfaces) {
      const configFile = path.join(directory, `${project}.config.ts`);
      writeFileSync(
        configFile,
        `import {${surface}, defineBoneyardConfig} from ${JSON.stringify(shared)};
export default {
  ...defineBoneyardConfig(${surface}, {CI:"1"}),
  testDir:${JSON.stringify(directory)}, webServer:undefined,
  use:{}, workers:1, retries:0, timeout:10000
};`,
      );
      const completed = spawnSync(
        process.execPath,
        [cli, "test", "-c", configFile],
        {
          cwd: directory,
          env: { ...process.env, CI: "1" },
          encoding: "utf8",
          timeout: 15_000,
        },
      );
      expect(completed.status, completed.stdout + completed.stderr).toBe(0);
      for (const stage of priorStages) {
        const sentinel = path.join(results, stage, "retained-trace.txt");
        expect(
          existsSync(sentinel),
          `${project} deleted ${stage} evidence`,
        ).toBe(true);
        expect(readFileSync(sentinel, "utf8")).toBe(stage);
      }
      const capture: string = JSON.parse(
        readFileSync(path.join(directory, `${project}.json`), "utf8"),
      );
      expect(path.relative(results, capture).split(path.sep)[0]).toBe(project);
      captures.push(capture);
      for (const previousCapture of captures) {
        expect(
          existsSync(previousCapture),
          `${project} deleted an earlier boneyard capture`,
        ).toBe(true);
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 50_000);
