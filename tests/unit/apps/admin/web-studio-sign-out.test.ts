import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The Web Studio tenant cookie is cleared on sign-out (plan 5.2; AL-2675,
 * WP2b slice C): by the admin app's sign-out route, which every "Sign out"
 * in Mission Control posts to, and by Payload's own logout endpoint under
 * `/web-studio/api`, which Web Studio's "Log out" calls.
 */

const shared = vi.hoisted(() => ({ status: 200 }));

vi.mock("@asym/api/auth/signout", () => ({
  POST: vi.fn(async () =>
    NextResponse.json({ ok: shared.status === 200 }, { status: shared.status }),
  ),
}));

const { POST } =
  await import("../../../../apps/admin/app/api/auth/signout/route");
const { PrincipalLinks } =
  await import("../../../../apps/admin/src/cms/collections/principal-links");
const { clearWebStudioTenantOnLogout } =
  await import("../../../../apps/admin/src/cms/auth/web-studio-logout");

const CLEARED =
  /^asym_web_studio_tenant=; Path=\/web-studio; Max-Age=0; HttpOnly; SameSite=[Ss]trict/;

beforeEach(() => {
  shared.status = 200;
});

describe("signing out of the admin app", () => {
  it("clears the Web Studio cookie on the path it was set for", async () => {
    const response = await POST(
      new Request("http://localhost:3030/api/auth/signout", { method: "POST" }),
    );

    expect(response.status).toBe(200);
    const cleared = response.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("asym_web_studio_tenant="));
    expect(cleared).toMatch(CLEARED);
  });

  it("leaves it when the sign-out itself was refused", async () => {
    shared.status = 403;

    const response = await POST(
      new Request("http://localhost:3030/api/auth/signout", { method: "POST" }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.getSetCookie().join("\n")).not.toContain(
      "asym_web_studio_tenant",
    );
  });
});

describe("Payload's logout endpoint under /web-studio/api", () => {
  it("clears the Web Studio cookie alongside Payload's own (D-18: WP6 part 2b moves the hook from cms-users to principal-links)", async () => {
    const req = { responseHeaders: undefined as Headers | undefined };

    await clearWebStudioTenantOnLogout({ req } as never);

    expect(req.responseHeaders?.getSetCookie()).toEqual([
      expect.stringMatching(CLEARED),
    ]);
    expect(PrincipalLinks.hooks?.afterLogout).toContain(
      clearWebStudioTenantOnLogout,
    );
  });
});
