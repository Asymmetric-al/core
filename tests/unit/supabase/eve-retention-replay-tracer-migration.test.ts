import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260718022535_eve_retention_replay_tracer.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("Eve retention and replay migration", () => {
  it("seeds the 180-day default and short metadata-only gateway category", () => {
    expect(sql).toContain("('audit_record', 180, FALSE");
    expect(sql).toContain("('run_summary', 180, FALSE");
    expect(sql).toContain("('gateway_telemetry', 30, TRUE");
    expect(sql).toContain("ADD COLUMN expires_at TIMESTAMPTZ");
  });

  it("keeps artifact bodies in a private constrained Storage bucket", () => {
    expect(sql).toContain("CREATE TABLE public.eve_replay_artifacts");
    expect(sql).toContain("INSERT INTO storage.buckets");
    expect(sql).toContain("'eve-replay-artifacts', FALSE, 5000000");
    expect(sql).not.toContain("artifact_content");
    expect(sql).not.toContain("prompt_body");
    expect(sql).not.toContain("response_body");
  });

  it("enforces tenant-owner paths and blocks browser table/RPC access", () => {
    expect(sql).toContain("p_tenant_id::TEXT || '/' || p_actor_profile_id::TEXT");
    expect(sql).toContain("eve_retention_actor_tenant_mismatch");
    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).not.toContain("TO authenticated;");
  });

  it("supports auditable holds and two-phase artifact expiry", () => {
    expect(sql).toContain("CREATE TABLE public.eve_retention_holds");
    expect(sql).toContain("'hold.set'");
    expect(sql).toContain("'hold.cleared'");
    expect(sql).toContain("FOR UPDATE SKIP LOCKED");
    expect(sql).toContain("'delete_pending'");
    expect(sql).toContain("finalize_eve_replay_artifact_expiry");
  });
});
