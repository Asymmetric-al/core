import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadWorkflowDocument } from "../helpers/workflow-yaml";

/**
 * Council round 2, AR10. `.github/workflows/local-supabase.yml` runs the auth
 * email journeys, the only real-rows test of the proxy's membership read, on a
 * pull request that touches what they cover. A change to a journey, or to the
 * chooser it walks through, must start it.
 */
const paths = (() => {
  const document = loadWorkflowDocument(
    ".github/workflows/local-supabase.yml",
  ) as { on: { pull_request: { paths: string[] } } };
  return document.on.pull_request.paths;
})();

describe("the local Supabase workflow's path filter", () => {
  it.each([
    "tests/e2e/auth-password-recovery.spec.ts",
    "tests/e2e/auth-signup-confirmation.spec.ts",
    "tests/e2e/auth-two-organizations.spec.ts",
    "tests/e2e/helpers/auth-mail.ts",
    "playwright.auth-mail.config.ts",
    // AL-2675: the first release's reads against the second release's policies.
    "tests/e2e/auth-request-scope-reads.spec.ts",
    "tests/e2e/auth-members-invitations.spec.ts",
    "tests/unit/acceptance/issue-2676/membership-invitations.postgrest.acceptance.test.ts",
    "tests/unit/acceptance/issue-2676/operator-admin-invite.localstack.test.ts",
    "tests/unit/acceptance/issue-2676/sites.postgrest.acceptance.test.ts",
    "tests/unit/acceptance/issue-2676/site-fixture.ts",
    "packages/api/src/admin/members/**",
    "packages/api/src/invitations/**",
    "apps/admin/app/(app)/settings/teams/**",
    "packages/lib/monitoring/**",
    "apps/*/instrumentation-client.ts",
    "tests/e2e/helpers/request-scope-reads.ts",
    "packages/database/document-scope.tsx",
    "packages/database/own-api.ts",
    "packages/database/request-scope-headers.ts",
    "packages/database/supabase/client.ts",
    "packages/database/supabase/server.ts",
    "packages/api/src/shared/request-session-client.ts",
  ])("starts the journeys when %s changes", (file) => {
    expect(paths).toContain(file);
  });

  it.each([
    "apps/admin/app/(app)/settings/sites/**",
    "apps/admin/app/api/admin/sites/**",
    "packages/api/src/admin/sites/**",
    "tests/e2e/auth-sites-settings.spec.ts",
  ])(
    "starts the Sites settings journey and its PostgREST proof when %s changes (AL-2676 WP3b part 3)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it("D-18 (AL-2676 WP3a part 2a adds provisioning's second-factor proof to the stack): starts the stack when that proof changes", () => {
    expect(paths).toContain(
      "tests/unit/acceptance/issue-2676/tenant-provisioning.localstack.test.ts",
    );
  });

  it.each([
    "tests/unit/acceptance/issue-2678/identity-keys.postgrest.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/identity-keys.postgrest-fixture.ts",
    "tests/unit/acceptance/issue-2678/worker-names.postgrest.acceptance.test.ts",
  ])(
    "starts the identity-key and worker-name proofs when %s, a suite or their shared fixture, changes (AL-2678 r2a)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/supporter-names.postgrest.acceptance.test.ts",
    "packages/api/src/missionary-portal/**",
    "packages/api/src/follower-requests/**",
    "packages/api/src/missionaries/**",
    "packages/api/src/donations/**",
    "packages/graphql/**",
  ])(
    "starts the supporter-name proof when %s, the suite or a reader it drives, changes (AL-2678 r2s)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/assignment-keys.postgrest.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/assignment-keys.realstack.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/assignment-keys-race.realstack.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/assignment-keys-migration.realstack.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/assignment-keys.helpers.ts",
    "packages/api/src/admin/crm/**",
    "packages/database/types/crm-detail.ts",
    "packages/database/types/crm-grid.ts",
  ])(
    "starts the assignment-key proof when %s, a suite or a CRM reader or response type it drives, changes (AL-2678 r3)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/worker-record.postgrest.acceptance.test.ts",
    "tests/unit/acceptance/issue-2678/worker-record.postgrest-fixture.ts",
    "packages/api/src/admin/workers/**",
    "apps/admin/app/api/admin/workers/**",
    "apps/admin/app/(app)/workers/**",
    "apps/admin/features/mission-control/workers/**",
    "tests/e2e/auth-worker-record.spec.ts",
  ])(
    "starts the worker-record proof and journey when %s, the suite, the module, its routes or its screens, changes (AL-2678 r2b1)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/e2e/auth-add-partner.spec.ts",
    "packages/missionary/components/add-partner-*",
    "packages/api/src/missionary-portal/**",
    "apps/missionary/app/donors/**",
    "apps/missionary/app/api/missionary/donors/**",
  ])(
    "starts the Add Partner journey when %s, the journey, the dialog, the command's route or the page with both buttons, changes (AL-2678 WP5 rest)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/added-partner-visibility.postgrest.acceptance.test.ts",
    "packages/api/src/missionary-portal/**",
  ])(
    "starts the added partner's visibility proof when %s, the suite or the module it drives, changes (AL-2678 WP5 rest, fix round F7)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/worker-gift.postgrest.acceptance.test.ts",
    "packages/api/src/donate/**",
    "packages/api/src/donations/**",
    "packages/graphql/**",
  ])(
    "starts the worker's stored-gift proof when %s, the suite or an entry point it drives, changes (AL-2678 WP5 rest 2a, fix round F1)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/crm-pages.postgrest.acceptance.test.ts",
    "packages/api/src/admin/crm/**",
  ])(
    "starts the paged-CRM proof when %s, the suite or the CRM module it drives, changes (AL-2678 WP5 rest r6)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2678/own-donor-reads.postgrest.acceptance.test.ts",
    "packages/api/src/feed-preferences/**",
    "packages/api/src/reads/**",
    "packages/api/src/shared/queries.ts",
    "packages/lib/hooks/use-donor-record.ts",
  ])(
    "starts the own-donor proof when %s, the suite or a reader it drives, changes (AL-2678 WP5 rest)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "packages/api/src/donor-portal/**",
    "packages/api/src/posts/**",
    "packages/api/src/donations/**",
    "packages/graphql/**",
    "packages/database/hooks/donor-feed-posts.ts",
    "packages/api/src/admin/contribution-operations/**",
  ])(
    "starts the identity-key proof when %s, a reader of a worker's name outside Mission Control, changes (AL-2678 r1; r2a adds the receipts test 5 renders)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it.each([
    "tests/unit/acceptance/issue-2680/review-routes.postgrest.acceptance.test.ts",
    "packages/api/src/admin/posts/**",
  ])(
    "starts the review routes' proof when %s, the suite or the review route it drives, changes (AL-2680 fix round T7)",
    (file) => {
      expect(paths).toContain(file);
    },
  );

  it("starts them when either app's chooser changes", () => {
    // Mission Control's chooser lives in (auth), which the filter names.
    expect(paths).toContain("apps/*/app/(auth)/**");
    expect(paths).toContain("apps/missionary/app/choose-organization/**");
  });

  it("starts the replay when the catalog gate or its security exception lists change", () => {
    expect(paths).toContain("scripts/verify/tenant-rls-catalog.mjs");
    expect(paths).toContain("docs/security/*.json");
  });
});

describe("AL-2675 WP2c part 2a, T7: the operator area journey starts the stack", () => {
  it.each([
    "apps/admin/app/(operator)/**",
    "tests/e2e/auth-operator-area.spec.ts",
    "tests/e2e/helpers/totp.ts",
    "scripts/e2e/tee-dev-server.mjs",
    "packages/auth/**",
    "apps/*/proxy.ts",
  ])("starts the journeys when %s changes", (file) => {
    expect(paths).toContain(file);
  });
});

function matchesPattern(pattern: string, file: string): boolean {
  const source = pattern
    .split(/(\*\*|\*)/)
    .map((part) =>
      part === "**"
        ? ".*"
        : part === "*"
          ? "[^/]*"
          : part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
  return new RegExp(`^${source}$`).test(file);
}

function resolveImport(from: string, specifier: string): string | null {
  const base = path.posix.join(path.posix.dirname(from), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    `${base}.js`,
    `${base}/index.ts`,
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function journeyImports(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift()!;
    const text = readFileSync(file, "utf8");
    for (const [, specifier] of text.matchAll(
      /(?:^|\n)\s*(?:import|export)\b[^;]*?\bfrom\s+["'](\.{1,2}\/[^"']+)["']/g,
    )) {
      const target = resolveImport(file, specifier!);
      expect(target, `${file} imports ${specifier}`).not.toBeNull();
      if (!target || seen.has(target)) continue;
      seen.add(target);
      if (target.startsWith("tests/")) queue.push(target);
    }
  }
  return [...seen].sort();
}

describe("#2845 item 2 (AL-2675 WP2c rest): a helper the operator journey imports starts the stack", () => {
  const imports = journeyImports("tests/e2e/auth-operator-area.spec.ts");

  it("derives the journey's imports, its helpers among them", () => {
    expect(imports).toEqual(
      expect.arrayContaining([
        "tests/e2e/helpers/auth-mail.ts",
        "tests/e2e/helpers/browser-stores.ts",
        "tests/e2e/helpers/operator-reads.ts",
        "tests/e2e/helpers/secret-pages.ts",
        "tests/e2e/helpers/totp.ts",
      ]),
    );
  });

  it("lists every file the journey imports in the path filter", () => {
    const unlisted = imports.filter(
      (file) => !paths.some((pattern) => matchesPattern(pattern, file)),
    );
    expect(
      unlisted,
      "imported by the operator journey, not in the filter",
    ).toEqual([]);
  });

  it("matches a pattern the way the filter does", () => {
    expect(
      matchesPattern("packages/auth/**", "packages/auth/constants.ts"),
    ).toBe(true);
    expect(
      matchesPattern(
        "apps/admin/app/(operator)/**",
        "apps/admin/app/(operator)/operator/page.tsx",
      ),
    ).toBe(true);
    expect(matchesPattern("apps/*/proxy.ts", "apps/admin/proxy.ts")).toBe(true);
    expect(matchesPattern("apps/*/proxy.ts", "apps/admin/x/proxy.ts")).toBe(
      false,
    );
    expect(
      matchesPattern("tests/e2e/helpers/totp.ts", "tests/e2e/helpers/totp.tsx"),
    ).toBe(false);
  });
});
