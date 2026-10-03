import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const previewPath =
  "apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx";
const notFoundPath =
  "apps/admin/app/(payload)/web-studio/[[...segments]]/not-found.tsx";

function sourceAt(filePath: string) {
  return ts.createSourceFile(
    filePath,
    readFileSync(path.resolve(root, filePath), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : filePath.endsWith(".ts")
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS,
  );
}

function nodesMatching<T extends ts.Node>(
  rootNode: ts.Node,
  predicate: (node: ts.Node) => node is T,
) {
  const matches: T[] = [];
  function visit(node: ts.Node) {
    if (predicate(node)) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(rootNode);
  return matches;
}

function callsTo(source: ts.SourceFile, name: string, owner: ts.Node = source) {
  return nodesMatching(owner, ts.isCallExpression).filter(
    (call) => call.expression.getText(source) === name,
  );
}

function callTo(source: ts.SourceFile, name: string) {
  const matches = callsTo(source, name);
  expect(matches, `Expected one actual ${name} call`).toHaveLength(1);
  return matches[0]!;
}

function fields(source: ts.SourceFile, expression: ts.Node | undefined) {
  if (!expression || !ts.isObjectLiteralExpression(expression))
    throw new Error("Expected the actual call's options object");
  return Object.fromEntries(
    expression.properties.flatMap((property) => {
      if (ts.isPropertyAssignment(property))
        return [
          [property.name.getText(source), property.initializer.getText(source)],
        ];
      if (ts.isShorthandPropertyAssignment(property))
        return [[property.name.text, property.name.text]];
      return [];
    }),
  );
}

function guardFor(source: ts.SourceFile, condition: string) {
  const guard = nodesMatching(source, ts.isIfStatement).find(
    (statement) => statement.expression.getText(source) === condition,
  );
  if (!guard) throw new Error(`Missing actual ${condition} guard`);
  return guard;
}

describe("Shadscan CMS boundary evidence", () => {
  it("keeps preview and its auth shell explicitly blocking rather than flushing a loading response", () => {
    for (const filePath of [
      previewPath,
      "apps/admin/app/(payload)/layout.tsx",
    ]) {
      const source = sourceAt(filePath);
      const blockingDeclaration = source.statements.find(
        (statement) =>
          ts.isVariableStatement(statement) &&
          statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          ) &&
          statement.declarationList.declarations.some(
            (declaration) =>
              declaration.name.getText(source) === "instant" &&
              declaration.initializer?.kind === ts.SyntaxKind.FalseKeyword,
          ),
      );
      expect(
        blockingDeclaration,
        `${filePath} must explicitly choose Block`,
      ).toBeDefined();
      expect(callTo(source, "connection").parent.kind).toBe(
        ts.SyntaxKind.AwaitExpression,
      );
    }
    const preview = sourceAt(previewPath);
    const suspendedContent = nodesMatching(
      preview,
      ts.isJsxOpeningElement,
    ).some((element) => element.tagName.getText(preview) === "Suspense");
    expect(suspendedContent).toBe(false);
  });

  it("authenticates before reading the current draft and resolves redirect/not-found before rendering", () => {
    const source = sourceAt(previewPath);
    const authenticate = callTo(source, "payload.auth");
    const read = callTo(source, "payload.findByID");
    expect(authenticate.parent.kind).toBe(ts.SyntaxKind.AwaitExpression);
    expect(read.parent.kind).toBe(ts.SyntaxKind.AwaitExpression);
    const unauthenticated = guardFor(source, "!auth.user");
    const redirect = callsTo(source, "redirect", unauthenticated)[0];
    expect(redirect).toBeDefined();
    expect(authenticate.getStart()).toBeLessThan(unauthenticated.getStart());
    expect(unauthenticated.end).toBeLessThan(read.getStart());
    expect(redirect!.arguments[0]?.getText(source)).toContain("/login?next=");
    expect(redirect!.arguments[0]?.getText(source)).toContain(
      "encodeURIComponent",
    );

    expect(fields(source, read.arguments[0])).toMatchObject({
      collection: "collection",
      id: "id",
      draft: "true",
      overrideAccess: "false",
      req: "authedReq",
      user: "auth.user",
    });
    const authenticatedRequest = nodesMatching(
      source,
      ts.isVariableDeclaration,
    ).find((declaration) => declaration.name.getText(source) === "authedReq");
    expect(authenticatedRequest).toBeDefined();
    const createRequest = callsTo(
      source,
      "createLocalReq",
      authenticatedRequest!,
    )[0];
    expect(fields(source, createRequest?.arguments[0]).user).toBe("auth.user");
    const missingRecord = guardFor(source, "!doc");
    expect(callsTo(source, "notFound", missingRecord)).toHaveLength(1);
    expect(read.getStart()).toBeLessThan(missingRecord.getStart());
    expect(missingRecord.end).toBeLessThan(
      callTo(source, "buildWebStudioPreviewModel").getStart(),
    );
  });

  it("delegates the flagged route to the installed Payload recovery link targeting Web Studio", () => {
    const route = sourceAt(notFoundPath);
    expect(
      route.statements.some(
        (statement) =>
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === "@payloadcms/next/views" &&
          statement.importClause?.namedBindings &&
          ts.isNamedImports(statement.importClause.namedBindings) &&
          statement.importClause.namedBindings.elements.some(
            (element) => element.name.text === "NotFoundPage",
          ),
      ),
    ).toBe(true);
    expect(fields(route, callTo(route, "NotFoundPage").arguments[0])).toEqual({
      config: "config",
      importMap: "importMap",
      params: "params",
      searchParams: "searchParams",
    });
    const requireAdmin = createRequire(
      path.join(root, "apps/admin/package.json"),
    );
    const viewsPath = requireAdmin.resolve("@payloadcms/next/views");
    const views = sourceAt(viewsPath);
    const delegatedExport = views.statements.find(
      (statement) =>
        ts.isExportDeclaration(statement) &&
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.some(
          (element) => element.name.text === "NotFoundPage",
        ),
    );
    if (
      !delegatedExport ||
      !ts.isExportDeclaration(delegatedExport) ||
      !delegatedExport.moduleSpecifier ||
      !ts.isStringLiteral(delegatedExport.moduleSpecifier)
    )
      throw new Error(
        "Installed Payload views must export its real NotFoundPage",
      );
    const serverPath = path.resolve(
      path.dirname(viewsPath),
      delegatedExport.moduleSpecifier.text,
    );
    const server = sourceAt(serverPath);
    expect(
      callsTo(server, "_jsx").some(
        (call) => call.arguments[0]?.getText(server) === "NotFoundClient",
      ),
    ).toBe(true);
    const client = sourceAt(
      path.join(path.dirname(serverPath), "index.client.js"),
    );
    const recovery = callsTo(client, "_jsx").find(
      (call) => call.arguments[0]?.getText(client) === "Button",
    );
    expect(recovery).toBeDefined();
    const options = fields(client, recovery?.arguments[1]);
    expect(options.el).toBe('"link"');
    expect(options.to).toBe("adminRoute");
    expect(options.children).toContain("general:backToDashboard");
    expect(client.text).toMatch(/admin:\s*adminRoute/);

    const config = sourceAt("apps/admin/payload.config.ts");
    const routes = nodesMatching(config, ts.isPropertyAssignment).find(
      (property) => property.name.getText(config) === "routes",
    );
    expect(fields(config, routes?.initializer).admin).toBe('"/web-studio"');
    const installed = JSON.parse(
      readFileSync(
        path.resolve(path.dirname(viewsPath), "../../package.json"),
        "utf8",
      ),
    ) as { version: string };
    const manifest = JSON.parse(
      readFileSync(path.join(root, "apps/admin/package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    expect(manifest.dependencies["@payloadcms/next"]).toBe(installed.version);
  });
});
