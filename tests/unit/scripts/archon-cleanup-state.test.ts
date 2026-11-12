import { describe, expect, it } from "vitest";
import {
  confirmedCleanup,
  hasUnconfirmedCleanup,
} from "../../../scripts/archon-factory/pack/.shared/cleanup-state.mjs";

const labels = {
  "core.archon.executor": "candidate-check",
  "core.archon.attempt": "a123",
  "core.archon.run": "run-123",
  "core.archon.issue": "12",
};
const hash = "a".repeat(64);
const cleanup = {
  runId: "run-123",
  issue: 12,
  receiptReference: {
    path: "/round/cleanup-state.json",
    sha256: hash,
    bytes: 70000,
    labels,
  },
};
const evidence = {
  ok: true,
  cleanupConfirmed: true,
  reusable: true,
  remaining: [],
  labels,
  receiptSha256: hash,
};

describe("durable cleanup confirmation", () => {
  it("accepts an exact-label independently hash-bound artifact confirmation", () => {
    const reconciliation = { confirmed: true, evidence };
    expect(confirmedCleanup(cleanup, reconciliation)).toBe(true);
    expect(
      hasUnconfirmedCleanup({ cleanup, cleanupReconciliation: reconciliation }),
    ).toBe(false);
  });
  it.each([
    { ...evidence, receiptSha256: "b".repeat(64) },
    { ...evidence, receiptSha256: undefined },
    { ...evidence, labels: { ...labels, "core.archon.attempt": "other" } },
    { ...evidence, remaining: ["container"] },
    { ...evidence, reusable: false },
  ])(
    "retains artifact ownership for incomplete or mismatched proof: %j",
    (proof) => {
      expect(
        hasUnconfirmedCleanup({
          cleanup,
          cleanupReconciliation: { confirmed: true, evidence: proof },
        }),
      ).toBe(true);
    },
  );
  it("does not accept a bare confirmed marker or malformed artifact", () => {
    expect(confirmedCleanup(cleanup, { confirmed: true })).toBe(false);
    expect(
      confirmedCleanup(
        {
          ...cleanup,
          receiptReference: { ...cleanup.receiptReference, sha256: "invalid" },
        },
        { confirmed: true, evidence },
      ),
    ).toBe(false);
  });
});

it.each([
  { ...cleanup.receiptReference, path: "relative/cleanup-state.json" },
  { ...cleanup.receiptReference, bytes: 0 },
  { ...cleanup.receiptReference, bytes: 1.5 },
  { ...cleanup.receiptReference, sha256: "A".repeat(64) },
  { ...cleanup.receiptReference, labels: null },
])(
  "rejects malformed artifact references before confirmation: %j",
  (receiptReference) => {
    expect(
      confirmedCleanup(
        { ...cleanup, receiptReference },
        { confirmed: true, evidence },
      ),
    ).toBe(false);
  },
);

it("rejects ambiguous receipt sources", () => {
  expect(
    confirmedCleanup(
      { ...cleanup, receipt: { labels } },
      { confirmed: true, evidence },
    ),
  ).toBe(false);
});

it("retains inline original evidence while permitting fully confirmed cleanup", () => {
  const inline = {
    runId: cleanup.runId,
    issue: cleanup.issue,
    receipt: { labels, stdout: "original output" },
  };
  const item = {
    cleanup: inline,
    cleanupReconciliation: { confirmed: true, evidence },
  };
  expect(hasUnconfirmedCleanup(item)).toBe(false);
  expect(item.cleanup).toBe(inline);
  expect(
    hasUnconfirmedCleanup({
      ...item,
      cleanupReconciliation: { confirmed: true },
    }),
  ).toBe(true);
});
