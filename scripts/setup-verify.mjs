import fs from "node:fs/promises";

let hasFailure = false;

function log(message) {
  console.log(`==> ${message}`);
}

function warn(message) {
  console.warn(`warning: ${message}`);
}

function fail(message) {
  console.error(`error: ${message}`);
  hasFailure = true;
}

function stripCrLf(value) {
  return String(value ?? "").replace(/[\r\n]/g, "");
}

function isPlaceholder(value) {
  const v = stripCrLf(value);
  if (!v) return true;
  if (v === "your-anon-key") return true;
  if (v === "your_anon_key") return true;
  if (v === "your-anon-key-here") return true;
  if (v === "changeme") return true;
  if (v === "TODO") return true;
  if (v === "https://your-project.supabase.co") return true;
  if (v.includes("your-project.supabase.co")) return true;
  return false;
}

function looksLikeUrl(value) {
  try {
    const url = new URL(stripCrLf(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function looksLikeSupabaseAnonJwt(value) {
  return stripCrLf(value).startsWith("eyJ");
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const idx = trimmed.indexOf("=");
  if (idx <= 0) return null;
  const key = trimmed.slice(0, idx).trim();
  let value = trimmed.slice(idx + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

async function loadDotEnvLocal() {
  try {
    const raw = await fs.readFile(".env.local", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    }
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }
}

async function fetchStatus(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      ...options,
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

await loadDotEnvLocal();

const required = ["NEXT_PUBLIC_SUPABASE_URL"];
for (const name of required) {
  if (!process.env[name]) {
    fail(`Missing required env var: ${name}`);
  }
}

const supabasePublicKey = stripCrLf(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "",
);

if (!supabasePublicKey) {
  fail(
    "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

if (hasFailure) process.exit(1);

const supabaseUrl = stripCrLf(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, ""),
);
const supabaseKeySource = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  : "NEXT_PUBLIC_SUPABASE_ANON_KEY";

if (isPlaceholder(supabaseUrl)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder. Set it to your Supabase Project URL (Project Settings -> API).",
  );
}

if (isPlaceholder(supabasePublicKey)) {
  fail(
    `${supabaseKeySource} appears to be a placeholder. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase Project Settings -> API.`,
  );
}

if (!looksLikeUrl(supabaseUrl)) {
  fail(
    `NEXT_PUBLIC_SUPABASE_URL must start with http:// or https:// (got: ${supabaseUrl})`,
  );
}

if (supabasePublicKey.startsWith("sb_secret_")) {
  fail(
    `${supabaseKeySource} looks like a secret key (sb_secret_*). Do NOT use secrets in NEXT_PUBLIC_* vars. Use a Supabase publishable key or legacy anon public key (Project Settings -> API).`,
  );
}

if (hasFailure) process.exit(1);

if (
  !supabasePublicKey.startsWith("sb_publishable_") &&
  !looksLikeSupabaseAnonJwt(supabasePublicKey)
) {
  warn(
    `${supabaseKeySource} does not look like a Supabase publishable key (sb_publishable_*) or legacy anon JWT (usually starts with eyJ...). If the REST check fails, re-copy the public API key from Project Settings -> API.`,
  );
}

log(`Checking Supabase host reachability (${supabaseUrl})...`);
const hostCode = await fetchStatus(supabaseUrl);
if (![200, 301, 302, 401, 403, 404].includes(hostCode)) {
  if (hostCode === 0) {
    fail(
      "Supabase URL check failed (no response). Verify network connectivity and NEXT_PUBLIC_SUPABASE_URL.",
    );
  } else {
    fail(
      `Supabase URL check failed with HTTP ${hostCode}. Verify NEXT_PUBLIC_SUPABASE_URL.`,
    );
  }
}

const restRoot = `${supabaseUrl}/rest/v1/`;
log("Checking anon key is accepted by Supabase REST API...");
const restCode = await fetchStatus(restRoot, {
  headers: {
    apikey: supabasePublicKey,
    Authorization: `Bearer ${supabasePublicKey}`,
  },
});

if (![200, 404].includes(restCode)) {
  if (restCode === 401 || restCode === 403) {
    fail(
      `Supabase public key was rejected (HTTP ${restCode}). Ensure ${supabaseKeySource} belongs to this project URL (Project Settings -> API).`,
    );
  } else if (restCode === 0) {
    fail(
      "Supabase REST check failed (no response). Verify network connectivity, URL, and key.",
    );
  } else {
    fail(
      `Supabase REST check failed with HTTP ${restCode}. Verify network, URL, and key.`,
    );
  }
}

if (hasFailure) process.exit(1);

log("Verification passed.");
