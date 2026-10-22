/**
 * Acceptance tests for GitHub issue #2067 addendum 4, engineering ruling 11
 * (Samson, 2026-10-20 11:03 PM PT): counts only — no row data or identifiers
 * in any `document_cutover` function result or in the proof.
 * Addendum 4: {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * - The pinned contract (./document-cutover-contract.ts) declares only
 *   numeric result columns, and the fake honours it.
 * - A run over a target seeded with distinctive ids, tenant ids, names,
 *   emails, URLs and storage paths records a proof (and prints output) that
 *   carries the counts but none of those values.
 *
 * The static and real-database return-type checks are in
 * ./migration-lockdown.acceptance.test.ts and
 * ./reader-role.integration.acceptance.test.ts.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { randomBytes } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  fakeDatabaseUrl,
  runCommand,
} from "./command-harness";
import {
  DOCUMENT_CUTOVER_FUNCTIONS,
  NUMERIC_RESULT_TYPES,
  READER_ROLE,
} from "./document-cutover-contract";
import { createFakePgModule, fakePg } from "./fake-postgres";
import { fakeDb } from "./fake-supabase";
import {
  InMemoryDocumentCutoverProofStore,
  PHASE_18_PROTOTYPE_DOCUMENT_TABLES,
} from "../../../../packages/api/src/document-cutover";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());

afterEach(() => {
  vi.restoreAllMocks();
  cleanupProofFiles();
});

const unique = (label: string) =>
  `acc2067-${label}-${randomBytes(6).toString("hex")}`;

/** Seed every prototype table and auth.users with distinctive values; returns them. */
function seedDistinctiveTarget(): string[] {
  cleanTarget();
  const values: string[] = [];
  const remember = (value: string) => {
    values.push(value);
    return value;
  };
  const tenant = remember(unique("tenant"));
  for (const table of PHASE_18_PROTOTYPE_DOCUMENT_TABLES) {
    fakeDb.tableRows.set(
      table,
      [1, 2].map(() => ({
        id: remember(unique(`${table}-id`)),
        tenant_id: tenant,
        name: remember(unique(`${table}-name`)),
        ...(table === "pdf_template_artifacts"
          ? {
              url: remember(`https://${unique("host")}.example.test/a.pdf`),
              storage_path: remember(unique("storage-path")),
              storage_bucket: remember(unique("bucket")),
            }
          : {}),
        ...(table === "pdf_templates"
          ? { migration_report: { note: remember(unique("report")) } }
          : {}),
        ...(table === "pdf_template_renders" ? { renderer: "docraptor" } : {}),
      })),
    );
  }
  fakeDb.users = [1, 2].map(() => ({
    id: remember(unique("user-id")),
    email: remember(`${unique("user")}@example.test`),
  }));
  return values;
}

describe("issue #2067 addendum 4 ruling 11 — counts only", () => {
  it("contract: every document_cutover result column is numeric", () => {
    for (const fn of DOCUMENT_CUTOVER_FUNCTIONS) {
      for (const column of fn.columns) {
        expect(
          NUMERIC_RESULT_TYPES.has(column.type),
          `${fn.name}.${column.name}`,
        ).toBe(true);
      }
    }
  });

  it("fake: on a seeded target every contract function returns only numeric values in exactly its contract columns", async () => {
    seedDistinctiveTarget();
    fakeDb.schemaVersion = "20260704140000";
    const pg = createFakePgModule(fakePg) as {
      Client: new (url: string) => {
        connect: () => Promise<void>;
        query: (
          text: string,
          values?: unknown[],
        ) => Promise<{ rows: Array<Record<string, unknown>> }>;
      };
    };
    const client = new pg.Client(fakeDatabaseUrl(READER_ROLE));
    await client.connect();
    for (const fn of DOCUMENT_CUTOVER_FUNCTIONS) {
      const params = fn.args.map(() => "pdf_templates");
      const placeholders = params.map((_, index) => `$${index + 1}`);
      const { rows } = await client.query(
        `select * from document_cutover.${fn.name}(${placeholders.join(", ")})`,
        params,
      );
      expect(rows, fn.name).toHaveLength(1);
      const row = rows[0] as Record<string, unknown>;
      expect(Object.keys(row).sort(), fn.name).toEqual(
        fn.columns.map((column) => column.name).sort(),
      );
      for (const value of Object.values(row)) {
        expect(String(value), fn.name).toMatch(/^\d+$/);
      }
    }
  });

  it("ruling 11: a no_go run over a seeded target records the counts, but no seeded id, tenant id, name, email, URL or storage path appears in the proof or the output", async () => {
    const seeded = seedDistinctiveTarget();
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: decisionArgs("no_go", allowlistedOwner()),
      env: LOCAL_TARGET_ENV,
      store,
    });
    const [proof] = await store.list();
    expect(proof, `${result.stdout}\n${result.stderr}`).toBeDefined();

    // The data was actually read: the counts are in the proof.
    const templates = proof?.evidence.find(
      (item) =>
        item.surfaceKind === "database_table" &&
        item.surfaceId === "pdf_templates",
    );
    expect(templates?.relianceCounts.rows).toBe(2);
    expect(templates?.relianceCounts.tenants).toBe(1);

    const haystack = `${JSON.stringify(proof)}\n${result.stdout}\n${result.stderr}`;
    expect(seeded.filter((value) => haystack.includes(value))).toEqual([]);
  });
});
