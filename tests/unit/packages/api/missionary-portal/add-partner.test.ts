import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../../../../packages/api/src/missionary-portal/add-partner";

import type * as SessionModule from "../../../../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const ROW = "00000000-0000-4000-8000-00000000a0a1";
const KEY = "88888888-8888-4888-8888-888888888888";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  rpc: vi.fn(),
  serviceKeyUsed: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    h.serviceKeyUsed();
    throw new Error("Add Partner used the service key");
  },
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof SessionModule>()),
    createRequestSessionClient: h.session,
  }),
);

function auth(role: "missionary" | "donor" = "missionary"): AuthContext {
  return {
    userId: "00000000-0000-4000-9000-000000000001",
    email: "worker@example.org",
    tenantId: TENANT,
    role,
    memberships: [
      {
        tenantId: TENANT,
        role,
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: ROW,
      userId: "00000000-0000-4000-9000-000000000001",
      tenantId: TENANT,
      revision: "1",
      membershipRole: role,
      staffRole: null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
    profileId: "00000000-0000-4000-9000-000000000001",
    isAuthenticated: true,
  } as AuthContext;
}

const PARTNER = {
  name: "Partner Pat",
  phone: "",
  type: "Individual",
  frequency: "Monthly",
  location: "Kampala",
};

function request(body: unknown, key: string | null = KEY) {
  return new NextRequest("http://localhost/api/missionary/donors", {
    method: "POST",
    headers: {
      authorization: "Bearer caller-token",
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
      ...(key ? { "idempotency-key": key } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/missionary/donors (Add Partner; AL-2678 WP5 rest, D-16 ruling item 7): public.add_partner on the caller's token with the request's scope, nothing of tenant, owner, assignment, Party or profile from the body, refusals in plain words; the database is the authority (issue-2678/add-partner)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.auth.mockResolvedValue(auth());
    h.session.mockResolvedValue({ rpc: h.rpc });
  });

  it("calls add_partner on the caller's token with the request's tenant, the submission key and the partner (no e-mail), and answers 201 with the pair (fix round F1 rule 2; red: an e-mail is required)", async () => {
    h.rpc.mockResolvedValue({
      data: {
        donorId: "d-1",
        partyId: "p-1",
        commandLogId: "l-1",
        duplicate: false,
      },
      error: null,
    });

    const response = await POST(request(PARTNER));

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      donorId: "d-1",
      partyId: "p-1",
      duplicate: false,
    });
    expect(h.rpc).toHaveBeenCalledWith("add_partner", {
      p_tenant_id: TENANT,
      p_idempotency_key: KEY,
      p_name: "Partner Pat",
      p_phone: null,
      p_type: "Individual",
      p_frequency: "Monthly",
      p_location: "Kampala",
      p_request_id: expect.any(String),
    });
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("answers 200 with the original pair for a retried submission", async () => {
    h.rpc.mockResolvedValue({
      data: {
        donorId: "d-1",
        partyId: "p-1",
        commandLogId: "l-1",
        duplicate: true,
      },
      error: null,
    });

    const response = await POST(request(PARTNER));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ duplicate: true });
  });

  it.each([
    ["tenantId", "00000000-0000-4000-8000-0000000000b1"],
    ["tenant_id", "00000000-0000-4000-8000-0000000000b1"],
    ["missionaryId", "00000000-0000-4000-8000-0000000000c1"],
    ["ownerId", "00000000-0000-4000-8000-0000000000c1"],
    ["assignmentId", "00000000-0000-4000-8000-0000000000c1"],
    ["partyId", "00000000-0000-4000-8000-0000000000d1"],
    ["profileId", "00000000-0000-4000-8000-0000000000e1"],
    ["email", "pat@example.test"],
    ["givingPreferences", { defaultAnonymousToRecipient: true }],
    ["defaultAnonymousToRecipient", true],
  ])(
    "refuses a body that carries %s (400) and calls nothing (fix round F1 rule 2 and F7 item 2: no e-mail, and no request sets the preference)",
    async (field, value) => {
      const response = await POST(request({ ...PARTNER, [field]: value }));

      expect(response.status).toBe(400);
      expect(h.rpc).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["is not a UUID", "not-a-key"],
    ["is missing", null],
  ])(
    "refuses a submission key that %s (400) and calls nothing",
    async (_case, key) => {
      const response = await POST(request(PARTNER, key));

      expect(response.status).toBe(400);
      expect(h.rpc).not.toHaveBeenCalled();
    },
  );

  it("refuses a request without a session (401) and calls nothing", async () => {
    const unsigned = new NextRequest("http://localhost/api/missionary/donors", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": KEY,
      },
      body: JSON.stringify(PARTNER),
    });

    const response = await POST(unsigned);

    expect(response.status).toBe(401);
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("refuses a caller whose assignment is not a missionary's before any call", async () => {
    h.auth.mockResolvedValue(auth("donor"));

    const response = await POST(request(PARTNER));

    expect(response.status).toBe(403);
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["42501", null, 403],
    ["22023", null, 400],
    ["XX000", null, 500],
    ["23505", null, 500],
  ])(
    "maps the command's %s (hint %s) to %i, in plain words; a unique violation that is not the key is a server error (fix round F1 rule 5)",
    async (code, hint, status) => {
      h.rpc.mockResolvedValue({
        data: null,
        error: { code, hint, message: "tenant_guard: internal detail" },
      });

      const response = await POST(request(PARTNER));
      const body = await response.json();

      expect(response.status).toBe(status);
      expect(JSON.stringify(body)).not.toContain("tenant_guard");
      expect(JSON.stringify(body)).not.toContain("This form was already used");
    },
  );

  it("answers a true key conflict (23505 with the hint add_partner_key) 409 with the form's words, and no other failure with them (fix round F1 rule 5; red: the key's old words)", async () => {
    h.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        hint: "add_partner_key",
        message:
          "tenant_guard: this submission key was used for another partner",
      },
    });

    const response = await POST(request(PARTNER));

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error:
        "This form was already used for a different partner. Press Add Partner again.",
    });
  });
});
