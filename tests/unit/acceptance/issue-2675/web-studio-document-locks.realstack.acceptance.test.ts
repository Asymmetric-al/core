/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice C; council C3
 * and round 2 CR2): document locks work inside one organization and never
 * across two.
 *
 * In Payload 4.0.0-beta.9 the `form-state` server function checks only admin
 * access, then, asked for a document's lock status, writes a row to
 * `payload-locked-documents` with `req.payload.db.create`, for any document
 * id (`@payloadcms/ui/dist/utilities/handleFormStateLocking.js`). The lock
 * collection itself grants create, read, update and delete to any signed-in
 * user (`payload/dist/locked-documents/config.js`), so a REST create does the
 * same. Run against Payload's own `form-state` handler before the C3 fix,
 * both paths wrote a lock row on the other organization's document.
 *
 * Round 2 restores locks inside the organization, because they are the only
 * protection against two editors overwriting each other: Web Studio's
 * `form-state` asks for lock status only for a document the person can read
 * in the organization they selected, and the lock collection admits no
 * create and shows, takes over or releases only that organization's locks
 * (`apps/admin/src/cms/document-locks.ts`). The first two cases are C3's
 * and stay as they were. Round 3 (CR6) adds a super administrator, whom read
 * access lets see every organization: the lock still stays in the one they
 * selected.
 *
 * Runs Payload on TENANT_GUARD_IT_ADMIN_DATABASE_URL, which in CI's `migrate`
 * job carries Payload's migrations: skips without it, except in that job,
 * where it fails. Its documents have fresh slugs and are deleted afterwards.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

vi.mock(
  "@payload-config",
  () => import("../../../../apps/admin/payload.config"),
);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

type Doc = { id: number | string };
type LockRow = Doc & {
  user?: { value?: Doc | string | number };
  document?: { relationTo?: string; value?: Doc | string | number };
};
type PayloadLike = {
  create(options: Record<string, unknown>): Promise<Doc>;
  delete(options: Record<string, unknown>): Promise<unknown>;
  find(options: Record<string, unknown>): Promise<{ docs: LockRow[] }>;
  update(options: Record<string, unknown>): Promise<unknown>;
  collections: Record<string, unknown>;
  destroy(): Promise<void>;
};
type RouteHandler = (request: Request, args: unknown) => Promise<Response>;

const LOCKS = "payload-locked-documents";
const ORIGIN = "https://admin.example.org";

const idOf = (value: unknown) =>
  value && typeof value === "object" && "id" in value
    ? String((value as Doc).id)
    : String(value);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 document locks stay inside the organization (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const stamp = randomUUID().slice(0, 8);
    let payload: PayloadLike;
    let webStudioFormState: (args: Record<string, unknown>) => Promise<unknown>;
    let createPayloadRequest: (
      options: Record<string, unknown>,
    ) => Promise<unknown>;
    const created: Array<[string, Doc]> = [];
    let user: Record<string, unknown>;
    let documentOfB: Doc;
    // Round 2: two editors of A, an editor of B, and a document of A.
    let editorA1: Record<string, unknown>;
    let editorA2: Record<string, unknown>;
    let editorB: Record<string, unknown>;
    // Round 3 (CR6): a super administrator whose selected organization is A.
    let superAdminOfA: Record<string, unknown>;
    let documentOfA: Doc;
    let rest: Record<string, RouteHandler>;
    let graphql: Record<string, RouteHandler>;
    let createE2EAuthCookieValue: (session: unknown) => Promise<string>;
    let e2eCookieName: string;
    let webStudioTenantCookie: (selection: {
      tenantId: string;
      assignmentId: string;
    }) => Promise<{ name: string; value: string }>;

    beforeAll(async () => {
      vi.stubEnv("PAYLOAD_DATABASE_URI", ADMIN_URL);
      vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
      vi.stubEnv("RESEND_API_KEY", undefined);
      // The REST and GraphQL cases sign a person of another organization in
      // through Payload's strategy, with a signed E2E bypass identity.
      vi.stubEnv("E2E_AUTH_BYPASS", "true");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "example-anon-key");
      vi.stubEnv(
        "PAYLOAD_SECRET",
        process.env.PAYLOAD_SECRET || "realstack-payload-secret",
      );
      await db.connect();
      const payloadModule =
        (await import("../../../../apps/admin/node_modules/payload/dist/index.js")) as unknown as {
          getPayload: (options: {
            config: unknown;
            importMap: unknown;
          }) => Promise<PayloadLike>;
          createPayloadRequest: typeof createPayloadRequest;
        };
      ({ createPayloadRequest } = payloadModule);
      // The form-state function the Payload layout dispatches.
      const { webStudioServerFunctions } =
        await import("../../../../apps/admin/src/cms/web-studio-server-functions");
      webStudioFormState = webStudioServerFunctions["form-state"] as never;
      const { default: config } =
        await import("../../../../apps/admin/payload.config");
      // The navigation form renders no custom component, so an empty import
      // map serves; the full one pulls Payload's stylesheets into Node.
      payload = await payloadModule.getPayload({ config, importMap: {} });

      const make = async (
        collection: string,
        data: Record<string, unknown>,
      ) => {
        const doc = await payload.create({
          collection,
          data,
          overrideAccess: true,
        });
        created.push([collection, doc]);
        return doc;
      };
      const tenantA = await make("tenants", {
        name: `Locks A ${stamp}`,
        slug: `locks-a-${stamp}`,
      });
      const tenantB = await make("tenants", {
        name: `Locks B ${stamp}`,
        slug: `locks-b-${stamp}`,
      });
      documentOfB = await make("navigation", {
        tenant: tenantB.id,
        label: `Locks ${stamp}`,
        items: [{ label: "Home", href: "/" }],
      });
      const editorOfA = await make("cms-users", {
        email: `locks-${stamp}@example.org`,
        role: "staff",
        supabaseUserId: randomUUID(),
        tenantId: String(tenantA.id),
      });
      // What Payload's strategy signs in for a cookie that selects A.
      user = {
        ...editorOfA,
        collection: "cms-users",
        role: "staff",
        tenantId: String(tenantA.id),
      };

      documentOfA = await make("navigation", {
        tenant: tenantA.id,
        label: `Locks A ${stamp}`,
        items: [{ label: "Home", href: "/" }],
      });
      const signedIn = async (key: string, tenant: Doc, role = "staff") => ({
        ...(await make("cms-users", {
          email: `locks-${key}-${stamp}@example.org`,
          role,
          supabaseUserId: randomUUID(),
          tenantId: String(tenant.id),
        })),
        collection: "cms-users",
        role,
        tenantId: String(tenant.id),
      });
      editorA1 = await signedIn("a1", tenantA);
      editorA2 = await signedIn("a2", tenantA);
      editorB = await signedIn("b", tenantB);
      superAdminOfA = await signedIn("super", tenantA, "super_admin");

      rest =
        (await import("../../../../apps/admin/app/(payload)/web-studio/api/[...slug]/route")) as never;
      graphql =
        (await import("../../../../apps/admin/app/(payload)/web-studio/api/graphql/route")) as never;
      const e2e = await import("../../../../packages/auth/e2e-auth");
      createE2EAuthCookieValue = e2e.createE2EAuthCookieValue as never;
      e2eCookieName = e2e.E2E_AUTH_COOKIE_NAME;
      ({ webStudioTenantCookie } =
        await import("../../../../apps/admin/src/cms/web-studio-tenant-cookie"));
    }, 120_000);

    afterAll(async () => {
      await db
        .query(
          "delete from cms.payload_locked_documents where id in (select parent_id from cms.payload_locked_documents_rels where navigation_id = any($1))",
          [[documentOfB?.id ?? -1, documentOfA?.id ?? -1]],
        )
        .catch(() => undefined);
      for (const [collection, doc] of created.reverse()) {
        await payload
          .delete({ collection, id: doc.id, overrideAccess: true })
          .catch(() => undefined);
      }
      await payload?.destroy().catch(() => undefined);
      await db.end();
      vi.unstubAllEnvs();
    }, 120_000);

    const locksOnDocumentOfB = async () =>
      Number(
        (
          await db.query(
            "select count(*) from cms.payload_locked_documents_rels where navigation_id = $1",
            [documentOfB.id],
          )
        ).rows[0].count,
      );

    it("the form-state server function writes no lock row for the other organization's document", async () => {
      const req = await createPayloadRequest({
        payload,
        req: { headers: new Headers(), user },
      });
      await webStudioFormState({
        req,
        user,
        collectionSlug: "navigation",
        id: documentOfB.id,
        schemaPath: "navigation",
        operation: "update",
        formState: {},
        docPreferences: { fields: {} },
        returnLockStatus: true,
        updateLastEdited: true,
      });
      expect(await locksOnDocumentOfB()).toBe(0);
    });

    it("the lock collection refuses a create through the API, as REST and GraphQL make it", async () => {
      const req = await createPayloadRequest({
        payload,
        req: { headers: new Headers(), user },
      });
      const attempt = await payload
        .create({
          collection: "payload-locked-documents",
          data: {
            document: { relationTo: "navigation", value: documentOfB.id },
            user: { relationTo: "cms-users", value: user.id },
          },
          overrideAccess: false,
          req,
          user,
        })
        .then(
          () => "created",
          () => "refused",
        );
      expect(await locksOnDocumentOfB()).toBe(0);
      expect(attempt).toBe("refused");
      // The schema keeps the collection: removing it needs a Payload migration.
      expect(payload.collections["payload-locked-documents"]).toBeDefined();
    });

    // Round 2 (CR2): Payload's own locking, inside the organization. The
    // cases run in order, as two editors of A and one of B would act.

    const locksOn = async (doc: Doc) =>
      (
        await db.query(
          "select l.id, r.cms_users_id as user_id from cms.payload_locked_documents l join cms.payload_locked_documents_rels d on d.parent_id = l.id and d.navigation_id = $1 left join cms.payload_locked_documents_rels r on r.parent_id = l.id and r.path = 'user' order by l.id",
          [doc.id],
        )
      ).rows as Array<{ id: number; user_id: number | null }>;

    const formStateAs = async (person: Record<string, unknown>, doc: Doc) =>
      (await webStudioFormState({
        req: await createPayloadRequest({
          payload,
          req: { headers: new Headers(), user: person },
        }),
        user: person,
        collectionSlug: "navigation",
        id: doc.id,
        schemaPath: "navigation",
        operation: "update",
        formState: {},
        docPreferences: { fields: {} },
        returnLockStatus: true,
        updateLastEdited: true,
      })) as { lockedState?: { isLocked?: boolean; user?: unknown } };

    /** The lock rows a person finds, as Payload's edit view asks for them. */
    const locksSeenBy = async (person: Record<string, unknown>, doc: Doc) =>
      (
        await payload.find({
          collection: LOCKS,
          depth: 0,
          overrideAccess: false,
          user: person,
          where: {
            "document.relationTo": { equals: "navigation" },
            "document.value": { equals: doc.id },
          },
        })
      ).docs;

    const settled = (attempt: Promise<unknown>) =>
      attempt.then(
        () => "done",
        (error: { name?: string }) => error?.name ?? "refused",
      );

    it("an editor's form-state locks a document of their own organization", async () => {
      await formStateAs(editorA1, documentOfA);
      const rows = await locksOn(documentOfA);
      expect(rows).toHaveLength(1);
      expect(String(rows[0]!.user_id)).toBe(idOf(editorA1.id));
    });

    it("a second editor of the organization sees who holds the lock, and no second lock is written", async () => {
      const result = await formStateAs(editorA2, documentOfA);
      expect(result.lockedState?.isLocked).toBe(true);
      expect(idOf(result.lockedState?.user)).toBe(idOf(editorA1.id));
      expect(await locksOn(documentOfA)).toHaveLength(1);
      expect(await locksSeenBy(editorA2, documentOfA)).toHaveLength(1);
    });

    it("a save against another person's live lock is refused, as Payload's REST save makes it", async () => {
      const outcome = await settled(
        payload.update({
          collection: "navigation",
          id: documentOfA.id,
          data: { label: `Overwritten ${stamp}` },
          overrideAccess: false,
          overrideLock: false,
          user: editorA2,
        }),
      );
      expect(outcome).toBe("Locked");
      const label = (
        await db.query("select label from cms.navigation where id = $1", [
          documentOfA.id,
        ])
      ).rows[0].label;
      expect(label).toBe(`Locks A ${stamp}`);
    });

    it("another organization neither sees, takes over nor releases the lock", async () => {
      const [lock] = await locksOn(documentOfA);
      expect(await locksSeenBy(editorB, documentOfA)).toEqual([]);
      expect(
        await settled(
          payload.update({
            collection: LOCKS,
            id: lock!.id,
            data: { user: { relationTo: "cms-users", value: editorB.id } },
            overrideAccess: false,
            user: editorB,
          }),
        ),
      ).not.toBe("done");
      expect(
        await settled(
          payload.delete({
            collection: LOCKS,
            id: lock!.id,
            overrideAccess: false,
            user: editorB,
          }),
        ),
      ).not.toBe("done");
      const rows = await locksOn(documentOfA);
      expect(rows).toHaveLength(1);
      expect(String(rows[0]!.user_id)).toBe(idOf(editorA1.id));
    });

    it("a take-over inside the organization hands the lock to the person taking over, and never moves it to another document", async () => {
      const [lock] = await locksSeenBy(editorA2, documentOfA);
      // Payload's take-over sends the person's own user; here the body also
      // names someone else and another organization's document.
      await payload.update({
        collection: LOCKS,
        id: lock!.id,
        data: {
          user: { relationTo: "cms-users", value: editorB.id },
          document: { relationTo: "navigation", value: documentOfB.id },
        },
        overrideAccess: false,
        user: editorA2,
      });
      const rows = await locksOn(documentOfA);
      expect(rows).toHaveLength(1);
      expect(String(rows[0]!.user_id)).toBe(idOf(editorA2.id));
      expect(await locksOnDocumentOfB()).toBe(0);
    });

    it("leaving the document releases the lock, as Payload's edit view does on unmount", async () => {
      const [lock] = await locksSeenBy(editorA2, documentOfA);
      await payload.delete({
        collection: LOCKS,
        id: lock!.id,
        overrideAccess: false,
        user: editorA2,
      });
      expect(await locksOn(documentOfA)).toEqual([]);
    });

    // Round 3 (CR6): read access lets a super administrator see every
    // organization; the lock stays in the one they selected, by the explicit
    // tenant clause in `documentsInOrganization`.

    it("a super administrator who selected A writes no lock on a document of B", async () => {
      try {
        await formStateAs(superAdminOfA, documentOfB);
        expect(await locksOnDocumentOfB()).toBe(0);
      } finally {
        // The next case starts from no lock, whatever happened here.
        await db.query(
          "delete from cms.payload_locked_documents where id in (select parent_id from cms.payload_locked_documents_rels where navigation_id = $1)",
          [documentOfB.id],
        );
      }
    });

    it("a super administrator who selected A neither sees, takes over nor releases the lock B's editor holds", async () => {
      await formStateAs(editorB, documentOfB);
      const held = await locksOn(documentOfB);
      expect(held).toHaveLength(1);
      expect(String(held[0]!.user_id)).toBe(idOf(editorB.id));

      const seen = await locksSeenBy(superAdminOfA, documentOfB);
      const takeOver = await settled(
        payload.update({
          collection: LOCKS,
          id: held[0]!.id,
          data: { user: { relationTo: "cms-users", value: superAdminOfA.id } },
          overrideAccess: false,
          user: superAdminOfA,
        }),
      );
      const release = await settled(
        payload.delete({
          collection: LOCKS,
          id: held[0]!.id,
          overrideAccess: false,
          user: superAdminOfA,
        }),
      );
      const refused = expect.not.stringMatching(/^done$/);
      expect({ seen, takeOver, release }).toEqual({
        seen: [],
        takeOver: refused,
        release: refused,
      });
      expect(await locksOn(documentOfB)).toEqual(held);

      // B's editor still releases their own lock.
      await payload.delete({
        collection: LOCKS,
        id: held[0]!.id,
        overrideAccess: false,
        user: editorB,
      });
      expect(await locksOnDocumentOfB()).toBe(0);
    });

    describe("through the real routes, as a person of another organization", () => {
      const person = randomUUID();
      const tenant = randomUUID();
      const assignment = randomUUID();

      /** A same-origin request from organization B's Web Studio document. */
      async function fromOtherOrganization(
        method: string,
        path: string,
        body?: unknown,
      ) {
        const identity = await createE2EAuthCookieValue({
          userId: person,
          role: "staff",
          tenantId: tenant,
          memberships: [
            {
              id: assignment,
              tenantId: tenant,
              role: "staff",
              staffRole: "development",
              isTenantAdmin: false,
            },
          ],
        });
        const selection = await webStudioTenantCookie({
          tenantId: tenant,
          assignmentId: assignment,
        });
        return new Request(`${ORIGIN}${path}`, {
          method,
          headers: {
            origin: ORIGIN,
            host: new URL(ORIGIN).host,
            cookie: `${e2eCookieName}=${identity}; ${selection.name}=${selection.value}`,
            "x-asym-tenant": tenant,
            "x-asym-assignment": assignment,
            "content-type": "application/json",
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
      }

      afterAll(async () => {
        await payload
          .delete({
            collection: "cms-users",
            where: { email: { equals: `${person}@e2e.asym.local` } },
            overrideAccess: true,
          })
          .catch(() => undefined);
        await payload
          .delete({
            collection: "tenants",
            where: { slug: { equals: tenant } },
            overrideAccess: true,
          })
          .catch(() => undefined);
      });

      it("the REST route signs the person in, in their own organization", async () => {
        const me = await rest.GET!(
          await fromOtherOrganization("GET", "/web-studio/api/cms-users/me"),
          { params: Promise.resolve({ slug: ["cms-users", "me"] }) },
        );
        expect(me.status).toBe(200);
        expect(
          ((await me.json()) as { user?: { email?: string } }).user?.email,
        ).toBe(`${person}@e2e.asym.local`);
      });

      it("the REST route refuses a lock on organization A's document", async () => {
        await formStateAs(editorA1, documentOfA);
        const before = await locksOn(documentOfA);
        expect(before).toHaveLength(1);

        const created = await rest.POST!(
          await fromOtherOrganization(
            "POST",
            "/web-studio/api/payload-locked-documents",
            {
              document: { relationTo: "navigation", value: documentOfA.id },
              user: { relationTo: "cms-users", value: editorA1.id },
            },
          ),
          { params: Promise.resolve({ slug: [LOCKS] }) },
        );
        expect(created.status).toBe(403);

        const listed = await rest.GET!(
          await fromOtherOrganization(
            "GET",
            `/web-studio/api/payload-locked-documents?where[document.value][equals]=${documentOfA.id}`,
          ),
          { params: Promise.resolve({ slug: [LOCKS] }) },
        );
        expect(((await listed.json()) as { docs: unknown[] }).docs).toEqual([]);

        for (const method of ["PATCH", "DELETE"] as const) {
          const response = await rest[method]!(
            await fromOtherOrganization(
              method,
              `/web-studio/api/payload-locked-documents/${before[0]!.id}`,
              method === "PATCH"
                ? { user: { relationTo: "cms-users", value: editorB.id } }
                : undefined,
            ),
            {
              params: Promise.resolve({ slug: [LOCKS, String(before[0]!.id)] }),
            },
          );
          expect(response.status, method).toBeGreaterThanOrEqual(400);
        }
        expect(await locksOn(documentOfA)).toEqual(before);
      });

      it("the GraphQL route refuses the same", async () => {
        const before = await locksOn(documentOfA);
        const response = await graphql.POST!(
          await fromOtherOrganization("POST", "/web-studio/api/graphql", {
            query:
              "mutation ($user: PayloadLockedDocument_UserRelationshipInput!, $document: PayloadLockedDocument_DocumentRelationshipInput) { createPayloadLockedDocument(data: { user: $user, document: $document }) { id } }",
            // GraphQL names the collections as enum values.
            variables: {
              user: { relationTo: "cms_users", value: editorA1.id },
              document: { relationTo: "navigation", value: documentOfA.id },
            },
          }),
          {},
        );
        const body = (await response.json()) as {
          data?: Record<string, unknown> | null;
          errors?: Array<{ message: string }>;
        };
        // Refused by access, not by a malformed mutation.
        expect(body.errors?.map((error) => error.message)).toContainEqual(
          expect.stringMatching(/not allowed/i),
        );
        expect(body.data?.createPayloadLockedDocument ?? null).toBeNull();
        expect(await locksOn(documentOfA)).toEqual(before);
      });
    });
  },
);
