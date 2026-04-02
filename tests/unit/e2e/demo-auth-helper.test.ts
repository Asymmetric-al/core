import { describe, expect, it } from "vitest";

import {
  getDemoRoleMap,
  type DemoAvailabilityPayload,
} from "../../../tests/e2e/helpers/demo-auth";

describe("getDemoRoleMap", () => {
  it("prefers availableRoles when both payload shapes exist", () => {
    const payload: DemoAvailabilityPayload = {
      roles: { donor: false },
      availableRoles: { donor: true },
    };

    expect(getDemoRoleMap(payload)).toEqual({ donor: true });
  });

  it("falls back to the legacy roles field", () => {
    const payload: DemoAvailabilityPayload = {
      roles: { admin: true, donor: true, missionary: false },
    };

    expect(getDemoRoleMap(payload)).toEqual(payload.roles);
  });
});
