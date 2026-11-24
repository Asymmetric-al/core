import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TENANT_A = "00000000-0000-4000-8000-00000000000a";
const TENANT_B = "00000000-0000-4000-8000-00000000000b";

const USER_P = "00000000-0000-4000-8000-0000000000a1";
const USER_Q = "00000000-0000-4000-8000-0000000000a2";
const USER_R = "00000000-0000-4000-8000-0000000000a3";

const PROFILE_P = "00000000-0000-4000-8000-0000000001a1";
const PROFILE_Q = "00000000-0000-4000-8000-0000000001a2";
const PROFILE_R = "00000000-0000-4000-8000-0000000001a3";

const ROW_P_ADMIN_A = "00000000-0000-4000-8000-000000000201";
const ROW_P_MEMBER_CARE_A = "00000000-0000-4000-8000-000000000202";
const ROW_Q_ADMIN_A = "00000000-0000-4000-8000-000000000203";
const ROW_R_ADMIN_B = "00000000-0000-4000-8000-000000000204";

const TOKEN_P = "bearer-token-p";
const TOKEN_Q = "bearer-token-q";
const TOKEN_R = "bearer-token-r";

interface StaffAssignmentRow {
  id: string;
  user_id: string;
  tenant_id: string;
  role: "staff";
  staff_role: string;
  is_tenant_admin: boolean;
  updated_at: string;
}

interface OwnershipRow {
  session_id: string;
  tenant_id: string;
  owner_actor_id: string;
  owner_profile_id: string | null;
  identity_mode: "admin" | "service";
  actor_role: string | null;
  initiator_type: string;
  initiator_id: string;
}

const USERS_BY_TOKEN: Record<
  string,
  {
    userId: string;
    email: string;
    profileId: string;
    rows: StaffAssignmentRow[];
  }
> = {
  [TOKEN_P]: {
    userId: USER_P,
    email: "p@example.test",
    profileId: PROFILE_P,
    rows: [
      {
        id: ROW_P_ADMIN_A,
        user_id: USER_P,
        tenant_id: TENANT_A,
        role: "staff",
        staff_role: "development",
        is_tenant_admin: true,
        updated_at: "2026-11-25T00:00:00.000000+00:00",
      },
      {
        id: ROW_P_MEMBER_CARE_A,
        user_id: USER_P,
        tenant_id: TENANT_A,
        role: "staff",
        staff_role: "member_care",
        is_tenant_admin: false,
        updated_at: "2026-11-25T00:00:00.000000+00:00",
      },
    ],
  },
  [TOKEN_Q]: {
    userId: USER_Q,
    email: "q@example.test",
    profileId: PROFILE_Q,
    rows: [
      {
        id: ROW_Q_ADMIN_A,
        user_id: USER_Q,
        tenant_id: TENANT_A,
        role: "staff",
        staff_role: "development",
        is_tenant_admin: true,
        updated_at: "2026-11-25T00:00:00.000000+00:00",
      },
    ],
  },
  [TOKEN_R]: {
    userId: USER_R,
    email: "r@example.test",
    profileId: PROFILE_R,
    rows: [
      {
        id: ROW_R_ADMIN_B,
        user_id: USER_R,
        tenant_id: TENANT_B,
        role: "staff",
        staff_role: "development",
        is_tenant_admin: true,
        updated_at: "2026-11-25T00:00:00.000000+00:00",
      },
    ],
  },
};

const USERS_BY_ID = new Map(
  Object.values(USERS_BY_TOKEN).map((entry) => [entry.userId, entry]),
);

const storeState = vi.hoisted(() => ({
  rows: new Map<string, OwnershipRow>(),
  adminClientAvailable: true,
  insertError: null as { code?: string; message: string } | null,
  getAdminClientCalls: 0,
  insertCalls: 0,
  selectCalls: 0,
}));

function createFakeAdminClient() {
  return {
    from(table: string) {
      if (table !== "eve_session_ownership") {
        throw new Error(`unexpected admin table ${table}`);
      }
      return {
        async insert(row: OwnershipRow) {
          storeState.insertCalls += 1;
          if (storeState.insertError) {
            return { error: storeState.insertError };
          }
          if (storeState.rows.has(row.session_id)) {
            return {
              error: {
                code: "23505",
                message: "duplicate key value violates unique constraint",
              },
            };
          }
          storeState.rows.set(row.session_id, { ...row });
          return { error: null };
        },
        select(_columns: string) {
          return {
            eq(column: string, value: string) {
              if (column !== "session_id") {
                throw new Error(`unexpected filter column ${column}`);
              }
              return {
                async maybeSingle() {
                  storeState.selectCalls += 1;
                  const found = storeState.rows.get(value);
                  return {
                    data: found ? { ...found } : null,
                    error: null,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

function createFakeSupabaseClient(
  _url: string,
  _key: string,
  options?: {
    global?: { headers?: Record<string, string> };
  },
) {
  const authHeader = options?.global?.headers?.Authorization ?? "";
  const clientToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";
  let resolvedUserId: string | null =
    USERS_BY_TOKEN[clientToken]?.userId ?? null;

  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async getUser(token?: string) {
        const effectiveToken = token ?? clientToken;
        const entry = USERS_BY_TOKEN[effectiveToken];
        if (!entry) {
          resolvedUserId = null;
          return { data: { user: null }, error: null };
        }
        resolvedUserId = entry.userId;
        return {
          data: { user: { id: entry.userId, email: entry.email } },
          error: null,
        };
      },
    },
    from(table: string) {
      if (table !== "profiles") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          eq: (_column: string, userId: string) => ({
            async single() {
              const entry = USERS_BY_ID.get(userId);
              return entry
                ? { data: { id: entry.profileId }, error: null }
                : { data: null, error: { message: "not found" } };
            },
          }),
        }),
      };
    },
    async rpc() {
      const entry = resolvedUserId
        ? USERS_BY_ID.get(resolvedUserId)
        : undefined;
      return { data: entry ? entry.rows : [], error: null };
    },
    schema() {
      throw new Error("authz is not exposed by the Data API");
    },
  };
}

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
  headers: async () => ({ get: () => null }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "unit-test-public-key",
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    storeState.getAdminClientCalls += 1;
    return {
      client: storeState.adminClientAvailable ? createFakeAdminClient() : null,
    };
  },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(createFakeSupabaseClient),
  parseCookieHeader: () => [],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(createFakeSupabaseClient),
}));

import {
  claimEveSessionFromAuthSnapshot,
  EveRouteAuthError,
  type EveSessionAuthSnapshot,
} from "../../packages/api/src/eve/session-ownership";
import { ApiHttpError } from "../../packages/api/src/shared/api-http-error";
import eveChannelDefault from "../../packages/eve-runtime/agent/channels/eve";
import {
  adminEveSessionEvents,
  withAdminSessionCreationClaim,
} from "../../packages/eve-runtime/src/admin-session-auth";

type ChannelRoute = (typeof eveChannelDefault.routes)[number];
type HttpRoute = Exclude<ChannelRoute, { transport: "websocket" }>;
type RouteArgs = Parameters<HttpRoute["handler"]>[1];
type SendFn = RouteArgs["send"];
type SendOptionsArg = Parameters<SendFn>[1];
type SessionResult = Awaited<ReturnType<SendFn>>;

function getHttpRoute(
  channel: typeof eveChannelDefault,
  method: string,
  routePath: string,
): HttpRoute {
  const matched = channel.routes.find(
    (route): route is HttpRoute =>
      route.transport !== "websocket" &&
      route.method === method &&
      route.path === routePath,
  );
  if (!matched) {
    throw new Error(`missing route ${method} ${routePath}`);
  }
  return matched;
}

function emptyEventStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
}

function createFakeArgs(options: {
  params?: Record<string, string>;
  onSend?: (
    input: Parameters<SendFn>[0],
    sendOptions: SendOptionsArg,
  ) => Promise<SessionResult>;
}) {
  const sendCalls: Array<{
    input: Parameters<SendFn>[0];
    options: SendOptionsArg;
  }> = [];
  const getEventStreamMock = vi.fn(async () => emptyEventStream());
  const cancelSessionMock = vi.fn(async () => ({
    status: "accepted" as const,
  }));

  const makeSession = (id: string, continuationToken: string): SessionResult =>
    ({
      id,
      continuationToken,
      cancel: cancelSessionMock,
      getEventStream: getEventStreamMock,
    }) as SessionResult;

  const send: SendFn = vi.fn(async (input, sendOptions) => {
    sendCalls.push({ input, options: sendOptions });
    if (options.onSend) {
      return options.onSend(input, sendOptions);
    }
    return makeSession("session-1", sendOptions.continuationToken);
  });

  const args: RouteArgs = {
    send,
    cancel: vi.fn(async () => ({ status: "accepted" as const })),
    getSession: vi.fn((sessionId: string) =>
      makeSession(sessionId, `eve:${sessionId}`),
    ),
    receive: vi.fn() as unknown as RouteArgs["receive"],
    params: options.params ?? {},
    waitUntil: vi.fn(),
    requestIp: null,
  };

  return { args, getEventStreamMock, makeSession, send, sendCalls };
}

function bearerHeaders(
  token: string | null,
  scope: { tenant?: string; assignment?: string } = {},
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(scope.tenant ? { "x-asym-tenant": scope.tenant } : {}),
    ...(scope.assignment ? { "x-asym-assignment": scope.assignment } : {}),
    ...extra,
  };
}

function createSessionRequest(
  token: string | null,
  scope: { tenant?: string; assignment?: string } = {},
  url = "https://admin.example.test/eve/v1/session",
): Request {
  return new Request(url, {
    method: "POST",
    headers: bearerHeaders(token, scope, {
      "content-type": "application/json",
    }),
    body: JSON.stringify({ message: "Hello Eve" }),
  });
}

function streamRequest(
  sessionId: string,
  token: string | null,
  scope: { tenant?: string; assignment?: string } = {},
): Request {
  return new Request(
    `https://admin.example.test/eve/v1/session/${sessionId}/stream`,
    {
      method: "GET",
      headers: bearerHeaders(token, scope),
    },
  );
}

function followUpRequest(
  sessionId: string,
  token: string | null,
  scope: { tenant?: string; assignment?: string } = {},
  continuationToken = "eve:tok-1",
): Request {
  return new Request(`https://admin.example.test/eve/v1/session/${sessionId}`, {
    method: "POST",
    headers: bearerHeaders(token, scope, {
      "content-type": "application/json",
    }),
    body: JSON.stringify({
      continuationToken,
      message: "Follow-up message",
    }),
  });
}

function cancelRequest(
  sessionId: string,
  token: string | null,
  scope: { tenant?: string; assignment?: string } = {},
): Request {
  return new Request(
    `https://admin.example.test/eve/v1/session/${sessionId}/cancel`,
    {
      method: "POST",
      headers: bearerHeaders(token, scope, {
        "content-type": "application/json",
      }),
      body: JSON.stringify({}),
    },
  );
}

function snapshotFor(user: "P" | "Q" | "R"): EveSessionAuthSnapshot {
  if (user === "P") {
    return {
      authenticator: "asym-supabase-admin",
      principalId: USER_P,
      principalType: "user",
      attributes: {
        identityMode: "admin",
        membershipRoles: ["staff"],
        profileId: PROFILE_P,
        role: "admin",
        tenantAdmin: "true",
        tenantId: TENANT_A,
      },
    };
  }
  if (user === "Q") {
    return {
      authenticator: "asym-supabase-admin",
      principalId: USER_Q,
      principalType: "user",
      attributes: {
        identityMode: "admin",
        membershipRoles: ["staff"],
        profileId: PROFILE_Q,
        role: "admin",
        tenantAdmin: "true",
        tenantId: TENANT_A,
      },
    };
  }
  return {
    authenticator: "asym-supabase-admin",
    principalId: USER_R,
    principalType: "user",
    attributes: {
      identityMode: "admin",
      membershipRoles: ["staff"],
      profileId: PROFILE_R,
      role: "admin",
      tenantAdmin: "true",
      tenantId: TENANT_B,
    },
  };
}

async function invokeTurnStarted(
  sessionId: string,
  current: EveSessionAuthSnapshot | null,
): Promise<void> {
  const turnStarted = adminEveSessionEvents["turn.started"];
  if (!turnStarted) {
    throw new Error("missing turn.started handler");
  }
  type TurnStartedArgs = Parameters<typeof turnStarted>;
  await turnStarted(
    {} as TurnStartedArgs[0],
    {} as TurnStartedArgs[1],
    {
      session: {
        id: sessionId,
        auth: { current },
      },
    } as unknown as TurnStartedArgs[2],
  );
}

const originalArgv = process.argv;

beforeEach(() => {
  storeState.rows.clear();
  storeState.adminClientAvailable = true;
  storeState.insertError = null;
  storeState.getAdminClientCalls = 0;
  storeState.insertCalls = 0;
  storeState.selectCalls = 0;
});

afterEach(() => {
  process.argv = originalArgv;
  vi.clearAllMocks();
});

describe("Eve session ownership at creation (AL-2796)", () => {
  const createRoute = getHttpRoute(
    eveChannelDefault,
    "POST",
    "/eve/v1/session",
  );
  const continueRoute = getHttpRoute(
    eveChannelDefault,
    "POST",
    "/eve/v1/session/:sessionId",
  );
  const cancelRoute = getHttpRoute(
    eveChannelDefault,
    "POST",
    "/eve/v1/session/:sessionId/cancel",
  );
  const streamRoute = getHttpRoute(
    eveChannelDefault,
    "GET",
    "/eve/v1/session/:sessionId/stream",
  );

  it("Test 1: serves the creator on the stream before turn.started runs, then accepts repeat turn.started idempotently", async () => {
    const createFake = createFakeArgs({});
    const createResponse = await createRoute.handler(
      createSessionRequest(TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      createFake.args,
    );

    expect(createResponse.status).toBe(202);
    const createBody = (await createResponse.json()) as {
      ok: boolean;
      sessionId: string;
      continuationToken: string;
    };
    expect(createBody.ok).toBe(true);
    expect(createBody.sessionId).toBe("session-1");
    expect(createFake.sendCalls).toHaveLength(1);
    const sentAuth = createFake.sendCalls[0]!.options
      .auth as EveSessionAuthSnapshot | null;

    const firstStreamFake = createFakeArgs({
      params: { sessionId: "session-1" },
    });
    const firstStreamResponse = await streamRoute.handler(
      streamRequest("session-1", TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      firstStreamFake.args,
    );
    expect(firstStreamResponse.status).toBe(200);
    expect(firstStreamFake.getEventStreamMock).toHaveBeenCalledTimes(1);

    await expect(
      invokeTurnStarted("session-1", sentAuth),
    ).resolves.toBeUndefined();

    const secondStreamFake = createFakeArgs({
      params: { sessionId: "session-1" },
    });
    const secondStreamResponse = await streamRoute.handler(
      streamRequest("session-1", TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      secondStreamFake.args,
    );
    expect(secondStreamResponse.status).toBe(200);
    expect(secondStreamFake.getEventStreamMock).toHaveBeenCalledTimes(1);

    expect(storeState.rows.size).toBe(1);
    expect(storeState.rows.get("session-1")).toMatchObject({
      session_id: "session-1",
      tenant_id: TENANT_A,
      owner_actor_id: USER_P,
      owner_profile_id: PROFILE_P,
      identity_mode: "admin",
    });
  });

  describe("Test 2: nobody else at any moment", () => {
    const unauthorizedCallers = [
      {
        label: "Q (another admin of A)",
        token: TOKEN_Q,
        scope: { tenant: TENANT_A, assignment: ROW_Q_ADMIN_A },
        expectedStatus: 403,
        expectedError: "The current admin does not own this Eve session.",
      },
      {
        label: "R (admin of B)",
        token: TOKEN_R,
        scope: { tenant: TENANT_B, assignment: ROW_R_ADMIN_B },
        expectedStatus: 403,
        expectedError: "The current admin does not own this Eve session.",
      },
      {
        label: "P naming the member-care row in A",
        token: TOKEN_P,
        scope: { tenant: TENANT_A, assignment: ROW_P_MEMBER_CARE_A },
        expectedStatus: 403,
        expectedError: "The current admin does not own this Eve session.",
      },
      {
        label: "P naming Q's row",
        token: TOKEN_P,
        scope: { tenant: TENANT_A, assignment: ROW_Q_ADMIN_A },
        expectedStatus: 401,
        expectedError: "A verified admin session is required.",
      },
      {
        label: "signed-out caller",
        token: null,
        scope: {},
        expectedStatus: 401,
        expectedError: "A verified admin session is required.",
      },
    ] as const;

    async function probeAllUnauthorized() {
      const observations: Array<{
        caller: string;
        route: string;
        status: number;
        error: string;
      }> = [];

      for (const caller of unauthorizedCallers) {
        const streamFake = createFakeArgs({
          params: { sessionId: "session-1" },
        });
        const streamRes = await streamRoute.handler(
          streamRequest("session-1", caller.token, caller.scope),
          streamFake.args,
        );
        const streamJson = (await streamRes.json()) as { error: string };
        expect(streamFake.getEventStreamMock).not.toHaveBeenCalled();
        expect(streamRes.status, `${caller.label} stream`).toBe(
          caller.expectedStatus,
        );
        expect(streamJson.error, `${caller.label} stream`).toBe(
          caller.expectedError,
        );
        observations.push({
          caller: caller.label,
          route: "stream",
          status: streamRes.status,
          error: streamJson.error,
        });

        const followUpFake = createFakeArgs({
          params: { sessionId: "session-1" },
        });
        const followUpRes = await continueRoute.handler(
          followUpRequest("session-1", caller.token, caller.scope),
          followUpFake.args,
        );
        const followUpJson = (await followUpRes.json()) as { error: string };
        expect(followUpFake.send).not.toHaveBeenCalled();
        expect(followUpFake.getEventStreamMock).not.toHaveBeenCalled();
        expect(followUpRes.status, `${caller.label} follow-up`).toBe(
          caller.expectedStatus,
        );
        expect(followUpJson.error, `${caller.label} follow-up`).toBe(
          caller.expectedError,
        );
        observations.push({
          caller: caller.label,
          route: "follow-up",
          status: followUpRes.status,
          error: followUpJson.error,
        });

        const cancelFake = createFakeArgs({
          params: { sessionId: "session-1" },
        });
        const cancelRes = await cancelRoute.handler(
          cancelRequest("session-1", caller.token, caller.scope),
          cancelFake.args,
        );
        const cancelJson = (await cancelRes.json()) as { error: string };
        expect(cancelFake.getEventStreamMock).not.toHaveBeenCalled();
        expect(cancelRes.status, `${caller.label} cancel`).toBe(
          caller.expectedStatus,
        );
        expect(cancelJson.error, `${caller.label} cancel`).toBe(
          caller.expectedError,
        );
        observations.push({
          caller: caller.label,
          route: "cancel",
          status: cancelRes.status,
          error: cancelJson.error,
        });
      }

      return observations;
    }

    it("refuses every unauthorized caller with identical status and error text at moments (a), (b), and (c)", async () => {
      let momentA: Awaited<ReturnType<typeof probeAllUnauthorized>> = [];
      const createFake = createFakeArgs({
        async onSend(_input, sendOptions) {
          momentA = await probeAllUnauthorized();
          return createFake.makeSession(
            "session-1",
            sendOptions.continuationToken,
          );
        },
      });

      const createResponse = await createRoute.handler(
        createSessionRequest(TOKEN_P, {
          tenant: TENANT_A,
          assignment: ROW_P_ADMIN_A,
        }),
        createFake.args,
      );
      expect(createResponse.status).toBe(202);
      const sentAuth = createFake.sendCalls[0]!.options
        .auth as EveSessionAuthSnapshot | null;

      const momentB = await probeAllUnauthorized();

      await invokeTurnStarted("session-1", sentAuth);
      const momentC = await probeAllUnauthorized();

      expect(momentA).toHaveLength(unauthorizedCallers.length * 3);
      expect(momentB).toEqual(momentA);
      expect(momentC).toEqual(momentA);
    });

    it("keeps P's ownership row intact at moment (b) before turn.started and at moment (c) after turn.started", async () => {
      const createFake = createFakeArgs({});
      const createResponse = await createRoute.handler(
        createSessionRequest(TOKEN_P, {
          tenant: TENANT_A,
          assignment: ROW_P_ADMIN_A,
        }),
        createFake.args,
      );
      expect(createResponse.status).toBe(202);
      const sentAuth = createFake.sendCalls[0]!.options
        .auth as EveSessionAuthSnapshot | null;

      await probeAllUnauthorized();
      expect(storeState.rows.get("session-1")).toMatchObject({
        session_id: "session-1",
        tenant_id: TENANT_A,
        owner_actor_id: USER_P,
        owner_profile_id: PROFILE_P,
      });

      await invokeTurnStarted("session-1", sentAuth);
      await probeAllUnauthorized();
      expect(storeState.rows.get("session-1")).toMatchObject({
        session_id: "session-1",
        tenant_id: TENANT_A,
        owner_actor_id: USER_P,
        owner_profile_id: PROFILE_P,
      });
      expect(storeState.rows.size).toBe(1);
    });
  });

  it("Test 3: refuses a second claim by Q directly and via turn.started, leaving P's row unchanged", async () => {
    const createFake = createFakeArgs({});
    const createResponse = await createRoute.handler(
      createSessionRequest(TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      createFake.args,
    );
    expect(createResponse.status).toBe(202);

    const rowBefore = { ...storeState.rows.get("session-1") };

    await expect(
      claimEveSessionFromAuthSnapshot({
        auth: snapshotFor("Q"),
        sessionId: "session-1",
      }),
    ).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiHttpError && error.status === 403,
    );

    await expect(
      invokeTurnStarted("session-1", snapshotFor("Q")),
    ).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiHttpError && error.status === 403,
    );

    expect(storeState.rows.get("session-1")).toEqual(rowBefore);
    expect(storeState.rows.get("session-1")).toMatchObject({
      tenant_id: TENANT_A,
      owner_actor_id: USER_P,
      owner_profile_id: PROFILE_P,
    });
  });

  it("Test 4: succeeds idempotently when turn.started for P wins the race inside send", async () => {
    const createFake = createFakeArgs({
      async onSend(_input, sendOptions) {
        await invokeTurnStarted(
          "session-1",
          sendOptions.auth as EveSessionAuthSnapshot | null,
        );
        return createFake.makeSession(
          "session-1",
          sendOptions.continuationToken,
        );
      },
    });

    const createResponse = await createRoute.handler(
      createSessionRequest(TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      createFake.args,
    );
    expect(createResponse.status).toBe(202);
    expect(storeState.rows.size).toBe(1);
    expect(storeState.rows.get("session-1")).toMatchObject({
      session_id: "session-1",
      tenant_id: TENANT_A,
      owner_actor_id: USER_P,
      owner_profile_id: PROFILE_P,
    });

    const streamFake = createFakeArgs({ params: { sessionId: "session-1" } });
    const streamResponse = await streamRoute.handler(
      streamRequest("session-1", TOKEN_P, {
        tenant: TENANT_A,
        assignment: ROW_P_ADMIN_A,
      }),
      streamFake.args,
    );
    expect(streamResponse.status).toBe(200);
    expect(streamFake.getEventStreamMock).toHaveBeenCalledTimes(1);
  });

  describe("Test 5: a failed claim on POST /eve/v1/session rejects and returns no id", () => {
    it("(a) rejects on a non-23505 insert error, and a later turn.started for P resolves once the store recovers", async () => {
      storeState.insertError = {
        code: "08006",
        message: "database write failed",
      };
      const createFake = createFakeArgs({});

      await expect(
        createRoute.handler(
          createSessionRequest(TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          createFake.args,
        ),
      ).rejects.toThrow("database write failed");
      expect(storeState.rows.size).toBe(0);

      storeState.insertError = null;
      const sentAuth = createFake.sendCalls[0]!.options
        .auth as EveSessionAuthSnapshot | null;
      await expect(
        invokeTurnStarted("session-1", sentAuth),
      ).resolves.toBeUndefined();
      expect(storeState.rows.get("session-1")).toMatchObject({
        session_id: "session-1",
        tenant_id: TENANT_A,
        owner_actor_id: USER_P,
        owner_profile_id: PROFILE_P,
      });
    });

    it("(b) rejects with EveRouteAuthError status 503 when getAdminClient returns null, and a later turn.started for P resolves once restored", async () => {
      storeState.adminClientAvailable = false;
      const createFake = createFakeArgs({});

      await expect(
        createRoute.handler(
          createSessionRequest(TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          createFake.args,
        ),
      ).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof EveRouteAuthError && error.status === 503,
      );
      expect(storeState.rows.size).toBe(0);

      storeState.adminClientAvailable = true;
      const sentAuth = createFake.sendCalls[0]!.options
        .auth as EveSessionAuthSnapshot | null;
      await expect(
        invokeTurnStarted("session-1", sentAuth),
      ).resolves.toBeUndefined();
      expect(storeState.rows.get("session-1")).toMatchObject({
        session_id: "session-1",
        tenant_id: TENANT_A,
        owner_actor_id: USER_P,
        owner_profile_id: PROFILE_P,
      });
    });

    it("(c) rejects with status 403 when session-1 is already owned by Q and leaves Q's row unchanged", async () => {
      await claimEveSessionFromAuthSnapshot({
        auth: snapshotFor("Q"),
        sessionId: "session-1",
      });
      const qRowBefore = { ...storeState.rows.get("session-1") };
      const createFake = createFakeArgs({});

      await expect(
        createRoute.handler(
          createSessionRequest(TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          createFake.args,
        ),
      ).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof ApiHttpError && error.status === 403,
      );

      expect(storeState.rows.get("session-1")).toEqual(qRowBefore);
    });
  });

  describe("Test 6: the channel is eve's channel plus the wrapper", () => {
    it("Seam A: wraps only create and follow-up handlers, preserves all other handlers and channel properties, and forwards every arg except send", async () => {
      const infoHandler = vi.fn(async () => new Response("info"));
      const createHandler = vi.fn(async (_req: Request, args: RouteArgs) => {
        await args.send("hi", {
          auth: null,
          continuationToken: "eve:tok-a",
        });
        return new Response("created", { status: 202 });
      });
      const continueHandler = vi.fn(async (_req: Request, args: RouteArgs) => {
        await args.send("next", {
          auth: null,
          continuationToken: "eve:tok-a",
        });
        return new Response("continued", { status: 200 });
      });
      const cancelHandler = vi.fn(async () => new Response("cancelled"));
      const streamHandler = vi.fn(async () => new Response("stream"));

      const fakeAdapter = {
        kind: "defineChannel",
        "turn.started": vi.fn(),
      };
      const fakeCors = { origin: ["https://admin.example.test"] };
      const fakeReceive = vi.fn();

      const fakeBase = {
        __kind: "eve:channel" as const,
        adapter: fakeAdapter,
        cors: fakeCors,
        receive: fakeReceive,
        routes: [
          {
            transport: "http" as const,
            method: "GET" as const,
            path: "/eve/v1/info",
            handler: infoHandler,
          },
          {
            transport: "http" as const,
            method: "POST" as const,
            path: "/eve/v1/session",
            handler: createHandler,
          },
          {
            transport: "http" as const,
            method: "POST" as const,
            path: "/eve/v1/session/:sessionId",
            handler: continueHandler,
          },
          {
            transport: "http" as const,
            method: "POST" as const,
            path: "/eve/v1/session/:sessionId/cancel",
            handler: cancelHandler,
          },
          {
            transport: "http" as const,
            method: "GET" as const,
            path: "/eve/v1/session/:sessionId/stream",
            handler: streamHandler,
          },
        ],
      };

      const wrapped = withAdminSessionCreationClaim(fakeBase);

      expect(wrapped.__kind).toBe("eve:channel");
      expect(Reflect.get(wrapped, "adapter")).toBe(fakeAdapter);
      expect(wrapped.cors).toBe(fakeCors);
      expect(wrapped.receive).toBe(fakeReceive);

      expect(getHttpRoute(wrapped, "GET", "/eve/v1/info").handler).toBe(
        infoHandler,
      );
      expect(
        getHttpRoute(wrapped, "POST", "/eve/v1/session/:sessionId/cancel")
          .handler,
      ).toBe(cancelHandler);
      expect(
        getHttpRoute(wrapped, "GET", "/eve/v1/session/:sessionId/stream")
          .handler,
      ).toBe(streamHandler);

      const wrappedCreate = getHttpRoute(wrapped, "POST", "/eve/v1/session");
      const wrappedContinue = getHttpRoute(
        wrapped,
        "POST",
        "/eve/v1/session/:sessionId",
      );
      expect(wrappedCreate.handler).not.toBe(createHandler);
      expect(wrappedContinue.handler).not.toBe(continueHandler);

      const createReq = new Request(
        "https://admin.example.test/eve/v1/session",
        {
          method: "POST",
        },
      );
      const createFake = createFakeArgs({ params: {} });
      await wrappedCreate.handler(createReq, createFake.args);

      expect(createHandler).toHaveBeenCalledTimes(1);
      const [passedCreateReq, passedCreateArgs] = createHandler.mock.calls[0]!;
      expect(passedCreateReq).toBe(createReq);
      expect(passedCreateArgs.send).not.toBe(createFake.args.send);
      expect(passedCreateArgs.cancel).toBe(createFake.args.cancel);
      expect(passedCreateArgs.getSession).toBe(createFake.args.getSession);
      expect(passedCreateArgs.receive).toBe(createFake.args.receive);
      expect(passedCreateArgs.params).toBe(createFake.args.params);
      expect(passedCreateArgs.waitUntil).toBe(createFake.args.waitUntil);
      expect(passedCreateArgs.requestIp).toBe(createFake.args.requestIp);
      expect(createFake.send).toHaveBeenCalledTimes(1);

      const continueReq = new Request(
        "https://admin.example.test/eve/v1/session/session-1",
        { method: "POST" },
      );
      const continueFake = createFakeArgs({
        params: { sessionId: "session-1" },
      });
      await wrappedContinue.handler(continueReq, continueFake.args);

      expect(continueHandler).toHaveBeenCalledTimes(1);
      const [passedContinueReq, passedContinueArgs] =
        continueHandler.mock.calls[0]!;
      expect(passedContinueReq).toBe(continueReq);
      expect(passedContinueArgs.send).not.toBe(continueFake.args.send);
      expect(passedContinueArgs.cancel).toBe(continueFake.args.cancel);
      expect(passedContinueArgs.getSession).toBe(continueFake.args.getSession);
      expect(passedContinueArgs.receive).toBe(continueFake.args.receive);
      expect(passedContinueArgs.params).toBe(continueFake.args.params);
      expect(passedContinueArgs.waitUntil).toBe(continueFake.args.waitUntil);
      expect(passedContinueArgs.requestIp).toBe(continueFake.args.requestIp);
      expect(continueFake.send).toHaveBeenCalledTimes(1);
    });

    it("pin: exported eve channel has expected kind, five routes, and adapter turn.started handler", () => {
      expect(eveChannelDefault.__kind).toBe("eve:channel");
      expect(
        eveChannelDefault.routes.map((route) => [route.method, route.path]),
      ).toEqual([
        ["GET", "/eve/v1/info"],
        ["POST", "/eve/v1/session"],
        ["POST", "/eve/v1/session/:sessionId"],
        ["POST", "/eve/v1/session/:sessionId/cancel"],
        ["GET", "/eve/v1/session/:sessionId/stream"],
      ]);
      expect("adapter" in eveChannelDefault).toBe(true);
      const adapter = Reflect.get(eveChannelDefault, "adapter") as Record<
        string,
        unknown
      >;
      expect(typeof adapter["turn.started"]).toBe("function");
    });
  });

  it("Test 7: leaves the loopback eval path unchanged with no store call and no ownership row", async () => {
    process.argv = ["node", "eve", "eval"];
    const createFake = createFakeArgs({});

    const response = await createRoute.handler(
      createSessionRequest(null, {}, "http://127.0.0.1:3000/eve/v1/session"),
      createFake.args,
    );

    expect(response.status).toBe(202);
    expect(storeState.getAdminClientCalls).toBe(0);
    expect(storeState.insertCalls).toBe(0);
    expect(storeState.selectCalls).toBe(0);
    expect(storeState.rows.size).toBe(0);
  });

  describe("Test 8: sessions returned by POST /eve/v1/session/:sessionId", () => {
    beforeEach(async () => {
      await claimEveSessionFromAuthSnapshot({
        auth: snapshotFor("P"),
        sessionId: "session-1",
      });
    });

    it("claims session-2 for P before answering 200 when send returns a different id, serves P, and refuses Q", async () => {
      const followUpFake = createFakeArgs({
        params: { sessionId: "session-1" },
        async onSend(_input, sendOptions) {
          return followUpFake.makeSession(
            "session-2",
            sendOptions.continuationToken,
          );
        },
      });

      const response = await continueRoute.handler(
        followUpRequest("session-1", TOKEN_P, {
          tenant: TENANT_A,
          assignment: ROW_P_ADMIN_A,
        }),
        followUpFake.args,
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true,
        sessionId: "session-2",
      });
      expect(storeState.rows.get("session-2")).toMatchObject({
        session_id: "session-2",
        tenant_id: TENANT_A,
        owner_actor_id: USER_P,
        owner_profile_id: PROFILE_P,
      });

      const pStreamFake = createFakeArgs({
        params: { sessionId: "session-2" },
      });
      const pStreamRes = await streamRoute.handler(
        streamRequest("session-2", TOKEN_P, {
          tenant: TENANT_A,
          assignment: ROW_P_ADMIN_A,
        }),
        pStreamFake.args,
      );
      expect(pStreamRes.status).toBe(200);
      expect(pStreamFake.getEventStreamMock).toHaveBeenCalledTimes(1);

      const qStreamFake = createFakeArgs({
        params: { sessionId: "session-2" },
      });
      const qStreamRes = await streamRoute.handler(
        streamRequest("session-2", TOKEN_Q, {
          tenant: TENANT_A,
          assignment: ROW_Q_ADMIN_A,
        }),
        qStreamFake.args,
      );
      expect(qStreamRes.status).toBe(403);
      expect(qStreamFake.getEventStreamMock).not.toHaveBeenCalled();
    });

    it("rejects when send returns session-3 owned by R and leaves R's row unchanged", async () => {
      await claimEveSessionFromAuthSnapshot({
        auth: snapshotFor("R"),
        sessionId: "session-3",
      });
      const rRowBefore = { ...storeState.rows.get("session-3") };

      const followUpFake = createFakeArgs({
        params: { sessionId: "session-1" },
        async onSend(_input, sendOptions) {
          return followUpFake.makeSession(
            "session-3",
            sendOptions.continuationToken,
          );
        },
      });

      await expect(
        continueRoute.handler(
          followUpRequest("session-1", TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          followUpFake.args,
        ),
      ).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof ApiHttpError && error.status === 403,
      );
      expect(storeState.rows.get("session-3")).toEqual(rRowBefore);
    });

    it("rejects and writes no row when send returns session-2 and the insert fails", async () => {
      const followUpFake = createFakeArgs({
        params: { sessionId: "session-1" },
        async onSend(_input, sendOptions) {
          storeState.insertError = {
            code: "08006",
            message: "follow-up insert failed",
          };
          return followUpFake.makeSession(
            "session-2",
            sendOptions.continuationToken,
          );
        },
      });

      await expect(
        continueRoute.handler(
          followUpRequest("session-1", TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          followUpFake.args,
        ),
      ).rejects.toThrow("follow-up insert failed");
      expect(storeState.rows.has("session-2")).toBe(false);
    });

    it("rejects with EveRouteAuthError status 503 and writes no row when send returns session-2 and getAdminClient returns null", async () => {
      const followUpFake = createFakeArgs({
        params: { sessionId: "session-1" },
        async onSend(_input, sendOptions) {
          storeState.adminClientAvailable = false;
          return followUpFake.makeSession(
            "session-2",
            sendOptions.continuationToken,
          );
        },
      });

      await expect(
        continueRoute.handler(
          followUpRequest("session-1", TOKEN_P, {
            tenant: TENANT_A,
            assignment: ROW_P_ADMIN_A,
          }),
          followUpFake.args,
        ),
      ).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof EveRouteAuthError && error.status === 503,
      );
      expect(storeState.rows.has("session-2")).toBe(false);
    });

    it("pin: attempts no claim when send returns the same session-1 id", async () => {
      const insertsBefore = storeState.insertCalls;
      const followUpFake = createFakeArgs({
        params: { sessionId: "session-1" },
        async onSend(_input, sendOptions) {
          return followUpFake.makeSession(
            "session-1",
            sendOptions.continuationToken,
          );
        },
      });

      const response = await continueRoute.handler(
        followUpRequest("session-1", TOKEN_P, {
          tenant: TENANT_A,
          assignment: ROW_P_ADMIN_A,
        }),
        followUpFake.args,
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true,
        sessionId: "session-1",
      });
      expect(storeState.insertCalls).toBe(insertsBefore);
    });
  });
});
