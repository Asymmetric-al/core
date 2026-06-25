import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const donorLocationsHookPath = fileURLToPath(
  new URL("../../../apps/donor/lib/hooks/use-locations.ts", import.meta.url),
);
const verifierPath = fileURLToPath(
  new URL("../../../scripts/verify/data-boundary-check.mjs", import.meta.url),
);

describe("TanStack DB browser data boundary", () => {
  it("keeps donor public locations behind @asym/database hooks", () => {
    const source = readFileSync(donorLocationsHookPath, "utf8");

    expect(source).toContain("@asym/database/hooks");
    expect(source).not.toContain("@asym/database/supabase");
    expect(source).not.toContain("supabase.from");
    expect(source).not.toContain("createBrowserClient");
  });

  it("checks app source for unapproved browser Supabase imports", () => {
    const source = readFileSync(verifierPath, "utf8");

    expect(source).toContain("bannedRawSupabaseAppImports");
    expect(source).toContain("bannedBrowserSupabaseAppImports");
    expect(source).toContain("appSupabaseImportAllowlist");
    expect(source).toContain("apps/admin/lib/authenticated-fetch.ts");
  });
});
