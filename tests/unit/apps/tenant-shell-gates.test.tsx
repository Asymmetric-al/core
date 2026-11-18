import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement, ReactNode } from "react";

/**
 * Council round 1, A22: the signed-in shells' own redirects, which had no
 * test. Mission Control's `getTenantShell` (apps/admin/lib/admin-access.ts)
 * and the missionary root layout's workspace gate. The proxy decides
 * membership before either runs; these are the defence behind it.
 */

const TENANT = "00000000-0000-0000-0000-000000000001";
const SCOPE = {
  userId: "user-1",
  tenantId: TENANT,
  assignmentId: "assignment-1",
  addressPrefix: `/${TENANT}`,
};

const state = vi.hoisted(() => ({
  auth: null as unknown,
  allowed: true,
  scope: null as unknown,
  pathname: "/",
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/ui/fonts", () => ({ fontVariables: "" }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => state.auth,
  hasAnyContextRole: () => state.allowed,
}));
vi.mock("@asym/auth/tenant-server", () => ({
  readDocumentScope: async () => state.scope,
  redirectInTenant: async (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-asym-pathname": state.pathname }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({ url: "https://example.supabase.co" }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null }) }),
      }),
    }),
  }),
}));
vi.mock("@asym/lib/mission-control/bootstrap", () => ({
  createMCBootstrapState: (input: unknown) => input,
}));

const SIGNED_IN = {
  isAuthenticated: true,
  userId: "user-1",
  tenantId: TENANT,
  role: "staff",
};

async function redirectOf(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
  } catch (error) {
    const to = (error as { to?: string }).to;
    if (typeof to === "string") return to;
    throw error;
  }
  throw new Error("expected a redirect");
}

beforeEach(() => {
  state.auth = SIGNED_IN;
  state.allowed = true;
  state.scope = SCOPE;
  state.pathname = "/care";
});

describe("Mission Control's tenant shell", () => {
  it("sends a page that arrives without a document scope to the chooser, keeping the page", async () => {
    const { getTenantShell } =
      await import("../../../apps/admin/lib/admin-access");
    state.scope = null;
    expect(await redirectOf(() => getTenantShell("/care/directory"))).toBe(
      `/choose-organization?next=${encodeURIComponent("/care/directory")}`,
    );
  });

  it("gives the page its scope when the proxy decided one", async () => {
    const { getTenantShell } =
      await import("../../../apps/admin/lib/admin-access");
    expect((await getTenantShell("/care")).scope).toEqual(SCOPE);
  });

  it("sends a signed-out person to sign-in and a person without access to /no-access", async () => {
    const { getTenantShell } =
      await import("../../../apps/admin/lib/admin-access");
    state.auth = { isAuthenticated: false, userId: null };
    expect(await redirectOf(() => getTenantShell("/care"))).toBe(
      `/login?next=${encodeURIComponent("/care")}`,
    );
    state.auth = SIGNED_IN;
    state.allowed = false;
    expect(await redirectOf(() => getTenantShell("/care"))).toBe("/no-access");
  });
});

/** Finds the first element in a rendered tree whose component has `name`. */
function findElement(node: unknown, name: string): ReactElement | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, name);
      if (found) return found;
    }
    return null;
  }
  const element = node as ReactElement<Record<string, unknown>>;
  const type = element.type as { name?: string } | string | undefined;
  if (typeof type === "function" && (type as { name?: string }).name === name) {
    return element;
  }
  for (const value of Object.values(element.props ?? {})) {
    const found = findElement(value, name);
    if (found) return found;
  }
  return null;
}

async function missionaryWorkspace(): Promise<{
  run: () => Promise<ReactElement>;
}> {
  const { default: RootLayout } =
    await import("../../../apps/missionary/app/layout");
  const tree = RootLayout({ children: (<p>page</p>) as ReactNode });
  const workspace = findElement(tree, "MissionaryWorkspace");
  if (!workspace)
    throw new Error("MissionaryWorkspace not found in the layout");
  return {
    run: () =>
      (workspace.type as (props: unknown) => Promise<ReactElement>)(
        workspace.props,
      ),
  };
}

describe("the missionary workspace's gate", () => {
  it("does no auth work on an account screen, and loads a new document if the workspace shows there", async () => {
    state.pathname = "/login";
    const rendered = await (await missionaryWorkspace()).run();
    expect((rendered.type as { name?: string }).name).toBe(
      "ReloadAcrossSegment",
    );
  });

  it("sends a signed-out person to sign-in, keeping the page", async () => {
    state.pathname = `/${TENANT}/tasks`;
    state.auth = { isAuthenticated: false, userId: null };
    const to = await redirectOf((await missionaryWorkspace()).run);
    expect(to.startsWith("/login?next=")).toBe(true);
    expect(new URL(to, "https://app.test").searchParams.get("next")).toBe(
      `/${TENANT}/tasks`,
    );
  });

  it("sends a person who is not a missionary to /no-access", async () => {
    state.pathname = `/${TENANT}/tasks`;
    state.allowed = false;
    expect(await redirectOf((await missionaryWorkspace()).run)).toBe(
      "/no-access",
    );
  });

  it("sends a page that arrives without a document scope to the chooser", async () => {
    state.pathname = `/${TENANT}/tasks`;
    state.scope = null;
    expect(await redirectOf((await missionaryWorkspace()).run)).toBe(
      `/choose-organization?next=${encodeURIComponent(`/${TENANT}/tasks`)}`,
    );
  });

  it("renders the page in its document scope otherwise", async () => {
    state.pathname = `/${TENANT}/tasks`;
    const rendered = await (await missionaryWorkspace()).run();
    expect((rendered.type as { name?: string }).name).toBe("TenantDocument");
    expect((rendered.props as { scope: unknown }).scope).toEqual(SCOPE);
  });
});
