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

  it("keeps artifact bodies in a private compatible Storage bucket", () => {
    expect(sql).toContain("CREATE TABLE public.eve_replay_artifacts");
    expect(sql).toContain("INSERT INTO storage.buckets (id, name, public)");
    expect(sql).toContain(
      "VALUES ('eve-replay-artifacts', 'eve-replay-artifacts', FALSE)",
    );
    expect(sql).toContain(
      "ON CONFLICT (id) DO UPDATE SET\n    public = FALSE;",
    );
    expect(sql).not.toContain("file_size_limit");
    expect(sql).not.toContain("allowed_mime_types");
    expect(sql).toContain(
      "byte_size BIGINT CHECK (byte_size BETWEEN 1 AND 5000000)",
    );
    expect(sql).toContain(
      "content_type TEXT CHECK (content_type IN ('application/json', 'text/plain'))",
    );
    expect(sql).not.toContain("artifact_content");
    expect(sql).not.toContain("prompt_body");
    expect(sql).not.toContain("response_body");
  });

  it("enforces tenant-owner paths and blocks browser table/RPC access", () => {
    expect(sql).toContain(
      "p_tenant_id::TEXT || '/' || p_actor_profile_id::TEXT",
    );
    expect(sql).toContain("eve_retention_actor_tenant_mismatch");
    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).not.toContain("TO authenticated;");
  });

  it("rejects replay artifacts associated with a run owned by another profile", () => {
    const prepareArtifact = sql.slice(
      sql.indexOf("public.prepare_eve_replay_artifact"),
      sql.indexOf("public.complete_eve_replay_artifact"),
    );
    const ownerCheckIndex = prepareArtifact.indexOf(
      "IF p_run_id IS NOT NULL THEN",
    );
    const insertIndex = prepareArtifact.indexOf(
      "INSERT INTO public.eve_replay_artifacts",
    );

    expect(ownerCheckIndex).toBeGreaterThan(-1);
    expect(ownerCheckIndex).toBeLessThan(insertIndex);
    expect(prepareArtifact).toContain("run_summary.id = p_run_id");
    expect(prepareArtifact).toContain(
      "run_summary.initiated_by_profile_id = p_actor_profile_id",
    );
    expect(prepareArtifact).toContain("FOR SHARE");
    expect(prepareArtifact).toContain("eve_replay_run_owner_mismatch");
  });

  it("supports auditable holds and two-phase artifact expiry", () => {
    expect(sql).toContain("CREATE TABLE public.eve_retention_holds");
    expect(sql).toContain("'hold.set'");
    expect(sql).toContain("'hold.cleared'");
    expect(sql).toContain("FOR UPDATE SKIP LOCKED");
    expect(sql).toContain("'delete_pending'");
    expect(sql).toContain("finalize_eve_replay_artifact_expiry");
  });

  it("rechecks holds under a deletion lease before removing Storage bodies", () => {
    const beginDeletion = sql.slice(
      sql.indexOf("public.begin_eve_replay_artifact_deletion"),
      sql.indexOf("public.release_eve_replay_artifact_deletion"),
    );
    const finalizeDeletion = sql.slice(
      sql.indexOf("public.finalize_eve_replay_artifact_expiry"),
      sql.indexOf("public.expire_eve_retention_records"),
    );

    expect(sql).toContain("deletion_started_at TIMESTAMPTZ");
    expect(beginDeletion).toContain("FOR UPDATE");
    expect(beginDeletion).toContain("hold.status = 'active'");
    expect(beginDeletion).toContain("hold.scope_type = 'artifact'");
    expect(beginDeletion).toContain("hold.scope_type = 'category'");
    expect(finalizeDeletion).toContain("deletion_started_at IS NOT NULL");
    expect(finalizeDeletion).toContain("hold.status = 'active'");
    expect(sql).toContain("eve_replay_artifact_deletion_in_progress");
  });

  it("allows stale upload-pending metadata to transition directly to expired", () => {
    expect(sql).toContain(
      "OR (status IN ('available', 'delete_pending') AND uploaded_at IS NOT NULL)",
    );
    expect(sql).toContain("OR status = 'expired'");
    expect(sql).toContain(
      "status = CASE WHEN artifact.uploaded_at IS NULL THEN 'expired' ELSE 'delete_pending' END",
    );
  });

  it("does not let tenant holds match records without that tenant", () => {
    const auditExpiry = sql.slice(
      sql.indexOf("DELETE FROM public.eve_audit_events"),
      sql.indexOf("DELETE FROM public.eve_run_summaries"),
    );
    const runSummaryExpiry = sql.slice(
      sql.indexOf("DELETE FROM public.eve_run_summaries"),
      sql.indexOf(
        "INSERT INTO public.eve_retention_lifecycle_events",
        sql.indexOf("DELETE FROM public.eve_run_summaries"),
      ),
    );

    expect(auditExpiry).toContain("hold.tenant_id = candidate.tenant_id");
    expect(auditExpiry).not.toContain("candidate.tenant_id IS NULL");
    expect(runSummaryExpiry).toContain("LEFT JOIN public.profiles initiator");
    expect(runSummaryExpiry).toContain("hold.tenant_id = initiator.tenant_id");
    expect(runSummaryExpiry).not.toContain("initiator.tenant_id IS NULL");
    expect(runSummaryExpiry).not.toContain("candidate.tenant_id");
  });
});
