import { describe, expect, it, vi } from "vitest";

const SITE = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
const OTHER_SITE = "5b53f899-8988-6455-fb3d-bb9fe896184c";
const TENANT_A = "00000000-0000-0000-0000-000000000001";
const TENANT_B = "00000000-0000-0000-0000-000000000002";

type Row = { id: string; tenant: string };
type Site = { id: string; tenantId: string };

function store(
  rows: Row[] = [],
  { concurrentWriter }: { concurrentWriter?: Row } = {},
) {
  const table = new Map(rows.map((row) => [row.id, { ...row }]));
  const find = vi.fn(
    async ({ where }: { where: { id: { equals: string } } }) => {
      const row = table.get(where.id.equals.toLowerCase());
      return { docs: row ? [{ ...row }] : [] };
    },
  );
  const create = vi.fn(async ({ data }: { data: Row }) => {
    if (concurrentWriter && !table.has(concurrentWriter.id)) {
      table.set(concurrentWriter.id, { ...concurrentWriter });
    }
    if (table.has(data.id)) {
      throw Object.assign(new Error("duplicate key value"), {
        code: "23505",
      });
    }
    table.set(data.id, { id: data.id, tenant: data.tenant });
    return { ...table.get(data.id)! };
  });
  const payload = {
    create,
    find,
    findByID: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { table, payload, create, find };
}

function core(sites: Site[]) {
  return vi.fn(
    async (siteId: string) => sites.find((site) => site.id === siteId) ?? null,
  );
}

const load = () => import("../../../apps/admin/src/cms/site-presentation-step");

describe("AL-2679 WP6 rest: the one CMS step every Site creation path calls", () => {
  it("writes one presentation under the Site's ID and the tenant Core holds, in lower case", async () => {
    const { ensureSitePresentation } = await load();
    const { payload, table } = store();
    const readSite = core([{ id: SITE, tenantId: TENANT_A.toUpperCase() }]);
    const row = await ensureSitePresentation(payload as never, {
      siteId: SITE.toUpperCase(),
      readSite,
    });
    expect(readSite).toHaveBeenCalledTimes(1);
    expect(readSite).toHaveBeenCalledWith(SITE);
    expect(row).toMatchObject({ id: SITE, tenant: TENANT_A });
    expect([...table.values()]).toEqual([{ id: SITE, tenant: TENANT_A }]);
  });

  it("writes nothing when the Site already has its presentation under the same tenant", async () => {
    const { ensureSitePresentation } = await load();
    const { payload, create, table } = store([{ id: SITE, tenant: TENANT_A }]);
    const row = await ensureSitePresentation(payload as never, {
      siteId: SITE,
      readSite: core([{ id: SITE, tenantId: TENANT_A }]),
    });
    expect(row).toMatchObject({ id: SITE, tenant: TENANT_A });
    expect(create).not.toHaveBeenCalled();
    expect(table.size).toBe(1);
  });

  it.each([
    ["an ID Core does not hold", SITE, []],
    ["a text that is not a UUID", "not-a-uuid", []],
    [
      "a reader answering another Site",
      SITE,
      [{ id: OTHER_SITE, tenantId: TENANT_A }],
    ],
  ])("refuses %s, writing nothing", async (_label, siteId, sites) => {
    const { ensureSitePresentation } = await load();
    const { payload, create, table } = store();
    const readSite = vi.fn(async () => (sites as Site[])[0] ?? null);
    await expect(
      ensureSitePresentation(payload as never, { siteId, readSite }),
    ).rejects.toMatchObject({
      name: "SitePresentationRefusal",
      reason: "not-a-site",
    });
    expect(create).not.toHaveBeenCalled();
    expect(table.size).toBe(0);
    if (siteId === "not-a-uuid") expect(readSite).not.toHaveBeenCalled();
  });

  it("refuses a Site of another organization than the one it acts for, and takes the acting tenant as a UUID", async () => {
    const { ensureSitePresentation } = await load();
    const { payload, create } = store();
    await expect(
      ensureSitePresentation(payload as never, {
        siteId: SITE,
        readSite: core([{ id: SITE, tenantId: TENANT_B }]),
        actingTenantId: TENANT_A,
      }),
    ).rejects.toMatchObject({ reason: "other-organization" });
    expect(create).not.toHaveBeenCalled();
    const row = await ensureSitePresentation(payload as never, {
      siteId: SITE,
      readSite: core([{ id: SITE, tenantId: TENANT_A }]),
      actingTenantId: TENANT_A.toUpperCase(),
    });
    expect(row).toMatchObject({ id: SITE, tenant: TENANT_A });
  });

  it("refuses a Site whose presentation is held under another tenant, and changes nothing", async () => {
    const { ensureSitePresentation } = await load();
    const { payload, create, table } = store([{ id: SITE, tenant: TENANT_B }]);
    await expect(
      ensureSitePresentation(payload as never, {
        siteId: SITE,
        readSite: core([{ id: SITE, tenantId: TENANT_A }]),
      }),
    ).rejects.toMatchObject({ reason: "presentation-elsewhere" });
    expect(create).not.toHaveBeenCalled();
    expect([...table.values()]).toEqual([{ id: SITE, tenant: TENANT_B }]);
  });

  it("answers the row a concurrent step made when its own insert meets the unique key", async () => {
    const { ensureSitePresentation } = await load();
    const { payload, create, table } = store([], {
      concurrentWriter: { id: SITE, tenant: TENANT_A },
    });
    const row = await ensureSitePresentation(payload as never, {
      siteId: SITE,
      readSite: core([{ id: SITE, tenantId: TENANT_A }]),
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(row).toMatchObject({ id: SITE, tenant: TENANT_A });
    expect(table.size).toBe(1);
  });
});

describe("AL-2679 WP6 rest: the admin app hands a created Site to the step", () => {
  it("runs the step on the app's Payload, acting for the tenant the Site was created in, with Core's reader", async () => {
    const h = {
      payload: { marker: "payload" },
      ensure: vi.fn(),
      client: vi.fn(),
    };
    vi.doMock("../../../apps/admin/src/cms/get-payload", () => ({
      getPayloadClient: h.client.mockResolvedValue(h.payload),
    }));
    vi.doMock("../../../apps/admin/src/cms/site-presentation-step", () => ({
      ensureSitePresentation: h.ensure.mockResolvedValue({ id: SITE }),
    }));
    try {
      const { presentCreatedSite } =
        await import("../../../apps/admin/src/cms/site-created");
      const readSite = vi.fn();
      await presentCreatedSite({ siteId: SITE, tenantId: TENANT_A, readSite });
      expect(h.ensure).toHaveBeenCalledTimes(1);
      expect(h.ensure).toHaveBeenCalledWith(h.payload, {
        siteId: SITE,
        readSite,
        actingTenantId: TENANT_A,
      });
    } finally {
      vi.doUnmock("../../../apps/admin/src/cms/get-payload");
      vi.doUnmock("../../../apps/admin/src/cms/site-presentation-step");
      vi.resetModules();
    }
  });
});
