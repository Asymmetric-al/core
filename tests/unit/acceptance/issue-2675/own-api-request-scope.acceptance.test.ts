// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAME,
  type E2EAuthMembership,
} from "../../../../packages/auth/e2e-auth";

/**
 * WP2b acceptance (plan 12, WP2; AL-2675):
 * - "A person in two organizations can call the app's own API in each."
 * - "A forged header can at most select a tenant where the caller already
 *   holds a live membership: the server resolver refuses anything else",
 *   on an API route.
 *
 * The chain is real from the page to the resolver: a document with a scope,
 * `ownApiFetch`, and `getAuthContext` on the API request it sends. The
 * person is a signed fixture identity with a staff row in each fixture
 * tenant, as the end-to-end suites sign them in; the role class is the one
 * the admin proxy sets on every request.
 */

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => {
    throw new Error("an API request carries its own cookies");
  }),
  headers: vi.fn(async () => {
    throw new Error("an API request carries its own headers");
  }),
}));
vi.mock("@supabase/ssr", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@supabase/ssr")>()),
  // No Supabase session: the signed fixture identity is the caller.
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  }),
}));

const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
const FOREIGN = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const USER = "00000000-0000-4000-8000-0000000e2e30";
const IN_DEMO: E2EAuthMembership = {
  id: "00000000-0000-4000-8000-0000000e2e31",
  tenantId: DEMO,
  role: "staff",
  staffRole: "development",
  isTenantAdmin: false,
};
const IN_SECOND: E2EAuthMembership = {
  ...IN_DEMO,
  id: "00000000-0000-4000-8000-0000000e2e32",
  tenantId: SECOND,
};

const ENV_KEYS = [
  "E2E_AUTH_BYPASS",
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "E2E_AUTH_SECRET",
  "E2E_AUTH_ALLOWED_SUPABASE_REFS",
] as const;
const savedEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

let cookie = "";

beforeEach(async () => {
  Object.assign(process.env, {
    E2E_AUTH_BYPASS: "true",
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
    E2E_AUTH_SECRET: "request-scope-acceptance-secret",
    E2E_AUTH_ALLOWED_SUPABASE_REFS: "example",
  });
  cookie = `${E2E_AUTH_COOKIE_NAME}=${await createE2EAuthCookieValue({
    userId: USER,
    role: "staff",
    tenantId: DEMO,
    memberships: [IN_DEMO, IN_SECOND],
  })}`;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

/** The admin app's API, as the proxy hands it a request: role class set. */
async function serve(path: string, headers: HeadersInit = {}) {
  const { getAuthContext } = await import("../../../../packages/auth/context");
  const request = new Request(`http://localhost:3030${path}`, {
    headers: {
      ...Object.fromEntries(new Headers(headers)),
      cookie,
      "x-asym-role-class": "staff",
    },
  });
  const auth = await getAuthContext(request);
  return {
    isAuthenticated: auth.isAuthenticated,
    tenantId: auth.tenantId,
    assignmentId: auth.assignment?.assignmentId ?? null,
    denial: auth.assignmentDenial ?? null,
  };
}

/** A new page document, with the scope its layout rendered, if any. */
async function loadDocument(
  scope: { tenantId: string; assignmentId: string } | null,
) {
  cleanup();
  vi.resetModules();
  vi.stubGlobal("fetch", async (path: string, init: RequestInit = {}) =>
    Response.json(await serve(path, init.headers)),
  );
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  // A scope is valid only inside its segment (council round 1, A8 and SB2), so
  // the page is at an address in it, as a signed-in page is.
  window.history.replaceState(
    null,
    "",
    scope ? `/${scope.tenantId}/care/directory` : "/",
  );
  if (scope) {
    render(
      createElement(
        DocumentScopeProvider,
        {
          scope: {
            userId: USER,
            ...scope,
            addressPrefix: `/${scope.tenantId}`,
          },
        },
        null,
      ),
    );
  }
  return import("../../../../packages/database/own-api");
}

describe("a person in two organizations calls the app's own API", () => {
  it.each([
    ["the demo organization", IN_DEMO],
    ["the second organization", IN_SECOND],
  ])("from a page in %s, under that page's assignment", async (_label, row) => {
    const { ownApiFetch } = await loadDocument({
      tenantId: row.tenantId,
      assignmentId: row.id,
    });

    const resolved = await (await ownApiFetch("/api/admin/funds")).json();

    expect(resolved).toEqual({
      isAuthenticated: true,
      tenantId: row.tenantId,
      assignmentId: row.id,
      denial: null,
    });
  });

  it("is refused from a document with no scope, because the resolver never guesses", async () => {
    const { ownApiFetch } = await loadDocument(null);

    const resolved = await (await ownApiFetch("/api/admin/funds")).json();

    expect(resolved).toMatchObject({
      isAuthenticated: false,
      tenantId: null,
      assignmentId: null,
    });
  });
});

describe("a forged header on an API route selects nothing the caller does not hold", () => {
  it.each([
    ["a tenant the caller has no row in", { "x-asym-tenant": FOREIGN }],
    [
      "an assignment that is not one of the caller's rows",
      {
        "x-asym-tenant": DEMO,
        "x-asym-assignment": "00000000-0000-4000-8000-0000000e2e99",
      },
    ],
    [
      "the caller's own row of another tenant",
      { "x-asym-tenant": DEMO, "x-asym-assignment": IN_SECOND.id },
    ],
  ])("refuses %s", async (_label, headers) => {
    const resolved = await serve("/api/admin/funds", headers);
    expect(resolved.isAuthenticated).toBe(false);
    expect(resolved.tenantId).toBeNull();
    expect(resolved.assignmentId).toBeNull();
  });

  it("admits a header that names a tenant where the caller holds a live row", async () => {
    await expect(
      serve("/api/admin/funds", { "x-asym-tenant": SECOND }),
    ).resolves.toEqual({
      isAuthenticated: true,
      tenantId: SECOND,
      assignmentId: IN_SECOND.id,
      denial: null,
    });
  });
});
