import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * TDD — finding 06 Gap 1: the cleanup-demo-users endpoint deletes users via the
 * admin (RLS-bypass) client and middleware exempts /api/*. It MUST fail CLOSED:
 * if CRON_SECRET is unset/empty it must refuse, never fall through to deletion.
 */

const { serverEnvMock, getAdminClientMock } = vi.hoisted(() => ({
  serverEnvMock: { CRON_SECRET: undefined as string | undefined },
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/env", () => ({ serverEnv: serverEnvMock }));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { GET } from "../../src/auth/cleanup-demo-users";

function req(headers?: HeadersInit): Request {
  return new Request("https://example.com/api/auth/cleanup-demo-users", {
    headers,
  });
}

function mockAdminNoUsers() {
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  getAdminClientMock.mockReturnValue({
    client: {
      auth: {
        admin: {
          listUsers: vi
            .fn()
            .mockResolvedValue({ data: { users: [] }, error: null }),
          deleteUser,
        },
      },
    },
    error: null,
  });
  return { deleteUser };
}

describe("api/auth/cleanup-demo-users — fail-closed auth (finding 06 Gap 1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serverEnvMock.CRON_SECRET = undefined;
  });

  it("REFUSES and never touches the admin client when CRON_SECRET is unset", async () => {
    serverEnvMock.CRON_SECRET = undefined;
    const { deleteUser } = mockAdminNoUsers();

    const res = await GET(req());

    expect([401, 503]).toContain(res.status);
    expect(getAdminClientMock).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("REFUSES when CRON_SECRET is an empty string", async () => {
    serverEnvMock.CRON_SECRET = "";
    const { deleteUser } = mockAdminNoUsers();

    const res = await GET(req({ authorization: "Bearer " }));

    expect([401, 503]).toContain(res.status);
    expect(getAdminClientMock).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("returns 401 when CRON_SECRET is set but the token is missing or wrong", async () => {
    serverEnvMock.CRON_SECRET = "s3cret";
    mockAdminNoUsers();

    expect((await GET(req())).status).toBe(401);
    expect((await GET(req({ authorization: "Bearer wrong" }))).status).toBe(401);
  });

  it("PROCEEDS on the legitimate cron path (correct Bearer token)", async () => {
    serverEnvMock.CRON_SECRET = "s3cret";
    const { deleteUser } = mockAdminNoUsers();

    const res = await GET(req({ authorization: "Bearer s3cret" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.deletedCount).toBe(0);
    expect(deleteUser).not.toHaveBeenCalled(); // no demo users to delete
  });
});
