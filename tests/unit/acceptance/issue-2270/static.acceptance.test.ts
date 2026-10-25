/**
 * #2270 acceptance, no database (runs in the normal unit run). Final spec r1
 * criteria 6, 7, 9 and 12 plus the §7 append-only pins, approved with all
 * defaults on 2026-10-24. Owned by Acceptance. Implementers must not edit
 * this file to satisfy their PR.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DOC,
  GRANTS,
  MIGRATION,
  SPEC_STATEMENTS,
  read,
  statements,
} from "./harness";
import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const MIG = "supabase/migrations";
const forward = () =>
  readdirSync(MIG)
    .filter((f) => /^\d{14}_.*\.sql$/.test(f))
    .sort();
const sql = () => read(MIGRATION);

describe("#2270 C9: the new migration is exactly spec §1.4", () => {
  it(`${MIGRATION} exists`, () =>
    expect(existsSync(MIGRATION), "spec §6 file name").toBe(true));
  it("contains exactly the §1.4 statements, in order (comments/whitespace ignored)", () =>
    expect(statements(sql())).toEqual(statements(SPEC_STATEMENTS)));
  it("has no DROP, CREATE, SECURITY change or ALTER DEFAULT PRIVILEGES", () => {
    const body = statements(sql()).join(";\n");
    expect(body).not.toBe("");
    expect(body).not.toMatch(/\b(DROP|CREATE|SECURITY)\b/i);
    expect(body).not.toMatch(/ALTER\s+DEFAULT\s+PRIVILEGES/i);
  });
});

describe("#2270 C6/C7: authz grant-list guard across every forward migration", () => {
  it("C6: the authz SECURITY DEFINER functions are exactly the three §1.2 helpers", () => {
    const definers = new Set<string>();
    for (const f of forward()) {
      // Dollar-quoted bodies are blanked so each CREATE FUNCTION is one statement.
      const src = read(`${MIG}/${f}`).replace(
        /\$(\w*)\$[\s\S]*?\$\1\$/g,
        "$$$$",
      );
      for (const s of statements(src)) {
        const m =
          /^CREATE (?:OR REPLACE )?FUNCTION "?authz"?\."?(\w+)"?\s*\(/i.exec(s);
        if (m && /\bSECURITY DEFINER\b/i.test(s)) definers.add(m[1]!);
      }
    }
    expect([...definers].sort()).toEqual(
      Object.keys(GRANTS)
        .filter((k) => k.startsWith("authz."))
        .map((k) => k.slice(6, k.indexOf("(")))
        .sort(),
    );
  });
  it("C7: no migration grants authz functions or current_user_memberships to PUBLIC/anon, or authz USAGE to anon", () => {
    const bad: string[] = [];
    for (const f of forward())
      for (const s of statements(read(`${MIG}/${f}`))) {
        const fn =
          /^GRANT\b.*\bON\s+FUNCTION\s+(authz\.|(public\.)?current_user_memberships\b)/i.test(
            s,
          );
        const usage = /^GRANT\b.*\bUSAGE\b.*\bON\s+SCHEMA\s+authz\b/i.test(s);
        const to = /\bTO\s+(.*)$/i.exec(s)?.[1] ?? "";
        if (
          (fn && /\b(PUBLIC|anon)\b/i.test(to)) ||
          (usage && /\banon\b/i.test(to))
        )
          bad.push(`${f}: ${s}`);
      }
    expect(bad).toEqual([]);
  });
});

describe("#2270 C12 and §7 pins", () => {
  it(`C12: ${DOC} has the §1.2 table and a "Production deploy" section`, () => {
    const doc = read(DOC);
    expect(existsSync(DOC), DOC).toBe(true);
    expect(doc).toMatch(/^#+\s*Production deploy\b/im);
    const rows = doc.split("\n").filter((l) => l.trim().startsWith("|"));
    for (const [fn, want] of Object.entries(GRANTS)) {
      const name = fn.slice(0, fn.indexOf("("));
      const row = rows.filter((l) =>
        new RegExp(`\`(public\\.)?${name.replace(".", "\\.")}\\(`).test(l),
      );
      expect(row, `one §1.2 table row for ${fn}`).toHaveLength(1);
      const cells = row[0]!.split("|").map((c) => c.trim());
      expect(
        cells.some((c) => /^DEFINER$/i.test(c)),
        fn,
      ).toBe(true);
      const roles = cells
        .filter(Boolean)
        .at(-1)!
        .match(/\b(postgres|authenticated|service_role|anon|PUBLIC)\b/g);
      expect([...new Set(roles)].sort(), `${fn} grantees`).toEqual(want);
    }
  });
  it.each([
    [
      "20260226113000_authz_memberships_foundation.sql",
      "f301ded06fa98fd93d82d8b2260db08e01b764cece8583edfe2692ee39f1d305",
    ],
    [
      "20260507234343_crm_command_logs.sql",
      "98f96eb57233e85e65a03543347f8e6fd91e52fc8245c0f8d84991cd9b8e42b0",
    ],
    [
      "20260508000413_crm_identity_mapping.sql",
      "5cd0f7f29238df7d8d07d90923094701b329d5ab378ae062ddaac3f4e9519c91",
    ],
    [
      "20260802041500_current_user_memberships_rpc.sql",
      "f17ac524c738494050ea33e1a7a6608aa081e294266d71d73e7fb31efec38451",
    ],
  ])("§7: %s is unchanged (migrations are append-only)", (f, h) =>
    expect(
      createHash("sha256")
        .update(read(`${MIG}/${f}`))
        .digest("hex"),
    ).toBe(h),
  );
});

describe("#2270 CI step (Samson's ruling: own explicit-path step after #2250's)", () => {
  it("'Verify authz EXECUTE grants (real stack)' is migrate step 17, immediately after #2250's step 16, with exactly this env and run", () => {
    const all =
      workflowJobs(loadWorkflowDocument(".github/workflows/ci-integration.yml"))
        .migrate?.steps ?? [];
    const i = all.findIndex(
      (s) => s.name === "Verify authz EXECUTE grants (real stack)",
    );
    expect(i).toBe(17);
    expect(all[i - 1]?.name).toBe("Verify tenant isolation (real stack)");
    expect(all[i]).toEqual({
      name: "Verify authz EXECUTE grants (real stack)",
      env: { TENANT_GUARD_IT_ADMIN_DATABASE_URL: "${{ env.DATABASE_URL }}" },
      run: "bun x vitest run tests/unit/acceptance/issue-2270/authz-execute-grants.realstack.acceptance.test.ts",
    });
  });
});
