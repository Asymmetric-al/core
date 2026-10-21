import { describe, expect, it, vi } from "vitest";

import {
  createTrackedFixtureRows,
  createTrackedFixtureUser,
  fixtureAuthUserCleanupOperations,
  fixtureTableCleanupOperations,
  runFixtureCleanup,
  verifyLocalFixtureTarget,
} from "../../integration/supabase/client-runtime-checks.mjs";

const projectId = "asym-modernization-safety";
const target = {
  projectId,
  API_URL: "http://127.0.0.1:55321",
  PUBLIC_KEY: "synthetic-public-key",
  SERVICE_ROLE_KEY: "synthetic-service-key",
};
const kong = {
  id: "a".repeat(64),
  name: `/supabase_kong_${projectId}`,
  running: true,
  labels: { "com.supabase.cli.project": projectId },
  ports: { "8000/tcp": [{ HostIp: "0.0.0.0", HostPort: "55321" }] },
};

describe("owned local SDK target", () => {
  it("requires independent local daemon and published gateway evidence", async () => {
    const inspect = vi.fn().mockResolvedValue({
      endpoint: "unix:///var/run/docker.sock",
      containers: [kong],
    });
    const verified = await verifyLocalFixtureTarget(target, { inspect });
    expect(inspect).toHaveBeenCalledWith(projectId);
    expect(verified.containerId).toBe(kong.id);
    expect(verified.url.href).toBe(target.API_URL + "/");
  });

  it.each([
    { name: "wrong project", containers: [{ ...kong, labels: {} }] },
    { name: "wrong gateway", containers: [{ ...kong, name: "/proxy" }] },
    { name: "stopped gateway", containers: [{ ...kong, running: false }] },
    { name: "missing gateway", containers: [] },
    { name: "ambiguous gateways", containers: [kong, kong] },
    { name: "malformed inspection", containers: null },
    {
      name: "wrong published port",
      containers: [
        {
          ...kong,
          ports: { "8000/tcp": [{ HostIp: "0.0.0.0", HostPort: "55322" }] },
        },
      ],
    },
    {
      name: "remote host binding",
      containers: [
        {
          ...kong,
          ports: { "8000/tcp": [{ HostIp: "192.0.2.1", HostPort: "55321" }] },
        },
      ],
    },
    {
      name: "wrong address family",
      containers: [
        {
          ...kong,
          ports: { "8000/tcp": [{ HostIp: "::1", HostPort: "55321" }] },
        },
      ],
    },
  ])("rejects $name before provider access", async ({ containers }) => {
    await expect(
      verifyLocalFixtureTarget(target, {
        inspect: async () => ({
          endpoint: "unix:///var/run/docker.sock",
          containers,
        }),
      }),
    ).rejects.toThrow(
      containers === null
        ? "Malformed local inspection"
        : "API target is not the owned local gateway",
    );
  });

  it.each(["ssh://example.invalid", "tcp://127.0.0.1:2375"])(
    "rejects a remote or proxyable daemon: %s",
    async (endpoint) => {
      await expect(
        verifyLocalFixtureTarget(target, {
          inspect: async () => ({ endpoint, containers: [kong] }),
        }),
      ).rejects.toThrow("A local Docker socket is required");
    },
  );

  it("rejects a loopback proxy port with no matching Docker publication", async () => {
    await expect(
      verifyLocalFixtureTarget(
        { ...target, API_URL: "http://127.0.0.1:55323" },
        {
          inspect: async () => ({
            endpoint: "unix:///var/run/docker.sock",
            containers: [kong],
          }),
        },
      ),
    ).rejects.toThrow("API target is not the owned local gateway");
  });

  it("fails closed when Docker cannot provide independent evidence", async () => {
    await expect(
      verifyLocalFixtureTarget(target, {
        inspect: async () => {
          throw new Error("Synthetic Docker failure");
        },
      }),
    ).rejects.toThrow("Synthetic Docker failure");
  });
});

type FixtureRow = { id: string; name: string; [key: string]: string | number };
type TableInsertResult = { data: null; error: { code: string } | null };

function fakeTable(table: string) {
  const rows = new Map<string, FixtureRow>();
  const insert = vi.fn(
    async (values: FixtureRow[]): Promise<TableInsertResult> => {
      for (const row of values) rows.set(row.id, { ...row });
      return { data: null, error: null };
    },
  );
  const read = vi.fn(async (id: string) => ({
    data: rows.get(id) ?? null,
    error: null,
  }));
  const remove = vi.fn(async (_column: string, id: string) => {
    rows.delete(id);
    return { data: null, error: null };
  });
  const admin = {
    from: vi.fn((name: string) => {
      expect(name).toBe(table);
      return {
        insert,
        select: () => ({
          eq: (_column: string, id: string) => ({
            maybeSingle: () => read(id),
          }),
        }),
        delete: () => ({ eq: remove }),
      };
    }),
  };
  const row: FixtureRow = {
    id: "44444444-4444-4444-8444-444444444444",
    name: "SDK qualification owned run",
  };
  if (table === "tenants") row.slug = "sdk-qualification-owned-run";
  else row.tenant_id = "22222222-2222-4222-8222-222222222222";
  return { rows, admin, insert, read, remove, row };
}

describe("ambiguous fixture table creation", () => {
  it("journals reserved identities before awaiting the table insert", async () => {
    const fixture = fakeTable("tenants");
    const journal: object[] = [];
    fixture.insert.mockImplementation(async () => {
      expect(journal).toEqual([
        expect.objectContaining({
          table: "tenants",
          row: fixture.row,
          creationAttempted: true,
          creationAcknowledged: false,
        }),
      ]);
      return { data: null, error: null };
    });
    await createTrackedFixtureRows(fixture.admin, journal, "tenants", [
      fixture.row,
    ]);
    expect(journal).toEqual([
      expect.objectContaining({ creationAcknowledged: true }),
    ]);
  });

  it.each(["tenants", "funds"])(
    "recovers a committed %s row after a thrown lost response",
    async (table) => {
      const fixture = fakeTable(table);
      const insert = fixture.insert.getMockImplementation()!;
      fixture.insert.mockImplementation(async (values) => {
        await insert(values);
        throw new Error("Synthetic table response loss");
      });
      const journal: object[] = [];
      await expect(
        createTrackedFixtureRows(fixture.admin, journal, table, [fixture.row]),
      ).rejects.toThrow("Synthetic table response loss");
      const failures = await runFixtureCleanup(
        fixtureTableCleanupOperations(fixture.admin, journal, table),
      );
      expect(failures).toEqual([]);
      expect(fixture.rows.size).toBe(0);
    },
  );

  it.each(["tenants", "funds"])(
    "recovers a committed %s row after a resolved transport error",
    async (table) => {
      const fixture = fakeTable(table);
      const insert = fixture.insert.getMockImplementation()!;
      fixture.insert.mockImplementation(async (values) => {
        await insert(values);
        return { data: null, error: { code: "" } };
      });
      const journal: object[] = [];
      const result = await createTrackedFixtureRows(
        fixture.admin,
        journal,
        table,
        [fixture.row],
      );
      expect(result.error).not.toBeNull();
      const failures = await runFixtureCleanup(
        fixtureTableCleanupOperations(fixture.admin, journal, table),
      );
      expect(failures).toEqual([]);
      expect(fixture.rows.size).toBe(0);
    },
  );

  it.each(["tenants", "funds"])(
    "does not certify cleanup before an in-flight %s insert commits",
    async (table) => {
      const fixture = fakeTable(table);
      fixture.insert.mockRejectedValue(new Error("Synthetic table timeout"));
      const journal: object[] = [];
      await expect(
        createTrackedFixtureRows(fixture.admin, journal, table, [fixture.row]),
      ).rejects.toThrow("Synthetic table timeout");
      const census = vi.fn(() => expect(fixture.rows.size).toBe(0));
      const failures = await runFixtureCleanup([
        ...fixtureTableCleanupOperations(fixture.admin, journal, table),
        { label: "census", run: census },
      ]);
      expect(census).toHaveBeenCalledOnce();
      fixture.rows.set(fixture.row.id, fixture.row);
      expect(failures.length).toBeGreaterThan(0);
      expect(fixture.remove).not.toHaveBeenCalled();
    },
  );

  it.each(["tenants", "funds"])(
    "preserves an unrelated %s row at a reserved identity",
    async (table) => {
      const fixture = fakeTable(table);
      const unrelated = { ...fixture.row, name: "Another run owns this row" };
      fixture.rows.set(unrelated.id, unrelated);
      fixture.insert.mockRejectedValue(new Error("UUID already exists"));
      const journal: object[] = [];
      await expect(
        createTrackedFixtureRows(fixture.admin, journal, table, [fixture.row]),
      ).rejects.toThrow("UUID already exists");
      const failures = await runFixtureCleanup(
        fixtureTableCleanupOperations(fixture.admin, journal, table),
      );
      expect(failures.length).toBeGreaterThan(0);
      expect(fixture.remove).not.toHaveBeenCalled();
      expect(fixture.rows.get(unrelated.id)).toEqual(unrelated);
    },
  );

  it.each(["tenants", "funds"])(
    "fails when an acknowledged %s deletion leaves its exact identity present",
    async (table) => {
      const fixture = fakeTable(table);
      const journal: object[] = [];
      await createTrackedFixtureRows(fixture.admin, journal, table, [
        fixture.row,
      ]);
      fixture.remove.mockImplementation(async () => ({
        data: null,
        error: null,
      }));
      const failures = await runFixtureCleanup(
        fixtureTableCleanupOperations(fixture.admin, journal, table),
      );
      expect(failures.length).toBeGreaterThan(0);
      expect(fixture.rows.get(fixture.row.id)).toEqual(fixture.row);
    },
  );

  it.each(["tenants", "funds"])(
    "never removes a reserved %s identity whose creation was not attempted",
    async (table) => {
      const fixture = fakeTable(table);
      fixture.rows.set(fixture.row.id, fixture.row);
      const journal = [
        {
          table,
          row: fixture.row,
          creationAttempted: false,
          creationAcknowledged: false,
        },
      ];
      const failures = await runFixtureCleanup(
        fixtureTableCleanupOperations(fixture.admin, journal, table),
      );
      expect(failures).toEqual([]);
      expect(fixture.admin.from).not.toHaveBeenCalled();
      expect(fixture.rows.get(fixture.row.id)).toEqual(fixture.row);
    },
  );
});

type FixtureUser = {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
};
type CreateAttributes = {
  id?: string;
  email: string;
  app_metadata: Record<string, unknown>;
};
type AuthResult = {
  data: { user: FixtureUser | null };
  error: { status: number; code?: string } | null;
};
const reservation = {
  id: "11111111-1111-4111-8111-111111111111",
  tenantId: "22222222-2222-4222-8222-222222222222",
  runId: "33333333-3333-4333-8333-333333333333",
  email: "sdk-safety@example.invalid",
  password: "synthetic-fixture-password",
};

function fakeAuth() {
  const users = new Map<string, FixtureUser>();
  const profiles = new Set<string>();
  const auth = {
    createUser: vi.fn(
      async (attributes: CreateAttributes): Promise<AuthResult> => {
        const user = {
          id: attributes.id ?? "provider-generated-id",
          email: attributes.email,
          app_metadata: attributes.app_metadata,
        };
        users.set(user.id, user);
        profiles.add(user.id);
        return { data: { user }, error: null };
      },
    ),
    getUserById: vi.fn(async (id: string) => {
      const user = users.get(id);
      return user
        ? { data: { user }, error: null }
        : {
            data: { user: null },
            error: { status: 404, code: "user_not_found" },
          };
    }),
    deleteUser: vi.fn(async (id: string) => {
      users.delete(id);
      profiles.delete(id);
      return { data: {}, error: null };
    }),
  };
  return { auth, users, profiles };
}

describe("ambiguous fixture user creation", () => {
  it("recovers a committed user and profile when the creation response is lost", async () => {
    const fixture = fakeAuth();
    const create = fixture.auth.createUser.getMockImplementation()!;
    fixture.auth.createUser.mockImplementation(async (attributes) => {
      await create(attributes);
      throw new Error("Synthetic lost creation response");
    });
    const journal: object[] = [];
    await expect(
      createTrackedFixtureUser(fixture.auth, journal, reservation),
    ).rejects.toThrow("Synthetic lost creation response");

    let tenantRemoved = false;
    const failures = await runFixtureCleanup([
      ...fixtureAuthUserCleanupOperations(fixture.auth, journal),
      {
        label: "delete-tenant",
        run: async () => {
          if (fixture.profiles.size)
            throw new Error("Profile still owns tenant");
          tenantRemoved = true;
        },
      },
      {
        label: "census",
        run: async () => {
          expect(fixture.users.size).toBe(0);
          expect(fixture.profiles.size).toBe(0);
        },
      },
    ]);
    expect(failures).toEqual([]);
    expect(tenantRemoved).toBe(true);
    expect(fixture.auth.deleteUser).toHaveBeenCalledWith(reservation.id);
  });

  it("preserves an unrelated user when a reserved UUID collides", async () => {
    const fixture = fakeAuth();
    const unrelated = {
      id: reservation.id,
      email: reservation.email,
      app_metadata: {
        tenant_id: reservation.tenantId,
        sdk_qualification_run: "a-different-run",
      },
    };
    fixture.users.set(unrelated.id, unrelated);
    fixture.profiles.add(unrelated.id);
    fixture.auth.createUser.mockRejectedValue(new Error("UUID already exists"));
    const journal: object[] = [];
    await expect(
      createTrackedFixtureUser(fixture.auth, journal, reservation),
    ).rejects.toThrow();
    const failures = await runFixtureCleanup(
      fixtureAuthUserCleanupOperations(fixture.auth, journal),
    );
    expect(failures.length).toBeGreaterThan(0);
    expect(fixture.auth.deleteUser).not.toHaveBeenCalled();
    expect(fixture.users.get(unrelated.id)).toEqual(unrelated);
  });

  it("recovers a committed user when the SDK returns a retryable error result", async () => {
    const fixture = fakeAuth();
    const create = fixture.auth.createUser.getMockImplementation()!;
    fixture.auth.createUser.mockImplementation(async (attributes) => {
      await create(attributes);
      return { data: { user: null }, error: { status: 0 } };
    });
    const journal: object[] = [];
    const result = await createTrackedFixtureUser(
      fixture.auth,
      journal,
      reservation,
    );
    expect(result.error).toEqual({ status: 0 });
    const failures = await runFixtureCleanup(
      fixtureAuthUserCleanupOperations(fixture.auth, journal),
    );
    expect(failures).toEqual([]);
    expect(fixture.users.size).toBe(0);
    expect(fixture.profiles.size).toBe(0);
  });

  it("does not treat an immediate 404 after an ambiguous create as proven cleanup", async () => {
    const fixture = fakeAuth();
    fixture.auth.createUser.mockRejectedValue(new Error("Request timed out"));
    const journal: object[] = [];
    await expect(
      createTrackedFixtureUser(fixture.auth, journal, reservation),
    ).rejects.toThrow();
    const census = vi.fn();
    const failures = await runFixtureCleanup([
      ...fixtureAuthUserCleanupOperations(fixture.auth, journal),
      { label: "census", run: census },
    ]);
    expect(failures.length).toBeGreaterThan(0);
    expect(fixture.auth.deleteUser).not.toHaveBeenCalled();
    expect(census).toHaveBeenCalledOnce();
  });

  it("removes acknowledged users only after verifying their ownership", async () => {
    const fixture = fakeAuth();
    const journal: object[] = [];
    const result = await createTrackedFixtureUser(
      fixture.auth,
      journal,
      reservation,
    );
    expect(result.data.user.id).toBe(reservation.id);
    const failures = await runFixtureCleanup(
      fixtureAuthUserCleanupOperations(fixture.auth, journal),
    );
    expect(failures).toEqual([]);
    expect(fixture.auth.getUserById).toHaveBeenCalledWith(reservation.id);
    expect(fixture.users.size).toBe(0);
    expect(fixture.profiles.size).toBe(0);
  });
});
