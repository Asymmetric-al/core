import { createClient } from "@asym/database/supabase/server";
import { expect, it, vi } from "vitest";

import { createAppHealthHandler } from "../../../../packages/api/src/health/app";

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [] }),
}));

const url = process.env.APP_HEALTH_IT_SUPABASE_URL;
it.skipIf(!url && process.env.GITHUB_JOB !== "local-supabase")(
  "anon cannot read profiles but the app health probe confirms connectivity",
  async () => {
    if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
      throw new Error("Requires a disposable loopback Supabase stack");
    const key = process.env.APP_HEALTH_IT_ANON_KEY;
    if (!key) throw new Error("Missing local public API key");

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
    vi.stubEnv("SKIP_ENV_VALIDATION", undefined);
    try {
      const anon = await createClient(null);
      const { error } = await anon.from("profiles").select("id").limit(1);
      expect(error?.code).toBe("42501");

      const response = await createAppHealthHandler("admin")();
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        status: "ok",
        checks: { supabase: "ok" },
        observability: { supabaseLatencyMs: expect.any(Number) },
      });
    } finally {
      vi.unstubAllEnvs();
    }
  },
);
