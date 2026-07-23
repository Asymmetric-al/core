import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260718032020_eve_admin_auth_session_ownership.sql",
);
const sql = readFileSync(migrationPath, "utf8");

describe("Eve admin auth and session ownership migration", () => {
  it("stores only the authorization binding while Eve owns durable sessions", () => {
    expect(sql).toContain("CREATE TABLE public.eve_session_ownership");
    expect(sql).toContain("session_id TEXT PRIMARY KEY");
    expect(sql).toContain("owner_actor_id TEXT NOT NULL");
    expect(sql).toContain("owner_profile_id UUID");
    expect(sql).not.toContain("continuation_token");
    expect(sql).not.toContain("message_content");
  });

  it("requires accountable admin or service identity and denies browser roles", () => {
    expect(sql).toContain("identity_mode IN ('admin', 'service')");
    expect(sql).toContain("initiator_id = owner_actor_id");
    expect(sql).toContain("initiator_type IN ('admin', 'schedule', 'system')");
    expect(sql).toContain(
      "ALTER TABLE public.eve_session_ownership ENABLE ROW LEVEL SECURITY",
    );
    expect(sql).toContain("FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("TO service_role");
  });
});
