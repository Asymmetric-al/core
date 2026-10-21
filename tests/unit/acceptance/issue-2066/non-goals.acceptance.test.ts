/**
 * Acceptance tests for GitHub issue #2066 — non-goals guard (DC8).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * A grep of the #2066 test files must find none of the literals that would pin
 * a #2067-owned decision (freshness thresholds, the local-file proof store, the
 * removed approver flag, the non-production override) and no allowlist for
 * seeded tenants. This automates the grep over the .ts files
 * in this acceptance directory; the Builder's own new test files are checked
 * by the reviewer (runtime-checklist.md).
 *
 * The forbidden literals are assembled from fragments so that this guard does
 * not itself trip the grep it enforces.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const j = (...parts: string[]) => parts.join("");

/** DC8 literal list, verbatim from the spec, assembled from fragments. */
const FORBIDDEN_LITERALS = [
  j("3600", "000"),
  j("8640", "0000"),
  j("60 * 60", " * 1000"),
  j("24 * 60", " * 60 * 1000"),
  j("var/document-", "cutover-proofs"),
  j("FileDocument", "CutoverProofStore"),
  j("--app", "rover"),
  j("--allow-non-", "production-project"),
  j("DOCUMENT_CUTOVER_", "NON_PRODUCTION_PROJECTS"),
];

/** No allowlist for seeded tenants (spec §3 / DC8). */
const FORBIDDEN_PATTERNS = [new RegExp(j("de", "mo[-_ ]?tenant"), "i")];

const FILES = readdirSync(HERE)
  .filter((name) => /\.(ts|tsx)$/.test(name))
  .sort();

describe("issue #2066 — DC8 reviewer grep over the #2066 acceptance files", () => {
  it("finds the acceptance files to scan", () => {
    expect(FILES.length).toBeGreaterThan(0);
  });

  it.each(FILES)(
    "DC8: %s contains no pinned threshold, local-file store, removed flag/env var or seeded-tenant allowlist",
    (name) => {
      const text = readFileSync(path.join(HERE, name), "utf8");
      for (const literal of FORBIDDEN_LITERALS) {
        expect(text.includes(literal), `${name} contains ${literal}`).toBe(
          false,
        );
      }
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(text), `${name} matches ${pattern}`).toBe(false);
      }
    },
  );
});
