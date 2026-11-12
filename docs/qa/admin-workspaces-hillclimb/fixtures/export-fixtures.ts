/**
 * Writes fixtures.json next to this file.
 *
 *   bun docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts
 *
 * Output is deterministic: rerunning produces a byte-identical file.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildFixtureBundle } from "./crm-contrib-fixtures";

const outputPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures.json",
);
const bundle = buildFixtureBundle();
const json = `${JSON.stringify(bundle, null, 1)}\n`;

if (process.argv.includes("--stdout")) {
  // Capture runners rebuild in memory; do not overwrite another run's data.
  process.stdout.write(json);
} else {
  writeFileSync(outputPath, json, "utf8");

  const counts = bundle.meta.counts;
  console.log(
    [
      `wrote ${outputPath} (${(json.length / 1024).toFixed(0)} KiB)`,
      `  crm records: ${counts.crmRecords}, notes: ${counts.crmNotes}, relationships: ${counts.crmRelationships}`,
      `  hub gifts: ${counts.contributionsHub}, contribution details: ${counts.contributionDetails}, needs-attention items: ${counts.needsAttentionItems}`,
      `  crm record details: ${Object.keys(bundle.details["GET /api/admin/crm/records/:recordId"]).length}`,
    ].join("\n"),
  );
}
