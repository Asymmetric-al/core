import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { validateNodeVersion } from "../../../scripts/verify/node-version.mjs";

const approved = "24.22.3";

describe("approved Node runtime", () => {
  it.each(["24.22.3", "v24.22.3", "24.22.4", "24.23.0"])(
    "accepts the tested floor and maintained patches: %s",
    (version) =>
      expect(() => validateNodeVersion(version, approved)).not.toThrow(),
  );

  it.each([
    "20.9.0",
    "22.22.0",
    "24.21.0",
    "24.22.0",
    "24.22.1",
    "24.22.2",
    "25.0.0",
    "26.6.0",
    "24.22.3-rc.1",
    "24.22",
    "invalid",
  ])("rejects unsupported, older or unqualified runtimes: %s", (version) =>
    expect(() => validateNodeVersion(version, approved)).toThrow(/Node.js/),
  );

  it("fails closed on a malformed approved pin", () => {
    expect(() => validateNodeVersion(approved, "24.x")).toThrow(/approved/);
  });

  it("keeps the package engine pinned to the repository's Node version", () => {
    const pin = readFileSync(".node-version", "utf8").trim();
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    expect(manifest.engines.node).toBe(`>=${pin} <25`);
  });

  // Found by scanning the directory, so that a new workflow cannot be missed
  // (council round 2, A1: the release workflow ran on 24.22.1, which Payload
  // refuses, because a fixed list of four workflows left it out).
  it("pins every workflow that sets up Node to the repository's Node version", () => {
    const pin = readFileSync(".node-version", "utf8").trim();
    const dir = ".github/workflows";
    const settingNode = readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => ({ file, text: readFileSync(`${dir}/${file}`, "utf8") }))
      .filter(({ text }) =>
        /actions\/setup-node@|\bNODE_VERSION:|\bnode-version:/.test(text),
      );
    expect(settingNode.map(({ file }) => file)).toEqual(
      expect.arrayContaining([
        "ci.yml",
        "ci-integration.yml",
        "qa-smoke-preview-deploy.yml",
        "release.yml",
        "shadscan.yml",
      ]),
    );
    for (const { file, text } of settingNode) {
      const versions = [
        ...text.matchAll(
          /\b(?:NODE_VERSION|node-version):\s*["']?([0-9][^"'\s]*)["']?/g,
        ),
      ].map((match) => match[1]);
      // Every setup-node step reads a literal version, directly or through
      // the workflow's NODE_VERSION.
      expect(versions.length, file).toBeGreaterThan(0);
      expect(new Set(versions), file).toEqual(new Set([pin]));
      expect(text, file).not.toMatch(/node-version-file:/);
    }
  });
});
