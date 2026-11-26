import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

const PATCH_KEY = "@payloadcms/drizzle@4.0.0-beta.9";
const PATCH_FILE =
  "apps/admin/patches/@payloadcms%2Fdrizzle@4.0.0-beta.9.patch";

const adminRequire = createRequire(path.resolve("apps/admin/package.json"));
const dbPostgresEntry = adminRequire.resolve("@payloadcms/db-postgres");
const dbPostgresRequire = createRequire(dbPostgresEntry);
const drizzleDist = path.dirname(
  dbPostgresRequire.resolve("@payloadcms/drizzle"),
);
const pgCoreUrl = pathToFileURL(
  dbPostgresRequire.resolve("@payloadcms/db-postgres/drizzle/pg-core"),
).href;
const drizzleOrmUrl = pathToFileURL(
  dbPostgresRequire.resolve("@payloadcms/db-postgres/drizzle"),
).href;

const NON_RFC_HEX_UUIDS = [
  "11111111-1111-1111-1111-111111111111",
  "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8",
  "00000000-0000-0000-0000-000000000001",
  "FFBEAFC8-F85F-A2C9-5493-D62F5003E3B8",
];
const RFC_UUIDS = [
  "57000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-0000000e2e10",
];
const NOT_UUIDS = [
  "not-a-uuid",
  "null",
  "",
  "11111111-1111-1111-1111-11111111111",
];

type Sanitize = (args: Record<string, unknown>) => {
  operator: string;
  value: unknown;
};
type ColumnLookup = (args: Record<string, unknown>) => {
  columns?: Array<{ idType: string }>;
};

let sanitizeQueryValue: Sanitize;
let getTableColumnFromPath: ColumnLookup;
let sql: { raw: (text: string) => unknown };
let pgTable: (...args: unknown[]) => unknown;
let pgUuid: (name: string) => unknown;
let pgVarchar: (name: string) => unknown;
let pgInteger: (name: string) => unknown;
let pgSerial: (name: string) => unknown;

beforeAll(async () => {
  ({ sanitizeQueryValue } = (await import(
    pathToFileURL(path.join(drizzleDist, "queries", "sanitizeQueryValue.js"))
      .href
  )) as { sanitizeQueryValue: Sanitize });
  ({ getTableColumnFromPath } = (await import(
    pathToFileURL(
      path.join(drizzleDist, "queries", "getTableColumnFromPath.js"),
    ).href
  )) as { getTableColumnFromPath: ColumnLookup });
  ({ sql } = (await import(drizzleOrmUrl)) as typeof import("drizzle-orm"));
  const pgCore = (await import(pgCoreUrl)) as Record<string, never>;
  pgTable = pgCore.pgTable;
  pgUuid = pgCore.uuid;
  pgVarchar = pgCore.varchar;
  pgInteger = pgCore.integer;
  pgSerial = pgCore.serial;
});

const adapter = {
  idType: "uuid",
  name: "postgres",
  payload: {
    collections: {
      "site-presentations": { config: { slug: "site-presentations" } },
      media: { config: { slug: "media" } },
      pages: { config: { slug: "pages" } },
    },
  },
};

function sanitizeSingle(operator: string, val: unknown) {
  return sanitizeQueryValue({
    adapter,
    columns: undefined,
    field: {
      name: "site",
      type: "relationship",
      relationTo: "site-presentations",
    },
    isUUID: true,
    operator,
    relationOrPath: "site",
    val,
  });
}

function sanitizePolymorphic(operator: string, val: unknown[]) {
  const result = sanitizeQueryValue({
    adapter,
    columns: [
      { idType: "uuid", rawColumn: sql.raw(`"r"."media_id"`) },
      { idType: "uuid", rawColumn: sql.raw(`"r"."pages_id"`) },
    ],
    field: {
      name: "document",
      type: "relationship",
      relationTo: ["media", "pages"],
    },
    isUUID: false,
    operator,
    relationOrPath: "document.value",
    val,
  }) as unknown as {
    columns?: Array<{ value: unknown }>;
  };
  return (result.columns ?? []).map((column) => column.value);
}

describe("WP6 part 2b: the installed @payloadcms/drizzle accepts every PostgreSQL hex UUID in queries (D-16 ruling, payloadcms/payload#16483)", () => {
  it("registers the patch beside its file (root patchedDependencies)", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      patchedDependencies?: Record<string, string>;
    };
    const registered = manifest.patchedDependencies?.[PATCH_KEY];
    if (registered !== undefined) {
      expect(registered).toBe(PATCH_FILE);
      expect(existsSync(PATCH_FILE)).toBe(true);
    }
  });

  it.each([...NON_RFC_HEX_UUIDS, ...RFC_UUIDS])(
    "keeps %s on equals and not_equals of a uuid column, never turning it into IS NULL or IS NOT NULL",
    (id) => {
      expect(sanitizeSingle("equals", id).value).toBe(id);
      expect(sanitizeSingle("not_equals", id).value).toBe(id);
    },
  );

  it.each(NOT_UUIDS)(
    "still drops %j, which is not a UUID, before it reaches a uuid cast",
    (value) => {
      expect(sanitizeSingle("equals", value).value).toBeNull();
    },
  );

  it.each(["in", "not_in"])(
    "keeps non-RFC hex UUIDs in a polymorphic %s instead of emptying it to WHERE false or WHERE true",
    (operator) => {
      const values = sanitizePolymorphic(operator, NON_RFC_HEX_UUIDS);
      expect(values).toEqual([NON_RFC_HEX_UUIDS, NON_RFC_HEX_UUIDS]);
      const mixed = sanitizePolymorphic(operator, [
        NON_RFC_HEX_UUIDS[0]!,
        "not-a-uuid",
      ]);
      expect(mixed).toEqual([[NON_RFC_HEX_UUIDS[0]], [NON_RFC_HEX_UUIDS[0]]]);
    },
  );

  it("keeps the uuid columns of a polymorphic .value path when a related collection has a custom id type", () => {
    const rels = pgTable("things_rels", {
      id: pgSerial("id").primaryKey(),
      order: pgInteger("order"),
      parent: pgUuid("parent_id"),
      path: pgVarchar("path"),
      mediaID: pgUuid("media_id"),
      notesID: pgVarchar("notes_id"),
    });
    const things = pgTable("things", { id: pgUuid("id").primaryKey() });
    const lookupAdapter = {
      ...adapter,
      name: "postgres",
      relationshipsSuffix: "_rels",
      tableNameMap: new Map([
        ["media", "media"],
        ["notes", "notes"],
      ]),
      tables: { things, things_rels: rels },
      payload: {
        config: { localization: false },
        collections: {
          media: { config: { slug: "media" }, customIDType: undefined },
          notes: { config: { slug: "notes" }, customIDType: "text" },
        },
      },
    };
    const lookup = (value: unknown) =>
      getTableColumnFromPath({
        adapter: lookupAdapter,
        collectionPath: "document.value",
        fields: [
          {
            name: "document",
            type: "relationship",
            relationTo: ["media", "notes"],
          },
        ],
        joins: [],
        pathSegments: ["document", "value"],
        selectFields: {},
        tableName: "things",
        value,
      });
    for (const id of NON_RFC_HEX_UUIDS) {
      expect(lookup(id).columns?.map((column) => column.idType)).toEqual([
        "uuid",
        "text",
      ]);
      expect(lookup([id]).columns?.map((column) => column.idType)).toEqual([
        "uuid",
        "text",
      ]);
    }
    expect(
      lookup("not-a-uuid").columns?.map((column) => column.idType),
    ).toEqual(["text"]);
  });
});
