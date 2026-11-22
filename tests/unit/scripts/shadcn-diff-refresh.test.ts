import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { sourceHash } from "../../../scripts/verify/shadcn-diff.mjs";
import {
  adapter,
  implementation,
  proof,
  refreshFixture,
  registry,
  support,
} from "../../fixtures/quality/shadcn-refresh";

describe("targeted shadcn review refresh", () => {
  let directory: string;
  let root: string;
  let input: ReturnType<typeof refreshFixture>;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "core-review-refresh-"));
    root = path.join(directory, "repo");
    input = refreshFixture(root);
  });
  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it("refreshes all four local forms, including overlapping pins, without constructing a transport", () => {
    const args = [
      "--refresh-local",
      path.join(root, proof),
      `./${support}`,
      `packages\\ui\\${adapter.replaceAll("/", "\\")}`,
      implementation,
    ];
    const result = input.run(args, { HTTPS_PROXY: "invalid" });
    expect(result.status, result.stderr).toBe(0);
    const hash = (file: string) => sourceHash(`${file}\n`);
    for (const entry of input.baseline.proofSources)
      entry.sha256 = hash(entry.path);
    input.baseline.protectedSources[0]!.localSha256 = hash(support);
    input.baseline.localOnly[0]!.localSha256 = hash(`packages/ui/${adapter}`);
    input.baseline.files.find((entry) => entry.path === registry)!.localSha256 =
      hash(implementation);
    expect(JSON.parse(input.read())).toEqual(input.baseline);
    expect(input.read()).toBe(input.serialize());
    expect(input.run(args).status).toBe(0);
    expect(input.read()).toBe(input.serialize());
    expect(existsSync(input.calls)).toBe(false);
  });

  const diffRequest = `add button --diff ${registry}`;
  it("refreshes just the canonical diff and all its owning previews through the pinned CLI", () => {
    const result = input.run([
      "--refresh-diffs",
      implementation,
      `./${implementation}`,
    ]);
    expect(result.status, result.stderr).toBe(0);
    const requests = [diffRequest];
    for (const component of input.baseline.components.filter(({ name }) =>
      ["button", "dialog"].includes(name),
    )) {
      const request = `add ${component.name} --dry-run`;
      requests.push(request);
      component.previewSha256 = sourceHash(input.responses[request]);
    }
    input.baseline.files.find((entry) => entry.path === registry)!.diffSha256 =
      sourceHash(input.responses[diffRequest]);
    expect(JSON.parse(input.read())).toEqual(input.baseline);
    expect(input.read()).toBe(input.serialize());
    expect(
      readFileSync(input.calls, "utf8")
        .trim()
        .split("\n")
        .filter((request) => request.startsWith("add "))
        .sort(),
    ).toEqual(requests.sort());
  });

  it.each(["transport", "inventory", "owner"])(
    "leaves the original bytes on %s failure",
    (failure) => {
      if (failure === "transport") delete input.responses[diffRequest];
      else if (failure === "inventory")
        input.responses["add dialog --dry-run"] = input.responses[
          "add dialog --dry-run"
        ]!.replace("overwrite", "create");
      else {
        input.baseline.files.find((entry) => entry.path === registry)!.owners =
          ["button"];
        input.reset();
      }
      input.setResponses();
      const before = input.read();
      const result = input.run(["--refresh-diffs", implementation]);
      expect(result.status).toBe(2);
      expect(result.stderr).toMatch(
        failure === "transport" ? /CLI coverage failed/ : /preview|owner/i,
      );
      expect(input.read()).toBe(before);
    },
  );

  it.each([
    ["--refresh-local", "no-such-record"],
    ["--refresh-local", "-unmatched.md"],
    ["--refresh-diffs", "no-such-record"],
    ["--refresh-local", "../outside.ts"],
    ["--refresh-diffs", proof],
  ])("rejects %s with %s before doing any work", (mode, bad) => {
    const result = input.run([mode, implementation, bad]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain(bad);
    expect(input.read()).toBe(input.serialize());
    expect(existsSync(input.calls)).toBe(false);
  });

  it("refuses a matched path through a directory link outside the repo", () => {
    rmSync(path.join(root, proof));
    rmSync(path.join(root, "docs"), { recursive: true });
    const outside = path.join(directory, "outside");
    mkdirSync(outside);
    writeFileSync(path.join(outside, "contract.md"), "outside");
    symlinkSync(
      outside,
      path.join(root, "docs"),
      process.platform === "win32" ? "junction" : "dir",
    );
    expect(input.run(["--refresh-local", proof]).status).toBe(2);
    expect(input.read()).toBe(input.serialize());
  });

  it("refuses unapproved registry transport before launching the CLI", () => {
    const result = input.run(["--refresh-diffs", implementation], {
      HTTPS_PROXY: "invalid",
    });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Invalid approved HTTP(S) proxy transport");
    expect(existsSync(input.calls)).toBe(false);
    expect(input.read()).toBe(input.serialize());
  });

  it.each([
    ["--refresh-local"],
    ["--refresh-diffs"],
    ["--amend", proof],
    ["--refresh-local", "--refresh-diffs", implementation],
  ])("rejects invalid invocation %j", (...args) => {
    expect(input.run(args).status).toBe(2);
    expect(input.read()).toBe(input.serialize());
    expect(existsSync(input.calls)).toBe(false);
  });

  it("documents only the two mechanical modes without consulting the registry", () => {
    const result = input.run(["--help"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--refresh-local");
    expect(result.stdout).toContain("--refresh-diffs");
    expect(result.stdout).not.toMatch(/--amend|--record|--replay/);
    expect(existsSync(input.calls)).toBe(false);
  });
});
