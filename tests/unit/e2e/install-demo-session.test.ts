import { afterEach, describe, expect, it, vi } from "vitest";

import { installDemoSessionInBrowser } from "../../e2e/helpers/install-demo-session";

import type { Page } from "@playwright/test";

function browserPage() {
  const addCookies = vi.fn().mockResolvedValue(undefined);
  const route = vi.fn().mockResolvedValue(undefined);
  const post = vi.fn().mockResolvedValue({
    ok: () => true,
    status: () => 200,
    url: () => "http://127.0.0.1:3005/api/auth/demo-account",
    json: async () => ({ ok: true, role: "donor", bypass: true }),
  });
  const page = {
    request: { post },
    context: () => ({ addCookies }),
    route,
  } as unknown as Page;
  return { page, post, addCookies, route };
}

afterEach(() => vi.unstubAllEnvs());

describe("installDemoSessionInBrowser hermetic client identity", () => {
  it("installs cookie-backed browser identity matching the signed local donor demo", async () => {
    vi.stubEnv("ASYM_E2E_REQUIRE_HERMETIC_SUPABASE", "1");
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    const fixture = browserPage();

    await expect(
      installDemoSessionInBrowser(fixture.page, "donor"),
    ).resolves.toEqual({ ok: true, status: 200 });

    expect(fixture.addCookies).toHaveBeenCalledOnce();
    const [cookies] = fixture.addCookies.mock.calls[0]!;
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toMatchObject({
      name: "sb-example-auth-token",
      url: "http://127.0.0.1:3005/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    });
    const session = JSON.parse(
      Buffer.from(
        cookies[0].value.slice("base64-".length),
        "base64url",
      ).toString(),
    );
    expect(session.user).toMatchObject({ id: "e2e-donor-user" });
    expect(fixture.route).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["ASYM_E2E_REQUIRE_HERMETIC_SUPABASE", ""],
    ["E2E_AUTH_BYPASS", "false"],
    ["NEXT_PUBLIC_SUPABASE_URL", "https://real-project.supabase.co"],
    ["NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"],
  ])("does not install fixtures when %s is %s", async (key, value) => {
    vi.stubEnv("ASYM_E2E_REQUIRE_HERMETIC_SUPABASE", "1");
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv(key, value);
    const fixture = browserPage();

    await installDemoSessionInBrowser(fixture.page, "donor");

    expect(fixture.addCookies).not.toHaveBeenCalled();
    expect(fixture.route).not.toHaveBeenCalled();
  });

  it.each([
    { url: "https://donor-preview.vercel.app/api/auth/demo-account" },
    { payload: { ok: true, role: "donor", bypass: false } },
    { payload: { ok: true, role: "admin", bypass: true } },
    { ok: false },
  ])("keeps non-hermetic or failed login unchanged: %j", async (scenario) => {
    vi.stubEnv("ASYM_E2E_REQUIRE_HERMETIC_SUPABASE", "1");
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    const fixture = browserPage();
    fixture.post.mockResolvedValue({
      ok: () => scenario.ok ?? true,
      status: () => (scenario.ok === false ? 401 : 200),
      url: () => scenario.url ?? "http://127.0.0.1:3005/api/auth/demo-account",
      json: async () =>
        scenario.payload ?? { ok: true, role: "donor", bypass: true },
    });

    await installDemoSessionInBrowser(fixture.page, "donor");

    expect(fixture.addCookies).not.toHaveBeenCalled();
    expect(fixture.route).not.toHaveBeenCalled();
  });

  it("serves only the expected browser user and exact donor profile read", async () => {
    vi.stubEnv("ASYM_E2E_REQUIRE_HERMETIC_SUPABASE", "1");
    vi.stubEnv("E2E_AUTH_BYPASS", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    const fixture = browserPage();
    await installDemoSessionInBrowser(fixture.page, "donor");
    const userRoute = fixture.route.mock.calls[0]![1];
    const profileRoute = fixture.route.mock.calls[1]![1];
    const fulfill = vi.fn().mockResolvedValue(undefined);
    const abort = vi.fn().mockResolvedValue(undefined);
    const request = vi.fn(() => ({
      method: () => "GET",
      url: () =>
        "https://example.supabase.co/rest/v1/profiles?user_id=eq.e2e-donor-user",
    }));

    await userRoute({ request, fulfill, abort });
    expect(fulfill).toHaveBeenLastCalledWith(
      expect.objectContaining({
        json: expect.objectContaining({ id: "e2e-donor-user" }),
      }),
    );
    await profileRoute({ request, fulfill, abort });
    expect(fulfill).toHaveBeenLastCalledWith(
      expect.objectContaining({
        json: {
          id: "11111111-1111-1111-1111-111111111111",
          tenant_id: "00000000-0000-0000-0000-000000000001",
          user_id: "e2e-donor-user",
          role: "donor",
        },
      }),
    );
    request.mockReturnValue({
      method: () => "GET",
      url: () =>
        "https://example.supabase.co/rest/v1/profiles?user_id=eq.other-user",
    });
    await profileRoute({ request, fulfill, abort });
    request.mockReturnValue({
      method: () => "PATCH",
      url: () => "https://example.supabase.co/auth/v1/user",
    });
    await userRoute({ request, fulfill, abort });
    expect(abort).toHaveBeenCalledTimes(2);
    expect(fulfill).toHaveBeenCalledTimes(2);
  });
});
