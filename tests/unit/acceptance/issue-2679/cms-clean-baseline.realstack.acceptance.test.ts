import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  bootCmsStack,
  withRole,
  type CmsStack,
  type Doc,
} from "./cms-harness";
import { runCatalogGates } from "../../../../scripts/release/catalog-gates.mjs";
import {
  captureFingerprint,
  diffFingerprints,
} from "../../../../scripts/release/schema-fingerprint.mjs";

vi.mock(
  "@payload-config",
  () => import("../../../../apps/admin/payload.config"),
);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const SIXTH = "20261125_120829_clean_baseline";
const TARGET_TABLES = [
  "_pages_v",
  "_pages_v_rels",
  "media",
  "media_rels",
  "navigation",
  "navigation_items",
  "navigation_rels",
  "pages",
  "pages_rels",
  "payload_kv",
  "payload_locked_documents",
  "payload_locked_documents_rels",
  "payload_migrations",
  "payload_preferences",
  "payload_preferences_rels",
  "principal_links",
  "site_presentations",
  "site_presentations_rels",
];
const TARGET_SEQUENCES = [
  "_pages_v_rels_id_seq",
  "media_rels_id_seq",
  "navigation_rels_id_seq",
  "pages_rels_id_seq",
  "payload_locked_documents_rels_id_seq",
  "payload_preferences_rels_id_seq",
  "site_presentations_rels_id_seq",
];
const TARGET_ENUMS = [
  "enum__pages_v_version_family",
  "enum__pages_v_version_status",
  "enum_pages_family",
  "enum_pages_status",
];

const databases: string[] = [];

function psql(url: string, sql: string) {
  const result = spawnSync(
    "psql",
    [url, "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-f", "-"],
    { input: sql, encoding: "utf8", shell: false },
  );
  if (result.status !== 0) throw new Error(`psql failed: ${result.stderr}`);
  return result.stdout.trim();
}

function urlFor(name: string) {
  const url = new URL(ADMIN_URL);
  url.pathname = `/${name}`;
  url.search = "";
  return url.toString();
}

function createDatabase(label: string, template?: string) {
  const name = `al2679_${label}_${randomBytes(4).toString("hex")}`;
  psql(
    ADMIN_URL,
    `CREATE DATABASE ${name}${template ? ` TEMPLATE ${template}` : ""};`,
  );
  databases.push(name);
  return { name, url: urlFor(name) };
}

function applySupabaseChain(url: string) {
  const result = spawnSync(
    process.execPath,
    ["scripts/verify/supabase-migrations.mjs"],
    {
      encoding: "utf8",
      shell: false,
      env: { ...process.env, DATABASE_URL: url },
    },
  );
  if (result.status !== 0) {
    throw new Error(`Supabase replay failed: ${result.stderr.slice(-2000)}`);
  }
}

function migratePayload(url: string, count?: number) {
  const result = spawnSync(
    "bun",
    [
      "tests/unit/acceptance/issue-2679/support/run-payload-migrations.ts",
      ...(count === undefined ? [] : [String(count)]),
    ],
    {
      encoding: "utf8",
      shell: false,
      env: {
        ...process.env,
        PAYLOAD_DATABASE_URI: withRole(url, "cms_owner"),
        PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
        PAYLOAD_SECRET: "al2679-clean-baseline",
        SKIP_ENV_VALIDATION: "1",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
        RESEND_API_KEY: "",
      },
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  const output = `${result.stdout}${result.stderr}`;
  const failure = /MIGRATION_ERROR (.*)/.exec(output);
  return {
    ok: result.status === 0 && output.includes("MIGRATED"),
    message: failure
      ? (JSON.parse(failure[1]!) as string)
      : output.slice(-1500),
  };
}

function catalog(url: string) {
  const list = (sql: string) =>
    psql(url, sql).split("\n").filter(Boolean).sort();
  return {
    tables: list(
      "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind IN ('r','p') ORDER BY 1",
    ),
    views: list(
      "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind IN ('v','m') ORDER BY 1",
    ),
    sequences: list(
      "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind = 'S' ORDER BY 1",
    ),
    enums: list(
      "SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'cms' AND t.typtype = 'e' ORDER BY 1",
    ),
  };
}

const ledger = (url: string) =>
  psql(
    url,
    "SELECT name || '|' || batch || '|' || created_at::text || '|' || id::text FROM cms.payload_migrations ORDER BY created_at, name",
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, batch, createdAt, id] = line.split("|");
      return { name, batch, createdAt, id };
    });

afterAll(() => {
  for (const name of databases.reverse()) {
    try {
      psql(ADMIN_URL, `DROP DATABASE IF EXISTS ${name} WITH (FORCE);`);
    } catch {
      continue;
    }
  }
});

describe.skipIf(!ADMIN_URL)(
  "AL-2679 WP6 part 2b: the forward migration to the clean baseline (real stack)",
  { timeout: 600_000 },
  () => {
    let five = "";
    let fiveUrl = "";
    let hand: {
      PROTOTYPE_TABLES: readonly string[];
      PROTOTYPE_VIEWS: readonly string[];
      PROTOTYPE_SEQUENCES: readonly string[];
      PROTOTYPE_ENUMS: readonly string[];
    };

    beforeAll(async () => {
      hand = await import(`../../../../apps/admin/src/migrations/${SIXTH}`);
      const base = createDatabase("five");
      applySupabaseChain(base.url);
      const migrated = migratePayload(base.url, 5);
      if (!migrated.ok) throw new Error(migrated.message);
      five = base.name;
      fiveUrl = base.url;
    }, 900_000);

    const clone = (label: string) => createDatabase(label, five);

    it("note 1: a replay of the five earlier migrations holds exactly the guard's hand list (94 tables, 0 views, 57 sequences, 19 enums)", () => {
      const found = catalog(fiveUrl);
      expect(found.tables).toEqual([...hand.PROTOTYPE_TABLES].sort());
      expect(found.views).toEqual([...hand.PROTOTYPE_VIEWS].sort());
      expect(found.sequences).toEqual([...hand.PROTOTYPE_SEQUENCES].sort());
      expect(found.enums).toEqual([...hand.PROTOTYPE_ENUMS].sort());
      expect(found.tables).toHaveLength(94);
      expect(found.sequences).toHaveLength(57);
      expect(found.enums).toHaveLength(19);
      expect(found.sequences).toContain(
        "_missionary_giving_pages_v_blocks_impact_stats_items_id_seq",
      );
    });

    it("guard 1: a row in cms.pages refuses the migration, and nothing is dropped", () => {
      const db = clone("guard1");
      psql(db.url, "INSERT INTO cms.pages DEFAULT VALUES;");
      const result = migratePayload(db.url);
      expect(result.ok).toBe(false);
      expect(result.message).toContain("cms.pages: 1");
      expect(catalog(db.url).tables).toHaveLength(94);
      expect(ledger(db.url).map((row) => row.name)).not.toContain(SIXTH);
    });

    it("guard 2: a row only in a child table refuses the migration", () => {
      const db = clone("guard2");
      psql(
        db.url,
        `ALTER TABLE cms.pages_blocks_hero DROP CONSTRAINT pages_blocks_hero_parent_id_fk;
         INSERT INTO cms.pages_blocks_hero (_order, _parent_id, _path, id) VALUES (1, 1, 'layout', 'orphan');`,
      );
      const result = migratePayload(db.url);
      expect(result.ok).toBe(false);
      expect(result.message).toContain("cms.pages_blocks_hero: 1");
      expect(catalog(db.url).tables).toHaveLength(94);
    });

    it("guard 3: rows only in the eight bookkeeping tables migrate, and they are gone", () => {
      const db = clone("guard3");
      psql(
        db.url,
        `INSERT INTO cms.tenants (name, slug) VALUES ('Bookkeeping', 'bookkeeping');
         INSERT INTO cms.cms_users (email) VALUES ('bookkeeping@example.org');
         INSERT INTO cms.payload_preferences (key, value) VALUES ('k', '{}');
         INSERT INTO cms.payload_locked_documents (global_slug) VALUES ('g');
         INSERT INTO cms.payload_kv (key, data) VALUES ('k', '{}');`,
      );
      const result = migratePayload(db.url);
      expect(result.ok, result.message).toBe(true);
      const found = catalog(db.url);
      expect(found.tables).not.toContain("tenants");
      expect(found.tables).not.toContain("cms_users");
      for (const table of [
        "payload_preferences",
        "payload_locked_documents",
        "payload_kv",
      ]) {
        expect(psql(db.url, `SELECT count(*) FROM cms.${table};`), table).toBe(
          "0",
        );
      }
    });

    it("guard 4: the refusal names every non-empty table and its count", () => {
      const db = clone("guard4");
      psql(
        db.url,
        `INSERT INTO cms.pages DEFAULT VALUES;
         INSERT INTO cms.pages DEFAULT VALUES;
         INSERT INTO cms.ministry_updates DEFAULT VALUES;`,
      );
      const result = migratePayload(db.url);
      expect(result.ok).toBe(false);
      expect(result.message).toContain("cms.ministry_updates: 1");
      expect(result.message).toContain("cms.pages: 2");
    });

    it("guard 5: an extra empty table in cms refuses the migration, is named, and nothing is dropped", () => {
      const db = clone("guard5");
      psql(db.url, "CREATE TABLE cms.hand_made (id integer);");
      const result = migratePayload(db.url);
      expect(result.ok).toBe(false);
      expect(result.message).toContain("extra table cms.hand_made");
      expect(catalog(db.url).tables).toHaveLength(95);
    });

    it("guard 6: after a successful run, deleting the sixth ledger row and migrating again is refused", () => {
      const db = clone("guard6");
      expect(migratePayload(db.url).ok).toBe(true);
      psql(
        withRole(db.url, "cms_owner"),
        `DELETE FROM cms.payload_migrations WHERE name = '${SIXTH}';`,
      );
      const again = migratePayload(db.url);
      expect(again.ok).toBe(false);
      expect(again.message).toContain("not the prototype");
      expect(catalog(db.url).tables).toEqual(TARGET_TABLES);
    });

    it("test 12: the upgraded database equals a fresh replay, and holds exactly the target's tables, sequences and enums", () => {
      const upgraded = clone("upgraded");
      const before = ledger(upgraded.url);
      expect(migratePayload(upgraded.url).ok).toBe(true);
      const replay = createDatabase("replay");
      applySupabaseChain(replay.url);
      expect(migratePayload(replay.url).ok).toBe(true);

      const a = captureFingerprint({ databaseUrl: upgraded.url });
      const b = captureFingerprint({ databaseUrl: replay.url });
      expect(diffFingerprints(a, b)).toMatchObject({ equal: true });

      for (const url of [upgraded.url, replay.url]) {
        const found = catalog(url);
        expect(found.tables).toEqual(TARGET_TABLES);
        expect(found.views).toEqual([]);
        expect(found.sequences).toEqual(TARGET_SEQUENCES);
        expect(found.enums).toEqual(TARGET_ENUMS);
      }

      expect(
        psql(
          upgraded.url,
          `SELECT has_table_privilege('cms_runtime', 'cms.payload_migrations', 'SELECT')::text || ',' ||
                  (has_table_privilege('cms_runtime', 'cms.payload_migrations', 'INSERT')
                   OR has_table_privilege('cms_runtime', 'cms.payload_migrations', 'UPDATE')
                   OR has_table_privilege('cms_runtime', 'cms.payload_migrations', 'DELETE'))::text;`,
        ),
      ).toBe("true,false");
      expect(
        psql(
          upgraded.url,
          "SELECT to_regclass('cms.payload_migrations_id_seq') IS NULL;",
        ),
      ).toBe("t");

      const gates = runCatalogGates({ databaseUrl: upgraded.url });
      expect(gates.ok, gates.report).toBe(true);

      const after = ledger(upgraded.url);
      expect(after).toHaveLength(6);
      expect(
        after
          .slice(0, 5)
          .map(({ name, batch, createdAt }) => ({ name, batch, createdAt })),
      ).toEqual(
        before.map(({ name, batch, createdAt }) => ({
          name,
          batch,
          createdAt,
        })),
      );
      expect(after[5]!.name).toBe(SIXTH);
      const ids = after.map((row) => row.id);
      expect(new Set(ids).size).toBe(6);
      for (const id of ids) {
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
      }
    });
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2679 WP6 part 2b: PostgreSQL UUIDs that are not RFC 4122 work end to end (D-16 ruling on the @payloadcms/drizzle patch)",
  { timeout: 120_000 },
  () => {
    let s: CmsStack;
    const SEED_LOGIN = "11111111-1111-1111-1111-111111111111";
    const SEED_SITE = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
    const SEED_TENANT = "00000000-0000-0000-0000-000000000001";
    const FIXTURE_MEDIA = "9ad2e745-8c83-f424-a21f-8dc1cafa97b9";
    const made: Array<[string, string]> = [];

    beforeAll(async () => {
      s = await bootCmsStack();
    }, 180_000);

    afterAll(async () => {
      for (const [collection, id] of made.reverse()) {
        await s.service
          .serviceDelete(s.payload as never, {
            collection: collection as never,
            id,
          })
          .catch(() => undefined);
      }
      await s?.cleanup();
    }, 120_000);

    it("a seed login is linked twice through the service port and reads its own row", async () => {
      const first = await s.service.ensurePrincipalLink(s.payload as never, {
        userId: SEED_LOGIN,
        email: "demo-owner@givehope.test",
      });
      const second = await s.service.ensurePrincipalLink(s.payload as never, {
        userId: SEED_LOGIN,
        email: "demo-owner@givehope.test",
      });
      expect(first.id).toBe(SEED_LOGIN);
      expect(second.id).toBe(SEED_LOGIN);
      const own = await s.payload.findByID({
        collection: "principal-links",
        id: SEED_LOGIN,
        overrideAccess: false,
        user: {
          id: SEED_LOGIN,
          collection: "principal-links",
          tenantId: SEED_TENANT,
          assignmentId: randomUUID(),
          staffRole: "development",
          isTenantAdmin: false,
        },
      });
      expect(own.id).toBe(SEED_LOGIN);
    });

    it("a presentation under a seed Site id carries a page and a navigation item linking it, and not_equals excludes it", async () => {
      const presentation = await s.service.createSitePresentation(
        s.payload as never,
        {
          siteId: SEED_SITE,
          tenantId: SEED_TENANT,
        },
      );
      expect(presentation.id).toBe(SEED_SITE);
      const editor = await s.person(SEED_TENANT);
      const req = await s.reqFor(editor);
      const page = (await s.actor.actorCreate(req, {
        collection: "pages",
        data: {
          site: SEED_SITE,
          title: "Seed Site page",
          slug: `seed-${randomUUID().slice(0, 8)}`,
        },
        draft: true,
      })) as Doc;
      made.push(["pages", page.id]);
      const other = await s.site(SEED_TENANT);
      const otherPage = (await s.actor.actorCreate(req, {
        collection: "pages",
        data: {
          site: other.id,
          title: "Other page",
          slug: `other-${randomUUID().slice(0, 8)}`,
        },
        draft: true,
      })) as Doc;
      made.push(["pages", otherPage.id]);
      const nav = (await s.actor.actorCreate(req, {
        collection: "navigation",
        data: {
          site: SEED_SITE,
          label: "Seed menu",
          items: [{ label: "Seed page", page: page.id }],
        },
      })) as Doc;
      made.push(["navigation", nav.id]);
      const read = await s.payload.findByID({
        collection: "site-presentations",
        id: SEED_SITE,
        overrideAccess: false,
        user: editor,
      });
      expect(read.id).toBe(SEED_SITE);
      const excluded = await s.payload.find({
        collection: "pages",
        draft: true,
        limit: 0,
        pagination: false,
        overrideAccess: false,
        user: editor,
        where: { site: { not_equals: SEED_SITE } },
      });
      const ids = excluded.docs.map((doc) => doc.id);
      expect(ids).toContain(otherPage.id);
      expect(ids).not.toContain(page.id);
    });

    it("a bulk delete is refused on a locked media record whose id is not RFC 4122", async () => {
      await s.service.registerMediaRecord(s.payload as never, {
        id: FIXTURE_MEDIA,
        tenantId: SEED_TENANT,
        alt: "Local CMS Demo Image",
      });
      const holder = await s.person(SEED_TENANT);
      const other = await s.person(SEED_TENANT);
      const lock = (await s.payload.create({
        collection: "payload-locked-documents",
        overrideAccess: true,
        data: {
          document: { relationTo: "media", value: FIXTURE_MEDIA },
          user: { relationTo: "principal-links", value: holder.id },
        },
      })) as Doc;
      try {
        await s.payload.delete({
          collection: "media",
          overrideAccess: true,
          overrideLock: false,
          user: other,
          where: { id: { in: [FIXTURE_MEDIA] } },
        });
        expect(
          psql(
            ADMIN_URL,
            `SELECT count(*) FROM cms.media WHERE id = '${FIXTURE_MEDIA}';`,
          ),
        ).toBe("1");
      } finally {
        await s.payload
          .delete({
            collection: "payload-locked-documents",
            id: lock.id,
            overrideAccess: true,
          })
          .catch(() => undefined);
      }
    });
  },
);
