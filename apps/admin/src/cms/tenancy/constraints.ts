import { sql } from "@payloadcms/db-postgres";
import {
  check,
  foreignKey,
  unique,
  uniqueIndex,
} from "@payloadcms/db-postgres/drizzle/pg-core";

import type { postgresAdapter } from "@payloadcms/db-postgres";

const UUID_TEXT =
  "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";

export type TenantConstraint = {
  table: string;
  name: string;
  kind: "unique" | "foreign key" | "check" | "unique index";
  definition: string;
};

const tenantCheck = (column: string) =>
  `CHECK (((${column} IS NOT NULL) AND ((${column})::text ~ '${UUID_TEXT}'::text)))`;

export const TENANT_CONSTRAINTS: readonly TenantConstraint[] = Object.freeze([
  {
    table: "site_presentations",
    name: "site_presentations_id_tenant_key",
    kind: "unique",
    definition: "UNIQUE (id, tenant)",
  },
  {
    table: "site_presentations",
    name: "site_presentations_tenant_check",
    kind: "check",
    definition: tenantCheck("tenant"),
  },
  {
    table: "pages",
    name: "pages_tenant_check",
    kind: "check",
    definition: tenantCheck("tenant"),
  },
  {
    table: "pages",
    name: "pages_site_required_check",
    kind: "check",
    definition: "CHECK ((site_id IS NOT NULL))",
  },
  {
    table: "pages",
    name: "pages_site_same_tenant_fk",
    kind: "foreign key",
    definition:
      "FOREIGN KEY (site_id, tenant) REFERENCES cms.site_presentations(id, tenant) ON DELETE RESTRICT",
  },
  {
    table: "pages",
    name: "pages_site_slug_key",
    kind: "unique index",
    definition:
      "CREATE UNIQUE INDEX pages_site_slug_key ON cms.pages USING btree (site_id, slug)",
  },
  {
    table: "_pages_v",
    name: "_pages_v_tenant_check",
    kind: "check",
    definition: tenantCheck("version_tenant"),
  },
  {
    table: "_pages_v",
    name: "_pages_v_site_required_check",
    kind: "check",
    definition: "CHECK ((version_site_id IS NOT NULL))",
  },
  {
    table: "_pages_v",
    name: "_pages_v_site_same_tenant_fk",
    kind: "foreign key",
    definition:
      "FOREIGN KEY (version_site_id, version_tenant) REFERENCES cms.site_presentations(id, tenant) ON DELETE RESTRICT",
  },
  {
    table: "navigation",
    name: "navigation_tenant_check",
    kind: "check",
    definition: tenantCheck("tenant"),
  },
  {
    table: "navigation",
    name: "navigation_site_same_tenant_fk",
    kind: "foreign key",
    definition:
      "FOREIGN KEY (site_id, tenant) REFERENCES cms.site_presentations(id, tenant) ON DELETE RESTRICT",
  },
  {
    table: "media",
    name: "media_tenant_check",
    kind: "check",
    definition: tenantCheck("tenant"),
  },
]);

type Columns = Record<string, { name?: string }>;
type SchemaHook = NonNullable<
  Parameters<typeof postgresAdapter>[0]["afterSchemaInit"]
>[number];

function column(columns: Columns, name: string) {
  const found = Object.values(columns).find(
    (candidate) => candidate?.name === name,
  );
  if (!found) throw new Error(`cms constraint: no column ${name}`);
  return found as never;
}

function tableColumns(table: unknown): Columns {
  const symbol = Object.getOwnPropertySymbols(table).find((candidate) =>
    candidate.description?.includes("Columns"),
  );
  if (!symbol) throw new Error("cms constraint: table has no columns");
  return (table as Record<symbol, Columns>)[symbol] as Columns;
}

const rawCheck = (name: string, definition: string) =>
  check(name, sql.raw(definition.replace(/^CHECK \((.*)\)$/s, "$1")));

export const addTenantConstraints: SchemaHook = ({ schema, extendTable }) => {
  const tables = schema.tables as Record<string, unknown>;
  const presentations = tables.site_presentations;
  const presentationColumns = tableColumns(presentations);
  const presentationId = column(presentationColumns, "id");
  const presentationTenant = column(presentationColumns, "tenant");
  const byTable = new Map<string, TenantConstraint[]>();
  for (const constraint of TENANT_CONSTRAINTS) {
    const list = byTable.get(constraint.table) ?? [];
    list.push(constraint);
    byTable.set(constraint.table, list);
  }
  for (const [tableName, constraints] of byTable) {
    extendTable({
      table: tables[tableName] as never,
      extraConfig: (t: Columns) =>
        Object.fromEntries(
          constraints.map((constraint) => {
            switch (constraint.kind) {
              case "check":
                return [
                  constraint.name,
                  rawCheck(constraint.name, constraint.definition),
                ];
              case "unique":
                return [
                  constraint.name,
                  unique(constraint.name).on(
                    column(t, "id"),
                    column(t, "tenant"),
                  ),
                ];
              case "unique index":
                return [
                  constraint.name,
                  uniqueIndex(constraint.name).on(
                    column(t, "site_id"),
                    column(t, "slug"),
                  ),
                ];
              case "foreign key": {
                const prefix = tableName === "_pages_v" ? "version_" : "";
                return [
                  constraint.name,
                  foreignKey({
                    name: constraint.name,
                    columns: [
                      column(t, `${prefix}site_id`),
                      column(t, `${prefix}tenant`),
                    ],
                    foreignColumns: [presentationId, presentationTenant],
                  }).onDelete("restrict"),
                ];
              }
            }
          }),
        ),
    });
  }
  return schema;
};
