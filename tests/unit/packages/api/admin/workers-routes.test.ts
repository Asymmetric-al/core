import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  POST_CONFIRM,
  POST_LIFT,
  POST_RESTRICT,
  POST_REVEAL,
} from "../../../../../packages/api/src/admin/workers/commands";
import {
  GET,
  GET_RECORD,
  GET_UNREVIEWED_COUNT,
} from "../../../../../packages/api/src/admin/workers/read";

import type * as SessionModule from "../../../../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const OTHER_TENANT = "00000000-0000-4000-8000-0000000000b1";
const ADMIN_ROW = "00000000-0000-4000-8000-00000000a0a1";
const STAFF_ROW = "00000000-0000-4000-8000-00000000a0a2";
const WORKER = "00000000-0000-4000-8000-00000000c0c1";
const PARTY = "00000000-0000-4000-8000-00000000d0d1";
const SECRET = "Legal Kestrel";
const NOT_PERMITTED =
  "Only staff with the Restrict publication permission can change these settings.";
const FAILURE = "Something went wrong. Nothing was changed.";
const OUTCOME_UNKNOWN =
  "The change may have been saved. Reload this worker before trying again.";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  serviceKeyUsed: vi.fn(),
  captureError: vi.fn(),
  auditLog: vi.fn(),
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
  createAuditLogger: vi.fn(() => ({ log: h.auditLog })),
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
      assignmentId: isTenantAdmin ? ADMIN_ROW : STAFF_ROW,
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

function row(overrides: Record<string, unknown> = {}) {
  return {
    assignment_id: WORKER,
    party_id: PARTY,
    display_name: "Worker Kestrel",
    public_alias: null,
    security_level: "standard",
    security_level_source: "unreviewed_default",
    do_not_publish: false,
    has_legal_identity: true,
    has_login: false,
    created_at: "2026-11-26T00:00:00+00:00",
    ...overrides,
  };
}

function commandAnswer(overrides: Record<string, unknown> = {}) {
  return {
    tenant_id: TENANT,
    party_id: PARTY,
    security_level: "standard",
    security_level_source: "manual",
    do_not_publish: false,
    ...overrides,
  };
}

type Answer = { data?: unknown; error?: unknown; count?: number | null };

interface Query {
  order: (column: string) => Query;
  range: (from: number, to: number) => Query;
  then: <R>(
    resolve: (value: {
      data: unknown;
      error: unknown;
      count?: number | null;
    }) => R,
  ) => Promise<R>;
}

function stubSession(
  answers: Record<string, Answer | ((page: number) => Answer)>,
  cap = Number.POSITIVE_INFINITY,
) {
  const orders: string[][] = [];
  const ranges: [number, number][] = [];
  let pages = 0;
  const rpc = vi.fn((fn: string) => {
    const order: string[] = [];
    orders.push(order);
    let range: [number, number] | null = null;
    const query: Query = {
      order: (column) => {
        order.push(column);
        return query;
      },
      range: (from, to) => {
        range = [from, to];
        ranges.push(range);
        return query;
      },
      then: async (resolve) => {
        const answer = answers[fn];
        if (!answer) throw new Error(`unexpected rpc ${fn}`);
        const value = typeof answer === "function" ? answer(pages++) : answer;
        let data = value.data ?? null;
        if (range && Array.isArray(data))
          data = data.slice(range[0], range[1] + 1);
        if (Array.isArray(data)) data = data.slice(0, cap);
        return resolve({
          data,
          error: value.error ?? null,
          count: value.count,
        });
      },
    };
    return query;
  });
  h.session.mockResolvedValue({ rpc });
  return Object.assign(rpc, { orders, ranges });
}

const params = (assignmentId = WORKER) => ({
  params: Promise.resolve({ assignmentId }),
});

function get(path: string) {
  return new NextRequest(`https://admin.example.test${path}`, {
    headers: { authorization: "Bearer worker-fixture" },
  });
}

function post(path: string, body: unknown, type = "application/json") {
  return new NextRequest(`https://admin.example.test${path}`, {
    method: "POST",
    headers: { "content-type": type, authorization: "Bearer worker-fixture" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function read(response: Response) {
  expect(response.headers.get("cache-control")).toBe("no-store");
  const { requestId, ...body } = (await response.json()) as Record<
    string,
    unknown
  >;
  if (requestId !== undefined) expect(typeof requestId).toBe("string");
  return body;
}

const COMMANDS = [
  ["restrict", POST_RESTRICT, { level: "sensitive", reason: "Review" }],
  ["lift", POST_LIFT, { clearDoNotPublish: true, reason: "Review" }],
  ["confirm", POST_CONFIRM, { level: "standard", reason: "Review" }],
  ["reveal", POST_REVEAL, { reason: "Review" }],
] as const;

describe("AL-2678 WP5 part 2-r2b1: the workers' routes (contract, error map, alias rule, confirm's pre-check)", () => {
  beforeEach(() => {
    h.auth.mockReset();
    h.session.mockReset();
    h.serviceKeyUsed.mockReset();
    h.captureError.mockReset();
    h.auditLog.mockReset();
  });

  it("the directory answers every staff member the ten fields in camelCase with no-store, has_legal_identity passed as it came (null without the capability)", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rpc = stubSession({
      worker_records: { data: [row({ has_legal_identity: null })] },
    });
    const response = await GET(get("/api/admin/workers"));
    expect(response.status).toBe(200);
    expect(await read(response)).toEqual({
      workers: [
        {
          assignmentId: WORKER,
          partyId: PARTY,
          displayName: "Worker Kestrel",
          publicAlias: null,
          securityLevel: "standard",
          securityLevelSource: "unreviewed_default",
          doNotPublish: false,
          hasLegalIdentity: null,
          hasLogin: false,
          createdAt: "2026-11-26T00:00:00+00:00",
        },
      ],
    });
    expect(rpc).toHaveBeenCalledWith("worker_records", {});
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("B1 (bot round): when the Data API cuts every answer at its row cap, the directory still answers every worker once, page by page in the order display_name then assignment_id, never the first page as the whole list", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const ids = [1, 2, 3, 4, 5].map(
      (n) => `00000000-0000-4000-8000-00000000c0c${n}`,
    );
    const rpc = stubSession(
      {
        worker_records: {
          data: ids.map((id, n) =>
            row({ assignment_id: id, display_name: `Worker ${n}` }),
          ),
        },
      },
      2,
    );
    const response = await GET(get("/api/admin/workers"));
    expect(response.status).toBe(200);
    const body = (await read(response)) as {
      workers: { assignmentId: string }[];
    };
    expect(body.workers.map((w) => w.assignmentId)).toEqual(ids);
    expect(rpc.orders.length).toBeGreaterThan(1);
    for (const order of rpc.orders)
      expect(order).toEqual(["display_name", "assignment_id"]);
    expect(rpc.ranges[0]?.[0]).toBe(0);
    expect(rpc.ranges.map(([from]) => from)).toEqual([0, 2, 4, 5]);
  });

  it("B1 (bot round): a later page that fails answers the route's failure with its request id, never the rows read so far", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rows = [1, 2, 3].map((n) =>
      row({
        assignment_id: `00000000-0000-4000-8000-00000000c0c${n}`,
        display_name: `Worker ${n}`,
      }),
    );
    stubSession(
      {
        worker_records: (page) =>
          page === 0
            ? { data: rows }
            : { error: { code: "57014", message: "canceling statement" } },
      },
      2,
    );
    const response = await GET(get("/api/admin/workers"));
    expect(response.status).toBe(500);
    const raw = (await response.clone().json()) as Record<string, unknown>;
    expect(typeof raw.requestId).toBe("string");
    expect(await read(response)).toEqual({ error: FAILURE });
    expect(h.captureError).toHaveBeenCalledTimes(1);
  });

  it("the reads refuse a missionary and a donor with withOperation's own 403 and a signed-out request with its 401, each with no-store", async () => {
    stubSession({});
    for (const who of ["missionary", "donor"] as const) {
      h.auth.mockResolvedValue(makeAuth(who));
      for (const response of [
        await GET(get("/api/admin/workers")),
        await GET_UNREVIEWED_COUNT(get("/api/admin/workers/unreviewed-count")),
        await GET_RECORD(get(`/api/admin/workers/${WORKER}`), params()),
      ]) {
        expect(response.status, who).toBe(403);
        const body = await read(response);
        expect(body.error).toBe("Forbidden: requires a staff membership");
        expect(body.code).toBeUndefined();
      }
    }
    h.auth.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
      memberships: [],
    });
    for (const response of [
      await GET(get("/api/admin/workers")),
      await POST_REVEAL(
        post(`/api/admin/workers/${WORKER}/reveal`, { reason: "x" }),
        params(),
      ),
    ]) {
      expect(response.status).toBe(401);
      expect(await read(response)).toEqual({ error: "Unauthorized" });
    }
  });

  it("a read whose answer fails its strict schema, or errors, is 500 with the fixed text, reported by code only, and no unexpected key or database text is returned", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    for (const answer of [
      { data: [{ ...row(), legal_name: SECRET }] },
      { data: [row({ security_level: "unknown" })] },
      { error: { code: "XX000", message: `boom ${SECRET}`, details: SECRET } },
    ]) {
      h.captureError.mockReset();
      stubSession({ worker_records: answer });
      const response = await GET(get("/api/admin/workers"));
      expect(response.status).toBe(500);
      const body = await read(response);
      expect(body).toEqual({ error: FAILURE });
      expect(JSON.stringify(body)).not.toContain(SECRET);
      expect(h.captureError).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(h.captureError.mock.calls)).not.toContain(SECRET);
    }
  });

  it("the Home count reads the unreviewed signal with an exact head count, so the row cap cannot cut it; an error or a null count is 500, never 0", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    const rpc = stubSession({
      unreviewed_worker_security_levels: { count: 1234 },
    });
    const response = await GET_UNREVIEWED_COUNT(
      get("/api/admin/workers/unreviewed-count"),
    );
    expect(response.status).toBe(200);
    expect(await read(response)).toEqual({ count: 1234 });
    expect(rpc).toHaveBeenCalledWith(
      "unreviewed_worker_security_levels",
      {},
      { count: "exact", head: true },
    );
    for (const answer of [
      { count: null },
      { error: { code: "57014", message: SECRET } },
    ]) {
      stubSession({ unreviewed_worker_security_levels: answer });
      const failed = await GET_UNREVIEWED_COUNT(
        get("/api/admin/workers/unreviewed-count"),
      );
      expect(failed.status).toBe(500);
      expect(await read(failed)).toEqual({ error: FAILURE });
    }
  });

  it("the record answers one worker by assignment; a non-UUID id is 404 before any call, and an unknown id is 404", async () => {
    h.auth.mockResolvedValue(makeAuth("staff"));
    let rpc = stubSession({ worker_records: { data: [row()] } });
    const found = await GET_RECORD(
      get(`/api/admin/workers/${WORKER}`),
      params(),
    );
    expect(found.status).toBe(200);
    expect((await read(found)).worker).toMatchObject({
      assignmentId: WORKER,
      hasLegalIdentity: true,
    });
    expect(rpc).toHaveBeenCalledWith("worker_records", {
      p_assignment_id: WORKER,
    });
    rpc = stubSession({ worker_records: { data: [] } });
    const bad = await GET_RECORD(
      get("/api/admin/workers/not-a-uuid"),
      params("not-a-uuid"),
    );
    expect(bad.status).toBe(404);
    expect(await read(bad)).toEqual({
      error: "Worker not found.",
      code: "NOT_FOUND",
    });
    expect(rpc).not.toHaveBeenCalled();
    const unknown = await GET_RECORD(
      get(`/api/admin/workers/${WORKER}`),
      params(),
    );
    expect(unknown.status).toBe(404);
    expect(await read(unknown)).toEqual({
      error: "Worker not found.",
      code: "NOT_FOUND",
    });
  });

  it.each(COMMANDS)(
    "%s refuses staff without safety.restrict_publication with 403 NOT_PERMITTED and the fixed text before any call, with no-store",
    async (_name, handler, body) => {
      h.auth.mockResolvedValue(makeAuth("staff"));
      const rpc = stubSession({});
      const response = await handler(
        post(`/api/admin/workers/${WORKER}/x`, body),
        params(),
      );
      expect(response.status).toBe(403);
      expect(await read(response)).toEqual({
        error: NOT_PERMITTED,
        code: "NOT_PERMITTED",
      });
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it.each(COMMANDS)(
    "%s refuses a body with an unknown key, tenantId included, a non-JSON body and a blank reason before any call",
    async (_name, handler, body) => {
      h.auth.mockResolvedValue(makeAuth("admin"));
      const rpc = stubSession({});
      for (const extra of [{ tenantId: OTHER_TENANT }, { other: 1 }]) {
        const response = await handler(
          post(`/api/admin/workers/${WORKER}/x`, { ...body, ...extra }),
          params(),
        );
        expect(response.status).toBe(400);
        expect(await read(response)).toEqual({
          error: "Check the form and try again.",
          code: "INVALID_INPUT",
        });
      }
      const text = await handler(
        post(`/api/admin/workers/${WORKER}/x`, "reason", "text/plain"),
        params(),
      );
      expect(text.status).toBe(415);
      expect(await read(text)).toEqual({
        error: "Check the form and try again.",
        code: "INVALID_INPUT",
      });
      const long = await handler(
        post(`/api/admin/workers/${WORKER}/x`, {
          ...body,
          reason: "x".repeat(501),
        }),
        params(),
      );
      expect(long.status).toBe(400);
      expect(await read(long)).toEqual({
        error: "Check the form and try again.",
        code: "INVALID_INPUT",
      });
      for (const reason of ["", "   ", "\u00a0\u2003\n"]) {
        const blank = await handler(
          post(`/api/admin/workers/${WORKER}/x`, { ...body, reason }),
          params(),
        );
        expect(blank.status).toBe(400);
        expect(await read(blank)).toEqual({
          error: "Give a reason.",
          code: "REASON_REQUIRED",
        });
      }
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["42501", "tenant_guard: anything", 403, "NOT_PERMITTED", NOT_PERMITTED],
    [
      "P0002",
      "No Party with that id in this organization",
      404,
      "NOT_FOUND",
      "Worker not found.",
    ],
    ["22023", "A reason is required", 400, "REASON_REQUIRED", "Give a reason."],
    [
      "22023",
      "Nothing to change",
      400,
      "NOTHING_TO_CHANGE",
      "Choose what to change.",
    ],
    [
      "22023",
      "Lowering a level is lift_worker_restriction's",
      409,
      "LEVEL_CHANGED",
      "This worker's level has changed. Reload to see it.",
    ],
    [
      "22023",
      "Unknown security level",
      400,
      "INVALID_CHANGE",
      "That change is not allowed here.",
    ],
    [
      "22023",
      "Clearing do-not-publish is lift_worker_restriction's",
      400,
      "INVALID_CHANGE",
      "That change is not allowed here.",
    ],
    [
      "23514",
      "a restricted or high-risk worker needs a public alias",
      400,
      "ALIAS_REQUIRED",
      "A restricted or high-risk worker needs a public alias.",
    ],
    [
      "23514",
      "a restricted or high-risk worker's public alias must differ from the legal name",
      400,
      "ALIAS_IS_LEGAL_NAME",
      "The public alias must differ from the worker's legal name.",
    ],
    [
      "55P03",
      "lock timeout",
      503,
      "RETRY",
      "Mission Control is busy. Try again.",
    ],
    ["40001", "serialize", 503, "RETRY", "Mission Control is busy. Try again."],
    ["40P01", "deadlock", 503, "RETRY", "Mission Control is busy. Try again."],
    ["22023", "something new", 500, undefined, FAILURE],
    ["XX000", "internal", 500, undefined, FAILURE],
  ] as const)(
    "restrict maps %s %s to %i %s with the fixed text, never the database's own",
    async (code, message, status, errorCode, text) => {
      h.auth.mockResolvedValue(makeAuth("admin"));
      stubSession({
        worker_records: { data: [row()] },
        restrict_worker_publication: {
          error: { code, message, details: SECRET, hint: SECRET },
        },
      });
      const response = await POST_RESTRICT(
        post(`/api/admin/workers/${WORKER}/restrict`, {
          level: "sensitive",
          reason: "Review",
        }),
        params(),
      );
      expect(response.status).toBe(status);
      const body = await read(response);
      expect(body.error).toBe(text);
      expect(body.code).toBe(errorCode);
      expect(JSON.stringify(body)).not.toContain(message);
      expect(JSON.stringify(body)).not.toContain(SECRET);
      expect(JSON.stringify(h.captureError.mock.calls)).not.toContain(SECRET);
      expect(h.captureError).toHaveBeenCalledTimes(status === 500 ? 1 : 0);
    },
  );

  it("lift maps Raising a level to 409 LEVEL_CHANGED and the reveal maps a missing private row to 404 NO_IDENTITY", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    stubSession({
      worker_records: { data: [row()] },
      lift_worker_restriction: {
        error: {
          code: "22023",
          message: "Raising a level is restrict_worker_publication's",
        },
      },
      reveal_worker_identity: {
        error: {
          code: "P0002",
          message: "No private identity for that worker",
        },
      },
    });
    const lift = await POST_LIFT(
      post(`/api/admin/workers/${WORKER}/lift`, {
        level: "restricted",
        reason: "Review",
      }),
      params(),
    );
    expect(lift.status).toBe(409);
    expect((await read(lift)).code).toBe("LEVEL_CHANGED");
    const reveal = await POST_REVEAL(
      post(`/api/admin/workers/${WORKER}/reveal`, { reason: "Review" }),
      params(),
    );
    expect(reveal.status).toBe(404);
    expect(await read(reveal)).toEqual({
      error: "No legal name is recorded for this worker.",
      code: "NO_IDENTITY",
    });
  });

  it("a command on an id that is not a UUID, or that worker_records does not return, is 404 and calls no command", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    for (const [, handler, body] of COMMANDS) {
      const rpc = stubSession({ worker_records: { data: [] } });
      const unknown = await handler(
        post(`/api/admin/workers/${WORKER}/x`, body),
        params(),
      );
      expect(unknown.status).toBe(404);
      expect((await read(unknown)).code).toBe("NOT_FOUND");
      expect(rpc.mock.calls.map(([fn]) => fn)).toEqual(["worker_records"]);
      const bad = await handler(
        post("/api/admin/workers/nope/x", body),
        params("nope"),
      );
      expect(bad.status).toBe(404);
      expect(rpc).toHaveBeenCalledTimes(1);
    }
  });

  it("confirm calls nothing and answers 409 LEVEL_CHANGED unless the row is still unreviewed at the body's level; then it sends restrict only that level and the organization from the session", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    for (const current of [
      row({ security_level_source: "manual" }),
      row({ security_level: "sensitive" }),
    ]) {
      const rpc = stubSession({ worker_records: { data: [current] } });
      const response = await POST_CONFIRM(
        post(`/api/admin/workers/${WORKER}/confirm`, {
          level: "standard",
          reason: "Review",
        }),
        params(),
      );
      expect(response.status).toBe(409);
      expect(await read(response)).toEqual({
        error: "This worker's level has changed. Reload to see it.",
        code: "LEVEL_CHANGED",
      });
      expect(rpc.mock.calls.map(([fn]) => fn)).toEqual(["worker_records"]);
    }
    let reads = 0;
    const rpc = stubSession({
      worker_records: () => ({
        data: [
          reads++ === 0 ? row() : row({ security_level_source: "manual" }),
        ],
      }),
      restrict_worker_publication: { data: commandAnswer() },
    });
    const response = await POST_CONFIRM(
      post(`/api/admin/workers/${WORKER}/confirm`, {
        level: "standard",
        reason: "Reviewed with the field director",
      }),
      params(),
    );
    expect(response.status).toBe(200);
    expect((await read(response)).worker).toMatchObject({
      securityLevelSource: "manual",
    });
    expect(rpc).toHaveBeenCalledWith("restrict_worker_publication", {
      p_tenant_id: TENANT,
      p_party_id: PARTY,
      p_security_level: "standard",
      p_public_alias: null,
      p_do_not_publish: null,
      p_reason: "Reviewed with the field director",
    });
  });

  it("restrict sends p_public_alias null for an absent or blank alias, so raising a level or setting do-not-publish never clears a stored alias, and the alias as given otherwise; the answer is the row read again", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    for (const [body, alias] of [
      [{ doNotPublish: true, reason: "Review" }, null],
      [{ level: "restricted", alias: "  ", reason: "Review" }, null],
      [{ level: "restricted", alias: "Heron", reason: "Review" }, "Heron"],
    ] as const) {
      const rpc = stubSession({
        worker_records: { data: [row({ public_alias: "Birch" })] },
        restrict_worker_publication: { data: commandAnswer() },
      });
      const response = await POST_RESTRICT(
        post(`/api/admin/workers/${WORKER}/restrict`, body),
        params(),
      );
      expect(response.status).toBe(200);
      expect((await read(response)).worker).toMatchObject({
        publicAlias: "Birch",
      });
      expect(rpc.mock.calls[1]).toEqual([
        "restrict_worker_publication",
        expect.objectContaining({
          p_tenant_id: TENANT,
          p_party_id: PARTY,
          p_public_alias: alias,
          p_do_not_publish: "doNotPublish" in body ? true : null,
        }),
      ]);
      expect(rpc.mock.calls.map(([fn]) => fn)).toEqual([
        "worker_records",
        "restrict_worker_publication",
        "worker_records",
      ]);
    }
  });

  it.each([
    ["a zero-width space", "\u200b"],
    ["no-break and em spaces", "\u00a0\u2003"],
    ["a byte-order mark and a word joiner", "\ufeff\u2060"],
    ["a Mongolian vowel separator and a joiner", "\u180e\u200d"],
    ["a Hangul filler", "\u3164"],
    ["a Braille blank", "\u2800"],
    ["tag characters", "\u{e0020}\u{e0041}"],
    ["spaces, a tab and a zero-width space", " \t\u200b "],
  ])(
    "restrict treats an alias of %s, which the database's safety normalization reduces to nothing, as no alias and sends p_public_alias null, so it cannot clear the stored alias (review fix)",
    async (_label, alias) => {
      h.auth.mockResolvedValue(makeAuth("admin"));
      const rpc = stubSession({
        worker_records: { data: [row({ public_alias: "Birch" })] },
        restrict_worker_publication: { data: commandAnswer() },
      });
      const response = await POST_RESTRICT(
        post(`/api/admin/workers/${WORKER}/restrict`, {
          doNotPublish: true,
          alias,
          reason: "Review",
        }),
        params(),
      );
      expect(response.status).toBe(200);
      expect(rpc.mock.calls[1]).toEqual([
        "restrict_worker_publication",
        expect.objectContaining({
          p_public_alias: null,
          p_do_not_publish: true,
        }),
      ]);
    },
  );

  it("restrict sends an alias with visible text as given, invisible characters and all, for the database to normalize (review fix)", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    const rpc = stubSession({
      worker_records: { data: [row()] },
      restrict_worker_publication: { data: commandAnswer() },
    });
    await POST_RESTRICT(
      post(`/api/admin/workers/${WORKER}/restrict`, {
        level: "restricted",
        alias: "\u200bHeron\u00a0",
        reason: "Review",
      }),
      params(),
    );
    expect(rpc.mock.calls[1]?.[1]).toMatchObject({
      p_public_alias: "\u200bHeron\u00a0",
    });
  });

  it.each(COMMANDS)(
    "%s keeps withOperation's request id when it turns the capability refusal into 403 NOT_PERMITTED (review fix)",
    async (_name, handler, body) => {
      h.auth.mockResolvedValue(makeAuth("staff"));
      stubSession({});
      const response = await handler(
        post(`/api/admin/workers/${WORKER}/x`, body),
        params(),
      );
      expect(response.status).toBe(403);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const raw = (await response.json()) as Record<string, unknown>;
      expect(raw).toEqual({
        error: NOT_PERMITTED,
        code: "NOT_PERMITTED",
        requestId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        ),
      });
    },
  );

  it.each(
    COMMANDS.slice(0, 3).flatMap(([name, handler, body]) =>
      (
        [
          ["its answer does not parse", { legal_name: SECRET }, null],
          [
            "the worker cannot be read again",
            {},
            { error: { code: "57014", message: SECRET } },
          ],
          ["the worker read again is not one row", {}, { data: [] }],
        ] as const
      ).map(
        ([path, extra, reread]) =>
          [name, path, handler, body, extra, reread] as const,
      ),
    ),
  )(
    "B2 (bot round): %s, once the command call returned without an error, answers OUTCOME_UNKNOWN, never that nothing was changed, when %s",
    async (_name, _path, handler, body, extra, reread) => {
      h.auth.mockResolvedValue(makeAuth("admin"));
      stubSession({
        worker_records: (page) =>
          page === 0 || reread === null ? { data: [row()] } : reread,
        restrict_worker_publication: { data: commandAnswer(extra) },
        lift_worker_restriction: { data: commandAnswer(extra) },
      });
      const response = await handler(
        post(`/api/admin/workers/${WORKER}/x`, body),
        params(),
      );
      expect(response.status).toBe(500);
      const raw = (await response.clone().json()) as Record<string, unknown>;
      expect(typeof raw.requestId).toBe("string");
      const answer = await read(response);
      expect(answer).toEqual({
        error: OUTCOME_UNKNOWN,
        code: "OUTCOME_UNKNOWN",
      });
      expect(JSON.stringify(answer)).not.toContain(FAILURE);
      expect(JSON.stringify(answer)).not.toContain(SECRET);
    },
  );

  it("lift sends the level and clear flag as given; a command answer with an extra key, another organization or another Party is 500", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    const rpc = stubSession({
      worker_records: { data: [row({ security_level: "restricted" })] },
      lift_worker_restriction: { data: commandAnswer() },
    });
    const ok = await POST_LIFT(
      post(`/api/admin/workers/${WORKER}/lift`, {
        level: "standard",
        reason: "Review",
      }),
      params(),
    );
    expect(ok.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("lift_worker_restriction", {
      p_tenant_id: TENANT,
      p_party_id: PARTY,
      p_security_level: "standard",
      p_clear_do_not_publish: false,
      p_reason: "Review",
    });
    for (const answer of [
      commandAnswer({ legal_name: SECRET }),
      commandAnswer({ tenant_id: OTHER_TENANT }),
      commandAnswer({ party_id: WORKER }),
    ]) {
      stubSession({
        worker_records: { data: [row()] },
        lift_worker_restriction: { data: answer },
      });
      const response = await POST_LIFT(
        post(`/api/admin/workers/${WORKER}/lift`, {
          clearDoNotPublish: true,
          reason: "Review",
        }),
        params(),
      );
      expect(response.status).toBe(500);
      expect(JSON.stringify(await read(response))).not.toContain(SECRET);
    }
  });

  it("the reveal answers only the three values from the database's answer, never logged or audited by the route; an answer with an extra key or another Party is 500 and returns no value", async () => {
    h.auth.mockResolvedValue(makeAuth("admin"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const rpc = stubSession({
        worker_records: { data: [row()] },
        reveal_worker_identity: {
          data: {
            party_id: PARTY,
            legal_name: SECRET,
            real_country: "Country Kestrel",
            precise_location: null,
          },
        },
      });
      const response = await POST_REVEAL(
        post(`/api/admin/workers/${WORKER}/reveal`, { reason: "Field visit" }),
        params(),
      );
      expect(response.status).toBe(200);
      expect(await read(response)).toEqual({
        legalName: SECRET,
        realCountry: "Country Kestrel",
        preciseLocation: null,
      });
      expect(rpc).toHaveBeenCalledWith("reveal_worker_identity", {
        p_tenant_id: TENANT,
        p_party_id: PARTY,
        p_reason: "Field visit",
      });
      for (const data of [
        {
          party_id: PARTY,
          legal_name: SECRET,
          real_country: null,
          precise_location: null,
          extra: SECRET,
        },
        {
          party_id: WORKER,
          legal_name: SECRET,
          real_country: null,
          precise_location: null,
        },
      ]) {
        stubSession({
          worker_records: { data: [row()] },
          reveal_worker_identity: { data },
        });
        const failed = await POST_REVEAL(
          post(`/api/admin/workers/${WORKER}/reveal`, { reason: "x" }),
          params(),
        );
        expect(failed.status).toBe(500);
        expect(JSON.stringify(await read(failed))).not.toContain(SECRET);
      }
      expect(h.auditLog).not.toHaveBeenCalled();
      for (const spy of [consoleError, consoleLog, h.captureError])
        expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
    } finally {
      consoleError.mockRestore();
      consoleLog.mockRestore();
    }
  });
});
