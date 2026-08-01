import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Source-text guards for the edge's membership read.
 *
 * The edge resolves a role snapshot before it will serve any protected route.
 * If that read targets a schema PostgREST does not serve, every signed-in user
 * is redirected off every gated surface -- and nothing catches it: the unit
 * doubles answer any schema, and CI's e2e runs entirely under `E2E_AUTH_BYPASS`,
 * which returns before the resolver is ever called. These assertions are the
 * only automated check that the read is reachable at all.
 */
const read = (relativePath: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );

const MIGRATION =
  "supabase/migrations/20260802041500_current_user_memberships_rpc.sql";

describe("edge membership read stays inside the Data API", () => {
  it("exposes only public and graphql_public", () => {
    const config = read("supabase/config.toml");
    const schemas = config.match(/^schemas\s*=\s*\[(.*)\]/m)?.[1];

    // The rest of this suite exists because `authz` is not here. If that ever
    // changes deliberately, this is the assertion to revisit first.
    expect(schemas).toBeTruthy();
    expect(schemas).toContain('"public"');
    expect(schemas).not.toContain('"authz"');
  });

  it("keeps the resolver off unexposed schemas", () => {
    const source = read("packages/auth/resolve-user-role.ts").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );

    // `.schema("authz")` here returns PGRST106, which the resolver turns into
    // `null` -- indistinguishable from "no role", i.e. a lockout.
    expect(source).not.toMatch(/\.schema\(/);
    expect(source).toMatch(/\.rpc\("current_user_memberships"/);
  });

  it("ships the RPC the resolver calls, callable by signed-in users", () => {
    const migration = read(MIGRATION);

    expect(migration).toMatch(
      /CREATE OR REPLACE FUNCTION public\.current_user_memberships\(target_tenant UUID\)/,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION[\s\S]*?TO authenticated/,
    );

    // PostgREST will not route to a function it has not seen.
    expect(migration).toMatch(/pg_notify\('pgrst', 'reload schema'\)/);
  });

  it("scopes the RPC to the caller rather than to an argument", () => {
    const migration = read(MIGRATION);

    // SECURITY DEFINER reads past RLS, so this predicate is the only thing
    // stopping one user from resolving another's roles. A `user_id` argument
    // would move that decision to the caller.
    expect(migration).toMatch(/SECURITY DEFINER/);
    expect(migration).toMatch(/m\.user_id = auth\.uid\(\)/);
    expect(migration).not.toMatch(/user_id\s+UUID\s*[,)]/);

    // An empty search_path forces every reference to be schema-qualified, so a
    // shadowed `memberships` table cannot be substituted for the real one.
    expect(migration).toMatch(/SET search_path = ''/);
    expect(migration).toMatch(/FROM authz\.memberships/);
  });
});
