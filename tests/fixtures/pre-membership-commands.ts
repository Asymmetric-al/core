import { readdirSync, readFileSync } from "node:fs";

import { preMembershipEntries } from "../../scripts/verify/command-entry-boundaries.mjs";

const migrations = new URL("../../supabase/migrations/", import.meta.url);

function latestBody(name: string) {
  const pattern = new RegExp(
    `CREATE (?:OR REPLACE )?FUNCTION ${name.replace(".", "\\.")}\\([\\s\\S]*?AS \\$\\$([\\s\\S]*?)\\$\\$;`,
    "g",
  );
  let body: string | undefined;
  for (const file of readdirSync(migrations)
    .filter((entry) => /^\d{14}_.*\.sql$/.test(entry))
    .sort()) {
    const sql = readFileSync(new URL(file, migrations), "utf8");
    for (const match of sql.matchAll(pattern)) body = match[1];
  }
  if (body === undefined) throw new Error(`${name} is in no migration`);
  return body;
}

export function preMembershipCommandRows() {
  return preMembershipEntries.map(({ function: signature }) => ({
    function: signature,
    schema: "tenant_guard",
    owner: "tenant_guard",
    language: "plpgsql",
    definer: true,
    authenticated: true,
    service_role: false,
    anon: false,
    public_execute: false,
    body: latestBody(signature.slice(0, signature.indexOf("("))),
  }));
}
