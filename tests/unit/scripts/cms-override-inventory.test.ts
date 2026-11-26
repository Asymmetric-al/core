import { describe, expect, it } from "vitest";

import {
  collectOverrideInventoryFindings,
  judgeOverrideInventory,
  runOverrideInventory,
} from "../../../scripts/verify/cms-override-inventory.mjs";

const judge = (file: string, source: string) =>
  judgeOverrideInventory(collectOverrideInventoryFindings(file, source), {
    reportStale: false,
  });

describe("test 13: the CMS override inventory gate (plan 6.3, WP6 part 2b)", () => {
  it("fails a planted overrideAccess: true outside the service port", () => {
    const failures = judge(
      "apps/admin/src/cms/planted.ts",
      "export const read = (payload) => payload.find({ collection: 'pages', overrideAccess: true });\n",
    );
    expect(failures.map((failure) => [failure.line, failure.rule])).toEqual([
      [1, "override-access-true"],
    ]);
  });

  it.each([
    "payload.db.find({ collection: 'pages' })",
    "req.payload.db.create({ collection: 'pages', data: {} })",
    "const { db } = req; void req.payload['db'].updateOne({})",
    "const raw = payload.db; void raw",
  ])("fails a planted direct payload.db use: %s", (code) => {
    const failures = judge("packages/api/src/planted.ts", `${code};\n`);
    expect(failures.map((failure) => failure.rule)).toEqual(["payload-db"]);
  });

  it("allows both in the service port, and passes code that names them only in comments or strings", () => {
    expect(
      judge(
        "apps/admin/src/cms/ports/service-port.ts",
        "payload.find({ overrideAccess: true }); payload.db.find({});\n",
      ),
    ).toEqual([]);
    expect(
      judge(
        "apps/admin/src/cms/planted.ts",
        "// req.payload.db.create and overrideAccess: true\nconst text = 'overrideAccess: true';\npayload.find({ overrideAccess: false });\n",
      ),
    ).toEqual([]);
  });

  it("allows the lock-access read once in document-locks.ts, and fails a second one", () => {
    const one =
      "req.payload.db.find({ collection: 'payload-locked-documents' });\n";
    expect(judge("apps/admin/src/cms/document-locks.ts", one)).toEqual([]);
    const failures = judge("apps/admin/src/cms/document-locks.ts", one + one);
    expect(failures).toHaveLength(2);
    expect(failures[0]?.message).toMatch(/listed 1, found 2/);
  });

  it("fails an unlisted CMS script that overrides access instead of using the service port", () => {
    const failures = judge(
      "scripts/cms/planted.mjs",
      "await payload.create({ collection: 'pages', data: {}, overrideAccess: true });\n",
    );
    expect(failures.map((failure) => failure.rule)).toEqual([
      "override-access-true",
    ]);
  });

  it("passes on the tree", () => {
    expect(runOverrideInventory().failures).toEqual([]);
  });
});

describe("F2: the gate refuses every way to pass the override that is not the literal false, and unlisted imports of the service port", () => {
  const rules = (file: string, source: string) =>
    judge(file, source).map((failure) => failure.rule);
  const planted = "apps/admin/src/cms/planted.ts";

  it.each([
    ["a negation", "payload.find({ overrideAccess: !asActor });"],
    ["a variable", "payload.find({ overrideAccess: flag });"],
    ["a call", "payload.find({ overrideAccess: decide() });"],
    ["a conditional", "payload.find({ overrideAccess: a ? true : false });"],
  ])("refuses a value that is %s", (_label, code) => {
    expect(rules(planted, `${code}\n`)).toEqual(["override-access-value"]);
  });

  it("refuses the shorthand { overrideAccess }", () => {
    expect(
      rules(
        planted,
        "const overrideAccess = true;\npayload.find({ overrideAccess });\n",
      ),
    ).toEqual(["override-access-value"]);
  });

  it.each([
    ["a string key", 'payload.find({ ["overrideAccess"]: true });'],
    ["a concatenated key", 'payload.find({ ["override" + "Access"]: true });'],
    ["a template key", "payload.find({ [`overrideAccess`]: true });"],
  ])("refuses a computed key: %s", (_label, code) => {
    expect(rules(planted, `${code}\n`)).toEqual(["override-access-true"]);
  });

  it("refuses a computed key whose name the syntax tree cannot tell", () => {
    expect(rules(planted, "payload.find({ [key]: true });\n")).toEqual([
      "override-access-computed-key",
    ]);
  });

  it("refuses a spread of an object the same file gives the key", () => {
    expect(
      rules(
        planted,
        "const options = { overrideAccess: false };\npayload.find({ ...options, collection: 'pages' });\n",
      ),
    ).toEqual(["override-access-spread"]);
  });

  it("refuses an assignment of the key that is not the literal false", () => {
    expect(rules(planted, "options.overrideAccess = true;\n")).toEqual([
      "override-access-value",
    ]);
    expect(rules(planted, "options.overrideAccess = false;\n")).toEqual([]);
  });

  it.each([
    ["a static import", 'import { serviceFind } from "../ports/service-port";'],
    [
      "an import with its extension",
      'import { serviceFind } from "./ports/service-port.ts";',
    ],
    ["a re-export", 'export { serviceFind } from "../ports/service-port";'],
    ["a dynamic import", 'const port = await import("../ports/service-port");'],
    ["a require", 'const port = require("../ports/service-port");'],
  ])("refuses %s of the service port by an unlisted module", (_label, code) => {
    expect(rules(planted, `${code}\n`)).toEqual(["service-port-import"]);
  });

  it("allows a type-only import and a listed caller", () => {
    expect(
      rules(
        planted,
        'import type { PrincipalLinkRow } from "../ports/service-port";\n',
      ),
    ).toEqual([]);
    expect(
      rules(
        "apps/admin/src/cms/auth/supabase-strategy.ts",
        'import { ensurePrincipalLink } from "../ports/service-port";\n',
      ),
    ).toEqual([]);
  });

  it("still allows the literal false and a mention in a string", () => {
    expect(
      rules(
        planted,
        "payload.find({ overrideAccess: false });\nconst text = 'overrideAccess: !x';\n",
      ),
    ).toEqual([]);
  });
});
