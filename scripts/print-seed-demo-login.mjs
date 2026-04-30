#!/usr/bin/env node
/**
 * Prints the deterministic email and seed passphrase from `supabase/seed.sql`
 * (first `auth.users` insert). Use after `supabase db reset --local` or any
 * flow that applies that seed against your Supabase project.
 *
 * Does not print service-role keys or project URLs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "..", "supabase", "seed.sql");

const sql = fs.readFileSync(seedPath, "utf8");

const emailMatch = sql.match(
  /INSERT INTO auth\.users[\s\S]*?'([^\s']+@[^\s']+)'[\s\S]*?extensions\.crypt\('([^']*)'::text/,
);
if (!emailMatch) {
  console.error(
    `[print-seed-demo-login] Could not parse demo auth user from ${seedPath}`,
  );
  process.exit(1);
}

const [, email, seedPhrase] = emailMatch;

console.log("Deterministic seed login (from supabase/seed.sql):");
console.log(`  email: ${email}`);
console.log(`  passphrase: ${seedPhrase}`);
console.log("");
console.log(
  "Use with the same Supabase project as NEXT_PUBLIC_SUPABASE_URL (see docs/auth/sign-in.md).",
);
