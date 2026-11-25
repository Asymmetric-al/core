import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  getAdminClient: vi.fn(),
  resolveTenantStripe: vi.fn(),
  touched: [] as string[],
  drafts: [] as Array<[string, unknown]>,
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock(import("@asym/auth/context"), async (importOriginal) => ({
  ...(await importOriginal()),
  getAuthContext: h.getAuthContext,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: h.getAdminClient,
}));
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: h.resolveTenantStripe,
}));
vi.mock("@asym/database/supabase/post-interactions", () => ({
  fetchUserPostInteractions: vi.fn(async () => []),
  toUserPostInteractionSets: () => ({
    likedPostIds: new Set(),
    prayedPostIds: new Set(),
    firedPostIds: new Set(),
  }),
}));

import { POST as donatePOST } from "../../../../packages/api/src/donate";
import {
  GET as donationsGET,
  POST as donationsPOST,
} from "../../../../packages/api/src/donations";
import { GET as postsGET } from "../../../../packages/api/src/posts/index";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const TENANT = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const PROFILE = "00000000-0000-4000-8000-0000000000aa";

type RoleClass = "donor" | "missionary" | "staff";

function context(roleClass: RoleClass) {
  return {
    isAuthenticated: true,
    userId: `user-${roleClass}`,
    email: null,
    tenantId: TENANT,
    role: roleClass,
    profileId: PROFILE,
    memberships: [
      {
        tenantId: TENANT,
        role: roleClass,
        staffRole: roleClass === "staff" ? "development" : null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: "00000000-0000-4000-8000-0000000000b1",
      userId: `user-${roleClass}`,
      tenantId: TENANT,
      revision: "r1",
      membershipRole: roleClass,
      staffRole: roleClass === "staff" ? "development" : null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
  };
}

function throwingClient() {
  return new Proxy(
    {},
    {
      get(_target, property) {
        h.touched.push(`client.${String(property)}`);
        throw new Error("the service-key client was used");
      },
    },
  );
}

function postsClient() {
  const query: Record<string, unknown> = {};
  for (const name of ["select", "order", "range", "or"]) {
    query[name] = vi.fn(() => query);
  }
  query.eq = vi.fn((column: string, value: unknown) => {
    h.drafts.push([column, value]);
    return query;
  });
  query.then = (resolve: (value: unknown) => unknown) =>
    resolve({ data: [], error: null });
  return { from: vi.fn(() => query) };
}

function watchedRequest(url: string, method = "POST") {
  const request = new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", cookie: "sb-a=b" },
    ...(method === "GET" ? {} : { body: "{}" }),
  });
  for (const reader of ["text", "json", "arrayBuffer", "blob", "formData"]) {
    Object.defineProperty(request, reader, {
      value: () => {
        h.touched.push(`body.${reader}`);
        throw new Error("the body was read");
      },
    });
  }
  return request;
}

beforeEach(() => {
  h.touched.length = 0;
  h.drafts.length = 0;
  h.getAdminClient.mockReset();
  h.getAdminClient.mockImplementation(() => ({
    client: throwingClient(),
    error: null,
  }));
  h.resolveTenantStripe.mockReset();
  h.resolveTenantStripe.mockImplementation(async () => {
    h.touched.push("stripe");
    throw new Error("Stripe was called");
  });
  h.getAuthContext.mockReset();
});

function reExports(path: string): string {
  return readFileSync(`${root}${path}`, "utf8").trim();
}

describe("AL-2676 (record row WP2c, WP3): the donor app mounts only what a donor membership can pass", () => {
  it("POST /api/donate refuses a staff-only membership with 403 before any body read, Stripe call or service-key use", async () => {
    h.getAuthContext.mockResolvedValue(context("staff"));
    const response = await donatePOST(
      watchedRequest("http://localhost:3000/api/donate"),
    );
    expect(response.status).toBe(403);
    expect(JSON.stringify(await response.json())).toContain(
      "requires a donor membership",
    );
    expect(h.touched).toEqual([]);
  });

  it.each([
    [
      "GET",
      () =>
        donationsGET(
          watchedRequest("http://localhost:3000/api/donations", "GET"),
        ),
    ],
    [
      "POST",
      () =>
        donationsPOST(watchedRequest("http://localhost:3000/api/donations")),
    ],
  ] as const)(
    "%s /api/donations refuses a staff-only membership with 403 'requires a donor membership' before any read",
    async (_method, call) => {
      h.getAuthContext.mockResolvedValue(context("staff"));
      const response = await call();
      expect(response.status).toBe(403);
      expect(JSON.stringify(await response.json())).toContain(
        "requires a donor membership",
      );
      expect(h.touched).toEqual([]);
    },
  );

  it("the donor app re-exports only GET for /api/posts and mounts no /api/posts/[postId] route; the missionary app keeps both", () => {
    expect(reExports("apps/donor/app/api/posts/route.ts")).toBe(
      'export { GET } from "@asym/api/posts";',
    );
    expect(
      existsSync(`${root}apps/donor/app/api/posts/[postId]/route.ts`),
    ).toBe(false);
    expect(reExports("apps/missionary/app/api/posts/route.ts")).toBe(
      'export { GET, POST } from "@asym/api/posts";',
    );
    expect(reExports("apps/missionary/app/api/posts/[postId]/route.ts")).toBe(
      'export { PATCH, DELETE } from "@asym/api/posts/post";',
    );
  });

  it("GET /api/posts?status=draft refuses a staff-only membership with 403", async () => {
    h.getAdminClient.mockImplementation(() => ({
      client: postsClient(),
      error: null,
    }));
    h.getAuthContext.mockResolvedValue(context("staff"));
    const response = await postsGET(
      new NextRequest("http://localhost:3000/api/posts?status=draft"),
    );
    expect(response.status).toBe(403);
  });

  it.each([
    [
      "POST /api/donate",
      () => donatePOST(watchedRequest("http://localhost:3000/api/donate")),
    ],
    [
      "GET /api/donations",
      () =>
        donationsGET(
          watchedRequest("http://localhost:3000/api/donations", "GET"),
        ),
    ],
    [
      "POST /api/donations",
      () =>
        donationsPOST(watchedRequest("http://localhost:3000/api/donations")),
    ],
  ] as const)(
    "guard: a donor membership passes the gate of %s",
    async (_route, call) => {
      h.getAuthContext.mockResolvedValue(context("donor"));
      const response = await call();
      expect([401, 403]).not.toContain(response.status);
      expect(h.touched.length).toBeGreaterThan(0);
    },
  );

  it("guard: a missionary reads its own drafts", async () => {
    h.getAdminClient.mockImplementation(() => ({
      client: postsClient(),
      error: null,
    }));
    h.getAuthContext.mockResolvedValue(context("missionary"));
    const response = await postsGET(
      new NextRequest("http://localhost:4000/api/posts?status=draft"),
    );
    expect(response.status).toBe(200);
    expect(h.drafts).toContainEqual(["missionary_id", PROFILE]);
  });

  it("guard: a donor asking for drafts gets 403", async () => {
    h.getAdminClient.mockImplementation(() => ({
      client: postsClient(),
      error: null,
    }));
    h.getAuthContext.mockResolvedValue(context("donor"));
    const response = await postsGET(
      new NextRequest("http://localhost:3000/api/posts?status=draft"),
    );
    expect(response.status).toBe(403);
  });
});
