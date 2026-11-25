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
