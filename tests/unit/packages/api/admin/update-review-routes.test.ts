import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as GET_POLICIES,
  PUT as PUT_POLICY,
} from "../../../../../packages/api/src/admin/publication-policies";
import { POST as REVIEW } from "../../../../../packages/api/src/admin/posts/review";
import { POST as WITHDRAW_OWN } from "../../../../../packages/api/src/posts/withdraw";

import type * as SessionModule from "../../../../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const POST_ID = "00000000-0000-4000-8000-00000000e0e1";
const WORKER = "00000000-0000-4000-8000-00000000c0c1";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  serviceKeyUsed: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
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
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({ log: vi.fn() })),
}));
vi.mock("@asym/lib/monitoring/sentry", () => ({
  captureError: h.captureError,
}));
vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof SessionModule>()),
    createRequestSessionClient: h.session,
  }),
);

type Who = "admin" | "staff" | "missionary" | "donor";

function makeAuth(who: Who): AuthContext {
  const membershipRole = who === "admin" || who === "staff" ? "staff" : who;
  const isTenantAdmin = who === "admin";
  const staffRole = membershipRole === "staff" ? "member_care" : null;
  return {
    userId: "00000000-0000-4000-9000-000000000001",
    email: "member@example.org",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : membershipRole,
    memberships: [
      {
        tenantId: TENANT,
        role: membershipRole,
        staffRole,
        isActive: true,
        isTenantAdmin,
      },
    ],
    assignment: {
      assignmentId: "00000000-0000-4000-8000-00000000a0a1",
      userId: "00000000-0000-4000-9000-000000000001",
      tenantId: TENANT,
      revision: "1",
      membershipRole,
      staffRole,
      isTenantAdmin,
    },
    assignmentDenial: null,
    profileId: "00000000-0000-4000-8000-000000000001",
    isAuthenticated: true,
  } as AuthContext;
}

type Answer = { data?: unknown; error?: { code: string; message: string } };

function stubSession(answers: Record<string, Answer>) {
  const reads: Array<[string, ...unknown[]]> = [];
  const rpc = vi.fn(async (fn: string) => {
    const answer = answers[fn];
    if (!answer) throw new Error(`unexpected rpc ${fn}`);
    return { data: answer.data ?? null, error: answer.error ?? null };
  });
  const from = (table: string) => {
    reads.push(["from", table]);
    const query = {
      select: (columns: string) => {
        reads.push(["select", columns]);
        return query;
      },
      eq: (column: string, value: unknown) => {
        reads.push(["eq", column, value]);
        return query;
      },
      order: () => query,
      then: (resolve: (value: unknown) => unknown) =>
        resolve({
          data: answers[`from:${table}`]?.data ?? [],
          error: answers[`from:${table}`]?.error ?? null,
        }),
    };
    return query;
  };
  h.session.mockResolvedValue({ rpc, from });
  return Object.assign(rpc, { reads });
}

function send(path: string, method: string, body?: unknown) {
  return new NextRequest(`https://core.example.test${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: "Bearer review-fixture",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const routeParams = { params: Promise.resolve({ postId: POST_ID }) };

async function body(response: Response) {
  const { requestId: _requestId, ...rest } = (await response.json()) as Record<
    string,
    unknown
  >;
  return rest;
}

beforeEach(() => {
  h.auth.mockReset();
  h.session.mockReset();
  h.serviceKeyUsed.mockReset();
});

describe("POST /api/admin/posts/[postId]/review: approve, reject or withdraw another person's update (AL-2680, invariant 3)", () => {
  it("approves through approve_ministry_update on the reviewer's own token, never the service key", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rpc = stubSession({ approve_ministry_update: {} });
    const response = await REVIEW(
      send(`/api/admin/posts/${POST_ID}/review`, "POST", {
        decision: "approve",
      }),
      routeParams,
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("approve_ministry_update", {
      p_tenant_id: TENANT,
      p_post_id: POST_ID,
    });
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("rejects and withdraws only with a reason that is not blank once normalised, and sends the reason to the command", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rpc = stubSession({
      reject_ministry_update: {},
      withdraw_ministry_update: {},
    });
    for (const decision of ["reject", "withdraw"])
      for (const reason of [undefined, "", "   ", "​"]) {
        const refused = await REVIEW(
          send(`/api/admin/posts/${POST_ID}/review`, "POST", {
            decision,
            ...(reason === undefined ? {} : { reason }),
          }),
          routeParams,
        );
        expect(refused.status, `${decision} ${String(reason)}`).toBe(400);
        expect(await body(refused)).toEqual({ error: "Give a reason." });
      }
    expect(rpc).not.toHaveBeenCalled();
    for (const [decision, fn] of [
      ["reject", "reject_ministry_update"],
      ["withdraw", "withdraw_ministry_update"],
    ] as const) {
      const done = await REVIEW(
        send(`/api/admin/posts/${POST_ID}/review`, "POST", {
          decision,
          reason: "Names a partner church",
        }),
        routeParams,
      );
      expect(done.status).toBe(200);
      expect(rpc).toHaveBeenCalledWith(fn, {
        p_tenant_id: TENANT,
        p_post_id: POST_ID,
        p_reason: "Names a partner church",
      });
    }
  });

  it("refuses a caller without updates.review before any command, and answers the command's refusals: 403 for its authority, 409 with its words for the update's state", async () => {
    h.auth.mockResolvedValue(makeAuth("donor"));
    const rpc = stubSession({});
    const forbidden = await REVIEW(
      send(`/api/admin/posts/${POST_ID}/review`, "POST", {
        decision: "approve",
      }),
      routeParams,
    );
    expect(forbidden.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();

    h.auth.mockResolvedValue(makeAuth("staff"));
    stubSession({
      approve_ministry_update: {
        error: {
          code: "42501",
          message:
            "tenant_guard: an update is approved by a person other than its author",
        },
      },
    });
    const own = await REVIEW(
      send(`/api/admin/posts/${POST_ID}/review`, "POST", {
        decision: "approve",
      }),
      routeParams,
    );
    expect(own.status).toBe(403);
    expect(await body(own)).toEqual({
      error: "You can’t review this update.",
    });

    stubSession({
      approve_ministry_update: {
        error: {
          code: "22023",
          message: "Only a submitted update can be approved",
        },
      },
    });
    const stale = await REVIEW(
      send(`/api/admin/posts/${POST_ID}/review`, "POST", {
        decision: "approve",
      }),
      routeParams,
    );
    expect(stale.status).toBe(409);
    expect(await body(stale)).toEqual({
      error: "Only a submitted update can be approved",
    });
  });
});

describe("/api/admin/publication-policies: one policy per missionary path, set with safety.restrict_publication and a reason (AL-2680, invariant 2 and 3)", () => {
  it("sets a path's mode through set_publication_policy on the administrator's own token", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    const rpc = stubSession({ set_publication_policy: {} });
    const response = await PUT_POLICY(
      send("/api/admin/publication-policies", "PUT", {
        ministryAssignmentId: WORKER,
        path: "update",
        mode: "automatic",
        reason: "Trusted writer",
      }),
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("set_publication_policy", {
      p_tenant_id: TENANT,
      p_ministry_assignment_id: WORKER,
      p_path: "update",
      p_mode: "automatic",
      p_reason: "Trusted writer",
    });
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("refuses staff without the capability, and a blank reason, before any command", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rpc = stubSession({});
    const forbidden = await PUT_POLICY(
      send("/api/admin/publication-policies", "PUT", {
        ministryAssignmentId: WORKER,
        path: "update",
        mode: "automatic",
        reason: "Trusted writer",
      }),
    );
    expect(forbidden.status).toBe(403);
    h.auth.mockResolvedValue(makeAuth("admin"));
    const blank = await PUT_POLICY(
      send("/api/admin/publication-policies", "PUT", {
        ministryAssignmentId: WORKER,
        path: "update",
        mode: "automatic",
        reason: " ​ ",
      }),
    );
    expect(blank.status).toBe(400);
    expect(await body(blank)).toEqual({ error: "Give a reason." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("lists the organization's policies to a reviewer on their own token", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rows = [
      {
        ministry_assignment_id: WORKER,
        path: "update",
        mode: "automatic",
        reason: "Trusted writer",
        set_at: "2026-11-27T00:00:00Z",
      },
    ];
    const rpc = stubSession({ "from:publication_policies": { data: rows } });
    const response = await GET_POLICIES(
      send("/api/admin/publication-policies", "GET"),
    );
    expect(response.status).toBe(200);
    expect(await body(response)).toEqual({ policies: rows });
    expect(rpc.reads).toContainEqual(["from", "publication_policies"]);
    expect(rpc.reads).toContainEqual(["eq", "tenant_id", TENANT]);
  });
});

describe("POST /api/posts/[postId]/withdraw: a missionary withdraws their own update without a reason (AL-2680, invariant 1)", () => {
  it("withdraws through withdraw_own_ministry_update on the missionary's own token", async () => {
    h.auth.mockResolvedValue(makeAuth("missionary"));
    const rpc = stubSession({ withdraw_own_ministry_update: {} });
    const response = await WITHDRAW_OWN(
      send(`/api/posts/${POST_ID}/withdraw`, "POST"),
      routeParams,
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("withdraw_own_ministry_update", {
      p_tenant_id: TENANT,
      p_post_id: POST_ID,
    });
  });

  it("answers 404 when the update is not the caller's own, and 403 to anyone who is not a missionary", async () => {
    h.auth.mockResolvedValue(makeAuth("missionary"));
    stubSession({
      withdraw_own_ministry_update: {
        error: {
          code: "42501",
          message: "tenant_guard: the update is not the caller's own",
        },
      },
    });
    const other = await WITHDRAW_OWN(
      send(`/api/posts/${POST_ID}/withdraw`, "POST"),
      routeParams,
    );
    expect(other.status).toBe(404);
    expect(await body(other)).toEqual({ error: "Update not found" });

    h.auth.mockResolvedValue(makeAuth("donor"));
    const rpc = stubSession({});
    const donor = await WITHDRAW_OWN(
      send(`/api/posts/${POST_ID}/withdraw`, "POST"),
      routeParams,
    );
    expect(donor.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
