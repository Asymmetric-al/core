import fs from "node:fs/promises";

import { validateNodeVersion } from "./verify/node-version.mjs";

validateNodeVersion(
  process.versions.node,
  (
    await fs.readFile(new URL("../.node-version", import.meta.url), "utf8")
  ).trim(),
);

let hasFailure = false;

function log(message) {
  console.log(`==> ${message}`);
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
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function publicKeyType(value) {
  if (/^sb_publishable_\S+$/.test(value)) return "publishable";
  // This classification cannot authenticate a JWT. The Auth gateway validates
  // the actual API key below; decoding only rejects privileged public inputs.
  try {
    const parts = value.split(".");
    if (parts.length !== 3) return null;
    const claims = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
    return claims.role === "anon" ? "legacy-anon" : null;
  } catch {
    return null;
  }
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

const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
for (const name of required) {
  if (!process.env[name]) {
    fail(`Missing required env var: ${name}`);
  }
}

if (hasFailure) process.exit(1);

const supabaseUrl = stripCrLf(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, ""),
);
const supabaseAnonKey = stripCrLf(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

if (isPlaceholder(supabaseUrl)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder. Set it to your Supabase Project URL (Project Settings -> API).",
  );
}

if (isPlaceholder(supabaseAnonKey)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a placeholder. Set it to your Supabase publishable key (Project Settings -> API Keys).",
  );
}

if (!looksLikeUrl(supabaseUrl)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL must be HTTP(S) without credentials, query parameters or a fragment.",
  );
}

if (!publicKeyType(supabaseAnonKey)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY must be a browser-safe publishable key or supported legacy anon JWT. Secret and privileged keys are forbidden in NEXT_PUBLIC_* variables.",
  );
}

if (hasFailure) process.exit(1);

log("Checking Supabase Auth health...");
const healthCode = await fetchStatus(`${supabaseUrl}/auth/v1/health`, {
  headers: { apikey: supabaseAnonKey },
});
if (healthCode !== 200) {
  fail(
    healthCode === 0
      ? "Supabase Auth health check failed (no response). Verify network connectivity and NEXT_PUBLIC_SUPABASE_URL."
      : `Supabase Auth health check failed with HTTP ${healthCode}.`,
  );
}

log("Checking the public API key through Supabase Auth...");
const keyCode = await fetchStatus(`${supabaseUrl}/auth/v1/settings`, {
  // Publishable keys are API keys, not JWT user sessions. Legacy anon keys
  // also work in this header. Do not depend on REST's optional OpenAPI route.
  headers: { apikey: supabaseAnonKey },
});
if (keyCode !== 200) {
  fail(
    keyCode === 0
      ? "Supabase public-key check failed (no response). Verify network, URL and key."
      : `Supabase public-key check failed with HTTP ${keyCode}. Verify the project's publishable key in API Keys settings.`,
  );
}

if (hasFailure) process.exit(1);

log("Verification passed.");
