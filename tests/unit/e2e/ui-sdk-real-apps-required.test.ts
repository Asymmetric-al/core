import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const SPECS = [
  "tests/e2e/ui-sdk-real-apps.spec.ts",
  "tests/e2e/ui-sdk-real-apps-portals.spec.ts",
  "tests/e2e/ui-sdk-real-apps-mission-control.spec.ts",
];

describe("UI SDK real-app specs", () => {
  it("are all run by one script that needs their servers", () => {
    const scripts = (
      JSON.parse(read("package.json")) as { scripts: Record<string, string> }
    ).scripts;
    const script = scripts["test:e2e:ui-sdk-real-apps"] ?? "";
    for (const spec of SPECS) expect(script, spec).toContain(spec);
    expect(script).toMatch(/^UI_SDK_REAL_APPS_REQUIRED=1 /);
  });

  it("send every missing-server or missing-role skip through the helper that fails in CI", () => {
    for (const spec of SPECS) {
      const source = read(spec);
      expect(source, spec).toContain(
        'import { skipUnlessRequired } from "./ui-sdk-real-apps-required";',
      );
      // The server check lives in a requireApp-style helper that runs before
      // any test; nothing in it may skip without the helper.
      const start = source.search(
        /async function require(App|MissionControl)\(/,
      );
      expect(start, spec).toBeGreaterThan(-1);
      const end = source.indexOf("\n}\n", start);
      const check = source.slice(start, end);
      expect(check, spec).toContain("skipUnlessRequired(");
      expect(check, spec).not.toContain("test.skip(");
    }
  });

  it("fails a missing server when required and skips it otherwise", async () => {
    const helper = read("tests/e2e/ui-sdk-real-apps-required.ts");
    expect(helper).toMatch(
      /REAL_APP_SERVERS_REQUIRED\s*=\s*Boolean\(process\.env\.CI\)\s*\|\|\s*process\.env\.UI_SDK_REAL_APPS_REQUIRED === "1"/,
    );
    expect(helper).toMatch(
      /if \(REAL_APP_SERVERS_REQUIRED\) \{\s*throw new Error\(/,
    );
    expect(helper).toContain("test.skip(true, reason);");
  });
});
