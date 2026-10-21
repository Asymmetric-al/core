/**
 * Acceptance tests for GitHub issue #2067 — allowlist.json schema strictness.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 * Addendum 2 item 1 (schema): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306634165}
 * Addendum 3 item 1 (Samson, 2026-10-20 7:47 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306730671}
 * `nonProductionProjects` entries must be unique, non-empty plain strings
 * (project refs); the loader rejects objects, empty strings and duplicates.
 *
 * Two layers:
 * 1. This suite's own strict reader (`readAllowlist()`), run against temp files
 *    in the OS temp dir. These pass today.
 * 2. The command's loader. `node:fs` / `node:fs/promises` are mocked in this
 *    file so reads of docs/ops/document-cutover/allowlist.json return scripted
 *    text; no allowlist.json is ever written to the repo. The control case uses
 *    an owner that appears only in the scripted text, which proves the command
 *    really read it. Contract assumed here: the command reads the allowlist
 *    through node:fs during each run (not via a static JSON import, and not
 *    cached at module import).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  readAllowlist,
  runCommand,
} from "./command-harness";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";

import type * as NodeFs from "node:fs";
import type * as NodeFsPromises from "node:fs/promises";

const scripted = vi.hoisted(() => ({
  suffix: "docs/ops/document-cutover/allowlist.json",
  text: null as string | null,
}));

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

function isScriptedAllowlist(target: unknown): boolean {
  if (scripted.text === null) return false;
  const value = target instanceof URL ? target.pathname : String(target ?? "");
  return value.replaceAll("\\", "/").endsWith(scripted.suffix);
}

function encodeAs(text: string, options: unknown): string | Buffer {
  const encoding =
    typeof options === "string"
      ? options
      : (options as { encoding?: string } | undefined)?.encoding;
  return encoding ? text : Buffer.from(text, "utf8");
}

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof NodeFs>();
  const wrapped: Record<string, unknown> = {
    ...actual,
    existsSync: (target: unknown) =>
      isScriptedAllowlist(target) ||
      actual.existsSync(target as Parameters<typeof actual.existsSync>[0]),
    readFileSync: (target: unknown, options?: unknown) =>
      isScriptedAllowlist(target)
        ? encodeAs(scripted.text as string, options)
        : (actual.readFileSync as (...args: unknown[]) => unknown)(
            target,
            options,
          ),
  };
  return { ...wrapped, default: wrapped };
});

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof NodeFsPromises>();
  const wrapped: Record<string, unknown> = {
    ...actual,
    readFile: async (target: unknown, options?: unknown) =>
      isScriptedAllowlist(target)
        ? encodeAs(scripted.text as string, options)
        : (actual.readFile as (...args: unknown[]) => Promise<unknown>)(
            target,
            options,
          ),
  };
  return { ...wrapped, default: wrapped };
});

const MOCK_OWNER = {
  id: "acceptance-2067-scripted-allowlist-owner",
  role: "platform_owner",
};

function allowlistText(nonProductionProjects: unknown[]): string {
  return JSON.stringify({ owners: [MOCK_OWNER], nonProductionProjects });
}

const INVALID_ENTRIES: Array<[string, unknown[]]> = [
  ["an object entry", [{ ref: "acceptance2067objectref" }]],
  ["an empty string", [""]],
  ["a whitespace-only string", ["   "]],
  ["a duplicate", ["acceptance2067dupref", "acceptance2067dupref"]],
];

const tempDir = mkdtempSync(
  path.join(os.tmpdir(), "acceptance-2067-allowlist-"),
);

function tempAllowlist(name: string, text: string): string {
  const file = path.join(tempDir, `${name.replace(/\W+/g, "-")}.json`);
  writeFileSync(file, text);
  return file;
}

afterEach(() => {
  scripted.text = null;
  vi.restoreAllMocks();
  cleanupProofFiles();
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("issue #2067 — addendum 3: suite reader rejects bad nonProductionProjects entries (temp files)", () => {
  it("control: unique non-empty string refs are accepted", () => {
    const file = tempAllowlist(
      "valid",
      allowlistText(["acceptance2067refa", "acceptance2067refb"]),
    );
    expect(readAllowlist(file).nonProductionProjects).toEqual([
      "acceptance2067refa",
      "acceptance2067refb",
    ]);
  });

  it.each(INVALID_ENTRIES)("rejects %s", (name, entries) => {
    const file = tempAllowlist(name, allowlistText(entries));
    expect(() => readAllowlist(file)).toThrow(/nonProductionProjects\[\d+\]/);
  });
});

describe("issue #2067 — addendum 3: the command's allowlist loader rejects bad nonProductionProjects entries", () => {
  it("harness control: the node:fs mock serves the scripted text at the committed allowlist path", () => {
    scripted.text = allowlistText(["acceptance2067refa"]);
    expect(readAllowlist().owners).toEqual([MOCK_OWNER]);
  });

  async function goWithScriptedAllowlist(text: string) {
    scripted.text = text;
    cleanTarget();
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: decisionArgs("go", MOCK_OWNER),
      env: LOCAL_TARGET_ENV,
      store,
    });
    return { result, proofs: await store.list() };
  }

  it("control: with a valid scripted allowlist, its owner's --decision go on a clean loopback target exits 0 and records one proof", async () => {
    const { result, proofs } = await goWithScriptedAllowlist(
      allowlistText(["acceptance2067refa"]),
    );
    expect(result.exitCode).toBe(0);
    expect(proofs).toHaveLength(1);
  });

  it.each(INVALID_ENTRIES)(
    "an allowlist whose nonProductionProjects has %s makes --decision go exit 1 and record no proof",
    async (_name, entries) => {
      const { result, proofs } = await goWithScriptedAllowlist(
        allowlistText(entries),
      );
      expect(result.exitCode).toBe(1);
      expect(proofs).toEqual([]);
    },
  );
});
