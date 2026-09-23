import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { verifyOpenSpecDeltaCompatibility } from "../../../scripts/verify/openspec-delta-compatibility.mjs";

const tempRoots: string[] = [];
const originalRequirement = `### Requirement: Keep Records

Records MUST remain durable.

#### Scenario: A record is written

- WHEN a record is written
- THEN it remains readable
`;

async function fixture(delta: string) {
  const root = await mkdtemp(path.join(os.tmpdir(), "core-openspec-compat-"));
  tempRoots.push(root);
  const basePath = path.join(root, "openspec/specs/records/spec.md");
  const deltaPath = path.join(
    root,
    "openspec/changes/update-records/specs/records/spec.md",
  );
  await mkdir(path.dirname(basePath), { recursive: true });
  await mkdir(path.dirname(deltaPath), { recursive: true });
  await writeFile(
    basePath,
    `# Records

## Purpose

Preserve durable records and their observable read-after-write contract.

## Requirements

${originalRequirement}`,
  );
  await writeFile(
    deltaPath,
    `# Delta for Records

${delta}`,
  );
  return { root, basePath, deltaPath };
}

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("OpenSpec delta compatibility", () => {
  it("reports a MODIFIED target renamed out of the durable base", async () => {
    const { root } = await fixture(`## MODIFIED Requirements

${originalRequirement.replace("Keep Records", "Retired Name")}`);
    const result = await verifyOpenSpecDeltaCompatibility(root);
    expect(result.checked).toBe(1);
    expect(result.failures).toEqual([
      expect.objectContaining({
        change: "update-records",
        capability: "records",
        message: expect.stringContaining(
          'MODIFIED failed for header "### Requirement: Retired Name" - not found',
        ),
      }),
    ]);
  });

  it("rejects a changed ADDED block that collides with an existing requirement", async () => {
    const { root } = await fixture(`## ADDED Requirements

${originalRequirement.replace("Records MUST remain durable.", "Records MUST expire after one day.")}`);
    const result = await verifyOpenSpecDeltaCompatibility(root);
    expect(result.failures).toEqual([
      expect.objectContaining({
        change: "update-records",
        capability: "records",
        message: expect.stringContaining(
          'ADDED failed for header "### Requirement: Keep Records" - already exists',
        ),
      }),
    ]);
  });

  it("accepts already synced additions and fresh changes without writing either input", async () => {
    const { root, basePath, deltaPath } = await fixture(`## ADDED Requirements

${originalRequirement}
${originalRequirement.replaceAll("Keep Records", "Export Records")}`);
    const before = await Promise.all([
      readFile(basePath, "utf8"),
      readFile(deltaPath, "utf8"),
    ]);
    expect(await verifyOpenSpecDeltaCompatibility(root)).toEqual({
      checked: 1,
      failures: [],
    });
    expect(
      await Promise.all([
        readFile(basePath, "utf8"),
        readFile(deltaPath, "utf8"),
      ]),
    ).toEqual(before);
  });
});
