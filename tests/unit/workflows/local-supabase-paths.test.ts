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
  ])("starts the journeys when %s changes", (file) => {
    expect(paths).toContain(file);
  });

  it("starts them when either app's chooser changes", () => {
    // Mission Control's chooser lives in (auth), which the filter names.
    expect(paths).toContain("apps/*/app/(auth)/**");
    expect(paths).toContain("apps/missionary/app/choose-organization/**");
  });
});
