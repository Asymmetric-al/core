import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  hasSession: vi.fn(),
  createSessionClient: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    throw new Error("service-key client used");
  },
}));

vi.mock("../../../../packages/api/src/shared/request-session-client", () => ({
  requestCarriesSupabaseSession: h.hasSession,
  createRequestSessionClient: h.createSessionClient,
}));

import { POST } from "../../../../apps/missionary/app/api/invitations/accept/route";

const TA = "00000000-0000-0000-0000-000000000001";
const USER = "00000000-0000-4000-8000-0000000000b3";

function accept(headers: Record<string, string> = {}) {
  return POST(
    new NextRequest(
      "http://localhost:25362/missionary/api/invitations/accept",
      {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({
          selector: "a".repeat(32),
          verifier: "b".repeat(43),
        }),
      },
    ),
  );
}

beforeEach(() => {
  h.hasSession.mockReturnValue(true);
  h.createSessionClient.mockResolvedValue({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: {
        invitation_id: "00000000-0000-4000-8000-0000000000c3",
        tenant_id: TA,
        membership_id: "00000000-0000-4000-8000-0000000000d3",
        user_id: USER,
        role: "missionary",
        staff_role: null,
        is_tenant_admin: false,
        revived: false,
        accepted_at: "2026-11-27T09:00:00.000Z",
      },
      error: null,
    }),
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("an invitation accepted through the missionary mount", () => {
  it("on, marks the shared origin's clipboard for the first admin page to empty", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    const response = await accept({ "x-asym-name-tenant": TA });
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(
      /(?:^|, )asym_clipboard_reset=1;/,
    );
  });

  it("on, a refused acceptance sets no mark (guard)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    const response = await accept();
    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie") ?? "").not.toContain(
      "asym_clipboard_reset",
    );
  });

  it.each([undefined, "0"])(
    "off (switch %s), sets no mark, as today (guard)",
    async (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      const response = await accept();
      expect(response.status).toBe(200);
      expect(response.headers.get("set-cookie") ?? "").not.toContain(
        "asym_clipboard_reset",
      );
    },
  );
});
