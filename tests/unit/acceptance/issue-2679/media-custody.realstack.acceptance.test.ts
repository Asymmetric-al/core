import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadManifest } from "../../../../scripts/verify/field-policy-census.mjs";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

const MAX_MEDIA_BYTES = 15_728_640;
const MIN_PURGE_DELAY_SECONDS = 30 * 24 * 60 * 60;
const EXPECTED_PURGE_DELAY_SECONDS = 35 * 24 * 60 * 60;

type Caller = {
  sub?: string | null;
  headers?: Record<string, string>;
};

type QueryOutcome = {
  rows: Record<string, unknown>[];
  code: string | null;
  message: string;
};

function makeFixtureIds() {
  return {
    TA: randomUUID(),
    TB: randomUUID(),
    UStaffA: randomUUID(),
    UStaffB: randomUUID(),
    UMulti: randomUUID(),
    UTwoSubroles: randomUUID(),
    UInactiveLive: randomUUID(),
    URevoked: randomUUID(),
    UDonorA: randomUUID(),
    UMissionaryA: randomUUID(),
    mStaffA: randomUUID(),
    mStaffB: randomUUID(),
    mMultiA: randomUUID(),
    mMultiB: randomUUID(),
    mSub1: randomUUID(),
    mSub2: randomUUID(),
    mInactive: randomUUID(),
    mLive: randomUUID(),
    mRevoked: randomUUID(),
    mDonorA: randomUUID(),
    mMissionaryA: randomUUID(),
    assetReadyA: randomUUID(),
    assetReadyB: randomUUID(),
    assetUploadingA: randomUUID(),
    assetFailedA: randomUUID(),
    assetDeletedA: randomUUID(),
  };
}

function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => {
    expect(ADMIN_URL).not.toBe("");
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2679 WP6 part 1 media custody (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = makeFixtureIds();
    const [lowerSubId, higherSubId] = sortedPair(id.mSub1, id.mSub2);
    const sampleHashA = "a".repeat(64);
    const sampleHashB = "b".repeat(64);

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function seedFixture() {
      await db.query(
        `insert into public.tenants (id, name, slug, status)
       values ($1::uuid, 'WP6 Tenant A', 'wp6-a-' || $1::uuid::text, 'active'),
              ($2::uuid, 'WP6 Tenant B', 'wp6-b-' || $2::uuid::text, 'active')`,
        [id.TA, id.TB],
      );
      const users = [
        id.UStaffA,
        id.UStaffB,
        id.UMulti,
        id.UTwoSubroles,
        id.UInactiveLive,
        id.URevoked,
        id.UDonorA,
        id.UMissionaryA,
      ];
      await db.query(
        `insert into auth.users (id)
       select unnest($1::uuid[])`,
        [users],
      );
      await db.query(
        `delete from authz.memberships where user_id = any($1::uuid[])`,
        [users],
      );
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, revoked_at)
       values
         ($1, $2, $3, 'staff', 'finance', true, null),
         ($4, $5, $6, 'staff', 'finance', true, null),
         ($7, $8, $3, 'staff', 'development', true, null),
         ($9, $8, $6, 'staff', 'mobilizer', true, null),
         ($10, $11, $3, 'staff', 'finance', true, null),
         ($12, $11, $3, 'staff', 'development', true, null),
         ($13, $14, $3, 'staff', 'hr', false, null),
         ($15, $14, $3, 'staff', 'finance', true, null),
         ($16, $17, $3, 'staff', 'finance', true, now()),
         ($18, $19, $3, 'donor', null, true, null),
         ($20, $21, $3, 'missionary', null, true, null)`,
        [
          id.mStaffA,
          id.UStaffA,
          id.TA,
          id.mStaffB,
          id.UStaffB,
          id.TB,
          id.mMultiA,
          id.UMulti,
          id.mMultiB,
          lowerSubId,
          id.UTwoSubroles,
          higherSubId,
          id.mInactive,
          id.UInactiveLive,
          id.mLive,
          id.mRevoked,
          id.URevoked,
          id.mDonorA,
          id.UDonorA,
          id.mMissionaryA,
          id.UMissionaryA,
        ],
      );
      const variantsA = JSON.stringify({
        w320: {
          key: `${id.TA}/${sampleHashA}-w320`,
          width: 320,
          height: 240,
          byte_size: 8192,
          mime_type: "image/jpeg",
        },
      });
      const variantsB = JSON.stringify({
        w320: {
          key: `${id.TB}/${sampleHashB}-w320`,
          width: 320,
          height: 240,
          byte_size: 8192,
          mime_type: "image/jpeg",
        },
      });
      await db.query(
        `insert into public.media_assets (
         id, tenant_id, status, declared_byte_size, declared_mime_type,
         mime_type, content_hash, master_key, variants, byte_size, width, height,
         created_by, deleted_at, purge_after
       ) values
         ($1, $2, 'ready', 10000, 'image/jpeg', 'image/jpeg', $3, $4, $5::jsonb, 9500, 800, 600, $6, null, null),
         ($7, $8, 'ready', 10000, 'image/jpeg', 'image/jpeg', $9, $10, $11::jsonb, 9500, 800, 600, $12, null, null),
         ($13, $2, 'uploading', 10000, 'image/png', null, null, null, '{}'::jsonb, null, null, null, $6, null, null),
         ($14, $2, 'failed', 10000, 'image/png', null, null, null, '{}'::jsonb, null, null, null, $6, null, null),
         ($15, $2, 'deleted', 10000, 'image/jpeg', 'image/jpeg', $3, $4, $5::jsonb, 9500, 800, 600, $6, now() - interval '1 day', now() + interval '34 days')`,
        [
          id.assetReadyA,
          id.TA,
          sampleHashA,
          `${id.TA}/${sampleHashA}`,
          variantsA,
          id.UStaffA,
          id.assetReadyB,
          id.TB,
          sampleHashB,
          `${id.TB}/${sampleHashB}`,
          variantsB,
          id.UStaffB,
          id.assetUploadingA,
          id.assetFailedA,
          id.assetDeletedA,
        ],
      );
    }

    async function inTx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await seedFixture();
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    async function queryAs(
      role: string,
      caller: Caller,
      sql: string,
      params: unknown[] = [],
      options: { keepWrite?: boolean } = {},
    ): Promise<QueryOutcome> {
      await db.query("savepoint wp6_sp");
      let succeeded = false;
      try {
        await db.query(`set local role ${role}`);
        const claims = caller.sub
          ? JSON.stringify({ sub: caller.sub, role })
          : "";
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                set_config('request.jwt.claim.sub', '', true),
                set_config('request.headers', $2, true)`,
          [claims, caller.headers ? JSON.stringify(caller.headers) : ""],
        );
        const res = await db.query(sql, params);
        succeeded = true;
        return {
          rows: res.rows as Record<string, unknown>[],
          code: null,
          message: "",
        };
      } catch (error) {
        const err = error as { code?: string; message?: string };
        return {
          rows: [],
          code: err.code ?? "?",
          message: err.message ?? String(error),
        };
      } finally {
        if (succeeded && options.keepWrite) {
          await db.query("reset role");
          await db.query(
            `select set_config('request.jwt.claims', '', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '', true)`,
          );
          await db.query("release savepoint wp6_sp");
        } else {
          await db.query("rollback to savepoint wp6_sp");
        }
      }
    }

    it("creates public.media_assets with forced RLS, tenant RESTRICT FK, indexes, column-scoped grants, field_policies rows, and no purge-claim objects", async () => {
      const tableInfo = await db.query(
        `select c.relrowsecurity, c.relforcerowsecurity, c.relowner::regrole::text as owner
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'media_assets'`,
      );
      expect(tableInfo.rows).toEqual([
        {
          relrowsecurity: true,
          relforcerowsecurity: true,
          owner: "postgres",
        },
      ]);

      const removedPurgeObjects = await db.query(
        `select
         to_regclass('public.media_purge_claims') as claims_table,
         to_regprocedure('public.claim_media_content_purge(uuid,uuid,text,uuid,integer)') as claim_fn,
         to_regprocedure('public.release_media_content_purge(uuid,text,uuid)') as release_fn`,
      );
      expect(removedPurgeObjects.rows[0]).toEqual({
        claims_table: null,
        claim_fn: null,
        release_fn: null,
      });

      const fkInfo = await db.query(
        `select con.confdeltype
         from pg_constraint con
         join pg_class c on c.oid = con.conrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = 'media_assets'
          and con.contype = 'f'
          and con.confrelid = 'public.tenants'::regclass`,
      );
      expect(fkInfo.rows).toEqual([{ confdeltype: "r" }]);

      const indexDefs = await db.query(
        `select indexname, indexdef from pg_indexes where schemaname = 'public' and tablename = 'media_assets'`,
      );
      const defs = indexDefs.rows.map((r) => String(r.indexdef));
      const indexNames = indexDefs.rows.map((r) => String(r.indexname));
      expect(defs.some((d) => /UNIQUE INDEX.*\(tenant_id, id\)/.test(d))).toBe(
        true,
      );
      expect(
        defs.some((d) => /\(tenant_id, status, created_at DESC\)/.test(d)),
      ).toBe(true);
      expect(indexNames).not.toContain("media_assets_pending_purge_idx");
      expect(indexNames).not.toContain(
        "media_assets_pending_staging_sweep_idx",
      );
      expect(indexNames).not.toContain("media_assets_tenant_content_hash_idx");

      const grants = await db.query(
        `select
         has_table_privilege('authenticated', 'public.media_assets', 'SELECT') as auth_sel,
         has_table_privilege('authenticated', 'public.media_assets', 'INSERT') as auth_ins,
         has_table_privilege('authenticated', 'public.media_assets', 'UPDATE') as auth_upd,
         has_table_privilege('authenticated', 'public.media_assets', 'DELETE') as auth_del,
         has_table_privilege('anon', 'public.media_assets', 'SELECT') as anon_sel,
         has_table_privilege('anon', 'public.media_assets', 'INSERT') as anon_ins,
         has_table_privilege('tenant_guard', 'public.media_assets', 'SELECT') as guard_sel,
         has_table_privilege('tenant_guard', 'public.media_assets', 'DELETE') as guard_del,
         has_table_privilege('service_role', 'public.media_assets', 'SELECT') as svc_sel,
         has_table_privilege('service_role', 'public.media_assets', 'INSERT') as svc_ins,
         has_table_privilege('service_role', 'public.media_assets', 'UPDATE') as svc_upd,
         has_table_privilege('service_role', 'public.media_assets', 'DELETE') as svc_del`,
      );
      expect(grants.rows[0]).toEqual({
        auth_sel: true,
        auth_ins: false,
        auth_upd: false,
        auth_del: false,
        anon_sel: false,
        anon_ins: false,
        guard_sel: true,
        guard_del: false,
        svc_sel: true,
        svc_ins: false,
        svc_upd: false,
        svc_del: false,
      });

      const allowedServiceUpdateColumns = [
        "status",
        "mime_type",
        "content_hash",
        "master_key",
        "variants",
        "byte_size",
        "width",
        "height",
        "updated_at",
      ];
      const forbiddenServiceUpdateColumns = [
        "id",
        "tenant_id",
        "declared_byte_size",
        "declared_mime_type",
        "created_by",
        "created_at",
        "deleted_at",
        "purge_after",
      ];
      for (const column of allowedServiceUpdateColumns) {
        const colPriv = await db.query(
          `select has_column_privilege('service_role', 'public.media_assets', $1, 'UPDATE') as upd`,
          [column],
        );
        expect(colPriv.rows[0], `service_role UPDATE on ${column}`).toEqual({
          upd: true,
        });
      }
      for (const column of forbiddenServiceUpdateColumns) {
        const colPriv = await db.query(
          `select has_column_privilege('service_role', 'public.media_assets', $1, 'UPDATE') as upd`,
          [column],
        );
        expect(colPriv.rows[0], `service_role UPDATE on ${column}`).toEqual({
          upd: false,
        });
      }

      const forbiddenGuardColumns = [
        "content_hash",
        "master_key",
        "variants",
        "byte_size",
        "width",
        "height",
        "mime_type",
      ];
      for (const column of forbiddenGuardColumns) {
        const colPriv = await db.query(
          `select
           has_column_privilege('tenant_guard', 'public.media_assets', $1, 'INSERT') as ins,
           has_column_privilege('tenant_guard', 'public.media_assets', $1, 'UPDATE') as upd`,
          [column],
        );
        expect(colPriv.rows[0], `tenant_guard write on ${column}`).toEqual({
          ins: false,
          upd: false,
        });
      }

      const manifest = loadManifest();
      const mediaColumns = Object.keys(
        manifest.record_types.media_assets ?? {},
      );
      expect(mediaColumns).toHaveLength(17);
      expect(manifest.record_types.media_purge_claims).toBeUndefined();

      const policyRows = await db.query(
        `select field_key, surface, visible, editable, exportable, sensitivity_category
         from public.field_policies
        where record_type = 'media_assets' and tenant_id is null
        order by field_key, surface`,
      );
      expect(policyRows.rows).toHaveLength(mediaColumns.length * 5);

      const statusRows = policyRows.rows.filter(
        (r) => r.field_key === "status",
      );
      expect(statusRows).toHaveLength(5);
      for (const row of statusRows) {
        expect(row.sensitivity_category).toBe("care");
        expect(row.visible).toBe(row.surface === "mission_control");
        expect(row.editable).toBe(false);
        expect(row.exportable).toBe(false);
      }

      const claimPolicyRows = await db.query(
        `select field_key
         from public.field_policies
        where record_type = 'media_purge_claims' and tenant_id is null`,
      );
      expect(claimPolicyRows.rows).toHaveLength(0);

      await inTx(async () => {
        const allowConfirmUploading = await queryAs(
          "service_role",
          {},
          `update public.media_assets
              set updated_at = now()
            where id = $1 and tenant_id = $2 and status = 'uploading'`,
          [id.assetUploadingA, id.TA],
          { keepWrite: true },
        );
        expect(
          allowConfirmUploading.code,
          allowConfirmUploading.message,
        ).toBeNull();

        const hashC = "c".repeat(64);
        const allowDeclare = await queryAs(
          "service_role",
          {},
          `select public.declare_media_finalize($1, $2, $3, $4, $5::jsonb, 'image/png', 1024, 320, 240, now()) as res`,
          [
            id.TA,
            id.assetUploadingA,
            hashC,
            `${id.TA}/${hashC}`,
            JSON.stringify({
              w320: {
                key: `${id.TA}/${hashC}-w320`,
                width: 320,
                height: 240,
                byte_size: 1024,
                mime_type: "image/png",
              },
            }),
          ],
          { keepWrite: true },
        );
        expect(allowDeclare.code, allowDeclare.message).toBeNull();
        expect((allowDeclare.rows[0]!.res as { outcome: string }).outcome).toBe(
          "declared",
        );

        const allowPublish = await queryAs(
          "service_role",
          {},
          `select public.publish_media_finalize($1, $2, $3, now()) as res`,
          [id.TA, id.assetUploadingA, hashC],
          { keepWrite: true },
        );
        expect(allowPublish.code, allowPublish.message).toBeNull();
        expect((allowPublish.rows[0]!.res as { outcome: string }).outcome).toBe(
          "published",
        );

        const forbiddenStatements: Array<[string, string, unknown[]]> = [
          [
            "tenant_id",
            `update public.media_assets set tenant_id = $1 where id = $2`,
            [id.TB, id.assetReadyA],
          ],
          [
            "created_by",
            `update public.media_assets set created_by = $1 where id = $2`,
            [id.UStaffB, id.assetReadyA],
          ],
          [
            "purge_after",
            `update public.media_assets set purge_after = now() - interval '1 day' where id = $1`,
            [id.assetDeletedA],
          ],
          [
            "deleted_at",
            `update public.media_assets set deleted_at = now() where id = $1`,
            [id.assetReadyA],
          ],
          [
            "declared_byte_size",
            `update public.media_assets set declared_byte_size = 1 where id = $1`,
            [id.assetReadyA],
          ],
          [
            "declared_mime_type",
            `update public.media_assets set declared_mime_type = 'image/png' where id = $1`,
            [id.assetReadyA],
          ],
          [
            "id",
            `update public.media_assets set id = $1 where id = $2`,
            [randomUUID(), id.assetReadyA],
          ],
          [
            "created_at",
            `update public.media_assets set created_at = now() where id = $1`,
            [id.assetReadyA],
          ],
        ];
        for (const [col, sql, params] of forbiddenStatements) {
          const denied = await queryAs("service_role", {}, sql, params);
          expect(denied.code, `service_role UPDATE ${col}`).toBe("42501");
        }
      });
    });

    it("provisions private cms-media bucket with 15 MB limit, three MIME types, and zero storage.objects policies", async () => {
      const bucket = await db.query(
        `select id, name, public, file_size_limit, allowed_mime_types
         from storage.buckets
        where id = 'cms-media'`,
      );
      expect(bucket.rows).toHaveLength(1);
      expect(bucket.rows[0]).toMatchObject({
        id: "cms-media",
        name: "cms-media",
        public: false,
      });
      expect(Number(bucket.rows[0]!.file_size_limit)).toBe(MAX_MEDIA_BYTES);
      expect(
        [...(bucket.rows[0]!.allowed_mime_types as string[])].sort(),
      ).toEqual(["image/jpeg", "image/png", "image/webp"]);

      const migrationSql = readFileSync(
        path.resolve(
          __dirname,
          "../../../../supabase/migrations/20261123020000_media_custody.sql",
        ),
        "utf8",
      );
      const doBlockMatch = /DO \$\$[\s\S]*?END \$\$;/m.exec(migrationSql);
      expect(doBlockMatch).not.toBeNull();
      const postAssertBlock = doBlockMatch![0];

      const effectivePolicies = await db.query(
        `select policyname
         from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and (
            coalesce(qual, '') ilike '%cms-media%'
            or coalesce(with_check, '') ilike '%cms-media%'
            or (
              permissive = 'PERMISSIVE'
              and roles && array['public', 'anon', 'authenticated']::name[]
              and (
                (
                  cmd in ('SELECT', 'UPDATE', 'DELETE', 'ALL')
                  and (
                    qual is null
                    or qual !~* '^\\(*\\s*bucket_id\\s*=\\s*''[^'']+''(::text)?(\\s|\\)|$)'
                    or qual ~* '\\yOR\\y'
                  )
                )
                or (
                  cmd in ('INSERT', 'UPDATE', 'ALL')
                  and (
                    coalesce(with_check, qual) is null
                    or coalesce(with_check, qual) !~* '^\\(*\\s*bucket_id\\s*=\\s*''[^'']+''(::text)?(\\s|\\)|$)'
                    or coalesce(with_check, qual) ~* '\\yOR\\y'
                  )
                )
              )
            )
          )`,
      );
      expect(effectivePolicies.rows).toEqual([]);

      for (const [label, policySql] of [
        [
          "bucket-agnostic authenticated SELECT",
          `create policy wp6_test_bucket_agnostic on storage.objects for select to authenticated using (true)`,
        ],
        [
          "OR-bypass authenticated SELECT",
          `create policy wp6_test_or_bypass on storage.objects for select to authenticated using (bucket_id = 'profiles' or owner is not null)`,
        ],
      ] as const) {
        await db.query("begin");
        try {
          await db.query(policySql);
          let caught: unknown = null;
          try {
            await db.query(postAssertBlock);
          } catch (error) {
            caught = error;
          }
          expect(caught, label).not.toBeNull();
          expect(String((caught as Error).message), label).toMatch(
            /cms-media|storage\.objects/i,
          );
        } finally {
          await db.query("rollback");
        }
      }
    });

    it("enforces staff-only tenant-scoped SELECT and denies all signed-in or anonymous writes on public.media_assets", async () => {
      await inTx(async () => {
        const staffA = {
          sub: id.UStaffA,
          headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mStaffA },
        };
        const staffB = {
          sub: id.UStaffB,
          headers: { "x-asym-tenant": id.TB, "x-asym-assignment": id.mStaffB },
        };
        const donorA = {
          sub: id.UDonorA,
          headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mDonorA },
        };

        const readA = await queryAs(
          "authenticated",
          staffA,
          `select id from public.media_assets order by id`,
        );
        expect(readA.code, readA.message).toBeNull();
        expect(readA.rows.map((r) => r.id).sort()).toEqual(
          [
            id.assetReadyA,
            id.assetUploadingA,
            id.assetFailedA,
            id.assetDeletedA,
          ].sort(),
        );

        const readB = await queryAs(
          "authenticated",
          staffB,
          `select id from public.media_assets`,
        );
        expect(readB.code, readB.message).toBeNull();
        expect(readB.rows.map((r) => r.id)).toEqual([id.assetReadyB]);

        const readWithoutScope = await queryAs(
          "authenticated",
          { sub: id.UStaffA },
          `select id from public.media_assets`,
        );
        expect(readWithoutScope.code, readWithoutScope.message).toBeNull();
        expect(readWithoutScope.rows).toEqual([]);

        const readDonor = await queryAs(
          "authenticated",
          donorA,
          `select id from public.media_assets`,
        );
        expect(readDonor.code, readDonor.message).toBeNull();
        expect(readDonor.rows).toEqual([]);

        const forgedUpdate = await queryAs(
          "authenticated",
          staffA,
          `update public.media_assets set status = 'ready', master_key = 'forged' where id = $1`,
          [id.assetUploadingA],
        );
        expect(forgedUpdate.code).toBe("42501");

        const forgedInsert = await queryAs(
          "authenticated",
          staffA,
          `insert into public.media_assets (tenant_id, status, declared_byte_size, declared_mime_type)
         values ($1, 'uploading', 100, 'image/jpeg')`,
          [id.TA],
        );
        expect(forgedInsert.code).toBe("42501");

        const forgedDelete = await queryAs(
          "authenticated",
          staffA,
          `delete from public.media_assets where id = $1`,
          [id.assetReadyA],
        );
        expect(forgedDelete.code).toBe("42501");

        const anonRead = await queryAs(
          "anon",
          {},
          `select id from public.media_assets`,
        );
        expect(anonRead.code).toBe("42501");
      });
    });

    it("runs start_media_upload with strict validation, tenant isolation, status and capability checks", async () => {
      await inTx(async () => {
        const staffA = {
          sub: id.UStaffA,
          headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mStaffA },
        };

        const ok = await queryAs(
          "authenticated",
          staffA,
          `select public.start_media_upload($1, $2, $3) as res`,
          [id.TA, 1024, "image/webp"],
          { keepWrite: true },
        );
        expect(ok.code, ok.message).toBeNull();
        const payload = ok.rows[0]!.res as Record<string, unknown>;
        expect(payload.tenant_id).toBe(id.TA);
        expect(payload.status).toBe("uploading");
        expect(payload.declared_byte_size).toBe(1024);
        expect(payload.declared_mime_type).toBe("image/webp");
        expect(payload.staging_key).toBe(`tmp/${id.TA}/${payload.asset_id}`);

        const stored = await db.query(
          `select status, created_by, content_hash, master_key, variants, byte_size, width, height
           from public.media_assets
          where id = $1`,
          [payload.asset_id],
        );
        expect(stored.rows[0]).toEqual({
          status: "uploading",
          created_by: id.UStaffA,
          content_hash: null,
          master_key: null,
          variants: {},
          byte_size: null,
          width: null,
          height: null,
        });

        const countBefore = Number(
          (
            await db.query(
              `select count(*) as c from public.media_assets where tenant_id in ($1, $2)`,
              [id.TA, id.TB],
            )
          ).rows[0]!.c,
        );

        for (const [bytes, mime] of [
          [MAX_MEDIA_BYTES + 1, "image/jpeg"],
          [0, "image/jpeg"],
          [-5, "image/png"],
          [1024, "image/gif"],
          [1024, "image/svg+xml"],
        ] as const) {
          const bad = await queryAs(
            "authenticated",
            staffA,
            `select public.start_media_upload($1, $2, $3)`,
            [id.TA, bytes, mime],
          );
          expect(bad.code, `bytes=${bytes} mime=${mime}`).toBe("22023");
        }

        const crossTenant = await queryAs(
          "authenticated",
          staffA,
          `select public.start_media_upload($1, $2, $3)`,
          [id.TB, 1024, "image/jpeg"],
        );
        expect(crossTenant.code).toBe("42501");

        const donorAttempt = await queryAs(
          "authenticated",
          {
            sub: id.UDonorA,
            headers: {
              "x-asym-tenant": id.TA,
              "x-asym-assignment": id.mDonorA,
            },
          },
          `select public.start_media_upload($1, $2, $3)`,
          [id.TA, 1024, "image/jpeg"],
        );
        expect(donorAttempt.code).toBe("42501");

        const noSession = await queryAs(
          "authenticated",
          { sub: null },
          `select public.start_media_upload($1, $2, $3)`,
          [id.TA, 1024, "image/jpeg"],
        );
        expect(noSession.code).toBe("42501");

        const anonCall = await queryAs(
          "anon",
          {},
          `select public.start_media_upload($1, $2, $3)`,
          [id.TA, 1024, "image/jpeg"],
        );
        expect(anonCall.code).toBe("42501");

        const svcCall = await queryAs(
          "service_role",
          {},
          `select public.start_media_upload($1, $2, $3)`,
          [id.TA, 1024, "image/jpeg"],
        );
        expect(svcCall.code).toBe("42501");

        const countAfter = Number(
          (
            await db.query(
              `select count(*) as c from public.media_assets where tenant_id in ($1, $2)`,
              [id.TA, id.TB],
            )
          ).rows[0]!.c,
        );
        expect(countAfter).toBe(countBefore);

        for (const tenantStatus of ["suspended", "closed"] as const) {
          await db.query(
            `update public.tenants set status = $1 where id = $2`,
            [tenantStatus, id.TA],
          );
          const refused = await queryAs(
            "authenticated",
            staffA,
            `select public.start_media_upload($1, $2, $3)`,
            [id.TA, 1024, "image/jpeg"],
          );
          expect(refused.code, `tenant status ${tenantStatus}`).toBe("42501");
        }
      });
    });

    it("runs delete_media_asset with delayed purge tombstone, idempotency, uploading-stage deletion and tenant isolation", async () => {
      await inTx(async () => {
        const staffA = {
          sub: id.UStaffA,
          headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mStaffA },
        };

        const crossId = await queryAs(
          "authenticated",
          staffA,
          `select public.delete_media_asset($1, $2)`,
          [id.TA, id.assetReadyB],
        );
        expect(crossId.code).toBe("P0002");

        const crossTenant = await queryAs(
          "authenticated",
          staffA,
          `select public.delete_media_asset($1, $2)`,
          [id.TB, id.assetReadyB],
        );
        expect(crossTenant.code).toBe("42501");

        const stillReadyB = await db.query(
          `select status, deleted_at from public.media_assets where id = $1`,
          [id.assetReadyB],
        );
        expect(stillReadyB.rows[0]).toEqual({
          status: "ready",
          deleted_at: null,
        });

        const firstDelete = await queryAs(
          "authenticated",
          staffA,
          `select public.delete_media_asset($1, $2) as res`,
          [id.TA, id.assetReadyA],
          { keepWrite: true },
        );
        expect(firstDelete.code, firstDelete.message).toBeNull();
        const firstPayload = firstDelete.rows[0]!.res as Record<
          string,
          unknown
        >;
        expect(firstPayload.status).toBe("deleted");
        expect(firstPayload.already_deleted).toBe(false);
        expect("staging_queued" in firstPayload).toBe(false);

        const deletedRow = await db.query(
          `select status, deleted_at, purge_after,
                extract(epoch from (purge_after - deleted_at))::bigint as delay_seconds
           from public.media_assets
          where id = $1`,
          [id.assetReadyA],
        );
        expect(deletedRow.rows[0]!.status).toBe("deleted");
        expect(Number(deletedRow.rows[0]!.delay_seconds)).toBe(
          EXPECTED_PURGE_DELAY_SECONDS,
        );
        expect(Number(deletedRow.rows[0]!.delay_seconds)).toBeGreaterThan(
          MIN_PURGE_DELAY_SECONDS,
        );

        const secondDelete = await queryAs(
          "authenticated",
          staffA,
          `select public.delete_media_asset($1, $2) as res`,
          [id.TA, id.assetReadyA],
        );
        expect(secondDelete.code, secondDelete.message).toBeNull();
        const secondPayload = secondDelete.rows[0]!.res as Record<
          string,
          unknown
        >;
        expect(secondPayload.already_deleted).toBe(true);
        expect(secondPayload.deleted_at).toBe(firstPayload.deleted_at);
        expect(secondPayload.purge_after).toBe(firstPayload.purge_after);
        expect("staging_queued" in secondPayload).toBe(false);

        const uploadDelete = await queryAs(
          "authenticated",
          staffA,
          `select public.delete_media_asset($1, $2) as res`,
          [id.TA, id.assetUploadingA],
        );
        expect(uploadDelete.code, uploadDelete.message).toBeNull();
        const uploadPayload = uploadDelete.rows[0]!.res as Record<
          string,
          unknown
        >;
        expect(uploadPayload.status).toBe("deleted");
        expect(uploadPayload.already_deleted).toBe(false);
        expect("staging_queued" in uploadPayload).toBe(false);

        const donorDelete = await queryAs(
          "authenticated",
          {
            sub: id.UDonorA,
            headers: {
              "x-asym-tenant": id.TA,
              "x-asym-assignment": id.mDonorA,
            },
          },
          `select public.delete_media_asset($1, $2)`,
          [id.TA, id.assetReadyA],
        );
        expect(donorDelete.code).toBe("42501");

        for (const tenantStatus of ["suspended", "closed"] as const) {
          await db.query(
            `update public.tenants set status = $1 where id = $2`,
            [tenantStatus, id.TA],
          );
          const refusedDelete = await queryAs(
            "authenticated",
            staffA,
            `select public.delete_media_asset($1, $2)`,
            [id.TA, id.assetReadyA],
          );
          expect(refusedDelete.code, `delete tenant ${tenantStatus}`).toBe(
            "42501",
          );
        }
      });
    });

    it("answers another organization's asset exactly as an asset that exists nowhere (WP6 rest, pull request 2, round 2, G2)", async () => {
      await inTx(async () => {
        const staffA = {
          sub: id.UStaffA,
          headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mStaffA },
        };
        const refusal = async (assetId: string) => {
          const result = await queryAs(
            "authenticated",
            staffA,
            `select public.delete_media_asset($1, $2)`,
            [id.TA, assetId],
          );
          return { code: result.code, message: result.message };
        };
        const foreign = await refusal(id.assetReadyB);
        expect(foreign).toEqual(await refusal(randomUUID()));
        expect(foreign.code).toBe("P0002");
      });
    });

    it("re-checks tenant status, live assignment and capability under locks during concurrent revocation, capability loss and suspension (Finding 4)", async () => {
      const tMain = randomUUID();
      const tSusp = randomUUID();
      const tStartSusp = randomUUID();
      const uRevoke = randomUUID();
      const uCap = randomUUID();
      const uSusp = randomUUID();
      const uStartSusp = randomUUID();
      const mRevoke = randomUUID();
      const mCap = randomUUID();
      const mSusp = randomUUID();
      const mStartSusp = randomUUID();
      const aRevoke = randomUUID();
      const aCap = randomUUID();
      const aSusp = randomUUID();
      const lockHash = "e".repeat(64);
      const lockVariants = JSON.stringify({
        w320: {
          key: `${tMain}/${lockHash}-w320`,
          width: 320,
          height: 240,
          byte_size: 2048,
          mime_type: "image/jpeg",
        },
      });

      const blocker = new pg.Client({ connectionString: ADMIN_URL });
      const caller = new pg.Client({ connectionString: ADMIN_URL });
      await blocker.connect();
      await caller.connect();

      try {
        const callerPid = Number(
          (await caller.query(`select pg_backend_pid() as pid`)).rows[0]!.pid,
        );

        await db.query("begin");
        try {
          await db.query(
            `insert into public.tenants (id, name, slug, status)
             values ($1::uuid, 'WP6 Lock Main', 'wp6-lm-' || $1::uuid::text, 'active'),
                    ($2::uuid, 'WP6 Lock Susp', 'wp6-ls-' || $2::uuid::text, 'active'),
                    ($3::uuid, 'WP6 Lock Start', 'wp6-lst-' || $3::uuid::text, 'active')`,
            [tMain, tSusp, tStartSusp],
          );
          await db.query(
            `insert into auth.users (id) select unnest($1::uuid[])`,
            [[uRevoke, uCap, uSusp, uStartSusp]],
          );
          await db.query(
            `delete from authz.memberships where user_id = any($1::uuid[])`,
            [[uRevoke, uCap, uSusp, uStartSusp]],
          );
          await db.query(
            `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, revoked_at)
             values
               ($1, $2, $3, 'staff', 'finance', true, null),
               ($4, $5, $3, 'staff', 'finance', true, null),
               ($6, $7, $8, 'staff', 'finance', true, null),
               ($9, $10, $11, 'staff', 'finance', true, null)`,
            [
              mRevoke,
              uRevoke,
              tMain,
              mCap,
              uCap,
              mSusp,
              uSusp,
              tSusp,
              mStartSusp,
              uStartSusp,
              tStartSusp,
            ],
          );
          await db.query(
            `insert into public.media_assets (
               id, tenant_id, status, declared_byte_size, declared_mime_type,
               mime_type, content_hash, master_key, variants, byte_size, width, height, created_by
             ) values
               ($1, $2, 'ready', 4096, 'image/jpeg', 'image/jpeg', $3, $4, $5::jsonb, 4096, 320, 240, $6),
               ($7, $2, 'ready', 4096, 'image/jpeg', 'image/jpeg', $3, $4, $5::jsonb, 4096, 320, 240, $8),
               ($9, $10, 'ready', 4096, 'image/jpeg', 'image/jpeg', $3, $11, $5::jsonb, 4096, 320, 240, $12)`,
            [
              aRevoke,
              tMain,
              lockHash,
              `${tMain}/${lockHash}`,
              lockVariants,
              uRevoke,
              aCap,
              uCap,
              aSusp,
              tSusp,
              `${tSusp}/${lockHash}`,
              uSusp,
            ],
          );
          await db.query("commit");
        } catch (error) {
          await db.query("rollback");
          throw error;
        }

        const runRacedCommand = async (params: {
          label: string;
          blockerSql: string;
          blockerArgs: unknown[];
          userId: string;
          tenantId: string;
          membershipId: string;
          commandSql: string;
          commandArgs: unknown[];
        }) => {
          await blocker.query("begin");
          let blockerOpen = true;
          try {
            await blocker.query(params.blockerSql, params.blockerArgs);

            await caller.query("begin");
            await caller.query("set local role authenticated");
            await caller.query(
              `select set_config('request.jwt.claims', $1, true),
                      set_config('request.jwt.claim.sub', '', true),
                      set_config('request.headers', $2, true)`,
              [
                JSON.stringify({ sub: params.userId, role: "authenticated" }),
                JSON.stringify({
                  "x-asym-tenant": params.tenantId,
                  "x-asym-assignment": params.membershipId,
                }),
              ],
            );

            let settled = false;
            const commandPromise = caller
              .query(params.commandSql, params.commandArgs)
              .then(
                () => {
                  settled = true;
                  return { code: null as string | null, message: "" };
                },
                (err: { code?: string; message?: string }) => {
                  settled = true;
                  return {
                    code: err.code ?? "?",
                    message: err.message ?? String(err),
                  };
                },
              );

            let waitedOnLock = false;
            const deadline = Date.now() + 1500;
            while (!settled && Date.now() < deadline) {
              const waitRes = await db.query(
                `select wait_event_type from pg_stat_activity where pid = $1`,
                [callerPid],
              );
              if (waitRes.rows[0]?.wait_event_type === "Lock") {
                waitedOnLock = true;
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }

            await blocker.query("commit");
            blockerOpen = false;

            const outcome = await commandPromise;
            if (outcome.code === null) {
              await caller.query("commit");
            } else {
              await caller.query("rollback");
            }
            return { waitedOnLock, ...outcome };
          } finally {
            if (blockerOpen) {
              await blocker.query("rollback").catch(() => undefined);
            }
          }
        };

        const revokeRace = await runRacedCommand({
          label: "concurrent revocation",
          blockerSql: `update authz.memberships set is_active = false, revoked_at = now() where id = $1`,
          blockerArgs: [mRevoke],
          userId: uRevoke,
          tenantId: tMain,
          membershipId: mRevoke,
          commandSql: `select public.delete_media_asset($1, $2)`,
          commandArgs: [tMain, aRevoke],
        });
        expect(revokeRace.waitedOnLock, "revoke waited on lock").toBe(true);
        expect(revokeRace.code, revokeRace.message).toBe("42501");
        const revokeRow = await db.query(
          `select status, deleted_at from public.media_assets where id = $1`,
          [aRevoke],
        );
        expect(revokeRow.rows[0]).toEqual({
          status: "ready",
          deleted_at: null,
        });

        const capLossRace = await runRacedCommand({
          label: "concurrent capability loss",
          blockerSql: `update authz.memberships set role = 'donor', staff_role = null where id = $1`,
          blockerArgs: [mCap],
          userId: uCap,
          tenantId: tMain,
          membershipId: mCap,
          commandSql: `select public.delete_media_asset($1, $2)`,
          commandArgs: [tMain, aCap],
        });
        expect(capLossRace.waitedOnLock, "capability loss waited on lock").toBe(
          true,
        );
        expect(capLossRace.code, capLossRace.message).toBe("42501");
        const capRow = await db.query(
          `select status, deleted_at from public.media_assets where id = $1`,
          [aCap],
        );
        expect(capRow.rows[0]).toEqual({ status: "ready", deleted_at: null });

        const suspendDeleteRace = await runRacedCommand({
          label: "concurrent tenant suspension during delete",
          blockerSql: `update public.tenants set status = 'suspended' where id = $1`,
          blockerArgs: [tSusp],
          userId: uSusp,
          tenantId: tSusp,
          membershipId: mSusp,
          commandSql: `select public.delete_media_asset($1, $2)`,
          commandArgs: [tSusp, aSusp],
        });
        expect(
          suspendDeleteRace.waitedOnLock,
          "suspend delete waited on lock",
        ).toBe(true);
        expect(suspendDeleteRace.code, suspendDeleteRace.message).toBe("42501");
        const suspRow = await db.query(
          `select status, deleted_at from public.media_assets where id = $1`,
          [aSusp],
        );
        expect(suspRow.rows[0]).toEqual({ status: "ready", deleted_at: null });

        const suspendStartRace = await runRacedCommand({
          label: "concurrent tenant suspension during start",
          blockerSql: `update public.tenants set status = 'suspended' where id = $1`,
          blockerArgs: [tStartSusp],
          userId: uStartSusp,
          tenantId: tStartSusp,
          membershipId: mStartSusp,
          commandSql: `select public.start_media_upload($1, $2, $3)`,
          commandArgs: [tStartSusp, 1024, "image/jpeg"],
        });
        expect(
          suspendStartRace.waitedOnLock,
          "suspend start waited on lock",
        ).toBe(true);
        expect(suspendStartRace.code, suspendStartRace.message).toBe("42501");
        const startCount = await db.query(
          `select count(*)::int as c from public.media_assets where tenant_id = $1`,
          [tStartSusp],
        );
        expect(startCount.rows[0]!.c).toBe(0);
      } finally {
        await caller.end().catch(() => undefined);
        await blocker.end().catch(() => undefined);
        await db.query(
          `delete from public.media_assets where tenant_id = any($1::uuid[])`,
          [[tMain, tSusp, tStartSusp]],
        );
        await db.query(
          `delete from authz.memberships where user_id = any($1::uuid[])`,
          [[uRevoke, uCap, uSusp, uStartSusp]],
        );
        await db.query(`delete from auth.users where id = any($1::uuid[])`, [
          [uRevoke, uCap, uSusp, uStartSusp],
        ]);
        await db.query(
          `delete from public.tenants where id = any($1::uuid[])`,
          [[tMain, tSusp, tStartSusp]],
        );
      }
    });

    it("resolves staff media access in one silent SQL statement without headers or cookies", async () => {
      await inTx(async () => {
        const multiA = await queryAs(
          "authenticated",
          { sub: id.UMulti },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(multiA.code, multiA.message).toBeNull();
        expect(multiA.rows).toEqual([
          { tenant_id: id.TA, assignment_id: id.mMultiA },
        ]);

        const multiB = await queryAs(
          "authenticated",
          { sub: id.UMulti },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyB],
        );
        expect(multiB.code, multiB.message).toBeNull();
        expect(multiB.rows).toEqual([
          { tenant_id: id.TB, assignment_id: id.mMultiB },
        ]);

        const twoSubroles = await queryAs(
          "authenticated",
          { sub: id.UTwoSubroles },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(twoSubroles.code, twoSubroles.message).toBeNull();
        expect(twoSubroles.rows).toEqual([
          { tenant_id: id.TA, assignment_id: lowerSubId },
        ]);

        const inactivePlusLive = await queryAs(
          "authenticated",
          { sub: id.UInactiveLive },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(inactivePlusLive.code, inactivePlusLive.message).toBeNull();
        expect(inactivePlusLive.rows).toEqual([
          { tenant_id: id.TA, assignment_id: id.mLive },
        ]);

        const foreignStaff = await queryAs(
          "authenticated",
          { sub: id.UStaffB },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(foreignStaff.code).toBeNull();
        expect(foreignStaff.rows).toEqual([]);

        const unknownAsset = await queryAs(
          "authenticated",
          { sub: id.UStaffA },
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [randomUUID()],
        );
        expect(unknownAsset.code).toBeNull();
        expect(unknownAsset.rows).toEqual([]);

        const nullAsset = await queryAs(
          "authenticated",
          { sub: id.UStaffA },
          `select tenant_id, assignment_id from public.resolve_staff_media_access(null::uuid)`,
        );
        expect(nullAsset.code).toBeNull();
        expect(nullAsset.rows).toEqual([]);

        for (const nonReadyId of [
          id.assetUploadingA,
          id.assetFailedA,
          id.assetDeletedA,
        ]) {
          const res = await queryAs(
            "authenticated",
            { sub: id.UStaffA },
            `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
            [nonReadyId],
          );
          expect(res.code).toBeNull();
          expect(res.rows).toEqual([]);
        }

        for (const callerSub of [
          id.URevoked,
          id.UDonorA,
          id.UMissionaryA,
          null,
        ]) {
          const res = await queryAs(
            "authenticated",
            { sub: callerSub },
            `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
            [id.assetReadyA],
          );
          expect(res.code).toBeNull();
          expect(res.rows).toEqual([]);
        }

        for (const tenantStatus of ["suspended", "closed"] as const) {
          await db.query(
            `update public.tenants set status = $1 where id = $2`,
            [tenantStatus, id.TA],
          );
          const res = await queryAs(
            "authenticated",
            { sub: id.UStaffA },
            `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
            [id.assetReadyA],
          );
          expect(res.code).toBeNull();
          expect(res.rows).toEqual([]);
        }
        await db.query(
          `update public.tenants set status = 'active' where id = $1`,
          [id.TA],
        );

        const fnDef = await db.query(
          `select pg_get_functiondef('public.resolve_staff_media_access(uuid)'::regprocedure) as def`,
        );
        expect(String(fnDef.rows[0]!.def)).toMatch(
          /'web_studio\.edit'\s*=\s*ANY\s*\(\s*authz\.assignment_capabilities\(m\.id\)\s*\)/i,
        );

        const anonExec = await queryAs(
          "anon",
          {},
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(anonExec.code).toBe("42501");

        const svcExec = await queryAs(
          "service_role",
          {},
          `select tenant_id, assignment_id from public.resolve_staff_media_access($1)`,
          [id.assetReadyA],
        );
        expect(svcExec.code).toBe("42501");
      });
    });

    it("exposes no authenticated-executable function that sets finished-upload fields on public.media_assets", async () => {
      const fns = await db.query(
        `select n.nspname || '.' || p.proname as fn_name, p.prosrc
         from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
        where has_function_privilege('authenticated', p.oid, 'EXECUTE')
          and p.prosrc ilike '%media_assets%'`,
      );
      const writers = fns.rows.filter((row) => {
        const src = String(row.prosrc);
        const mutatesTable =
          /\b(insert\s+into|update)\s+public\.media_assets\b/i.test(src);
        if (!mutatesTable) return false;
        return (
          /\b(content_hash|master_key|variants|byte_size|width|height)\b/i.test(
            src,
          ) || /\bset\b[\s\S]*?\bstatus\s*=\s*'ready'/i.test(src)
        );
      });
      expect(fns.rows.map((r) => String(r.fn_name)).sort()).toEqual([
        "public.resolve_staff_media_access",
        "tenant_guard.delete_media_asset",
        "tenant_guard.start_media_upload",
      ]);
      expect(writers).toEqual([]);
    });
  },
);
