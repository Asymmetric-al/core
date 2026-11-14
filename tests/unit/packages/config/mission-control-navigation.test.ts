import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  findNavDestination,
  getNavItemsByRole,
  getNavSectionsByRole,
  navigation,
} from "../../../../packages/config/navigation";
import { quickActionsForRole, tiles } from "../../../../packages/config/tiles";

const ADMIN_APP = join(__dirname, "../../../../apps/admin/app");

/** The admin page file a Mission Control href renders. */
function pageExists(href: string) {
  // Web Studio pages are served by Payload's catch-all route.
  if (href === "/web-studio" || href.startsWith("/web-studio/")) {
    return existsSync(
      join(ADMIN_APP, "(payload)/web-studio/[[...segments]]/page.tsx"),
    );
  }
  const segment = href === "/" ? "" : href.slice(1);
  return existsSync(join(ADMIN_APP, "(app)", segment, "page.tsx"));
}

describe("Mission Control navigation", () => {
  it("links every destination and sub-page to a page that exists", () => {
    for (const item of navigation) {
      expect(pageExists(item.href), item.href).toBe(true);
      for (const sub of item.items ?? []) {
        expect(pageExists(sub.href), sub.href).toBe(true);
      }
    }
  });

  it("names each destination once", () => {
    const titles = navigation.map((item) => item.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("groups an administrator's destinations into the sidebar sections", () => {
    const sections = getNavSectionsByRole("admin").map((group) => ({
      label: group.label,
      ids: group.items.map((item) => item.id),
    }));
    expect(sections).toEqual([
      { label: null, ids: ["home"] },
      {
        label: "Modules",
        ids: ["crm", "contributions", "reports", "feed", "care", "mobilize"],
      },
      {
        label: "Tools",
        ids: [
          "web-studio",
          "email",
          "pdf",
          "tasks",
          "support",
          "events",
          "automations",
        ],
      },
      { label: "System", ids: ["admin"] },
    ]);
  });

  it("shows a role only the destinations it works in", () => {
    const ids = getNavSectionsByRole("finance").flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(ids).toContain("contributions");
    expect(ids).not.toContain("crm");
  });

  it("finds the destination and sub-page for a path", () => {
    expect(findNavDestination("/")?.item.id).toBe("home");
    expect(findNavDestination("/crm")).toMatchObject({
      item: { id: "crm" },
      sub: { id: "crm-records" },
    });
    expect(findNavDestination("/crm/notes")).toMatchObject({
      item: { id: "crm" },
      sub: { id: "crm-notes" },
    });
    expect(findNavDestination("/care/directory/abc")).toMatchObject({
      item: { id: "care" },
      sub: { id: "care-directory" },
    });
    expect(findNavDestination("/settings/integrations/resend")).toMatchObject({
      item: { id: "admin" },
      sub: { id: "admin-email-delivery" },
    });
    expect(findNavDestination("/contributions/abc")).toMatchObject({
      item: { id: "contributions" },
      sub: null,
    });
    expect(findNavDestination("/crmx")).toBeNull();
  });

  it("offers Support Hub tickets beside its inbox, to the same roles", () => {
    const support = navigation.find((item) => item.id === "support")!;
    expect(support.items?.map((sub) => sub.href)).toEqual([
      "/support",
      "/support/tickets",
      "/support/reports",
      "/support/settings",
    ]);
    const tickets = support.items!.find((sub) => sub.id === "support-tickets");
    expect(tickets).toMatchObject({ title: "Tickets" });
    expect(tickets?.roles).toBeUndefined();
    expect(findNavDestination("/support/tickets/abc")).toMatchObject({
      item: { id: "support" },
      sub: { id: "support-tickets" },
    });
  });
});

describe("Mission Control search aliases", () => {
  const entries = navigation.flatMap((item) => [
    { title: item.title, keywords: item.keywords },
    ...(item.items ?? []).map((sub) => ({
      title: `${item.title} › ${sub.title}`,
      keywords: sub.keywords,
    })),
  ]);

  it("gives every destination aliases that are trimmed, lowercase and distinct", () => {
    for (const { title, keywords } of entries) {
      expect(keywords?.length ?? 0, title).toBeGreaterThan(0);
      for (const keyword of keywords ?? []) {
        expect(keyword, title).toBe(keyword.trim().toLowerCase());
        expect(keyword.length, title).toBeGreaterThan(0);
        // An alias that repeats the title adds nothing to search.
        expect(keyword, title).not.toBe(title.toLowerCase());
      }
      expect(new Set(keywords).size, title).toBe(keywords?.length);
    }
  });

  it("finds pages by the words staff use for them", () => {
    const keywordsOf = (id: string) =>
      navigation.flatMap((item) =>
        item.id === id
          ? [...(item.keywords ?? [])]
          : (item.items ?? [])
              .filter((sub) => sub.id === id)
              .flatMap((sub) => [...(sub.keywords ?? [])]),
      );
    expect(keywordsOf("contributions")).toEqual(
      expect.arrayContaining(["donations", "gifts", "receipts"]),
    );
    expect(keywordsOf("crm-records")).toContain("contacts");
    expect(keywordsOf("crm-relationships")).toContain("households");
    expect(keywordsOf("support")).toContain("help desk");
    expect(keywordsOf("automations-runs")).toContain("workflows");
    expect(keywordsOf("admin-email-delivery")).toContain("resend");
  });

  it("keeps aliases out of the role filter", () => {
    const support = getNavItemsByRole("member_care").find(
      (item) => item.id === "support",
    );
    expect(support?.keywords).toEqual(
      navigation.find((item) => item.id === "support")?.keywords,
    );
    expect(
      getNavItemsByRole("finance")
        .find((item) => item.id === "admin")
        ?.items?.find((sub) => sub.id === "admin-email-delivery")?.keywords,
    ).toBeDefined();
  });
});

describe("Mission Control destinations by role", () => {
  // The Eve page admits admins only (workspace-access: admin or super
  // admin); finance staff see Administration but must not be offered Eve.
  const hrefs = (role: Parameters<typeof getNavItemsByRole>[0]) =>
    getNavItemsByRole(role).flatMap((item) => [
      item.href,
      ...(item.items ?? []).map((sub) => sub.href),
    ]);

  it("offers Eve in navigation and search only to admins", () => {
    expect(hrefs("admin")).toContain("/admin/eve");
    expect(hrefs("finance")).toContain("/admin");
    expect(hrefs("finance")).not.toContain("/admin/eve");
  });

  it("offers Home's Eve shortcut only to admins", () => {
    const admin = tiles.find((tile) => tile.id === "admin")!;
    const labels = (role: Parameters<typeof quickActionsForRole>[1]) =>
      quickActionsForRole(admin, role).map((action) => action.href);
    expect(labels("admin")).toContain("/admin/eve");
    expect(labels("finance")).not.toContain("/admin/eve");
    expect(labels("finance")).toContain("/admin");
  });

  it("offers the staff directory, which reads admin-only accounts, only to admins", () => {
    const admin = tiles.find((tile) => tile.id === "admin")!;
    const shortcuts = (role: Parameters<typeof quickActionsForRole>[1]) =>
      quickActionsForRole(admin, role).map((action) => action.href);
    expect(hrefs("admin")).toContain("/admin/teams");
    expect(hrefs("finance")).not.toContain("/admin/teams");
    expect(shortcuts("admin")).toContain("/admin/teams");
    expect(shortcuts("finance")).not.toContain("/admin/teams");
  });
});
