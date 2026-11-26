import { randomUUID } from "node:crypto";

import pg from "pg";
import { vi } from "vitest";

import { ADMIN_URL } from "../issue-2674/harness";

export { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

export const ORIGIN = "https://admin.example.org";

export type Doc = Record<string, unknown> & { id: string };
export type Person = {
  id: string;
  collection: "principal-links";
  tenantId: string;
  assignmentId: string;
  staffRole: string | null;
  isTenantAdmin: boolean;
};
type RouteHandler = (request: Request, args: unknown) => Promise<Response>;

export function withRole(url: string, role: string) {
  const parsed = new URL(url);
  parsed.searchParams.set("options", `-c role=${role}`);
  parsed.search = [...parsed.searchParams]
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  return parsed.toString();
}

export type CmsStack = Awaited<ReturnType<typeof bootCmsStack>>;

export async function bootCmsStack() {
  vi.stubEnv("PAYLOAD_DATABASE_URI", withRole(ADMIN_URL, "cms_runtime"));
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("RESEND_API_KEY", undefined);
  vi.stubEnv("E2E_AUTH_BYPASS", "true");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "example-anon-key");
  vi.stubEnv(
    "PAYLOAD_SECRET",
    process.env.PAYLOAD_SECRET || "realstack-payload-secret",
  );
  const payloadModule =
    (await import("../../../../apps/admin/node_modules/payload/dist/index.js")) as unknown as {
      getPayload: (options: { config: unknown; importMap: unknown }) => Promise<
        Record<string, never> & {
          destroy(): Promise<void>;
          find(args: Record<string, unknown>): Promise<{ docs: Doc[] }>;
          findByID(args: Record<string, unknown>): Promise<Doc>;
          findVersions(args: Record<string, unknown>): Promise<{ docs: Doc[] }>;
          findVersionByID(args: Record<string, unknown>): Promise<Doc>;
          restoreVersion(args: Record<string, unknown>): Promise<Doc>;
          create(args: Record<string, unknown>): Promise<Doc>;
          update(
            args: Record<string, unknown>,
          ): Promise<Doc & { docs?: Doc[]; errors?: unknown[] }>;
          delete(
            args: Record<string, unknown>,
          ): Promise<Doc & { docs?: Doc[]; errors?: unknown[] }>;
          count(args: Record<string, unknown>): Promise<{ totalDocs: number }>;
        }
      >;
      createPayloadRequest: (
        options: Record<string, unknown>,
      ) => Promise<unknown>;
    };
  const { default: config } =
    await import("../../../../apps/admin/payload.config");
  const payload = await payloadModule.getPayload({ config, importMap: {} });
  const service =
    await import("../../../../apps/admin/src/cms/ports/service-port");
  const actor = await import("../../../../apps/admin/src/cms/ports/actor-port");
  const rest =
    (await import("../../../../apps/admin/app/(payload)/web-studio/api/[...slug]/route")) as unknown as Record<
      string,
      RouteHandler
    >;
  const e2e = await import("../../../../packages/auth/e2e-auth");
  const { webStudioTenantCookie } =
    await import("../../../../apps/admin/src/cms/web-studio-tenant-cookie");
  const owner = new pg.Client({
    connectionString: withRole(ADMIN_URL, "cms_owner"),
  });
  await owner.connect();
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();

  const created: Array<[string, string]> = [];

  const person = async (
    tenantId: string,
    staffRole: string | null = "development",
  ): Promise<Person> => {
    const id = randomUUID();
    await service.ensurePrincipalLink(payload as never, {
      userId: id,
      email: `${id}@example.org`,
    });
    return {
      id,
      collection: "principal-links",
      tenantId,
      assignmentId: randomUUID(),
      staffRole,
      isTenantAdmin: false,
    };
  };

  const site = async (tenantId: string, siteId = randomUUID()) => {
    const doc = (await service.createSitePresentation(payload as never, {
      siteId,
      tenantId,
    })) as Doc;
    created.push(["site-presentations", doc.id]);
    return doc;
  };

  const media = async (tenantId: string, id = randomUUID(), alt = "Alt") => {
    const doc = (await service.registerMediaRecord(payload as never, {
      id,
      tenantId,
      alt,
    })) as Doc;
    created.push(["media", doc.id]);
    return doc;
  };

  const page = async (
    tenantId: string,
    siteId: string,
    data: Record<string, unknown> = {},
  ) => {
    const doc = (await service.serviceCreate(payload as never, {
      collection: "pages",
      data: {
        tenant: tenantId,
        site: siteId,
        title: `Page ${randomUUID().slice(0, 8)}`,
        slug: `page-${randomUUID().slice(0, 8)}`,
        ...data,
      },
      draft: true,
    })) as Doc;
    created.push(["pages", doc.id]);
    return doc;
  };

  const navigation = async (
    tenantId: string,
    siteId: string,
    items: Array<Record<string, unknown>> = [
      { label: "Out", href: "https://x.test/a" },
    ],
  ) => {
    const doc = (await service.serviceCreate(payload as never, {
      collection: "navigation",
      data: { tenant: tenantId, site: siteId, label: "Menu", items },
    })) as Doc;
    created.push(["navigation", doc.id]);
    return doc;
  };

  const reqFor = (user: Person | null, headers = new Headers()) =>
    payloadModule.createPayloadRequest({
      payload,
      req: { headers, user },
    }) as Promise<never>;

  const restAs = async (
    user: Person,
    method: string,
    path: string,
    body?: unknown,
  ) => {
    const identity = await e2e.createE2EAuthCookieValue({
      userId: user.id,
      role: "staff",
      tenantId: user.tenantId,
      memberships: [
        {
          id: user.assignmentId,
          tenantId: user.tenantId,
          role: "staff",
          staffRole: (user.staffRole ?? null) as never,
          isTenantAdmin: user.isTenantAdmin,
        },
      ],
    } as never);
    const selection = await webStudioTenantCookie({
      tenantId: user.tenantId,
      assignmentId: user.assignmentId,
    });
    const request = new Request(`${ORIGIN}${path}`, {
      method,
      headers: {
        origin: ORIGIN,
        host: new URL(ORIGIN).host,
        cookie: `${e2e.E2E_AUTH_COOKIE_NAME}=${identity}; ${selection.name}=${selection.value}`,
        "x-asym-tenant": user.tenantId,
        "x-asym-assignment": user.assignmentId,
        "content-type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const slug = new URL(request.url).pathname
      .replace(/^\/web-studio\/api\//, "")
      .split("/")
      .filter(Boolean);
    const handler = rest[method]!;
    const response = await handler(request, {
      params: Promise.resolve({ slug }),
    });
    const text = await response.text();
    let json: Record<string, unknown> | null = null;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = null;
    }
    return { status: response.status, json };
  };

  const settle = async <T>(attempt: Promise<T>) => {
    try {
      return { ok: true as const, value: await attempt };
    } catch (error) {
      const value = error as {
        name?: string;
        status?: number;
        data?: { errors?: Array<{ path?: string; message?: string }> };
        message?: string;
      };
      return {
        ok: false as const,
        name: value.name ?? "Error",
        status: value.status,
        paths: (value.data?.errors ?? []).map((item) => item.path),
        message: value.message ?? "",
      };
    }
  };

  const cleanup = async () => {
    for (const collection of [
      "navigation",
      "pages",
      "media",
      "site-presentations",
    ]) {
      for (const [slug, id] of created.filter(([c]) => c === collection)) {
        await service
          .serviceDelete(payload as never, { collection: slug as never, id })
          .catch(() => undefined);
      }
    }
    await payload.destroy().catch(() => undefined);
    await owner.end().catch(() => undefined);
    await admin.end().catch(() => undefined);
    vi.unstubAllEnvs();
  };

  return {
    payload,
    service,
    actor,
    owner,
    admin,
    person,
    site,
    media,
    page,
    navigation,
    reqFor,
    restAs,
    settle,
    created,
    cleanup,
  };
}

export const lexical = (children: unknown[]) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children,
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
});

export const textNode = (text: string) => ({
  type: "text",
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  version: 1,
});

export const relationshipNode = (relationTo: string, value: string) => ({
  type: "relationship",
  format: "",
  relationTo,
  value,
  version: 2,
});

export const uploadNode = (relationTo: string, value: string) => ({
  type: "upload",
  format: "",
  id: randomUUID().replace(/-/g, "").slice(0, 24),
  relationTo,
  value,
  fields: null,
  version: 3,
});

export const internalLink = (relationTo: string, value: string) => ({
  type: "link",
  children: [textNode("link")],
  direction: null,
  format: "",
  indent: 0,
  version: 3,
  id: randomUUID().replace(/-/g, "").slice(0, 24),
  fields: { linkType: "internal", newTab: false, doc: { relationTo, value } },
});
