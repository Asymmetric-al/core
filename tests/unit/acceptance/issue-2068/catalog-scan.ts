/**
 * Shared helpers for the GitHub issue #2068 acceptance tests.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 * Approval and decision text:
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357392760}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

/** develop tip the spec and these tests were written against. */
export const SPEC_BASE_SHA = "cc568c92c1cd283d82a4ef9c6d4be7dabe4efee4";

/**
 * The catalog digest at {@link SPEC_BASE_SHA}, computed by Acceptance through
 * `getDocumentPurposeCatalogDigest()` (and equal to
 * `buildDocumentPurposeCatalogManifest().digest`) before any implementation.
 * Done criterion 2 requires the PR's first pin to be exactly this value.
 */
export const PRE_CHANGE_DIGEST =
  "456b5091243a22a0a75defe19c3fd753dc6848ca5ec4bbcfdeef0551ebc6cde6";

/** This directory (Acceptance-owned). */
export const ACCEPTANCE_DIR = "tests/unit/acceptance/issue-2068/";

export const CATALOG_DIR =
  "packages/api/src/generated-documents/purpose-catalog";

/** The test file In item 1 names for the new pinned-digest test. */
export const DIGEST_TEST_FILE =
  "tests/unit/packages/api/document-purpose-digest.test.ts";

/** The test files In item 4 names for the updated values. */
export const CATALOG_TEST_FILE =
  "tests/unit/packages/api/document-purpose-catalog.test.ts";
export const AVAILABILITY_TEST_FILE =
  "tests/unit/packages/api/document-purpose-availability.test.ts";

export const PURPOSE_ID = "giving.summary.informational@1";

/** In item 3: the amended `source_owner`. */
export const EXPECTED_SOURCE_OWNER =
  "phase-07-receipt-compliance+phase-13-contribution-ledger+phase-14-recognition-subject+phase-19-statement-population";

/** In item 3: the amended `recipient_role.role`. */
export const EXPECTED_RECIPIENT_ROLE = "authorized_recognition_subject";

/** In item 3: the gate names added to `PURPOSE_LAUNCH_GATES`. */
export const NEW_GATES = [
  "phase07_purpose_privacy_proof",
  "phase13_purpose_privacy_proof",
  "phase14_recognition_subject_proof",
] as const;

/** In item 3 / criterion 4: the six gates of the amended entry. */
export const EXPECTED_GATES = [
  "core_d3_renderer_qualified",
  "core_d4_artifact_pipeline",
  ...NEW_GATES,
  "phase19_statement_seam",
] as const;

/** D2a: the direct-gift fields that stay (present at the spec base). */
export const DIRECT_GIFT_FIELDS = [
  "period_gift_dates",
  "period_gift_amounts",
] as const;

/** D2a: the recognition sections that are added. */
export const ADDED_SECTION_FIELDS = [
  "household_support_items",
  "daf_recommendation_items",
] as const;

/** The data view version at the spec base; D2a requires a new one. */
export const BASE_VIEW_VERSION = 1;

export function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

export function git(args: string[]): { status: number; stdout: string } {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { status: result.status ?? 1, stdout: result.stdout };
}

/** Every quoted 64-character hex literal in a source text, lowercased. */
export function hexDigestLiterals(source: string): string[] {
  return [...source.matchAll(/["'`]([0-9a-fA-F]{64})["'`]/g)].map((match) =>
    (match[1] as string).toLowerCase(),
  );
}

/** `[path, value]` for every primitive leaf of a JSON-like value. */
export function leafPaths(
  value: unknown,
  prefix: (string | number)[] = [],
): { path: (string | number)[]; value: unknown }[] {
  if (Array.isArray(value)) {
    return value.flatMap((child, index) =>
      leafPaths(child, [...prefix, index]),
    );
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      leafPaths(child, [...prefix, key]),
    );
  }
  return [{ path: prefix, value }];
}

/** A different primitive of the same kind, so a mutation is one-field only. */
export function mutatedLeaf(value: unknown): unknown {
  if (typeof value === "boolean") return !value;
  if (typeof value === "number") return value + 1;
  if (typeof value === "string") return `${value}~mutated`;
  return "mutated";
}

/** Deep clone of `root` with the leaf at `leafPath` replaced. */
export function withLeaf<T>(
  root: T,
  leafPath: (string | number)[],
  next: unknown,
): T {
  const clone = structuredClone(root) as Record<string | number, unknown>;
  let cursor = clone;
  for (const key of leafPath.slice(0, -1)) {
    cursor = cursor[key] as Record<string | number, unknown>;
  }
  cursor[leafPath.at(-1) as string | number] = next;
  return clone as T;
}
