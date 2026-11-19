import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const { confirmed, rpc } = vi.hoisted(() => ({
  confirmed: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("../../../../packages/api/src/shared/with-operation", () => ({
  withOperation:
    (handle: (context: unknown) => Promise<Response>) => (request: Request) =>
      handle({
        auth: {
          role: "admin",
          userId: "login",
          profileId: "profile",
          tenantId: "tenant",
        },
        request,
        requestId: "request",
        isPlatformOperator: confirmed,
        supabaseAdmin: { rpc },
      }),
}));
vi.mock("../../../../packages/api/src/eve/governance", () => ({
  loadEveGovernanceSnapshot: async () => null,
}));
vi.mock("../../../../packages/api/src/eve/launch-readiness/store", () => ({
  loadActiveEveModelPolicyBinding: async () => null,
  loadEveLaunchAdminView: async () => ({}),
}));

import { POST } from "../../../../packages/api/src/eve/launch-readiness/route";

describe("launch safety control authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: { stateVersion: 2 }, error: null });
  });
  it.each([
    ["tenant administrator", false],
    ["listed operator at aal1", false],
    ["listed operator at aal2", true],
  ] as const)("checks each safety mode for a %s", async (_actor, passed) => {
    confirmed.mockResolvedValue(passed);
    for (const mode of ["emergency_off", "disable", "clear_emergency"]) {
      vi.clearAllMocks();
      const response = await POST(
        new Request("https://example.test/launch", {
          method: "POST",
          body: JSON.stringify({
            kind: "safety_control",
            mode,
            expectedStateVersion: 1,
            reason: "Release safety review",
          }),
        }) as NextRequest,
      );
      const needsOperator = mode !== "emergency_off";
      expect(confirmed).toHaveBeenCalledTimes(needsOperator ? 1 : 0);
      if (needsOperator && !passed) {
        expect(response.status).toBe(403);
        expect(rpc).not.toHaveBeenCalled();
      } else {
        expect(response.status).toBe(200);
        expect(rpc).toHaveBeenCalledWith(
          "set_eve_release_safety_control",
          expect.objectContaining({
            p_mode: mode,
            p_actor_role: needsOperator ? "super_admin" : "admin",
            p_tenant_id: "tenant",
          }),
        );
      }
    }
  });
});
