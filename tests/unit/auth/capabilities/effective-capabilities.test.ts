import { describe, expect, it } from "vitest";

import { CAPABILITY_BUNDLES } from "../../../../packages/auth/capabilities/bundles";
import { resolveEffectiveCapabilities } from "../../../../packages/auth/capabilities/effective-capabilities";
import { CapabilityResolutionError } from "../../../../packages/auth/capabilities/errors";
import { capabilityRegistryRows } from "../../../../packages/auth/capabilities/rows";

const TENANT = "tenant-1";

const assignment = (fields: Record<string, unknown> = {}) => ({
  kind: "assignment",
  assignmentId: "assignment-1",
  tenantId: TENANT,
  role: "staff",
  staffRole: "hr",
  isActive: true,
  ...fields,
});

const named = (fields: Record<string, unknown> = {}) => ({
  kind: "named",
  grantId: "grant-1",
  tenantId: TENANT,
  subject: "tenant_admin",
  active: true,
  ...fields,
});

/** Runtime call with untyped input, as a forged caller would make it. */
function resolveUntyped(...sources: unknown[]) {
  const context = { tenantId: TENANT, sources };
  return Reflect.apply(resolveEffectiveCapabilities, undefined, [context]);
}

function errorOf(run: () => unknown) {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(CapabilityResolutionError);
    return error as CapabilityResolutionError;
  }
  throw new Error("expected a CapabilityResolutionError");
}

const codeOf = (run: () => unknown) => errorOf(run).code;

describe("resolveEffectiveCapabilities", () => {
  it("unions an assignment with named grants without duplicates", () => {
    const resolved = resolveUntyped(assignment(), named());
    expect(resolved).toEqual([...new Set(resolved)].sort());
    expect(resolved).toEqual(
      expect.arrayContaining([
        ...CAPABILITY_BUNDLES.staff_base,
        ...CAPABILITY_BUNDLES.finance_approver,
        ...CAPABILITY_BUNDLES.permissions_proposer,
      ]),
    );
  });

  it("returns an empty frozen result for a context with no sources", () => {
    const resolved = resolveUntyped();
    expect(resolved).toEqual([]);
    expect(Object.isFrozen(resolved)).toBe(true);
  });

  it.each([
    ["prototype key as role", { role: "constructor", staffRole: null }],
    ["prototype key as subrole", { staffRole: "__proto__" }],
    ["subrole on a member assignment", { role: "donor", staffRole: "finance" }],
    ["missing subrole field", { staffRole: undefined }],
  ])("rejects an assignment with a %s", (_label, fields) => {
    expect(codeOf(() => resolveUntyped(assignment(fields)))).toBe(
      "unknown_subject",
    );
  });

  // Review r1 F1/F2: a subrole is null or a primitive string, never coerced.
  it.each([
    ["an array", ["finance"]],
    ["a boxed string", new String("finance")],
    ["an object with toString", { toString: () => "finance" }],
    [
      "an object with Symbol.toPrimitive",
      { [Symbol.toPrimitive]: () => "finance" },
    ],
    ["a symbol", Symbol("finance")],
    ["a number", 1],
    ["an unknown string", "finance_lead"],
  ])("fails closed on a staff subrole that is %s", (_label, staffRole) => {
    const error = errorOf(() => resolveUntyped(assignment({ staffRole })));
    expect(error.code).toBe("unknown_subject");
    expect(Object.keys(error).sort()).toEqual(["code", "name"]);
  });

  it.each(["toString", "staff:finance", "member:donor"])(
    "rejects the named subject %s",
    (subject) => {
      expect(codeOf(() => resolveUntyped(named({ subject })))).toBe(
        "unknown_subject",
      );
    },
  );

  it.each([1, "true", {}])(
    "treats an active flag of %j as inactive",
    (flag) => {
      expect(codeOf(() => resolveUntyped(assignment({ isActive: flag })))).toBe(
        "inactive_source",
      );
      expect(codeOf(() => resolveUntyped(named({ active: flag })))).toBe(
        "inactive_source",
      );
    },
  );

  it("reports a foreign source before a revoked one, in any order", () => {
    const revoked = named({ active: false });
    const foreign = assignment({ tenantId: "tenant-2" });
    expect(codeOf(() => resolveUntyped(revoked, foreign))).toBe(
      "foreign_tenant",
    );
    expect(codeOf(() => resolveUntyped(foreign, revoked))).toBe(
      "foreign_tenant",
    );
  });

  it("rejects a null source entry as malformed input", () => {
    expect(codeOf(() => resolveUntyped(null))).toBe("missing_context");
  });
});

describe("capabilityRegistryRows", () => {
  it("seeds no grant row for staff without a subrole", () => {
    const { roleGrants } = capabilityRegistryRows();
    const subjects = new Set(roleGrants.map((row) => row.subject));
    expect([...subjects].sort()).toEqual([
      "platform_admin",
      "staff:development",
      "staff:finance",
      "staff:hr",
      "staff:member_care",
      "staff:mobilizer",
      "tenant_admin",
    ]);
  });
});
