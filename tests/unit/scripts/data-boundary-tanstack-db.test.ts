import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { collectAppSupabaseViolationsFromSource } from "../../../scripts/verify/data-boundary-check.mjs";

const publicLocationsHookPath = fileURLToPath(
  new URL(
    "../../../packages/database/hooks/public-locations.ts",
    import.meta.url,
  ),
);

const RAW_ALLOWLISTED_FILE = "apps/admin/src/cms/auth/supabase-strategy.ts";
const BROWSER_ALLOWLISTED_FILE = "apps/admin/lib/authenticated-fetch.ts";
const REGULAR_FILE = "apps/donor/app/example.tsx";

describe("TanStack DB browser data boundary", () => {
  it("keeps public locations behind the TanStack DB collection boundary", () => {
    const source = readFileSync(publicLocationsHookPath, "utf8");

    expect(source).toContain("locationsCollection");
    expect(source).toContain("useLiveQuery");
    expect(source).not.toContain("@asym/database/supabase");
    expect(source).not.toContain("supabase.from");
    expect(source).not.toContain("createBrowserClient");
  });

  it("flags raw @supabase/supabase-js imports in regular app source", () => {
    const violations = collectAppSupabaseViolationsFromSource(
      REGULAR_FILE,
      'import { createClient } from "@supabase/supabase-js";\n',
    );

    expect(violations).toEqual([
      `${REGULAR_FILE}:1:import { createClient } from "@supabase/supabase-js";`,
    ]);
  });

  it("flags browser Supabase helper imports outside the allowlist", () => {
    const violations = collectAppSupabaseViolationsFromSource(
      REGULAR_FILE,
      'import { createClient } from "@asym/database/supabase/client";\n',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("@asym/database/supabase/client");
  });

  it("scopes the raw-import exemption to the approved server auth strategy only", () => {
    const rawImport = 'import { createClient } from "@supabase/supabase-js";\n';

    expect(
      collectAppSupabaseViolationsFromSource(RAW_ALLOWLISTED_FILE, rawImport),
    ).toEqual([]);
    // The browser-helper allowlist must NOT exempt raw SDK imports.
    expect(
      collectAppSupabaseViolationsFromSource(
        BROWSER_ALLOWLISTED_FILE,
        rawImport,
      ),
    ).toHaveLength(1);
  });

  it("scopes the browser-helper exemption to the approved fetch helper only", () => {
    const browserImport =
      'import { createBrowserClient } from "@asym/database/supabase";\n';

    expect(
      collectAppSupabaseViolationsFromSource(
        BROWSER_ALLOWLISTED_FILE,
        browserImport,
      ),
    ).toEqual([]);
    // The raw-import allowlist must NOT exempt browser helper imports.
    expect(
      collectAppSupabaseViolationsFromSource(
        RAW_ALLOWLISTED_FILE,
        browserImport,
      ),
    ).toHaveLength(1);
  });

  it("passes clean app source", () => {
    const violations = collectAppSupabaseViolationsFromSource(
      REGULAR_FILE,
      'import { usePublicLocations } from "@asym/database/hooks";\n',
    );

    expect(violations).toEqual([]);
  });
});
