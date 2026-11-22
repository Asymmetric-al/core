import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("giving target boundaries", () => {
  it.each([
    "apps/admin/src/cms/collections/page-builders.ts",
    "apps/admin/src/cms/create-from-template-endpoint.ts",
  ])("%s filters system funds in its project picker lookup", (path) => {
    expect(readFileSync(path, "utf8")).toMatch(
      /\.from\("funds"\)\s*\.select\([^;]+?\.is\("system_purpose", null\)/,
    );
  });

  it("exposes no direct organization-settings API or package export", () => {
    expect(existsSync("apps/admin/app/api/admin/org-settings/route.ts")).toBe(
      false,
    );
    expect(
      JSON.parse(readFileSync("packages/api/package.json", "utf8")).exports,
    ).not.toHaveProperty("./admin/org-settings");
  });
});
