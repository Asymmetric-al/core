import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CRM_IDENTITY_CONCEPTS } from "../../../../packages/api/src/crm/identity/concepts";

// Resolved from this file, so the test also runs from a bare copy of the repo.
const MIGRATIONS_DIR = fileURLToPath(
  new URL("../../../../supabase/migrations/", import.meta.url),
);
const ORIGIN_MIGRATION = "20260508000413_crm_identity_mapping.sql";
// Same file selection and order as scripts/verify/supabase-migrations.mjs.
const CHAIN_FILE = /^\d{14}_.+\.sql$/;
const TYPE = String.raw`(?:"?public"?\.)?"?crm_link_entity_type"?`;
const CREATE_TYPE = new RegExp(
  String.raw`CREATE\s+TYPE\s+${TYPE}\s+AS\s+ENUM\s*\(([^)]*)\)`,
  "gi",
);
const ALTER_TYPE = new RegExp(
  String.raw`ALTER\s+TYPE\s+${TYPE}\s+([^;]*);`,
  "gi",
);
const DROP_TYPE = new RegExp(
  String.raw`DROP\s+TYPE\s+(?:IF\s+EXISTS\s+)?${TYPE}[\s;,]`,
  "gi",
);
// BEFORE/AFTER would reorder the enum, so only a plain append counts.
const ADD_VALUE = /^ADD\s+VALUE\s+(?:IF\s+NOT\s+EXISTS\s+)?'([^']+)'$/i;

function migrationChain(): string[] {
  return readdirSync(MIGRATIONS_DIR, { recursive: true, encoding: "utf8" })
    .filter((path) => CHAIN_FILE.test(basename(path)))
    .sort((a, b) => (basename(a) < basename(b) ? -1 : 1));
}

/** public.crm_link_entity_type as the migration chain defines it, in order. */
function enumFromMigrationChain() {
  const creates: string[] = [];
  const labels: string[] = [];
  const unsupported: string[] = [];

  for (const path of migrationChain()) {
    const sql = readFileSync(join(MIGRATIONS_DIR, path), "utf8");
    for (const [, body] of sql.matchAll(CREATE_TYPE)) {
      creates.push(path);
      labels.push(...[...body!.matchAll(/'([^']+)'/g)].map(([, l]) => l!));
    }
    for (const [statement, action] of sql.matchAll(ALTER_TYPE)) {
      const added = ADD_VALUE.exec(action!.trim());
      if (added) labels.push(added[1]!);
      else unsupported.push(`${path}: ${statement}`);
    }
    for (const [statement] of sql.matchAll(DROP_TYPE)) {
      unsupported.push(`${path}: ${statement.trim()}`);
    }
  }

  return { creates, labels, unsupported };
}

describe("CRM identity-link enum parity (migration chain <-> TypeScript)", () => {
  const chain = enumFromMigrationChain();

  it("defines the enum once and only ever appends values", () => {
    expect(chain.creates).toEqual([ORIGIN_MIGRATION]);
    expect(
      chain.unsupported,
      "RENAME VALUE, BEFORE/AFTER and other ALTER TYPE forms break the lockstep",
    ).toEqual([]);
    expect(new Set(chain.labels).size).toBe(chain.labels.length);
  });

  it("matches CRM_IDENTITY_CONCEPTS ids as the same ordered list", () => {
    expect(chain.labels.length).toBeGreaterThan(0);
    expect(
      CRM_IDENTITY_CONCEPTS.map((concept) => concept.id),
      "change public.crm_link_entity_type and concepts.ts together",
    ).toEqual(chain.labels);
  });
});
