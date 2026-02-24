import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { getPayloadClientMock } = vi.hoisted(() => ({
  getPayloadClientMock: vi.fn(),
}));

vi.mock("../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: getPayloadClientMock,
}));

let lexicalToPlainText: (value: unknown) => string;
let resolveTenantFromRequest: (
  request: unknown,
  payloadOverride?: unknown,
) => Promise<unknown>;

beforeAll(async () => {
  const [donorModule, adminModule] = await Promise.all([
    import("../../../apps/donor/lib/cms/client"),
    import("../../../apps/admin/src/cms/public/resolve-tenant"),
  ]);

  lexicalToPlainText = donorModule.lexicalToPlainText;
  resolveTenantFromRequest = adminModule.resolveTenantFromRequest;
});

function createRequest(path: string, host?: string) {
  const nextUrl = new URL(`http://localhost:3030${path}`);

  return {
    headers: {
      get: vi.fn((headerName: string) => {
        if (headerName === "x-forwarded-host") {
          return host ?? null;
        }

        if (headerName === "host") {
          return host ?? null;
        }

        return null;
      }),
    },
    nextUrl,
  } as never;
}

describe("public cms tenant resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPayloadClientMock.mockReset();
  });

  it("resolves explicit tenant query parameter first", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [{ id: "tenant_1", slug: "one" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home?tenant=one", "tenant.one.org"),
    );

    expect(tenant).toMatchObject({ id: "tenant_1", slug: "one" });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: {
            equals: "one",
          },
        },
      }),
    );
  });

  it("falls back to primary domain and then subdomain lookup", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_2", slug: "alpha" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home", "alpha.example.org"),
    );

    expect(tenant).toMatchObject({ id: "tenant_2", slug: "alpha" });
    expect(find).toHaveBeenCalledTimes(2);
  });

  it("uses provided payload client override when available", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_3", slug: "beta" }] });
    const payloadOverride = { find };

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home", "beta.example.org"),
      payloadOverride as never,
    );

    expect(tenant).toMatchObject({ id: "tenant_3", slug: "beta" });
    expect(getPayloadClientMock).not.toHaveBeenCalled();
    expect(find).toHaveBeenCalledTimes(2);
  });
});

describe("donor CMS content helpers", () => {
  it("extracts plain text from lexical JSON content", () => {
    const text = lexicalToPlainText({
      root: {
        children: [
          {
            children: [{ text: "Hope for all." }],
            type: "paragraph",
          },
        ],
      },
    });

    expect(text).toContain("Hope for all.");
  });
});
