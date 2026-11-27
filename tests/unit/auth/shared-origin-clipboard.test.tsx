// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PayloadClipboardGuard } from "../../../apps/admin/src/cms-ui/web-studio/shell/payload-clipboard";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: async () => ({ error: null }),
  getUser: async () => ({ data: { user: { id: "second-person" } } }),
  signInWithPassword: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));
vi.mock("@supabase/ssr", async (original) => ({
  ...(await original<typeof import("@supabase/ssr")>()),
  createServerClient: () => ({ auth }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "fixture",
  }),
}));
vi.mock("@asym/env", async (original) => ({
  ...(await original<typeof import("@asym/env")>()),
  serverEnv: {
    ALLOW_DEMO_ACCOUNTS: true,
    DEMO_MISSIONARY_EMAIL: "fixture@example.test",
    DEMO_DONOR_EMAIL: "fixture@example.test",
    DEMO_PASSWORD: "fixture",
  },
}));

const mounts = {
  missionary: {
    callback: () => import("../../../apps/missionary/app/auth/callback/route"),
    recovery: () =>
      import("../../../apps/missionary/app/forgot-password/callback/route"),
    demo: () =>
      import("../../../apps/missionary/app/api/auth/demo-account/route"),
    signout: () =>
      import("../../../apps/missionary/app/api/auth/signout/route"),
  },
  donor: {
    callback: () => import("../../../apps/donor/app/auth/callback/route"),
    recovery: () =>
      import("../../../apps/donor/app/(auth)/forgot-password/callback/route"),
    demo: () => import("../../../apps/donor/app/api/auth/demo-account/route"),
    signout: () => import("../../../apps/donor/app/api/auth/signout/route"),
  },
};

beforeEach(() => {
  localStorage.setItem("_payloadClipboard", "first person's copied block");
  document.cookie = "asym_clipboard_reset=; Path=/; Max-Age=0";
  vi.stubEnv("E2E_AUTH_BYPASS", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllEnvs();
});

describe.each(["missionary", "donor"] as const)(
  "%s session on the same browser",
  (app) => {
    describe.each(["1", "0"])("switch %s", (mode) => {
      it.each(["callback", "recovery", "demo", "signout"] as const)(
        "clears the previous person's copy on the next admin page after %s only on the shared origin",
        async (way) => {
          vi.stubEnv("CORE_SERVE_UNDER_PATHS", mode);
          vi.stubEnv(
            "CORE_APP_BASE_PATH",
            mode === "1" && app === "missionary" ? "/missionary" : "",
          );
          const route = await mounts[app][way]();
          const origin = "https://tenant.example";
          const response =
            way === "demo" || way === "signout"
              ? await (
                  route as typeof import("../../../packages/api/src/auth/signout")
                ).POST(
                  new Request(origin + "/api/auth/" + way, {
                    method: "POST",
                    headers: { origin, "content-type": "application/json" },
                    body: JSON.stringify({ role: app }),
                  }),
                )
              : await (
                  route as typeof import("../../../packages/api/src/auth/callback")
                ).GET(new Request(origin + "/auth/callback?code=fixture"));
          expect(response.status).toBe(
            "GET" in route && way !== "demo" ? 307 : 200,
          );
          const mark = response.headers
            .getSetCookie()
            .find((value) => value.startsWith("asym_clipboard_reset="));
          if (mode === "1") {
            expect(mark).toMatch(
              /^asym_clipboard_reset=1; Path=\/; SameSite=lax$/i,
            );
            document.cookie = mark!;
          } else expect(mark).toBeUndefined();
          render(<PayloadClipboardGuard />);
          expect(localStorage.getItem("_payloadClipboard")).toBe(
            mode === "1" ? null : "first person's copied block",
          );
        },
      );
    });
  },
);
