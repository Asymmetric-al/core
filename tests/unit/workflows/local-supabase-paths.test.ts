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
