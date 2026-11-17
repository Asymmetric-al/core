import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { resolveCmsMigrationDatabaseUrl } from "../../../../scripts/cms/lib/migration-connection.mjs";
import { assertCmsMigrationTarget } from "../../../../scripts/cms/lib/migration-target.mjs";
import { listSourceMigrations } from "../../../../scripts/release/migration-heads.mjs";
import {
  RELEASE_ENVIRONMENTS,
  ReleaseStop,
  migrate,
  payloadMigrate,
  preflight,
  pinnedSupabaseCliVersion,
  readReleaseSettings,
  rebuild,
  recordHeads,
  roleDatabaseUrl,
  setEnvironmentMarker,
} from "../../../../scripts/release/release-database.mjs";

const ref = "abcdefghijklmnopqrst";
const databaseUrl = `postgresql://postgres.${ref}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`;
const source = listSourceMigrations({ root: process.cwd() });
const CA = "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----";

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
  healthFunction?: boolean;
  environment?: string | null;
  supabase?: string[];
  payload?: string[];
  devMarker?: boolean;
  heads?: { supabase: string | null; payload: string | null };
  publishedLeft?: number;
}) {
  const db = {
    healthFunction: true,
    environment: "disposable" as string | null,
    supabase: [...source.supabase],
    payload: [...source.payload],
    devMarker: false,
    publishedLeft: 0,
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
        return { seeded_logins: 1, published: db.publishedLeft ?? 0 };
      }
      if (sql.includes("current_user")) {
        const user = decodeURIComponent(new URL(databaseUrl).username);
        return { user: user.split(".")[0] };
      }
      throw new Error(`unexpected query: ${sql.slice(0, 80)}`);
    },
  );
  const run = vi.fn(({ variables }: { variables: Record<string, string> }) => {
    if ("RELEASE_ROLE_VERIFIER" in variables) events.push("role password");
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
  });
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

  it("refuses a database with no health function, no marker, or the frozen production-named project", () => {
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
      run: vi.fn((options: { variables: Record<string, string> }) => {
        if ("RELEASE_ROLE_VERIFIER" in options.variables)
          order.push("role password");
        return "";
      }),
      runCommand,
      requireDisposable: vi.fn(() => ({ ok: true, kind: "disposable" })),
      log: silent,
    });
    expect(order).toEqual([
      "db reset",
      "seeded logins",
      "role password",
      "role password",
      "payload",
    ]);
  });

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
    expect(fake.run).not.toHaveBeenCalled();
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
      if (command === "npx") {
        expect(args.slice(0, 4)).toEqual([
          "-y",
          `supabase@${pinnedSupabaseCliVersion()}`,
          "db",
          "reset",
        ]);
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
          runCommand: vi.fn((command: string) => {
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
      expect(fake.run).not.toHaveBeenCalled();
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
