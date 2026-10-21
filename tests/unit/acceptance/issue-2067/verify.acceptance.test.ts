/**
 * Acceptance tests for GitHub issue #2067 — `--verify`.
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 *
 * Covers the DC2 verify cases (cli:/git: attestation rejected, digest mismatch
 * rejected), DC8 (four target-mismatch cases, plus #2066's `it.fails` case now
 * passing) and the DC9 verify boundary (clean proof rejected at
 * recordedAt+24h+1ms regardless of merge time).
 *
 * Every rejection case starts from a genuine clean proof recorded by the
 * command (control: it verifies with exit 0) and changes exactly one thing,
 * re-sealing the digest where the case is not about the digest, so each case
 * fails for its own reason.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { existsSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  REPO_ROOT,
  cleanupProofFiles,
  mintCleanProof,
  reseal,
  runCommand,
} from "./command-harness";

import type { MintedProof } from "./command-harness";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanupProofFiles();
});

async function verify(relPath: string) {
  return runCommand({ argv: ["--verify", relPath], env: LOCAL_TARGET_ENV });
}

/** Write a variant over the minted file (test-side), verify it, then restore. */
async function verifyVariant(
  minted: MintedProof,
  variant: Record<string, unknown> | string,
) {
  writeFileSync(
    minted.absPath,
    typeof variant === "string" ? variant : JSON.stringify(variant, null, 2),
  );
  try {
    return await verify(minted.relPath);
  } finally {
    writeFileSync(minted.absPath, minted.bytes);
  }
}

async function resealedWith(
  minted: MintedProof,
  change: (proof: Record<string, unknown>) => void,
): Promise<Record<string, unknown>> {
  const modified = structuredClone(minted.proof);
  change(modified);
  return reseal(modified);
}

function environmentOf(
  proof: Record<string, unknown>,
): Record<string, unknown> {
  const environment = proof.environment;
  if (!environment || typeof environment !== "object") {
    throw new Error("#2067: proof has no environment object");
  }
  return environment as Record<string, unknown>;
}

describe("issue #2067 — --verify on a genuine clean proof (control)", () => {
  it("control: --verify exits 0 for the untouched clean proof the command just recorded", async () => {
    const minted = await mintCleanProof();
    const result = await verify(minted.relPath);
    expect(result.exitCode).toBe(0);
  });
});

describe("issue #2067 — DC2 --verify rejects attestation and digest tampering", () => {
  it("DC2: rejects a proof carrying a legacy cli:<user> / git:<sha> attestation object (re-sealed)", async () => {
    const minted = await mintCleanProof();
    const variant = await resealedWith(minted, (proof) => {
      proof.attestation = {
        attestedBy: "cli:acceptance-operator",
        attestationContext: "git:0123456789abcdef0123456789abcdef01234567",
      };
    });
    expect((await verifyVariant(minted, variant)).exitCode).toBe(1);
  });

  it("DC2: rejects a proof carrying top-level cli:<user> / git:<sha> attestation fields (re-sealed)", async () => {
    const minted = await mintCleanProof();
    const variant = await resealedWith(minted, (proof) => {
      proof.attestedBy = "cli:acceptance-operator";
      proof.attestationContext = "git:0123456789abcdef0123456789abcdef01234567";
    });
    expect((await verifyVariant(minted, variant)).exitCode).toBe(1);
  });

  it("DC2: rejects a proof whose digest does not match (one byte of the proofId changed, digest left as recorded)", async () => {
    const minted = await mintCleanProof();
    const text = minted.bytes.toString("utf8");
    const marker = `"proofId": "`;
    const at = text.indexOf(marker);
    expect(at).toBeGreaterThanOrEqual(0);
    const index = at + marker.length;
    const tampered =
      text.slice(0, index) +
      (text[index] === "0" ? "1" : "0") +
      text.slice(index + 1);
    expect((await verifyVariant(minted, tampered)).exitCode).toBe(1);
  });
});

describe("issue #2067 — DC2 digest coverage (addendum 2 item 2: only `digest` is left out)", () => {
  it.each(["recordedBy", "proofPath"])(
    "DC2: changing one byte of %s without re-sealing fails --verify",
    async (field) => {
      const minted = await mintCleanProof();
      const value = minted.proof[field];
      expect(typeof value).toBe("string");
      const original = value as string;
      const last = original.at(-1) === "x" ? "y" : "x";
      const variant = {
        ...minted.proof,
        [field]: original.slice(0, -1) + last,
      };
      expect((await verifyVariant(minted, variant)).exitCode).toBe(1);
    },
  );
});

describe("issue #2067 — DC8 --verify compares the proof's environment with the current target", () => {
  it.each([
    ["environment label", "environmentLabel", "preview"],
    ["DB/project", "databaseProjectId", "acceptance2067otherproject"],
    ["storage", "storageIdentity", "acceptance2067otherproject/storage/v1"],
    ["schema version", "schemaVersion", "19990101000000"],
  ])(
    "DC8: --verify exits 1 when the proof's %s differs from the target (re-sealed)",
    async (_label, field, otherValue) => {
      const minted = await mintCleanProof();
      expect(environmentOf(minted.proof)[field]).not.toBe(otherValue);
      const variant = await resealedWith(minted, (proof) => {
        environmentOf(proof)[field] = otherValue;
      });
      expect((await verifyVariant(minted, variant)).exitCode).toBe(1);
    },
  );

  it("DC8: #2066's '#2067 verify-env-mismatch' expected-fail case has been flipped to a passing it()", () => {
    // Depends on the #2066 acceptance suite being on the base branch.
    const file = path.join(
      REPO_ROOT,
      "tests/unit/acceptance/issue-2066/tenant-safety.acceptance.test.ts",
    );
    expect(
      existsSync(file),
      "#2066 acceptance suite (tests/unit/acceptance/issue-2066/) must be merged before #2067 can satisfy DC8",
    ).toBe(true);
    const source = readFileSync(file, "utf8");
    const declaration =
      /\b(it|test)(\.fails)?\(\s*["'`]#2067 verify-env-mismatch/.exec(source);
    expect(declaration, "the '#2067 verify-env-mismatch' case").not.toBeNull();
    expect(declaration?.[2], "still declared as it.fails").toBeUndefined();
  });
});

describe("issue #2067 — DC9 --verify freshness (24h from recordedAt)", () => {
  async function verifyAt(minted: MintedProof, atMs: number) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(atMs));
    // A brand-new file (e.g. just merged) must not refresh the proof.
    utimesSync(minted.absPath, new Date(atMs), new Date(atMs));
    try {
      return await verify(minted.relPath);
    } finally {
      vi.useRealTimers();
    }
  }

  it("DC9: --verify rejects a clean proof at recordedAt + 24h + 1ms, even when the file itself is brand new", async () => {
    const minted = await mintCleanProof();
    const recordedAt = Date.parse(String(minted.proof.recordedAt));
    expect(Number.isFinite(recordedAt)).toBe(true);

    const result = await verifyAt(minted, recordedAt + 86_400_001);
    expect(result.exitCode).toBe(1);
  });

  it("DC9 control: --verify accepts the same clean proof at recordedAt + 24h - 1ms", async () => {
    const minted = await mintCleanProof();
    const recordedAt = Date.parse(String(minted.proof.recordedAt));

    const result = await verifyAt(minted, recordedAt + 86_399_999);
    expect(result.exitCode).toBe(0);
  });
});
