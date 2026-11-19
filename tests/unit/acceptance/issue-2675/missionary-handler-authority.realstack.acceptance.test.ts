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
        "insert into public.missionary_tasks (id,missionary_id,title) values ($1,$2,'unplaced')",
        [orphan, profile],
      );
      await db.query(
        "grant insert,update,delete on public.missionary_tasks,public.follower_requests,public.missionaries to service_role",
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
      const reads = async (scope: typeof first) =>
        Promise.all(
          [
            "missionary_owned_tasks",
            "missionary_follower_requests",
            "missionary_own_record",
          ].map((fn) => call(fn, scope)),
        );
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
      await db.query("reset role");
      await db.query(
        "update authz.memberships set is_active=false where id=$1",
        [first.assignment],
      );
      await db.query("set local role service_role");
      for (const scope of [
        first,
        { ...first, assignment: donorHat },
        { ...first, assignment: second.assignment },
      ]) {
        expect(await reads(scope)).toEqual([[], [], []]);
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
