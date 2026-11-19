import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

/**
 * Council on the joined release, JB1: the resolver's refusal of the tenant or
 * assignment a page proposed is one signal, the `x-asym-scope-refused`
 * response header, which the browser's own-API wrapper tells from any other
 * 401 or 403. The routes that answer an unauthenticated caller by hand,
 * rather than through the shared error response, carry it too; a 401 for any
 * other reason does not. The status and body stay as they were.
 */

const h = vi.hoisted(() => ({ auth: vi.fn() }));

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
          throw new Error(`service-key client used: ${String(key)}`);
        },
      },
    ),
    error: null,
  }),
}));
vi.mock("@asym/env", () => ({
  serverEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () =>
    new Proxy(
      {},
      {
        get: (_target, key) => {
          throw new Error(`session client used: ${String(key)}`);
        },
      },
    ),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const USER = "00000000-0000-4000-9000-0000000000c1";

/** A signed-in person whose page proposed a row the resolver refused. */
const REFUSED: AuthContext = {
  isAuthenticated: false,
  userId: USER,
  email: null,
  tenantId: null,
  role: null,
  memberships: [],
  assignment: null,
  assignmentDenial: "not_owned_or_inactive",
  scopeRefused: true,
  profileId: "00000000-0000-4000-8000-0000000000c9",
};
/** The same person, refused for a reason that is not the page's scope. */
const OTHERWISE: AuthContext = {
  ...REFUSED,
  assignmentDenial: "ambiguous",
  scopeRefused: false,
};

const request = (path: string, init: RequestInit = {}) =>
  new NextRequest(`http://localhost${path}`, init);

type Answer = () => Promise<Response>;

const answers: Array<[string, Answer]> = [
  [
    "Member Care's gate",
    async () => {
      const { requireMemberCareAccess } =
        await import("../../../../packages/api/src/admin/member-care/route-helpers");
      const result = await requireMemberCareAccess(
        request("/api/admin/member-care/dashboard"),
      );
      if (result.ok) throw new Error("expected a refusal");
      return result.response;
    },
  ],
  [
    "the Support Hub's gate",
    async () => {
      const { requireSupportHubAccess } =
        await import("../../../../packages/api/src/admin/support-hub/route-helpers");
      const result = await requireSupportHubAccess(
        request("/api/admin/support-hub/tickets"),
      );
      if (result.ok) throw new Error("expected a refusal");
      return result.response;
    },
  ],
  [
    "the CRM gate, through the shared error response",
    async () => {
      const { requireCrmAccess } =
        await import("../../../../packages/api/src/crm/auth/access");
      const { toErrorResponse } =
        await import("../../../../packages/api/src/shared/http-errors");
      try {
        requireCrmAccess(await h.auth(), {
          action: "read",
          resourceType: "contact",
        } as Parameters<typeof requireCrmAccess>[1]);
      } catch (error) {
        return toErrorResponse(error);
      }
      throw new Error("expected a refusal");
    },
  ],
  [
    "the reactions' context, through the shared error response",
    async () => {
      const { resolveReactionRouteContext } =
        await import("../../../../packages/api/src/posts/reaction-route-utils");
      const { toErrorResponse } =
        await import("../../../../packages/api/src/shared/http-errors");
      try {
        await resolveReactionRouteContext(
          await h.auth(),
          {} as Parameters<typeof resolveReactionRouteContext>[1],
          Promise.resolve({ postId: "11111111-2222-4333-8444-555555555555" }),
        );
      } catch (error) {
        return toErrorResponse(error);
      }
      throw new Error("expected a refusal");
    },
  ],
  [
    "the missionary metrics route",
    async () => {
      const { GET } =
        await import("../../../../packages/api/src/missionaries/metrics");
      return GET(request("/api/missionaries/m-1/metrics"), {
        params: Promise.resolve({ id: "m-1" }),
      });
    },
  ],
  [
    "the post edit route",
    async () => {
      const { PATCH } = await import("../../../../packages/api/src/posts/post");
      return PATCH(
        request("/api/posts/11111111-2222-4333-8444-555555555555", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: "<p>text</p>" }),
        }),
        {
          params: Promise.resolve({
            postId: "11111111-2222-4333-8444-555555555555",
          }),
        },
      );
    },
  ],
];

beforeEach(() => {
  h.auth.mockReset();
});

describe("a refused scope, answered by hand", () => {
  it.each(answers)(
    "%s marks it with x-asym-scope-refused, at 401 Unauthorized as before",
    async (_route, answer) => {
      h.auth.mockResolvedValue(REFUSED);

      const response = await answer();

      expect(response.status).toBe(401);
      expect(response.headers.get("x-asym-scope-refused")).toBe(
        "not_owned_or_inactive",
      );
      expect(await response.json()).toMatchObject({ error: "Unauthorized" });
    },
  );

  it.each(answers)(
    "%s leaves any other 401 unmarked",
    async (_route, answer) => {
      h.auth.mockResolvedValue(OTHERWISE);

      const response = await answer();

      expect(response.status).toBe(401);
      expect(response.headers.has("x-asym-scope-refused")).toBe(false);
    },
  );
});
