import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  contractDigest,
  renderContractView,
  verifyContractReferences,
} from "../../../scripts/lib/openspec-contracts.mjs";

const roots: string[] = [];
const body =
  "The system MUST preserve exact tenant authority. " +
  "It MUST NOT infer consent or bypass the owner gate. ".repeat(12);
const scenario =
  "#### Scenario: Tenant denial\n\n- **WHEN** another tenant attempts access\n- **THEN** access is denied";
const delta = `## ADDED Requirements\n\n### Requirement: Tenant authority\n\n${body.trim()}\n\n${scenario}\n`;

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("OpenSpec binding contract views", () => {
  it("rejects a symlinked companion directory without changing the external file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "openspec-contract-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "openspec-outside-"));
    roots.push(root, outside);
    await mkdir(path.join(root, "openspec"));
    await writeFile(path.join(outside, "tenants.md"), "untouched");
    await symlink(outside, path.join(root, "openspec/contracts"), "dir");
    await expect(
      renderContractView({
        repoRoot: root,
        capability: "tenants",
        content: delta,
        write: true,
      }),
    ).rejects.toThrow(/symlink|repository/i);
    expect(await readFile(path.join(outside, "tenants.md"), "utf8")).toBe(
      "untouched",
    );
  });
  it.each([
    ["omitted", (line: string) => ""],
    ["misspelled", (line: string) => line.replace("contracts/", "contractz/")],
    [
      "conditional",
      (line: string) => `Only when a maintainer chooses, ${line}`,
    ],
    ["commented", (line: string) => `<!-- ${line} -->`],
    ["fenced", (line: string) => `\`\`\`text\n${line}\n\`\`\``],
  ])("rejects a %s binding", async (_, mutate) => {
    const root = await mkdtemp(path.join(os.tmpdir(), "openspec-contract-"));
    roots.push(root);
    const compact = await renderContractView({
      repoRoot: root,
      capability: "tenants",
      content: delta,
      write: true,
    });
    const line = compact
      .split("\n")
      .find((value) => value.startsWith("Every clause"))!;
    await expect(
      verifyContractReferences(
        root,
        "tenants",
        compact.replace(line, mutate(line)),
      ),
    ).rejects.toThrow(/unconditional/i);
  });

  it("detects semantic changes in inline code, list scope, and fenced indentation", () => {
    const digest = (body: string) =>
      contractDigest("tenants", "Exact bytes", body);
    expect(digest("The system MUST emit `a  b`.")).not.toBe(
      digest("The system MUST emit `a b`."),
    );
    expect(digest("MUST enforce:\n- parent\n  - child")).not.toBe(
      digest("MUST enforce:\n- parent\n- child"),
    );
    expect(digest("MUST emit:\n```\na  b\n```")).not.toBe(
      digest("MUST emit:\n```\na b\n```"),
    );
  });
  it("preserves every clause and scenario, checks without writing, and is idempotent", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "openspec-contract-"));
    roots.push(root);
    await expect(
      renderContractView({
        repoRoot: root,
        capability: "tenants",
        content: delta,
      }),
    ).rejects.toThrow(/missing/i);
    const compact = await renderContractView({
      repoRoot: root,
      capability: "tenants",
      content: delta,
      write: true,
    });
    expect(compact).toContain(
      "The system MUST preserve exact tenant authority.",
    );
    expect(compact).toContain("MUST apply without exception");
    expect(compact.endsWith(`${scenario}\n`)).toBe(true);
    const file = path.join(root, "openspec/contracts/tenants.md");
    const before = await readFile(file, "utf8");
    expect(before).toContain(`\n\n${body.trim()}\n\n`);
    expect(
      await renderContractView({
        repoRoot: root,
        capability: "tenants",
        content: delta,
      }),
    ).toBe(compact);
    expect(
      await renderContractView({
        repoRoot: root,
        capability: "tenants",
        content: compact,
        write: true,
      }),
    ).toBe(compact);
    expect(await readFile(file, "utf8")).toBe(before);
    await verifyContractReferences(root, "tenants", compact);
    await writeFile(file, before.replace('id="contract-', 'id="missing-'));
    await expect(
      verifyContractReferences(root, "tenants", compact),
    ).rejects.toThrow(/anchor/i);
    await writeFile(file, before.replace("MUST NOT infer", "MAY infer"));
    await expect(
      verifyContractReferences(root, "tenants", compact),
    ).rejects.toThrow(/digest|changed/i);
  });

  it("keeps distinct accepted and proposed bodies under separate references", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "openspec-contract-"));
    roots.push(root);
    const accepted = await renderContractView({
      repoRoot: root,
      capability: "tenants",
      content: delta,
      write: true,
    });
    const proposed = await renderContractView({
      repoRoot: root,
      capability: "tenants",
      content: delta.replace("exact tenant", "exact organization"),
      write: true,
    });
    expect(accepted.match(/#contract-[a-f0-9]+/)?.[0]).not.toBe(
      proposed.match(/#contract-[a-f0-9]+/)?.[0],
    );
    await expect(
      verifyContractReferences(root, "billing", accepted),
    ).rejects.toThrow(/capability/i);
    await expect(
      verifyContractReferences(
        root,
        "tenants",
        accepted.replace("MUST apply without exception", "may be consulted"),
      ),
    ).rejects.toThrow(/unconditional/i);
  });
});
