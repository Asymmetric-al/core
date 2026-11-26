import { sql } from "@payloadcms/db-postgres";

import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export const PROTOTYPE_TABLES: readonly string[] = [
  "_mgp_impact_items_v",
  "_ministry_updates_v",
  "_missionary_giving_pages_v",
  "_missionary_giving_pages_v_blocks_call_to_action",
  "_missionary_giving_pages_v_blocks_faq",
  "_missionary_giving_pages_v_blocks_faq_items",
  "_missionary_giving_pages_v_blocks_hero",
  "_missionary_giving_pages_v_blocks_impact_stats",
  "_missionary_giving_pages_v_blocks_media_feature",
  "_missionary_giving_pages_v_blocks_rich_text",
  "_missionary_giving_pages_v_blocks_testimonial",
  "_page_templates_v",
  "_page_templates_v_blocks_call_to_action",
  "_page_templates_v_blocks_faq",
  "_page_templates_v_blocks_faq_items",
  "_page_templates_v_blocks_hero",
  "_page_templates_v_blocks_impact_stats",
  "_page_templates_v_blocks_impact_stats_items",
  "_page_templates_v_blocks_media_feature",
  "_page_templates_v_blocks_rich_text",
  "_page_templates_v_blocks_testimonial",
  "_pages_v",
  "_pages_v_blocks_call_to_action",
  "_pages_v_blocks_faq",
  "_pages_v_blocks_faq_items",
  "_pages_v_blocks_hero",
  "_pages_v_blocks_impact_stats",
  "_pages_v_blocks_impact_stats_items",
  "_pages_v_blocks_media_feature",
  "_pages_v_blocks_rich_text",
  "_pages_v_blocks_testimonial",
  "_project_pages_v",
  "_project_pages_v_blocks_call_to_action",
  "_project_pages_v_blocks_faq",
  "_project_pages_v_blocks_faq_items",
  "_project_pages_v_blocks_hero",
  "_project_pages_v_blocks_impact_stats",
  "_project_pages_v_blocks_impact_stats_items",
  "_project_pages_v_blocks_media_feature",
  "_project_pages_v_blocks_rich_text",
  "_project_pages_v_blocks_testimonial",
  "cms_users",
  "media",
  "ministry_updates",
  "missionary_giving_pages",
  "missionary_giving_pages_blocks_call_to_action",
  "missionary_giving_pages_blocks_faq",
  "missionary_giving_pages_blocks_faq_items",
  "missionary_giving_pages_blocks_hero",
  "missionary_giving_pages_blocks_impact_stats",
  "missionary_giving_pages_blocks_impact_stats_items",
  "missionary_giving_pages_blocks_media_feature",
  "missionary_giving_pages_blocks_rich_text",
  "missionary_giving_pages_blocks_testimonial",
  "missionary_profiles",
  "navigation",
  "navigation_items",
  "page_templates",
  "page_templates_blocks_call_to_action",
  "page_templates_blocks_faq",
  "page_templates_blocks_faq_items",
  "page_templates_blocks_hero",
  "page_templates_blocks_impact_stats",
  "page_templates_blocks_impact_stats_items",
  "page_templates_blocks_media_feature",
  "page_templates_blocks_rich_text",
  "page_templates_blocks_testimonial",
  "pages",
  "pages_blocks_call_to_action",
  "pages_blocks_faq",
  "pages_blocks_faq_items",
  "pages_blocks_hero",
  "pages_blocks_impact_stats",
  "pages_blocks_impact_stats_items",
  "pages_blocks_media_feature",
  "pages_blocks_rich_text",
  "pages_blocks_testimonial",
  "payload_kv",
  "payload_locked_documents",
  "payload_locked_documents_rels",
  "payload_migrations",
  "payload_preferences",
  "payload_preferences_rels",
  "project_pages",
  "project_pages_blocks_call_to_action",
  "project_pages_blocks_faq",
  "project_pages_blocks_faq_items",
  "project_pages_blocks_hero",
  "project_pages_blocks_impact_stats",
  "project_pages_blocks_impact_stats_items",
  "project_pages_blocks_media_feature",
  "project_pages_blocks_rich_text",
  "project_pages_blocks_testimonial",
  "tenants",
];

export const PROTOTYPE_VIEWS: readonly string[] = [];

export const PROTOTYPE_SEQUENCES: readonly string[] = [
  "_ministry_updates_v_id_seq",
  "_missionary_giving_pages_v_blocks_call_to_action_id_seq",
  "_missionary_giving_pages_v_blocks_faq_id_seq",
  "_missionary_giving_pages_v_blocks_faq_items_id_seq",
  "_missionary_giving_pages_v_blocks_hero_id_seq",
  "_missionary_giving_pages_v_blocks_impact_stats_id_seq",
  "_missionary_giving_pages_v_blocks_impact_stats_items_id_seq",
  "_missionary_giving_pages_v_blocks_media_feature_id_seq",
  "_missionary_giving_pages_v_blocks_rich_text_id_seq",
  "_missionary_giving_pages_v_blocks_testimonial_id_seq",
  "_missionary_giving_pages_v_id_seq",
  "_page_templates_v_blocks_call_to_action_id_seq",
  "_page_templates_v_blocks_faq_id_seq",
  "_page_templates_v_blocks_faq_items_id_seq",
  "_page_templates_v_blocks_hero_id_seq",
  "_page_templates_v_blocks_impact_stats_id_seq",
  "_page_templates_v_blocks_impact_stats_items_id_seq",
  "_page_templates_v_blocks_media_feature_id_seq",
  "_page_templates_v_blocks_rich_text_id_seq",
  "_page_templates_v_blocks_testimonial_id_seq",
  "_page_templates_v_id_seq",
  "_pages_v_blocks_call_to_action_id_seq",
  "_pages_v_blocks_faq_id_seq",
  "_pages_v_blocks_faq_items_id_seq",
  "_pages_v_blocks_hero_id_seq",
  "_pages_v_blocks_impact_stats_id_seq",
  "_pages_v_blocks_impact_stats_items_id_seq",
  "_pages_v_blocks_media_feature_id_seq",
  "_pages_v_blocks_rich_text_id_seq",
  "_pages_v_blocks_testimonial_id_seq",
  "_pages_v_id_seq",
  "_project_pages_v_blocks_call_to_action_id_seq",
  "_project_pages_v_blocks_faq_id_seq",
  "_project_pages_v_blocks_faq_items_id_seq",
  "_project_pages_v_blocks_hero_id_seq",
  "_project_pages_v_blocks_impact_stats_id_seq",
  "_project_pages_v_blocks_impact_stats_items_id_seq",
  "_project_pages_v_blocks_media_feature_id_seq",
  "_project_pages_v_blocks_rich_text_id_seq",
  "_project_pages_v_blocks_testimonial_id_seq",
  "_project_pages_v_id_seq",
  "cms_users_id_seq",
  "media_id_seq",
  "ministry_updates_id_seq",
  "missionary_giving_pages_id_seq",
  "missionary_profiles_id_seq",
  "navigation_id_seq",
  "page_templates_id_seq",
  "pages_id_seq",
  "payload_kv_id_seq",
  "payload_locked_documents_id_seq",
  "payload_locked_documents_rels_id_seq",
  "payload_migrations_id_seq",
  "payload_preferences_id_seq",
  "payload_preferences_rels_id_seq",
  "project_pages_id_seq",
  "tenants_id_seq",
];

export const PROTOTYPE_ENUMS: readonly string[] = [
  "enum__ministry_updates_v_version_status",
  "enum__missionary_giving_pages_v_version_page_type",
  "enum__missionary_giving_pages_v_version_status",
  "enum__page_templates_v_version_page_type",
  "enum__page_templates_v_version_status",
  "enum__pages_v_version_page_type",
  "enum__pages_v_version_status",
  "enum__project_pages_v_version_page_type",
  "enum__project_pages_v_version_status",
  "enum_cms_users_role",
  "enum_ministry_updates_status",
  "enum_missionary_giving_pages_page_type",
  "enum_missionary_giving_pages_status",
  "enum_page_templates_page_type",
  "enum_page_templates_status",
  "enum_pages_page_type",
  "enum_pages_status",
  "enum_project_pages_page_type",
  "enum_project_pages_status",
];

export const BOOKKEEPING_TABLES: readonly string[] = [
  "tenants",
  "cms_users",
  "payload_preferences",
  "payload_preferences_rels",
  "payload_locked_documents",
  "payload_locked_documents_rels",
  "payload_kv",
  "payload_migrations",
];

type Db = MigrateUpArgs["db"];

async function names(db: Db, query: ReturnType<typeof sql>): Promise<string[]> {
  const result = (await db.execute(query)) as unknown as {
    rows: Array<{ name: string }>;
  };
  return result.rows.map((row) => row.name);
}

function difference(
  kind: string,
  found: string[],
  expected: readonly string[],
) {
  const wanted = new Set(expected);
  const present = new Set(found);
  return [
    ...found
      .filter((name) => !wanted.has(name))
      .map((name) => `extra ${kind} cms.${name}`),
    ...expected
      .filter((name) => !present.has(name))
      .map((name) => `missing ${kind} cms.${name}`),
  ];
}

export async function guardPrototypeCatalog(db: Db): Promise<void> {
  const found = {
    tables: await names(
      db,
      sql`SELECT c.relname::text AS name FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind IN ('r', 'p') ORDER BY 1`,
    ),
    views: await names(
      db,
      sql`SELECT c.relname::text AS name FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind IN ('v', 'm') ORDER BY 1`,
    ),
    sequences: await names(
      db,
      sql`SELECT c.relname::text AS name FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'cms' AND c.relkind = 'S' ORDER BY 1`,
    ),
    enums: await names(
      db,
      sql`SELECT t.typname::text AS name FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'cms' AND t.typtype = 'e' ORDER BY 1`,
    ),
  };
  const differences = [
    ...difference("table", found.tables, PROTOTYPE_TABLES),
    ...difference("view", found.views, PROTOTYPE_VIEWS),
    ...difference("sequence", found.sequences, PROTOTYPE_SEQUENCES),
    ...difference("enum type", found.enums, PROTOTYPE_ENUMS),
  ];
  if (differences.length > 0) {
    throw new Error(
      `CMS clean baseline refused: schema cms is not the prototype this migration replaces (${differences.join("; ")}). Nothing was changed.`,
    );
  }
  const counted = PROTOTYPE_TABLES.filter(
    (table) => !BOOKKEEPING_TABLES.includes(table),
  );
  const counts = (await db.execute(
    sql.raw(
      counted
        .map(
          (table) =>
            `SELECT '${table}'::text AS name, count(*)::bigint AS rows FROM "cms"."${table}"`,
        )
        .join(" UNION ALL "),
    ),
  )) as unknown as { rows: Array<{ name: string; rows: string | number }> };
  const occupied = counts.rows
    .filter((row) => Number(row.rows) > 0)
    .map((row) => `cms.${row.name}: ${row.rows}`)
    .sort();
  if (occupied.length > 0) {
    throw new Error(
      `CMS clean baseline refused: these prototype tables hold rows (${occupied.join("; ")}). Nothing was changed.`,
    );
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await guardPrototypeCatalog(db);
  await db.execute(sql`
  DROP TABLE
    "cms"."_mgp_impact_items_v",
    "cms"."_ministry_updates_v",
    "cms"."_missionary_giving_pages_v",
    "cms"."_missionary_giving_pages_v_blocks_call_to_action",
    "cms"."_missionary_giving_pages_v_blocks_faq",
    "cms"."_missionary_giving_pages_v_blocks_faq_items",
    "cms"."_missionary_giving_pages_v_blocks_hero",
    "cms"."_missionary_giving_pages_v_blocks_impact_stats",
    "cms"."_missionary_giving_pages_v_blocks_media_feature",
    "cms"."_missionary_giving_pages_v_blocks_rich_text",
    "cms"."_missionary_giving_pages_v_blocks_testimonial",
    "cms"."_page_templates_v",
    "cms"."_page_templates_v_blocks_call_to_action",
    "cms"."_page_templates_v_blocks_faq",
    "cms"."_page_templates_v_blocks_faq_items",
    "cms"."_page_templates_v_blocks_hero",
    "cms"."_page_templates_v_blocks_impact_stats",
    "cms"."_page_templates_v_blocks_impact_stats_items",
    "cms"."_page_templates_v_blocks_media_feature",
    "cms"."_page_templates_v_blocks_rich_text",
    "cms"."_page_templates_v_blocks_testimonial",
    "cms"."_pages_v",
    "cms"."_pages_v_blocks_call_to_action",
    "cms"."_pages_v_blocks_faq",
    "cms"."_pages_v_blocks_faq_items",
    "cms"."_pages_v_blocks_hero",
    "cms"."_pages_v_blocks_impact_stats",
    "cms"."_pages_v_blocks_impact_stats_items",
    "cms"."_pages_v_blocks_media_feature",
    "cms"."_pages_v_blocks_rich_text",
    "cms"."_pages_v_blocks_testimonial",
    "cms"."_project_pages_v",
    "cms"."_project_pages_v_blocks_call_to_action",
    "cms"."_project_pages_v_blocks_faq",
    "cms"."_project_pages_v_blocks_faq_items",
    "cms"."_project_pages_v_blocks_hero",
    "cms"."_project_pages_v_blocks_impact_stats",
    "cms"."_project_pages_v_blocks_impact_stats_items",
    "cms"."_project_pages_v_blocks_media_feature",
    "cms"."_project_pages_v_blocks_rich_text",
    "cms"."_project_pages_v_blocks_testimonial",
    "cms"."cms_users",
    "cms"."media",
    "cms"."ministry_updates",
    "cms"."missionary_giving_pages",
    "cms"."missionary_giving_pages_blocks_call_to_action",
    "cms"."missionary_giving_pages_blocks_faq",
    "cms"."missionary_giving_pages_blocks_faq_items",
    "cms"."missionary_giving_pages_blocks_hero",
    "cms"."missionary_giving_pages_blocks_impact_stats",
    "cms"."missionary_giving_pages_blocks_impact_stats_items",
    "cms"."missionary_giving_pages_blocks_media_feature",
    "cms"."missionary_giving_pages_blocks_rich_text",
    "cms"."missionary_giving_pages_blocks_testimonial",
    "cms"."missionary_profiles",
    "cms"."navigation",
    "cms"."navigation_items",
    "cms"."page_templates",
    "cms"."page_templates_blocks_call_to_action",
    "cms"."page_templates_blocks_faq",
    "cms"."page_templates_blocks_faq_items",
    "cms"."page_templates_blocks_hero",
    "cms"."page_templates_blocks_impact_stats",
    "cms"."page_templates_blocks_impact_stats_items",
    "cms"."page_templates_blocks_media_feature",
    "cms"."page_templates_blocks_rich_text",
    "cms"."page_templates_blocks_testimonial",
    "cms"."pages",
    "cms"."pages_blocks_call_to_action",
    "cms"."pages_blocks_faq",
    "cms"."pages_blocks_faq_items",
    "cms"."pages_blocks_hero",
    "cms"."pages_blocks_impact_stats",
    "cms"."pages_blocks_impact_stats_items",
    "cms"."pages_blocks_media_feature",
    "cms"."pages_blocks_rich_text",
    "cms"."pages_blocks_testimonial",
    "cms"."payload_kv",
    "cms"."payload_locked_documents",
    "cms"."payload_locked_documents_rels",
    "cms"."payload_preferences",
    "cms"."payload_preferences_rels",
    "cms"."project_pages",
    "cms"."project_pages_blocks_call_to_action",
    "cms"."project_pages_blocks_faq",
    "cms"."project_pages_blocks_faq_items",
    "cms"."project_pages_blocks_hero",
    "cms"."project_pages_blocks_impact_stats",
    "cms"."project_pages_blocks_impact_stats_items",
    "cms"."project_pages_blocks_media_feature",
    "cms"."project_pages_blocks_rich_text",
    "cms"."project_pages_blocks_testimonial",
    "cms"."tenants";
  DROP TYPE
    "cms"."enum__ministry_updates_v_version_status",
    "cms"."enum__missionary_giving_pages_v_version_page_type",
    "cms"."enum__missionary_giving_pages_v_version_status",
    "cms"."enum__page_templates_v_version_page_type",
    "cms"."enum__page_templates_v_version_status",
    "cms"."enum__pages_v_version_page_type",
    "cms"."enum__pages_v_version_status",
    "cms"."enum__project_pages_v_version_page_type",
    "cms"."enum__project_pages_v_version_status",
    "cms"."enum_cms_users_role",
    "cms"."enum_ministry_updates_status",
    "cms"."enum_missionary_giving_pages_page_type",
    "cms"."enum_missionary_giving_pages_status",
    "cms"."enum_page_templates_page_type",
    "cms"."enum_page_templates_status",
    "cms"."enum_pages_page_type",
    "cms"."enum_pages_status",
    "cms"."enum_project_pages_page_type",
    "cms"."enum_project_pages_status";
  ALTER TABLE "cms"."payload_migrations" ALTER COLUMN "id" DROP DEFAULT;
  ALTER TABLE "cms"."payload_migrations" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();
  ALTER TABLE "cms"."payload_migrations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
  DROP SEQUENCE "cms"."payload_migrations_id_seq";
  `);
  await db.execute(sql`
   CREATE TYPE "cms"."enum_pages_family" AS ENUM('standard', 'missionary', 'project');
  CREATE TYPE "cms"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__pages_v_version_family" AS ENUM('standard', 'missionary', 'project');
  CREATE TYPE "cms"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "cms"."principal_links" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."site_presentations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "site_presentations_id_tenant_key" UNIQUE("id","tenant"),
  	CONSTRAINT "site_presentations_tenant_check" CHECK (((tenant IS NOT NULL) AND ((tenant)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text)))
  );
  
  CREATE TABLE "cms"."site_presentations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  CREATE TABLE "cms"."pages" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant" varchar,
  	"site_id" uuid,
  	"family" "cms"."enum_pages_family" DEFAULT 'standard',
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"seo_description" varchar,
  	"template_key" varchar,
  	"missionary_id" varchar,
  	"fund_id" varchar,
  	"layout" jsonb,
  	"content" jsonb,
  	"legacy_content_fallback" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_pages_status" DEFAULT 'draft',
  	CONSTRAINT "pages_tenant_check" CHECK (((tenant IS NOT NULL) AND ((tenant)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text))),
  	CONSTRAINT "pages_site_required_check" CHECK ((site_id IS NOT NULL))
  );
  
  CREATE TABLE "cms"."pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  CREATE TABLE "cms"."_pages_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_tenant" varchar,
  	"version_site_id" uuid,
  	"version_family" "cms"."enum__pages_v_version_family" DEFAULT 'standard',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_seo_description" varchar,
  	"version_template_key" varchar,
  	"version_missionary_id" varchar,
  	"version_fund_id" varchar,
  	"version_layout" jsonb,
  	"version_content" jsonb,
  	"version_legacy_content_fallback" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean,
  	CONSTRAINT "_pages_v_tenant_check" CHECK (((version_tenant IS NOT NULL) AND ((version_tenant)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text))),
  	CONSTRAINT "_pages_v_site_required_check" CHECK ((version_site_id IS NOT NULL))
  );
  
  CREATE TABLE "cms"."_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  CREATE TABLE "cms"."navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"page_id" uuid,
  	"href" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "cms"."navigation" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant" varchar NOT NULL,
  	"site_id" uuid NOT NULL,
  	"label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "navigation_tenant_check" CHECK (((tenant IS NOT NULL) AND ((tenant)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text)))
  );
  
  CREATE TABLE "cms"."navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  CREATE TABLE "cms"."media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tenant" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"folder" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "media_tenant_check" CHECK (((tenant IS NOT NULL) AND ((tenant)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text)))
  );
  
  CREATE TABLE "cms"."media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid,
  	"site_presentations_id" uuid,
  	"pages_id" uuid,
  	"navigation_id" uuid,
  	"media_id" uuid
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"principal_links_id" uuid
  );
  
  ALTER TABLE "cms"."site_presentations_rels" ADD CONSTRAINT "site_presentations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."site_presentations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."site_presentations_rels" ADD CONSTRAINT "site_presentations_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages" ADD CONSTRAINT "pages_site_id_site_presentations_id_fk" FOREIGN KEY ("site_id") REFERENCES "cms"."site_presentations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."pages" ADD CONSTRAINT "pages_site_same_tenant_fk" FOREIGN KEY ("site_id","tenant") REFERENCES "cms"."site_presentations"("id","tenant") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "cms"."pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_rels" ADD CONSTRAINT "pages_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_version_site_id_site_presentations_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "cms"."site_presentations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_site_same_tenant_fk" FOREIGN KEY ("version_site_id","version_tenant") REFERENCES "cms"."site_presentations"("id","tenant") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."navigation_items" ADD CONSTRAINT "navigation_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "cms"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."navigation" ADD CONSTRAINT "navigation_site_id_site_presentations_id_fk" FOREIGN KEY ("site_id") REFERENCES "cms"."site_presentations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."navigation" ADD CONSTRAINT "navigation_site_same_tenant_fk" FOREIGN KEY ("site_id","tenant") REFERENCES "cms"."site_presentations"("id","tenant") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "cms"."navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."navigation_rels" ADD CONSTRAINT "navigation_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."media_rels" ADD CONSTRAINT "media_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_presentations_fk" FOREIGN KEY ("site_presentations_id") REFERENCES "cms"."site_presentations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_fk" FOREIGN KEY ("navigation_id") REFERENCES "cms"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_principal_links_fk" FOREIGN KEY ("principal_links_id") REFERENCES "cms"."principal_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "principal_links_updated_at_idx" ON "cms"."principal_links" USING btree ("updated_at");
  CREATE INDEX "principal_links_created_at_idx" ON "cms"."principal_links" USING btree ("created_at");
  CREATE INDEX "site_presentations_tenant_idx" ON "cms"."site_presentations" USING btree ("tenant");
  CREATE INDEX "site_presentations_updated_at_idx" ON "cms"."site_presentations" USING btree ("updated_at");
  CREATE INDEX "site_presentations_created_at_idx" ON "cms"."site_presentations" USING btree ("created_at");
  CREATE INDEX "site_presentations_rels_order_idx" ON "cms"."site_presentations_rels" USING btree ("order");
  CREATE INDEX "site_presentations_rels_parent_idx" ON "cms"."site_presentations_rels" USING btree ("parent_id");
  CREATE INDEX "site_presentations_rels_path_idx" ON "cms"."site_presentations_rels" USING btree ("path");
  CREATE INDEX "site_presentations_rels_principal_links_id_idx" ON "cms"."site_presentations_rels" USING btree ("principal_links_id");
  CREATE INDEX "pages_tenant_idx" ON "cms"."pages" USING btree ("tenant");
  CREATE INDEX "pages_site_idx" ON "cms"."pages" USING btree ("site_id");
  CREATE INDEX "pages_slug_idx" ON "cms"."pages" USING btree ("slug");
  CREATE INDEX "pages_template_key_idx" ON "cms"."pages" USING btree ("template_key");
  CREATE INDEX "pages_missionary_id_idx" ON "cms"."pages" USING btree ("missionary_id");
  CREATE INDEX "pages_fund_id_idx" ON "cms"."pages" USING btree ("fund_id");
  CREATE INDEX "pages_updated_at_idx" ON "cms"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "cms"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "cms"."pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_site_slug_key" ON "cms"."pages" USING btree ("site_id","slug");
  CREATE INDEX "pages_rels_order_idx" ON "cms"."pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "cms"."pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "cms"."pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_principal_links_id_idx" ON "cms"."pages_rels" USING btree ("principal_links_id");
  CREATE INDEX "_pages_v_parent_idx" ON "cms"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "cms"."_pages_v" USING btree ("version_tenant");
  CREATE INDEX "_pages_v_version_version_site_idx" ON "cms"."_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "cms"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_template_key_idx" ON "cms"."_pages_v" USING btree ("version_template_key");
  CREATE INDEX "_pages_v_version_version_missionary_id_idx" ON "cms"."_pages_v" USING btree ("version_missionary_id");
  CREATE INDEX "_pages_v_version_version_fund_id_idx" ON "cms"."_pages_v" USING btree ("version_fund_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "cms"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "cms"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "cms"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "cms"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "cms"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "cms"."_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "cms"."_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "cms"."_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "cms"."_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "cms"."_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_principal_links_id_idx" ON "cms"."_pages_v_rels" USING btree ("principal_links_id");
  CREATE INDEX "navigation_items_order_idx" ON "cms"."navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "cms"."navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_page_idx" ON "cms"."navigation_items" USING btree ("page_id");
  CREATE INDEX "navigation_tenant_idx" ON "cms"."navigation" USING btree ("tenant");
  CREATE INDEX "navigation_site_idx" ON "cms"."navigation" USING btree ("site_id");
  CREATE INDEX "navigation_updated_at_idx" ON "cms"."navigation" USING btree ("updated_at");
  CREATE INDEX "navigation_created_at_idx" ON "cms"."navigation" USING btree ("created_at");
  CREATE INDEX "navigation_rels_order_idx" ON "cms"."navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "cms"."navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "cms"."navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_principal_links_id_idx" ON "cms"."navigation_rels" USING btree ("principal_links_id");
  CREATE INDEX "media_tenant_idx" ON "cms"."media" USING btree ("tenant");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE INDEX "media_rels_order_idx" ON "cms"."media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "cms"."media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "cms"."media_rels" USING btree ("path");
  CREATE INDEX "media_rels_principal_links_id_idx" ON "cms"."media_rels" USING btree ("principal_links_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_principal_links_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("principal_links_id");
  CREATE INDEX "payload_locked_documents_rels_site_presentations_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("site_presentations_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("navigation_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_principal_links_id_idx" ON "cms"."payload_preferences_rels" USING btree ("principal_links_id");`);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error(
    "forward only: the CMS clean baseline has no down migration; rebuild from source through the release job",
  );
}
