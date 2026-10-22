import { sql } from "@payloadcms/db-postgres";

import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cms"."_missionary_giving_pages_v_blocks_impact_stats_items"
      RENAME TO "_mgp_impact_items_v";
    ALTER INDEX "cms"."_missionary_giving_pages_v_blocks_impact_stats_items_order_idx"
      RENAME TO "_mgp_impact_items_v_order_idx";
    ALTER INDEX "cms"."_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_"
      RENAME TO "_mgp_impact_items_v_parent_id_idx";
    ALTER TABLE "cms"."_mgp_impact_items_v"
      RENAME CONSTRAINT "_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_"
      TO "_mgp_impact_items_v_parent_id_fk";

  ALTER TABLE "cms"."media" ADD COLUMN "prefix" varchar DEFAULT 'web-studio/media';
  ALTER TABLE "cms"."media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "original_filename" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "original_url" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "original_mime_type" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "original_filesize" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "original_width" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "original_height" numeric;
  ALTER TABLE "cms"."media" ADD COLUMN "original_prefix" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "original__objectkey" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "variants_thumbnail_prefix" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "variants_thumbnail__objectkey" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "variants_card_prefix" varchar;
  ALTER TABLE "cms"."media" ADD COLUMN "variants_card__objectkey" varchar;
    CREATE INDEX "media_original_original_filename_idx" ON "cms"."media" USING btree ("original_filename");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // New uploads/storage metadata cannot be represented by the preceding version.
  // Abort before any DDL if writes crossed this rollback boundary.
  await db.execute(sql`
    LOCK TABLE "cms"."media" IN ACCESS EXCLUSIVE MODE;
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM "cms"."media"
        WHERE "prefix" IS DISTINCT FROM 'web-studio/media'
          OR "_objectkey" IS NOT NULL
          OR "original_filename" IS NOT NULL
          OR "original_url" IS NOT NULL
          OR "original_mime_type" IS NOT NULL
          OR "original_filesize" IS NOT NULL
          OR "original_width" IS NOT NULL
          OR "original_height" IS NOT NULL
          OR "original_prefix" IS NOT NULL
          OR "original__objectkey" IS NOT NULL
          OR "variants_thumbnail_prefix" IS NOT NULL
          OR "variants_thumbnail__objectkey" IS NOT NULL
          OR "variants_card_prefix" IS NOT NULL
          OR "variants_card__objectkey" IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'Payload v4 media writes prevent a lossless down migration; restore the verified pre-cutover backup or deploy a forward fix.';
      END IF;
    END $$;

  DROP INDEX "cms"."media_original_original_filename_idx";
  ALTER TABLE "cms"."media" DROP COLUMN "prefix";
  ALTER TABLE "cms"."media" DROP COLUMN "_objectkey";
  ALTER TABLE "cms"."media" DROP COLUMN "original_filename";
  ALTER TABLE "cms"."media" DROP COLUMN "original_url";
  ALTER TABLE "cms"."media" DROP COLUMN "original_mime_type";
  ALTER TABLE "cms"."media" DROP COLUMN "original_filesize";
  ALTER TABLE "cms"."media" DROP COLUMN "original_width";
  ALTER TABLE "cms"."media" DROP COLUMN "original_height";
  ALTER TABLE "cms"."media" DROP COLUMN "original_prefix";
  ALTER TABLE "cms"."media" DROP COLUMN "original__objectkey";
  ALTER TABLE "cms"."media" DROP COLUMN "variants_thumbnail_prefix";
  ALTER TABLE "cms"."media" DROP COLUMN "variants_thumbnail__objectkey";
  ALTER TABLE "cms"."media" DROP COLUMN "variants_card_prefix";
  ALTER TABLE "cms"."media" DROP COLUMN "variants_card__objectkey";

    ALTER TABLE "cms"."_mgp_impact_items_v"
      RENAME CONSTRAINT "_mgp_impact_items_v_parent_id_fk"
      TO "_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_";
    ALTER INDEX "cms"."_mgp_impact_items_v_parent_id_idx"
      RENAME TO "_missionary_giving_pages_v_blocks_impact_stats_items_parent_id_";
    ALTER INDEX "cms"."_mgp_impact_items_v_order_idx"
      RENAME TO "_missionary_giving_pages_v_blocks_impact_stats_items_order_idx";
    ALTER TABLE "cms"."_mgp_impact_items_v"
      RENAME TO "_missionary_giving_pages_v_blocks_impact_stats_items";
  `);
}
