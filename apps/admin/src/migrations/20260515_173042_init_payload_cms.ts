import {
  sql,
  type MigrateDownArgs,
  type MigrateUpArgs,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_cms_users_role" AS ENUM('staff', 'admin', 'super_admin');
  CREATE TYPE "cms"."enum_pages_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__pages_v_version_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_page_templates_page_type" AS ENUM('standard', 'missionary_giving', 'project', 'ministry_update');
  CREATE TYPE "cms"."enum_page_templates_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__page_templates_v_version_page_type" AS ENUM('standard', 'missionary_giving', 'project', 'ministry_update');
  CREATE TYPE "cms"."enum__page_templates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_missionary_giving_pages_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum_missionary_giving_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__missionary_giving_pages_v_version_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum__missionary_giving_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_project_pages_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum_project_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__project_pages_v_version_page_type" AS ENUM('standard', 'missionary_giving', 'project');
  CREATE TYPE "cms"."enum__project_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_ministry_updates_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__ministry_updates_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "cms"."cms_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"supabase_user_id" varchar,
  	"tenant_id" varchar,
  	"role" "cms"."enum_cms_users_role" DEFAULT 'staff',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"primary_domain" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"page_type" "cms"."enum_pages_page_type" DEFAULT 'standard',
  	"template_id" integer,
  	"content" jsonb,
  	"legacy_content_fallback" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_page_type" "cms"."enum__pages_v_version_page_type" DEFAULT 'standard',
  	"version_template_id" integer,
  	"version_content" jsonb,
  	"version_legacy_content_fallback" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."page_templates_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."page_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar,
  	"template_key" varchar,
  	"description" varchar,
  	"page_type" "cms"."enum_page_templates_page_type" DEFAULT 'standard',
  	"thumbnail_id" integer,
  	"default_summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_page_templates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_page_templates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar,
  	"version_template_key" varchar,
  	"version_description" varchar,
  	"version_page_type" "cms"."enum__page_templates_v_version_page_type" DEFAULT 'standard',
  	"version_thumbnail_id" integer,
  	"version_default_summary" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__page_templates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."missionary_giving_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"missionary_id" varchar,
  	"missionary_profile_id" integer,
  	"page_type" "cms"."enum_missionary_giving_pages_page_type" DEFAULT 'missionary_giving',
  	"template_key" varchar,
  	"template_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_missionary_giving_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_missionary_giving_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_missionary_id" varchar,
  	"version_missionary_profile_id" integer,
  	"version_page_type" "cms"."enum__missionary_giving_pages_v_version_page_type" DEFAULT 'missionary_giving',
  	"version_template_key" varchar,
  	"version_template_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__missionary_giving_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."project_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."project_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"fund_id" varchar,
  	"page_type" "cms"."enum_project_pages_page_type" DEFAULT 'project',
  	"template_key" varchar,
  	"template_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_project_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_media_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"media_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"copy" varchar,
  	"button_label" varchar,
  	"button_href" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_impact_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_impact_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"role" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms"."_project_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_fund_id" varchar,
  	"version_page_type" "cms"."enum__project_pages_v_version_page_type" DEFAULT 'project',
  	"version_template_key" varchar,
  	"version_template_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__project_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "cms"."navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."missionary_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"full_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"supabase_missionary_id" varchar,
  	"tagline" varchar,
  	"bio" varchar,
  	"location" varchar,
  	"portrait_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."ministry_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"missionary_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_ministry_updates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_ministry_updates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_missionary_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__ministry_updates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_users_id" integer,
  	"tenants_id" integer,
  	"pages_id" integer,
  	"page_templates_id" integer,
  	"missionary_giving_pages_id" integer,
  	"project_pages_id" integer,
  	"navigation_id" integer,
  	"missionary_profiles_id" integer,
  	"ministry_updates_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_users_id" integer
  );
  
  CREATE TABLE "cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "cms"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_media_feature" ADD CONSTRAINT "pages_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_media_feature" ADD CONSTRAINT "pages_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_call_to_action" ADD CONSTRAINT "pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_impact_stats_items" ADD CONSTRAINT "pages_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_impact_stats" ADD CONSTRAINT "pages_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."pages" ADD CONSTRAINT "pages_template_id_page_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_media_feature" ADD CONSTRAINT "_pages_v_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_media_feature" ADD CONSTRAINT "_pages_v_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_call_to_action" ADD CONSTRAINT "_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_impact_stats_items" ADD CONSTRAINT "_pages_v_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_impact_stats" ADD CONSTRAINT "_pages_v_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_pages_v" ADD CONSTRAINT "_pages_v_version_template_id_page_templates_id_fk" FOREIGN KEY ("version_template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_hero" ADD CONSTRAINT "page_templates_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_hero" ADD CONSTRAINT "page_templates_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_rich_text" ADD CONSTRAINT "page_templates_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_media_feature" ADD CONSTRAINT "page_templates_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_media_feature" ADD CONSTRAINT "page_templates_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_call_to_action" ADD CONSTRAINT "page_templates_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_faq_items" ADD CONSTRAINT "page_templates_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_faq" ADD CONSTRAINT "page_templates_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_impact_stats_items" ADD CONSTRAINT "page_templates_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_impact_stats" ADD CONSTRAINT "page_templates_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates_blocks_testimonial" ADD CONSTRAINT "page_templates_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_templates" ADD CONSTRAINT "page_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_templates" ADD CONSTRAINT "page_templates_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_hero" ADD CONSTRAINT "_page_templates_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_hero" ADD CONSTRAINT "_page_templates_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_rich_text" ADD CONSTRAINT "_page_templates_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_media_feature" ADD CONSTRAINT "_page_templates_v_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_media_feature" ADD CONSTRAINT "_page_templates_v_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_call_to_action" ADD CONSTRAINT "_page_templates_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_faq_items" ADD CONSTRAINT "_page_templates_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_faq" ADD CONSTRAINT "_page_templates_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_impact_stats_items" ADD CONSTRAINT "_page_templates_v_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_impact_stats" ADD CONSTRAINT "_page_templates_v_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v_blocks_testimonial" ADD CONSTRAINT "_page_templates_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_page_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v" ADD CONSTRAINT "_page_templates_v_parent_id_page_templates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v" ADD CONSTRAINT "_page_templates_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_page_templates_v" ADD CONSTRAINT "_page_templates_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_hero" ADD CONSTRAINT "missionary_giving_pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_hero" ADD CONSTRAINT "missionary_giving_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_rich_text" ADD CONSTRAINT "missionary_giving_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_media_feature" ADD CONSTRAINT "missionary_giving_pages_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_media_feature" ADD CONSTRAINT "missionary_giving_pages_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_call_to_action" ADD CONSTRAINT "missionary_giving_pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_faq_items" ADD CONSTRAINT "missionary_giving_pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_faq" ADD CONSTRAINT "missionary_giving_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_impact_stats_items" ADD CONSTRAINT "missionary_giving_pages_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_impact_stats" ADD CONSTRAINT "missionary_giving_pages_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages_blocks_testimonial" ADD CONSTRAINT "missionary_giving_pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages" ADD CONSTRAINT "missionary_giving_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages" ADD CONSTRAINT "missionary_giving_pages_missionary_profile_id_missionary_profiles_id_fk" FOREIGN KEY ("missionary_profile_id") REFERENCES "cms"."missionary_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_giving_pages" ADD CONSTRAINT "missionary_giving_pages_template_id_page_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_hero" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_hero" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_rich_text" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_media_feature" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_media_feature" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_call_to_action" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_faq_items" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_faq" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats_items" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_testimonial" ADD CONSTRAINT "_missionary_giving_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_missionary_giving_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v" ADD CONSTRAINT "_missionary_giving_pages_v_parent_id_missionary_giving_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v" ADD CONSTRAINT "_missionary_giving_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v" ADD CONSTRAINT "_missionary_giving_pages_v_version_missionary_profile_id_missionary_profiles_id_fk" FOREIGN KEY ("version_missionary_profile_id") REFERENCES "cms"."missionary_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_missionary_giving_pages_v" ADD CONSTRAINT "_missionary_giving_pages_v_version_template_id_page_templates_id_fk" FOREIGN KEY ("version_template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_hero" ADD CONSTRAINT "project_pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_hero" ADD CONSTRAINT "project_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_rich_text" ADD CONSTRAINT "project_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_media_feature" ADD CONSTRAINT "project_pages_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_media_feature" ADD CONSTRAINT "project_pages_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_call_to_action" ADD CONSTRAINT "project_pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_faq_items" ADD CONSTRAINT "project_pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_faq" ADD CONSTRAINT "project_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_impact_stats_items" ADD CONSTRAINT "project_pages_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_impact_stats" ADD CONSTRAINT "project_pages_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages_blocks_testimonial" ADD CONSTRAINT "project_pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."project_pages" ADD CONSTRAINT "project_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."project_pages" ADD CONSTRAINT "project_pages_template_id_page_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_hero" ADD CONSTRAINT "_project_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_hero" ADD CONSTRAINT "_project_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_rich_text" ADD CONSTRAINT "_project_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_media_feature" ADD CONSTRAINT "_project_pages_v_blocks_media_feature_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_media_feature" ADD CONSTRAINT "_project_pages_v_blocks_media_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_call_to_action" ADD CONSTRAINT "_project_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_faq_items" ADD CONSTRAINT "_project_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_faq" ADD CONSTRAINT "_project_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_impact_stats_items" ADD CONSTRAINT "_project_pages_v_blocks_impact_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v_blocks_impact_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_impact_stats" ADD CONSTRAINT "_project_pages_v_blocks_impact_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v_blocks_testimonial" ADD CONSTRAINT "_project_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_project_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v" ADD CONSTRAINT "_project_pages_v_parent_id_project_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."project_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v" ADD CONSTRAINT "_project_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_project_pages_v" ADD CONSTRAINT "_project_pages_v_version_template_id_page_templates_id_fk" FOREIGN KEY ("version_template_id") REFERENCES "cms"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."navigation" ADD CONSTRAINT "navigation_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_profiles" ADD CONSTRAINT "missionary_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."missionary_profiles" ADD CONSTRAINT "missionary_profiles_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."ministry_updates" ADD CONSTRAINT "ministry_updates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."ministry_updates" ADD CONSTRAINT "ministry_updates_missionary_id_missionary_profiles_id_fk" FOREIGN KEY ("missionary_id") REFERENCES "cms"."missionary_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_ministry_updates_v" ADD CONSTRAINT "_ministry_updates_v_parent_id_ministry_updates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."ministry_updates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_ministry_updates_v" ADD CONSTRAINT "_ministry_updates_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_ministry_updates_v" ADD CONSTRAINT "_ministry_updates_v_version_missionary_id_missionary_profiles_id_fk" FOREIGN KEY ("version_missionary_id") REFERENCES "cms"."missionary_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "cms"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cms_users_fk" FOREIGN KEY ("cms_users_id") REFERENCES "cms"."cms_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "cms"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_templates_fk" FOREIGN KEY ("page_templates_id") REFERENCES "cms"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missionary_giving_pages_fk" FOREIGN KEY ("missionary_giving_pages_id") REFERENCES "cms"."missionary_giving_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_pages_fk" FOREIGN KEY ("project_pages_id") REFERENCES "cms"."project_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_fk" FOREIGN KEY ("navigation_id") REFERENCES "cms"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missionary_profiles_fk" FOREIGN KEY ("missionary_profiles_id") REFERENCES "cms"."missionary_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ministry_updates_fk" FOREIGN KEY ("ministry_updates_id") REFERENCES "cms"."ministry_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_cms_users_fk" FOREIGN KEY ("cms_users_id") REFERENCES "cms"."cms_users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "cms_users_email_idx" ON "cms"."cms_users" USING btree ("email");
  CREATE UNIQUE INDEX "cms_users_supabase_user_id_idx" ON "cms"."cms_users" USING btree ("supabase_user_id");
  CREATE INDEX "cms_users_tenant_id_idx" ON "cms"."cms_users" USING btree ("tenant_id");
  CREATE INDEX "cms_users_updated_at_idx" ON "cms"."cms_users" USING btree ("updated_at");
  CREATE INDEX "cms_users_created_at_idx" ON "cms"."cms_users" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "cms"."tenants" USING btree ("slug");
  CREATE INDEX "tenants_updated_at_idx" ON "cms"."tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "cms"."tenants" USING btree ("created_at");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "cms"."pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "cms"."pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "cms"."pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "cms"."pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "cms"."pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "cms"."pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "cms"."pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_feature_order_idx" ON "cms"."pages_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_feature_parent_id_idx" ON "cms"."pages_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_feature_path_idx" ON "cms"."pages_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_feature_media_idx" ON "cms"."pages_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "pages_blocks_call_to_action_order_idx" ON "cms"."pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "pages_blocks_call_to_action_parent_id_idx" ON "cms"."pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_call_to_action_path_idx" ON "cms"."pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "cms"."pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "cms"."pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "cms"."pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "cms"."pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "cms"."pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_impact_stats_items_order_idx" ON "cms"."pages_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_impact_stats_items_parent_id_idx" ON "cms"."pages_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_impact_stats_order_idx" ON "cms"."pages_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_impact_stats_parent_id_idx" ON "cms"."pages_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_impact_stats_path_idx" ON "cms"."pages_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_order_idx" ON "cms"."pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_parent_id_idx" ON "cms"."pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_path_idx" ON "cms"."pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "pages_tenant_idx" ON "cms"."pages" USING btree ("tenant_id");
  CREATE INDEX "pages_slug_idx" ON "cms"."pages" USING btree ("slug");
  CREATE INDEX "pages_template_idx" ON "cms"."pages" USING btree ("template_id");
  CREATE INDEX "pages_updated_at_idx" ON "cms"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "cms"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "cms"."pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "cms"."_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "cms"."_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "cms"."_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "cms"."_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "cms"."_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "cms"."_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "cms"."_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_feature_order_idx" ON "cms"."_pages_v_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_feature_parent_id_idx" ON "cms"."_pages_v_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_feature_path_idx" ON "cms"."_pages_v_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_feature_media_idx" ON "cms"."_pages_v_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_order_idx" ON "cms"."_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_call_to_action_parent_id_idx" ON "cms"."_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_path_idx" ON "cms"."_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "cms"."_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "cms"."_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "cms"."_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "cms"."_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "cms"."_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_impact_stats_items_order_idx" ON "cms"."_pages_v_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_impact_stats_items_parent_id_idx" ON "cms"."_pages_v_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_impact_stats_order_idx" ON "cms"."_pages_v_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_impact_stats_parent_id_idx" ON "cms"."_pages_v_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_impact_stats_path_idx" ON "cms"."_pages_v_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_order_idx" ON "cms"."_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_parent_id_idx" ON "cms"."_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_path_idx" ON "cms"."_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "cms"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "cms"."_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "cms"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_template_idx" ON "cms"."_pages_v" USING btree ("version_template_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "cms"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "cms"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "cms"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "cms"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "cms"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "cms"."_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "cms"."_pages_v" USING btree ("autosave");
  CREATE INDEX "page_templates_blocks_hero_order_idx" ON "cms"."page_templates_blocks_hero" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_hero_parent_id_idx" ON "cms"."page_templates_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_hero_path_idx" ON "cms"."page_templates_blocks_hero" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_hero_background_image_idx" ON "cms"."page_templates_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "page_templates_blocks_rich_text_order_idx" ON "cms"."page_templates_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_rich_text_parent_id_idx" ON "cms"."page_templates_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_rich_text_path_idx" ON "cms"."page_templates_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_media_feature_order_idx" ON "cms"."page_templates_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_media_feature_parent_id_idx" ON "cms"."page_templates_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_media_feature_path_idx" ON "cms"."page_templates_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_media_feature_media_idx" ON "cms"."page_templates_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "page_templates_blocks_call_to_action_order_idx" ON "cms"."page_templates_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_call_to_action_parent_id_idx" ON "cms"."page_templates_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_call_to_action_path_idx" ON "cms"."page_templates_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_faq_items_order_idx" ON "cms"."page_templates_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_faq_items_parent_id_idx" ON "cms"."page_templates_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_faq_order_idx" ON "cms"."page_templates_blocks_faq" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_faq_parent_id_idx" ON "cms"."page_templates_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_faq_path_idx" ON "cms"."page_templates_blocks_faq" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_impact_stats_items_order_idx" ON "cms"."page_templates_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_impact_stats_items_parent_id_idx" ON "cms"."page_templates_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_impact_stats_order_idx" ON "cms"."page_templates_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_impact_stats_parent_id_idx" ON "cms"."page_templates_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_impact_stats_path_idx" ON "cms"."page_templates_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_testimonial_order_idx" ON "cms"."page_templates_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_testimonial_parent_id_idx" ON "cms"."page_templates_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_testimonial_path_idx" ON "cms"."page_templates_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "page_templates_tenant_idx" ON "cms"."page_templates" USING btree ("tenant_id");
  CREATE INDEX "page_templates_template_key_idx" ON "cms"."page_templates" USING btree ("template_key");
  CREATE INDEX "page_templates_thumbnail_idx" ON "cms"."page_templates" USING btree ("thumbnail_id");
  CREATE INDEX "page_templates_updated_at_idx" ON "cms"."page_templates" USING btree ("updated_at");
  CREATE INDEX "page_templates_created_at_idx" ON "cms"."page_templates" USING btree ("created_at");
  CREATE INDEX "page_templates__status_idx" ON "cms"."page_templates" USING btree ("_status");
  CREATE INDEX "_page_templates_v_blocks_hero_order_idx" ON "cms"."_page_templates_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_hero_parent_id_idx" ON "cms"."_page_templates_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_hero_path_idx" ON "cms"."_page_templates_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_hero_background_image_idx" ON "cms"."_page_templates_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_page_templates_v_blocks_rich_text_order_idx" ON "cms"."_page_templates_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_rich_text_parent_id_idx" ON "cms"."_page_templates_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_rich_text_path_idx" ON "cms"."_page_templates_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_media_feature_order_idx" ON "cms"."_page_templates_v_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_media_feature_parent_id_idx" ON "cms"."_page_templates_v_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_media_feature_path_idx" ON "cms"."_page_templates_v_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_media_feature_media_idx" ON "cms"."_page_templates_v_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "_page_templates_v_blocks_call_to_action_order_idx" ON "cms"."_page_templates_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_call_to_action_parent_id_idx" ON "cms"."_page_templates_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_call_to_action_path_idx" ON "cms"."_page_templates_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_faq_items_order_idx" ON "cms"."_page_templates_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_faq_items_parent_id_idx" ON "cms"."_page_templates_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_faq_order_idx" ON "cms"."_page_templates_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_faq_parent_id_idx" ON "cms"."_page_templates_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_faq_path_idx" ON "cms"."_page_templates_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_impact_stats_items_order_idx" ON "cms"."_page_templates_v_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_impact_stats_items_parent_id_idx" ON "cms"."_page_templates_v_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_impact_stats_order_idx" ON "cms"."_page_templates_v_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_impact_stats_parent_id_idx" ON "cms"."_page_templates_v_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_impact_stats_path_idx" ON "cms"."_page_templates_v_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "_page_templates_v_blocks_testimonial_order_idx" ON "cms"."_page_templates_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_page_templates_v_blocks_testimonial_parent_id_idx" ON "cms"."_page_templates_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_page_templates_v_blocks_testimonial_path_idx" ON "cms"."_page_templates_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_page_templates_v_parent_idx" ON "cms"."_page_templates_v" USING btree ("parent_id");
  CREATE INDEX "_page_templates_v_version_version_tenant_idx" ON "cms"."_page_templates_v" USING btree ("version_tenant_id");
  CREATE INDEX "_page_templates_v_version_version_template_key_idx" ON "cms"."_page_templates_v" USING btree ("version_template_key");
  CREATE INDEX "_page_templates_v_version_version_thumbnail_idx" ON "cms"."_page_templates_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_page_templates_v_version_version_updated_at_idx" ON "cms"."_page_templates_v" USING btree ("version_updated_at");
  CREATE INDEX "_page_templates_v_version_version_created_at_idx" ON "cms"."_page_templates_v" USING btree ("version_created_at");
  CREATE INDEX "_page_templates_v_version_version__status_idx" ON "cms"."_page_templates_v" USING btree ("version__status");
  CREATE INDEX "_page_templates_v_created_at_idx" ON "cms"."_page_templates_v" USING btree ("created_at");
  CREATE INDEX "_page_templates_v_updated_at_idx" ON "cms"."_page_templates_v" USING btree ("updated_at");
  CREATE INDEX "_page_templates_v_latest_idx" ON "cms"."_page_templates_v" USING btree ("latest");
  CREATE INDEX "_page_templates_v_autosave_idx" ON "cms"."_page_templates_v" USING btree ("autosave");
  CREATE INDEX "missionary_giving_pages_blocks_hero_order_idx" ON "cms"."missionary_giving_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_hero_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_hero_path_idx" ON "cms"."missionary_giving_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_hero_background_image_idx" ON "cms"."missionary_giving_pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "missionary_giving_pages_blocks_rich_text_order_idx" ON "cms"."missionary_giving_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_rich_text_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_rich_text_path_idx" ON "cms"."missionary_giving_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_media_feature_order_idx" ON "cms"."missionary_giving_pages_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_media_feature_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_media_feature_path_idx" ON "cms"."missionary_giving_pages_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_media_feature_media_idx" ON "cms"."missionary_giving_pages_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "missionary_giving_pages_blocks_call_to_action_order_idx" ON "cms"."missionary_giving_pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_call_to_action_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_call_to_action_path_idx" ON "cms"."missionary_giving_pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_faq_items_order_idx" ON "cms"."missionary_giving_pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_faq_items_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_faq_order_idx" ON "cms"."missionary_giving_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_faq_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_faq_path_idx" ON "cms"."missionary_giving_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_impact_stats_items_order_idx" ON "cms"."missionary_giving_pages_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_impact_stats_items_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_impact_stats_order_idx" ON "cms"."missionary_giving_pages_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_impact_stats_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_impact_stats_path_idx" ON "cms"."missionary_giving_pages_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_blocks_testimonial_order_idx" ON "cms"."missionary_giving_pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "missionary_giving_pages_blocks_testimonial_parent_id_idx" ON "cms"."missionary_giving_pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "missionary_giving_pages_blocks_testimonial_path_idx" ON "cms"."missionary_giving_pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "missionary_giving_pages_tenant_idx" ON "cms"."missionary_giving_pages" USING btree ("tenant_id");
  CREATE INDEX "missionary_giving_pages_missionary_id_idx" ON "cms"."missionary_giving_pages" USING btree ("missionary_id");
  CREATE INDEX "missionary_giving_pages_missionary_profile_idx" ON "cms"."missionary_giving_pages" USING btree ("missionary_profile_id");
  CREATE INDEX "missionary_giving_pages_template_key_idx" ON "cms"."missionary_giving_pages" USING btree ("template_key");
  CREATE INDEX "missionary_giving_pages_template_idx" ON "cms"."missionary_giving_pages" USING btree ("template_id");
  CREATE INDEX "missionary_giving_pages_slug_idx" ON "cms"."missionary_giving_pages" USING btree ("slug");
  CREATE INDEX "missionary_giving_pages_updated_at_idx" ON "cms"."missionary_giving_pages" USING btree ("updated_at");
  CREATE INDEX "missionary_giving_pages_created_at_idx" ON "cms"."missionary_giving_pages" USING btree ("created_at");
  CREATE INDEX "missionary_giving_pages__status_idx" ON "cms"."missionary_giving_pages" USING btree ("_status");
  CREATE INDEX "_missionary_giving_pages_v_blocks_hero_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_hero_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_hero_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_hero_background_image_idx" ON "cms"."_missionary_giving_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_rich_text_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_rich_text_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_rich_text_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_media_feature_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_media_feature_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_media_feature_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_media_feature_media_idx" ON "cms"."_missionary_giving_pages_v_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_call_to_action_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_call_to_action_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_call_to_action_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_faq_items_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_faq_items_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_faq_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_faq_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_faq_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_impact_stats_items_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_impact_stats_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_impact_stats_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_impact_stats_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_blocks_testimonial_order_idx" ON "cms"."_missionary_giving_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_missionary_giving_pages_v_blocks_testimonial_parent_id_idx" ON "cms"."_missionary_giving_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_missionary_giving_pages_v_blocks_testimonial_path_idx" ON "cms"."_missionary_giving_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_missionary_giving_pages_v_parent_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("parent_id");
  CREATE INDEX "_missionary_giving_pages_v_version_version_tenant_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_missionary_giving_pages_v_version_version_missionary_id_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_missionary_id");
  CREATE INDEX "_missionary_giving_pages_v_version_version_missionary_pr_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_missionary_profile_id");
  CREATE INDEX "_missionary_giving_pages_v_version_version_template_key_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_template_key");
  CREATE INDEX "_missionary_giving_pages_v_version_version_template_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_template_id");
  CREATE INDEX "_missionary_giving_pages_v_version_version_slug_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_slug");
  CREATE INDEX "_missionary_giving_pages_v_version_version_updated_at_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_missionary_giving_pages_v_version_version_created_at_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_missionary_giving_pages_v_version_version__status_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("version__status");
  CREATE INDEX "_missionary_giving_pages_v_created_at_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("created_at");
  CREATE INDEX "_missionary_giving_pages_v_updated_at_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("updated_at");
  CREATE INDEX "_missionary_giving_pages_v_latest_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("latest");
  CREATE INDEX "_missionary_giving_pages_v_autosave_idx" ON "cms"."_missionary_giving_pages_v" USING btree ("autosave");
  CREATE INDEX "project_pages_blocks_hero_order_idx" ON "cms"."project_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_hero_parent_id_idx" ON "cms"."project_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_hero_path_idx" ON "cms"."project_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_hero_background_image_idx" ON "cms"."project_pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "project_pages_blocks_rich_text_order_idx" ON "cms"."project_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_rich_text_parent_id_idx" ON "cms"."project_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_rich_text_path_idx" ON "cms"."project_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_media_feature_order_idx" ON "cms"."project_pages_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_media_feature_parent_id_idx" ON "cms"."project_pages_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_media_feature_path_idx" ON "cms"."project_pages_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_media_feature_media_idx" ON "cms"."project_pages_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "project_pages_blocks_call_to_action_order_idx" ON "cms"."project_pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_call_to_action_parent_id_idx" ON "cms"."project_pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_call_to_action_path_idx" ON "cms"."project_pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_faq_items_order_idx" ON "cms"."project_pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_faq_items_parent_id_idx" ON "cms"."project_pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_faq_order_idx" ON "cms"."project_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_faq_parent_id_idx" ON "cms"."project_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_faq_path_idx" ON "cms"."project_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_impact_stats_items_order_idx" ON "cms"."project_pages_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_impact_stats_items_parent_id_idx" ON "cms"."project_pages_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_impact_stats_order_idx" ON "cms"."project_pages_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_impact_stats_parent_id_idx" ON "cms"."project_pages_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_impact_stats_path_idx" ON "cms"."project_pages_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "project_pages_blocks_testimonial_order_idx" ON "cms"."project_pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "project_pages_blocks_testimonial_parent_id_idx" ON "cms"."project_pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "project_pages_blocks_testimonial_path_idx" ON "cms"."project_pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "project_pages_tenant_idx" ON "cms"."project_pages" USING btree ("tenant_id");
  CREATE INDEX "project_pages_fund_id_idx" ON "cms"."project_pages" USING btree ("fund_id");
  CREATE INDEX "project_pages_template_key_idx" ON "cms"."project_pages" USING btree ("template_key");
  CREATE INDEX "project_pages_template_idx" ON "cms"."project_pages" USING btree ("template_id");
  CREATE INDEX "project_pages_slug_idx" ON "cms"."project_pages" USING btree ("slug");
  CREATE INDEX "project_pages_updated_at_idx" ON "cms"."project_pages" USING btree ("updated_at");
  CREATE INDEX "project_pages_created_at_idx" ON "cms"."project_pages" USING btree ("created_at");
  CREATE INDEX "project_pages__status_idx" ON "cms"."project_pages" USING btree ("_status");
  CREATE INDEX "_project_pages_v_blocks_hero_order_idx" ON "cms"."_project_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_hero_parent_id_idx" ON "cms"."_project_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_hero_path_idx" ON "cms"."_project_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_hero_background_image_idx" ON "cms"."_project_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_project_pages_v_blocks_rich_text_order_idx" ON "cms"."_project_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_rich_text_parent_id_idx" ON "cms"."_project_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_rich_text_path_idx" ON "cms"."_project_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_media_feature_order_idx" ON "cms"."_project_pages_v_blocks_media_feature" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_media_feature_parent_id_idx" ON "cms"."_project_pages_v_blocks_media_feature" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_media_feature_path_idx" ON "cms"."_project_pages_v_blocks_media_feature" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_media_feature_media_idx" ON "cms"."_project_pages_v_blocks_media_feature" USING btree ("media_id");
  CREATE INDEX "_project_pages_v_blocks_call_to_action_order_idx" ON "cms"."_project_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_call_to_action_parent_id_idx" ON "cms"."_project_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_call_to_action_path_idx" ON "cms"."_project_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_faq_items_order_idx" ON "cms"."_project_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_faq_items_parent_id_idx" ON "cms"."_project_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_faq_order_idx" ON "cms"."_project_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_faq_parent_id_idx" ON "cms"."_project_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_faq_path_idx" ON "cms"."_project_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_impact_stats_items_order_idx" ON "cms"."_project_pages_v_blocks_impact_stats_items" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_impact_stats_items_parent_id_idx" ON "cms"."_project_pages_v_blocks_impact_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_impact_stats_order_idx" ON "cms"."_project_pages_v_blocks_impact_stats" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_impact_stats_parent_id_idx" ON "cms"."_project_pages_v_blocks_impact_stats" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_impact_stats_path_idx" ON "cms"."_project_pages_v_blocks_impact_stats" USING btree ("_path");
  CREATE INDEX "_project_pages_v_blocks_testimonial_order_idx" ON "cms"."_project_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_project_pages_v_blocks_testimonial_parent_id_idx" ON "cms"."_project_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_project_pages_v_blocks_testimonial_path_idx" ON "cms"."_project_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_project_pages_v_parent_idx" ON "cms"."_project_pages_v" USING btree ("parent_id");
  CREATE INDEX "_project_pages_v_version_version_tenant_idx" ON "cms"."_project_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_project_pages_v_version_version_fund_id_idx" ON "cms"."_project_pages_v" USING btree ("version_fund_id");
  CREATE INDEX "_project_pages_v_version_version_template_key_idx" ON "cms"."_project_pages_v" USING btree ("version_template_key");
  CREATE INDEX "_project_pages_v_version_version_template_idx" ON "cms"."_project_pages_v" USING btree ("version_template_id");
  CREATE INDEX "_project_pages_v_version_version_slug_idx" ON "cms"."_project_pages_v" USING btree ("version_slug");
  CREATE INDEX "_project_pages_v_version_version_updated_at_idx" ON "cms"."_project_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_project_pages_v_version_version_created_at_idx" ON "cms"."_project_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_project_pages_v_version_version__status_idx" ON "cms"."_project_pages_v" USING btree ("version__status");
  CREATE INDEX "_project_pages_v_created_at_idx" ON "cms"."_project_pages_v" USING btree ("created_at");
  CREATE INDEX "_project_pages_v_updated_at_idx" ON "cms"."_project_pages_v" USING btree ("updated_at");
  CREATE INDEX "_project_pages_v_latest_idx" ON "cms"."_project_pages_v" USING btree ("latest");
  CREATE INDEX "_project_pages_v_autosave_idx" ON "cms"."_project_pages_v" USING btree ("autosave");
  CREATE INDEX "navigation_items_order_idx" ON "cms"."navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "cms"."navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_tenant_idx" ON "cms"."navigation" USING btree ("tenant_id");
  CREATE INDEX "navigation_updated_at_idx" ON "cms"."navigation" USING btree ("updated_at");
  CREATE INDEX "navigation_created_at_idx" ON "cms"."navigation" USING btree ("created_at");
  CREATE INDEX "missionary_profiles_tenant_idx" ON "cms"."missionary_profiles" USING btree ("tenant_id");
  CREATE INDEX "missionary_profiles_slug_idx" ON "cms"."missionary_profiles" USING btree ("slug");
  CREATE INDEX "missionary_profiles_supabase_missionary_id_idx" ON "cms"."missionary_profiles" USING btree ("supabase_missionary_id");
  CREATE INDEX "missionary_profiles_portrait_idx" ON "cms"."missionary_profiles" USING btree ("portrait_id");
  CREATE INDEX "missionary_profiles_updated_at_idx" ON "cms"."missionary_profiles" USING btree ("updated_at");
  CREATE INDEX "missionary_profiles_created_at_idx" ON "cms"."missionary_profiles" USING btree ("created_at");
  CREATE INDEX "ministry_updates_tenant_idx" ON "cms"."ministry_updates" USING btree ("tenant_id");
  CREATE INDEX "ministry_updates_missionary_idx" ON "cms"."ministry_updates" USING btree ("missionary_id");
  CREATE INDEX "ministry_updates_slug_idx" ON "cms"."ministry_updates" USING btree ("slug");
  CREATE INDEX "ministry_updates_updated_at_idx" ON "cms"."ministry_updates" USING btree ("updated_at");
  CREATE INDEX "ministry_updates_created_at_idx" ON "cms"."ministry_updates" USING btree ("created_at");
  CREATE INDEX "ministry_updates__status_idx" ON "cms"."ministry_updates" USING btree ("_status");
  CREATE INDEX "_ministry_updates_v_parent_idx" ON "cms"."_ministry_updates_v" USING btree ("parent_id");
  CREATE INDEX "_ministry_updates_v_version_version_tenant_idx" ON "cms"."_ministry_updates_v" USING btree ("version_tenant_id");
  CREATE INDEX "_ministry_updates_v_version_version_missionary_idx" ON "cms"."_ministry_updates_v" USING btree ("version_missionary_id");
  CREATE INDEX "_ministry_updates_v_version_version_slug_idx" ON "cms"."_ministry_updates_v" USING btree ("version_slug");
  CREATE INDEX "_ministry_updates_v_version_version_updated_at_idx" ON "cms"."_ministry_updates_v" USING btree ("version_updated_at");
  CREATE INDEX "_ministry_updates_v_version_version_created_at_idx" ON "cms"."_ministry_updates_v" USING btree ("version_created_at");
  CREATE INDEX "_ministry_updates_v_version_version__status_idx" ON "cms"."_ministry_updates_v" USING btree ("version__status");
  CREATE INDEX "_ministry_updates_v_created_at_idx" ON "cms"."_ministry_updates_v" USING btree ("created_at");
  CREATE INDEX "_ministry_updates_v_updated_at_idx" ON "cms"."_ministry_updates_v" USING btree ("updated_at");
  CREATE INDEX "_ministry_updates_v_latest_idx" ON "cms"."_ministry_updates_v" USING btree ("latest");
  CREATE INDEX "_ministry_updates_v_autosave_idx" ON "cms"."_ministry_updates_v" USING btree ("autosave");
  CREATE INDEX "media_tenant_idx" ON "cms"."media" USING btree ("tenant_id");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "cms"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "cms"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "cms"."media" USING btree ("sizes_card_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_cms_users_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("cms_users_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_page_templates_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("page_templates_id");
  CREATE INDEX "payload_locked_documents_rels_missionary_giving_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("missionary_giving_pages_id");
  CREATE INDEX "payload_locked_documents_rels_project_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("project_pages_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("navigation_id");
  CREATE INDEX "payload_locked_documents_rels_missionary_profiles_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("missionary_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_ministry_updates_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("ministry_updates_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_cms_users_id_idx" ON "cms"."payload_preferences_rels" USING btree ("cms_users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "cms"."payload_migrations" USING btree ("created_at");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."cms_users" CASCADE;
  DROP TABLE "cms"."tenants" CASCADE;
  DROP TABLE "cms"."pages_blocks_hero" CASCADE;
  DROP TABLE "cms"."pages_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."pages_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."pages_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."pages_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."pages_blocks_faq" CASCADE;
  DROP TABLE "cms"."pages_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."pages_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."pages_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."pages" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_hero" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_faq" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."_pages_v" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_hero" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_faq" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."page_templates_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."page_templates" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_hero" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_faq" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."_page_templates_v_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."_page_templates_v" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_hero" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_faq" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."missionary_giving_pages" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_hero" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_faq" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."_missionary_giving_pages_v" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_hero" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_faq" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."project_pages_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."project_pages" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_hero" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_media_feature" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_faq" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_impact_stats_items" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_impact_stats" CASCADE;
  DROP TABLE "cms"."_project_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "cms"."_project_pages_v" CASCADE;
  DROP TABLE "cms"."navigation_items" CASCADE;
  DROP TABLE "cms"."navigation" CASCADE;
  DROP TABLE "cms"."missionary_profiles" CASCADE;
  DROP TABLE "cms"."ministry_updates" CASCADE;
  DROP TABLE "cms"."_ministry_updates_v" CASCADE;
  DROP TABLE "cms"."media" CASCADE;
  DROP TABLE "cms"."payload_kv" CASCADE;
  DROP TABLE "cms"."payload_locked_documents" CASCADE;
  DROP TABLE "cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "cms"."payload_preferences" CASCADE;
  DROP TABLE "cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "cms"."payload_migrations" CASCADE;
  DROP TYPE "cms"."enum_cms_users_role";
  DROP TYPE "cms"."enum_pages_page_type";
  DROP TYPE "cms"."enum_pages_status";
  DROP TYPE "cms"."enum__pages_v_version_page_type";
  DROP TYPE "cms"."enum__pages_v_version_status";
  DROP TYPE "cms"."enum_page_templates_page_type";
  DROP TYPE "cms"."enum_page_templates_status";
  DROP TYPE "cms"."enum__page_templates_v_version_page_type";
  DROP TYPE "cms"."enum__page_templates_v_version_status";
  DROP TYPE "cms"."enum_missionary_giving_pages_page_type";
  DROP TYPE "cms"."enum_missionary_giving_pages_status";
  DROP TYPE "cms"."enum__missionary_giving_pages_v_version_page_type";
  DROP TYPE "cms"."enum__missionary_giving_pages_v_version_status";
  DROP TYPE "cms"."enum_project_pages_page_type";
  DROP TYPE "cms"."enum_project_pages_status";
  DROP TYPE "cms"."enum__project_pages_v_version_page_type";
  DROP TYPE "cms"."enum__project_pages_v_version_status";
  DROP TYPE "cms"."enum_ministry_updates_status";
  DROP TYPE "cms"."enum__ministry_updates_v_version_status";`);
}
