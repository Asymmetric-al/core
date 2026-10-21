/**
 * Acceptance tests for GitHub issue #2067 addendum 4 — the migration is locked
 * down (criterion 5, static half) and nothing is exposed or committed that
 * shouldn't be (criterion 4).
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * Reads the forward migration(s) under supabase/migrations/ that create the
 * `document_cutover` schema and checks the SQL text. The same properties are
 * proved on a real database (owner, effective privileges, 42501 for anon and
 * authenticated, default privileges, forced RLS) by
 * ./reader-role.integration.acceptance.test.ts.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./command-harness";
import { committedExposedSchemas } from "./fake-supabase";
import { PHASE_18_PROTOTYPE_DOCUMENT_TABLES } from "../../../../packages/api/src/document-cutover";

const MIGRATIONS_DIR = path.join(REPO_ROOT, "supabase", "migrations");
const READER = "document_cutover_reader";
const REVOKED_ROLES = ["public", "anon", "authenticated", "service_role"];
const DEFAULT_PRIVILEGE_ROLES = ["anon", "authenticated", "service_role"];

interface MigrationFunction {
  file: string;
  name: string;
  attributes: string;
  body: string;
}

function documentCutoverMigrations(): Array<{ file: string; sql: string }> {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d{14}_.*\.sql$/.test(name))
    .sort()
    .map((file) => ({
      file,
      sql: readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"),
    }))
    .filter(({ sql }) =>
      /create\s+schema\s+(if\s+not\s+exists\s+)?"?document_cutover"?/i.test(
        stripComments(sql),
      ),
    );
}

function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
}

function allSql(): string {
  return documentCutoverMigrations()
    .map(({ sql }) => stripComments(sql))
    .join("\n;\n");
}

const FUNCTION_RE =
  /create\s+(?:or\s+replace\s+)?function\s+"?document_cutover"?\s*\.\s*"?([a-z_][a-z0-9_]*)"?\s*\(([\s\S]*?)\)\s*returns\b([\s\S]*?)\bas\s+(\$[a-z_]*\$)([\s\S]*?)\4([^;]*);/gi;

function migrationFunctions(): MigrationFunction[] {
  const out: MigrationFunction[] = [];
  for (const { file, sql } of documentCutoverMigrations()) {
    for (const match of stripComments(sql).matchAll(FUNCTION_RE)) {
      out.push({
        file,
        name: (match[1] as string).toLowerCase(),
        attributes: `${match[3] ?? ""} ${match[6] ?? ""}`,
        body: match[5] ?? "",
      });
    }
  }
  return out;
}

/** Top-level statements with function bodies removed, lower-cased, whitespace collapsed. */
function statements(): string[] {
  return allSql()
    .replace(/(\$[a-z_]*\$)[\s\S]*?\1/gi, "$$body$$")
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean);
}

function granteeList(statement: string, keyword: "to" | "from"): string[] {
  const match = new RegExp(
    `\\s${keyword}\\s+(.+?)(\\s+(cascade|restrict|granted by .*))?$`,
  ).exec(statement);
  return (match?.[1] ?? "")
    .split(",")
    .map((role) => role.replace(/"/g, "").trim());
}

function functionsCovered(
  statement: string,
  verb: "revoke" | "grant",
): "all" | Set<string> {
  if (
    new RegExp(
      `^${verb}\\s.*\\son\\s+all\\s+(functions|routines)\\s+in\\s+schema\\s+"?document_cutover"?\\s`,
    ).test(statement)
  ) {
    return "all";
  }
  const names = new Set<string>();
  if (
    new RegExp(`^${verb}\\s.*\\son\\s+(function|routine)s?\\s`).test(statement)
  ) {
    for (const match of statement.matchAll(
      /"?document_cutover"?\s*\.\s*"?([a-z_][a-z0-9_]*)"?/g,
    )) {
      names.add(match[1] as string);
    }
  }
  return names;
}

function requireMigration(): void {
  expect(
    documentCutoverMigrations().map(({ file }) => file),
    "addendum 4 item 1: no forward migration under supabase/migrations/ creates schema document_cutover",
  ).not.toEqual([]);
}

describe("issue #2067 addendum 4 — criterion 4: no schema exposure and no secret in the repo", () => {
  it("criterion 4: supabase/config.toml still exposes exactly public and graphql_public (document_cutover is not exposed)", () => {
    expect(committedExposedSchemas()).toEqual(["public", "graphql_public"]);
  });

  it("criterion 4: the repo contains no password for document_cutover_reader (no ALTER ROLE ... PASSWORD '<literal>', no connection string with an inline password)", () => {
    const files = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    )
      .split("\0")
      .filter(Boolean)
      .filter((file) => !/(^|\/)node_modules\//.test(file));
    const passwordLiteral =
      /document_cutover_reader[^;\n]*\bpassword\s+'(?!<[^'>]*>')[^']+'/i;
    const inlineUriPassword =
      /postgres(?:ql)?:\/\/document_cutover_reader(?:\.[a-z0-9]+)?:(?![<$[{])[^@\s'"`]+@/i;
    const hits: string[] = [];
    for (const file of files) {
      const full = path.join(REPO_ROOT, file);
      let size: number;
      try {
        const stat = statSync(full);
        if (!stat.isFile()) continue;
        size = stat.size;
      } catch {
        continue;
      }
      if (size > 2 * 1024 * 1024) continue;
      const text = readFileSync(full, "utf8");
      if (!text.includes("document_cutover_reader")) continue;
      text.split("\n").forEach((line, index) => {
        if (passwordLiteral.test(line) || inlineUriPassword.test(line)) {
          hits.push(`${file}:${index + 1}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});

describe("issue #2067 addendum 4 — criterion 5: the migration is locked down (static SQL)", () => {
  it("addendum 4 item 1: a forward migration creates schema document_cutover with read functions", () => {
    requireMigration();
    expect(migrationFunctions().length).toBeGreaterThan(0);
  });

  it("addendum 4 item 1: the functions cover the user census (auth.users), the schema version (supabase_migrations.schema_migrations), Storage (storage.objects) and every prototype detector table", () => {
    requireMigration();
    const bodies = migrationFunctions()
      .map(({ body }) => body.toLowerCase())
      .join("\n");
    const relations = [
      "auth.users",
      "supabase_migrations.schema_migrations",
      "storage.objects",
      ...PHASE_18_PROTOTYPE_DOCUMENT_TABLES.map((table) => `public.${table}`),
    ];
    // A table counts as covered when a body names it qualified
    // (`public.pdf_templates`) or, for a whitelisted dynamic census
    // (`format('select ... from public.%I', p_table)`), as a literal.
    const missing = relations.filter((relation) => {
      const [schema, table] = relation.split(".") as [string, string];
      const qualified = new RegExp(
        `"?${schema}"?\\s*\\.\\s*"?${table}"?\\b`,
      ).test(bodies);
      const literal =
        schema === "public" && new RegExp(`'${table}'`).test(bodies);
      return !qualified && !literal;
    });
    expect(missing).toEqual([]);
  });

  it("criterion 5: every document_cutover function is SECURITY DEFINER", () => {
    requireMigration();
    const bad = migrationFunctions()
      .filter(({ attributes }) => !/security\s+definer/i.test(attributes))
      .map(({ name }) => name);
    expect(bad).toEqual([]);
  });

  it("criterion 5: every document_cutover function sets search_path = ''", () => {
    requireMigration();
    const bad = migrationFunctions()
      .filter(
        ({ attributes }) =>
          !/\bset\s+search_path\s*(=|to)\s*''/i.test(attributes),
      )
      .map(({ name }) => name);
    expect(bad).toEqual([]);
  });

  it("criterion 5: every document_cutover function sets row_security = off", () => {
    requireMigration();
    const bad = migrationFunctions()
      .filter(
        ({ attributes }) =>
          !/\bset\s+row_security\s*(=|to)\s*'?off'?/i.test(attributes),
      )
      .map(({ name }) => name);
    expect(bad).toEqual([]);
  });

  it("criterion 5: no document_cutover function body writes (no DML, DDL, GRANT, COPY, sequence or config writes)", () => {
    requireMigration();
    const write =
      /\b(insert\s+into|update\s+[a-z_".]+\s+set|delete\s+from|truncate|merge\s+into|create\s|alter\s|drop\s|grant\s|revoke\s|copy\s|nextval\s*\(|setval\s*\(|set_config\s*\(|pg_advisory|lo_import|lo_unlink)/i;
    const bad = migrationFunctions()
      .filter(({ body }) => write.test(body))
      .map(({ name }) => name);
    expect(bad).toEqual([]);
  });

  it("criterion 5: no document_cutover function is handed to an owner other than postgres", () => {
    requireMigration();
    const bad = statements().filter(
      (statement) =>
        /^alter\s+(function|routine|schema)\s+"?document_cutover"?/.test(
          statement,
        ) &&
        /\sowner\s+to\s/.test(statement) &&
        !/\sowner\s+to\s+"?postgres"?$/.test(statement),
    );
    expect(bad).toEqual([]);
  });

  it("criterion 5: the schema-version function returns versions only and never the statements column", () => {
    requireMigration();
    const versionFunctions = migrationFunctions().filter(({ body }) =>
      /schema_migrations/i.test(body),
    );
    expect(versionFunctions.length).toBeGreaterThan(0);
    for (const fn of versionFunctions) {
      expect(fn.body, fn.name).not.toMatch(/\bstatements\b/i);
      expect(fn.body, fn.name).not.toMatch(/select\s+(distinct\s+)?\*|\.\*/i);
      expect(fn.attributes, fn.name).not.toMatch(/\bstatements\b/i);
      expect(fn.attributes, fn.name).not.toMatch(
        /returns\s+setof\s+"?supabase_migrations/i,
      );
    }
  });

  it.each(REVOKED_ROLES)(
    "criterion 5: REVOKE ALL on schema document_cutover from %s",
    (role) => {
      requireMigration();
      const revoked = statements().some(
        (statement) =>
          /^revoke\s+all(\s+privileges)?\s+on\s+schema\s+"?document_cutover"?\s+from\s/.test(
            statement,
          ) && granteeList(statement, "from").includes(role),
      );
      expect(revoked).toBe(true);
    },
  );

  it.each(REVOKED_ROLES)(
    "criterion 5: REVOKE ALL on every document_cutover function from %s",
    (role) => {
      requireMigration();
      const names = migrationFunctions().map(({ name }) => name);
      const covered = new Set<string>();
      for (const statement of statements()) {
        if (!/^revoke\s+all(\s+privileges)?\s+on\s/.test(statement)) continue;
        if (!granteeList(statement, "from").includes(role)) continue;
        const scope = functionsCovered(statement, "revoke");
        if (scope === "all") names.forEach((name) => covered.add(name));
        else scope.forEach((name) => covered.add(name));
      }
      expect(names.length).toBeGreaterThan(0);
      expect(names.filter((name) => !covered.has(name))).toEqual([]);
    },
  );

  it("criterion 5: no GRANT on document_cutover objects to PUBLIC, anon, authenticated or service_role", () => {
    requireMigration();
    const bad = statements().filter(
      (statement) =>
        /^grant\s/.test(statement) &&
        /document_cutover(?!_reader)/.test(
          statement.split(/\sto\s/)[0] ?? "",
        ) &&
        granteeList(statement, "to").some((role) =>
          REVOKED_ROLES.includes(role),
        ),
    );
    expect(bad).toEqual([]);
  });

  it("criterion 5: document_cutover_reader is created NOLOGIN, with no password, superuser, bypassrls, createrole or createdb", () => {
    requireMigration();
    // Searched in the full SQL, DO blocks included: roles are cluster-wide,
    // so an idempotent migration creates the role inside a DO block.
    const fullSql = allSql().replace(/\s+/g, " ").toLowerCase();
    const create = new RegExp(
      `create\\s+role\\s+"?${READER}"?(\\s[^;]*)?(?=;|\\s*end\\b)`,
    ).exec(fullSql)?.[0];
    expect(create, "no CREATE ROLE document_cutover_reader").toBeDefined();
    expect(create).toMatch(/\bnologin\b/);
    expect(create).not.toMatch(/(^|\s)login\b/);
    expect(create).not.toMatch(/\bpassword\b/);
    expect(create).not.toMatch(
      /(^|\s)(superuser|bypassrls|createrole|createdb|replication)\b/,
    );
    const alters = [
      ...fullSql.matchAll(
        new RegExp(`alter\\s+(role|user)\\s+"?${READER}"?\\s[^;]*`, "g"),
      ),
    ].map((match) => match[0]);
    for (const alter of alters) {
      expect(alter).not.toMatch(/(^|\s)(login|password|superuser|bypassrls)\b/);
    }
  });

  it("criterion 5: document_cutover_reader holds only USAGE on schema document_cutover and EXECUTE on its functions (no table, sequence, Storage or role grants)", () => {
    requireMigration();
    const toReader = statements().filter(
      (statement) =>
        /^grant\s/.test(statement) &&
        granteeList(statement, "to").includes(READER),
    );
    const allowed = toReader.filter(
      (statement) =>
        /^grant\s+usage\s+on\s+schema\s+"?document_cutover"?\s+to\s/.test(
          statement,
        ) ||
        (/^grant\s+execute\s+on\s/.test(statement) &&
          functionsCovered(statement, "grant") !== undefined &&
          (functionsCovered(statement, "grant") === "all" ||
            (functionsCovered(statement, "grant") as Set<string>).size > 0) &&
          !/\son\s+(table|sequence|all\s+tables|all\s+sequences)\b/.test(
            statement,
          )),
    );
    expect(
      toReader.filter((statement) => !allowed.includes(statement)),
    ).toEqual([]);
    expect(
      toReader.some((statement) =>
        /^grant\s+usage\s+on\s+schema/.test(statement),
      ),
    ).toBe(true);
    const names = migrationFunctions().map(({ name }) => name);
    const executable = new Set<string>();
    for (const statement of toReader) {
      if (!/^grant\s+execute\s/.test(statement)) continue;
      const scope = functionsCovered(statement, "grant");
      if (scope === "all") names.forEach((name) => executable.add(name));
      else scope.forEach((name) => executable.add(name));
    }
    expect(names.filter((name) => !executable.has(name))).toEqual([]);
  });

  it.each(DEFAULT_PRIVILEGE_ROLES)(
    "criterion 5: ALTER DEFAULT PRIVILEGES in schema document_cutover revokes from %s",
    (role) => {
      requireMigration();
      const hardened = statements().some(
        (statement) =>
          /^alter\s+default\s+privileges\s+(for\s+(role|user)\s+[^ ]+\s+)?in\s+schema\s+"?document_cutover"?\s+revoke\s/.test(
            statement,
          ) && granteeList(statement, "from").includes(role),
      );
      expect(hardened).toBe(true);
    },
  );
});
