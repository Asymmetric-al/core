import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  findRuntimeConnectionStrings,
  findSharedRuntimeConnectionStrings,
  formatRuntimeConnectionStrings,
  main,
  projectEnvMetadata,
  readRuntimeConnectionStrings,
} from "../../../scripts/verify/runtime-connection-strings.mjs";
import { EXPECTED_PROJECTS } from "../../../scripts/verify/vercel-build-controls.mjs";

const listing = {
  envs: [
    {
      key: "SUPABASE_DB_URL",
      target: ["production"],
      type: "sensitive",
      value: "postgresql://postgres:secret@x/y",
    },
    {
      key: "SUPABASE_DB_URL",
      target: [],
      customEnvironmentIds: ["env_1"],
      type: "sensitive",
    },
    {
      key: "PAYLOAD_DATABASE_URI",
      target: ["preview"],
      gitBranch: "feature/x",
      type: "sensitive",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      target: ["production"],
      type: "plain",
      value: "https://x.supabase.co",
    },
    { key: "POSTGRES_URL", target: ["development"], type: "encrypted" },
  ],
};

describe("runtime connection-string check (WP1 exit)", () => {
  it("names every forbidden variable with the environments that hold it, never a value", () => {
    const found = findRuntimeConnectionStrings({ project: "admin", listing });
    expect(found).toEqual([
      { project: "admin", key: "POSTGRES_URL", environments: ["development"] },
      {
        project: "admin",
        key: "SUPABASE_DB_URL",
        environments: ["production"],
      },
      {
        project: "admin",
        key: "SUPABASE_DB_URL",
        environments: ["custom environment"],
      },
    ]);
    const report = formatRuntimeConnectionStrings(found);
    expect(report).toContain("`SUPABASE_DB_URL`");
    expect(report).not.toContain("secret");
    expect(report).toContain("BLOCKED");
  });

  it("does not flag PAYLOAD_DATABASE_URI, which holds the cms_runtime login", () => {
    expect(
      findRuntimeConnectionStrings({ project: "admin", listing }).map(
        (row) => row.key,
      ),
    ).not.toContain("PAYLOAD_DATABASE_URI");
  });

  it("reads each project's and the team's shared variables through the Vercel API, names only", () => {
    const run = vi.fn((_command: string, args: string[]) =>
      args[1]?.startsWith("/v1/env")
        ? JSON.stringify({
            data: [],
            pagination: { count: 0, prev: null, next: null },
          })
        : JSON.stringify({ envs: [] }),
    );
    const result = readRuntimeConnectionStrings({
      scope: "asymmetric-al",
      run,
    });
    expect(result).toEqual([]);
    expect(run).toHaveBeenCalledTimes(4);
    expect(run.mock.calls[0]).toEqual([
      "vercel",
      ["api", "/v10/projects/admin/env", "--scope", "asymmetric-al", "--raw"],
    ]);
    expect(run.mock.calls[3]).toEqual([
      "vercel",
      ["api", "/v1/env", "--scope", "asymmetric-al", "--raw"],
    ]);
    expect(formatRuntimeConnectionStrings(result)).toContain("READY");
  });

  it("blocks when a team-level shared forbidden variable is linked to the three projects in a custom environment or target", () => {
    const [adminId, donorId, missionaryId] = EXPECTED_PROJECTS.map(
      (project) => project.projectId,
    );
    const run = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [
            {
              key: "SUPABASE_DB_URL",
              target: [],
              projectId: [adminId, donorId, missionaryId],
              customEnvironmentIds: ["env_a", "env_b", "env_c"],
              type: "sensitive",
              value: "postgresql://postgres:shared-secret@x/y",
            },
            {
              key: "POSTGRES_URL",
              target: ["preview", "development"],
              projectId: [donorId, "prj_unrelated"],
              customEnvironmentIds: [],
              type: "encrypted",
            },
            {
              key: "DATABASE_URL",
              target: ["production"],
              projectId: ["prj_unrelated"],
              customEnvironmentIds: [],
              type: "sensitive",
            },
            {
              key: "DIRECT_URL",
              target: [],
              projectId: [adminId],
              customEnvironmentIds: [],
              type: "sensitive",
            },
            {
              key: "PAYLOAD_DATABASE_URI",
              target: ["production"],
              projectId: [adminId],
              customEnvironmentIds: [],
              type: "sensitive",
            },
          ],
          pagination: { count: 5, next: null, prev: null },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    const found = readRuntimeConnectionStrings({
      scope: "asymmetric-al",
      run,
    });

    expect(found).toEqual([
      {
        scope: "team-shared",
        team: "asymmetric-al",
        projects: ["donor"],
        key: "POSTGRES_URL",
        environments: ["preview", "development"],
      },
      {
        scope: "team-shared",
        team: "asymmetric-al",
        projects: ["admin", "donor", "missionary"],
        key: "SUPABASE_DB_URL",
        environments: ["custom environment"],
      },
    ]);

    const report = formatRuntimeConnectionStrings(found);
    expect(report).toContain(
      "- team asymmetric-al (shared; projects: admin, donor, missionary): `SUPABASE_DB_URL` in custom environment",
    );
    expect(report).toContain(
      "- team asymmetric-al (shared; projects: donor): `POSTGRES_URL` in preview, development",
    );
    expect(report).not.toContain("shared-secret");
    expect(report).not.toContain("DATABASE_URL");
    expect(report).not.toContain("DIRECT_URL");
    expect(report).not.toContain("PAYLOAD_DATABASE_URI");
    expect(report).toContain("Overall: BLOCKED (2)");
  });

  it("paginates team shared variables and fails closed on unreadable shared listings", () => {
    const missionaryId = EXPECTED_PROJECTS.find(
      (project) => project.key === "missionary",
    )!.projectId;
    const run = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: 1700000000000, prev: null },
        });
      }
      if (args[1] === "/v1/env?until=1700000000000") {
        return JSON.stringify({
          data: [
            {
              key: "DB_URL",
              target: [],
              projectId: [missionaryId],
              applyToAllCustomEnvironments: true,
              type: "sensitive",
            },
          ],
          pagination: { count: 1, next: null, prev: 1700000000000 },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    const found = readRuntimeConnectionStrings({
      scope: "asymmetric-al",
      run,
    });
    expect(found).toEqual([
      {
        scope: "team-shared",
        team: "asymmetric-al",
        projects: ["missionary"],
        key: "DB_URL",
        environments: ["custom environment"],
      },
    ]);

    const badSharedRun = vi.fn((_command: string, args: string[]) =>
      args[1] === "/v1/env"
        ? JSON.stringify({ error: { code: "forbidden" } })
        : JSON.stringify({ envs: [] }),
    );
    expect(() =>
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: badSharedRun,
      }),
    ).toThrow(/shared variable list/);
  });

  it("fails closed when shared variable pagination repeats a cursor or exceeds the page bound", () => {
    const repeatedCursorRun = vi.fn((_command: string, args: string[]) => {
      if (args[1]?.startsWith("/v1/env")) {
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: 1700000000000, prev: null },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    expect(() =>
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: repeatedCursorRun,
      }),
    ).toThrow(/repeated cursor|did not advance/i);

    const cyclicCursorRun = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: 1700000000000, prev: null },
        });
      }
      if (args[1] === "/v1/env?until=1700000000000") {
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: 1699999990000, prev: null },
        });
      }
      if (args[1] === "/v1/env?until=1699999990000") {
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: 1700000000000, prev: null },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    expect(() =>
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: cyclicCursorRun,
      }),
    ).toThrow(/repeated cursor|did not advance/i);

    let counter = 1700000000000;
    const unboundedRun = vi.fn((_command: string, args: string[]) => {
      if (args[1]?.startsWith("/v1/env")) {
        counter -= 1;
        return JSON.stringify({
          data: [],
          pagination: { count: 20, next: counter, prev: null },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    expect(() =>
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: unboundedRun,
      }),
    ).toThrow(/page limit|exceeded/i);
  });

  it("drops value and decrypted fields from parsed pages and withholds CLI stdout/stderr on failure", () => {
    const adminId = EXPECTED_PROJECTS.find(
      (project) => project.key === "admin",
    )!.projectId;
    const rawValueMarker = "SECRET_RAW_VALUE_9f8e7d";
    const decryptedMarker = "SECRET_DECRYPTED_VALUE_6c5b4a";

    const projected = projectEnvMetadata({
      id: "env_shared_1",
      key: "SUPABASE_DB_URL",
      type: "sensitive",
      target: ["production"],
      customEnvironmentIds: ["ce_1"],
      projectId: [adminId],
      value: rawValueMarker,
      decrypted: decryptedMarker,
      comment: "extra-field",
    });
    expect(projected).toEqual({
      id: "env_shared_1",
      key: "SUPABASE_DB_URL",
      type: "sensitive",
      target: ["production"],
      customEnvironmentIds: ["ce_1"],
      applyToAllCustomEnvironments: false,
      projectId: [adminId],
    });
    expect("value" in projected).toBe(false);
    expect("decrypted" in projected).toBe(false);

    const runWithSecrets = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [
            {
              id: "env_shared_1",
              key: "SUPABASE_DB_URL",
              type: "sensitive",
              target: ["production"],
              customEnvironmentIds: [],
              projectId: [adminId],
              value: rawValueMarker,
              decrypted: decryptedMarker,
            },
            {
              id: "env_shared_2",
              key: "SAFE_KEY",
              type: "encrypted",
              target: ["production"],
              customEnvironmentIds: [],
              projectId: [adminId],
              value: `${rawValueMarker}_safe`,
              decrypted: `${decryptedMarker}_safe`,
            },
          ],
          pagination: { count: 2, next: null, prev: null },
        });
      }
      return JSON.stringify({
        envs: [
          {
            id: "env_proj_1",
            key: "POSTGRES_URL",
            type: "encrypted",
            target: ["preview"],
            customEnvironmentIds: [],
            value: rawValueMarker,
            decrypted: decryptedMarker,
          },
        ],
      });
    });

    const found = readRuntimeConnectionStrings({
      scope: "asymmetric-al",
      run: runWithSecrets,
    });
    const serialized = JSON.stringify(found);
    const report = formatRuntimeConnectionStrings(found);
    expect(serialized).not.toContain(rawValueMarker);
    expect(serialized).not.toContain(decryptedMarker);
    expect(report).not.toContain(rawValueMarker);
    expect(report).not.toContain(decryptedMarker);

    const runWithSecretsThenFail = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [
            {
              id: "env_shared_page1",
              key: "SUPABASE_DB_URL",
              type: "sensitive",
              target: ["production"],
              projectId: [adminId],
              value: rawValueMarker,
              decrypted: decryptedMarker,
            },
          ],
          pagination: { count: 1, next: 1700000000000, prev: null },
        });
      }
      if (args[1] === "/v1/env?until=1700000000000") {
        return "not-json";
      }
      return JSON.stringify({ envs: [] });
    });

    let pageError: unknown;
    try {
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: runWithSecretsThenFail,
      });
    } catch (error) {
      pageError = error;
    }
    expect(pageError).toBeInstanceOf(Error);
    expect(String(pageError)).not.toContain(rawValueMarker);
    expect(String(pageError)).not.toContain(decryptedMarker);

    const stderrMarker = "STDERR_SECRET_TOKEN_MARKER_123";
    const stdoutMarker = "STDOUT_SECRET_BODY_MARKER_456";
    const failingRun = vi.fn(() => {
      const error = new Error(
        `Command failed: vercel api /v10/projects/admin/env\n${stderrMarker}`,
      ) as Error & { status?: number; stderr?: string; stdout?: string };
      error.status = 2;
      error.stderr = stderrMarker;
      error.stdout = stdoutMarker;
      throw error;
    });

    let cliError: unknown;
    try {
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: failingRun,
      });
    } catch (error) {
      cliError = error;
    }
    expect(cliError).toBeInstanceOf(Error);
    const cliErrorMessage = (cliError as Error).message;
    expect(cliErrorMessage).toContain("exit code 2");
    expect(cliErrorMessage).not.toContain(stderrMarker);
    expect(cliErrorMessage).not.toContain(stdoutMarker);
    expect(JSON.stringify(cliError)).not.toContain(stderrMarker);
    expect(JSON.stringify(cliError)).not.toContain(stdoutMarker);

    const dir = mkdtempSync(path.join(os.tmpdir(), "runtime-conn-cli-"));
    try {
      const fakeVercelScript = path.join(dir, "fake-vercel.mjs");
      writeFileSync(
        fakeVercelScript,
        `process.stdout.write(${JSON.stringify(stdoutMarker)} + "\\n");
process.stderr.write(${JSON.stringify(stderrMarker)} + "\\n");
process.exit(7);
`,
        "utf8",
      );
      if (process.platform === "win32") {
        writeFileSync(
          path.join(dir, "vercel.cmd"),
          `@echo off\r\n"${process.execPath}" "${fakeVercelScript}" %*\r\n`,
          "utf8",
        );
      } else {
        const fakeVercel = path.join(dir, "vercel");
        writeFileSync(
          fakeVercel,
          `#!/usr/bin/env sh\nexec "${process.execPath}" "${fakeVercelScript}" "$@"\n`,
          "utf8",
        );
        chmodSync(fakeVercel, 0o755);
      }

      const result = spawnSync(
        process.execPath,
        [path.resolve("scripts/verify/runtime-connection-strings.mjs")],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: `${dir}${path.delimiter}${process.env.PATH ?? ""}`,
          },
        },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("exit code 7");
      expect(result.stderr).not.toContain(stderrMarker);
      expect(result.stderr).not.toContain(stdoutMarker);
      expect(result.stdout).not.toContain(stderrMarker);
      expect(result.stdout).not.toContain(stdoutMarker);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("requires explicit pagination.next === null to finish shared-variable scan and prints a BLOCKED verdict on refusal", () => {
    const adminId = EXPECTED_PROJECTS.find(
      (project) => project.key === "admin",
    )!.projectId;

    const badBodies: Array<[string, unknown]> = [
      ["missing pagination", { data: [] }],
      ["pagination without next", { data: [], pagination: { count: 0 } }],
      ["empty string next", { data: [], pagination: { count: 0, next: "" } }],
      ["bare array", []],
      ["boolean next", { data: [], pagination: { count: 0, next: false } }],
    ];

    for (const [label, body] of badBodies) {
      const run = vi.fn((_command: string, args: string[]) =>
        args[1]?.startsWith("/v1/env")
          ? JSON.stringify(body)
          : JSON.stringify({ envs: [] }),
      );
      expect(
        () =>
          readRuntimeConnectionStrings({
            scope: "asymmetric-al",
            run,
          }),
        label,
      ).toThrow(/pagination|shared variable list/i);
    }

    expect(
      findSharedRuntimeConnectionStrings({
        listing: [
          {
            key: "SUPABASE_DB_URL",
            target: ["production"],
            projectId: [adminId],
          },
        ],
        scope: "asymmetric-al",
      }),
    ).toEqual([
      {
        scope: "team-shared",
        team: "asymmetric-al",
        projects: ["admin"],
        key: "SUPABASE_DB_URL",
        environments: ["production"],
      },
    ]);

    const twoPageRun = vi.fn((_command: string, args: string[]) => {
      if (args[1] === "/v1/env") {
        return JSON.stringify({
          data: [
            {
              id: "env_1",
              key: "SUPABASE_DB_URL",
              type: "sensitive",
              target: ["production"],
              projectId: [adminId],
            },
          ],
          pagination: { count: 1, prev: 1700000000000, next: 1700000000000 },
        });
      }
      if (args[1] === "/v1/env?until=1700000000000") {
        return JSON.stringify({
          data: [],
          pagination: { count: 0, prev: null, next: null },
        });
      }
      return JSON.stringify({ envs: [] });
    });

    expect(
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: twoPageRun,
      }),
    ).toEqual([
      {
        scope: "team-shared",
        team: "asymmetric-al",
        projects: ["admin"],
        key: "SUPABASE_DB_URL",
        environments: ["production"],
      },
    ]);

    const secretStderr = "SECRET_CLI_STDERR_MARKER_R1";
    const logs: string[] = [];
    const errors: string[] = [];
    const exitCode = main({
      scope: "asymmetric-al",
      run: () => {
        const error = new Error(`Command failed: ${secretStderr}`) as Error & {
          status?: number;
          stderr?: string;
        };
        error.status = 3;
        error.stderr = secretStderr;
        throw error;
      },
      log: (line: string) => logs.push(line),
      logError: (line: string) => errors.push(line),
    });

    expect(exitCode).toBe(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^runtime-connection-strings: /);
    const sanitizedMessage = errors[0]!.replace(
      /^runtime-connection-strings: /,
      "",
    );
    expect(sanitizedMessage).toContain("exit code 3");
    expect(sanitizedMessage).not.toContain(secretStderr);
    expect(logs.at(-1)).toBe(
      `Overall: BLOCKED (could not read: ${sanitizedMessage})`,
    );
    expect(logs.join("\n")).not.toContain(secretStderr);
  });

  it("fails closed when a shared or project variable entry has no non-empty string key", () => {
    const secretMarker = "SECRET_UNREADABLE_ENTRY_VALUE_F1";
    const badEntries: Array<[string, unknown]> = [
      ["null entry", null],
      ["missing key", { id: "env_missing_key", value: secretMarker }],
      ["empty key", { id: "env_empty_key", key: "", value: secretMarker }],
      ["non-string key", { id: "env_num_key", key: 42, value: secretMarker }],
    ];

    for (const [label, badEntry] of badEntries) {
      const sharedBadRun = vi.fn((_command: string, args: string[]) =>
        args[1]?.startsWith("/v1/env")
          ? JSON.stringify({
              data: [badEntry],
              pagination: { count: 1, prev: null, next: null },
            })
          : JSON.stringify({ envs: [] }),
      );
      let sharedErr: unknown;
      try {
        readRuntimeConnectionStrings({
          scope: "asymmetric-al",
          run: sharedBadRun,
        });
      } catch (error) {
        sharedErr = error;
      }
      expect(sharedErr, `shared: ${label}`).toBeInstanceOf(Error);
      expect((sharedErr as Error).message, `shared: ${label}`).toMatch(
        /unreadable variable entry/i,
      );
      expect(String(sharedErr), `shared: ${label}`).not.toContain(secretMarker);

      const projectBadRun = vi.fn((_command: string, args: string[]) =>
        args[1]?.startsWith("/v1/env")
          ? JSON.stringify({
              data: [],
              pagination: { count: 0, prev: null, next: null },
            })
          : JSON.stringify({ envs: [badEntry] }),
      );
      let projectErr: unknown;
      try {
        readRuntimeConnectionStrings({
          scope: "asymmetric-al",
          run: projectBadRun,
        });
      } catch (error) {
        projectErr = error;
      }
      expect(projectErr, `project: ${label}`).toBeInstanceOf(Error);
      expect((projectErr as Error).message, `project: ${label}`).toMatch(
        /unreadable variable entry/i,
      );
      expect(String(projectErr), `project: ${label}`).not.toContain(
        secretMarker,
      );
    }

    const emptyValidRun = vi.fn((_command: string, args: string[]) =>
      args[1]?.startsWith("/v1/env")
        ? JSON.stringify({
            data: [],
            pagination: { count: 0, prev: null, next: null },
          })
        : JSON.stringify({ envs: [] }),
    );
    expect(
      readRuntimeConnectionStrings({
        scope: "asymmetric-al",
        run: emptyValidRun,
      }),
    ).toEqual([]);
  });

  it("fails closed when a project variable listing hides production entries, paginates, or omits envs", () => {
    const cleanShared = JSON.stringify({
      data: [],
      pagination: { count: 0, prev: null, next: null },
    });

    const failingProjectBodies: Array<[string, unknown, RegExp]> = [
      [
        "hiddenProductionEnvCount > 0",
        { envs: [], hiddenProductionEnvCount: 2 },
        /hid 2 production environment variable\(s\) for admin/i,
      ],
      [
        "invalid hiddenProductionEnvCount",
        { envs: [], hiddenProductionEnvCount: -1 },
        /invalid hiddenProductionEnvCount for admin/i,
      ],
      [
        "non-null pagination.next",
        {
          envs: [],
          pagination: { count: 20, next: 1700000000000, prev: null },
        },
        /truncated project variables for admin.*pagination\.next/i,
      ],
      [
        "pagination missing next",
        { envs: [], pagination: { count: 0 } },
        /invalid pagination block for admin/i,
      ],
      [
        "missing envs array",
        { error: { code: "forbidden" } },
        /no variable list for admin/i,
      ],
      ["bare array response", [], /no variable list for admin/i],
    ];

    for (const [label, body, expectedPattern] of failingProjectBodies) {
      const run = vi.fn((_command: string, args: string[]) =>
        args[1]?.startsWith("/v1/env") ? cleanShared : JSON.stringify(body),
      );
      expect(
        () =>
          readRuntimeConnectionStrings({
            scope: "asymmetric-al",
            run,
          }),
        label,
      ).toThrow(expectedPattern);
    }

    const completeProjectBodies: Array<[string, unknown]> = [
      ["hiddenProductionEnvCount 0", { envs: [], hiddenProductionEnvCount: 0 }],
      [
        "pagination.next null",
        { envs: [], pagination: { count: 0, next: null, prev: null } },
      ],
    ];

    for (const [label, body] of completeProjectBodies) {
      const run = vi.fn((_command: string, args: string[]) =>
        args[1]?.startsWith("/v1/env") ? cleanShared : JSON.stringify(body),
      );
      expect(
        readRuntimeConnectionStrings({
          scope: "asymmetric-al",
          run,
        }),
        label,
      ).toEqual([]);
    }
  });
});
