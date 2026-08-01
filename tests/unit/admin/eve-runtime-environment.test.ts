import { describe, expect, it } from "vitest";

import { normalizeEveVercelEnvironment } from "../../../apps/admin/eve-runtime-environment";

describe("normalizeEveVercelEnvironment", () => {
  it.each(["", "   "])(
    "removes the empty local VERCEL_URL placeholder (%j)",
    (vercelUrl) => {
      const environment = { VERCEL_URL: vercelUrl };

      normalizeEveVercelEnvironment(environment);

      expect(environment).not.toHaveProperty("VERCEL_URL");
    },
  );

  it("preserves a hosted Vercel URL", () => {
    const environment = { VERCEL_URL: "admin.example.vercel.app" };

    normalizeEveVercelEnvironment(environment);

    expect(environment.VERCEL_URL).toBe("admin.example.vercel.app");
  });
});
