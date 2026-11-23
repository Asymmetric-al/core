import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";
import { exerciseMovedDonorPatch } from "../../../fixtures/missionary-task-patch";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "missionary handler statement authority (D-18, AL-2678: each fixture missionary names a Party; tasks carry their tenant)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    it.each([false, true])(
      "edits a moved donor's task without echoing away its link (other tenant: %s)",
      async (elsewhere) => {
        await exerciseMovedDonorPatch(
          db,
          elsewhere,
          "sql",
          async (scope, patch) => {
            await db.query(
              "grant update on public.missionary_tasks to service_role",
            );
            await db.query("set local role service_role");
            const result = await db.query(
              "select title, donor_id from public.missionary_task_write($1,$2,$3,'update',$4,$5)",
              [scope.person, scope.tenant, scope.assignment, scope.task, patch],
            );
            await db.query("reset role");
            expect(result.rows).toHaveLength(1);
            return result.rows[0];
          },
        );
      },
    );

    it("exposes the statement guards to the service role only, without definer rights", async () => {
      const guards = [
        "authz.selected_missionary",
        "authz.missionary_task_single_tenant",
        "public.missionary_owned_tasks",
        "public.missionary_task_write",
        "public.missionary_follower_requests",
        "public.missionary_follower_request_write",
        "public.missionary_own_record",
        "public.missionary_own_record_write",
        "public.missionary_directory",
        "public.missionary_activities",
        "public.missionary_activity_create",
      ];
      const result = await db.query(
        `select name, not proc.prosecdef and
         has_function_privilege('service_role', proc.oid, 'execute') and
         not has_function_privilege('anon', proc.oid, 'execute') and
         not has_function_privilege('authenticated', proc.oid, 'execute') as restricted
       from unnest($1::text[]) as guard(name)
       join pg_proc as proc on proc.oid = to_regproc(guard.name)`,
        [guards],
      );
      expect(
        (
          await db.query(
            `select proc.oid from pg_catalog.pg_proc as proc
           join pg_catalog.pg_namespace as ns on ns.oid = proc.pronamespace
           where ns.nspname = 'public' and proc.proname = 'crm_donor_activities'`,
          )
        ).rows,
      ).toHaveLength(0);
      expect(result.rows).toHaveLength(guards.length);
      for (const row of result.rows)
        expect(row.restricted, row.name).toBe(true);
    });

    it.each(["none", "live", "revoked"] as const)(
      "places general tasks with a live selected missionary row and %s elsewhere",
      async (elsewhere) => {
        const user = randomUUID();
        const tenant = randomUUID();
        const otherTenant = randomUUID();
        const assignment = randomUUID();
        const donor = randomUUID();
        const original = randomUUID();
        const scope = [user, tenant, assignment];
        const list = async (id: string | null = null) =>
          (
            await db.query(
              "select id, title, donor_id from public.missionary_owned_tasks($1,$2,$3) where $4::uuid is null or id=$4",
              [...scope, id],
            )
          ).rows;
        const write = async (op: string, id: string | null, patch = {}) =>
          (
            await db.query(
              "select id, title, donor_id from public.missionary_task_write($1,$2,$3,$4,$5,$6)",
              [...scope, op, id, patch],
            )
          ).rows;

        await db.query("begin");
        try {
          for (const org of [tenant, otherTenant]) {
            await db.query(
              "insert into public.tenants (id,name,slug) values ($1::uuid,'WP2H',$1::uuid::text)",
              [org],
            );
          }
          await db.query(
            "insert into auth.users (id,raw_app_meta_data) values ($1,$2)",
            [user, { tenant_id: tenant }],
          );
          await db.query(
            "insert into authz.memberships (id,tenant_id,user_id,role) values ($1,$2,$3,'missionary')",
            [assignment, tenant, user],
          );
          await db.query(
            "insert into public.donors (id,tenant_id,missionary_id) values ($1,$2,$3)",
            [donor, tenant, user],
          );
          await db.query(
            "insert into public.missionary_tasks (id,missionary_id,title) values ($1,$2,'Original')",
            [original, user],
          );
          if (elsewhere !== "none") {
            await db.query(
              "insert into authz.memberships (tenant_id,user_id,role) values ($1,$2,'donor')",
              [otherTenant, user],
            );
            if (elsewhere === "revoked") {
              await db.query(
                "update authz.memberships set is_active=false where tenant_id=$1 and user_id=$2",
                [otherTenant, user],
              );
            }
          }
          await db.query(
            "grant insert,update,delete on public.missionary_tasks to service_role",
          );
          await db.query("set local role service_role");
          const originalRow = {
            id: original,
            title: "Original",
            donor_id: null,
          };
          if (elsewhere === "none") {
            const [created] = await write("create", null, { title: "General" });
            expect(
              (
                await db.query(
                  "select status, priority, sort_key from public.missionary_tasks where id=$1",
                  [created.id],
                )
              ).rows,
            ).toEqual([{ status: "pending", priority: "medium", sort_key: 0 }]);
            expect(created).toEqual({
              id: expect.any(String),
              title: "General",
              donor_id: null,
            });
            expect(await list()).toEqual(
              expect.arrayContaining([created, originalRow]),
            );
            expect(await list(created.id)).toEqual([created]);
            expect(
              await write("update", created.id, { title: "Edited" }),
            ).toEqual([{ ...created, title: "Edited" }]);
            expect(await write("delete", created.id)).toEqual([
              { ...created, title: "Edited" },
            ]);
            expect(await list(created.id)).toEqual([]);
            expect(
              await write("update", original, { donor_id: donor }),
            ).toEqual([{ ...originalRow, donor_id: donor }]);
            expect(await write("update", original, { donor_id: null })).toEqual(
              [originalRow],
            );
            await db.query("reset role");
            await db.query(
              "update authz.memberships set is_active=false where id=$1",
              [assignment],
            );
            await db.query("set local role service_role");
          }
          expect(await list()).toEqual([]);
          expect(await list(original)).toEqual([]);
          expect(await write("create", null, { title: "Denied" })).toEqual([]);
          expect(await write("update", original, { title: "Denied" })).toEqual(
            [],
          );
          expect(await write("update", original, { donor_id: donor })).toEqual(
            [],
          );
          expect(await write("delete", original)).toEqual([]);
          expect(
            (
              await db.query(
                "select id, title, donor_id from public.missionary_tasks where missionary_id=$1",
                [user],
              )
            ).rows,
          ).toEqual([originalRow]);
        } finally {
          await db.query("rollback");
        }
      },
    );

    it("applies the selected live missionary row to reads, both sides of reassignment, and every mutation", async () => {
      const profile = randomUUID();
      const org = () => ({
        tenant: randomUUID(),
        assignment: randomUUID(),
        donor: randomUUID(),
        task: randomUUID(),
        request: randomUUID(),
        missionary: randomUUID(),
      });
      const first = org();
      const second = org();
      const orphan = randomUUID();
      const donorHat = randomUUID();
      const otherDonor = randomUUID();
      await db.query("begin");
      try {
        await db.query("insert into auth.users (id) values ($1)", [profile]);
        for (const row of [first, second]) {
          await db.query(
            "insert into public.tenants (id,name,slug) values ($1::uuid,'WP2H',$1::uuid::text)",
            [row.tenant],
          );
          await db.query(
            "insert into authz.memberships (id,tenant_id,user_id,role) values ($1,$2,$3,'missionary')",
            [row.assignment, row.tenant, profile],
          );
          await db.query(
            "with entity as (insert into public.legal_entities(id,tenant_id,name) values ($2,$2,'Fixture') returning id), party as (insert into public.parties(id,tenant_id,display_name) values ($1,$2,'Fixture') returning id) insert into public.missionaries (id,tenant_id,profile_id,legal_entity_id,party_id) select $1,$2,$3,entity.id,party.id from entity, party",
            [row.missionary, row.tenant, profile],
          );
          await db.query(
            "insert into public.donors (id,tenant_id,missionary_id) values ($1,$2,$3)",
            [row.donor, row.tenant, profile],
          );
          await db.query(
            "insert into public.missionary_tasks (id,donor_id,missionary_id,title) values ($1,$2,$3,'original')",
            [row.task, row.donor, profile],
          );
          await db.query(
            "insert into public.follower_requests (id,donor_id,missionary_id) values ($1,$2,$3)",
            [row.request, row.donor, profile],
          );
        }
        await db.query(
          "insert into authz.memberships (id,tenant_id,user_id,role) values ($1,$2,$3,'donor')",
          [donorHat, first.tenant, profile],
        );
        await db.query(
          "insert into public.donors (id,tenant_id,missionary_id) values ($1,$2,$3)",
          [otherDonor, first.tenant, profile],
        );
        await db.query(
          "insert into public.missionary_tasks (id,missionary_id,title) values ($1,$2,'unplaced')",
          [orphan, profile],
        );
        await db.query(
          "grant insert,update,delete on public.missionary_tasks,public.follower_requests,public.missionaries,public.donor_activities to service_role",
        );
        await db.query("set local role service_role");
        const call = async (
          fn: string,
          scope: typeof first,
          ...args: unknown[]
        ) => {
          const values = [profile, scope.tenant, scope.assignment, ...args];
          return (
            await db.query<{ id: string }>(
              `select id from public.${fn}(${values.map((_, index) => `$${index + 1}`).join(",")})`,
              values,
            )
          ).rows.map((row) => row.id);
        };
        const reads = async (scope: typeof first) => [
          await call("missionary_owned_tasks", scope),
          await call("missionary_follower_requests", scope),
          await call("missionary_own_record", scope),
        ];
        const activity = (scope: typeof first, donor: string) =>
          call(
            "missionary_activity_create",
            scope,
            donor,
            "note",
            "Note",
            "called",
            new Date().toISOString(),
          );
        await db.query("savepoint move_donor");
        await db.query("reset role");
        const newOwner = randomUUID();
        await db.query("insert into auth.users(id) values ($1)", [newOwner]);
        await db.query(
          "with party as (insert into public.parties(tenant_id,display_name) values ($1,'Fixture') returning id) insert into public.missionaries(tenant_id,profile_id,legal_entity_id,party_id) select $1,$2,$1,id from party",
          [first.tenant, newOwner],
        );
        await db.query(
          "update public.donors set missionary_id=$2 where id=$1",
          [first.donor, newOwner],
        );
        await db.query("set local role service_role");
        const scope = [profile, first.tenant, first.assignment];
        expect(
          (
            await db.query(
              "select id, donor_id from public.missionary_owned_tasks($1,$2,$3)",
              scope,
            )
          ).rows,
        ).toEqual([{ id: first.task, donor_id: null }]);
        expect(
          (
            await db.query(
              "select id from public.missionary_owned_tasks($1,$2,$3) where donor_id=$4",
              [...scope, first.donor],
            )
          ).rows,
        ).toEqual([]);
        expect(
          (
            await db.query(
              "select id,donor_id from public.missionary_task_write($1,$2,$3,'update',$4,$5)",
              [...scope, first.task, { title: "edited" }],
            )
          ).rows,
        ).toEqual([{ id: first.task, donor_id: null }]);
        await db.query("rollback to savepoint move_donor");
        const activityIds = async () =>
          (
            await db.query(
              "select id from public.donor_activities where donor_id = any($1::uuid[]) order by id",
              [[first.donor, second.donor, otherDonor]],
            )
          ).rows;
        const initialActivities = await activityIds();
        expect(await activity(first, second.donor)).toEqual([]);
        expect(await activityIds()).toEqual(initialActivities);
        const activities = await activity(first, first.donor);
        expect(activities).toHaveLength(1);
        const otherActivities = await activity(first, otherDonor);
        expect(otherActivities).toHaveLength(1);
        expect(
          await call("missionary_activities", first, [first.donor, otherDonor]),
        ).toHaveLength(2);
        expect(
          await call("missionary_activities", first, [first.donor]),
        ).toEqual(activities);
        expect(
          await call("missionary_activities", second, [first.donor]),
        ).toEqual([]);
        for (const [person, assignment] of [
          [randomUUID(), first.assignment],
          [profile, null],
        ]) {
          expect(
            (
              await db.query(
                "select id from public.missionary_directory($1,$2,$3)",
                [person, first.tenant, assignment],
              )
            ).rows,
          ).toEqual([]);
        }
        expect(await call("missionary_directory", first)).toEqual([
          first.missionary,
        ]);
        expect(await call("missionary_directory", second)).toEqual([
          second.missionary,
        ]);
        const task = (
          scope: typeof first,
          op: string,
          id: string | null,
          patch = {},
        ) => call("missionary_task_write", scope, op, id, patch);
        const follow = (
          scope: typeof first,
          op: string,
          id: string,
          status = "approved",
        ) =>
          call(
            "missionary_follower_request_write",
            scope,
            op,
            id,
            status,
            "comment",
          );
        const edit = (scope: typeof first) =>
          call("missionary_own_record_write", scope, { bio: "edited" });

        for (const row of [first, second])
          expect(await reads(row)).toEqual([
            [row.task],
            [row.request],
            [row.missionary],
          ]);
        for (const id of [orphan, second.task]) {
          expect(await task(first, "update", id, { title: "wrong" })).toEqual(
            [],
          );
          expect(await task(first, "delete", id)).toEqual([]);
        }
        for (const donor_id of [null, second.donor]) {
          expect(
            await task(first, "create", null, { title: "wrong", donor_id }),
          ).toEqual([]);
          expect(await task(first, "update", first.task, { donor_id })).toEqual(
            [],
          );
        }
        for (const op of ["update", "delete"])
          expect(await follow(first, op, second.request)).toEqual([]);
        const [created] = await task(first, "create", null, {
          title: "new",
          donor_id: first.donor,
        });
        expect(created).toBeTruthy();
        expect(
          await task(first, "update", created!, { title: "updated" }),
        ).toEqual([created]);
        expect(await task(first, "delete", created!)).toEqual([created]);
        expect(await follow(first, "update", first.request)).toEqual([
          first.request,
        ]);
        expect(await edit(first)).toEqual([first.missionary]);
        const followerRow = async () =>
          (
            await db.query(
              "select * from public.follower_requests where id=$1",
              [first.request],
            )
          ).rows;
        const originalFollower = await followerRow();
        expect(originalFollower).toHaveLength(1);
        const originalActivities = await activityIds();
        const wrongHat = { ...first, assignment: donorHat };
        expect(await reads(wrongHat)).toEqual([[], [], []]);
        expect(await task(wrongHat, "delete", first.task)).toEqual([]);
        expect(await follow(wrongHat, "delete", first.request)).toEqual([]);
        expect(await edit(wrongHat)).toEqual([]);
        expect(await activity(wrongHat, first.donor)).toEqual([]);
        expect(await call("missionary_directory", wrongHat)).toEqual([]);
        await db.query("reset role");
        await db.query(
          "update authz.memberships set is_active=false,revoked_at=now() where id=$1",
          [first.assignment],
        );
        await db.query("set local role service_role");
        for (const scope of [
          first,
          { ...first, assignment: donorHat },
          { ...first, assignment: second.assignment },
        ]) {
          expect(await reads(scope)).toEqual([[], [], []]);
          expect(await activity(scope, first.donor)).toEqual([]);
          expect(
            await call("missionary_activities", scope, [first.donor]),
          ).toEqual([]);
          expect(await call("missionary_directory", scope)).toEqual([]);
          expect(
            await task(scope, "create", null, {
              title: "denied",
              donor_id: first.donor,
            }),
          ).toEqual([]);
          for (const op of ["update", "delete"]) {
            expect(
              await task(scope, op, first.task, { title: "denied" }),
            ).toEqual([]);
            expect(await follow(scope, op, first.request, "rejected")).toEqual(
              [],
            );
          }
          expect(await edit(scope)).toEqual([]);
        }
        expect(await reads(second)).toEqual([
          [second.task],
          [second.request],
          [second.missionary],
        ]);
        expect(await activityIds()).toEqual(originalActivities);
        expect(await followerRow()).toEqual(originalFollower);
        expect(await follow(second, "delete", second.request)).toEqual([
          second.request,
        ]);
        expect(
          (
            await db.query(
              "select title from public.missionary_tasks where id=$1",
              [first.task],
            )
          ).rows,
        ).toEqual([{ title: "original" }]);
        expect(
          (
            await db.query("select bio from public.missionaries where id=$1", [
              second.missionary,
            ])
          ).rows,
        ).toEqual([{ bio: null }]);
      } finally {
        await db.query("rollback");
      }
    });
  },
);
