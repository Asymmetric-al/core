import { describe, expect, it } from "vitest";

import { buildCrmLinks } from "../../../../../../apps/admin/features/support-hub/components/detail/conversation-crm-links";

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

  it("keeps only supported destinations and the email fallback", () => {
    const links = buildCrmLinks(
      {
        contactId: "crm-1",
        donorId: "donor-1",
        contributionId: "11111111-1111-4111-8111-111111111111",
        missionaryId: "missionary-1",
        churchId: "church-1",
        crmPersonId: null,
        giftId: null,
      },
      "anita@example.com",
    );
    expect(links.map((link) => link.key)).toEqual([
      "contact-search",
      "donor",
      "gift",
    ]);
  });

  it("uses the donor drawer and rejects unsupported gift identifiers", () => {
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
      "/crm?donor=donor-99",
    );
    expect(links.find((link) => link.key === "gift")).toBeUndefined();
    expect(
      buildCrmLinks(
        { contributionId: "11111111-1111-4111-8111-111111111111" } as never,
        null,
      )[0]?.href,
    ).toBe("/contributions?gift=11111111-1111-4111-8111-111111111111");
  });
});
