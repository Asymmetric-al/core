// The login passwords the repository publishes: the ones supabase/seed.sql
// gives its logins (`crypt('<password>', ...)`). Local and CI databases keep
// them. A hosted database never does (record D-24): the release job's hosted
// rebuild replaces them right after it seeds, and the demo-user seeder refuses
// one for a hosted project.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const SEED_PATH = "supabase/seed.sql";

/** Every password literal the seed hashes with crypt(), unescaped. */
export function publishedLoginPasswords(root = repoRoot) {
  const seed = readFileSync(path.join(root, SEED_PATH), "utf8");
  const passwords = new Set();
  for (const [, literal] of seed.matchAll(/\bcrypt\(\s*'((?:[^']|'')*)'/g))
    passwords.add(literal.replaceAll("''", "'"));
  return [...passwords];
}
