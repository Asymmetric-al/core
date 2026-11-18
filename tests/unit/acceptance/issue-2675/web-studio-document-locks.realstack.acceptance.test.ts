/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice C; council C3):
 * a person whose Web Studio cookie selects organization A cannot cause a lock
 * row for a document of organization B.
 *
 * In Payload 4.0.0-beta.9 the `form-state` server function checks only admin
 * access, then, asked for a document's lock status, writes a row to
 * `payload-locked-documents` with `req.payload.db.create`, for any document
 * id (`@payloadcms/ui/dist/utilities/handleFormStateLocking.js`). The lock
 * collection itself grants create, read, update and delete to any signed-in
 * user (`payload/dist/locked-documents/config.js`), so a REST create does the
 * same. Run against Payload's own `form-state` handler before the fix, both
 * paths wrote a lock row on the other organization's document. Web Studio's
 * `form-state` now never asks for lock status, and the lock collection admits
 * no write through the API (`apps/admin/src/cms/document-locks.ts`).
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
type PayloadLike = {
  create(options: Record<string, unknown>): Promise<Doc>;
  delete(options: Record<string, unknown>): Promise<unknown>;
  collections: Record<string, unknown>;
  destroy(): Promise<void>;
};

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

    beforeAll(async () => {
      vi.stubEnv("PAYLOAD_DATABASE_URI", ADMIN_URL);
      vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
      vi.stubEnv("RESEND_API_KEY", undefined);
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
    }, 120_000);

    afterAll(async () => {
      await db
        .query(
          "delete from cms.payload_locked_documents where id in (select parent_id from cms.payload_locked_documents_rels where navigation_id = $1)",
          [documentOfB?.id ?? -1],
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
  },
);
