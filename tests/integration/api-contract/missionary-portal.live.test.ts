/**
 * #2708: the real missionary-portal reads (packages/api/src/missionary-portal)
 * with a real supabase-js service client against two tenants. The reads use
 * the service role, so tenant scoping is the code's own filters; these tests
 * assert on the rows that come back.
 */
import { afterAll, beforeAll, expect, it } from "vitest";

import {
  collectStrings,
  createTenantFixture,
  membershipIdForRole,
  removeTenantFixture,
  SEED_USER_A,
  TENANT_A,
  type TenantFixture,
} from "./fixtures";
import { adminDatabase, describeLive, serviceClient } from "./live-stack";
import {
  getMissionaryPortalSnapshot,
  listMissionaryTasks,
  resolveMissionaryPortalContext,
} from "../../../packages/api/src/missionary-portal/service";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type pg from "pg";

describeLive("missionary portal reads stay inside their tenant", (stack) => {
  let db: pg.Client;
  let b: TenantFixture;
  let client: AdminSupabaseClient;
  let aDonorIds: string[];
  let aTaskIds: string[];
  let aAssignmentId: string;
  let bAssignmentId: string;

  beforeAll(async () => {
    db = await adminDatabase(stack);
    b = await createTenantFixture(db);
    client = serviceClient(stack) as unknown as AdminSupabaseClient;
    aAssignmentId = await membershipIdForRole(
      db,
      SEED_USER_A,
      TENANT_A,
      "missionary",
    );
    bAssignmentId = await membershipIdForRole(
      db,
      b.userId,
      b.tenantId,
      "missionary",
    );
    aDonorIds = (
      await db.query<{ id: string }>(
        "select id::text from public.donors where tenant_id = $1 and missionary_id = $2",
        [TENANT_A, SEED_USER_A],
      )
    ).rows.map((r) => r.id);
    aTaskIds = (
      await db.query<{ id: string }>(
        "select id::text from public.missionary_tasks where missionary_id = $1",
        [SEED_USER_A],
      )
    ).rows.map((r) => r.id);
  });

  afterAll(async () => {
    if (db) {
      const problems = b ? await removeTenantFixture(db, b) : [];
      await db.end();
      expect(problems, "fixture cleanup").toEqual([]);
    }
  });

  it("has seeded rows for tenant A to tell apart", () => {
    expect(aDonorIds.length).toBeGreaterThan(0);
    expect(aTaskIds.length).toBeGreaterThan(0);
  });

  it("returns tenant A's snapshot with A's donors and tasks and nothing of B's", async () => {
    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: client,
      profileId: SEED_USER_A,
      tenantId: TENANT_A,
      assignmentId: aAssignmentId,
    });
    const strings = collectStrings(snapshot);
    expect(aDonorIds.some((id) => strings.has(id))).toBe(true);
    expect(aTaskIds.some((id) => strings.has(id))).toBe(true);
    for (const id of [b.donorId, b.taskId, b.missionaryId, b.userId])
      expect(strings.has(id), `tenant B id ${id} in A's snapshot`).toBe(false);
  });

  it("returns tenant B's snapshot with B's donor and task and nothing of A's", async () => {
    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: client,
      profileId: b.userId,
      tenantId: b.tenantId,
      assignmentId: bAssignmentId,
    });
    const strings = collectStrings(snapshot);
    expect(strings.has(b.donorId)).toBe(true);
    expect(strings.has(b.taskId)).toBe(true);
    const leaked = [...aDonorIds, ...aTaskIds, TENANT_A, SEED_USER_A].filter(
      (id) => strings.has(id),
    );
    expect(leaked, "tenant A ids in B's snapshot").toEqual([]);
  });

  it("refuses B's missionary under tenant A", async () => {
    await expect(
      resolveMissionaryPortalContext({
        supabaseAdmin: client,
        profileId: b.userId,
        tenantId: TENANT_A,
        assignmentId: bAssignmentId,
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("lists exactly B's task, with B's donor embedded", async () => {
    const tasks = await listMissionaryTasks({
      supabaseAdmin: client,
      profileId: b.userId,
      tenantId: b.tenantId,
      assignmentId: bAssignmentId,
    });
    expect(tasks.map((t) => t.id)).toEqual([b.taskId]);
    expect(collectStrings(tasks).has(b.donorId)).toBe(true);
  });
});
