import { migrateSizesToVariants } from "@payloadcms/db-postgres/migration-utils";

import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await migrateSizesToVariants({ db, payload });
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await migrateSizesToVariants({ db, direction: "down", payload });
}
