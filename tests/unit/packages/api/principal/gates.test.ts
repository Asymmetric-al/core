import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { TA, TB, TC, U1, fakeReader, row } from "./fixtures";
import { resolveActiveAssignment } from "../../../../../packages/api/src/principal/assignment";

import type {
  AssignmentReader,
  ResolveAssignmentInput,
} from "../../../../../packages/api/src/principal/types";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const PRINCIPAL_DIR = "packages/api/src/principal";
const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

function sources(dir = path.join(repoRoot, PRINCIPAL_DIR)): [string, string][] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return sources(p);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [
          [path.relative(repoRoot, p), readFileSync(p, "utf8")] as [
            string,
            string,
          ],
        ]
      : [];
  });
}

type Resolve = (
  input: ResolveAssignmentInput,
  reader: AssignmentReader,
) => Promise<{ ok: boolean; assignment?: unknown; reason?: string }>;

/**
 * Gate 2 (assignment half): user U1 holds a TA staff hat and a TB donor hat.
 * Each fanned-out request gets exactly its own hat's tenant; a client-supplied
 * tenant never replaces the row's; the two hats never merge.
 */
async function gate2Violations(resolve: Resolve): Promise<string[]> {
  const staffTA = row(TA, "staff", "finance");
  const donorTB = row(TB, "donor");
  const rows = [donorTB, staffTA];
  const out: string[] = [];
  const results = await Promise.all(
    rows.map((r) =>
      resolve({ userId: U1, proposedAssignmentId: r.id }, fakeReader(rows)),
    ),
  );
  results.forEach((res, i) => {
    const a = res.assignment as { assignmentId?: string; tenantId?: unknown };
    if (!res.ok || a?.assignmentId !== rows[i]!.id)
      out.push(`hat ${i}: not resolved to its own row`);
    else if (a.tenantId !== rows[i]!.tenant_id)
      out.push(`hat ${i}: tenant ${String(a.tenantId)} is not its row's`);
    if (Object.values({ ...res, ...a }).some(Array.isArray))
      out.push(`hat ${i}: result carries an array (merged hats)`);
  });
  const forged = await resolve(
    { userId: U1, proposedAssignmentId: staffTA.id, expectedTenantId: TB },
    fakeReader(rows),
  );
  if (forged.ok) out.push("client tenant TB accepted for the TA hat");
  const unheld = await resolve(
    { userId: U1, expectedTenantId: TC },
    fakeReader(rows),
  );
  if (unheld.ok) out.push("client tenant TC (no membership) accepted");
  const merged = await resolve({ userId: U1 }, fakeReader(rows));
  if (merged.ok) out.push("two tenants without a proposal resolved to one");
  return out;
}

describe("Gate 2 (assignment half, criterion 9 S)", () => {
  const scratch = mkdtempSync(path.join(tmpdir(), "core-principal-gate2-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it("resolveActiveAssignment keeps each fanned-out hat in its own tenant", async () => {
    expect(await gate2Violations(resolveActiveAssignment)).toEqual([]);
  });

  it("the committed poison (trusts a client-supplied tenant) fails the gate", async () => {
    const file = path.join(scratch, "poison-gate2.mjs");
    writeFileSync(file, fixture("poison-gate2.ts.txt"));
    const poison = (await import(
      /* @vite-ignore */ pathToFileURL(file).href
    )) as { resolveActiveAssignment: Resolve };
    expect(await gate2Violations(poison.resolveActiveAssignment)).toEqual(
      expect.arrayContaining([
        "client tenant TB accepted for the TA hat",
        "client tenant TC (no membership) accepted",
      ]),
    );
  });
});

const NAME_AUTHZ =
  /role\s*===|role\s*!==|\.role\)|profileRole|hasRole\(|is_super_admin|"super_admin"/;
const DISPLAY_ONLY = /\/\/ authz-exempt: display-only\s*$/;
const DEFAULT_SELECTION = /\/\/ authz-exempt: default-selection\s*$/;

/** Gate 4 (criterion 10): names never authorize, with one default-selection carve-out. */
function gate4(files: [string, string][]): string[] {
  const out: string[] = [];
  let markers = 0;
  for (const [file, text] of files) {
    const pick =
      /function\s+pickDefaultAssignment\s*\([^)]*\)[^{]*\{[\s\S]*?\n\}/.exec(
        text,
      );
    text.split("\n").forEach((line, i) => {
      const at = `${file}:${i + 1}`;
      if (DISPLAY_ONLY.test(line)) return;
      if (DEFAULT_SELECTION.test(line)) {
        markers += 1;
        if (!file.endsWith(`${PRINCIPAL_DIR}/assignment.ts`))
          out.push(`${at} default-selection outside assignment.ts`);
        if (!pick?.[0].includes(line))
          out.push(`${at} default-selection outside pickDefaultAssignment`);
        if (
          /staffRole|staff_role/.test(line) ||
          !/membershipRole\s*===\s*"staff"/.test(line)
        )
          out.push(
            `${at} default-selection must compare only membershipRole to "staff"`,
          );
        return;
      }
      if (NAME_AUTHZ.test(line)) out.push(`${at} ${line.trim()}`);
    });
  }
  if (markers > 1)
    out.push(`${markers} default-selection markers (one allowed)`);
  return out;
}

describe("Gate 4 (slice, criterion 10)", () => {
  it("principal/** passes, with its one default-selection line", () => {
    const files = sources();
    expect(gate4(files)).toEqual([]);
    const markers = files.flatMap(([, s]) =>
      s.split("\n").filter((l) => DEFAULT_SELECTION.test(l)),
    );
    expect(markers).toHaveLength(1);
  });

  it("reports poison-gate4 (a profileRole super_admin check)", () => {
    expect(
      gate4([
        ...sources(),
        [`${PRINCIPAL_DIR}/poison.ts`, fixture("poison-gate4.ts.txt")],
      ]),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('x.profileRole === "super_admin"'),
      ]),
    );
  });

  it("reports poison-gate4-default (a second marker ranking staffRole), in or out of assignment.ts", () => {
    const poison = fixture("poison-gate4-default.ts.txt");
    const assignment = `${PRINCIPAL_DIR}/assignment.ts`;
    const withPoison = sources().map(([f, s]): [string, string] =>
      f === assignment ? [f, `${s}\n${poison}`] : [f, s],
    );
    const findings = gate4(withPoison);
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("compare only membershipRole"),
        expect.stringContaining("outside pickDefaultAssignment"),
        "2 default-selection markers (one allowed)",
      ]),
    );
    expect(
      gate4([...sources(), [`${PRINCIPAL_DIR}/reader-poison.ts`, poison]]),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("outside assignment.ts"),
      ]),
    );
  });
});

describe("principal/** static scans (criteria 4, 5, 8)", () => {
  it.each([
    "profiles",
    "profileRole",
    "DEMO_TENANT_ID",
    "DEFAULT_TENANT_ID",
    "getAuthContext",
    "@asym/auth",
    "app_metadata",
    "current_tenant_id",
    "toAssignmentRef",
    "revalidateAssignmentAtFireTime",
    "supabase/admin",
  ])("no source names %s", (word) => {
    expect(
      sources()
        .filter(([, s]) => s.includes(word))
        .map(([f]) => f),
    ).toEqual([]);
  });

  it("holds no module-level mutable state (top-level let, Map or Set)", () => {
    const hits = sources().flatMap(([f, s]) =>
      s
        .split("\n")
        .filter((l) =>
          /^(export\s+)?(let|var)\s|^(export\s+)?const\s[^=]*=\s*new\s+(Map|Set)\b/.test(
            l,
          ),
        )
        .map((l) => `${f}: ${l}`),
    );
    expect(hits).toEqual([]);
  });
});
