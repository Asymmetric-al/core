import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const fixture = path.resolve(
  "tests/integration/supabase/client-runtime-verification.mjs",
);

describe("local Supabase SDK qualification target guard", () => {
  it.each([
    { projectId: "production", API_URL: "http://127.0.0.1:55321" },
    {
      projectId: "asym-modernization-guard",
      API_URL: "https://example.invalid",
    },
    {
      projectId: "asym-modernization-guard",
      API_URL: "http://127.0.0.1:55321/?secret=forbidden",
    },
    {
      projectId: "asym-modernization-guard",
      API_URL: "http://user:forbidden@127.0.0.1:55321",
    },
  ])(
    "rejects an unqualified target before creating fixtures: $API_URL",
    (target) => {
      const result = spawnSync(process.execPath, [fixture], {
        input: JSON.stringify({
          ...target,
          PUBLIC_KEY: "fixture-public-placeholder",
          SERVICE_ROLE_KEY: "fixture-service-placeholder",
        }),
        encoding: "utf8",
        shell: false,
        timeout: 5_000,
      });
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr)).toEqual({
        passed: false,
        step: "validate-local-target",
        checks: [],
      });
    },
  );
});
