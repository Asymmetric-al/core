import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("missionary handler statement authority", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  it("exposes the statement guards to the service role only, without definer rights", async () => {
    const guards = [
      "authz.selected_missionary",
      "public.missionary_owned_tasks",
      "public.missionary_task_write",
      "public.missionary_follower_requests",
      "public.missionary_follower_request_write",
      "public.missionary_own_record",
      "public.missionary_own_record_write",
      "public.missionary_directory",
      "public.missionary_activities",
      "public.missionary_activity_create",
      "public.crm_donor_activities",
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
    expect(result.rows).toHaveLength(guards.length);
    for (const row of result.rows) expect(row.restricted, row.name).toBe(true);
  });

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
    const staffHat = randomUUID();
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
          "insert into public.missionaries (id,tenant_id,profile_id) values ($1,$2,$3)",
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
        "insert into authz.memberships (id,tenant_id,user_id,role,staff_role) values ($1,$2,$3,'staff','development')",
        [staffHat, first.tenant, profile],
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
      expect(await activity(first, second.donor)).toEqual([]);
      const activities = await activity(first, first.donor);
      expect(activities).toHaveLength(1);
      const staffActivities = (scope: typeof first, donor: string) =>
        call("crm_donor_activities", scope, donor);
      expect(
        await staffActivities({ ...first, assignment: staffHat }, first.donor),
      ).toEqual(activities);
      expect(
        await staffActivities({ ...first, assignment: staffHat }, second.donor),
      ).toEqual([]);
      expect(await staffActivities(first, first.donor)).toEqual([]);
      expect(await call("missionary_activities", first)).toEqual(activities);
      expect(await call("missionary_activities", second)).toEqual([]);
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
      const follow = (scope: typeof first, op: string, id: string) =>
        call(
          "missionary_follower_request_write",
          scope,
          op,
          id,
          "approved",
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
        expect(await task(first, "update", id, { title: "wrong" })).toEqual([]);
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
      const wrongHat = { ...first, assignment: donorHat };
      expect(await reads(wrongHat)).toEqual([[], [], []]);
      expect(await task(wrongHat, "delete", first.task)).toEqual([]);
      expect(await follow(wrongHat, "delete", first.request)).toEqual([]);
      expect(await edit(wrongHat)).toEqual([]);
      expect(await activity(wrongHat, first.donor)).toEqual([]);
      expect(await call("missionary_directory", wrongHat)).toEqual([]);
      await db.query("reset role");
      await db.query(
        "update authz.memberships set is_active=false,revoked_at=now() where id in ($1,$2)",
        [first.assignment, staffHat],
      );
      await db.query("set local role service_role");
      for (const scope of [
        first,
        { ...first, assignment: donorHat },
        { ...first, assignment: second.assignment },
      ]) {
        expect(await reads(scope)).toEqual([[], [], []]);
        expect(await activity(scope, first.donor)).toEqual([]);
        expect(await call("missionary_activities", scope)).toEqual([]);
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
          expect(await follow(scope, op, first.request)).toEqual([]);
        }
        expect(await edit(scope)).toEqual([]);
      }
      expect(
        await staffActivities({ ...first, assignment: staffHat }, first.donor),
      ).toEqual([]);
      expect(await reads(second)).toEqual([
        [second.task],
        [second.request],
        [second.missionary],
      ]);
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
});
