import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { createServer, type AddressInfo } from "node:net";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import defaultConfig, {
  getDefaultProjectTestIgnore,
} from "../../../playwright.config";
import proofConfig from "../../../playwright.n2-on.config";
import {
  appEnvironment,
  assertPortsFree,
  emptyRestore,
  finish,
  freshSecrets,
  holdInterrupts,
  runProofSpecs,
  serveUntilStopped,
  waitForQuietMachine,
  waitForServer,
  waitForServers,
  watchServers,
  parseOptions,
  prepareRows,
  proofEnvironment,
  proofPorts,
  readProofSeed,
  restoreRows,
  scratchRowsSql,
  serverEnvironment,
  stackValuesFromStatus,
  type ProofDatabase,
  type ProofSeed,
} from "../../../scripts/e2e/run-n2-on-proof.mts";
import {
  ADMIN_SURFACE,
  defineBoneyardConfig,
  DONOR_SURFACE,
  MISSIONARY_SURFACE,
} from "../../e2e/playwright-shared";

const PROOF_SPECS = "**/n2-on-*.spec.ts";

const STATUS = [
  'API_URL="http://127.0.0.1:34201"',
  'ANON_KEY="anon"',
  'SERVICE_ROLE_KEY="service"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:34202/postgres"',
].join("\n");

describe("the on-mode proof runs only through its own command and configuration", () => {
  it("is ignored by the default configuration's projects that scan tests/e2e", () => {
    expect(getDefaultProjectTestIgnore(true)).toContain(PROOF_SPECS);
    expect(getDefaultProjectTestIgnore(false)).toContain(PROOF_SPECS);
    for (const project of defaultConfig.projects ?? []) {
      if (project.testMatch) {
        expect(JSON.stringify(project.testMatch), project.name).not.toMatch(
          /n2-on/,
        );
      } else {
        expect(project.testIgnore, project.name).toContain(PROOF_SPECS);
      }
    }
  });

  it.each([
    ["admin", ADMIN_SURFACE],
    ["donor", DONOR_SURFACE],
    ["missionary", MISSIONARY_SURFACE],
  ] as const)(
    "is ignored by the %s boneyard configuration",
    (_name, surface) => {
      expect(defineBoneyardConfig(surface, {}).testIgnore).toContain(
        PROOF_SPECS,
      );
    },
  );

  it("has a configuration of its own that runs nothing else, starts no server and is not retried", () => {
    expect(proofConfig.testMatch).toEqual([PROOF_SPECS]);
    expect(proofConfig.webServer).toBeUndefined();
    expect(proofConfig.workers).toBe(1);
    expect(proofConfig.retries).toBe(0);
  });

  it("is started only by its package script", () => {
    const scripts = (
      JSON.parse(
        readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
      ) as { scripts: Record<string, string> }
    ).scripts;
    expect(
      Object.entries(scripts).filter(([, command]) =>
        command.includes("n2-on"),
      ),
    ).toEqual([["test:e2e:n2-on", "node scripts/e2e/run-n2-on-proof.mts"]]);
  });
});

describe("the runner", () => {
  it("reads the local stack and refuses one that is not on this machine", () => {
    expect(stackValuesFromStatus(STATUS).dbUrl).toBe(
      "postgresql://postgres:postgres@127.0.0.1:34202/postgres",
    );
    expect(() =>
      stackValuesFromStatus(
        STATUS.replace("127.0.0.1:34202", "db.example.com:5432"),
      ),
    ).toThrow(/not on this machine/);
    expect(() =>
      stackValuesFromStatus(STATUS.replace("127.0.0.1:34201", "example.com")),
    ).toThrow(/not on this machine/);
    expect(() => stackValuesFromStatus("")).toThrow(/did not report/);
  });

  it("makes new keys for every run and hands each server only its own", () => {
    const first = freshSecrets();
    const second = freshSecrets();
    expect(first.adminStampKey).not.toBe(second.adminStampKey);
    expect(first.password).not.toBe(second.password);
    expect(first.adminStampKey).not.toBe(first.missionaryStampKey);
    const stack = stackValuesFromStatus(STATUS);
    const env = appEnvironment(stack, proofPorts({}), first, {});
    expect(env.CORE_SERVE_UNDER_PATHS).toBe("1");
    expect(Object.values(env)).not.toContain(first.adminStampKey);
    expect(Object.values(env)).not.toContain(first.missionaryStampKey);
    expect(serverEnvironment("admin", env, first).FRONT_STAMP_KEY).toBe(
      first.adminStampKey,
    );
    expect(serverEnvironment("missionary", env, first).FRONT_STAMP_KEY).toBe(
      first.missionaryStampKey,
    );
    expect(serverEnvironment("donor", env, first)).toMatchObject({
      FRONT_STAMP_KEY_ADMIN: first.adminStampKey,
      FRONT_STAMP_KEY_MISSIONARY: first.missionaryStampKey,
    });
    const proof = proofEnvironment(stack, proofPorts({}), first, {});
    expect(Object.values(proof)).not.toContain(first.adminStampKey);
    expect(Object.values(proof)).not.toContain(first.payloadSecret);
  });

  it("names the admin server's own address as its one operations name, and gives the proof that address", () => {
    const ports = proofPorts({});
    const secrets = freshSecrets();
    const stack = stackValuesFromStatus(STATUS);
    const env = appEnvironment(stack, ports, secrets, {});
    expect(serverEnvironment("admin", env, secrets).OPERATIONS_NAMES).toBe(
      `localhost:${ports.admin}`,
    );
    for (const app of ["donor", "missionary"] as const) {
      expect(serverEnvironment(app, env, secrets), app).not.toHaveProperty(
        "OPERATIONS_NAMES",
      );
    }
    expect(
      proofEnvironment(stack, ports, secrets, {}).N2_ON_OPERATIONS_URL,
    ).toBe(`http://localhost:${ports.admin}`);
  });

  it("gives the servers no list of names: the lookup admits them, as in production", () => {
    const env = appEnvironment(
      stackValuesFromStatus(STATUS),
      proofPorts({}),
      freshSecrets(),
      {},
    );
    expect(env).not.toHaveProperty("FRONT_NAMES");
    for (const app of ["donor", "admin", "missionary"] as const) {
      expect(
        serverEnvironment(app, env, freshSecrets()),
        app,
      ).not.toHaveProperty("FRONT_NAMES");
    }
  });

  it("adds only the person's own rows, and parses its options", () => {
    expect(scratchRowsSql(SEED)).toMatch(/^INSERT INTO authz\.memberships /);
    expect(scratchRowsSql(SEED)).toContain(
      "ON CONFLICT DO NOTHING RETURNING id",
    );
    expect(parseOptions(["--skip-build", "--", "--grep", "Q"])).toEqual({
      build: false,
      serveOnly: false,
      playwrightArgs: ["--grep", "Q"],
    });
    expect(() => parseOptions(["--fast"])).toThrow(/unknown option/);
  });
});

const SEED: ProofSeed = {
  tenantA: "a0000000-0000-4000-8000-00000000000a",
  tenantB: "b0000000-0000-4000-8000-00000000000b",
  personP: "c0000000-0000-4000-8000-00000000000c",
  personQ: "d0000000-0000-4000-8000-00000000000d",
};

describe("the runner names the seed's organizations and people by their slugs and e-mails, never by an ID", () => {
  it("holds no organization or person ID of its own", () => {
    const source = readFileSync(
      path.join(process.cwd(), "scripts/e2e/run-n2-on-proof.mts"),
      "utf8",
    );
    expect(source).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it("reads the two organizations by slug and the two people by e-mail from the scratch database", () => {
    const asked: string[] = [];
    const seed = readProofSeed((statement) => {
      asked.push(statement);
      return [SEED.tenantA, SEED.tenantB, SEED.personP, SEED.personQ].join("|");
    });
    expect(seed).toEqual(SEED);
    expect(asked.join("\n")).toContain("slug = 'give-hope-demo'");
    expect(asked.join("\n")).toContain("slug = 'harbor-light-mission'");
    expect(asked.join("\n")).toContain("email = 'demo-owner@givehope.test'");
    expect(asked.join("\n")).toContain("email = 'member-care@givehope.test'");
  });

  it("stops before any change when the scratch database lacks one of them", () => {
    expect(() =>
      readProofSeed(() =>
        [SEED.tenantA, "", SEED.personP, SEED.personQ].join("|"),
      ),
    ).toThrow(/harbor-light-mission/);
  });

  it("writes P's scratch rows for the organizations it read", () => {
    const statement = scratchRowsSql(SEED);
    expect(statement).toContain(
      `'${SEED.personP}', '${SEED.tenantA}', 'staff', 'finance'`,
    );
    expect(statement).toContain(
      `'${SEED.personP}', '${SEED.tenantB}', 'staff', 'development'`,
    );
    expect(statement).toContain(
      `'${SEED.personP}', '${SEED.tenantB}', 'missionary', NULL`,
    );
  });
});

describe("the runner never runs against a server it did not start (#2858 items 4 and 5)", () => {
  it("refuses a port another process holds, and passes a free one", async () => {
    const holder = createServer();
    await new Promise<void>((resolve) =>
      holder.listen(0, "localhost", () => resolve()),
    );
    const { port } = holder.address() as AddressInfo;
    await expect(assertPortsFree([port])).rejects.toThrow(
      new RegExp(`port ${port} is in use`),
    );
    await new Promise<void>((resolve) => holder.close(() => resolve()));
    await expect(assertPortsFree([port])).resolves.toBeUndefined();
  });

  it("reports a server that exits or fails to start", () => {
    const admin = new EventEmitter();
    const donor = new EventEmitter();
    const watch = watchServers([
      { name: "admin", process: admin },
      { name: "donor", process: donor },
    ]);
    expect(watch.failure()).toBeNull();
    admin.emit("exit", 1, null);
    expect(watch.failure()).toMatch(/admin exited \(code 1\)/);
    donor.emit("error", new Error("spawn ENOENT"));
    expect(watch.failure()).toMatch(/admin exited/);

    const missionary = new EventEmitter();
    const second = watchServers([{ name: "missionary", process: missionary }]);
    missionary.emit("error", new Error("spawn ENOENT"));
    expect(second.failure()).toMatch(
      /missionary could not start: spawn ENOENT/,
    );
  });

  it("stops waiting for a server as soon as one has failed", async () => {
    await expect(
      waitForServer(1, () => "admin exited (code 1)", 60_000),
    ).rejects.toThrow("admin exited (code 1)");
  });

  it("ends the wait for a quiet machine at once when the run is interrupted or a server fails", async () => {
    const busy = () => 99;
    const late = new Promise((resolve) => setTimeout(resolve, 2_000, "late"));
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    try {
      for (const stopped of [
        Promise.resolve("SIGINT"),
        new Promise((resolve) => setTimeout(resolve, 20, "admin exited")),
      ]) {
        const waited = waitForQuietMachine(10, stopped, busy).then(
          () => "ended",
        );
        await expect(Promise.race([waited, late])).resolves.toBe("ended");
      }
    } finally {
      write.mockRestore();
    }
  });

  it("waits for a quiet machine only where the load can be read, whatever system runs the test (#2845 item 7)", async () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    try {
      const never = new Promise(() => {});
      const late = new Promise((resolve) => setTimeout(resolve, 1_000, "late"));
      const elsewhere = waitForQuietMachine(
        10,
        never,
        () => 99,
        () => false,
      );
      await expect(
        Promise.race([elsewhere.then(() => "ended"), late]),
      ).resolves.toBe("ended");
      expect(write).not.toHaveBeenCalled();

      await waitForQuietMachine(
        10,
        Promise.resolve("SIGINT"),
        () => 99,
        () => true,
      );
      expect(write).toHaveBeenCalledWith(
        "[n2-on] one-minute load is at or above 10; waiting\n",
      );
    } finally {
      write.mockRestore();
    }
  });

  it("leaves the startup wait with 130 on a recorded interrupt, before any row is prepared (#2845 item 10)", async () => {
    const watch = watchServers([
      { name: "donor", process: new EventEmitter() },
    ]);
    const interrupted = { signal: () => "SIGINT" as NodeJS.Signals };
    const late = new Promise((resolve) => setTimeout(resolve, 1_000, "late"));
    await expect(
      Promise.race([waitForServers([1], watch, interrupted), late]),
    ).resolves.toBe(130);
  });

  it("runs the specs asynchronously, so an interrupt or a failed server stops them at once (#2845 item 9)", async () => {
    function fakeSpawn() {
      const child = Object.assign(new EventEmitter(), {
        kill: vi.fn(() => {
          setTimeout(() => child.emit("exit", null, "SIGTERM"), 0);
          return true;
        }),
      });
      return { child, spawn: vi.fn(() => child) };
    }
    const quiet = () =>
      watchServers([{ name: "admin", process: new EventEmitter() }]);
    const never = {
      wait: () => new Promise<NodeJS.Signals>(() => {}),
      signal: () => null,
    };

    const run = fakeSpawn();
    const interrupt = {
      wait: () => Promise.resolve("SIGINT" as NodeJS.Signals),
      signal: () => "SIGINT" as NodeJS.Signals,
    };
    await expect(
      runProofSpecs(["test"], {}, interrupt, quiet(), run.spawn),
    ).resolves.toBe(130);
    expect(run.child.kill).toHaveBeenCalledWith("SIGTERM");

    const failing = fakeSpawn();
    const server = new EventEmitter();
    const watch = watchServers([{ name: "missionary", process: server }]);
    setTimeout(() => server.emit("exit", 1, null), 10);
    await expect(
      runProofSpecs(["test"], {}, never, watch, failing.spawn),
    ).rejects.toThrow(/missionary exited \(code 1\)/);
    expect(failing.child.kill).toHaveBeenCalledWith("SIGTERM");

    const passing = fakeSpawn();
    setTimeout(() => passing.child.emit("exit", 0, null), 10);
    await expect(
      runProofSpecs(["test"], {}, never, quiet(), passing.spawn),
    ).resolves.toBe(0);
    expect(passing.child.kill).not.toHaveBeenCalled();
  });

  it("tells a waiter at once when a watched server fails", async () => {
    const donor = new EventEmitter();
    const watch = watchServers([{ name: "donor", process: donor }]);
    setTimeout(() => donor.emit("exit", 1, null), 10);
    await expect(watch.failed()).resolves.toMatch(/donor exited \(code 1\)/);
  });

  it("stops serving with a failing exit as soon as a watched server dies, and ends cleanly on an interrupt", async () => {
    const admin = new EventEmitter();
    const watch = watchServers([{ name: "admin", process: admin }]);
    const never = { wait: () => new Promise<NodeJS.Signals>(() => {}) };
    setTimeout(() => admin.emit("exit", null, "SIGKILL"), 10);
    await expect(serveUntilStopped(never, watch)).rejects.toThrow(
      /admin exited \(code SIGKILL\)/,
    );

    const quiet = watchServers([
      { name: "missionary", process: new EventEmitter() },
    ]);
    const interrupted = {
      wait: () => Promise.resolve("SIGINT" as NodeJS.Signals),
    };
    await expect(serveUntilStopped(interrupted, quiet)).resolves.toBe(0);
  });

  it("holds an interrupt until the restore has run, and then lets it go", () => {
    const before = process.listenerCount("SIGINT");
    const hold = holdInterrupts();
    expect(process.listenerCount("SIGINT")).toBe(before + 1);
    process.emit("SIGINT");
    expect(hold.signal()).toBe("SIGINT");
    hold.release();
    expect(process.listenerCount("SIGINT")).toBe(before);
  });
});

function fakeDatabase(failPasswordFor: string | null) {
  const statements: string[] = [];
  const passwordsSet: string[] = [];
  const database: ProofDatabase = {
    query(statement) {
      statements.push(statement);
      if (statement.startsWith("SELECT id || '|' || encrypted_password")) {
        return `${SEED.personP}|hash-p\n${SEED.personQ}|hash-q`;
      }
      if (statement.startsWith("INSERT INTO authz.memberships")) {
        return "row-1\nrow-2\nrow-3";
      }
      return "";
    },
    async setPassword(userId) {
      if (userId === failPasswordFor) {
        throw new Error("could not set the proof's password (500)");
      }
      passwordsSet.push(userId);
    },
  };
  return { database, statements, passwordsSet };
}

describe("the runner can always put back what it changed", () => {
  it("holds the passwords and rows to restore before its first change, so a setup that fails half way is restored", async () => {
    const { database, statements, passwordsSet } = fakeDatabase(SEED.personQ);
    const restore = emptyRestore();
    await expect(
      prepareRows(database, SEED, "N2on-test", restore),
    ).rejects.toThrow(/password/);
    expect(passwordsSet).toEqual([SEED.personP]);
    expect(restore).toEqual({
      scratchRowIds: ["row-1", "row-2", "row-3"],
      passwordHashes: [
        [SEED.personP, "hash-p"],
        [SEED.personQ, "hash-q"],
      ],
    });
    expect(statements[0]).toMatch(
      /^SELECT id \|\| '\|' \|\| encrypted_password/,
    );

    restoreRows(database, restore);
    const restored = statements.slice(2).join("\n");
    expect(restored).toContain(
      "DELETE FROM authz.memberships WHERE id IN ('row-1', 'row-2', 'row-3')",
    );
    expect(restored).toContain(
      `SET encrypted_password = 'hash-p' WHERE id = '${SEED.personP}'`,
    );
    expect(restored).toContain(
      `SET encrypted_password = 'hash-q' WHERE id = '${SEED.personQ}'`,
    );
  });

  it("stops its servers when restoring throws, and still fails", () => {
    const stop = vi.fn();
    expect(() =>
      finish(() => {
        throw new Error("restore failed");
      }, stop),
    ).toThrow("restore failed");
    expect(stop).toHaveBeenCalledOnce();
  });

  it("stops its servers after restoring when nothing throws", () => {
    const order: string[] = [];
    finish(
      () => order.push("restore"),
      () => order.push("stop"),
    );
    expect(order).toEqual(["restore", "stop"]);
  });
});
