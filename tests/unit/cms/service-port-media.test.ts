import { describe, expect, it, vi } from "vitest";

import {
  createSitePresentation,
  deleteMediaRecord,
  registerMediaRecord,
} from "../../../apps/admin/src/cms/ports/service-port";

const A = "0b3e7c1a-5f2d-4e8a-9c6b-1d2e3f4a5b6c";
const B = "7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d";
const ASSET = "6b3b7f6e-9f0a-4c1d-8e2f-3a4b5c6d7e8f";
const FIXTURE = "a1b2c3d4-0000-1111-2222-333344445555";

type Row = Record<string, unknown> & { id: string; tenant: string };

function fakePayload(initial: Row[] = []) {
  const rows = new Map<string, Row>(
    initial.map((row) => [row.id.toLowerCase(), { ...row }]),
  );
  const idOf = (where: unknown) =>
    String(
      (where as { id?: { equals?: unknown } } | undefined)?.id?.equals ?? "",
    ).toLowerCase();
  const payload = {
    find: vi.fn(async ({ where }: { where: unknown }) => {
      const row = rows.get(idOf(where));
      return { docs: row ? [{ ...row }] : [] };
    }),
    findByID: vi.fn(),
    update: vi.fn(),
    create: vi.fn(async ({ data }: { data: Row }) => {
      if (data.id !== data.id.toLowerCase()) {
        throw new Error("the id is stored as PostgreSQL prints a uuid");
      }
      if (data.tenant !== data.tenant.toLowerCase()) {
        throw new Error(
          'new row violates check constraint "tenant_lower_canonical"',
        );
      }
      rows.set(data.id, { ...data });
      return { ...data };
    }),
    delete: vi.fn(async ({ id }: { id: string }) => {
      const key = id.toLowerCase();
      const row = rows.get(key);
      if (!row) throw Object.assign(new Error("Not Found"), { status: 404 });
      rows.delete(key);
      return row;
    }),
  };
  return { payload, rows };
}

describe("rule 13 in the service port (WP6 rest, pull request 2; #2773): ids and tenants are compared and written lower-case", () => {
  it("registers an upper-case id and tenant as the one lower-case record, and finds it again by either spelling", async () => {
    const { payload, rows } = fakePayload();
    const first = await registerMediaRecord(payload as never, {
      id: ASSET.toUpperCase(),
      tenantId: A.toUpperCase(),
      alt: "Well",
    });
    expect(first).toMatchObject({ id: ASSET, tenant: A });
    const again = await registerMediaRecord(payload as never, {
      id: ASSET,
      tenantId: A,
      alt: "Well",
    });
    expect(again).toMatchObject({ id: ASSET, tenant: A });
    expect(payload.create).toHaveBeenCalledTimes(1);
    expect([...rows.keys()]).toEqual([ASSET]);
  });

  it("refuses a record another organization holds whatever the spelling of the tenant", async () => {
    const { payload } = fakePayload([{ id: ASSET, tenant: B }]);
    await expect(
      registerMediaRecord(payload as never, {
        id: ASSET.toUpperCase(),
        tenantId: A,
        alt: "Not A's",
      }),
    ).rejects.toThrow(/another organization/);
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("presents a Site under its lower-case id and tenant", async () => {
    const { payload } = fakePayload();
    await expect(
      createSitePresentation(payload as never, {
        siteId: FIXTURE.toUpperCase(),
        tenantId: A.toUpperCase(),
      }),
    ).resolves.toMatchObject({ id: FIXTURE, tenant: A });
  });
});

describe("deleteMediaRecord takes the organization (WP6 rest, pull request 2, invariant 4)", () => {
  it("deletes the organization's own record by any spelling of its id, a non-RFC fixture id included", async () => {
    const { payload, rows } = fakePayload([
      { id: ASSET, tenant: A },
      { id: FIXTURE, tenant: A },
    ]);
    await deleteMediaRecord(payload as never, ASSET.toUpperCase(), A);
    await deleteMediaRecord(
      payload as never,
      FIXTURE.toUpperCase(),
      A.toUpperCase(),
    );
    expect(rows.size).toBe(0);
  });

  it("refuses another organization's record and changes nothing", async () => {
    const { payload, rows } = fakePayload([{ id: ASSET, tenant: B }]);
    await expect(deleteMediaRecord(payload as never, ASSET, A)).rejects.toThrow(
      /another organization/,
    );
    expect(payload.delete).not.toHaveBeenCalled();
    expect(rows.get(ASSET)).toEqual({ id: ASSET, tenant: B });
  });

  it("does nothing when the record is already gone, so a retry finishes", async () => {
    const { payload } = fakePayload();
    await expect(
      deleteMediaRecord(payload as never, ASSET, A),
    ).resolves.toBeUndefined();
    expect(payload.delete).not.toHaveBeenCalled();
  });
});
