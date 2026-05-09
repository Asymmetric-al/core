import { spawnSync } from "node:child_process";

const PINNED_SUPABASE_CLI_VERSION = "2.98.2";
const forcePinned = process.env.SUPABASE_CLI_FORCE_PINNED === "1";
const pinnedVersion =
  process.env.SUPABASE_CLI_VERSION?.trim() || PINNED_SUPABASE_CLI_VERSION;
const args = process.argv.slice(2);

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  if (result.error) {
    return {
      status: result.status ?? 1,
      error: result.error,
    };
  }

  return {
    status: result.status ?? 1,
    error: null,
  };
}

function hasGlobalSupabaseCli() {
  const probe = spawnSync("supabase", ["--version"], {
    stdio: "pipe",
    env: process.env,
    shell: process.platform === "win32",
  });

  return !probe.error && probe.status === 0;
}

function printGlobalInstallHint() {
  console.warn("==> Install Supabase CLI globally for faster startup:");

  if (process.platform === "win32") {
    console.warn(
      "    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git",
    );
    console.warn("    scoop install supabase");
  } else {
    console.warn("    brew install supabase/tap/supabase");
    console.warn(
      "    # Linux: use the official package or standalone binary from Supabase releases",
    );
  }

  console.warn(
    "==> Docs: https://supabase.com/docs/guides/local-development/cli/getting-started",
  );
}

if (!forcePinned && hasGlobalSupabaseCli()) {
  const globalResult = run("supabase", args);
  if (globalResult.error) {
    console.error(
      `error: Failed to execute global supabase CLI: ${globalResult.error.message}`,
    );
  }
  process.exit(globalResult.status);
}

if (!forcePinned) {
  console.warn(
    `==> Global Supabase CLI not found; using pinned fallback supabase@${pinnedVersion} via npx.`,
  );
  printGlobalInstallHint();
}

const fallbackResult = run("npx", ["-y", `supabase@${pinnedVersion}`, ...args]);
if (fallbackResult.error) {
  console.error(
    `error: Failed to execute pinned Supabase CLI fallback: ${fallbackResult.error.message}`,
  );
}
process.exit(fallbackResult.status);
