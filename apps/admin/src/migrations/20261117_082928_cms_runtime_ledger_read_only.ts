import { sql } from "@payloadcms/db-postgres";

import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

// Payload writes its migration ledger only from the migrate commands, which
// run as cms_owner, and from a development schema push. The run-time login
// reads it and cannot forge or remove a row (WP1, AL-2674). The Supabase
// migration `*_cms_database_roles.sql` gives cms_runtime row access to every
// table cms_owner creates, this one included, so the write access is taken
// back here, once Payload has created the table.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    REVOKE INSERT, UPDATE, DELETE ON "cms"."payload_migrations" FROM cms_runtime;
    REVOKE USAGE, UPDATE ON SEQUENCE "cms"."payload_migrations_id_seq" FROM cms_runtime;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    GRANT INSERT, UPDATE, DELETE ON "cms"."payload_migrations" TO cms_runtime;
    GRANT USAGE, UPDATE ON SEQUENCE "cms"."payload_migrations_id_seq" TO cms_runtime;
  `);
}
