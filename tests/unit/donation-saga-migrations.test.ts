import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donation saga migrations", () => {
  it("scopes donation idempotency and batch claiming by tenant", () => {
    const baseMigration = readRepoFile(
      "supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql",
    );
    const followUpMigration = readRepoFile(
      "supabase/migrations/20260226100000_atomic_mutation_rpcs_and_donation_saga.sql",
    );

    for (const migration of [baseMigration, followUpMigration]) {
      expect(migration).toMatch(
        /WHERE tenant_id = p_tenant_id\s+AND idempotency_key = p_idempotency_key/,
      );
      expect(migration).toMatch(
        /hashtextextended\(p_tenant_id::text \|\| ':' \|\| p_idempotency_key,\s*0\)/,
      );
    }

    expect(baseMigration).toMatch(
      /CREATE OR REPLACE FUNCTION public\.claim_due_donation_saga_events\(\s*p_tenant_id UUID,\s*p_limit INTEGER,\s*p_lock_id UUID/s,
    );
    expect(baseMigration).toMatch(/AND d\.tenant_id = p_tenant_id/);
  });

  it("restricts new write rpc execute permissions to service_role", () => {
    const baseMigration = readRepoFile(
      "supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql",
    );
    const followUpMigration = readRepoFile(
      "supabase/migrations/20260226100000_atomic_mutation_rpcs_and_donation_saga.sql",
    );

    const baseFunctions = [
      "decrement_post_comment_count",
      "atomic_like_post",
      "atomic_unlike_post",
      "atomic_pray_for_post",
      "atomic_unpray_for_post",
      "atomic_fire_post",
      "atomic_unfire_post",
      "atomic_add_post_comment",
      "atomic_delete_comment_thread",
      "atomic_update_post_with_audit",
      "atomic_delete_post_with_audit",
      "atomic_update_profile_with_audit",
      "atomic_create_post_with_audit",
      "atomic_update_missionary_with_audit",
      "atomic_update_user_role_with_audit",
      "atomic_create_donation_with_audit",
      "begin_donation_saga",
      "claim_donation_saga_event",
      "claim_due_donation_saga_events",
      "complete_donation_saga_event",
      "record_donation_saga_failure",
    ];

    for (const fnName of baseFunctions) {
      expect(baseMigration).toMatch(
        new RegExp(
          `REVOKE EXECUTE ON FUNCTION public\\.${fnName}\\([^;]+ FROM PUBLIC, anon, authenticated;`,
          "s",
        ),
      );
      expect(baseMigration).toMatch(
        new RegExp(
          `GRANT EXECUTE ON FUNCTION public\\.${fnName}\\([^;]+ TO service_role;`,
          "s",
        ),
      );
    }

    const followUpFunctions = [
      "decrement_post_comment_count",
      "atomic_delete_comment_thread",
      "begin_donation_saga",
      "record_donation_saga_failure",
    ];

    for (const fnName of followUpFunctions) {
      expect(followUpMigration).toMatch(
        new RegExp(
          `REVOKE EXECUTE ON FUNCTION public\\.${fnName}\\([^;]+ FROM PUBLIC, anon, authenticated;`,
          "s",
        ),
      );
      expect(followUpMigration).toMatch(
        new RegExp(
          `GRANT EXECUTE ON FUNCTION public\\.${fnName}\\([^;]+ TO service_role;`,
          "s",
        ),
      );
    }
  });
});
