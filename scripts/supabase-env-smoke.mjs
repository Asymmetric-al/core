/**
 * Smoke test: load `.env.local` and verify Supabase REST + Auth reachability.
 *
 * - Database: PostgREST via `@supabase/supabase-js` (prefers service role).
 * - Auth service: `GET /auth/v1/health` with anon key (always on).
 * - Optional password sign-in: `AUTH_SMOKE_EMAIL` + `AUTH_SMOKE_PASSWORD`, or
 *   falls back to `DEMO_ADMIN_EMAIL` + `DEMO_PASSWORD`.
 *
 * Run from repo root: `node scripts/supabase-env-smoke.mjs`
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const smokeEmail =
  process.env.AUTH_SMOKE_EMAIL || process.env.DEMO_ADMIN_EMAIL || "";
const smokePassword =
  process.env.AUTH_SMOKE_PASSWORD || process.env.DEMO_PASSWORD || "";

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is missing in .env.local");
if (!anon) {
  fail(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local",
  );
}

const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Database (PostgREST): `campaigns` exists in foundation schema; service role bypasses RLS.
if (service) {
  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error, count } = await admin
    .from("campaigns")
    .select("id", { count: "exact", head: true });
  if (error) {
    fail(
      `PostgREST / service role DB check failed: ${error.message} (code ${error.code ?? "n/a"})`,
    );
  }
  console.log(
    `OK: database (PostgREST) — campaigns head count=${count ?? "unknown"}`,
  );
} else {
  const { error } = await anonClient.from("campaigns").select("id").limit(1);
  if (error) {
    fail(
      `PostgREST anon query failed: ${error.message}. Set SUPABASE_SERVICE_ROLE_KEY for a definitive DB check, or verify RLS allows read.`,
    );
  }
  console.log(
    "OK: database (PostgREST) — anon can query campaigns (or empty set)",
  );
}

// Auth API (GoTrue) — proves URL + anon key work with the Auth stack.
const healthRes = await fetch(`${url}/auth/v1/health`, {
  headers: {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  },
});
if (!healthRes.ok) {
  const body = await healthRes.text();
  fail(`Auth health check HTTP ${healthRes.status}: ${body.slice(0, 200)}`);
}
const healthJson = await healthRes.json().catch(() => ({}));
console.log(
  `OK: Supabase Auth (GoTrue) — health name=${healthJson.name ?? "unknown"} version=${healthJson.version ?? "n/a"}`,
);

// Optional: password grant — only if email+password provided; failure is a warning, not exit 1.
if (smokeEmail && smokePassword) {
  const { data, error } = await anonClient.auth.signInWithPassword({
    email: smokeEmail,
    password: smokePassword,
  });
  if (error) {
    console.warn(
      `WARN: password sign-in failed for ${smokeEmail}: ${error.message}. ` +
        `Hosted projects need a matching auth user (run \`bash ./scripts/seed-demo.sh hosted\` after migrations, or set AUTH_SMOKE_EMAIL / AUTH_SMOKE_PASSWORD to a real test user). ` +
        `Repo seed default is demo-owner@givehope.test / demo-password when seed has been applied.`,
    );
  } else if (data.session) {
    console.log(
      `OK: Supabase Auth — signed in as ${smokeEmail} (user id ${data.user?.id})`,
    );
  }
} else {
  console.log(
    "SKIP: password sign-in — set AUTH_SMOKE_EMAIL + AUTH_SMOKE_PASSWORD (or DEMO_ADMIN_EMAIL + DEMO_PASSWORD) to verify email/password auth.",
  );
}

console.log("Smoke test finished.");
