import { randomUUID } from "node:crypto";

import { GET as mediaGet } from "@asym/api/media/route";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as SessionClientModule from "../../../../../packages/api/src/shared/request-session-client";
import type * as AuthContextModule from "@asym/auth/context";
import type { AuthContext } from "@asym/auth/context";

const mocks = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  createRequestSessionClient: vi.fn(),
  readMediaVariant: vi.fn(),
  sessionGetUser: vi.fn(),
  sessionRpc: vi.fn(),
}));

vi.mock("@asym/lib/monitoring/sentry", () => ({ captureError: vi.fn() }));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContextModule>()),
  getAuthContext: mocks.getAuthContext,
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (importOriginal) => ({
    ...(await importOriginal<typeof SessionClientModule>()),
    createRequestSessionClient: mocks.createRequestSessionClient,
  }),
);

vi.mock("../../../../../packages/api/src/storage/media-store", () => ({
  issueSignedUpload: vi.fn(),
  finalizeMediaUpload: vi.fn(),
  readMediaVariant: mocks.readMediaVariant,
}));

const tenantA = randomUUID();
const assignmentA = randomUUID();
const assetId = randomUUID();

const refused: AuthContext = {
  userId: randomUUID(),
  email: null,
  tenantId: null,
  role: null,
  memberships: [],
  assignment: null,
  assignmentDenial: "not_owned_or_inactive",
  scopeRefused: true,
  profileId: randomUUID(),
  isAuthenticated: false,
};

async function get() {
  const request = new NextRequest(`http://localhost:3000/api/media/${assetId}`);
  const response = await mediaGet(request, {
    params: Promise.resolve({ assetId }),
  });
  return { request, response };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createRequestSessionClient.mockResolvedValue({
    auth: { getUser: mocks.sessionGetUser },
    rpc: mocks.sessionRpc,
  });
  mocks.sessionGetUser.mockResolvedValue({
    data: { user: { id: refused.userId } },
    error: null,
  });
  mocks.sessionRpc.mockResolvedValue({
    data: [{ tenant_id: tenantA, assignment_id: assignmentA }],
    error: null,
  });
  mocks.getAuthContext.mockResolvedValue(refused);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the media route's <img> GET and the generation claim", () => {
  it("on, lets the resolver accept an absent claim, still bound to the asset's tenant and row", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    const { request, response } = await get();
    expect(mocks.getAuthContext).toHaveBeenCalledWith(request, {
      roleClass: "staff",
      expectedTenantId: tenantA,
      proposedAssignmentId: assignmentA,
      allowAbsentScopeGeneration: true,
    });
    expect(response.status).toBe(404);
  });

  it.each([undefined, "0"])(
    "off (switch %j), passes today's options exactly (guard)",
    async (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      const { request } = await get();
      expect(mocks.getAuthContext).toHaveBeenCalledWith(request, {
        roleClass: "staff",
        expectedTenantId: tenantA,
        proposedAssignmentId: assignmentA,
      });
    },
  );
});
