import { randomUUID } from "node:crypto";
import type pg from "pg";
import { expect } from "vitest";

export async function exerciseMovedDonorPatch(
  db: pg.Client,
  elsewhere: boolean,
  transport: "sql" | "http",
  update: (
    scope: { person: string; tenant: string; assignment: string; task: string },
    patch: { title?: string; donor_id?: string | null },
  ) => Promise<{ title: string; donor_id: string | null }>,
) {
  const tenant = "00000000-0000-0000-0000-000000000001";
  const otherTenant = "00000000-0000-0000-0000-000000000002";
  const person = randomUUID();
  const owner = randomUUID();
  const assignment = randomUUID();
  const moved = randomUUID();
  const replacement = randomUUID();
  const task = randomUUID();
  const scope = { person, tenant, assignment, task };
  await db.query("begin");
  try {
    await db.query("insert into auth.users(id) values ($1),($2)", [
      person,
      owner,
    ]);
    await db.query(
      "insert into authz.memberships(id,tenant_id,user_id,role) values ($1,$2,$3,'missionary')",
      [assignment, tenant, person],
    );
    if (elsewhere)
      await db.query(
        "insert into authz.memberships(tenant_id,user_id,role) values ($1,$2,'donor')",
        [otherTenant, person],
      );
    await db.query(
      "insert into public.donors(id,tenant_id,missionary_id,giving_preferences) values ($1,$3,$4,$5),($2,$3,$4,$5)",
      [
        moved,
        replacement,
        tenant,
        person,
        { defaultAnonymousToRecipient: false },
      ],
    );
    await db.query(
      "insert into public.missionary_tasks(id,donor_id,missionary_id,title,tenant_id) values ($1,$2,$3,'original',$4)",
      [task, moved, person, tenant],
    );
    await db.query("update public.donors set missionary_id=$1 where id=$2", [
      owner,
      moved,
    ]);
    if (transport === "http") await db.query("commit");
  } catch (error) {
    await db.query("rollback");
    throw error;
  }
  const check = async (
    patch: Parameters<typeof update>[1],
    title: string,
    visible: string | null,
    stored: string | null,
  ) => {
    const result = await update(scope, patch);
    expect(result).toMatchObject({ title, donor_id: visible });
    expect(
      (
        await db.query(
          "select title, donor_id from public.missionary_tasks where id=$1",
          [task],
        )
      ).rows,
    ).toEqual([{ title, donor_id: stored }]);
  };
  try {
    await check({ title: "edited" }, "edited", null, moved);
    await check({ title: "echoed", donor_id: null }, "echoed", null, moved);
    await check({ donor_id: replacement }, "echoed", replacement, replacement);
    await check({ donor_id: null }, "echoed", null, null);
  } finally {
    if (transport === "sql") await db.query("rollback");
    else {
      await db.query("delete from public.missionary_tasks where id=$1", [task]);
      const parties = await db.query(
        "select party_id from public.donors where id in ($1,$2)",
        [moved, replacement],
      );
      await db.query("delete from public.donors where id in ($1,$2)", [
        moved,
        replacement,
      ]);
      await db.query("delete from public.parties where id = any($1::uuid[])", [
        parties.rows.map((row) => row.party_id),
      ]);
      await db.query("delete from auth.users where id in ($1,$2)", [
        person,
        owner,
      ]);
    }
  }
}
