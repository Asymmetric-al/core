import { readdirSync, readFileSync } from "node:fs";

import { preMembershipEntries } from "../../scripts/verify/command-entry-boundaries.mjs";

const migrations = new URL("../../supabase/migrations/", import.meta.url);

export function preMembershipCommandRows() {
  const file = readdirSync(migrations).find((name) =>
    /^\d{14}_account_claim_commands\.sql$/.test(name),
  );
  if (!file) throw new Error("the account claim migration is missing");
  const sql = readFileSync(new URL(file, migrations), "utf8");
  return preMembershipEntries.map(({ function: signature }) => {
    const name = signature.slice(0, signature.indexOf("("));
    const body = new RegExp(
      `^CREATE FUNCTION ${name.replace(".", "\\.")}\\([\\s\\S]*?^AS \\$\\$([\\s\\S]*?)^\\$\\$;`,
      "m",
    ).exec(sql)?.[1];
    if (body === undefined) throw new Error(`${name} is not in ${file}`);
    return {
      function: signature,
      schema: "tenant_guard",
      owner: "tenant_guard",
      language: "plpgsql",
      definer: true,
      authenticated: true,
      service_role: false,
      anon: false,
      public_execute: false,
      body,
    };
  });
}
