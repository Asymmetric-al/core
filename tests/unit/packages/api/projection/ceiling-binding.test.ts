import { describe, expect, it } from "vitest";

import { fixture } from "./fixtures";
import {
  resolveProjection,
  type ProjectionCeiling,
  type ProjectionOperation,
} from "../../../../../packages/api/src/projection/index";

/** Qualified-shaped synthetic evidence only; no live producer/capability proof. */
function request(
  purpose = "support_history",
  operation: ProjectionOperation = "read",
  readableFields = ["display_name"],
  exportableFields = ["display_name", "amount"],
) {
  const x = fixture("mission_control");
  const binding = { ...x.auth.binding, purpose, operation };
  return {
    ...x,
    auth: {
      ...x.auth,
      binding,
      ceiling: {
        ...x.auth.ceiling,
        purpose,
        operation,
        readableFields,
        exportableFields,
      },
    },
    scope: { ...x.scope, binding },
  };
}

function poisonedCeiling(patch: Record<string, unknown>, omit?: string) {
  const x = request();
  const ceiling = { ...x.auth.ceiling, ...patch } as Record<string, unknown>;
  if (omit) delete ceiling[omit];
  return { ...x, auth: { ...x.auth, ceiling: ceiling as ProjectionCeiling } };
}

describe("general ceiling belongs to this exact purpose and operation", () => {
  it("preserves the literal name-only matching read ceiling", () => {
    expect(resolveProjection(request())).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada" },
    });
  });
  it("preserves exact values under a correctly bound bulk export ceiling", () => {
    expect(
      resolveProjection(
        request(
          "support_export",
          "bulk_export",
          [],
          ["display_name", "amount"],
        ),
      ),
    ).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada", amount: 1250 },
    });
  });
  it("does not use export-only fields on a correctly bound read", () => {
    expect(
      resolveProjection(
        request("support_history", "read", ["display_name"], ["amount"]),
      ),
    ).toEqual({ kind: "allowed", projection: { display_name: "Ada" } });
  });
  it.each(["read", "bulk_export"] as const)(
    "preserves correctly bound empty %s authority as allowed-empty",
    (operation) => {
      expect(
        resolveProjection(request("support_history", operation, [], [])),
      ).toEqual({ kind: "allowed", projection: {} });
    },
  );
  it.each([
    ["foreign purpose only", "finance_dashboard", "read"],
    ["foreign operation only", "support_history", "bulk_export"],
    ["foreign purpose and operation", "finance_dashboard", "bulk_export"],
  ] as const)(
    "refuses %s despite matching context refs and positive static policies",
    (_case, purpose, operation) => {
      const target = request();
      const foreign = request(
        purpose,
        operation,
        ["display_name", "amount"],
        ["display_name", "amount"],
      );
      expect(
        resolveProjection({
          ...target,
          auth: { ...target.auth, ceiling: foreign.auth.ceiling },
        }),
      ).toEqual({ kind: "refused" });
    },
  );
  it.each(["purpose", "operation"])(
    "refuses missing ceiling %s rather than inferring it from auth/scope",
    (key) => {
      expect(resolveProjection(poisonedCeiling({}, key))).toEqual({
        kind: "refused",
      });
    },
  );
  it.each([undefined, null, "", " ", false, 1, {}, ["support_history"]])(
    "refuses malformed ceiling purpose %j",
    (purpose) => {
      expect(resolveProjection(poisonedCeiling({ purpose }))).toEqual({
        kind: "refused",
      });
    },
  );
  it.each([
    undefined,
    null,
    "",
    " ",
    false,
    1,
    {},
    ["read"],
    "write",
    "export",
  ])("refuses malformed or unsupported ceiling operation %j", (operation) => {
    expect(resolveProjection(poisonedCeiling({ operation }))).toEqual({
      kind: "refused",
    });
  });
  it("refuses a foreign binding even when its field lists are empty", () => {
    expect(
      resolveProjection(
        poisonedCeiling({
          purpose: "finance_dashboard",
          readableFields: [],
          exportableFields: [],
        }),
      ),
    ).toEqual({ kind: "refused" });
  });
});
