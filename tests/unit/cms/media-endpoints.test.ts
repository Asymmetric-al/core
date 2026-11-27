import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  markWebStudioRefusal,
  readWebStudioRefusal,
  WEB_STUDIO_REFUSAL_HEADER,
  webStudioRefusalAfterError,
} from "../../../apps/admin/src/cms/auth/web-studio-refusal";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TENANT_A = "00000000-0000-0000-0000-000000000001";
const TENANT_B = "00000000-0000-0000-0000-000000000002";
const ASSIGNMENT = "00000000-0000-4000-8000-000000000201";
const ASSET = "6b3b7f6e-9f0a-4c1d-8e2f-3a4b5c6d7e8f";
const FIXTURE_ASSET = "a1b2c3d4-0000-1111-2222-333344445555";

type CustodyRow = { id: string; tenant_id: string; status: string };

const store = vi.hoisted(() => ({
  session: true,
  rows: [] as CustodyRow[],
  readError: null as null | { message: string },
  headers: {} as Record<string, string>,
  reads: [] as Array<Record<string, unknown>>,
  register: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: { global?: { headers?: Record<string, string> } },
    ) => {
      store.headers = options.global?.headers ?? {};
      return {
        auth: {
          getSession: async () => ({
            data: { session: store.session ? { user: { id: USER } } : null },
          }),
        },
        rpc: async () => ({ data: null, error: null }),
        from: (table: string) => {
          const filters: Record<string, unknown> = { table };
          const chain = {
            select: (columns: string) => {
              filters.select = columns;
              return chain;
            },
            eq: (column: string, value: unknown) => {
              filters[column] = value;
              return chain;
            },
            maybeSingle: async () => {
              store.reads.push({ ...filters });
              if (store.readError)
                return { data: null, error: store.readError };
              const row = store.rows.find(
                (candidate) =>
                  table === "media_assets" &&
                  candidate.id === filters.id &&
                  candidate.tenant_id === filters.tenant_id,
              );
              return { data: row ?? null, error: null };
            },
          };
          return chain;
        },
      };
    },
  ),
}));

vi.mock("../../../apps/admin/src/cms/ports/service-port", () => ({
  registerMediaRecord: store.register,
  deleteMediaRecord: store.remove,
}));

type Handler = (req: unknown) => Promise<Response>;
let register: Handler;
let remove: Handler;
let paths: string[];

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  const module = await import("../../../apps/admin/src/cms/media-endpoints");
  register = module.webStudioMediaRegisterEndpoint.handler as Handler;
  remove = module.webStudioMediaRemoveEndpoint.handler as Handler;
  paths = [
    `${module.webStudioMediaRegisterEndpoint.method} ${module.webStudioMediaRegisterEndpoint.path}`,
    `${module.webStudioMediaRemoveEndpoint.method} ${module.webStudioMediaRemoveEndpoint.path}`,
  ];
}, 60_000);

beforeEach(() => {
  store.session = true;
  store.rows = [];
  store.readError = null;
  store.headers = {};
  store.reads = [];
  store.register.mockReset();
  store.register.mockImplementation(
    async (_payload: unknown, input: { id: string }) => ({ id: input.id }),
  );
  store.remove.mockReset();
  store.remove.mockResolvedValue(undefined);
});

const editor = {
  id: USER,
  collection: "principal-links",
  tenantId: TENANT_A,
  assignmentId: ASSIGNMENT,
  staffRole: "development",
  isTenantAdmin: false,
};

const payload = { marker: "payload" };

function makeReq(
  body: unknown,
  {
    user = editor as Record<string, unknown> | null,
    contentType = "application/json",
  } = {},
) {
  return Object.assign(
    new Request("https://admin.test/web-studio/api/web-studio/media/x", {
      method: "POST",
      headers: { "content-type": contentType, cookie: "sb-token=1" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { user, payload, context: {}, t: undefined },
  );
}

async function call(handler: Handler, ...args: Parameters<typeof makeReq>) {
  const response = await handler(makeReq(...args));
  return {
    status: response.status,
    body: (await response.json()) as Record<string, unknown>,
  };
}

describe("the media library's registration and removal under /web-studio/api (WP6 rest, pull request 2)", () => {
  it("are Payload root endpoints, so they answer under /web-studio/api where the cookie binds the organization", () => {
    expect(paths).toEqual([
      "post /web-studio/media/register",
      "post /web-studio/media/remove",
    ]);
  });

  it("registers an asset the person's own token reads as ready in this organization, ids and tenant lower-cased", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "ready" }];
    const { status, body } = await call(register, {
      assetId: ASSET.toUpperCase(),
      alt: "  A well  ",
      credit: "Field team",
    });
    expect(status).toBe(200);
    expect(body).toEqual({ id: ASSET });
    expect(store.register).toHaveBeenCalledTimes(1);
    expect(store.register).toHaveBeenCalledWith(payload, {
      id: ASSET,
      tenantId: TENANT_A,
      alt: "A well",
      credit: "Field team",
      folder: null,
    });
    expect(store.reads).toEqual([
      expect.objectContaining({
        table: "media_assets",
        id: ASSET,
        tenant_id: TENANT_A,
      }),
    ]);
    expect(store.headers).toMatchObject({
      "x-asym-tenant": TENANT_A,
      "x-asym-assignment": ASSIGNMENT,
    });
  });

  it.each([
    [
      "another organization's asset",
      { id: ASSET, tenant_id: TENANT_B, status: "ready" },
    ],
    ["a deleted asset", { id: ASSET, tenant_id: TENANT_A, status: "deleted" }],
    [
      "an asset still uploading",
      { id: ASSET, tenant_id: TENANT_A, status: "uploading" },
    ],
    ["a failed asset", { id: ASSET, tenant_id: TENANT_A, status: "failed" }],
    ["an id with no asset", null],
  ])("refuses %s and writes nothing", async (_label, row) => {
    store.rows = row ? [row] : [];
    const { status } = await call(register, { assetId: ASSET, alt: "Alt" });
    expect(status).toBeGreaterThanOrEqual(400);
    expect(store.register).not.toHaveBeenCalled();
  });

  it("refuses a person without web_studio.edit, a missing session, a bad body and a failed read, writing nothing", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "ready" }];
    await expect(
      register(
        makeReq(
          { assetId: ASSET, alt: "Alt" },
          { user: { ...editor, staffRole: "viewer" } },
        ),
      ),
    ).rejects.toMatchObject({ name: "Forbidden" });
    await expect(
      register(makeReq({ assetId: ASSET, alt: "Alt" }, { user: null })),
    ).rejects.toMatchObject({ name: "Forbidden" });
    store.session = false;
    const ended = makeReq({ assetId: ASSET, alt: "Alt" });
    await expect(register(ended)).rejects.toMatchObject({ name: "Forbidden" });
    expect(readWebStudioRefusal(ended)).toBe("no_session");
    store.session = true;
    expect(
      (await call(register, { assetId: "not-an-id", alt: "Alt" })).status,
    ).toBe(400);
    expect((await call(register, { assetId: ASSET, alt: "   " })).status).toBe(
      400,
    );
    expect(
      (await call(register, { assetId: ASSET, alt: "Alt", tenant: TENANT_B }))
        .status,
    ).toBe(400);
    expect(
      (await call(register, "{}", { contentType: "text/plain" })).status,
    ).toBe(415);
    store.readError = { message: "connection reset" };
    expect((await call(register, { assetId: ASSET, alt: "Alt" })).status).toBe(
      503,
    );
    expect(store.register).not.toHaveBeenCalled();
  });

  it("answers a registration the service port refuses without claiming success", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "ready" }];
    store.register.mockRejectedValueOnce(
      new Error("The media row belongs to another organization."),
    );
    const { status } = await call(register, { assetId: ASSET, alt: "Alt" });
    expect(status).toBe(409);
  });

  it("a retry after a failed registration registers once more through the idempotent service port", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "ready" }];
    store.register.mockRejectedValueOnce(new Error("connection terminated"));
    await expect(
      call(register, { assetId: ASSET, alt: "Alt" }),
    ).rejects.toThrow("connection terminated");
    expect((await call(register, { assetId: ASSET, alt: "Alt" })).status).toBe(
      200,
    );
    expect(store.register).toHaveBeenCalledTimes(2);
    expect(store.register.mock.calls.map((args) => args[1].id)).toEqual([
      ASSET,
      ASSET,
    ]);
  });

  it("removes the record of a deleted asset, giving the service port the organization", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "deleted" }];
    const { status, body } = await call(remove, {
      assetId: ASSET.toUpperCase(),
    });
    expect(status).toBe(200);
    expect(body).toEqual({ id: ASSET });
    expect(store.remove).toHaveBeenCalledWith(payload, ASSET, TENANT_A);
  });

  it("removes a record with no stored file, as the fixtures' non-RFC ids have", async () => {
    const { status } = await call(remove, {
      assetId: FIXTURE_ASSET.toUpperCase(),
    });
    expect(status).toBe(200);
    expect(store.remove).toHaveBeenCalledWith(payload, FIXTURE_ASSET, TENANT_A);
  });

  it("refuses to remove the record of a file that is still stored, writing nothing", async () => {
    store.rows = [{ id: ASSET, tenant_id: TENANT_A, status: "ready" }];
    const { status } = await call(remove, { assetId: ASSET });
    expect(status).toBe(409);
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("answers another organization's record as not found", async () => {
    store.remove.mockRejectedValueOnce(
      new Error("The media row belongs to another organization."),
    );
    const { status } = await call(remove, { assetId: ASSET });
    expect(status).toBe(404);
  });

  it("refuses removal without web_studio.edit, without a session and when the read fails", async () => {
    await expect(
      remove(makeReq({ assetId: ASSET }, { user: null })),
    ).rejects.toMatchObject({ name: "Forbidden" });
    store.session = false;
    const ended = makeReq({ assetId: ASSET });
    await expect(remove(ended)).rejects.toMatchObject({ name: "Forbidden" });
    expect(readWebStudioRefusal(ended)).toBe("no_session");
    store.session = true;
    store.readError = { message: "timeout" };
    expect((await call(remove, { assetId: ASSET })).status).toBe(503);
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("answers an id of another organization's media as it answers an id that exists nowhere, on remove and on register (round 2, G2)", async () => {
    store.remove.mockResolvedValueOnce(undefined);
    const absentRemove = await call(remove, { assetId: ASSET });
    store.remove.mockRejectedValueOnce(
      new Error("The media row belongs to another organization."),
    );
    const foreignRemove = await call(remove, { assetId: ASSET });
    expect(foreignRemove).toEqual(absentRemove);

    store.rows = [];
    const absentRegister = await call(register, { assetId: ASSET, alt: "Alt" });
    store.rows = [{ id: ASSET, tenant_id: TENANT_B, status: "ready" }];
    const foreignRegister = await call(register, {
      assetId: ASSET,
      alt: "Alt",
    });
    expect(foreignRegister).toEqual(absentRegister);
    expect(store.register).not.toHaveBeenCalled();
  });

  it.each([
    ["scope_mismatch", 409],
    ["no_session", 401],
    ["no_selection", 403],
  ] as const)(
    "turns the strategy's %s into the status and header every Web Studio refusal carries, so the reload or sign-in dialog opens (fix round F5)",
    async (refusal, status) => {
      for (const handler of [register, remove]) {
        const req = makeReq({ assetId: ASSET, alt: "Alt" }, { user: null });
        markWebStudioRefusal(req, refusal);
        const error = await handler(req).then(
          () => null,
          (thrown: unknown) => thrown,
        );
        expect(error).toMatchObject({ name: "Forbidden" });
        const answer = await webStudioRefusalAfterError({
          error,
          req,
        } as never);
        expect(answer).toMatchObject({ status });
        expect(
          (req as { responseHeaders?: Headers }).responseHeaders?.get(
            WEB_STUDIO_REFUSAL_HEADER,
          ),
        ).toBe(refusal);
      }
      expect(store.register).not.toHaveBeenCalled();
      expect(store.remove).not.toHaveBeenCalled();
    },
  );
});
