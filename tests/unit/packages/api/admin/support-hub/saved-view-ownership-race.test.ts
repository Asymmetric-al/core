import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

const db = vi.hoisted(() => ({
  tables: {} as Record<string, Row[]>,
  /** Runs once, right after the next read of support_saved_views. */
  afterViewRead: null as null | (() => void),
}));

/** Applies eq filters like PostgREST, for select, update and delete. */
function table(name: string) {
  const filters: Array<[string, unknown]> = [];
  let mode: "select" | "update" | "delete" = "select";
  let patch: Row = {};
  const matches = (row: Row) =>
    filters.every(([column, value]) => row[column] === value);
  const run = () => {
    const rows = db.tables[name] ?? [];
    if (mode === "update") {
      const hit = rows.filter(matches);
      for (const row of hit) Object.assign(row, patch);
      return hit.map((row) => ({ ...row }));
    }
    if (mode === "delete") {
      const hit = rows.filter(matches);
      db.tables[name] = rows.filter((row) => !matches(row));
      return hit.map((row) => ({ ...row }));
    }
    const read = rows.filter(matches).map((row) => ({ ...row }));
    if (name === "support_saved_views" && db.afterViewRead) {
      const transfer = db.afterViewRead;
      db.afterViewRead = null;
      transfer();
    }
    return read;
  };
  const query = {
    select: () => query,
    eq(column: string, value: unknown) {
      filters.push([column, value]);
      return query;
    },
    order: () => query,
    update(values: Row) {
      mode = "update";
      patch = values;
      return query;
    },
    delete() {
      mode = "delete";
      return query;
    },
    upsert(values: Row) {
      const rows = (db.tables[name] ??= []);
      const existing = rows.find(
        (row) => row.id === values.id && row.tenant_id === values.tenant_id,
      );
      if (existing) Object.assign(existing, values);
      else rows.push({ ...values });
      return {
        select: () => ({
          single: async () => ({ data: { ...values }, error: null }),
        }),
      };
    },
    then(resolve: (value: { data: Row[]; error: null }) => unknown) {
      return Promise.resolve({ data: run(), error: null }).then(resolve);
    },
  };
  return query;
}

const getAdminClientMock = vi.hoisted(() => vi.fn());
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));
vi.mock("../../../../../../packages/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { supabaseSupportHubAdapter } from "../../../../../../packages/api/src/admin/support-hub/adapter/supabase";
import {
  SupportHubForbiddenError,
  createSupportOwnershipService,
} from "../../../../../../packages/api/src/admin/support-hub/ownership";
import { runWithSupportHubTenant } from "../../../../../../packages/api/src/admin/support-hub/request-context";

import type { SupportHubContext } from "../../../../../../packages/api/src/admin/support-hub/route-helpers";

const TENANT = "tenant-a";
const agentA: SupportHubContext = {
  tenantId: TENANT,
  userId: "user-a",
  userEmail: "a@example.test",
  isSuperAdmin: false,
  canManageAll: false,
};
const filter = {
  view: "mine" as const,
  layout: "table" as const,
  status: "open" as const,
  q: "",
  labelSlugs: [],
  assignee: "me" as const,
};

function seed() {
  db.tables = {
    support_agents: [
      {
        id: "agent-a",
        tenant_id: TENANT,
        user_id: "user-a",
        email: "a@example.test",
        name: "A",
      },
      {
        id: "agent-b",
        tenant_id: TENANT,
        user_id: "user-b",
        email: "b@example.test",
        name: "B",
      },
    ],
    support_saved_views: [
      {
        id: "view-1",
        tenant_id: TENANT,
        owner_agent_id: "agent-a",
        name: "Mine",
        slug: "mine",
        scope: "personal",
        filter,
        created_at: "2026-11-01T00:00:00.000Z",
        updated_at: "2026-11-01T00:00:00.000Z",
      },
    ],
  };
  // An admin hands the view to agent B after agent A's ownership check read
  // it, but before agent A's write lands.
  db.afterViewRead = () => {
    db.tables.support_saved_views![0]!.owner_agent_id = "agent-b";
  };
}

const service = createSupportOwnershipService(supabaseSupportHubAdapter);

describe("saved-view ownership is enforced by the write itself", () => {
  beforeEach(() => {
    getAdminClientMock.mockReturnValue({
      client: { from: (name: string) => table(name) },
      error: null,
    });
    seed();
  });

  it("refuses an edit when the view changed owner after the check, and leaves it untouched", async () => {
    const attempt = runWithSupportHubTenant(TENANT, () =>
      service.saveSavedView(agentA, {
        id: "view-1",
        name: "Renamed by A",
        slug: "mine",
        ownerAgentId: "agent-a",
        scope: "personal",
        filter,
      }),
    );

    await expect(attempt).rejects.toBeInstanceOf(SupportHubForbiddenError);
    expect(db.tables.support_saved_views![0]).toMatchObject({
      owner_agent_id: "agent-b",
      name: "Mine",
    });
  });

  it("refuses a delete when the view changed owner after the check, and keeps it", async () => {
    const attempt = runWithSupportHubTenant(TENANT, () =>
      service.deleteSavedView(agentA, "view-1"),
    );

    await expect(attempt).rejects.toMatchObject({ status: 403 });
    expect(db.tables.support_saved_views).toHaveLength(1);
    expect(db.tables.support_saved_views![0]!.owner_agent_id).toBe("agent-b");
  });

  it("still lets the owner edit and delete their own view", async () => {
    db.afterViewRead = null;
    const saved = await runWithSupportHubTenant(TENANT, () =>
      service.saveSavedView(agentA, {
        id: "view-1",
        name: "Renamed",
        slug: "mine",
        ownerAgentId: "agent-a",
        scope: "personal",
        filter,
      }),
    );
    expect(saved).toMatchObject({
      id: "view-1",
      name: "Renamed",
      ownerAgentId: "agent-a",
    });

    await runWithSupportHubTenant(TENANT, () =>
      service.deleteSavedView(agentA, "view-1"),
    );
    expect(db.tables.support_saved_views).toHaveLength(0);
  });
});
