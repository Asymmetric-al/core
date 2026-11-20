/**
 * AL-2675 (WP2b, second release; the coordinator's rulings of 19 November
 * 2026 on the activation review, last paragraph): nothing reads the token's
 * tenant claim once authz.current_tenant_id() reads the request header, so
 * the seed stops writing `tenant_id` into its logins' account metadata. The
 * catalog gate holds that no policy and no tenant helper reads the claim.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const SEED = readFileSync("supabase/seed.sql", "utf8");

describe("AL-2675: the seed writes no tenant claim", () => {
  it("no seeded login carries tenant_id in its account metadata", () => {
    // The literal form (the demo owner) and the built form (the fixtures).
    expect(SEED).not.toMatch(/'\{"provider":"email"[^']*"tenant_id"/);
    expect(SEED).not.toMatch(
      /jsonb_build_object\('provider',[^;]*?'tenant_id', fixture\.tenant_id\)/,
    );
    // The logins keep their provider metadata.
    expect(SEED).toContain(
      `'{"provider":"email","providers":["email"]}'::jsonb`,
    );
    expect(SEED).toContain(
      "jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'))",
    );
  });
});
