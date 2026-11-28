import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  hasSession: vi.fn(),
  createSessionClient: vi.fn(),
  serviceKeyUsed: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: new Proxy(
      {},
      {
        get: (_target, key) => {
          h.serviceKeyUsed(String(key));
          throw new Error(`service-key client used: ${String(key)}`);
        },
      },
    ),
    error: null,
  }),
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  () => ({
    requestCarriesSupabaseSession: h.hasSession,
    createRequestSessionClient: h.createSessionClient,
  }),
);

import { POST } from "../../../../../packages/api/src/invitations/accept";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const USER = "00000000-0000-4000-8000-0000000000b1";
const INV_ID = "00000000-0000-4000-8000-0000000000c1";
const MEM_ID = "00000000-0000-4000-8000-0000000000d1";

function jsonPost(body: unknown, contentType = "application/json") {
  return new NextRequest("https://admin.example.test/api/invitations/accept", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/invitations/accept", () => {
  beforeEach(() => {
    h.hasSession.mockReset();
    h.createSessionClient.mockReset();
    h.serviceKeyUsed.mockReset();
  });

  it("refuses requests without a real Supabase session before touching the database", async () => {
    h.hasSession.mockReturnValue(false);
    const res = await POST(
      jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({ code: "UNAUTHENTICATED" });
    expect(h.createSessionClient).not.toHaveBeenCalled();
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("refuses unauthenticated getUser responses with 401 and no RPC call", async () => {
    h.hasSession.mockReturnValue(true);
    const rpc = vi.fn();
    h.createSessionClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
      rpc,
    });
    const res = await POST(
      jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
    );
    expect(res.status).toBe(401);
    expect(h.createSessionClient).toHaveBeenCalledWith(
      expect.any(Request),
      null,
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls accept_membership_invitation on the caller token with null scope and returns redirectPath", async () => {
    h.hasSession.mockReturnValue(true);
    const rpc = vi.fn().mockResolvedValue({
      data: {
        invitation_id: INV_ID,
        tenant_id: TENANT,
        membership_id: MEM_ID,
        user_id: USER,
        role: "staff",
        staff_role: "finance",
        is_tenant_admin: false,
        revived: false,
        accepted_at: "2026-11-23T09:00:00.000Z",
      },
      error: null,
    });
    h.createSessionClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
      },
      rpc,
    });

    const selector = "a".repeat(32);
    const verifier = "b".repeat(43);
    const res = await POST(jsonPost({ selector, verifier }));

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(h.createSessionClient).toHaveBeenCalledWith(
      expect.any(Request),
      null,
    );
    expect(rpc).toHaveBeenCalledWith("accept_membership_invitation", {
      p_selector: selector,
      p_verifier: verifier,
    });
    expect(await res.json()).toMatchObject({
      invitation_id: INV_ID,
      tenant_id: TENANT,
      membership_id: MEM_ID,
      role: "staff",
      staff_role: "finance",
      redirectPath: `/${TENANT}`,
    });
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("maps generic refusal (42501), inactive tenant (55000), and duplicate live membership (23505) distinctly", async () => {
    h.hasSession.mockReturnValue(true);

    for (const [pgCode, pgMessage, expectedStatus, expectedCode] of [
      [
        "42501",
        "Invitation is invalid or no longer available",
        403,
        "INVITATION_INVALID",
      ],
      [
        "55000",
        "This organization is not currently active and cannot accept invitations",
        409,
        "TENANT_INACTIVE",
      ],
      [
        "23505",
        "You already hold this active membership in this organization",
        409,
        "ALREADY_MEMBER",
      ],
    ] as const) {
      const rpc = vi.fn().mockResolvedValue({
        data: null,
        error: { code: pgCode, message: pgMessage },
      });
      h.createSessionClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
        },
        rpc,
      });
      const res = await POST(
        jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
      );
      expect(res.status, pgCode).toBe(expectedStatus);
      expect(await res.json(), pgCode).toMatchObject({ code: expectedCode });
    }
  });

  it("maps a worker invitation's refusals distinctly: a worker that already has a login (55006) to 409 WORKER_HAS_LOGIN and a login tied to another person there (21000) to 409 LOGIN_TIED_ELSEWHERE, each with a fixed text and never the database's; READ COMMITTED's 25001 is the generic failure (WP5 rest 2b, invariant 11; red: both are 500)", async () => {
    h.hasSession.mockReturnValue(true);
    for (const [pgCode, expectedStatus, expectedCode, text] of [
      [
        "55006",
        409,
        "WORKER_HAS_LOGIN",
        "This worker already has a login. Ask your organization for help.",
      ],
      [
        "21000",
        409,
        "LOGIN_TIED_ELSEWHERE",
        "This account already belongs to another person in this organization. Ask your organization for help.",
      ],
      ["25001", 500, "INVITATION_ACCEPT_FAILED", "Could not accept invitation"],
    ] as const) {
      const rpc = vi.fn().mockResolvedValue({
        data: null,
        error: { code: pgCode, message: "database text" },
      });
      h.createSessionClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
        },
        rpc,
      });
      const res = await POST(
        jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
      );
      expect(res.status, pgCode).toBe(expectedStatus);
      expect(res.headers.get("cache-control"), pgCode).toBe("no-store");
      expect(await res.json(), pgCode).toEqual({
        error: text,
        code: expectedCode,
      });
    }
  });

  it("a worker invitation's acceptance answers its Party and worker with the redirect (WP5 rest 2b, invariant 11; guard)", async () => {
    h.hasSession.mockReturnValue(true);
    const PARTY = "00000000-0000-4000-8000-0000000000e1";
    const WORKER = "00000000-0000-4000-8000-0000000000f1";
    h.createSessionClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
      },
      rpc: vi.fn().mockResolvedValue({
        data: {
          invitation_id: INV_ID,
          tenant_id: TENANT,
          membership_id: MEM_ID,
          user_id: USER,
          role: "missionary",
          staff_role: null,
          is_tenant_admin: false,
          revived: false,
          accepted_at: "2026-11-28T09:00:00.000Z",
          party_id: PARTY,
          assignment_id: WORKER,
        },
        error: null,
      }),
    });
    const res = await POST(
      jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      role: "missionary",
      party_id: PARTY,
      assignment_id: WORKER,
      redirectPath: `/${TENANT}`,
    });
  });

  it.each(["55P03", "40001", "40P01"])(
    "W3 (fix round of 2869): an acceptance stopped by contention (%s: a lock wait, a serialization failure, a deadlock) wrote nothing, so it answers 503 RETRY, no-store, with the busy sentence, never the invalid or the failed answer (red: 500 INVITATION_ACCEPT_FAILED)",
    async (pgCode) => {
      h.hasSession.mockReturnValue(true);
      h.createSessionClient.mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
        },
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { code: pgCode, message: "database text" },
        }),
      });
      const res = await POST(
        jsonPost({ selector: "a".repeat(32), verifier: "b".repeat(43) }),
      );
      expect(res.status).toBe(503);
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect(await res.json()).toEqual({
        error: "This organization is busy right now. Try again.",
        code: "RETRY",
      });
    },
  );

  it("refuses malformed JSON and non-JSON media types", async () => {
    h.hasSession.mockReturnValue(true);
    const badJson = await POST(jsonPost("{bad", "application/json"));
    expect(badJson.status).toBe(400);

    const wrongType = await POST(jsonPost("selector=1", "text/plain"));
    expect(wrongType.status).toBe(415);
  });
});
