import { randomUUID } from "node:crypto";

import { POST as deleteMediaPost } from "@asym/api/cms/media/delete";
import { POST as finalizeMediaPost } from "@asym/api/cms/media/finalize";
import { POST as startMediaPost } from "@asym/api/cms/media/start";
import { GET as mediaGet } from "@asym/api/media/route";
import { ApiHttpError } from "@asym/api/shared/http-errors";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContext, AuthenticatedContext } from "@asym/auth/context";

const mocks = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  createRequestSessionClient: vi.fn(),
  issueSignedUpload: vi.fn(),
  finalizeMediaUpload: vi.fn(),
  readMediaVariant: vi.fn(),
  sessionGetUser: vi.fn(),
  sessionRpc: vi.fn(),
  requestScopeOf: vi.fn(),
  requireCapability: vi.fn(),
}));

vi.mock("@asym/lib/monitoring/sentry", () => ({ captureError: vi.fn() }));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    logRequired: vi.fn(),
    log: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", async (importOriginal) => {
  const original = await importOriginal<typeof import("@asym/auth/context")>();
  return {
    ...original,
    getAuthContext: mocks.getAuthContext,
    requestScopeOf: mocks.requestScopeOf,
    requireCapability: mocks.requireCapability,
  };
});

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../../../../packages/api/src/shared/request-session-client")
      >();
    return {
      ...original,
      createRequestSessionClient: mocks.createRequestSessionClient,
    };
  },
);

vi.mock("../../../../../packages/api/src/storage/media-store", () => ({
  issueSignedUpload: mocks.issueSignedUpload,
  finalizeMediaUpload: mocks.finalizeMediaUpload,
  readMediaVariant: mocks.readMediaVariant,
}));

const assignmentCapabilities = new Map<string, readonly string[]>();

function makeStaffAuth(
  tenantId: string,
  assignmentId: string,
  capabilities: readonly string[] = ["web_studio.edit"],
): AuthenticatedContext {
  const userId = randomUUID();
  assignmentCapabilities.set(assignmentId, capabilities);
  return {
    userId,
    email: "staff@example.test",
    tenantId,
    role: "admin",
    profileId: randomUUID(),
    isAuthenticated: true,
    memberships: [
      {
        tenantId,
        role: "staff",
        staffRole: "development",
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId,
      userId,
      tenantId,
      revision: "rev-1",
      membershipRole: "staff",
      staffRole: "development",
      isTenantAdmin: false,
    },
  };
}

describe("signed-in media GET route (/api/media/[assetId])", () => {
  const tenantA = randomUUID();
  const assignmentA = randomUUID();
  const assetId = randomUUID();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createRequestSessionClient.mockResolvedValue({
      auth: { getUser: mocks.sessionGetUser },
      rpc: mocks.sessionRpc,
    });
    mocks.requireCapability.mockImplementation(
      (ctx: AuthContext, capability: string) => {
        const caps = ctx.assignment
          ? (assignmentCapabilities.get(ctx.assignment.assignmentId) ?? [])
          : [];
        if (!caps.includes(capability)) {
          throw new Error(`Forbidden: missing capability ${capability}`);
        }
      },
    );
  });

  it("returns 401 with zero bytes for an anonymous request without calling the definer", async () => {
    mocks.sessionGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const response = await mediaGet(
      new NextRequest(`http://localhost:3000/api/media/${assetId}`),
      { params: Promise.resolve({ assetId }) },
    );

    expect(response.status).toBe(401);
    expect(await response.arrayBuffer()).toHaveProperty("byteLength", 0);
    expect(mocks.sessionRpc).not.toHaveBeenCalled();
    expect(mocks.readMediaVariant).not.toHaveBeenCalled();
  });

  it("returns 404 with zero bytes when resolve_staff_media_access returns empty (unknown, unready, foreign or no capability)", async () => {
    mocks.sessionGetUser.mockResolvedValue({
      data: { user: { id: randomUUID() } },
      error: null,
    });
    mocks.sessionRpc.mockResolvedValue({ data: [], error: null });

    const response = await mediaGet(
      new NextRequest(`http://localhost:3000/api/media/${assetId}`),
      { params: Promise.resolve({ assetId }) },
    );

    expect(response.status).toBe(404);
    expect(await response.arrayBuffer()).toHaveProperty("byteLength", 0);
    expect(mocks.sessionRpc).toHaveBeenCalledWith(
      "resolve_staff_media_access",
      { p_asset_id: assetId },
    );
    expect(mocks.getAuthContext).not.toHaveBeenCalled();
    expect(mocks.readMediaVariant).not.toHaveBeenCalled();
  });

  it("admits with no scope headers and no Web Studio cookie, passing resolved tenant and assignment to getAuthContext and streaming bounded variant headers", async () => {
    const authA = makeStaffAuth(tenantA, assignmentA);
    mocks.sessionGetUser.mockResolvedValue({
      data: { user: { id: authA.userId } },
      error: null,
    });
    mocks.sessionRpc.mockResolvedValue({
      data: [{ tenant_id: tenantA, assignment_id: assignmentA }],
      error: null,
    });
    mocks.getAuthContext.mockResolvedValue(authA);
    const bytes = Buffer.from([1, 2, 3, 4]);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(bytes.subarray(0, 2)));
        controller.enqueue(new Uint8Array(bytes.subarray(2)));
        controller.close();
      },
    });
    mocks.readMediaVariant.mockResolvedValue({
      notModified: false,
      stream,
      byteSize: bytes.byteLength,
      etag: '"abc123-w960"',
      mimeType: "image/webp",
      variant: "w960",
    });

    const req = new NextRequest(
      `http://localhost:3000/api/media/${assetId}?variant=w960`,
      {
        headers: {
          authorization: "Bearer test-jwt-token",
        },
      },
    );
    const response = await mediaGet(req, {
      params: Promise.resolve({ assetId }),
    });

    expect(mocks.sessionGetUser).toHaveBeenCalledWith("test-jwt-token");
    expect(mocks.getAuthContext).toHaveBeenCalledWith(req, {
      roleClass: "staff",
      expectedTenantId: tenantA,
      proposedAssignmentId: assignmentA,
    });
    expect(mocks.readMediaVariant).toHaveBeenCalledWith(authA, {
      assetId,
      variant: "w960",
      ifNoneMatch: null,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("private, no-cache");
    expect(response.headers.get("cache-control")).not.toMatch(
      /public|immutable/i,
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("etag")).toBe('"abc123-w960"');
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
  });

  it("answers 304 Not Modified on matching If-None-Match after fresh admission and refuses unknown/original variants with 404", async () => {
    const authA = makeStaffAuth(tenantA, assignmentA);
    mocks.sessionGetUser.mockResolvedValue({
      data: { user: { id: authA.userId } },
      error: null,
    });
    mocks.sessionRpc.mockResolvedValue({
      data: [{ tenant_id: tenantA, assignment_id: assignmentA }],
      error: null,
    });
    mocks.getAuthContext.mockResolvedValue(authA);
    mocks.readMediaVariant.mockResolvedValue({
      notModified: true,
      etag: '"abc123-w1600"',
      mimeType: "image/jpeg",
      variant: "w1600",
    });

    const cachedRes = await mediaGet(
      new NextRequest(`http://localhost:3000/api/media/${assetId}`, {
        headers: { "if-none-match": '"abc123-w1600"' },
      }),
      { params: Promise.resolve({ assetId }) },
    );
    expect(cachedRes.status).toBe(304);
    expect(cachedRes.headers.get("etag")).toBe('"abc123-w1600"');
    expect(cachedRes.headers.get("cache-control")).toBe("private, no-cache");
    expect(cachedRes.headers.get("x-content-type-options")).toBe("nosniff");

    const badVariantRes = await mediaGet(
      new NextRequest(
        `http://localhost:3000/api/media/${assetId}?variant=original`,
      ),
      { params: Promise.resolve({ assetId }) },
    );
    expect(badVariantRes.status).toBe(404);
    expect(await badVariantRes.arrayBuffer()).toHaveProperty("byteLength", 0);
  });

  it("refuses with 404 when resolved context lacks web_studio.edit", async () => {
    const authNoCap = makeStaffAuth(tenantA, assignmentA, [
      "admin.dashboard.access",
    ]);
    mocks.sessionGetUser.mockResolvedValue({
      data: { user: { id: authNoCap.userId } },
      error: null,
    });
    mocks.sessionRpc.mockResolvedValue({
      data: [{ tenant_id: tenantA, assignment_id: assignmentA }],
      error: null,
    });
    mocks.getAuthContext.mockResolvedValue(authNoCap);

    const response = await mediaGet(
      new NextRequest(`http://localhost:3000/api/media/${assetId}`),
      { params: Promise.resolve({ assetId }) },
    );
    expect(response.status).toBe(404);
    expect(mocks.readMediaVariant).not.toHaveBeenCalled();
  });
});

describe("JSON media command routes (/api/cms/media/{start,finalize,delete})", () => {
  const tenantA = randomUUID();
  const assignmentA = randomUUID();
  const assetId = randomUUID();

  beforeEach(() => {
    vi.clearAllMocks();
    const authA = makeStaffAuth(tenantA, assignmentA);
    mocks.getAuthContext.mockResolvedValue(authA);
    mocks.requestScopeOf.mockReturnValue({
      tenantId: tenantA,
      assignmentId: assignmentA,
    });
    mocks.createRequestSessionClient.mockResolvedValue({
      auth: { getUser: mocks.sessionGetUser },
      rpc: mocks.sessionRpc,
    });
    mocks.requireCapability.mockImplementation(
      (ctx: AuthContext, capability: string) => {
        const caps = ctx.assignment
          ? (assignmentCapabilities.get(ctx.assignment.assignmentId) ?? [])
          : [];
        if (!caps.includes(capability)) {
          throw new Error(`Forbidden: missing capability ${capability}`);
        }
      },
    );
  });

  it("start route calls start_media_upload on sessionClient with auth.tenantId then issueSignedUpload", async () => {
    mocks.sessionRpc.mockResolvedValue({
      data: {
        asset_id: assetId,
        tenant_id: tenantA,
        status: "uploading",
        staging_key: `tmp/${tenantA}/${assetId}`,
        declared_byte_size: 4096,
        declared_mime_type: "image/jpeg",
      },
      error: null,
    });
    mocks.issueSignedUpload.mockResolvedValue({
      assetId,
      stagingPath: `tmp/${tenantA}/${assetId}`,
      token: "signed-tok",
      signedUrl: "http://127.0.0.1:54321/storage/v1/upload/sign/cms-media/tmp",
    });

    const response = await startMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/start", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ byteSize: 4096, mimeType: "image/jpeg" }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      assetId,
      stagingPath: `tmp/${tenantA}/${assetId}`,
      token: "signed-tok",
      status: "uploading",
    });
    expect(mocks.sessionRpc).toHaveBeenCalledWith("start_media_upload", {
      p_tenant_id: tenantA,
      p_byte_size: 4096,
      p_mime_type: "image/jpeg",
    });
    expect(mocks.issueSignedUpload).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: tenantA }),
      { assetId },
    );
  });

  it("start route refuses non-JSON bodies (415) and rejects client-supplied tenantId (400)", async () => {
    const nonJson = await startMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/start", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "multipart/form-data; boundary=x",
        },
        body: "--x--",
      }),
    );
    expect(nonJson.status).toBe(415);

    const forgedTenant = await startMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/start", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          byteSize: 4096,
          mimeType: "image/jpeg",
          tenantId: randomUUID(),
        }),
      }),
    );
    expect(forgedTenant.status).toBe(400);
    expect(mocks.sessionRpc).not.toHaveBeenCalled();
  });

  it("finalize route calls finalizeMediaUpload with admitted auth and rejects non-JSON (415)", async () => {
    mocks.finalizeMediaUpload.mockResolvedValue({
      id: assetId,
      tenantId: tenantA,
      status: "ready",
      declaredByteSize: 4096,
      declaredMimeType: "image/jpeg",
      mimeType: "image/jpeg",
      contentHash: "a".repeat(64),
      masterKey: `${tenantA}/${"a".repeat(64)}`,
      variants: {},
      byteSize: 3800,
      width: 600,
      height: 400,
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      purgeAfter: null,
      purgedAt: null,
    });

    const response = await finalizeMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/finalize", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.asset.id).toBe(assetId);
    expect(body.asset.status).toBe("ready");
    expect(mocks.finalizeMediaUpload).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: tenantA }),
      { assetId },
    );

    mocks.finalizeMediaUpload.mockRejectedValueOnce(
      new ApiHttpError(404, "Media asset not found"),
    );
    const notFound = await finalizeMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/finalize", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      }),
    );
    expect(notFound.status).toBe(404);
  });

  it("delete route calls delete_media_asset on sessionClient with auth.tenantId and maps P0002 to 404", async () => {
    const deletedAt = "2026-11-23T10:00:00.000Z";
    const purgeAfter = "2026-12-28T10:00:00.000Z";
    mocks.sessionRpc.mockResolvedValueOnce({
      data: {
        asset_id: assetId,
        tenant_id: tenantA,
        status: "deleted",
        deleted_at: deletedAt,
        purge_after: purgeAfter,
        already_deleted: false,
        staging_queued: false,
      },
      error: null,
    });

    const response = await deleteMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/delete", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      assetId,
      status: "deleted",
      deletedAt,
      purgeAfter,
      alreadyDeleted: false,
      stagingQueued: false,
    });
    expect(mocks.sessionRpc).toHaveBeenCalledWith("delete_media_asset", {
      p_tenant_id: tenantA,
      p_asset_id: assetId,
    });

    mocks.sessionRpc.mockResolvedValueOnce({
      data: null,
      error: { code: "P0002", message: "media_delete: media asset not found" },
    });
    const missing = await deleteMediaPost(
      new NextRequest("http://localhost:3001/api/cms/media/delete", {
        method: "POST",
        headers: {
          authorization: "Bearer test-jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      }),
    );
    expect(missing.status).toBe(404);
  });

  it("refuses requests carrying no Supabase session with 401 across start, finalize and delete", async () => {
    for (const [handler, body] of [
      [startMediaPost, { byteSize: 1024, mimeType: "image/jpeg" }],
      [finalizeMediaPost, { assetId }],
      [deleteMediaPost, { assetId }],
    ] as const) {
      const res = await handler(
        new NextRequest("http://localhost:3001/api/cms/media/op", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      expect(res.status).toBe(401);
    }
  });

  it("refuses unauthenticated requests with 401 across start, finalize and delete", async () => {
    mocks.getAuthContext.mockResolvedValue({
      userId: null,
      email: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
      memberships: [],
    });

    for (const [handler, body] of [
      [startMediaPost, { byteSize: 1024, mimeType: "image/jpeg" }],
      [finalizeMediaPost, { assetId }],
      [deleteMediaPost, { assetId }],
    ] as const) {
      const res = await handler(
        new NextRequest("http://localhost:3001/api/cms/media/op", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      expect(res.status).toBe(401);
    }
  });
});

function applyProxyForwardedHeaders(
  originalRequest: NextRequest,
  proxyResponse: Response,
): NextRequest {
  const forwarded = new Headers(originalRequest.headers);
  const overrideList = proxyResponse.headers.get(
    "x-middleware-override-headers",
  );
  if (overrideList) {
    for (const name of overrideList.split(",")) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const value = proxyResponse.headers.get(
        `x-middleware-request-${trimmed}`,
      );
      if (value === null) {
        forwarded.delete(trimmed);
      } else {
        forwarded.set(trimmed, value);
      }
    }
  }
  return new NextRequest(originalRequest.url, {
    method: originalRequest.method,
    headers: forwarded,
  });
}

describe("surface proxy + /api/media/[assetId] route mount end-to-end", () => {
  const tenantA = randomUUID();
  const assignmentA = randomUUID();
  const assetId = randomUUID();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createRequestSessionClient.mockResolvedValue({
      auth: { getUser: mocks.sessionGetUser },
      rpc: mocks.sessionRpc,
    });
    mocks.requireCapability.mockImplementation(
      (ctx: AuthContext, capability: string) => {
        const caps = ctx.assignment
          ? (assignmentCapabilities.get(ctx.assignment.assignmentId) ?? [])
          : [];
        if (!caps.includes(capability)) {
          throw new Error(`Forbidden: missing capability ${capability}`);
        }
      },
    );
  });

  it("runs missionary, donor and admin proxies before their mounted /api/media/[assetId] handlers, denying missionary/donor sessions with 404 and admitting staff with 200", async () => {
    const [
      { proxy: missionaryProxy },
      { GET: missionaryMediaMount },
      { proxy: donorProxy },
      { GET: donorMediaMount },
      { proxy: adminProxy },
      { GET: adminMediaMount },
    ] = await Promise.all([
      import("../../../../../apps/missionary/proxy"),
      import("../../../../../apps/missionary/app/api/media/[assetId]/route"),
      import("../../../../../apps/donor/proxy"),
      import("../../../../../apps/donor/app/api/media/[assetId]/route"),
      import("../../../../../apps/admin/proxy"),
      import("../../../../../apps/admin/app/api/media/[assetId]/route"),
    ]);

    const surfaces = [
      {
        name: "missionary",
        origin: "http://localhost:3002",
        proxy: missionaryProxy,
        mount: missionaryMediaMount,
        expectedRoleHeader: "missionary",
      },
      {
        name: "donor",
        origin: "http://localhost:3000",
        proxy: donorProxy,
        mount: donorMediaMount,
        expectedRoleHeader: "donor",
      },
      {
        name: "admin",
        origin: "http://localhost:3001",
        proxy: adminProxy,
        mount: adminMediaMount,
        expectedRoleHeader: "staff",
      },
    ] as const;

    for (const surface of surfaces) {
      mocks.sessionGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      const anonIncoming = new NextRequest(
        `${surface.origin}/api/media/${assetId}`,
      );
      const anonProxyRes = await surface.proxy(anonIncoming);
      expect(anonProxyRes.headers.get("x-middleware-next"), surface.name).toBe(
        "1",
      );
      expect(
        anonProxyRes.headers.get("x-middleware-request-x-asym-role-class"),
        surface.name,
      ).toBe(surface.expectedRoleHeader);
      const anonMountRes = await surface.mount(
        applyProxyForwardedHeaders(anonIncoming, anonProxyRes),
        { params: Promise.resolve({ assetId }) },
      );
      expect(anonMountRes.status, `${surface.name}:anon`).toBe(401);
      expect(await anonMountRes.arrayBuffer()).toHaveProperty("byteLength", 0);

      mocks.sessionGetUser.mockResolvedValueOnce({
        data: { user: { id: randomUUID() } },
        error: null,
      });
      mocks.sessionRpc.mockResolvedValueOnce({ data: [], error: null });
      const nonStaffIncoming = new NextRequest(
        `${surface.origin}/api/media/${assetId}`,
        { headers: { authorization: "Bearer non-staff-jwt" } },
      );
      const nonStaffProxyRes = await surface.proxy(nonStaffIncoming);
      const nonStaffMountRes = await surface.mount(
        applyProxyForwardedHeaders(nonStaffIncoming, nonStaffProxyRes),
        { params: Promise.resolve({ assetId }) },
      );
      expect(nonStaffMountRes.status, `${surface.name}:non-staff`).toBe(404);
      expect(await nonStaffMountRes.arrayBuffer()).toHaveProperty(
        "byteLength",
        0,
      );

      const staffAuth = makeStaffAuth(tenantA, assignmentA);
      const payload = Buffer.from([7, 8, 9, 10]);
      mocks.sessionGetUser.mockResolvedValueOnce({
        data: { user: { id: staffAuth.userId } },
        error: null,
      });
      mocks.sessionRpc.mockResolvedValueOnce({
        data: [{ tenant_id: tenantA, assignment_id: assignmentA }],
        error: null,
      });
      mocks.getAuthContext.mockResolvedValueOnce(staffAuth);
      mocks.readMediaVariant.mockResolvedValueOnce({
        notModified: false,
        stream: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array(payload));
            controller.close();
          },
        }),
        byteSize: payload.byteLength,
        etag: '"staff-ok-w960"',
        mimeType: "image/jpeg",
        variant: "w960",
      });
      const staffIncoming = new NextRequest(
        `${surface.origin}/api/media/${assetId}`,
        { headers: { authorization: "Bearer staff-jwt" } },
      );
      const staffProxyRes = await surface.proxy(staffIncoming);
      const forwardedStaffReq = applyProxyForwardedHeaders(
        staffIncoming,
        staffProxyRes,
      );
      expect(
        forwardedStaffReq.headers.get("x-asym-role-class"),
        surface.name,
      ).toBe(surface.expectedRoleHeader);
      const staffMountRes = await surface.mount(forwardedStaffReq, {
        params: Promise.resolve({ assetId }),
      });
      expect(staffMountRes.status, `${surface.name}:staff`).toBe(200);
      expect(Buffer.from(await staffMountRes.arrayBuffer())).toEqual(payload);
    }
  });
});
