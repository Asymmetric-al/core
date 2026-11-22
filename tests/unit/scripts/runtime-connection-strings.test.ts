import { describe, expect, it, vi } from "vitest";

import {
  findRuntimeConnectionStrings,
  formatRuntimeConnectionStrings,
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
        ? JSON.stringify({ data: [] })
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
});
