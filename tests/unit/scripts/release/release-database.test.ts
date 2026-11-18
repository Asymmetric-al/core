import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { resolveCmsMigrationDatabaseUrl } from "../../../../scripts/cms/lib/migration-connection.mjs";
import { assertCmsMigrationTarget } from "../../../../scripts/cms/lib/migration-target.mjs";
import { listSourceMigrations } from "../../../../scripts/release/migration-heads.mjs";
import {
  HOSTED_DEFAULT_PRIVILEGES,
  RELEASE_ENVIRONMENTS,
  ROLE_LOGIN_VERIFICATION,
  ReleaseStop,
  migrate,
  payloadMigrate,
  preflight,
  pinnedSupabaseCliVersion,
  readReleaseSettings,
  rebuild,
  recordHeads,
  repairSeededLoginPasswords,
  roleDatabaseUrl,
  setCmsRolePasswords,
  setEnvironmentMarker,
} from "../../../../scripts/release/release-database.mjs";

const ref = "abcdefghijklmnopqrst";
const databaseUrl = `postgresql://postgres.${ref}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`;
const source = listSourceMigrations({ root: process.cwd() });
const CA = "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----";
// The platform's default privileges, read from their one file (WP1.6).
const DEFAULTS_SQL = readFileSync(HOSTED_DEFAULT_PRIVILEGES, "utf8");

function settings(environment: "production" | "preview" = "production") {
  return readReleaseSettings({
    RELEASE_ENVIRONMENT: environment,
    RELEASE_SUPABASE_PROJECT_REF: ref,
    RELEASE_DATABASE_URL: databaseUrl,
    RELEASE_CMS_OWNER_PASSWORD: "owner-password-fixture",
    RELEASE_DATABASE_SSL_CA: CA,
  });
}

describe("release settings", () => {
  it("derives the cms_owner login on the same pooler host from the job's connection", () => {
    const url = new URL(settings().cmsOwnerDatabaseUrl!);
    expect(url.username).toBe(`cms_owner.${ref}`);
    expect(url.password).toBe("owner-password-fixture");
    expect(url.host).toBe("aws-0-us-east-1.pooler.supabase.com:5432");
    // Council round 2, A6a: Payload verifies the pooler against the
    // project's CA (node-postgres reads require as full verification against
    // Node's own store, which lacks Supabase's CA).
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(
      roleDatabaseUrl(
        `postgresql://postgres:pw@db.${ref}.supabase.co:5432/postgres?sslmode=require`,
        "cms_runtime",
        "p@ss/word",
      ),
    ).toBe(
      `postgresql://cms_runtime:p%40ss%2Fword@db.${ref}.supabase.co:5432/postgres?sslmode=require`,
    );
  });
});

/** A fake target database answering the queries the release steps send. */
function fakeDatabase(state: {
  defaultsFail?: string;
  healthFunction?: boolean;
  environment?: string | null;
  supabase?: string[];
  payload?: string[];
  devMarker?: boolean;
  heads?: { supabase: string | null; payload: string | null };
  /** Logins the replacement leaves with a published password. */
  publishedLeft?: number;
  /** Logins that carry a published password now (preflight reads it). */
  publishedLogins?: number;
  /** The replacement's query fails with this message. */
  replacementFails?: string;
  /**
   * CMS roles whose secret already logs in. By default none does, as on a
   * database the role migration has just made: the roles have no password,
   * so the step refuses the first login and sets one (WP1.6).
   */
  cmsLogins?: string[];
}) {
  const db = {
    healthFunction: true,
    environment: "disposable" as string | null,
    supabase: [...source.supabase],
    payload: [...source.payload],
    devMarker: false,
    publishedLeft: 0,
    publishedLogins: 0,
    replacementFails: undefined as string | undefined,
    defaultsFail: undefined as string | undefined,
    cmsLogins: [] as string[],
    heads: { supabase: null, payload: null } as {
      supabase: string | null;
      payload: string | null;
    },
    ...state,
  };
  const events: string[] = [];
  const query = vi.fn(
    ({ sql, databaseUrl }: { sql: string; databaseUrl: string }) => {
      if (sql.includes("to_regprocedure")) return { exists: db.healthFunction };
      if (sql.includes("public.platform_health()::text")) {
        return {
          environment: db.environment,
          expected_heads: Object.fromEntries(
            Object.entries(db.heads).filter(([, head]) => head !== null),
          ),
        };
      }
      if (sql.includes("'supabase', to_regclass"))
        return { supabase: true, payload: true };
      if (sql.includes("FROM supabase_migrations.schema_migrations"))
        return db.supabase;
      if (sql.includes("FROM cms.payload_migrations")) {
        return { names: db.payload, devMarker: db.devMarker };
      }
      if (sql.includes("FROM pg_roles")) return ["cms_owner", "cms_runtime"];
      if (sql.includes("UPDATE auth.users")) {
        events.push("seeded logins");
        if (db.replacementFails) throw new Error(db.replacementFails);
        db.publishedLogins = db.publishedLeft ?? 0;
        return { seeded_logins: 1, published: db.publishedLeft ?? 0 };
      }
      if (sql.includes("'published_logins'"))
        return { published_logins: db.publishedLogins };
      if (sql.includes("current_user")) {
        const user = decodeURIComponent(new URL(databaseUrl).username).split(
          ".",
        )[0]!;
        if (user.startsWith("cms_") && !db.cmsLogins.includes(user)) {
          throw new Error(
            `log in as ${user}: psql exited 2. psql: error: FATAL:  password authentication failed for user "${user}"`,
          );
        }
        return { user };
      }
      throw new Error(`unexpected query: ${sql.slice(0, 80)}`);
    },
  );
  const run = vi.fn(
    ({
      variables = {},
      sql,
    }: {
      databaseUrl?: string;
      variables?: Record<string, string>;
      sql?: string;
    }) => {
      if (sql === DEFAULTS_SQL) {
        events.push("default privileges");
        if (db.defaultsFail) throw new Error(db.defaultsFail);
      }
      if ("RELEASE_ROLE_VERIFIER" in variables) {
        events.push("role password");
        const role = /ALTER ROLE (\w+)/.exec(sql ?? "")?.[1];
        if (role) db.cmsLogins.push(role);
      }
      if ("RELEASE_HEAD" in variables) {
        db.heads = {
          ...db.heads,
          [variables.RELEASE_LEDGER as "supabase" | "payload"]:
            variables.RELEASE_HEAD,
        };
      }
      if ("RELEASE_MARKER" in variables)
        db.environment = variables.RELEASE_MARKER;
      return "";
    },
  );
  return { db, query, run, events };
}

const passwords = {
  RELEASE_CMS_OWNER_PASSWORD: "o".repeat(40),
  RELEASE_CMS_RUNTIME_PASSWORD: "r".repeat(40),
  RELEASE_SEED_LOGIN_PASSWORD: "s".repeat(40),
};

const silent = () => {};

describe("release database steps", () => {
  it("stops before migrating, and so before deploying, when a release carries an out-of-order migration", () => {
    const head = source.supabase.at(-1)!;
    const { query } = fakeDatabase({
      // The database already holds a newer migration than one source still lacks.
      supabase: [
        ...source.supabase.filter((v) => v !== source.supabase[5]),
        "29991231000000",
      ],
    });
    const runCommand = vi.fn();
    expect(() =>
      migrate({ settings: settings(), query, runCommand, log: silent }),
    ).toThrow(/out of order/);
    expect(runCommand).not.toHaveBeenCalled();
    expect(head).toMatch(/^\d{14}$/);
  });

  it("refuses a database with no health function, no marker, or, in the production environment, the preview project", () => {
    expect(() =>
      preflight({
        settings: settings(),
        query: fakeDatabase({ healthFunction: false }).query,
        log: silent,
      }),
    ).toThrow(/predates WP1/);
    expect(() =>
      preflight({
        settings: settings(),
        query: fakeDatabase({ environment: null }).query,
        log: silent,
      }),
    ).toThrow(/no environment marker/);
    const frozen = readReleaseSettings({
      RELEASE_ENVIRONMENT: "production",
      RELEASE_SUPABASE_PROJECT_REF: "btewedpsxwsjczvmegby",
      RELEASE_DATABASE_URL: databaseUrl.replace(ref, "btewedpsxwsjczvmegby"),
    });
    expect(() =>
      preflight({
        settings: frozen,
        query: fakeDatabase({}).query,
        log: silent,
      }),
    ).toThrow(/must not touch/);
  });

  it("keeps the preview environment off development whatever its configuration says", async () => {
    expect(RELEASE_ENVIRONMENTS.preview.forbiddenRefs).toContain(
      "pnmlrbgjiqzzsthsoikm",
    );
    const development = readReleaseSettings({
      RELEASE_ENVIRONMENT: "preview",
      RELEASE_SUPABASE_PROJECT_REF: "pnmlrbgjiqzzsthsoikm",
      RELEASE_DATABASE_URL: databaseUrl.replace(ref, "pnmlrbgjiqzzsthsoikm"),
    });
    const runCommand = vi.fn();
    const requireDisposable = vi.fn();
    await expect(
      rebuild({
        settings: development,
        mode: "disposable",
        confirmation: "rebuild pnmlrbgjiqzzsthsoikm",
        query: fakeDatabase({}).query,
        runCommand,
        requireDisposable,
        log: silent,
      }),
    ).rejects.toThrow(/must not touch/);
    expect(requireDisposable).not.toHaveBeenCalled();
    expect(runCommand).not.toHaveBeenCalled();
  });

  it("lets the preview environment rebuild the preview project, and still keeps the production environment off it", async () => {
    // Two hosted projects and no third (hosted plan 3.1): the production-named
    // project is the disposable preview project until WP11.
    const previewRef = "btewedpsxwsjczvmegby";
    expect(RELEASE_ENVIRONMENTS.preview.forbiddenRefs).toEqual([
      "pnmlrbgjiqzzsthsoikm",
    ]);
    expect(RELEASE_ENVIRONMENTS.production.forbiddenRefs).toEqual([previewRef]);
    const previewProject = (environment: "production" | "preview") =>
      readReleaseSettings({
        RELEASE_ENVIRONMENT: environment,
        RELEASE_SUPABASE_PROJECT_REF: previewRef,
        RELEASE_DATABASE_URL: databaseUrl.replace(ref, previewRef),
        RELEASE_CMS_OWNER_PASSWORD: "owner-password-fixture",
        RELEASE_DATABASE_SSL_CA: CA,
      });
    const signoff =
      "https://github.com/Asymmetric-al/core/issues/2671#issuecomment-1";

    // Its one-off first rebuild runs in the preview environment.
    const fake = fakeDatabase({ environment: null });
    const order: string[] = [];
    const runCommand = vi.fn((command: string, args: string[]) => {
      if (command === "supabase" && args[0] === "--version")
        return { status: 0, stdout: `${pinnedSupabaseCliVersion()}\n` };
      if (command === "supabase") {
        fake.db.environment = "disposable";
        order.push("direct reset");
      } else {
        order.push(command === "bun" ? "payload" : command);
      }
      return { status: 0 };
    });
    await rebuild({
      settings: previewProject("preview"),
      mode: "first",
      signoff,
      confirmation: `rebuild ${previewRef}`,
      env: passwords,
      query: fake.query,
      run: fake.run,
      runCommand,
      log: silent,
    });
    expect(order).toEqual(["direct reset", "payload"]);
    expect(() =>
      preflight({
        settings: previewProject("preview"),
        query: fakeDatabase({}).query,
        log: silent,
      }),
    ).not.toThrow();

    // The production environment refuses it before anything runs.
    const refused = vi.fn();
    await expect(
      rebuild({
        settings: previewProject("production"),
        mode: "first",
        signoff,
        confirmation: `rebuild ${previewRef}`,
        env: passwords,
        query: fakeDatabase({ environment: null }).query,
        runCommand: refused,
        log: silent,
      }),
    ).rejects.toThrow(/must not touch/);
    expect(refused).not.toHaveBeenCalled();
  });

  it("resets only where WP1.1's shared rule finds the disposable marker, and never in the production environment", async () => {
    const runCommand = vi.fn(() => ({ status: 0 }));
    const refuse = vi.fn(() => {
      throw new Error(
        "refusing to rebuild the preview database db:5432/postgres: it is marked shared",
      );
    });
    await expect(
      rebuild({
        settings: settings("preview"),
        mode: "disposable",
        confirmation: `rebuild ${ref}`,
        query: fakeDatabase({ environment: "shared" }).query,
        runCommand,
        requireDisposable: refuse,
        log: silent,
      }),
    ).rejects.toThrow(/is marked shared/);
    expect(refuse).toHaveBeenCalledWith({
      databaseUrl: settings("preview").databaseUrl,
      action: "rebuild the preview database",
    });
    await expect(
      rebuild({
        settings: settings("production"),
        mode: "disposable",
        confirmation: `rebuild ${ref}`,
        query: fakeDatabase({}).query,
        runCommand,
        requireDisposable: vi.fn(),
        log: silent,
      }),
    ).rejects.toThrow(/never resets/);
    expect(runCommand).not.toHaveBeenCalled();
  });

  it("rebuilds a disposable preview database: reset, seeded logins, role passwords, Payload, then checks the marker", async () => {
    const fake = fakeDatabase({});
    const order = fake.events;
    const runCommand = vi.fn((command: string, args: string[]) => {
      order.push(command === "bun" ? "payload" : args.slice(1, 3).join(" "));
      return { status: 0 };
    });
    await rebuild({
      settings: settings("preview"),
      mode: "disposable",
      confirmation: `rebuild ${ref}`,
      env: passwords,
      query: fake.query,
      // The fake's run records "role password" in the same order and lets the
      // fresh role's login succeed once its password is set (WP1.6).
      run: fake.run,
      runCommand,
      requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
      log: silent,
    });
    expect(order).toEqual([
      "default privileges",
      "db reset",
      "seeded logins",
      "role password",
      "role password",
      "payload",
    ]);
  });

  // WP1.6, the second rebuild of the preview project: a hosted reset keeps
  // the default privileges postgres holds in public, so a rebuild started
  // from the previous chain's end state, not where a fresh project starts.
  it.each(["first", "disposable"] as const)(
    "%s rebuild: puts the platform's default privileges back, from their one file, before the reset",
    async (mode) => {
      const fake = fakeDatabase({
        environment: mode === "first" ? null : "disposable",
      });
      const runCommand = vi.fn((command: string, args: string[]) => {
        if (command === "supabase" && args[0] === "--version")
          return { status: 0, stdout: `${pinnedSupabaseCliVersion()}\n` };
        if (args.includes("reset")) {
          fake.events.push("reset");
          fake.db.environment = "disposable";
        }
        return { status: 0 };
      });
      await rebuild({
        settings: settings(mode === "first" ? "production" : "preview"),
        mode,
        signoff: "https://github.com/Asymmetric-al/core/issues/1",
        confirmation: `rebuild ${ref}`,
        env: passwords,
        query: fake.query,
        run: fake.run,
        runCommand,
        requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
        log: silent,
      });
      expect(fake.events.slice(0, 2)).toEqual(["default privileges", "reset"]);
      const applied = fake.run.mock.calls.filter(
        ([call]) => call.sql === DEFAULTS_SQL,
      );
      expect(applied).toHaveLength(1);
      expect(applied[0]![0]).toMatchObject({ databaseUrl });
    },
  );

  it.each(["first", "disposable"] as const)(
    "%s rebuild: stops, and resets nothing, when the default privileges cannot be put back",
    async (mode) => {
      const fake = fakeDatabase({
        environment: mode === "first" ? null : "disposable",
        defaultsFail: "permission denied for schema public",
      });
      const runCommand = vi.fn((command: string, args: string[]) =>
        command === "supabase" && args[0] === "--version"
          ? { status: 0, stdout: `${pinnedSupabaseCliVersion()}\n` }
          : { status: 0 },
      );
      await expect(
        rebuild({
          settings: settings(mode === "first" ? "production" : "preview"),
          mode,
          signoff: "https://github.com/Asymmetric-al/core/issues/1",
          confirmation: `rebuild ${ref}`,
          env: passwords,
          query: fake.query,
          run: fake.run,
          runCommand,
          requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
          log: silent,
        }),
      ).rejects.toThrow(
        /default privileges could not be put back.*permission denied for schema public.*nothing was reset/s,
      );
      expect(
        runCommand.mock.calls.some(([, args]) => args.includes("reset")),
      ).toBe(false);
      expect(fake.events).toEqual(["default privileges"]);
    },
  );

  // Council round 2, A5 (record D-24): a hosted database never carries a
  // password published in the repository.
  it.each(["first", "disposable"] as const)(
    "%s rebuild: stops before it resets anything when RELEASE_SEED_LOGIN_PASSWORD is missing or weak",
    async (mode) => {
      for (const seed of [undefined, "", "demo-password", "x".repeat(73)]) {
        const fake = fakeDatabase({
          environment: mode === "first" ? null : "disposable",
        });
        const runCommand = vi.fn(() => ({ status: 0 }));
        await expect(
          rebuild({
            settings: settings(mode === "first" ? "production" : "preview"),
            mode,
            signoff: "https://github.com/Asymmetric-al/core/issues/1",
            confirmation: `rebuild ${ref}`,
            env: { ...passwords, RELEASE_SEED_LOGIN_PASSWORD: seed },
            query: fake.query,
            run: fake.run,
            runCommand,
            requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
            log: silent,
          }),
        ).rejects.toThrow(/RELEASE_SEED_LOGIN_PASSWORD .*nothing was reset/);
        expect(runCommand).not.toHaveBeenCalled();
        expect(fake.run).not.toHaveBeenCalled();
      }
    },
  );

  it("replaces every seeded login's published password right after the reset, sending only a verifier", async () => {
    const fake = fakeDatabase({});
    const logs: string[] = [];
    await rebuild({
      settings: settings("preview"),
      mode: "disposable",
      confirmation: `rebuild ${ref}`,
      env: passwords,
      query: fake.query,
      run: fake.run,
      runCommand: vi.fn(() => ({ status: 0 })),
      requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
      log: (line: string) => logs.push(line),
    });
    const call = fake.query.mock.calls.find(([options]) =>
      options.sql.includes("UPDATE auth.users"),
    )![0] as { sql: string; variables: Record<string, string> };
    expect(call.variables.RELEASE_LOGIN_VERIFIER).toMatch(
      /^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,
    );
    // The seed's published password is matched on the server; the new one
    // appears nowhere but inside its verifier.
    expect(JSON.parse(call.variables.RELEASE_PUBLISHED_PASSWORDS!)).toEqual([
      "demo-password",
    ]);
    const secret = passwords.RELEASE_SEED_LOGIN_PASSWORD;
    expect(call.sql).not.toContain(secret);
    expect(JSON.stringify(call.variables)).not.toContain(secret);
    expect(logs.join("\n")).not.toContain(secret);
    expect(logs.join("\n")).toContain("seeded login");
  });

  it("stops, before the role passwords and Payload, when a login still carries a published password", async () => {
    const fake = fakeDatabase({ publishedLeft: 1 });
    const runCommand = vi.fn(() => ({ status: 0 }));
    await expect(
      rebuild({
        settings: settings("preview"),
        mode: "disposable",
        confirmation: `rebuild ${ref}`,
        env: passwords,
        query: fake.query,
        run: fake.run,
        runCommand,
        requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
        log: silent,
      }),
    ).rejects.toThrow(/still carry a password published in the repository/);
    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(fake.run.mock.calls.map(([call]) => call.sql)).toEqual([
      DEFAULTS_SQL,
    ]);
  });

  // Council round 3, lens 2 I2: a rebuild that fails between its seed and the
  // replacement must not leave the published password live with no repair.
  const pinnedCli = (command: string, args: string[]) =>
    command === "supabase" && args[0] === "--version"
      ? { status: 0, stdout: `${pinnedSupabaseCliVersion()}\n` }
      : null;

  it.each(["first", "disposable"] as const)(
    "%s rebuild: a reset that fails after seeding still replaces the seeded logins' password, then fails",
    async (mode) => {
      const fake = fakeDatabase({
        environment: mode === "first" ? null : "disposable",
      });
      const runCommand = vi.fn((command: string, args: string[]) => {
        const probe = pinnedCli(command, args);
        if (probe) return probe;
        // The reset seeded the logins and then failed.
        fake.db.publishedLogins = 1;
        return { status: 1 };
      });
      await expect(
        rebuild({
          settings: settings(mode === "first" ? "production" : "preview"),
          mode,
          signoff: "https://github.com/Asymmetric-al/core/issues/1",
          confirmation: `rebuild ${ref}`,
          env: passwords,
          query: fake.query,
          run: fake.run,
          runCommand,
          requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
          log: silent,
        }),
      ).rejects.toThrow(/reset.* failed \(exit 1\)/);
      expect(fake.events).toEqual(["default privileges", "seeded logins"]);
      expect(fake.db.publishedLogins).toBe(0);
      expect(fake.run.mock.calls.map(([call]) => call.sql)).toEqual([
        DEFAULTS_SQL,
      ]);
    },
  );

  it.each([
    [
      "the replacement is refused",
      { replacementFails: "permission denied for table users" },
    ],
    ["logins still carry the password afterwards", { publishedLeft: 1 }],
  ])(
    "when %s, the rebuild says seeded logins may keep the published password and how to repair it",
    async (_name, state) => {
      for (const resetStatus of [0, 1]) {
        const fake = fakeDatabase(state);
        const runCommand = vi.fn(() => ({ status: resetStatus }));
        const failure = rebuild({
          settings: settings("preview"),
          mode: "disposable",
          confirmation: `rebuild ${ref}`,
          env: passwords,
          query: fake.query,
          run: fake.run,
          runCommand,
          requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
          log: silent,
        });
        await expect(failure).rejects.toThrow(
          /may still carry the password published in the repository.*do not use the database.*replace-seeded-login-passwords/s,
        );
        if (resetStatus)
          await expect(failure).rejects.toThrow(/The reset failed/);
        expect(fake.run.mock.calls.map(([call]) => call.sql)).toEqual([
          DEFAULTS_SQL,
        ]);
      }
    },
  );

  it("stops a release, before it migrates anything, on a database whose logins carry a published password", () => {
    const fake = fakeDatabase({ publishedLogins: 2 });
    const runCommand = vi.fn();
    expect(() =>
      migrate({
        settings: settings(),
        env: passwords,
        query: fake.query,
        run: fake.run,
        runCommand,
        log: silent,
      }),
    ).toThrow(
      /2 login\(s\) carry a password published in the repository.*replace-seeded-login-passwords/s,
    );
    expect(runCommand).not.toHaveBeenCalled();
    expect(fake.run).not.toHaveBeenCalled();
  });

  it("repairs such a database with the replace-seeded-login-passwords operation, after which a release passes preflight", () => {
    const fake = fakeDatabase({ publishedLogins: 1 });
    expect(() =>
      preflight({ settings: settings(), query: fake.query, log: silent }),
    ).toThrow(/carry a password published in the repository/);
    for (const seed of [undefined, "demo-password"])
      expect(() =>
        repairSeededLoginPasswords({
          settings: settings(),
          env: { RELEASE_SEED_LOGIN_PASSWORD: seed },
          query: fake.query,
          log: silent,
        }),
      ).toThrow(/RELEASE_SEED_LOGIN_PASSWORD must be 32 to 72/);
    expect(fake.events).toEqual([]);
    expect(
      repairSeededLoginPasswords({
        settings: settings(),
        env: passwords,
        query: fake.query,
        log: silent,
      }),
    ).toEqual({ seeded_logins: 1, published: 0 });
    expect(fake.events).toEqual(["seeded logins"]);
    expect(
      preflight({ settings: settings(), query: fake.query, log: silent }),
    ).toMatchObject({ marker: "disposable" });
  });

  it("resets a disposable preview database through the repository wrapper, never the direct CLI", async () => {
    const fake = fakeDatabase({});
    const commands: string[][] = [];
    await rebuild({
      settings: settings("preview"),
      mode: "disposable",
      confirmation: `rebuild ${ref}`,
      env: passwords,
      query: fake.query,
      run: fake.run,
      runCommand: vi.fn((command: string, args: string[]) => {
        commands.push([command, ...args.slice(0, 3)]);
        return { status: 0 };
      }),
      requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
      log: silent,
    });
    expect(commands[0]).toEqual([
      process.execPath,
      "scripts/supabase-cli.mjs",
      "db",
      "reset",
    ]);
    expect(commands.some(([command]) => command === "npx")).toBe(false);
  });

  it("first rebuild: resets an unmarked database with the pinned CLI directly, the one exception to the wrapper's reset rule", async () => {
    const fake = fakeDatabase({ environment: null });
    const order: string[] = [];
    const runCommand = vi.fn((command: string, args: string[]) => {
      // AL-2674 A10: the CLI the workflow installed, never npx, which stops
      // on the root package.json's overrides inside the repository.
      expect(command).not.toBe("npx");
      if (command === "supabase" && args[0] === "--version")
        return { status: 0, stdout: `${pinnedSupabaseCliVersion()}\n` };
      if (command === "supabase") {
        expect(args.slice(0, 2)).toEqual(["db", "reset"]);
        expect(args).toContain("--yes");
        // The migrations write the marker on the emptied database.
        fake.db.environment = "disposable";
        order.push("direct reset");
      } else {
        expect(args).not.toContain("scripts/supabase-cli.mjs");
        order.push(command === "bun" ? "payload" : command);
      }
      return { status: 0 };
    });
    await rebuild({
      settings: settings(),
      mode: "first",
      signoff:
        "https://github.com/Asymmetric-al/core/issues/2690#issuecomment-1",
      confirmation: `rebuild ${ref}`,
      env: passwords,
      query: fake.query,
      run: fake.run,
      runCommand,
      requireDisposable: vi.fn(() => {
        throw new Error(
          "the first rebuild must not ask for the disposable marker",
        );
      }),
      log: silent,
    });
    expect(order).toEqual(["direct reset", "payload"]);
    expect(pinnedSupabaseCliVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each([
    ["another version", { status: 0, stdout: "2.119.0\n" }, "2.119.0"],
    ["no CLI", { status: null, error: new Error("ENOENT") }, "none"],
  ])(
    "first rebuild: stops before it resets anything when the PATH has %s instead of the pinned CLI",
    async (_name, probe, found) => {
      const fake = fakeDatabase({ environment: null });
      const runCommand = vi.fn((_command: string, args: string[]) =>
        args[0] === "--version" ? probe : { status: 0 },
      );
      await expect(
        rebuild({
          settings: settings(),
          mode: "first",
          signoff:
            "https://github.com/Asymmetric-al/core/issues/2690#issuecomment-1",
          confirmation: `rebuild ${ref}`,
          env: passwords,
          query: fake.query,
          run: fake.run,
          runCommand,
          log: silent,
        }),
      ).rejects.toThrow(
        `needs the Supabase CLI ${pinnedSupabaseCliVersion()} on the PATH (found ${found})`,
      );
      expect(runCommand).toHaveBeenCalledTimes(1);
      expect(fake.run).not.toHaveBeenCalled();
    },
  );

  it("stops loudly, before the role passwords and Payload, when the migrations leave no disposable marker", async () => {
    for (const [mode, start, signoff] of [
      ["first", null, "https://github.com/Asymmetric-al/core/issues/1"],
      ["disposable", "disposable", undefined],
    ] as const) {
      const fake = fakeDatabase({ environment: start });
      const commands: string[] = [];
      await expect(
        rebuild({
          settings: settings(mode === "first" ? "production" : "preview"),
          mode,
          signoff,
          confirmation: `rebuild ${ref}`,
          env: passwords,
          query: fake.query,
          run: fake.run,
          runCommand: vi.fn((command: string, args: string[]) => {
            // The first rebuild checks the installed CLI's version first.
            if (args[0] === "--version")
              return { status: 0, stdout: pinnedSupabaseCliVersion() };
            commands.push(command);
            // The reset ran, but the marker migration wrote nothing.
            fake.db.environment = null;
            return { status: 0 };
          }),
          requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
          log: silent,
        }),
      ).rejects.toThrow(/not marked disposable after the migrations/);
      expect(commands).toHaveLength(1);
      expect(fake.run.mock.calls.map(([call]) => call.sql)).toEqual([
        DEFAULTS_SQL,
      ]);
    }
  });

  it("runs the one-off first rebuild only on an unmarked database with the census sign-off", async () => {
    const runCommand = vi.fn(() => ({ status: 0 }));
    const marked = fakeDatabase({});
    await expect(
      rebuild({
        settings: settings(),
        mode: "first",
        signoff: "https://github.com/Asymmetric-al/core/issues/1",
        confirmation: `rebuild ${ref}`,
        query: marked.query,
        runCommand,
        log: silent,
      }),
    ).rejects.toThrow(/already marked/);
    const unmarked = fakeDatabase({ environment: null });
    await expect(
      rebuild({
        settings: settings(),
        mode: "first",
        signoff: "yes please",
        confirmation: `rebuild ${ref}`,
        query: unmarked.query,
        runCommand,
        log: silent,
      }),
    ).rejects.toThrow(/census sign-off/);
    await expect(
      rebuild({
        settings: settings(),
        mode: "first",
        signoff: "https://github.com/Asymmetric-al/core/issues/1",
        confirmation: "rebuild",
        query: unmarked.query,
        runCommand,
        log: silent,
      }),
    ).rejects.toThrow(/to confirm/);
    expect(runCommand).not.toHaveBeenCalled();
  });

  it("migrates Supabase, sets the CMS role passwords, then runs Payload as cms_owner, and checks nothing is left pending", () => {
    const { query, run, events } = fakeDatabase({});
    const calls: string[][] = [];
    const runCommand = vi.fn(
      (
        command: string,
        args: string[],
        options: { env: Record<string, string> },
      ) => {
        calls.push([
          command,
          ...args.filter((a) => !a.startsWith("postgresql://")),
        ]);
        events.push(command === "bun" ? "payload" : "supabase");
        if (command === "bun") {
          expect(options.env.CMS_HOSTED_MIGRATION_ROLE).toBe("cms_owner");
          // WP1.2's runner migrates a hosted CMS schema only through
          // PAYLOAD_MIGRATION_DATABASE_URI, and never through the run-time
          // variable, which holds no cms_owner login here.
          expect(
            new URL(options.env.PAYLOAD_MIGRATION_DATABASE_URI!).username,
          ).toBe(`cms_owner.${ref}`);
          expect(options.env.PAYLOAD_DATABASE_URI ?? "").not.toContain(
            "cms_owner",
          );
          expect(options.env.SUPABASE_DB_URL).toBe("");
          // The runner's own preflight accepts what the release job passes.
          const chosen = resolveCmsMigrationDatabaseUrl(options.env);
          expect(chosen.source).toBe("PAYLOAD_MIGRATION_DATABASE_URI");
          expect(() =>
            assertCmsMigrationTarget({
              databaseUrl: chosen.databaseUrl,
              supabaseUrl: options.env.NEXT_PUBLIC_SUPABASE_URL,
              approvedProjectRef: options.env.CMS_HOSTED_MIGRATION_REF,
              environment: options.env,
            }),
          ).not.toThrow();
        }
        return { status: 0 };
      },
    );
    migrate({
      settings: settings(),
      env: passwords,
      query,
      run,
      runCommand,
      log: silent,
    });
    expect(events).toEqual([
      "supabase",
      "role password",
      "role password",
      "payload",
    ]);
    expect(calls[0]).toEqual([
      process.execPath,
      "scripts/supabase-cli.mjs",
      "db",
      "push",
      "--db-url",
      "--yes",
    ]);
    expect(calls[1]).toEqual(["bun", "run", "cms:migrate"]);
  });

  // WP1.6: only the two rebuild operations put the platform's defaults
  // back; a release that migrates in place keeps the chain's own.
  it("leaves default privileges alone when it migrates", () => {
    const fake = fakeDatabase({ cmsLogins: ["cms_owner", "cms_runtime"] });
    const runCommand = vi.fn((_command: string, _args: string[]) => ({
      status: 0,
    }));
    migrate({
      settings: settings(),
      env: passwords,
      query: fake.query,
      run: fake.run,
      runCommand,
      log: silent,
    });
    expect(fake.events).not.toContain("default privileges");
    for (const [call] of fake.run.mock.calls)
      expect(call.sql ?? "").not.toMatch(/default privileges/i);
    for (const [, args] of runCommand.mock.calls)
      expect(args.join(" ")).not.toContain(HOSTED_DEFAULT_PRIVILEGES);
  });

  // Council round 2, A6a and A6b.
  it("keeps the database password off every command line, and every RELEASE_ variable and ambient PG* setting out of every child", () => {
    vi.stubEnv("RELEASE_DATABASE_URL", databaseUrl);
    vi.stubEnv(
      "RELEASE_CMS_OWNER_PASSWORD",
      passwords.RELEASE_CMS_OWNER_PASSWORD,
    );
    vi.stubEnv(
      "RELEASE_CMS_RUNTIME_PASSWORD",
      passwords.RELEASE_CMS_RUNTIME_PASSWORD,
    );
    vi.stubEnv("PGHOSTADDR", "10.9.9.9");
    try {
      const { query, run } = fakeDatabase({});
      const children: Array<{
        command: string;
        args: string[];
        env: Record<string, string>;
        ca?: string;
      }> = [];
      migrate({
        settings: settings(),
        env: passwords,
        query,
        run,
        runCommand: vi.fn(
          (
            command: string,
            args: string[],
            options: { env: Record<string, string> },
          ) => {
            const ca = options.env.PGSSLROOTCERT
              ? readFileSync(options.env.PGSSLROOTCERT, "utf8")
              : undefined;
            children.push({ command, args, env: options.env, ca });
            return { status: 0 };
          },
        ),
        log: silent,
      });
      const [cli, payload] = children;
      expect(cli!.args).toContain(
        `postgresql://postgres.${ref}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`,
      );
      expect(cli!.args.join(" ")).not.toContain(":pw@");
      expect(cli!.env.PGPASSWORD).toBe("pw");
      for (const child of children) {
        expect(
          Object.keys(child.env).filter(
            (key) =>
              key.startsWith("RELEASE_") ||
              (key.startsWith("PG") &&
                !["PGPASSWORD", "PGSSLROOTCERT"].includes(key)),
          ),
          child.command,
        ).toEqual([]);
      }
      // Payload verifies the pooler against the project's CA, and the
      // runner's psql check reads the same CA from a file that is gone after.
      expect(
        new URL(payload!.env.PAYLOAD_MIGRATION_DATABASE_URI!).searchParams.get(
          "sslmode",
        ),
      ).toBe("verify-full");
      expect(payload!.env.PAYLOAD_DATABASE_SSL_CA).toBe(CA);
      expect(payload!.ca).toBe(CA);
      expect(existsSync(payload!.env.PGSSLROOTCERT!)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("stops Payload's migration of a TLS target when the release environment holds no CA", () => {
    const runCommand = vi.fn(() => ({ status: 0 }));
    const noCa = { ...settings(), databaseCa: undefined };
    expect(() => payloadMigrate({ settings: noCa, runCommand })).toThrow(
      /RELEASE_DATABASE_SSL_CA is not set/,
    );
    expect(runCommand).not.toHaveBeenCalled();
  });

  it("records the heads the database holds, so an older release never lowers them", () => {
    const newer = "29991231000000";
    const fake = fakeDatabase({ supabase: [...source.supabase, newer] });
    const heads = recordHeads({
      settings: settings(),
      query: fake.query,
      run: fake.run,
      log: silent,
    });
    expect(heads.supabase).toBe(newer);
    expect(fake.db.heads.supabase).toBe(newer);
  });

  it("moves the marker forward only, on a typed confirmation", () => {
    const fake = fakeDatabase({ environment: "shared" });
    expect(() =>
      setEnvironmentMarker({
        settings: settings(),
        marker: "disposable",
        confirmation: `${ref}:disposable`,
        query: fake.query,
        run: fake.run,
        log: silent,
      }),
    ).toThrow(/forward only/);
    expect(() =>
      setEnvironmentMarker({
        settings: settings(),
        marker: "production",
        confirmation: "yes",
        query: fake.query,
        run: fake.run,
        log: silent,
      }),
    ).toThrow(ReleaseStop);
    setEnvironmentMarker({
      settings: settings(),
      marker: "production",
      confirmation: `${ref}:production`,
      query: fake.query,
      run: fake.run,
      log: silent,
    });
    expect(fake.db.environment).toBe("production");
  });
});

// WP1.6's second hosted rebuild: the step set both CMS passwords anew (same
// values, new SCRAM salts) and logged in through the shared pooler at once,
// which still held the old credentials and refused the login. The step now
// leaves a password alone when its secret already logs in, and after a real
// change waits, within a bound, for the pooler to take the new one.
describe("CMS role passwords through a hosted pooler", () => {
  const PASSWORD_REFUSED = (role: string) =>
    `log in as ${role}: psql exited 2. psql: error: connection to server at "aws-0-us-east-1.pooler.supabase.com" (192.0.2.1), port 5432 failed: FATAL:  password authentication failed for user "${role}"`;
  const NO_SECRET = (role: string) =>
    `log in as ${role}: psql exited 2. psql: error: connection to server at "aws-0-us-east-1.pooler.supabase.com" (192.0.2.1), port 5432 failed: FATAL:  (EAUTHQUERY) unsupported or invalid secret format`;

  /** Each role answers its logins, in order, from its script: "ok" or an error. */
  function hosted(script: Record<string, string[]>) {
    const clock = { now: 0 };
    const sleeps: number[] = [];
    const query = vi.fn(
      ({ sql, databaseUrl }: { sql: string; databaseUrl: string }) => {
        if (sql.includes("FROM pg_roles")) return ["cms_owner", "cms_runtime"];
        if (!sql.includes("current_user"))
          throw new Error(`unexpected query: ${sql.slice(0, 60)}`);
        const role = decodeURIComponent(new URL(databaseUrl).username).split(
          ".",
        )[0]!;
        const next = script[role]!.shift();
        if (next === undefined) throw new Error(`no more logins for ${role}`);
        if (next !== "ok") throw new Error(next);
        return { user: role };
      },
    );
    const run = vi.fn();
    const lines: string[] = [];
    return {
      query,
      run,
      lines,
      sleeps,
      sleep: (ms: number) => {
        sleeps.push(ms);
        clock.now += ms;
      },
      now: () => clock.now,
      log: (line: string) => lines.push(line),
    };
  }
  const call = (h: ReturnType<typeof hosted>) =>
    setCmsRolePasswords({
      settings: settings(),
      env: passwords,
      query: h.query,
      run: h.run,
      sleep: h.sleep,
      now: h.now,
      log: h.log,
    });

  it("changes nothing when each secret already logs in", () => {
    const h = hosted({ cms_owner: ["ok"], cms_runtime: ["ok"] });
    call(h);
    expect(h.run).not.toHaveBeenCalled();
    expect(h.sleeps).toEqual([]);
    expect(h.lines).toEqual([
      "The cms_owner password already logs in; nothing changed.",
      "The cms_runtime password already logs in; nothing changed.",
    ]);
  });

  it.each([
    ["a wrong password", PASSWORD_REFUSED("cms_owner")],
    [
      "no usable secret (a role made without a password)",
      NO_SECRET("cms_owner"),
    ],
  ])(
    "sets a password refused for %s once, then waits inside the bound until the pooler accepts it",
    (_case, refusal) => {
      const h = hosted({
        cms_owner: [refusal, PASSWORD_REFUSED("cms_owner"), "ok"],
        cms_runtime: ["ok"],
      });
      call(h);
      expect(h.run).toHaveBeenCalledTimes(1);
      const set = h.run.mock.calls[0]![0] as {
        label: string;
        sql: string;
        variables: Record<string, string>;
      };
      expect(set.label).toBe("set cms_owner password");
      expect(set.variables.RELEASE_ROLE_VERIFIER).toMatch(/^SCRAM-SHA-256\$/);
      expect(set.sql).not.toContain(passwords.RELEASE_CMS_OWNER_PASSWORD);
      expect(h.sleeps).toEqual([30_000]);
      expect(h.lines).toEqual([
        "Set the cms_owner password; it logged in on attempt 2, 30 s after the change.",
        "The cms_runtime password already logs in; nothing changed.",
      ]);
    },
  );

  it("fails, naming the role and the bound and nothing secret, when the new password never logs in", () => {
    const refused = PASSWORD_REFUSED("cms_owner");
    const h = hosted({
      cms_owner: [refused, refused, refused, refused],
      cms_runtime: ["ok"],
    });
    let message = "";
    try {
      call(h);
    } catch (error) {
      expect(error).toBeInstanceOf(ReleaseStop);
      message = (error as Error).message;
    }
    expect(message).toContain("cms_owner");
    expect(message).toContain("3 attempts over 90 seconds");
    expect(message).not.toContain(passwords.RELEASE_CMS_OWNER_PASSWORD);
    expect(message).not.toContain("SCRAM-SHA-256");
    expect(h.run).toHaveBeenCalledTimes(1);
    expect(h.sleeps).toEqual([30_000, 60_000]);
  });

  it.each([
    [
      "the role's connection limit",
      'FATAL:  too many connections for role "cms_owner"',
    ],
    ["no route", "connection to server failed: Connection refused"],
    ["TLS", "SSL error: certificate verify failed"],
    [
      "the pooler's circuit breaker",
      "FATAL:  Circuit breaker open: too many authentication failures, new connections are temporarily blocked",
    ],
  ])(
    "sets nothing and stops at once when the login is refused for %s",
    (_case, refusal) => {
      const h = hosted({ cms_owner: [refusal], cms_runtime: ["ok"] });
      expect(() => call(h)).toThrow(ReleaseStop);
      expect(h.run).not.toHaveBeenCalled();
      expect(h.sleeps).toEqual([]);
    },
  );

  // Review H3: only a refusal that says this password is wrong, or that the
  // role has no usable secret, sets a password. Any other auth-query failure
  // (a timeout, a partial outage) must not: setting the same password again
  // renews the very stale cache the step avoids.
  it.each([
    [
      "an auth query that failed",
      "FATAL:  (EAUTHQUERY) authentication query failed: timeout",
    ],
    [
      "an auth query that found no such user",
      "FATAL:  (EAUTHQUERY) user not found in the database",
    ],
    [
      "an MD5 secret",
      "FATAL:  (EAUTHQUERY) MD5 secrets are not supported for auth_query, use require_user instead",
    ],
    [
      "another user's password",
      'FATAL:  password authentication failed for user "postgres"',
    ],
  ])(
    "sets nothing and stops at once when the pooler reports %s",
    (_case, refusal) => {
      const h = hosted({ cms_owner: [refusal], cms_runtime: ["ok"] });
      expect(() => call(h)).toThrow(
        /refused for a reason other than its password/,
      );
      expect(h.run).not.toHaveBeenCalled();
      expect(h.sleeps).toEqual([]);
    },
  );

  it("stops at once when a verification after the change is refused for another reason", () => {
    const h = hosted({
      cms_owner: [
        PASSWORD_REFUSED("cms_owner"),
        "FATAL:  Circuit breaker open: too many authentication failures, new connections are temporarily blocked",
      ],
      cms_runtime: ["ok"],
    });
    expect(() => call(h)).toThrow(/Circuit breaker open/);
    expect(h.run).toHaveBeenCalledTimes(1);
    expect(h.sleeps).toEqual([]);
  });

  // Supavisor v2.10.1 (commit 83ca93e1) blocks a client after 10 refused
  // logins in 150 seconds for one project and client address
  // (lib/supavisor/circuit_breaker.ex, :auth_error); hosted's version is not
  // published, so this is an estimate there. The pooler took the new password
  // within about 80 seconds on the preview project. Both roles share one
  // client address in one run.
  it("waits longer than the measured cache, and stays under the pooler's circuit breaker for both roles", () => {
    const at = ROLE_LOGIN_VERIFICATION.attemptsAtSeconds;
    expect(at[0]).toBe(0);
    expect(at.at(-1)).toBeGreaterThanOrEqual(80);
    expect(at.at(-1)).toBeLessThan(150);
    const refusalsPerRole = 1 + at.length;
    expect(2 * refusalsPerRole).toBeLessThan(10);
  });
});
