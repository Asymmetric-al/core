import { beforeAll, describe, expect, it } from "vitest";

import type { AccessArgs, PayloadRequest } from "payload";

type PublicReadModule =
  typeof import("../../../apps/admin/src/cms/access/public-read");

let buildPublicReadRequestContext: PublicReadModule["buildPublicReadRequestContext"];
let getPublicReadContext: PublicReadModule["getPublicReadContext"];
let publicMediaReadAccess: PublicReadModule["publicMediaReadAccess"];
let publicTenantReadAccess: PublicReadModule["publicTenantReadAccess"];
let publishedPublicReadAccess: PublicReadModule["publishedPublicReadAccess"];

beforeAll(async () => {
  const module = await import("../../../apps/admin/src/cms/access/public-read");
  buildPublicReadRequestContext = module.buildPublicReadRequestContext;
  getPublicReadContext = module.getPublicReadContext;
  publicMediaReadAccess = module.publicMediaReadAccess;
  publicTenantReadAccess = module.publicTenantReadAccess;
  publishedPublicReadAccess = module.publishedPublicReadAccess;
});

const CMS_TENANT_ID = 42;

function publicReadRequest(
  cmsTenantId: number | string | null | undefined = CMS_TENANT_ID,
  overrides: Partial<PayloadRequest> = {},
): PayloadRequest {
  return {
    context:
      cmsTenantId === undefined
        ? {}
        : buildPublicReadRequestContext({ cmsTenantId: cmsTenantId as never }),
    user: null,
    ...overrides,
  } as unknown as PayloadRequest;
}

function staffRequest(user: Record<string, unknown> | null): PayloadRequest {
  return { context: {}, user } as unknown as PayloadRequest;
}

function accessArgs(req: PayloadRequest): AccessArgs {
  return { req } as AccessArgs;
}

describe("the public-read request context marker", () => {
  it("round-trips through Payload request context", () => {
    const req = publicReadRequest(CMS_TENANT_ID);
    expect(getPublicReadContext(req)).toEqual({ cmsTenantId: CMS_TENANT_ID });
  });

  it("is absent for ordinary staff/admin requests", () => {
    expect(getPublicReadContext(staffRequest(null))).toBeNull();
  });

  it("rejects blank or malformed tenant ids fail-closed", () => {
    expect(getPublicReadContext(publicReadRequest(""))).toBeNull();
    expect(getPublicReadContext(publicReadRequest("   "))).toBeNull();
    expect(getPublicReadContext(publicReadRequest(null))).toBeNull();
    // A forged marker with the wrong shape is not a public-read context.
    const forged = {
      context: { asymPublicRead: { wrong: true } },
      user: null,
    } as unknown as PayloadRequest;
    expect(getPublicReadContext(forged)).toBeNull();
  });
});

describe("publishedPublicReadAccess", () => {
  it("constrains a public read to the resolved tenant and published status on draft-enabled collections", () => {
    const access = publishedPublicReadAccess("tenant", { draftable: true });
    const result = access(accessArgs(publicReadRequest()));

    expect(result).toEqual({
      and: [
        { tenant: { equals: CMS_TENANT_ID } },
        { _status: { equals: "published" } },
      ],
    });
  });

  it("constrains a public read to the resolved tenant only on versionless collections", () => {
    const access = publishedPublicReadAccess("tenant", { draftable: false });
    const result = access(accessArgs(publicReadRequest()));

    expect(result).toEqual({
      and: [{ tenant: { equals: CMS_TENANT_ID } }],
    });
  });

  it("denies a public read outright when the marker carries no resolved tenant", () => {
    const access = publishedPublicReadAccess("tenant", { draftable: true });

    expect(access(accessArgs(publicReadRequest("")))).toBe(false);
  });

  it("applies the public constraint even for an authenticated user on a public read (no elevation)", () => {
    const access = publishedPublicReadAccess("tenant", { draftable: true });
    const req = publicReadRequest(CMS_TENANT_ID, {
      user: { id: "donor-1", role: "donor" } as never,
    });

    expect(access(accessArgs(req))).toEqual({
      and: [
        { tenant: { equals: CMS_TENANT_ID } },
        { _status: { equals: "published" } },
      ],
    });
  });

  it("is extensible: future predicates append constraints or deny outright", () => {
    const withPredicate = publishedPublicReadAccess("tenant", {
      draftable: true,
      extraPredicates: [() => ({ restricted: { not_equals: true } })],
    });
    expect(withPredicate(accessArgs(publicReadRequest()))).toEqual({
      and: [
        { tenant: { equals: CMS_TENANT_ID } },
        { _status: { equals: "published" } },
        { restricted: { not_equals: true } },
      ],
    });

    const denying = publishedPublicReadAccess("tenant", {
      draftable: true,
      extraPredicates: [() => false],
    });
    expect(denying(accessArgs(publicReadRequest()))).toBe(false);
  });

  it("leaves non-public (staff) reads on the existing tenant-scoped behavior", () => {
    const access = publishedPublicReadAccess("tenant", { draftable: true });

    // Anonymous without the marker stays denied, exactly as before.
    expect(access(accessArgs(staffRequest(null)))).toBe(false);
  });
});

describe("publicMediaReadAccess", () => {
  const MEDIA_CAPABILITY = { draftable: false } as const;

  it("serves media file bytes to anonymous static-file requests (the next/image optimizer fetch)", () => {
    const access = publicMediaReadAccess("tenant", MEDIA_CAPABILITY);
    const args = {
      ...accessArgs(staffRequest(null)),
      isReadingStaticFile: true,
    };

    expect(access(args)).toBe(true);
  });

  it("keeps authenticated staff static-file reads tenant scoped", () => {
    const access = publicMediaReadAccess("tenant", MEDIA_CAPABILITY);
    const args = {
      ...accessArgs(
        staffRequest({ id: "staff-1", role: "staff", tenantId: "tenant-a" }),
      ),
      isReadingStaticFile: true,
    };

    expect(access(args)).toEqual({ tenant: { equals: "tenant-a" } });
  });

  it("keeps anonymous document reads without the marker denied", () => {
    const access = publicMediaReadAccess("tenant", MEDIA_CAPABILITY);

    expect(access(accessArgs(staffRequest(null)))).toBe(false);
  });

  it("constrains marked public document reads to the resolved tenant", () => {
    const access = publicMediaReadAccess("tenant", MEDIA_CAPABILITY);

    expect(access(accessArgs(publicReadRequest()))).toEqual({
      and: [{ tenant: { equals: CMS_TENANT_ID } }],
    });
  });
});

describe("publicTenantReadAccess", () => {
  it("lets a public read see only the resolved, active tenant document", () => {
    const access = publicTenantReadAccess();
    expect(access(accessArgs(publicReadRequest()))).toEqual({
      and: [{ id: { equals: CMS_TENANT_ID } }, { isActive: { equals: true } }],
    });
  });

  it("denies a public tenant read without a resolved tenant", () => {
    const access = publicTenantReadAccess();
    expect(access(accessArgs(publicReadRequest(null)))).toBe(false);
  });

  it("keeps staff behavior unchanged without the marker", () => {
    const access = publicTenantReadAccess();
    expect(access(accessArgs(staffRequest(null)))).toBe(false);
  });
});
