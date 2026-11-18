import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 1, A1 (AL-2675, WP2b slice A): no address that comes from a
 * `next` value or a page address leaves the app's own origin.
 *
 * `/<uuid>//evil.example/x` used to parse as a tenant address whose inner
 * path was `//evil.example/x`; the chooser stripped the prefix and redirected
 * a person with one row to that host, offered it as buttons to a person with
 * several rows, and took a signed-out person there after sign-in. The UUID
 * need not be the person's own tenant. The same goes for the backslash form,
 * which `new URL` reads as a slash, for a tab or newline inside the slashes,
 * which it strips, and for their percent-encoded forms.
 */

const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
const OTHER = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const USER = "00000000-0000-4000-8000-0000000000c1";

/** Each form of a protocol-relative inner path, as a page receives `next` (decoded once). */
const EVIL = [
  `/${OTHER}//evil.example/x`,
  `/${OTHER}/\\evil.example/x`,
  `/${OTHER}/\\/evil.example/x`,
  `/${OTHER}/\t/evil.example/x`,
  `/${OTHER}/\n/evil.example/x`,
  `/${OTHER}/\r/evil.example/x`,
  `/${OTHER}/%2F%2Fevil.example/x`,
  `/${OTHER}/%2f%2fevil.example/x`,
  `/${OTHER}/%2F/evil.example/x`,
  `/${OTHER}/%5Cevil.example/x`,
  `/${OTHER}/%5c%5cevil.example/x`,
  `/${OTHER}~finance//evil.example/x`,
  `/${DEMO}//evil.example/x`,
];

/** An href the browser resolves on the app's own origin, with nothing a parser strips or turns into a slash. */
function expectSameOrigin(href: string | null | undefined) {
  expect(typeof href).toBe("string");
  const value = href as string;
  expect(value.startsWith("/"), value).toBe(true);
  expect(/^[/\\]{2}/.test(value), value).toBe(false);
  expect(/[\\\t\n\r]/.test(value), value).toBe(false);
  expect(new URL(value, "https://app.test").origin, value).toBe(
    "https://app.test",
  );
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // A malformed escape decodes to nothing a browser would follow.
  }
  expect(/^[/\\]{2}/.test(decoded), `${value} decoded`).toBe(false);
}

const state = vi.hoisted(() => ({
  signedIn: null as unknown,
  userId: null as string | null,
  rows: [] as unknown[],
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

const { parseTenantAddress } =
  await import("../../../packages/auth/tenant-address");
const { safeNextParam } = await import("../../../packages/auth/demo-login");
const { loadOrganizationChoices } =
  await import("../../../packages/api/src/auth/organization-choices");
const { default: AdminChooserPage } =
  await import("../../../apps/admin/app/(auth)/choose-organization/page");
const { default: MissionaryChooserPage } =
  await import("../../../apps/missionary/app/choose-organization/page");
const { proxy: adminProxy } = await import("../../../apps/admin/proxy");
const { proxy: missionaryProxy } =
  await import("../../../apps/missionary/proxy");

function assignment(
  tenantId: string,
  membershipRole: "staff" | "missionary",
  staffRole: string | null,
  n: number,
) {
  return {
    assignmentId: `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole,
    isTenantAdmin: false,
  };
}

function signedIn(assignments: ReturnType<typeof assignment>[]) {
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments,
    organizationNames: new Map([
      [DEMO, "Demo Mission"],
      [SECOND, "Second Mission"],
    ]),
  };
}

const ONE_ROW = {
  staff: [assignment(DEMO, "staff", "development", 1)],
  missionary: [assignment(DEMO, "missionary", null, 2)],
};
const SEVERAL_ROWS = {
  staff: [
    assignment(DEMO, "staff", "finance", 3),
    assignment(DEMO, "staff", "member_care", 4),
    assignment(SECOND, "staff", "development", 5),
  ],
  missionary: [
    assignment(DEMO, "missionary", null, 6),
    assignment(SECOND, "missionary", null, 7),
  ],
};

/** Runs a chooser page's streamed part: the redirect it makes, or the options it offers. */
async function openChooser(
  Page: typeof AdminChooserPage,
  next: string,
): Promise<{ redirectedTo: string } | { hrefs: string[] }> {
  const element = Page({ searchParams: Promise.resolve({ next }) }) as {
    props: {
      children: { type: (p: unknown) => Promise<unknown>; props: unknown };
    };
  };
  const choices = element.props.children;
  try {
    const rendered = (await choices.type(choices.props)) as {
      props: {
        organizations: Array<{ options: Array<{ href: string }> }>;
      };
    };
    return {
      hrefs: rendered.props.organizations.flatMap((o) =>
        o.options.map((option) => option.href),
      ),
    };
  } catch (error) {
    const to = (error as { to?: string }).to;
    if (typeof to === "string") return { redirectedTo: to };
    throw error;
  }
}

beforeEach(() => {
  state.signedIn = null;
  state.userId = null;
  state.rows = [];
});

describe("the address grammar", () => {
  it.each(EVIL)("does not read %j as a tenant address", (address) => {
    expect(parseTenantAddress(address)).toBeNull();
  });

  it("still reads an ordinary address with a doubled slash further in", () => {
    expect(parseTenantAddress(`/${DEMO}/care//directory`)?.innerPathname).toBe(
      "/care//directory",
    );
  });
});

describe("the next value", () => {
  it.each(EVIL)("refuses %j as a next address", (next) => {
    expect(safeNextParam(next)).toBeNull();
  });
});

describe.each([
  ["Mission Control", "staff" as const, AdminChooserPage],
  ["the missionary workspace", "missionary" as const, MissionaryChooserPage],
])("%s's chooser", (_app, roleClass, Page) => {
  it.each(EVIL)(
    "keeps every option on the app's own origin for next=%j",
    async (next) => {
      for (const rows of [ONE_ROW[roleClass], SEVERAL_ROWS[roleClass]]) {
        signedIn(rows);
        const choices = await loadOrganizationChoices({ roleClass, next });
        expect(choices.kind).toBe("ok");
        if (choices.kind !== "ok") continue;
        for (const organization of choices.organizations) {
          for (const option of organization.options) {
            expectSameOrigin(option.href);
          }
        }
      }
    },
  );

  it.each(EVIL)(
    "redirects a person with one row on the app's own origin for next=%j",
    async (next) => {
      signedIn(ONE_ROW[roleClass]);
      const opened = await openChooser(Page, next);
      expect("redirectedTo" in opened).toBe(true);
      if ("redirectedTo" in opened) expectSameOrigin(opened.redirectedTo);
    },
  );

  it.each(EVIL)(
    "offers a person with several rows only addresses on the app's own origin for next=%j",
    async (next) => {
      signedIn(SEVERAL_ROWS[roleClass]);
      const opened = await openChooser(Page, next);
      expect("hrefs" in opened).toBe(true);
      if ("hrefs" in opened) {
        expect(opened.hrefs.length).toBeGreaterThan(1);
        opened.hrefs.forEach(expectSameOrigin);
      }
    },
  );
});

describe.each([
  ["Mission Control", adminProxy, "staff", "development"],
  ["the missionary workspace", missionaryProxy, "missionary", null],
])("%s's sign-in path", (_app, proxy, role, staffRole) => {
  const row = {
    id: "00000000-0000-4000-8000-0000000000c9",
    user_id: USER,
    tenant_id: DEMO,
    role,
    staff_role: staffRole,
    is_tenant_admin: false,
    updated_at: "2026-11-18T00:00:00.000000+00:00",
  };

  it.each(EVIL)(
    "sends a signed-out visitor of %j to sign in with no next that leaves the origin",
    async (address) => {
      const response = await proxy(
        new NextRequest(new URL(address, "http://localhost:3330")),
      );
      const location = response.headers.get("location");
      expect(location).not.toBeNull();
      const url = new URL(location!, "http://localhost:3330");
      expect(url.origin).toBe("http://localhost:3330");
      const next = url.searchParams.get("next");
      // What sign-in returns to is only ever what safeNextParam lets through.
      const returnTo = safeNextParam(next);
      if (returnTo !== null) expectSameOrigin(returnTo);
    },
  );

  it.each(EVIL)(
    "sends a signed-in person who opens sign-in with next=%j somewhere on the origin",
    async (next) => {
      state.userId = USER;
      state.rows = [row];
      const response = await proxy(
        new NextRequest(
          new URL(
            `/login?next=${encodeURIComponent(next)}`,
            "http://localhost:3330",
          ),
        ),
      );
      const location = response.headers.get("location");
      expect(location).not.toBeNull();
      expect(new URL(location!, "http://localhost:3330").origin).toBe(
        "http://localhost:3330",
      );
      expectSameOrigin(new URL(location!, "http://localhost:3330").pathname);
    },
  );
});
