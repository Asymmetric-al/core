import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { validateNodeVersion } from "../../../scripts/verify/node-version.mjs";

const approved = "24.22.1";

describe("approved Node runtime", () => {
  it.each(["24.22.1", "v24.22.1", "24.22.2", "24.23.0"])(
    "accepts the tested floor and maintained patches: %s",
    (version) =>
      expect(() => validateNodeVersion(version, approved)).not.toThrow(),
  );

  it.each([
    "20.9.0",
    "22.22.0",
    "24.21.0",
    "24.22.0",
    "25.0.0",
    "26.6.0",
    "24.22.1-rc.1",
    "24.22",
    "invalid",
  ])("rejects unsupported, older or unqualified runtimes: %s", (version) =>
    expect(() => validateNodeVersion(version, approved)).toThrow(/Node.js/),
  );

  it("fails closed on a malformed approved pin", () => {
    expect(() => validateNodeVersion(approved, "24.x")).toThrow(/approved/);
  });

  it("keeps the package engine and exact CI checkpoint pins aligned", () => {
    const pin = readFileSync(".node-version", "utf8").trim();
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    expect(manifest.engines.node).toBe(`>=${pin} <25`);
    for (const name of [
      "ci",
      "ci-integration",
      "qa-smoke-preview-deploy",
      "shadscan",
    ]) {
      expect(readFileSync(`.github/workflows/${name}.yml`, "utf8")).toMatch(
        new RegExp(
          `(?:NODE_VERSION|node-version): ["']?${pin.replaceAll(".", "\\.")}["']?`,
        ),
      );
    }
  });
});
