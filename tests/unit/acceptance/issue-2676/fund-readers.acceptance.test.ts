import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("giving target boundaries", () => {
  it.each(["apps/admin/src/cms/tenancy/core-session.ts"])(
    "%s filters system funds in its project picker lookup (D-18: WP6 part 2b moves both fund reads to the caller-session helper)",
    (path) => {
      expect(readFileSync(path, "utf8")).toMatch(
        /\.from\("funds"\)\s*\.select\([^;]+?\.is\("system_purpose", null\)/,
      );
    },
  );

  it("exposes no direct organization-settings API or package export", () => {
    expect(existsSync("apps/admin/app/api/admin/org-settings/route.ts")).toBe(
      false,
    );
    expect(
      JSON.parse(readFileSync("packages/api/package.json", "utf8")).exports,
    ).not.toHaveProperty("./admin/org-settings");
  });
});
