import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const uiRequire = createRequire(path.join(root, "packages/ui/package.json"));
const apiRequire = createRequire(path.join(root, "packages/api/package.json"));
const pdfRequire = createRequire(rootRequire.resolve("@asym/pdf-editor"));
const schemaRequire = createRequire(
  rootRequire.resolve("@asym/pdf-template-schema"),
);
const emailRequire = createRequire(pdfRequire.resolve("@react-email/editor"));

function physicalModule(
  importer: ReturnType<typeof createRequire>,
  specifier: string,
) {
  return realpathSync(importer.resolve(specifier));
}

describe("PDF package dependency boundaries", () => {
  it("keeps every locked Tiptap package on the consuming UI cohort", () => {
    const parsed = ts.parseConfigFileTextToJson(
      "bun.lock",
      readFileSync(path.join(root, "bun.lock"), "utf8"),
    );
    expect(parsed.error).toBeUndefined();
    const selected = new Set<string>();
    for (const row of Object.values(parsed.config.packages)) {
      if (!Array.isArray(row) || typeof row[0] !== "string") continue;
      if (row[0].startsWith("@tiptap/"))
        selected.add(row[0].slice(row[0].lastIndexOf("@") + 1));
    }
    const ui = JSON.parse(
      readFileSync(path.join(root, "packages/ui/package.json"), "utf8"),
    );
    expect(selected.size).toBeGreaterThan(0);
    expect([...selected]).toEqual([ui.dependencies["@tiptap/core"]]);
  });

  it("shares the public React Email editor with the Core studio", () => {
    expect(physicalModule(pdfRequire, "@react-email/editor")).toBe(
      physicalModule(uiRequire, "@react-email/editor"),
    );
  });

  it("shares Zod between native template schemas and API validation", () => {
    expect(physicalModule(schemaRequire, "zod")).toBe(
      physicalModule(apiRequire, "zod"),
    );
  });

  it("composes editors with one Tiptap and ProseMirror runtime", () => {
    for (const specifier of [
      "@tiptap/core",
      "@tiptap/react",
      "@tiptap/pm/model",
      "@tiptap/pm/state",
    ]) {
      expect(physicalModule(emailRequire, specifier)).toBe(
        physicalModule(uiRequire, specifier),
      );
    }
    expect(physicalModule(pdfRequire, "@tiptap/core")).toBe(
      physicalModule(uiRequire, "@tiptap/core"),
    );
  });

  it("shares React across the imported and Core editors", () => {
    for (const specifier of ["react", "react-dom"]) {
      expect(physicalModule(emailRequire, specifier)).toBe(
        physicalModule(uiRequire, specifier),
      );
      expect(physicalModule(pdfRequire, specifier)).toBe(
        physicalModule(rootRequire, specifier),
      );
    }
  });

  it.each(["module", "commonjs"])(
    "composes imported extensions and ProseMirror steps through real %s exports",
    (mode) => {
      const imports =
        mode === "module"
          ? `import assert from "node:assert/strict";
           import { Node } from "@tiptap/core";
           import { Fragment, Schema } from "@tiptap/pm/model";
           import { ReplaceStep, Transform } from "@tiptap/pm/transform";
           import { DocumentNode } from "@asym/pdf-editor";`
          : `const assert = require("node:assert/strict");
           const { Node } = require("@tiptap/core");
           const { Fragment, Schema } = require("@tiptap/pm/model");
           const { ReplaceStep, Transform } = require("@tiptap/pm/transform");
           const { DocumentNode } = require("@asym/pdf-editor");`;
      const behavior = `
        assert.equal(Object.getPrototypeOf(DocumentNode), Node);
        const schema = new Schema({ nodes: {
          doc: { content: "paragraph+" },
          paragraph: { content: "text*" },
          text: { group: "inline" },
        }});
        const replacement = ReplaceStep.fromJSON(schema, {
          stepType: "replace", from: 0, to: 0,
          slice: { content: [{ type: "paragraph" }] },
        });
        assert(replacement instanceof ReplaceStep);
        assert(replacement.slice.content instanceof Fragment);
        const pdfDocument = schema.node("doc", null, [
          schema.node("paragraph", null, schema.text("abcd")),
        ]);
        assert.deepEqual(new Transform(pdfDocument).split(3).doc.toJSON(), {
          type: "doc", content: [
            { type: "paragraph", content: [{ type: "text", text: "ab" }] },
            { type: "paragraph", content: [{ type: "text", text: "cd" }] },
          ],
        });`;
      const result = spawnSync(
        process.execPath,
        ["--input-type", mode, "--eval", `${imports}\n${behavior}`],
        {
          cwd: path.join(root, "packages/ui"),
          encoding: "utf8",
          env: { ...process.env, NODE_OPTIONS: "" },
        },
      );
      expect(result.status, result.stderr).toBe(0);
    },
  );
});
