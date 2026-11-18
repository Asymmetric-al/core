/**
 * #2708: the static inventory of `.select(...)` calls that the live sweep
 * executes. Pure: no database.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  inventorySelects,
  inventorySelectsInSource,
  type SelectSite,
} from "./select-inventory";

const one = (source: string): SelectSite[] =>
  inventorySelectsInSource("pkg/file.ts", source);

describe("inventorySelectsInSource", () => {
  it("reads the table and a string-literal select with its line", () => {
    const sites = one(
      [
        "export async function read(client) {",
        '  return client.from("profiles").select("id, email").eq("id", 1);',
        "}",
      ].join("\n"),
    );
    expect(sites).toEqual([
      {
        file: "pkg/file.ts",
        line: 2,
        schema: null,
        table: "profiles",
        select: "id, email",
        returning: false,
      },
    ]);
  });

  it("resolves a same-file const, a template and a ${CONST} substitution", () => {
    const sites = one(
      [
        'const DONOR = "id, name";',
        "const TASK_SELECT = `",
        "  id,",
        "  donor:donors!missionary_tasks_donor_id_fkey(${DONOR})",
        "` as const;",
        'const read = (c) => c.from("missionary_tasks").select(TASK_SELECT);',
      ].join("\n"),
    );
    expect(sites).toHaveLength(1);
    expect(sites[0]).toMatchObject({
      table: "missionary_tasks",
      line: 6,
    });
    expect(sites[0]?.select?.replace(/\s+/g, "")).toBe(
      "id,donor:donors!missionary_tasks_donor_id_fkey(id,name)",
    );
  });

  it("resolves an array of literals joined by a literal separator", () => {
    const sites = one(
      [
        'const COLUMNS = ["id", "tenant_id", "name"].join(", ");',
        'export const load = (c) => c.from("pdf_templates").select(COLUMNS).limit(5);',
      ].join("\n"),
    );
    expect(sites[0]).toMatchObject({
      table: "pdf_templates",
      select: "id, tenant_id, name",
    });
  });

  it("finds the table through filters, .schema() and a write before the select", () => {
    const sites = one(
      [
        "async function f(c) {",
        '  await c.schema("authz").from("memberships").select("role").eq("a", 1);',
        '  await c.from("posts").insert({ a: 1 }).select("id").single();',
        '  await c.from("posts").select().limit(1);',
        "}",
      ].join("\n"),
    );
    expect(sites).toEqual([
      expect.objectContaining({
        line: 2,
        schema: "authz",
        table: "memberships",
        select: "role",
        returning: false,
      }),
      expect.objectContaining({
        line: 3,
        table: "posts",
        select: "id",
        returning: true,
      }),
      expect.objectContaining({ line: 4, table: "posts", select: "*" }),
    ]);
  });

  it("lists, not drops, a select it cannot resolve, with the reason", () => {
    const sites = one(
      [
        "async function f(c, table, columns, query) {",
        "  await c.from(table).select('id');",
        '  await c.from("donors").select(columns);',
        "  await query.select('id');",
        "}",
      ].join("\n"),
    );
    expect(sites.map((s) => [s.line, s.table, s.select])).toEqual([
      [2, null, "id"],
      [3, "donors", null],
      [4, null, "id"],
    ]);
    for (const site of sites) expect(site.unresolved).toMatch(/\S/);
  });

  it("ignores rpc() selects and .select calls that are not Supabase chains", () => {
    const sites = one(
      [
        "async function f(c, el) {",
        '  await c.rpc("current_user_assignments").select("tenant_id");',
        "  el.select();",
        "  const x = [1].select;",
        "}",
      ].join("\n"),
    );
    expect(sites).toEqual([]);
  });
});

describe("inventorySelects (files)", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "al2708-inventory-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("follows a relative named import to an exported const", () => {
    mkdirSync(path.join(dir, "src", "donations"), { recursive: true });
    writeFileSync(
      path.join(dir, "src", "donations", "select.ts"),
      'export const WITH_PARTIES = "*, donor:donors(id)";\n',
    );
    writeFileSync(
      path.join(dir, "src", "donations", "index.ts"),
      [
        'import { WITH_PARTIES } from "./select";',
        'export const get = (c) => c.from("donations").select(WITH_PARTIES);',
      ].join("\n"),
    );
    writeFileSync(
      path.join(dir, "src", "donations", "read.test.ts"),
      'export const t = (c) => c.from("x").select("y");\n',
    );
    const sites = inventorySelects({ repoRoot: dir, roots: ["src"] });
    expect(sites).toEqual([
      expect.objectContaining({
        file: "src/donations/index.ts",
        table: "donations",
        select: "*, donor:donors(id)",
      }),
    ]);
  });
});

describe("the real packages/api inventory", () => {
  const repoRoot = path.resolve(import.meta.dirname, "../../..");
  const sites = inventorySelects({ repoRoot, roots: ["packages/api/src"] });

  it("includes the missionary-portal task select the 23f2bd454 defect lived in", () => {
    const task = sites.filter(
      (s) =>
        s.file === "packages/api/src/missionary-portal/service.ts" &&
        s.table === "missionary_tasks",
    );
    expect(task.length).toBeGreaterThan(0);
    for (const site of task)
      expect(site.select).toContain(
        "donor:donors!missionary_tasks_donor_id_fkey",
      );
  });

  it("resolves most selects, so the sweep is not vacuous", () => {
    const resolved = sites.filter((s) => s.table && s.select);
    expect(resolved.length).toBeGreaterThan(200);
  });
});
