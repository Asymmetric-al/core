/**
 * Acceptance tests for GitHub issue #2067 — repo allowlist and CLI flags.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 * Addendum (allowlist path): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306190263}
 *
 * Covers DC3 (operator env allowlists never authorize; no runtime read of
 * DOCUMENT_CUTOVER_(OWNER|APPROVER)_ALLOWLIST; `--approver` rejected) and DC11
 * (DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS has no effect,
 * `--allow-non-production-project` rejected, only repo-allowlisted hosted
 * projects classify as non_production), against the committed
 * docs/ops/document-cutover/allowlist.json.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ALLOWLIST_REL,
  LOCAL_TARGET_ENV,
  REPO_ROOT,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  hostedTargetEnv,
  readAllowlist,
  runCommand,
} from "./command-harness";
import { InMemoryDocumentCutoverProofStore } from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
});

const NOT_ALLOWLISTED = "acceptance-2067-not-allowlisted-identity";
const UNLISTED_HOSTED_REF = "acceptance2067unlistedref";

function safeAllowlistText(): string {
  try {
    return readAllowlist().text;
  } catch {
    return "";
  }
}

async function goOnCleanLoopback(extraArgs: string[] = []) {
  cleanTarget();
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: [...decisionArgs("go", allowlistedOwner()), ...extraArgs],
    env: LOCAL_TARGET_ENV,
    store,
  });
  return { result, proofs: await store.list() };
}

async function classificationFor(env: Record<string, string>) {
  cleanTarget();
  const store = new InMemoryDocumentCutoverProofStore();
  await runCommand({
    argv: decisionArgs("no_go", allowlistedOwner()),
    env,
    store,
  });
  const [proof] = await store.list();
  return proof?.environment?.productionClassification;
}

describe("issue #2067 — committed allowlist (addendum path)", () => {
  it(`${ALLOWLIST_REL} exists and has exactly the addendum-2 schema { owners: [{ id, role }], nonProductionProjects: [...] } with at least one owner`, () => {
    const allowlist = readAllowlist();
    expect(allowlist.owners.length).toBeGreaterThan(0);
  });
});

describe("issue #2067 — DC3 owner authorization comes only from the repo allowlist", () => {
  it("control: an allowlisted owner's --decision go on a clean target exits 0 and records exactly one clean proof", async () => {
    const { result, proofs } = await goOnCleanLoopback();
    expect(result.exitCode).toBe(0);
    expect(proofs).toHaveLength(1);
    expect(proofs[0]?.outcome).toBe("clean_preproduction_proof");
  });

  it("DC3: with DOCUMENT_CUTOVER_OWNER_ALLOWLIST / DOCUMENT_CUTOVER_APPROVER_ALLOWLIST set to an identity not in the repo allowlist, --decision go --owner <that identity> exits 1", async () => {
    expect(safeAllowlistText()).not.toContain(NOT_ALLOWLISTED);
    cleanTarget();
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: decisionArgs("go", {
        id: NOT_ALLOWLISTED,
        role: allowlistedOwner().role,
      }),
      env: {
        ...LOCAL_TARGET_ENV,
        DOCUMENT_CUTOVER_OWNER_ALLOWLIST: NOT_ALLOWLISTED,
        DOCUMENT_CUTOVER_APPROVER_ALLOWLIST: NOT_ALLOWLISTED,
      },
      store,
    });

    expect(result.exitCode).toBe(1);
    expect(await store.list()).toEqual([]);
  });

  it("DC3: `rg 'DOCUMENT_CUTOVER_(OWNER|APPROVER)_ALLOWLIST' scripts packages` finds no runtime read (and parseIdentityAllowlist is gone)", () => {
    const hits: string[] = [];
    const skipDirs = new Set(["node_modules", "dist", ".turbo", ".next"]);
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (skipDirs.has(name)) continue;
        const full = path.join(dir, name);
        const rel = path.relative(REPO_ROOT, full);
        if (statSync(full).isDirectory()) {
          if (name === "tests" || name === "__tests__") continue;
          walk(full);
          continue;
        }
        if (!/\.(ts|tsx|js|mjs|cjs)$/.test(name)) continue;
        if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(name)) continue;
        readFileSync(full, "utf8")
          .split("\n")
          .forEach((line, index) => {
            const code = line.trim();
            if (code.startsWith("//") || code.startsWith("*")) return;
            if (
              /DOCUMENT_CUTOVER_(OWNER|APPROVER)_ALLOWLIST/.test(code) ||
              /\bparseIdentityAllowlist\b/.test(code)
            ) {
              hits.push(`${rel}:${index + 1}: ${code}`);
            }
          });
      }
    };
    walk(path.join(REPO_ROOT, "scripts"));
    walk(path.join(REPO_ROOT, "packages"));
    expect(hits).toEqual([]);
  });

  it("DC3: passing --approver is rejected (exit 1) and records no proof", async () => {
    const { result, proofs } = await goOnCleanLoopback([
      "--approver",
      allowlistedOwner().id,
    ]);
    expect(result.exitCode).toBe(1);
    expect(proofs).toEqual([]);
  });
});

describe("issue #2067 — DC11 non-production classification comes only from the repo allowlist", () => {
  it("DC11: setting DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS has no effect (an unlisted hosted project stays unknown)", async () => {
    expect(safeAllowlistText()).not.toContain(UNLISTED_HOSTED_REF);
    const without = await classificationFor(
      hostedTargetEnv(UNLISTED_HOSTED_REF),
    );
    const withEnv = await classificationFor({
      ...hostedTargetEnv(UNLISTED_HOSTED_REF),
      DOCUMENT_CUTOVER_NON_PRODUCTION_PROJECTS: UNLISTED_HOSTED_REF,
    });

    expect(without).toBe("unknown");
    expect(withEnv).toBe("unknown");
  });

  it("DC11 (addendum 2 item 4): a loopback target classifies as non_production", async () => {
    expect(await classificationFor(LOCAL_TARGET_ENV)).toBe("non_production");
  });

  it("DC11: passing --allow-non-production-project is rejected (exit 1) and records no proof", async () => {
    const { result, proofs } = await goOnCleanLoopback([
      "--allow-non-production-project",
      UNLISTED_HOSTED_REF,
    ]);
    expect(result.exitCode).toBe(1);
    expect(proofs).toEqual([]);
  });

  const listed = (() => {
    try {
      return readAllowlist().nonProductionProjects;
    } catch {
      return [];
    }
  })();

  it.skipIf(listed.length === 0)(
    "DC11: a hosted project listed in the repo allowlist classifies as non_production (skipped only while the committed list is empty)",
    async () => {
      const ref = listed[0] as string;
      expect(await classificationFor(hostedTargetEnv(ref))).toBe(
        "non_production",
      );
    },
  );
});
