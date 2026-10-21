import { describe, expect, it, vi } from "vitest";

import {
  createTrackedFixtureUser,
  fixtureAuthUserCleanupOperations,
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
    ).rejects.toThrow();
  });

  it.each(["ssh://example.invalid", "tcp://127.0.0.1:2375"])(
    "rejects a remote or proxyable daemon: %s",
    async (endpoint) => {
      await expect(
        verifyLocalFixtureTarget(target, {
          inspect: async () => ({ endpoint, containers: [kong] }),
        }),
      ).rejects.toThrow();
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
    ).rejects.toThrow();
  });

  it("fails closed when Docker cannot provide independent evidence", async () => {
    await expect(
      verifyLocalFixtureTarget(target, {
        inspect: async () => {
          throw new Error("Synthetic Docker failure");
        },
      }),
    ).rejects.toThrow();
  });
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
