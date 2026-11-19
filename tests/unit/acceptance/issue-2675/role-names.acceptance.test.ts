/**
 * AL-2675 (WP2a sweep; plan 12 WP2, the WP2a paragraph, and the WP2 exit
 * line "no policy or route reads the token claim", as far as routes go).
 *
 * 1. No handler under packages/api/src or packages/graphql passes or fails on
 *    a role-name string: no `requireRole`/`hasRole`/`hasAnyRole`/
 *    `hasContextRole`/`hasAnyContextRole` call, no `roles: [...]` gate, no
 *    comparison of a role with `admin` or `super_admin`, no `profileRole`.
 *    Handlers ask
 *    for a registry capability, the tenant-administrator flag or a membership
 *    class (`requireCapability`, `requireTenantAdministrator`,
 *    `requireRoleClass` and their `has`/`is` forms). The only remaining hits
 *    are WP2c's `super_admin` branches, which move to the operator list, and
 *    the demo-account persona chooser, which grants nothing; each is pinned
 *    here by count, so a new hit or a WP2c removal changes this file.
 * 2. No route reads the token's claims for its tenant or role.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ls = (...dirs: string[]) =>
  spawnSync("git", ["ls-files", "-co", "--exclude-standard", ...dirs], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .stdout.split("\n")
    .filter(
      (f) =>
        /\.(m|c)?[jt]sx?$/.test(f) &&
        !/(\.test\.|\.spec\.|\/tests?\/|__tests__)/.test(f),
    );

/**
 * The role names that are not membership classes. Comparing a membership
 * row's class with `staff`, `donor` or `missionary` is a membership fact.
 */
const ROLE_NAME = String.raw`["'\`](?:admin|super_admin)["'\`]`;
const PATTERNS = [
  /\b(?:requireRole|hasRole|hasAnyRole|hasContextRole|hasAnyContextRole)\s*\(/g,
  /\broles\s*:\s*\[/g,
  new RegExp(String.raw`\brole\s*[!=]==\s*${ROLE_NAME}`, "g"),
  new RegExp(String.raw`${ROLE_NAME}\s*[!=]==\s*[\w.?]*\brole\b`, "g"),
  /\bprofileRole\b/g,
];

/** Remaining hits, by file, with the reason each stays. */
const ALLOWED: Record<string, [number, string]> = {
  "packages/api/src/crm/auth/access.ts": [
    1,
    "WP2c: isSuperAdmin, the cross-tenant CRM branch",
  ],
  "packages/api/src/eve/audit/identity.ts": [
    1,
    "WP2c: the super_admin audit tenant override",
  ],
  "packages/api/src/eve/governance/route.ts": [
    3,
    "WP2c: the global kill switch and its super_admin readers",
  ],
  "packages/api/src/eve/notifications/route.ts": [
    1,
    "WP2c: recipient changes are the platform owner's",
  ],
  "packages/api/src/eve/launch-readiness/control.ts": [
    1,
    "WP2c: launch permissions are the platform owner's",
  ],
  "packages/api/src/eve/model-policy/permissions.ts": [
    1,
    "WP2c: the platform owner manages the model policy",
  ],
  "packages/api/src/eve/retention/control.ts": [
    1,
    "WP2c: retention holds are the platform owner's",
  ],
  "packages/api/src/admin/fund-directory.ts": [
    1,
    "WP2c: the super_admin cross-tenant directory",
  ],
  "packages/api/src/admin/missionary-directory.ts": [
    1,
    "WP2c: the super_admin cross-tenant directory",
  ],
  "packages/api/src/admin/member-care/route-helpers.ts": [
    1,
    "WP2c: isSuperAdmin on the member-care context",
  ],
  "packages/api/src/admin/support-hub/route-helpers.ts": [
    1,
    "WP2c: isSuperAdmin on the Support Hub context",
  ],
  "packages/api/src/auth/demo-account.ts": [
    1,
    "the demo persona to create; grants nothing",
  ],
  "packages/api/src/shared/with-operation.ts": [
    1,
    "WP2c: the roles option, which only the super_admin gates above pass",
  ],
};

function roleNameHits(text: string): number {
  return PATTERNS.reduce((n, re) => n + [...text.matchAll(re)].length, 0);
}

describe("AL-2675 sweep: no handler passes or fails on a role-name string", () => {
  it("packages/api/src and packages/graphql: role-name hits equal the WP2c allowlist exactly", () => {
    const found: Record<string, number> = {};
    for (const f of ls("packages/api/src", "packages/graphql")) {
      const n = roleNameHits(readFileSync(f, "utf8"));
      if (n > 0) found[f] = n;
    }
    expect(found).toEqual(
      Object.fromEntries(Object.entries(ALLOWED).map(([f, [n]]) => [f, n])),
    );
  });

  it("every allowed hit is a super_admin branch, WP2c's roles option or the demo persona chooser", () => {
    for (const f of Object.keys(ALLOWED)) {
      const text = readFileSync(f, "utf8");
      for (const re of PATTERNS)
        for (const m of text.matchAll(re)) {
          const near = text.slice(m.index!, m.index! + 160);
          expect(
            /super_admin/.test(near) ||
              (f.endsWith("with-operation.ts") &&
                /options\.roles/.test(near)) ||
              (f.endsWith("demo-account.ts") && /role === "admin"/.test(near)),
            `${f}: ${near.split("\n")[0]!.trim()}`,
          ).toBe(true);
        }
    }
  });

  it("the scan catches each planted form", () => {
    for (const planted of [
      'requireRole(auth, ["admin", "super_admin"]);',
      'withOperation(handler, { roles: ["staff", "admin"] });',
      'if (auth.role === "admin") return;',
      'if ("super_admin" !== ctx.role) throw new Error("Forbidden");',
      "const role = auth.profileRole;",
      'hasAnyContextRole(ctx, ["missionary"]);',
    ])
      expect(roleNameHits(planted), planted).toBeGreaterThan(0);
    for (const clean of [
      'requireCapability(auth, "admin.crm.manage");',
      "requireTenantAdministrator(auth);",
      'withOperation(handler, { roleClasses: ["donor", "staff"] });',
      'hasContextRoleClass(ctx, "missionary");',
    ])
      expect(roleNameHits(clean), clean).toBe(0);
  });
});

describe("AL-2675 sweep: no route reads the token claim (WP2 exit, routes)", () => {
  const CLAIM =
    /\b(?:app_metadata|user_metadata)\b|\bgetClaims\s*\(|\bjwt\.claims\b/;
  it("route code under packages/api/src, packages/graphql and the apps' API routes reads no claim", () => {
    const files = [
      ...ls("packages/api/src", "packages/graphql"),
      ...ls(
        "apps/admin/app/api",
        "apps/donor/app/api",
        "apps/missionary/app/api",
      ),
    ];
    expect(files.length).toBeGreaterThan(100);
    expect(files.filter((f) => CLAIM.test(readFileSync(f, "utf8")))).toEqual(
      [],
    );
  });

  it("the claim scan catches the planted forms", () => {
    for (const planted of [
      "const t = user.app_metadata?.tenant_id;",
      "const { data } = await supabase.auth.getClaims();",
      "const r = user.user_metadata.role;",
    ])
      expect(CLAIM.test(planted), planted).toBe(true);
  });
});
