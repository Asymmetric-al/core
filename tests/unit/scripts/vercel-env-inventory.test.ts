import { describe, expect, it } from "vitest";

import { formatVercelEnvInventory } from "../../../scripts/verify/vercel-env-inventory.mjs";

describe("Vercel env inventory formatter", () => {
  it("prints only env names and metadata", () => {
    const report = formatVercelEnvInventory({
      projects: [
        {
          project: "admin",
          environments: [
            {
              environment: "production",
              status: "ok",
              names: [
                { key: "SENTRY_DSN", type: "sensitive" },
                { key: "NEXT_PUBLIC_SENTRY_DSN", type: "encrypted" },
              ],
            },
          ],
        },
      ],
    });

    expect(report).toContain("`SENTRY_DSN` (sensitive)");
    expect(report).toContain("Secret values printed: no");
    expect(report).not.toContain("https://");
  });
});
