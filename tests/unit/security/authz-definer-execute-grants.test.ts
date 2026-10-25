/**
 * #2270: EXECUTE on the authz SECURITY DEFINER helpers and on
 * public.current_user_memberships must be an explicit grant list, never
 * PUBLIC or anon (hosted Supabase widens `REVOKE ... FROM PUBLIC` alone).
 * Contract: docs/security/function-execute-grants.md.
 */
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationsDir = new URL("../../../supabase/migrations/", import.meta.url);
const LOCKDOWN = "20261024163000_authz_definer_execute_lockdown.sql";

/**
 * Every authz SECURITY DEFINER helper, with its argument list and exact
 * EXECUTE grantees besides the owner (postgres). Adding a DEFINER helper to
 * authz means adding it here and to the doc's table, with an explicit REVOKE
 * FROM PUBLIC, anon and an explicit GRANT in its migration.
 */
const AUTHZ_DEFINER_GRANTS: Record<string, { args: string; to: string[] }> = {
  is_super_admin: { args: "", to: ["authenticated", "service_role"] },
  has_membership: {
    args: "UUID, authz.membership_role[]",
    to: ["authenticated", "service_role"],
  },
  has_staff_membership: {
    args: "UUID, authz.staff_role[]",
    to: ["authenticated", "service_role"],
  },
};

const POLICIES = [
  ["select", "crm_command_logs"],
  ["insert", "crm_command_logs"],
  ["select", "crm_record_links"],
  ["insert", "crm_record_links"],
  ["update", "crm_record_links"],
  ["select", "crm_merge_candidates"],
  ["insert", "crm_merge_candidates"],
  ["update", "crm_merge_candidates"],
];

const HELPERS = Object.entries(AUTHZ_DEFINER_GRANTS).map(
  ([name, { args, to }]) => ({ fn: `authz.${name}(${args})`, to }),
);

const EXPECTED_LOCKDOWN = [
  "BEGIN",
  "REVOKE ALL ON FUNCTION public.current_user_memberships(UUID) FROM PUBLIC, anon, service_role",
  "GRANT EXECUTE ON FUNCTION public.current_user_memberships(UUID) TO authenticated",
  ...HELPERS.map(({ fn }) => `REVOKE ALL ON FUNCTION ${fn} FROM PUBLIC, anon`),
  ...HELPERS.map(
    ({ fn, to }) => `GRANT EXECUTE ON FUNCTION ${fn} TO ${to.join(", ")}`,
  ),
  ...POLICIES.map(
    ([cmd, table]) =>
      `ALTER POLICY "authz staff tenant ${cmd} ${table}" ON public.${table} TO authenticated`,
  ),
  "SELECT pg_notify('pgrst', 'reload schema')",
  "COMMIT",
];

function forwardMigrations() {
  return readdirSync(migrationsDir)
    .filter((filename) => /^\d{14}_.*\.sql$/.test(filename))
    .sort()
    .map((filename) => ({
      filename,
      sql: readFileSync(new URL(filename, migrationsDir), "utf8"),
    }));
}

/** Comment-free, whitespace-normalized statements; dollar-quoted bodies blanked. */
function statements(sql: string) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, "$$$$")
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

describe("authz SECURITY DEFINER EXECUTE grants (#2270)", () => {
  it("lists every authz SECURITY DEFINER helper defined by any forward migration", () => {
    const definers = new Set<string>();
    for (const { sql } of forwardMigrations()) {
      for (const statement of statements(sql)) {
        const name =
          /^(?:CREATE (?:OR REPLACE )?|ALTER )FUNCTION "?authz"?\."?(\w+)"?/i.exec(
            statement,
          )?.[1];
        if (name && /\bSECURITY DEFINER\b/i.test(statement)) definers.add(name);
      }
    }

    expect([...definers].sort()).toEqual(
      Object.keys(AUTHZ_DEFINER_GRANTS).sort(),
    );
  });

  it("never grants authz functions or current_user_memberships to PUBLIC or anon", () => {
    const offending: string[] = [];
    for (const { filename, sql } of forwardMigrations()) {
      for (const statement of statements(sql)) {
        if (!/^(?:ALTER DEFAULT PRIVILEGES\b.*\b)?GRANT\b/i.test(statement)) {
          continue;
        }
        const grantees = /\bTO\s+(.*)$/i.exec(statement)?.[1] ?? "";
        const onFunction =
          /\bON\s+(?:FUNCTION\s+(?:authz\.|(?:public\.)?current_user_memberships\b)|(?:ALL\s+)?FUNCTIONS\b.*\bauthz\b)/i.test(
            statement,
          ) || /\bIN SCHEMA\b.*\bauthz\b.*\bON FUNCTIONS\b/i.test(statement);
        const authzUsage = /\bUSAGE\b.*\bON\s+SCHEMA\b.*\bauthz\b/i.test(
          statement,
        );
        if (
          (onFunction && /\b(PUBLIC|anon)\b/i.test(grantees)) ||
          (authzUsage && /\banon\b/i.test(grantees))
        ) {
          offending.push(`${filename}: ${statement}`);
        }
      }
    }

    expect(offending).toEqual([]);
  });

  it("locks down EXECUTE with exactly the approved statements", () => {
    const lockdown = forwardMigrations().find(
      ({ filename }) => filename === LOCKDOWN,
    );

    expect(lockdown, LOCKDOWN).toBeDefined();
    expect(statements(lockdown!.sql)).toEqual(EXPECTED_LOCKDOWN);
    expect(lockdown!.sql).toMatch(/^BEGIN;$[\s\S]*^COMMIT;$/m);
    for (const statement of statements(lockdown!.sql)) {
      expect(statement).not.toMatch(
        /\b(DROP|CREATE|SECURITY)\b|ALTER DEFAULT PRIVILEGES/i,
      );
    }
  });
});
