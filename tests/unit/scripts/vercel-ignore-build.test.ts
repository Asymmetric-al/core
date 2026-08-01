import { describe, expect, it } from "vitest";

import {
  APPS,
  isSharedRuntimeInput,
  resolveBuildDecision,
} from "../../../scripts/vercel/should-ignore-build.mjs";

const appNames = Object.keys(APPS);

function buildMatrix(changedFiles: string[]) {
  return Object.fromEntries(
    appNames.map((app) => [
      app,
      resolveBuildDecision({ app, changedFiles }).build,
    ]),
  );
}

describe("Vercel ignored-build helper", () => {
  it("skips all apps for docs-only and evidence-only changes", () => {
    expect(
      buildMatrix([
        "docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md",
        "docs/ops/deploy-checklist.md",
        "openspec/changes/reduce-deploy-spend/proposal.md",
        ".github/workflows/sync-vercel-production-env.yml",
        "tests/unit/scripts/vercel-production-readiness.test.ts",
      ]),
    ).toEqual({
      admin: false,
      donor: false,
      missionary: false,
    });
  });

  it("builds only admin for admin app changes", () => {
    expect(buildMatrix(["apps/admin/app/(app)/page.tsx"])).toEqual({
      admin: true,
      donor: false,
      missionary: false,
    });
  });

  it("builds only donor for donor app changes", () => {
    expect(buildMatrix(["apps/donor/app/page.tsx"])).toEqual({
      admin: false,
      donor: true,
      missionary: false,
    });
  });

  it("builds only missionary for missionary app changes", () => {
    expect(buildMatrix(["apps/missionary/app/page.tsx"])).toEqual({
      admin: false,
      donor: false,
      missionary: true,
    });
  });

  it("builds all apps for shared packages and lockfile or build config changes", () => {
    for (const changedFile of [
      "packages/api/src/profile/queries.ts",
      "packages/ui/components/button.tsx",
      "bun.lock",
      "package.json",
      "turbo.json",
      "scripts/resolve-monorepo-root.mjs",
      "scripts/vercel/should-ignore-build.mjs",
      "tsconfig.json",
    ]) {
      expect(buildMatrix([changedFile])).toEqual({
        admin: true,
        donor: true,
        missionary: true,
      });
    }
  });

  it("classifies shared runtime inputs without promoting docs or tests", () => {
    expect(isSharedRuntimeInput("packages/api/src/index.ts")).toBe(true);
    expect(isSharedRuntimeInput("tooling/typescript-config/base.json")).toBe(
      true,
    );
    expect(isSharedRuntimeInput("scripts/vercel/should-ignore-build.mjs")).toBe(
      true,
    );
    expect(isSharedRuntimeInput("docs/ops/environments.md")).toBe(false);
    expect(isSharedRuntimeInput("tests/tsconfig.json")).toBe(false);
  });

  it("fails closed for unknown apps and missing diff context", () => {
    expect(
      resolveBuildDecision({
        app: "unknown",
        changedFiles: ["docs/ops/environments.md"],
      }),
    ).toMatchObject({
      build: true,
      matchedFile: null,
      reason: "unknown app: unknown",
    });

    expect(
      resolveBuildDecision({
        app: "admin",
        changedFiles: [],
      }),
    ).toMatchObject({
      build: true,
      matchedFile: null,
      reason: "missing diff context",
    });
  });
});
