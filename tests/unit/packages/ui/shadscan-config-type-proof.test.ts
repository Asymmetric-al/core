import { readFileSync } from "node:fs";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import * as configuration from "../../../../packages/ui/components/shadcn/data-table/data-table-responsive-types";

const source = ts.createSourceFile(
  "data-table-responsive-types.ts",
  readFileSync(
    new URL(
      "../../../../packages/ui/components/shadcn/data-table/data-table-responsive-types.ts",
      import.meta.url,
    ),
    "utf8",
  ),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

describe("Shadscan typed configuration status evidence", () => {
  it("keeps isLoading in an interface and exports only inert empty configuration", () => {
    const props = source.statements.find(
      (statement) =>
        ts.isInterfaceDeclaration(statement) &&
        statement.name.text === "DataTableResponsiveProps",
    );
    expect(
      props &&
        ts.isInterfaceDeclaration(props) &&
        props.members.some(
          (member) =>
            ts.isPropertySignature(member) &&
            member.name.getText(source) === "isLoading" &&
            member.type?.kind === ts.SyntaxKind.BooleanKeyword,
        ),
    ).toBe(true);
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement))
        expect(statement.importClause?.isTypeOnly).toBe(true);
      else if (
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)
      )
        continue;
      else {
        expect(ts.isVariableStatement(statement)).toBe(true);
        if (!ts.isVariableStatement(statement))
          throw new Error("Unexpected runtime statement");
        expect(statement.declarationList.flags & ts.NodeFlags.Const).not.toBe(
          0,
        );
        for (const declaration of statement.declarationList.declarations) {
          const initializer = declaration.initializer;
          if (!initializer) throw new Error("Unexpected runtime initializer");
          if (ts.isArrayLiteralExpression(initializer))
            expect(initializer.elements).toHaveLength(0);
          else if (ts.isObjectLiteralExpression(initializer))
            expect(initializer.properties).toHaveLength(0);
          else
            throw new Error(
              "Configuration module acquired runtime behavior; review the finding again",
            );
        }
      }
    }
    expect(Object.keys(configuration)).toHaveLength(4);
    for (const value of Object.values(configuration)) {
      expect(typeof value).toBe("object");
      expect(Object.keys(value)).toHaveLength(0);
    }
  });
});
