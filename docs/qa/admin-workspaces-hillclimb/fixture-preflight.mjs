import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

/** No saved bundle is trusted, and no fixture data file is written. */
export function prepareFixtureBundle({ run = spawnSync } = {}) {
  // Shared dependency caches must not resolve the builders into another tree.
  for (const name of ["api", "database"]) {
    const installed = realpathSync(join(repoRoot, "node_modules/@asym", name));
    const candidate = realpathSync(join(repoRoot, "packages", name));
    if (installed !== candidate) {
      throw new Error(
        `Fixture preflight: @asym/${name} resolves outside ${repoRoot}`,
      );
    }
  }

  const step = (label, command, args, input) => {
    const result = run(command, args, {
      cwd: repoRoot,
      encoding: "utf8",
      // Pure builders import the shared schema; use the unit-test convention,
      // with no configured backend or privileged key available to the child.
      env: {
        ...process.env,
        SKIP_ENV_VALIDATION: "1",
        NEXT_PUBLIC_SUPABASE_URL: "https://fixture.invalid",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        SUPABASE_DB_URL: "",
      },
      input,
      maxBuffer: 16 * 1024 * 1024,
      timeout: 120000,
      windowsHide: true,
    });
    if (result.error || result.status !== 0) {
      throw new Error(
        `Fixture preflight failed: ${label} (exit ${result.status ?? "none"}).\n${result.error?.message ?? ""}\n${result.stdout ?? ""}${result.stderr ?? ""}`,
      );
    }
    return result.stdout;
  };

  step("candidate type proof", process.execPath, [
    join(repoRoot, "node_modules/@typescript/native/lib/tsc.js"),
    "--noEmit",
    "--incremental",
    "false",
    "-p",
    join(here, "fixtures/tsconfig.json"),
  ]);
  const json = step("candidate regeneration", "bun", [
    "--no-env-file",
    join(here, "fixtures/export-fixtures.ts"),
    "--stdout",
  ]);
  const verification = step(
    "fixture contracts and routes",
    "bun",
    ["--no-env-file", join(here, "fixtures/verify-fixtures.ts"), "--stdin"],
    json,
  );

  return {
    bundle: JSON.parse(json),
    proof: {
      repoRoot,
      verifiedAt: new Date().toISOString(),
      bundleSha256: createHash("sha256").update(json).digest("hex"),
      typecheck: "passed",
      verification: verification.trim(),
    },
  };
}
