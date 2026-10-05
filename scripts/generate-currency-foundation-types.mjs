/** Extract scoped generated mirrors without replacing Core's application types. */
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const input = process.argv[2];
if (!input)
  throw new Error(
    "Usage: bun scripts/generate-currency-foundation-types.mjs <supabase-generated-public-types.ts>",
  );
const source = readFileSync(input, "utf8");
const file = ts.createSourceFile(input, source, ts.ScriptTarget.Latest, true);
const database = file.statements.find(
  (node) => ts.isTypeAliasDeclaration(node) && node.name.text === "Database",
);
function member(type, name) {
  if (!type || !ts.isTypeLiteralNode(type))
    throw new Error(`Missing generated type ${name}`);
  const found = type.members.find((node) => node.name?.getText(file) === name);
  if (!found || !ts.isPropertySignature(found))
    throw new Error(`Missing generated member ${name}`);
  return found;
}
const tables = member(member(database?.type, "public").type, "Tables").type;
const scoped = [
  "campaigns",
  "currency_metadata",
  "currency_rate_snapshots",
].map((name) => member(tables, name).getText(file));
const output = `// Generated from Supabase CLI public schema output. Do not hand-edit.\n// Regenerate with scripts/generate-currency-foundation-types.mjs.\ntype Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\n\nexport type CurrencyFoundationTables = {\n${scoped.join("\n")}\n};\n\nexport type CurrencyMetadataRow = CurrencyFoundationTables["currency_metadata"]["Row"];\nexport type CurrencyRateSnapshotRow = CurrencyFoundationTables["currency_rate_snapshots"]["Row"];\n`;
writeFileSync(
  new URL(
    "../packages/database/types/currency-foundation.generated.ts",
    import.meta.url,
  ),
  output,
);
