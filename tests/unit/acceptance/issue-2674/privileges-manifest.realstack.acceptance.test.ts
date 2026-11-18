/**
 * AL-2674 (WP1, slice 1.1b) real-stack acceptance. Plan section 12, WP1:
 *   - "None of the 21 demo policies or default grants remains, and none of the
 *     retired backup_* and crm_* tables exists after the rebuild": proved on
 *     two throwaway replays of the whole chain, a plain one and one with the
 *     default privileges hosted Supabase gives `postgres` in `public`, which
 *     must end with identical anon and authenticated privileges;
 *   - D06: the three public buckets keep public object URLs, have size and type
 *     limits, and `email-assets` can no longer be listed anonymously;
 *   - D09: retired tables are gone, kept CRM tables stay, and signed-in users
 *     cannot write `crm_record_links`;
 *   - "A column with no manifest row fails CI, and a classified column can be
 *     dropped by removing its row": the field-policy gate run against a copy
 *     of the replay whose schema is changed.
 * Reads the superuser URL TENANT_GUARD_IT_ADMIN_DATABASE_URL, like the other
 * real-stack suites; without it the block skips, except in the CI `migrate`
 * job, where it fails. Never changes the database the URL names.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULTS_MIGRATION, postAssert } from "./harness";
import * as H from "./privileges-harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const BUILD_TIMEOUT = 900_000;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2674 privileges, buckets, retired tables and the field-policy manifest (real stack)",
  () => {
    let plain: H.Replay;
    let hosted: H.Replay;
    const replays = () => ({ plain, hosted });
    type Kind = "plain" | "hosted";
    const KINDS: Kind[] = ["plain", "hosted"];

    beforeAll(async () => {
      plain = new H.Replay(ADMIN_URL, false);
      hosted = new H.Replay(ADMIN_URL, true);
      // One after the other: the bootstrap and some migrations create
      // cluster-wide roles, which two concurrent replays would race on.
      await plain.build();
      await hosted.build();
    }, BUILD_TIMEOUT);
    afterAll(async () => {
      await Promise.allSettled([plain?.close(), hosted?.close()]);
    }, 120_000);

    describe("D01 and D04: demo policies and default grants", () => {
      it.each(KINDS)(
        "%s replay: none of the 21 demo policies remains",
        async (kind) => {
          const r = replays()[kind];
          expect(
            await r.rows(
              "select tablename from pg_policies where schemaname = 'public' and policyname = 'public read'",
            ),
          ).toEqual([]);
          expect(
            await r.rows(
              `select tablename, policyname from pg_policies where schemaname = 'public'
           and tablename = any($1) and qual = 'true'
           and (roles @> array['anon']::name[] or roles @> array['public']::name[])`,
              [H.DEMO_TABLES],
            ),
          ).toEqual([]);
        },
      );

      it.each(KINDS)(
        "%s replay: postgres's default privileges in public grant nothing to anon or authenticated",
        async (kind) => {
          const r = replays()[kind];
          expect(
            await r.rows(`select d.defaclobjtype as kind, a.grantee::regrole::text as role, a.privilege_type as p
          from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a
          where d.defaclrole = 'postgres'::regrole and d.defaclnamespace = 'public'::regnamespace
            and a.grantee in ('anon'::regrole, 'authenticated'::regrole)`),
          ).toEqual([]);
        },
      );

      // Council round 1, D1: a global default (no schema) applies in public too.
      it("the migration's post-assert refuses a global default of postgres that grants to anon or authenticated", async () => {
        const ASSERT = postAssert(
          DEFAULTS_MIGRATION,
          "default privileges and table grants",
        );
        const db = await plain.db();
        await db.query("begin");
        try {
          await db.query(ASSERT);
          for (const role of ["anon", "authenticated"]) {
            await db.query("savepoint s");
            await db.query(
              `alter default privileges for role postgres grant select on tables to ${role}`,
            );
            await expect(db.query(ASSERT), role).rejects.toMatchObject({
              message: expect.stringContaining(
                `global default privileges of postgres still grant: r ${role}`,
              ),
            });
            await db.query("rollback to savepoint s");
          }
        } finally {
          await db.query("rollback");
        }
      });

      it("hosted replay: a table, sequence and function created after the chain carry no anon or authenticated grant", async () => {
        const db = await hosted.db();
        await db.query("begin");
        try {
          await db.query(`create table public.acc2674_probe (id int);
          create sequence public.acc2674_probe_seq;
          create function public.acc2674_probe_fn() returns int language sql as 'select 1';`);
          const { rows } =
            await db.query(`select coalesce(c.relacl::text, '') as acl from pg_class c
          where c.oid in ('public.acc2674_probe'::regclass, 'public.acc2674_probe_seq'::regclass)
          union all select coalesce(p.proacl::text, '') from pg_proc p
          where p.oid = 'public.acc2674_probe_fn()'::regprocedure`);
          for (const { acl } of rows) {
            expect(acl).not.toMatch(/\banon=/);
            expect(acl).not.toMatch(/\bauthenticated=/);
          }
        } finally {
          await db.query("rollback");
        }
      });

      it.each(KINDS)(
        "%s replay: no relation grants TRUNCATE, REFERENCES, TRIGGER or MAINTAIN to PUBLIC, anon or authenticated",
        async (kind) => {
          const r = replays()[kind];
          expect(
            H.list(
              await r.rows(`select n.nspname || '.' || c.relname || ' ' || a.grantee::text || ' ' || a.privilege_type as g
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            cross join lateral aclexplode(c.relacl) a
            where n.nspname in ('public', 'authz', 'private', 'tenant_guard', 'document_cutover')
              and a.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
              and a.privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')`),
            ),
          ).toEqual([]);
        },
      );

      it.each(KINDS)(
        "%s replay: every anon and authenticated table grant in public is admitted by a policy",
        async (kind) => {
          expect(
            H.list(await replays()[kind].rows(H.POLICYLESS_GRANTS_SQL)),
          ).toEqual([]);
        },
      );

      it.each(KINDS)(
        "%s replay: the demo grants are gone; anon reads only the reviewed public tables, and nothing else",
        async (kind) => {
          const grants = H.list(await replays()[kind].rows(H.TABLE_GRANTS_SQL));
          const anon = grants.filter((g) => g.split(" ")[1] === "anon");
          for (const table of H.DEMO_GRANT_RESIDUE)
            expect(anon.filter((g) => g.startsWith(`${table} `))).toEqual([]);
          for (const g of anon) {
            const [table, , privilege] = g.split(" ");
            expect(privilege, g).toBe("SELECT");
            expect(H.KEPT_ANON_READS, g).toContain(table);
          }
        },
      );

      it("a hosted-default replay ends with exactly the plain replay's anon and authenticated privileges", async () => {
        for (const sql of [
          H.TABLE_GRANTS_SQL,
          H.COLUMN_GRANTS_SQL,
          H.FUNCTION_EXECUTE_SQL,
        ])
          expect(H.list(await hosted.rows(sql))).toEqual(
            H.list(await plain.rows(sql)),
          );
      });

      it.each(KINDS)(
        "%s replay: the reads the apps rely on still work",
        async (kind) => {
          const r = replays()[kind];
          for (const sql of [
            "select count(*) from public.currency_metadata",
            "select count(*) from public.posts",
            "select count(*) from public.post_comments",
            "select count(*) from public.locations",
          ])
            expect((await r.as("anon", sql)).code, `anon: ${sql}`).toBeNull();
          for (const sql of [
            "select count(*) from public.profiles",
            "select count(*) from public.donors",
            "select count(*) from public.donations",
            "select count(*) from public.crm_record_links",
            "select count(*) from public.crm_command_logs",
            "select count(*) from public.crm_merge_candidates",
            "select id, profile_id from public.missionaries",
            "select count(*) from public.field_policies",
          ])
            expect(
              (await r.as("authenticated", sql)).code,
              `authenticated: ${sql}`,
            ).toBeNull();
          // The demo residue: anonymous reads of these tables were empty under RLS
          // and are now refused outright.
          for (const table of H.DEMO_GRANT_RESIDUE)
            expect(
              (await r.as("anon", `select count(*) from public.${table}`)).code,
              table,
            ).toBe("42501");
        },
      );
    });

    describe("D06: public buckets", () => {
      it.each(KINDS)(
        "%s replay: all three public buckets stay public, with 5 MB image limits",
        async (kind) => {
          const rows = await replays()[kind].rows(
            `select id, public, file_size_limit::text as size, allowed_mime_types::text[] as types
         from storage.buckets order by id`,
          );
          const by = Object.fromEntries(rows.map((b) => [b.id, b]));
          for (const id of ["document-uploads", "email-assets", "profiles"]) {
            expect(by[id], id).toMatchObject({
              public: true,
              size: H.IMAGE_LIMIT,
            });
            expect([...((by[id]!.types as string[]) ?? [])].sort(), id).toEqual(
              H.IMAGE_TYPES,
            );
          }
          expect(by["eve-replay-artifacts"]).toMatchObject({ public: false });
        },
      );

      it.each(KINDS)(
        "%s replay: no storage policy reads email-assets; profiles and document-uploads keep owner-only reads",
        async (kind) => {
          const rows = await replays()[kind].rows(
            `select policyname, cmd, roles::text[] as roles, coalesce(qual, '') || coalesce(with_check, '') as rule
         from pg_policies where schemaname = 'storage' and tablename = 'objects' order by policyname`,
          );
          expect(
            rows.filter((p) => String(p.rule).includes("email-assets")),
          ).toEqual([]);
          expect(rows.map((p) => p.policyname)).not.toContain(
            "Public read email-assets",
          );
          expect(
            rows
              .filter((p) => p.cmd === "SELECT")
              .map((p) => [p.policyname, p.roles]),
          ).toEqual([
            ["editor images owner select", ["authenticated"]],
            ["profiles owner select", ["authenticated"]],
          ]);
        },
      );
    });

    // Council round 1, F3: the #2407 suite stops at its own migration, so the
    // owner-folder write policies of these two buckets are asserted here, at
    // the head of the chain. Council round 2, B7: each expression is compared
    // whole (whitespace collapsed, as Postgres indents its deparse), so an
    // added `OR true` or a dropped condition fails.
    describe("D06: owner-folder writes on document-uploads and profiles", () => {
      const FOLDER_IS_CALLER =
        "((string_to_array(name, '/'::text))[3] = (( SELECT auth.uid() AS uid))::text)";
      const PATH_SEGMENT = (bucket: string) =>
        bucket === "profiles"
          ? "((string_to_array(name, '/'::text))[1] = ANY (ARRAY['avatars'::text, 'covers'::text]))"
          : "((string_to_array(name, '/'::text))[1] = 'editor'::text)";
      const FOLDER_IS_CALLERS_TENANT =
        "((string_to_array(name, '/'::text))[2] IN ( SELECT COALESCE((p.tenant_id)::text, " +
        "CASE WHEN (p.role = 'super_admin'::text) THEN '00000000-0000-0000-0000-000000000001'::text " +
        'ELSE NULL::text END) AS "coalesce" FROM profiles p ' +
        "WHERE (p.user_id = ( SELECT auth.uid() AS uid))))";
      const FILE_IS_NAMED =
        "((string_to_array(name, '/'::text))[4] <> ''::text)";
      const collapse = (sql: unknown) => String(sql).replace(/\s+/g, " ");

      it.each(KINDS)(
        "%s replay: signed-in users write only their own folder and delete only their own objects",
        async (kind) => {
          const rows = await replays()[kind].rows(
            `select policyname, cmd, roles::text[] as roles, coalesce(qual, '') as qual, coalesce(with_check, '') as checks
         from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd <> 'SELECT'
         order by policyname`,
          );
          expect(rows.map((p) => [p.policyname, p.cmd, p.roles])).toEqual([
            ["Owner delete document-uploads", "DELETE", ["authenticated"]],
            ["Owner delete profiles", "DELETE", ["authenticated"]],
            ["editor images owner folder insert", "INSERT", ["authenticated"]],
            ["editor images owner folder update", "UPDATE", ["authenticated"]],
            ["profiles owner folder insert", "INSERT", ["authenticated"]],
            ["profiles owner folder update", "UPDATE", ["authenticated"]],
          ]);
          const by = Object.fromEntries(rows.map((p) => [p.policyname, p]));
          for (const [bucket, prefix] of [
            ["document-uploads", "editor images owner folder"],
            ["profiles", "profiles owner folder"],
          ] as const) {
            const bucketIs = `(bucket_id = '${bucket}'::text)`;
            const ownerIs = "(owner = ( SELECT auth.uid() AS uid))";
            const insert = by[`${prefix} insert`]!;
            const update = by[`${prefix} update`]!;
            const remove = by[`Owner delete ${bucket}`]!;
            const inCallersFolder = [
              PATH_SEGMENT(bucket),
              FOLDER_IS_CALLERS_TENANT,
              FOLDER_IS_CALLER,
              FILE_IS_NAMED,
            ];
            expect(collapse(insert.checks), `${bucket} insert`).toBe(
              `(${[bucketIs, ...inCallersFolder].join(" AND ")})`,
            );
            expect(insert.qual).toBe("");
            expect(update.qual).toBe(`(${bucketIs} AND ${ownerIs})`);
            expect(collapse(update.checks), `${bucket} update`).toBe(
              `(${[bucketIs, ownerIs, ...inCallersFolder].join(" AND ")})`,
            );
            expect(remove.qual).toBe(`(${bucketIs} AND (auth.uid() = owner))`);
          }
        },
      );
    });

    describe("D09: retired tables", () => {
      it.each(KINDS)(
        "%s replay: no backup_* or retired Twenty-era crm_* table exists; the kept CRM tables do",
        async (kind) => {
          const r = replays()[kind];
          const present = H.list(
            await r.rows(
              `select c.relname as g from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relname = any($1) order by 1`,
              [[...H.BACKUP_TABLES, ...H.TWENTY_TABLES, ...H.KEPT_CRM_TABLES]],
            ),
          );
          expect(present).toEqual([...H.KEPT_CRM_TABLES].sort());
          expect(
            await r.rows(
              "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname like 'backup\\_%'",
            ),
          ).toEqual([]);
        },
      );

      it.each(KINDS)(
        "%s replay: crm_record_links is readable and not writable by signed-in users; the service role keeps its writes",
        async (kind) => {
          const rows = await replays()[kind].rows(
            `select r as role, p as privilege from unnest(array['anon', 'authenticated', 'service_role']) r,
         unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) p
         where has_table_privilege(r, 'public.crm_record_links', p) order by 1, 2`,
          );
          const held = rows.map((x) => `${x.role} ${x.privilege}`);
          expect(held.filter((g) => !g.startsWith("service_role "))).toEqual([
            "authenticated SELECT",
          ]);
          // The platform lane is unchanged (hosted defaults may add DELETE there).
          expect(held).toEqual(
            expect.arrayContaining([
              "service_role INSERT",
              "service_role SELECT",
              "service_role UPDATE",
            ]),
          );
        },
      );
    });

    describe("the field-policy manifest gate", () => {
      let copy: H.Replay;
      const temps: string[] = [];
      beforeAll(async () => {
        copy = await plain.clone();
      }, BUILD_TIMEOUT);
      afterAll(async () => {
        temps.forEach((d) => rmSync(d, { recursive: true, force: true }));
        await copy?.close();
      });

      /** The gate from a copy of the repository files it reads, with an edited manifest. */
      type ManifestFile = {
        record_types: Record<string, Record<string, unknown>>;
      };
      function gate(editManifest?: (m: ManifestFile) => void) {
        let root = H.ROOT;
        if (editManifest) {
          root = mkdtempSync(path.join(os.tmpdir(), "acc-2674-gate-"));
          temps.push(root);
          // scripts/lib holds the psql runner the gate imports (AL-2674 E3).
          // PR #2714 review (record D-18): that runner now imports the one
          // local-database decision from the routing rule it shares with the
          // admin app, so the copy carries that file too; nothing else in
          // what the gate reads changes.
          for (const rel of [
            "scripts/verify",
            "scripts/lib",
            "packages/env/src/database-url.mjs",
            H.FP,
            H.MIG,
          ])
            cpSync(path.join(H.ROOT, rel), path.join(root, rel), {
              recursive: true,
            });
          const file = path.join(root, H.MANIFEST);
          const manifest = JSON.parse(readFileSync(file, "utf8"));
          editManifest(manifest);
          writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
        }
        return spawnSync(process.execPath, [path.join(root, H.GATE)], {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env, DATABASE_URL: copy.url },
        });
      }
      const sql = async (text: string) => (await copy.db()).query(text);

      it("passes on the migrated chain", () => {
        const r = gate();
        expect(r.status, r.stderr).toBe(0);
        expect(r.stdout).toContain(
          `PASS: all ${H.manifestTotals().rows} public.field_policies rows equal the manifest`,
        );
      });

      it("a column with no manifest row fails, and passes once classified with its rows", async () => {
        await sql("alter table public.donors add column acc2674_probe text");
        try {
          const unclassified = gate();
          expect(unclassified.status).not.toBe(0);
          expect(unclassified.stderr).toContain(
            "UNCLASSIFIED donors.acc2674_probe (text)",
          );

          await sql(`insert into public.field_policies
          (record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category)
          select 'donors', 'acc2674_probe', s, null, s = 'mission_control', false, false, 'internal'
          from unnest(array['mission_control', 'donor', 'missionary', 'public', 'export']) s`);
          const rowsOnly = gate();
          expect(rowsOnly.status, "rows without a manifest entry").not.toBe(0);
          expect(rowsOnly.stderr).toContain(
            "ROW_UNEXPECTED donors|acc2674_probe|mission_control|",
          );

          const classified = gate((m) => {
            m.record_types.donors!.acc2674_probe = {
              type: "text",
              nullable: true,
              category: "internal",
              mission_control: "v--",
              donor: "---",
              missionary: "---",
              public: "---",
              export: "---",
            };
          });
          expect(classified.status, classified.stderr).toBe(0);
        } finally {
          await sql(`delete from public.field_policies where field_key = 'acc2674_probe';
          alter table public.donors drop column acc2674_probe`);
        }
      });

      it("a classified column can be dropped by removing its manifest row and its rows", async () => {
        // Any classified column will do. Council round 1 (F1): the case picks
        // a donors column nothing depends on, so a package that drops the one
        // it used to name (website) touches no test.
        const manifest = JSON.parse(
          readFileSync(path.join(H.ROOT, H.MANIFEST), "utf8"),
        ) as {
          processor_identifiers: string[];
          record_types: Record<string, Record<string, unknown>>;
        };
        const [{ name: column }] = (await copy.rows(
          `select a.attname as name from pg_attribute a
            where a.attrelid = 'public.donors'::regclass and a.attnum > 0 and not a.attisdropped
              and a.attname = any($1)
              and not exists (select 1 from pg_depend d where d.refobjid = a.attrelid and d.refobjsubid = a.attnum)
            order by a.attnum desc limit 1`,
          [
            Object.keys(manifest.record_types.donors!).filter(
              (n) => !manifest.processor_identifiers.includes(n),
            ),
          ],
        )) as { name: string }[];
        expect(column).toBeTruthy();
        await sql(`alter table public.donors drop column ${column};
        delete from public.field_policies where record_type = 'donors' and field_key = '${column}'`);
        const stale = gate();
        expect(stale.status).not.toBe(0);
        expect(stale.stderr).toContain(`STALE donors.${column}`);

        const dropped = gate((m) => {
          delete m.record_types.donors![column!];
        });
        expect(dropped.status, dropped.stderr).toBe(0);
        expect(dropped.stdout).toContain(
          `equal the manifest's ${H.manifestTotals().columns - 1} entries`,
        );

        // The field-policy database tests CI runs accept the drop as well.
        for (const file of [
          "field_policies_foundation.sql",
          "field_policies_rls.sql",
        ]) {
          const r = spawnSync(
            process.env.PSQL_BIN?.trim() || "psql",
            [
              copy.url,
              "-X",
              "-q",
              "-v",
              "ON_ERROR_STOP=1",
              "-f",
              path.join(H.ROOT, "supabase/tests", file),
            ],
            {
              encoding: "utf8",
              env: { ...process.env, PGCLIENTENCODING: "UTF8" },
            },
          );
          expect(r.status, `${file}: ${r.stderr}`).toBe(0);
        }
      });

      it("a column whose type changes must be reclassified", async () => {
        await sql(
          "alter table public.member_care_goals alter column title type varchar(200)",
        );
        const r = gate();
        expect(r.status).not.toBe(0);
        expect(r.stderr).toContain("SHAPE member_care_goals.title");
      });

      it("a drifted field_policies flag fails", async () => {
        await sql(`update public.field_policies set exportable = true
        where record_type = 'donations' and field_key = 'stripe_charge_id' and surface = 'export'`);
        const r = gate();
        expect(r.status).not.toBe(0);
        expect(r.stderr).toContain(
          "ROW_DRIFT donations|stripe_charge_id|export|",
        );
      });
    });
  },
);
