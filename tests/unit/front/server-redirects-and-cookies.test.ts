import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const ROW_A = "00000000-0000-4000-8000-0000000000a1";

const state = vi.hoisted(() => ({
  requestHeaders: new Headers(),
  setCookies: [] as Array<Record<string, unknown>>,
  signedIn: {} as unknown,
}));

class RedirectThrown extends Error {
  constructor(
    public readonly target: string,
    public readonly permanent: boolean = false,
  ) {
    super(`NEXT_REDIRECT:${target}`);
  }
}

vi.mock("next/headers", () => ({
  headers: async () => state.requestHeaders,
  cookies: async () => ({
    set: (cookie: Record<string, unknown>) => state.setCookies.push(cookie),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectThrown(target, false);
  },
  permanentRedirect: (target: string) => {
    throw new RedirectThrown(target, true);
  },
}));

vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));

const { redirectInTenant, permanentRedirectInTenant } =
  await import("../../../packages/auth/tenant-server");
const { chooseWebStudioOrganization } =
  await import("../../../apps/admin/app/(auth)/web-studio/organization/actions");
const { isSameOriginWrite, sameOriginWrites, CROSS_ORIGIN_WRITE_MESSAGE } =
  await import("../../../apps/admin/src/cms/web-studio-api-route");
const { POST: sharedSignOut } =
  await import("../../../packages/api/src/auth/signout");
const { POST: adminSignOut } = await import("../../../apps/admin/lib/sign-out");
const { webStudioCookie, clearedWebStudioCookie, WEB_STUDIO_TENANT_COOKIE } =
  await import("../../../packages/auth/web-studio");
const { requestOrigin, trustedMutationSource } =
  await import("../../../packages/auth/request-headers");

const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  state.requestHeaders = new Headers();
  state.setCookies = [];
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments: [
      {
        assignmentId: ROW_A,
        userId: USER,
        tenantId: TA,
        revision: "r",
        membershipRole: "staff",
        staffRole: "development",
        isTenantAdmin: false,
      },
    ],
    organizationNames: new Map(),
  };
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("E2E_AUTH_BYPASS", "false");
  global.fetch = vi.fn(async () => new Response("", { status: 204 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  global.fetch = ORIGINAL_FETCH;
});

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

async function catchRedirect(fn: () => Promise<never>): Promise<string> {
  try {
    await fn();
  } catch (err) {
    if (err instanceof RedirectThrown) return err.target;
    throw err;
  }
  throw new Error("expected redirect");
}

describe("Item 6b: server redirects (Server Component, JS action, no-JS MPA action)", () => {
  it("keeps Server Component redirectInTenant and permanentRedirectInTenant app-relative so Next never doubles basePath (D-18, N2 part 2b: on, the proxy's prefix is /~finance, without the ID)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    state.requestHeaders = new Headers({
      "x-asym-address-prefix": "/~finance",
    });

    expect(await catchRedirect(() => redirectInTenant("/crm"))).toBe(
      "/~finance/crm",
    );
    expect(await catchRedirect(() => permanentRedirectInTenant("/crm"))).toBe(
      "/~finance/crm",
    );
  });

  it("prefixes Web Studio organization action redirects ONLY for no-JS MPA POSTs when on, never doubling JS fetch actions (D-18, N2 part 1: on, the proxy sets the verified name the action now reads)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");

    state.requestHeaders = new Headers({
      "next-action": "action-hash-123",
      "x-asym-name-tenant": TA,
    });
    const jsTarget = await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({
          tenant: TA,
          assignment: ROW_A,
          next: "/web-studio/collections/pages",
        }),
      ),
    );
    expect(jsTarget).toBe("/web-studio/collections/pages");
    expect(state.setCookies[0]?.path).toBe("/admin/web-studio");

    state.setCookies = [];
    state.requestHeaders = new Headers({ "x-asym-name-tenant": TA });
    const mpaTarget = await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({
          tenant: TA,
          assignment: ROW_A,
          next: "/web-studio/collections/pages",
        }),
      ),
    );
    expect(mpaTarget).toBe("/admin/web-studio/collections/pages");
    expect(state.setCookies[0]?.path).toBe("/admin/web-studio");

    state.signedIn = { kind: "signed_out" };
    const mpaSignedOut = await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({ tenant: TA, assignment: ROW_A, next: "/web-studio" }),
      ),
    );
    expect(mpaSignedOut).toBe(
      `/admin/login?next=${encodeURIComponent("/web-studio/organization?next=%2Fweb-studio")}`,
    );

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    state.signedIn = {
      kind: "signed_in",
      userId: USER,
      assignments: [
        {
          assignmentId: ROW_A,
          userId: USER,
          tenantId: TA,
          revision: "r",
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: false,
        },
      ],
      organizationNames: new Map(),
    };
    state.setCookies = [];
    const offMpaTarget = await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({
          tenant: TA,
          assignment: ROW_A,
          next: "/web-studio/collections/pages",
        }),
      ),
    );
    expect(offMpaTarget).toBe("/web-studio/collections/pages");
    expect(state.setCookies[0]?.path).toBe("/web-studio");
  });
});

describe("WP7 item zero (#2839, 27 November 09:54): the organization choice marks the browser when it completes", () => {
  const marks = () =>
    state.setCookies.filter((cookie) => cookie.name === "asym_clipboard_reset");

  it("sets the identifier-free mark beside the organization's cookie, on and off, scripted or not", async () => {
    for (const on of [true, false]) {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", on ? "1" : "0");
      vi.stubEnv("CORE_APP_BASE_PATH", on ? "/admin" : "");
      for (const headers of [
        { "next-action": "action-hash-123", "x-asym-name-tenant": TA },
        { "x-asym-name-tenant": TA },
      ]) {
        state.requestHeaders = new Headers(headers);
        state.setCookies = [];
        await catchRedirect(() =>
          chooseWebStudioOrganization(
            form({ tenant: TA, assignment: ROW_A, next: "/web-studio" }),
          ),
        );
        expect(state.setCookies[0]?.name).toBe(WEB_STUDIO_TENANT_COOKIE);
        expect(marks()).toEqual([
          expect.objectContaining({ value: "1", path: "/" }),
        ]);
      }
    }
  });

  it("sets no mark when the choice is refused or the person is signed out", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    state.requestHeaders = new Headers({ "x-asym-name-tenant": TA });
    await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({ tenant: TA, assignment: "not-a-row", next: "/web-studio" }),
      ),
    );
    state.signedIn = { kind: "signed_out" };
    await catchRedirect(() =>
      chooseWebStudioOrganization(
        form({ tenant: TA, assignment: ROW_A, next: "/web-studio" }),
      ),
    );
    expect(marks()).toEqual([]);
  });
});

describe("Item 6h: Web Studio API and sign-out origin checks use requestOrigin without request.url fallback", () => {
  it("judges Web Studio writes against the Host-derived origin and refuses foreign or invalid Host", async () => {
    const stampedSame = new Request(
      "https://admin-internal.example.test/admin/web-studio/api/pages",
      {
        method: "POST",
        headers: {
          host: "one.example.test",
          "x-asym-front-origin": "https://one.example.test",
          origin: "https://one.example.test",
        },
      },
    );
    expect(isSameOriginWrite(stampedSame)).toBe(true);

    const localHttpSame = new Request(
      "http://localhost:25051/admin/web-studio/api/pages",
      {
        method: "POST",
        headers: {
          host: "one.n3.test:25050",
          origin: "http://one.n3.test:25050",
        },
      },
    );
    expect(isSameOriginWrite(localHttpSame)).toBe(true);

    const stampedForeign = new Request(
      "https://admin-internal.example.test/admin/web-studio/api/pages",
      {
        method: "POST",
        headers: {
          host: "one.example.test",
          "x-asym-front-origin": "https://one.example.test",
          origin: "https://two.example.test",
        },
      },
    );
    expect(isSameOriginWrite(stampedForeign)).toBe(false);

    const handler = sameOriginWrites(async () => new Response("ok"));
    const refused = await handler(stampedForeign, {});
    expect(refused.status).toBe(403);
    expect(await refused.json()).toEqual({
      errors: [{ message: CROSS_ORIGIN_WRITE_MESSAGE }],
    });

    const invalidHost = new Request(
      "http://localhost:3030/web-studio/api/pages",
      {
        method: "POST",
        headers: {
          host: "bad host/evil",
          origin: "http://localhost:3030",
        },
      },
    );
    expect(isSameOriginWrite(invalidHost)).toBe(false);
  });

  it("judges sign-out against requestOrigin and refuses foreign or invalid Host", async () => {
    const stampedOk = await sharedSignOut(
      new Request(
        "https://admin-internal.example.test/admin/api/auth/signout",
        {
          method: "POST",
          headers: {
            host: "one.example.test",
            "x-asym-front-origin": "https://one.example.test",
            origin: "https://one.example.test",
          },
        },
      ),
    );
    expect(stampedOk.status).toBe(200);

    const stampedForeign = await sharedSignOut(
      new Request(
        "https://admin-internal.example.test/admin/api/auth/signout",
        {
          method: "POST",
          headers: {
            host: "one.example.test",
            "x-asym-front-origin": "https://one.example.test",
            origin: "https://two.example.test",
          },
        },
      ),
    );
    expect(stampedForeign.status).toBe(403);

    const invalidHost = await sharedSignOut(
      new Request("http://localhost:3030/api/auth/signout", {
        method: "POST",
        headers: {
          host: "bad host/evil",
          origin: "http://localhost:3030",
        },
      }),
    );
    expect(invalidHost.status).toBe(403);
  });

  it("ignores a forged x-asym-front-origin header when switch is OFF and derives origin from Host", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    const forged = new Request("https://admin.example.test/api/auth/signout", {
      method: "POST",
      headers: {
        host: "admin.example.test",
        origin: "https://evil.example",
        "x-asym-front-origin": "https://evil.example",
      },
    });
    expect(requestOrigin(forged)).toBe("https://admin.example.test");
    expect(trustedMutationSource(forged)).toBe(false);
    expect(isSameOriginWrite(forged)).toBe(false);
    expect((await sharedSignOut(forged)).status).toBe(403);
  });
});

describe("Item 7: Web Studio cookie path and clearing across all three sign-outs", () => {
  it("uses /admin/web-studio when on and clears it from all three apps' sign-out handlers", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "");

    expect(webStudioCookie("v", { secure: false }).path).toBe(
      "/admin/web-studio",
    );
    expect(clearedWebStudioCookie({ secure: false }).path).toBe(
      "/admin/web-studio",
    );

    const donorOrMissionaryRes = await sharedSignOut(
      new Request("https://one.example.test/api/auth/signout", {
        method: "POST",
        headers: {
          host: "one.example.test",
          origin: "https://one.example.test",
        },
      }),
    );
    expect(donorOrMissionaryRes.status).toBe(200);
    const sharedCleared = donorOrMissionaryRes.headers
      .getSetCookie()
      .filter((c) => c.startsWith(`${WEB_STUDIO_TENANT_COOKIE}=`));
    expect(sharedCleared).toHaveLength(1);
    expect(sharedCleared[0]).toMatch(
      /^asym_web_studio_tenant=; Path=\/admin\/web-studio; Max-Age=0; HttpOnly; SameSite=[Ss]trict/,
    );

    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    const adminRes = await adminSignOut(
      new Request(
        "https://admin-internal.example.test/admin/api/auth/signout",
        {
          method: "POST",
          headers: {
            host: "one.example.test",
            "x-asym-front-origin": "https://one.example.test",
            origin: "https://one.example.test",
          },
        },
      ),
    );
    expect(adminRes.status).toBe(200);
    const adminCleared = adminRes.headers
      .getSetCookie()
      .filter((c) => c.startsWith(`${WEB_STUDIO_TENANT_COOKIE}=`));
    expect(adminCleared).toHaveLength(1);
    expect(adminCleared[0]).toMatch(
      /^asym_web_studio_tenant=; Path=\/admin\/web-studio; Max-Age=0; HttpOnly; SameSite=[Ss]trict/,
    );
  });

  it("uses /web-studio when off and clears it ONLY from the admin app sign-out", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");

    expect(webStudioCookie("v", { secure: false }).path).toBe("/web-studio");
    expect(clearedWebStudioCookie({ secure: false }).path).toBe("/web-studio");

    const donorRes = await sharedSignOut(
      new Request("http://localhost:3000/api/auth/signout", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }),
    );
    expect(donorRes.status).toBe(200);
    expect(donorRes.headers.getSetCookie().join("\n")).not.toContain(
      WEB_STUDIO_TENANT_COOKIE,
    );

    const adminRes = await adminSignOut(
      new Request("http://localhost:3030/api/auth/signout", {
        method: "POST",
        headers: { origin: "http://localhost:3030" },
      }),
    );
    expect(adminRes.status).toBe(200);
    expect(
      adminRes.headers
        .getSetCookie()
        .find((c) => c.startsWith(`${WEB_STUDIO_TENANT_COOKIE}=`)),
    ).toMatch(/^asym_web_studio_tenant=; Path=\/web-studio; Max-Age=0/);
  });
});
