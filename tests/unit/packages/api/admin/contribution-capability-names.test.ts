import { describe, expect, it } from "vitest";

import { CONTRIBUTION_CAPABILITY_NAMES } from "../../../../../packages/api/src/admin/contribution-operations/action-capabilities";
import { CAPABILITY_REGISTRY } from "../../../../../packages/auth/capabilities";

/**
 * Council round 1 on WP2a, F12: the contribution action table keeps its own
 * copy of the contribution capability names, because client code reaches it
 * and it may not import from auth (#492 criterion 13). This test keeps the
 * copy equal to the registry: every registry capability of the contribution
 * area is in the copy, and every name in the copy is in the registry.
 */
const registry = Object.keys(CAPABILITY_REGISTRY);
const CONTRIBUTION_AREA = /^contributions\.|^crm\.gift_history\./;

describe("the contribution capability names", () => {
  it("include every registry capability of the contribution area", () => {
    expect(
      registry.filter((name) => CONTRIBUTION_AREA.test(name)).sort(),
    ).toEqual([...CONTRIBUTION_CAPABILITY_NAMES].sort());
  });

  it("name only capabilities the registry has", () => {
    for (const name of CONTRIBUTION_CAPABILITY_NAMES)
      expect(registry).toContain(name);
  });
});
