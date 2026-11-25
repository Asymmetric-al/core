import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, getAuthContextMock, buildSpy } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  buildSpy: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock(import("@asym/auth/context"), async (importOriginal) => ({
  ...(await importOriginal()),
  getAuthContext: getAuthContextMock,
}));

vi.mock(
  import("../../../../../packages/api/src/donor-portal/model"),
  async (importOriginal) => {
    const actual = await importOriginal();
    buildSpy.mockImplementation(actual.buildDonorPortalSnapshot);
    return { ...actual, buildDonorPortalSnapshot: buildSpy };
  },
);

import { GET } from "../../../../../packages/api/src/donor-portal";

const T = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const PROFILE = "11111111-1111-1111-1111-111111111111";
const ASSIGNMENT = "00000000-0000-4000-8000-0000000e2e00";

function donorContext(userId: string) {
  return {
    isAuthenticated: true,
    userId,
    email: null,
    tenantId: T,
    role: "donor",
    profileId: PROFILE,
    memberships: [
      {
        tenantId: T,
        role: "donor",
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: ASSIGNMENT,
      userId,
      tenantId: T,
      revision: "e2e-bypass",
      membershipRole: "donor",
      staffRole: null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
  };
}

const originalBypass = process.env.E2E_AUTH_BYPASS;

beforeEach(() => {
  process.env.E2E_AUTH_BYPASS = "true";
  buildSpy.mockClear();
  getAdminClientMock.mockReturnValue({
    client: null,
    error: "SUPABASE_SERVICE_ROLE_KEY is not configured.",
  });
});

afterEach(() => {
  if (originalBypass === undefined) delete process.env.E2E_AUTH_BYPASS;
  else process.env.E2E_AUTH_BYPASS = originalBypass;
});

function request() {
  return new NextRequest("http://localhost:3000/api/donor/portal");
}

describe("AL-2676: the demo donor portal snapshot takes the bypass session's organization", () => {
  it("builds the fixture donor row in the synthetic context's tenant, not the seed's", async () => {
    getAuthContextMock.mockResolvedValue(donorContext("e2e-donor-user"));

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(buildSpy).toHaveBeenCalledTimes(1);
    expect(buildSpy.mock.calls[0]?.[0].donor.tenant_id).toBe(T);
    const body = (await response.json()) as { portal: { donor: object } };
    expect(body.portal.donor).not.toHaveProperty("tenantId");
    expect(body.portal.donor).not.toHaveProperty("tenant_id");
  });

  it("guard: without a service key a context that is not synthetic answers 503", async () => {
    getAuthContextMock.mockResolvedValue(donorContext("real-donor-user"));

    const response = await GET(request());

    expect(response.status).toBe(503);
    expect(buildSpy).not.toHaveBeenCalled();
  });
});
