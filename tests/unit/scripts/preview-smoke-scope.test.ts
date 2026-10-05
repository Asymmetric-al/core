import { describe, expect, it } from "vitest";

import { resolvePreviewSmokeScope } from "../../../scripts/qa/preview-smoke-scope.mjs";

describe("resolvePreviewSmokeScope", () => {
  it("targets only the changed app surface", () => {
    const scope = resolvePreviewSmokeScope([
      "apps/admin/app/(app)/admin/page.tsx",
    ]);

    expect(scope.admin).toBe(true);
    expect(scope.donor).toBe(false);
    expect(scope.missionary).toBe(false);
    expect(scope.scope).toBe("admin");
  });

  it("targets all surfaces for shared runtime packages", () => {
    const scope = resolvePreviewSmokeScope([
      "packages/ui/components/shadcn/button.tsx",
    ]);

    expect(scope.admin).toBe(true);
    expect(scope.donor).toBe(true);
    expect(scope.missionary).toBe(true);
    expect(scope.scope).toBe("all");
  });

  it.each([
    "packages/missionary/components/dashboard-home.tsx",
    "packages/missionary",
    "./packages\\missionary\\components\\dashboard-home.tsx",
  ])("targets the missionary app for its runtime package: %s", (file) => {
    const scope = resolvePreviewSmokeScope([file]);

    expect(scope.admin).toBe(false);
    expect(scope.donor).toBe(false);
    expect(scope.missionary).toBe(true);
    expect(scope.any).toBe(true);
    expect(scope.scope).toBe("missionary");
  });

  it("combines the missionary runtime package with another app surface", () => {
    const scope = resolvePreviewSmokeScope([
      "packages/missionary/components/dashboard-home.tsx",
      "apps/admin/app/(app)/admin/page.tsx",
    ]);

    expect(scope.scope).toBe("admin/missionary");
    expect(scope.donor).toBe(false);
  });

  it("does not match similarly named missionary package paths", () => {
    const scope = resolvePreviewSmokeScope([
      "packages/missionary-tools/index.ts",
    ]);

    expect(scope.any).toBe(false);
    expect(scope.scope).toBe("none");
  });

  it("targets all surfaces when the Bun pin file changes", () => {
    const scope = resolvePreviewSmokeScope([".bun-version"]);

    expect(scope.admin).toBe(true);
    expect(scope.donor).toBe(true);
    expect(scope.missionary).toBe(true);
    expect(scope.scope).toBe("all");
  });

  it("targets all surfaces for smoke test and Playwright config changes", () => {
    const smokeSpec = resolvePreviewSmokeScope([
      "tests/e2e/support-hub.smoke.spec.ts",
    ]);
    const config = resolvePreviewSmokeScope([
      "playwright.missionary.config.ts",
    ]);
    const sharedConfigModule = resolvePreviewSmokeScope([
      "tests/e2e/playwright-shared.ts",
    ]);

    expect(smokeSpec.scope).toBe("all");
    expect(config.scope).toBe("all");
    expect(sharedConfigModule.scope).toBe("all");
  });

  it("skips docs-only changes", () => {
    const scope = resolvePreviewSmokeScope([
      "docs/qa/pr-preview-smoke.md",
      "docs/ops/environments.md",
    ]);

    expect(scope.any).toBe(false);
    expect(scope.scope).toBe("none");
  });
});
