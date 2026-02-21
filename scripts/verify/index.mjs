import { spawnSync } from "node:child_process";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const TIMEOUT_MS = Number(process.env.VERIFY_TIMEOUT_MS ?? "5000");
const VERIFY_HTTP = process.env.VERIFY_HTTP === "1";
const ROUTES = ["/", "/login", "/register"];

function log(message) {
  console.log(`==> ${message}`);
}

function fail(message) {
  console.error(`==> FAIL ${message}`);
}

function toUrl(pathname) {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${base}${pathname}`;
}

async function requestCode(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(toUrl(pathname), {
      signal: controller.signal,
      redirect: "manual",
    });
    return response.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timeout);
  }
}

function runBunScript(script, passLabel, failLabel) {
  const result = spawnSync("bun", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    fail(failLabel);
    console.error(result.error.message);
    return false;
  }

  if (result.status !== 0) {
    fail(failLabel);
    return false;
  }

  log(passLabel);
  return true;
}

if (VERIFY_HTTP) {
  const serverCode = await requestCode("/");
  if (!serverCode) {
    fail("server up");
    console.error(
      `Dev server not running at ${BASE_URL}. Start it with: bun run dev`,
    );
    process.exit(1);
  }

  log("PASS server up");

  for (const route of ROUTES) {
    const code = await requestCode(route);
    if (code !== 200) {
      fail(`${route} (${code || "unknown"})`);
      process.exit(1);
    }
    log(`PASS ${route} (200)`);
  }
} else {
  log("Skipping HTTP route checks (set VERIFY_HTTP=1 to enable).");
}

log("Running workspace contract verification...");
if (
  !runBunScript(
    "verify:workspace-contract",
    "PASS workspace contract verify",
    "workspace contract verify",
  )
) {
  process.exit(1);
}

if (process.env.VERIFY_SUPABASE === "1") {
  log("Running Supabase verification...");
  if (
    !runBunScript("setup:verify", "PASS supabase verify", "supabase verify")
  ) {
    process.exit(1);
  }
} else {
  log("Skipping Supabase verification (set VERIFY_SUPABASE=1 to enable).");
}
