import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ ensure: vi.fn(), direct: vi.fn() }));

vi.mock(
  "../../../apps/admin/src/cms/site-presentation-step.ts",
  async (original) => ({
    ...(await original<Record<string, unknown>>()),
    ensureSitePresentation: h.ensure,
  }),
);

vi.mock(
  "../../../apps/admin/src/cms/ports/service-port.ts",
  async (original) => ({
    ...(await original<Record<string, unknown>>()),
    createSitePresentation: h.direct,
  }),
);

const TENANT_A = "00000000-0000-0000-0000-000000000001";
const TENANT_B = "00000000-0000-0000-0000-000000000002";
const SITE_1 = "5b53f899-8988-6455-fb3d-bb9fe896184c";
const SITE_2 = "fb579386-29aa-f665-03e5-84adfaaff133";
const NOT_A_SITE = "0b0f4a52-38b4-4c55-a1d2-2b2a3e9f0c11";

describe("AL-2679 WP6 rest: the local and CI fixtures present the seed's Sites", () => {
  it("makes each Site's presentation through the one CMS step, reading the Site from the Sites the fixture read from Core", async () => {
    h.ensure.mockImplementation(async (_payload, { siteId }) => ({
      id: siteId,
    }));
    const { seedCmsFixtures } =
      await import("../../../scripts/cms/lib/cms-fixtures.mjs");
    const payload = { marker: "payload" };
    const sites = [
      { id: SITE_1, tenantId: TENANT_A, isDefault: false, mediaId: NOT_A_SITE },
      { id: SITE_2, tenantId: TENANT_B, isDefault: false, mediaId: NOT_A_SITE },
    ];
    const summary = await seedCmsFixtures(payload, sites);
    expect(h.direct).not.toHaveBeenCalled();
    expect(h.ensure).toHaveBeenCalledTimes(2);
    for (const [index, site] of sites.entries()) {
      const [given, args] = h.ensure.mock.calls[index]!;
      expect(given).toBe(payload);
      expect(args.siteId).toBe(site.id);
      expect(args.actingTenantId).toBeUndefined();
      expect(await args.readSite(site.id)).toEqual({
        id: site.id,
        tenantId: site.tenantId,
      });
      expect(await args.readSite(NOT_A_SITE)).toBeNull();
    }
    expect(summary["site presentations"]).toBe("2");
  });

  it("finds a Site the way the step asks for it, whatever the letter case of the id it was given", async () => {
    h.ensure.mockReset();
    h.ensure.mockImplementation(async (_payload, { siteId }) => ({
      id: siteId,
    }));
    const { seedCmsFixtures } =
      await import("../../../scripts/cms/lib/cms-fixtures.mjs");
    await seedCmsFixtures({}, [
      {
        id: SITE_1.toUpperCase(),
        tenantId: TENANT_A,
        isDefault: false,
        mediaId: NOT_A_SITE,
      },
    ]);
    const [, args] = h.ensure.mock.calls[0]!;
    expect(await args.readSite(SITE_1)).toEqual({
      id: SITE_1,
      tenantId: TENANT_A,
    });
  });
});
