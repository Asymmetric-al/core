import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260718000904_eve_audit_tracer.sql",
  ),
  "utf8",
);

describe("Eve audit tracer migration", () => {
  it("indexes the global recent-run ordering inherited from the governance view", () => {
    expect(migration).toContain("CREATE INDEX eve_run_summaries_updated_idx");
    expect(migration).toContain(
      "ON public.eve_run_summaries (updated_at DESC)",
    );
  });

  it("creates an app-owned rich audit record with the required accountability fields", () => {
    expect(migration).toContain("CREATE TABLE public.eve_audit_events");
    for (const field of [
      "actor_id",
      "initiator_id",
      "identity_mode",
      "policy_id",
      "action",
      "target",
      "result",
      "model_role",
      "evidence_summary",
      "decision_summary",
      "debug_metadata",
    ]) {
      expect(migration).toContain(field);
    }
  });

  it("keeps audit storage service-role-only and append-only", () => {
    expect(migration).toContain(
      "ALTER TABLE public.eve_audit_events ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.eve_audit_events FROM anon, authenticated",
    );
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.eve_audit_events FROM service_role",
    );
    expect(migration).toContain(
      "GRANT SELECT, INSERT ON TABLE public.eve_audit_events TO service_role",
    );
    expect(migration).not.toContain(
      "GRANT SELECT, INSERT, UPDATE ON TABLE public.eve_audit_events",
    );
    expect(migration).not.toContain("raw_prompt");
    expect(migration).not.toContain("raw_reasoning");
    expect(migration).not.toContain("request_payload");
  });
});
