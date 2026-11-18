import { sql } from "@payloadcms/db-postgres";

import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

// Payload 4.0.0-beta.8 and beta.9 keep an upload's saved crop and focal point
// in `_transforms` and record which file and variants are stored. Generated
// with `migrate:create` on the pinned release; every column is nullable, so
// the release already running is unaffected (expand only).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cms"."media" ADD COLUMN "_stored" boolean;
    ALTER TABLE "cms"."media" ADD COLUMN "_transforms" jsonb;
    ALTER TABLE "cms"."media" ADD COLUMN "original__stored" boolean;
    ALTER TABLE "cms"."media" ADD COLUMN "variants_thumbnail__stored" boolean;
    ALTER TABLE "cms"."media" ADD COLUMN "variants_card__stored" boolean;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cms"."media" DROP COLUMN "_stored";
    ALTER TABLE "cms"."media" DROP COLUMN "_transforms";
    ALTER TABLE "cms"."media" DROP COLUMN "original__stored";
    ALTER TABLE "cms"."media" DROP COLUMN "variants_thumbnail__stored";
    ALTER TABLE "cms"."media" DROP COLUMN "variants_card__stored";
  `);
}
