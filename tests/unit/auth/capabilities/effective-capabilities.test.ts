import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  CAPABILITY_BUNDLES,
  ROLE_DEFAULT_BUNDLES,
} from "../../../../packages/auth/capabilities/bundles";
import { resolveEffectiveCapabilities } from "../../../../packages/auth/capabilities/effective-capabilities";
import { CapabilityResolutionError } from "../../../../packages/auth/capabilities/errors";
import { deepFreeze } from "../../../../packages/auth/capabilities/freeze";
import { CAPABILITY_REGISTRY } from "../../../../packages/auth/capabilities/registry";
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

/** Paths of every object or array node under `value` that is not frozen. */
function unfrozenPaths(value: unknown, path: string): string[] {
  if (typeof value !== "object" || value === null) return [];
  const nested = Reflect.ownKeys(value).flatMap((key) =>
    unfrozenPaths(
      (value as Record<PropertyKey, unknown>)[key],
      `${path}.${String(key)}`,
    ),
  );
  return Object.isFrozen(value) ? nested : [path, ...nested];
}

/** Counts property reads; keys in `later` return a different value after `after` reads. */
function counted<T extends object>(
  target: T,
  later: Record<string, unknown> = {},
  after = 1,
) {
  const reads = new Map<PropertyKey, number>();
  const proxy = new Proxy(target, {
    get(object, key, receiver) {
      const count = (reads.get(key) ?? 0) + 1;
      reads.set(key, count);
      if (count > after && typeof key === "string" && key in later)
        return later[key];
      return Reflect.get(object, key, receiver);
    },
  });
  return { proxy, reads };
}

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

  // Review r1 F3: each field is read once, so accessors cannot change it between checks.
  it("reads the context and every source field at most once", () => {
    const sources = [counted(assignment()), counted(named())];
    const context = counted({
      tenantId: TENANT,
      sources: sources.map(({ proxy }) => proxy),
    });
    const resolved = Reflect.apply(resolveEffectiveCapabilities, undefined, [
      context.proxy,
    ]);
    expect(resolved).toEqual(resolveUntyped(assignment(), named()));
    for (const { reads } of [context, ...sources])
      expect(Math.max(...reads.values())).toBe(1);
  });

  it("uses the first read of a source kind that changes afterwards", () => {
    const flipping = counted(named(), { kind: "assignment" });
    expect(resolveUntyped(assignment(), flipping.proxy)).toEqual(
      resolveUntyped(assignment(), named()),
    );
  });

  it("does not let a getter-backed kind bypass multiple_assignments", () => {
    // The reviewer's case: `kind` reads as named for three reads, then as an
    // assignment carrying a finance subrole.
    const forged = { ...named(), role: "staff", staffRole: "finance" };
    const flipping = counted(
      { ...forged, isActive: true },
      { kind: "assignment" },
      3,
    );
    const resolved = resolveUntyped(assignment(), flipping.proxy);
    expect(resolved).toEqual(resolveUntyped(assignment(), named()));
  });

  it("rejects a null source entry as malformed input", () => {
    expect(codeOf(() => resolveUntyped(null))).toBe("missing_context");
  });

  // #2303: the indexed loop reads a hole as undefined; for…in or forEach would skip it.
  it.each([
    // eslint-disable-next-line no-sparse-arrays -- the leading hole is the case under test
    ["a leading hole", [, named()]],
    ["a trailing hole", Object.assign([named()], { length: 2 })],
  ])("rejects sources with %s as missing_context", (_label, sources) => {
    expect(Object.keys(sources)).toHaveLength(sources.length - 1);
    const context = { tenantId: TENANT, sources };
    expect(
      codeOf(() =>
        Reflect.apply(resolveEffectiveCapabilities, undefined, [context]),
      ),
    ).toBe("missing_context");
  });
});

describe("static capability tables", () => {
  it.each([
    ["CAPABILITY_REGISTRY", CAPABILITY_REGISTRY],
    ["CAPABILITY_BUNDLES", CAPABILITY_BUNDLES],
    ["ROLE_DEFAULT_BUNDLES", ROLE_DEFAULT_BUNDLES],
  ])("deep-freezes %s at module load", (name, table) => {
    expect(Object.isFrozen(table)).toBe(true);
    expect(unfrozenPaths(table, name)).toEqual([]);
  });

  it("throws TypeError on writes and leaves resolution unchanged", () => {
    const before = resolveUntyped(assignment(), named());
    const registry = CAPABILITY_REGISTRY as Record<string, { label: string }>;
    const bundles = CAPABILITY_BUNDLES as unknown as Record<string, string[]>;
    const defaults = ROLE_DEFAULT_BUNDLES as unknown as Record<
      string,
      string[]
    >;
    expect(() => {
      registry["permissions.view"]!.label = "x";
    }).toThrow(TypeError);
    expect(() =>
      bundles.donor_care!.push("permissions.approve_widening"),
    ).toThrow(TypeError);
    expect(() => {
      defaults["member:donor"] = ["contribution_admin"];
    }).toThrow(TypeError);
    expect(() => delete defaults.tenant_admin).toThrow(TypeError);
    expect(resolveUntyped(assignment(), named())).toEqual(before);
  });
});

describe("deepFreeze", () => {
  it("freezes nested arrays, objects and symbol keys in place", () => {
    const hidden = Symbol("hidden");
    const value = { list: [{ deep: ["x"] }], [hidden]: { more: [[]] } };
    expect(deepFreeze(value)).toBe(value);
    expect(unfrozenPaths(value, "value")).toEqual([]);
  });

  it("walks into a frozen parent and leaves non-plain objects alone", () => {
    const inner = { list: [1] };
    const date = new Date(0);
    deepFreeze({ outer: Object.freeze({ inner }), date });
    expect(Object.isFrozen(inner.list)).toBe(true);
    expect(Object.isFrozen(date)).toBe(false);
  });
});

describe("capabilityRegistryRows", () => {
  it("is byte-identical to the pre-freeze output", () => {
    // sha256 of JSON.stringify(capabilityRegistryRows()) at develop 88eefbd9.
    const digest = createHash("sha256")
      .update(JSON.stringify(capabilityRegistryRows()))
      .digest("hex");
    expect(digest).toBe(
      "33cad873dfc95994e65d030bc75d6102600b3e65d4dea4745901a9a4a8409b71",
    );
  });

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
