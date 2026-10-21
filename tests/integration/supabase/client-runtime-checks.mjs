import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function assertLocalDockerEndpoint(endpoint) {
  assert.equal(typeof endpoint, "string", "Docker endpoint unavailable");
  const url = new URL(endpoint);
  const unix =
    url.protocol === "unix:" &&
    !url.host &&
    url.pathname.startsWith("/") &&
    !url.search &&
    !url.hash;
  const pipe = /^npipe:\/\/\/\/\.\/pipe\/[A-Za-z0-9._-]+$/.test(endpoint);
  assert.ok(unix || pipe, "A local Docker socket is required");
}

async function inspectLocalSupabaseContainers(projectId) {
  const options = { encoding: "utf8", timeout: 4_000, maxBuffer: 1024 * 1024 };
  let endpoint = process.env.DOCKER_HOST;
  if (!endpoint) {
    const result = await execFileAsync(
      "docker",
      ["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"],
      options,
    );
    endpoint = JSON.parse(result.stdout);
  }
  assertLocalDockerEndpoint(endpoint);
  const env = { ...process.env };
  for (const key of [
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_TLS_VERIFY",
    "DOCKER_CERT_PATH",
  ])
    delete env[key];
  const command = ["--host", endpoint];
  const result = await execFileAsync(
    "docker",
    [
      ...command,
      "ps",
      "--no-trunc",
      "--quiet",
      "--filter",
      `label=com.supabase.cli.project=${projectId}`,
    ],
    { ...options, env },
  );
  const ids = result.stdout.trim().split(/\s+/).filter(Boolean);
  assert.ok(
    ids.length <= 32 && ids.every((id) => /^[a-f0-9]{64}$/.test(id)),
    "Invalid local container discovery",
  );
  if (!ids.length) return { endpoint, containers: [] };
  // Project only public ownership/binding fields. Never inspect Env or mounts.
  const format =
    '{"id":{{json .Id}},"name":{{json .Name}},"running":{{json .State.Running}},"labels":{"com.supabase.cli.project":{{json (index .Config.Labels "com.supabase.cli.project")}}},"ports":{{json .NetworkSettings.Ports}}}';
  const inspected = await execFileAsync(
    "docker",
    [...command, "inspect", "--type", "container", "--format", format, ...ids],
    { ...options, env },
  );
  const containers = inspected.stdout.trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(containers.length, ids.length, "Incomplete local inspection");
  return { endpoint, containers };
}

export async function verifyLocalFixtureTarget(
  input,
  { inspect = inspectLocalSupabaseContainers } = {},
) {
  const url = new URL(input.API_URL);
  assert.ok(/^asym-modernization-[a-z0-9-]+$/.test(input.projectId));
  assert.equal(url.protocol, "http:");
  assert.ok(["127.0.0.1", "[::1]"].includes(url.hostname));
  assert.equal(url.username + url.password + url.search + url.hash, "");
  assert.ok(url.pathname === "/" && url.port);
  assert.ok(input.PUBLIC_KEY && input.SERVICE_ROLE_KEY);
  const { endpoint, containers } = await inspect(input.projectId);
  assertLocalDockerEndpoint(endpoint);
  assert.ok(Array.isArray(containers), "Malformed local inspection");
  const bindings =
    url.hostname === "127.0.0.1" ? ["127.0.0.1", "0.0.0.0"] : ["::1", "::"];
  const matching = containers.filter(
    (container) =>
      container?.running === true &&
      container.name === `/supabase_kong_${input.projectId}` &&
      container.labels?.["com.supabase.cli.project"] === input.projectId &&
      /^[a-f0-9]{64}$/.test(container.id) &&
      Array.isArray(container.ports?.["8000/tcp"]) &&
      container.ports["8000/tcp"].some(
        (binding) =>
          binding.HostPort === url.port && bindings.includes(binding.HostIp),
      ),
  );
  assert.equal(matching.length, 1, "API target is not the owned local gateway");
  return { url, containerId: matching[0].id };
}

export async function createTrackedFixtureUser(authAdmin, users, input) {
  const entry = { ...input, creationAcknowledged: false };
  users.push(entry);
  const result = await authAdmin.createUser({
    id: input.id,
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: {
      tenant_id: input.tenantId,
      sdk_qualification_run: input.runId,
    },
  });
  if (!result.error && result.data?.user) {
    entry.creationAcknowledged = true;
    const returnedId = result.data.user.id;
    if (returnedId !== input.id && /^[a-f0-9-]{36}$/.test(returnedId)) {
      // Retain a server-returned identity for guarded cleanup before failing.
      users.push({ ...entry, id: returnedId });
    }
    assert.equal(returnedId, input.id, "Fixture user identity changed");
  }
  return result;
}

export function fixtureAuthUserCleanupOperations(authAdmin, users) {
  const missing = (result) =>
    result.error?.status === 404 &&
    result.error?.code === "user_not_found" &&
    result.data?.user === null;
  return users.flatMap((user, index) => {
    let ownership = "unverified";
    return [
      {
        label: `verify-auth-user-${index + 1}`,
        run: async () => {
          const result = await authAdmin.getUserById(user.id);
          if (missing(result)) {
            // A timed-out create can still be in flight. Absence alone must
            // never turn an ambiguous write into a successful cleanup claim.
            assert.ok(user.creationAcknowledged, "Fixture creation unresolved");
            ownership = "absent";
            return;
          }
          assert.equal(result.error, null, "Fixture identity lookup failed");
          const actual = result.data?.user;
          assert.ok(
            actual?.id === user.id &&
              actual.email === user.email &&
              actual.app_metadata?.tenant_id === user.tenantId &&
              actual.app_metadata?.sdk_qualification_run === user.runId,
            "Fixture identity ownership mismatch",
          );
          ownership = "owned";
        },
      },
      {
        label: `delete-auth-user-${index + 1}`,
        run: async () => {
          assert.notEqual(
            ownership,
            "unverified",
            "Fixture identity unverified",
          );
          if (ownership === "absent") return;
          const result = await authAdmin.deleteUser(user.id);
          assert.ok(
            !result.error || missing(result),
            "Fixture cleanup request failed",
          );
        },
      },
      {
        label: `confirm-auth-user-absent-${index + 1}`,
        run: async () => {
          assert.notEqual(
            ownership,
            "unverified",
            "Fixture identity unverified",
          );
          assert.ok(
            missing(await authAdmin.getUserById(user.id)),
            "Fixture user remains",
          );
        },
      },
    ];
  });
}

export async function createTrackedFixtureRows(admin, journal, table, rows) {
  const entries = rows.map((row) => {
    let entry = journal.find(
      (candidate) => candidate.table === table && candidate.row.id === row.id,
    );
    if (!entry) {
      entry = {
        table,
        row: { ...row },
        creationAttempted: false,
        creationAcknowledged: false,
      };
      journal.push(entry);
    }
    entry.creationAttempted = true;
    return entry;
  });
  const result = await admin
    .from(table)
    .insert(entries.map((entry) => entry.row));
  if (!result.error)
    for (const entry of entries) entry.creationAcknowledged = true;
  return result;
}

export function fixtureTableCleanupOperations(admin, journal, table) {
  const columns = {
    tenants: ["id", "name", "slug"],
    funds: ["id", "name", "tenant_id"],
  }[table];
  assert.ok(columns, "Unsupported fixture table");
  return journal
    .filter(
      (entry) => entry.table === table && entry.creationAttempted === true,
    )
    .flatMap((entry, index) => {
      let ownership = "unverified";
      return [
        {
          label: `verify-${table}-${index + 1}`,
          run: async () => {
            const result = await admin
              .from(table)
              .select(columns.join(","))
              .eq("id", entry.row.id)
              .maybeSingle();
            assert.equal(result.error, null, "Fixture table lookup failed");
            if (result.data === null) {
              // A client timeout does not prove that the server write ended.
              // No absent row can resolve an unacknowledged creation.
              assert.ok(
                entry.creationAcknowledged,
                "Fixture table creation unresolved",
              );
              ownership = "absent";
              return;
            }
            assert.ok(
              columns.every(
                (column) =>
                  typeof entry.row[column] === "string" &&
                  result.data[column] === entry.row[column],
              ),
              "Fixture table ownership mismatch",
            );
            ownership = "owned";
          },
        },
        {
          label: `delete-${table}-${index + 1}`,
          run: async () => {
            assert.notEqual(
              ownership,
              "unverified",
              "Fixture table identity unverified",
            );
            if (ownership === "absent") return;
            const result = await admin
              .from(table)
              .delete()
              .eq("id", entry.row.id);
            assert.equal(result.error, null, "Fixture cleanup request failed");
          },
        },
        {
          label: `confirm-${table}-absent-${index + 1}`,
          run: async () => {
            assert.notEqual(
              ownership,
              "unverified",
              "Fixture table identity unverified",
            );
            const result = await admin
              .from(table)
              .select("id")
              .eq("id", entry.row.id)
              .maybeSingle();
            assert.equal(result.error, null, "Fixture absence lookup failed");
            assert.equal(result.data, null, "Fixture table row remains");
          },
        },
      ];
    });
}

export async function runFixtureCleanup(
  operations,
  { timeoutMs = 16_000 } = {},
) {
  const failures = [];
  for (const { label, run } of operations) {
    let timer;
    let expired = false;
    try {
      await Promise.race([
        Promise.resolve().then(run),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            expired = true;
            reject(new Error("Fixture cleanup deadline"));
          }, timeoutMs);
        }),
      ]);
    } catch {
      // Retain only repository-owned labels, never provider errors or identities.
      failures.push({ label, reason: expired ? "timeout" : "failed" });
    } finally {
      clearTimeout(timer);
    }
  }
  return failures;
}

export function isDeniedSelfRoleUpdate(result, persistedRole) {
  const denied = result.error
    ? result.status === 403 &&
      result.error.code === "42501" &&
      result.data === null
    : result.status === 200 &&
      Array.isArray(result.data) &&
      result.data.length === 0;
  return denied && persistedRole === "donor";
}
