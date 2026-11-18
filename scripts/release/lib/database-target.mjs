// Ties a migration connection string to the Supabase project the release
// environment names, before anything writes to it. Errors never repeat the
// connection string.
import { databaseUrlRoutingOverrides } from "../../../packages/env/src/database-url.mjs";

/** Hosted projects named in docs/ops/environments.md. */
export const KNOWN_PROJECT_REFS = Object.freeze({
  development: "pnmlrbgjiqzzsthsoikm",
  productionNamed: "btewedpsxwsjczvmegby",
});

const REF = /^[a-z0-9]{20}$/;
const ROLE = /^[a-z_][a-z0-9_]{0,62}$/;
const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);
const ENCRYPTED = new Set(["require", "verify-ca", "verify-full"]);

function parse(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("The release database connection is not a valid URL.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("The release database connection is not a Postgres URL.");
  }
  return url;
}

/** The project ref a hosted connection string addresses, or null. */
export function projectRefOfDatabaseUrl(databaseUrl) {
  const url = parse(databaseUrl);
  const host = url.hostname;
  const direct = /^db\.([a-z0-9]{20})\.supabase\.co$/.exec(host)?.[1];
  if (direct) return direct;
  if (host.endsWith(".pooler.supabase.com")) {
    return (
      /^[a-z_][a-z0-9_]*\.([a-z0-9]{20})$/.exec(
        decodeURIComponent(url.username),
      )?.[1] ?? null
    );
  }
  return null;
}

export function assertDatabaseTarget({
  databaseUrl,
  projectRef,
  role,
  forbiddenRefs = [],
  allowLoopback = false,
}) {
  if (!REF.test(projectRef ?? "")) {
    throw new Error(
      "The release environment names no valid Supabase project ref.",
    );
  }
  if (!ROLE.test(role ?? "")) {
    throw new Error("The release database role is not a plain role name.");
  }
  if (forbiddenRefs.includes(projectRef)) {
    throw new Error(
      `This release environment must not touch Supabase project ${projectRef}.`,
    );
  }
  const url = parse(databaseUrl);
  if (databaseUrlRoutingOverrides(url).length > 0) {
    throw new Error(
      "The release database connection carries routing overrides.",
    );
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (LOOPBACK.has(host)) {
    if (allowLoopback) return;
    throw new Error("A hosted release refuses a loopback database.");
  }
  const user = decodeURIComponent(url.username);
  const direct = host === `db.${projectRef}.supabase.co` && user === role;
  const pooled =
    host.endsWith(".pooler.supabase.com") && user === `${role}.${projectRef}`;
  if (!direct && !pooled) {
    throw new Error(
      `The release database connection does not address project ${projectRef} as ${role}.`,
    );
  }
  const sslmodes = url.searchParams.getAll("sslmode");
  if (sslmodes.length !== 1 || !ENCRYPTED.has(sslmodes[0])) {
    throw new Error(
      "The release database connection must set sslmode=require (or verify-ca, verify-full).",
    );
  }
}
