import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../../supabase/migrations/20260718070400_eve_subagent_shared_context.sql",
);

describe("Eve specialist shared-context migration", () => {
  it("creates append-only tenant-scoped claims, conflicts, and resolutions", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE public.eve_shared_context_claims");
    expect(sql).toContain("CREATE TABLE public.eve_shared_context_conflicts");
    expect(sql).toContain("CREATE TABLE public.eve_shared_context_resolutions");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("eve_session_ownership");
    expect(sql).toContain("append_eve_shared_context_claim");
    expect(sql).toContain("resolve_eve_shared_context_conflict");
    expect(sql).toContain("NOT selected_ids <@ conflict_claim_ids");
    expect(sql).not.toMatch(/UPDATE public\.eve_shared_context_claims/iu);
    expect(sql).not.toMatch(/DELETE FROM public\.eve_shared_context_claims/iu);
  });

  it("registers separate hard budgets for delegation, writes, and resolution", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("engineering.subagent.delegate");
    expect(sql).toContain("engineering.shared_context.write");
    expect(sql).toContain("engineering.shared_context.resolve");
    expect(sql).toContain("specialist-delegation");
    expect(sql).toContain("shared-context-write");
    expect(sql).toContain("shared-context-resolve");
  });
});
