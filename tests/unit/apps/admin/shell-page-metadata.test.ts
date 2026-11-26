import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CONTRIBUTIONS_PAGE_META } from "../../../../apps/admin/components/table-page-meta";

const root = new URL("../../../../apps/admin/app/", import.meta.url);
describe("shell-owned page metadata", () => {
  it("describes the complete contribution task", () => {
    expect(CONTRIBUTIONS_PAGE_META.description).toBe(
      "Find a gift, check its payment and receipt, and refund, correct or resend it.",
    );
  });

  it.each([
    ["(app)/page.tsx", "Home"],
    ["(app)/settings/page.tsx", "Administration"],
    ["(app)/settings/teams/page.tsx", "Members"],
    ["(app)/settings/sites/page.tsx", "Sites"],
    ["(app)/settings/eve/page.tsx", "Eve operations"],
    ["(app)/reports/page.tsx", "Reports"],
    ["(app)/workers/page.tsx", "Workers"],
    ["(app)/workers/[assignmentId]/page.tsx", "Worker"],
    ["(app)/settings/integrations/resend/page.tsx", "Email delivery"],
    ["(app)/help/about/page.tsx", "About"],
    ["(auth)/forgot-password/page.tsx", "Forgot password"],
    ["(auth)/register/page.tsx", "Registration unavailable"],
    ["(auth)/no-access/page.tsx", "No access"],
    ["(auth)/login/page.tsx", "Sign in"],
  ])("gives %s a page-specific history and tab title", (path, title) => {
    const source = readFileSync(new URL(path, root), "utf8");
    const metadata = source.match(
      /export const metadata:\s*Metadata\s*=\s*\{([\s\S]*?)\};/,
    );
    expect(metadata).not.toBeNull();
    expect(metadata?.[1]).toContain(`title: "${title}"`);
    expect(source).not.toMatch(/^"use client"/);
  });

  it("removes the old (app)/admin directory once pages move under (app)/settings", () => {
    expect(existsSync(new URL("(app)/admin", root))).toBe(false);
  });
});
