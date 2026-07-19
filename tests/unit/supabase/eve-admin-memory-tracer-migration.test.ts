import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718013531_eve_admin_memory_tracer.sql",
    import.meta.url,
  ),
  "utf8",
);

function getFunctionDefinition(functionName: string): string {
  const functionStart = sql.indexOf(
    `CREATE OR REPLACE FUNCTION public.${functionName}`,
  );
  const functionEnd = sql.indexOf("\n$$;", functionStart);

  expect(functionStart).toBeGreaterThanOrEqual(0);
  expect(functionEnd).toBeGreaterThan(functionStart);
  return sql.slice(functionStart, functionEnd);
}

function expectExclusionBefore(
  functionDefinition: string,
  mutationStatement: string,
) {
  const exclusionIndex = functionDefinition.indexOf(
    "IF public.contains_eve_admin_memory_exclusion",
  );
  const mutationIndex = functionDefinition.indexOf(mutationStatement);

  expect(exclusionIndex).toBeGreaterThanOrEqual(0);
  expect(mutationIndex).toBeGreaterThan(exclusionIndex);
}

describe("Eve admin-memory migration", () => {
  it("stores owner-bound entries, immutable history, category settings, and search", () => {
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_entries");
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_history");
    expect(sql).toContain("CREATE TABLE public.eve_admin_memory_settings");
    expect(sql).toContain("TSVECTOR GENERATED ALWAYS AS");
    expect(sql).toContain("UNIQUE (entry_id, version)");
    expect(sql).toContain("owner_profile_id = p_actor_profile_id");
  });

  it("keeps tenant operational memory schema-only and enforces exclusions on writes", () => {
    expect(sql).toContain(
      "scope_type IN ('admin_private', 'tenant_operational')",
    );
    expect(sql).toContain("eve_tenant_operational_memory_disabled");
    expect(sql).toContain("contains_eve_admin_memory_exclusion");
    expect(sql).toContain("eve_admin_memory_excluded");
  });

  it("detects equivalent bare SSN, phone, and street-address forms before entry or history insertion", () => {
    const exclusionFunction = getFunctionDefinition(
      "contains_eve_admin_memory_exclusion",
    );
    expect(exclusionFunction).toContain(
      "~* '(^|[^[:alnum:]])[0-9]{3}-[0-9]{2}-[0-9]{4}([^[:alnum:]]|$)'",
    );
    expect(exclusionFunction).toContain(
      "~* '(^|[^[:alnum:]])([+]1[ .-]?|1[ .-])?([(][2-9][0-9]{2}[)]|[2-9][0-9]{2})[ .-][2-9][0-9]{2}[ .-][0-9]{4}([^[:alnum:]]|$)'",
    );
    expect(exclusionFunction).toContain(
      "[0-9]{1,6}[[:space:]]+(([[:alpha:]][[:alpha:].''-]*|[0-9]+(st|nd|rd|th))[[:space:]]+){1,5}(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|parkway|pkwy|highway|hwy|way|terrace|ter|place|pl)",
    );

    const createFunction = getFunctionDefinition("create_eve_admin_memory");
    const updateFunction = getFunctionDefinition("update_eve_admin_memory");

    expectExclusionBefore(
      createFunction,
      "INSERT INTO public.eve_admin_memory_entries",
    );
    expectExclusionBefore(
      createFunction,
      "INSERT INTO public.eve_admin_memory_history",
    );
    expectExclusionBefore(
      updateFunction,
      "UPDATE public.eve_admin_memory_entries SET",
    );
    expectExclusionBefore(
      updateFunction,
      "INSERT INTO public.eve_admin_memory_history",
    );
  });

  it("gates auto-save, supports disable without deletion, and audits mutations atomically", () => {
    expect(sql).toContain("p_source = 'auto_save'");
    expect(sql).toContain("NOT governance.release_enabled");
    expect(sql).toContain("eve_admin_memory_auto_save_disabled");
    expect(sql).toContain("append_eve_admin_memory_audit");
    expect(sql).toContain(
      "ON CONFLICT (tenant_id, owner_profile_id, category) DO UPDATE",
    );
  });

  it("gives browser roles neither table nor mutation-function access", () => {
    expect(sql).toContain(
      "REVOKE ALL ON TABLE public.eve_admin_memory_entries FROM anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.create_eve_admin_memory",
    );
    expect(sql).not.toContain("TO authenticated;");
  });
});
