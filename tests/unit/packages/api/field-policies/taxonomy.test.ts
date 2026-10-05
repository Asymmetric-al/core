import { describe, expect, it } from "vitest";

import {
  CATEGORY_ORDER,
  SENSITIVITY_DEFAULTS,
  defaultPolicyFor,
} from "../../../../../packages/api/src/field-policies/index";

const denied = { visible: false, editable: false, exportable: false };

describe("field-policy sensitivity taxonomy", () => {
  it("orders the six fixed sensitivity categories", () => {
    expect(CATEGORY_ORDER).toEqual([
      "public",
      "contact",
      "internal",
      "financial",
      "care",
      "security",
    ]);
  });

  it.each([
    ["public", false],
    ["contact", false],
    ["internal", false],
    ["financial", false],
    ["care", true],
    ["security", true],
  ] as const)(
    "%s has its required audit-read default",
    (category, auditRead) => {
      expect(SENSITIVITY_DEFAULTS[category].auditRead).toBe(auditRead);
    },
  );

  it.each([
    ["public", false],
    ["contact", false],
    ["internal", false],
    ["financial", true],
    ["care", true],
    ["security", true],
  ] as const)(
    "%s has its required reason default",
    (category, requiresReason) => {
      expect(SENSITIVITY_DEFAULTS[category].requiresReason).toBe(
        requiresReason,
      );
    },
  );

  it.each([
    "public",
    "contact",
    "internal",
    "financial",
    "care",
    "security",
  ] as const)(
    "%s denies every operation on an unregistered surface",
    (category) => {
      expect(defaultPolicyFor(category, "future_surface_491")).toMatchObject(
        denied,
      );
    },
  );

  for (const category of ["internal", "care", "security"] as const) {
    it.each(["donor", "missionary", "public", "export"])(
      `${category} has no default disclosure on %s`,
      (surface) => {
        expect(defaultPolicyFor(category, surface)).toMatchObject(denied);
      },
    );
  }
});
