import { describe, expect, it, vi } from "vitest";

import {
  findRuntimeConnectionStrings,
  formatRuntimeConnectionStrings,
  readRuntimeConnectionStrings,
} from "../../../scripts/verify/runtime-connection-strings.mjs";

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

  it("reads each project's variables through the Vercel API, names only", () => {
    const run = vi.fn(() => JSON.stringify({ envs: [] }));
    const result = readRuntimeConnectionStrings({
      scope: "asymmetric-al",
      run,
    });
    expect(result).toEqual([]);
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls[0]).toEqual([
      "vercel",
      ["api", "/v10/projects/admin/env", "--scope", "asymmetric-al", "--raw"],
    ]);
    expect(formatRuntimeConnectionStrings(result)).toContain("READY");
  });
});
