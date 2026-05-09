import { describe, expect, it } from "vitest";

import { buildCrmLinks } from "../../../../../../apps/admin/features/support-hub/components/detail/ConversationCrmLinks";

describe("buildCrmLinks", () => {
  it("returns no links when no contact + no email is present", () => {
    expect(buildCrmLinks(null, null)).toEqual([]);
  });

  it("falls back to a CRM email search when only the donor email is known", () => {
    const links = buildCrmLinks(null, "anita@example.com");
    expect(links).toHaveLength(1);
    expect(links[0]?.key).toBe("contact-search");
    expect(links[0]?.href).toContain("anita%40example.com");
  });

  it("renders profile + donor + gift + missionary + church chips when ids are present", () => {
    const links = buildCrmLinks(
      {
        contactId: "crm-1",
        donorId: "donor-1",
        contributionId: "gift-1",
        missionaryId: "missionary-1",
        churchId: "church-1",
        crmPersonId: null,
        giftId: null,
      },
      "anita@example.com",
    );
    expect(links.map((link) => link.key)).toEqual([
      "contact",
      "donor",
      "gift",
      "missionary",
      "church",
    ]);
  });

  it("uses /contributions for donor + gift links", () => {
    const links = buildCrmLinks(
      {
        contactId: null,
        donorId: "donor-99",
        contributionId: "gift-99",
        missionaryId: null,
        churchId: null,
        crmPersonId: null,
        giftId: null,
      },
      null,
    );
    expect(links.find((l) => l.key === "donor")?.href).toContain(
      "/contributions?donor=donor-99",
    );
    expect(links.find((l) => l.key === "gift")?.href).toContain(
      "/contributions?contribution=gift-99",
    );
  });
});
