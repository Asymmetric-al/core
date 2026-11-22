/**
 * #2708: a static inventory of Supabase `.select(...)` calls.
 *
 * For each `.select(...)` whose call chain starts at `.from("table")`, it
 * resolves the table, the optional `.schema("name")` and the select string
 * without running the code: string literals, templates, same-file `const`
 * strings (also through `${CONST}` substitution), `[...].join(sep)` arrays and
 * constants imported by a relative named import. Anything else is kept with an
 * `unresolved` reason so the live sweep can report its coverage honestly.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

export type SelectSite = {
  /** Repository-relative, forward slashes. */
  file: string;
  /** 1-based line of the `.select` call. */
  line: number;
  schema: string | null;
  table: string | null;
  select: string | null;
  /** The select returns written rows (insert, update, upsert or delete). */
  returning: boolean;
  /** Why the table or select could not be resolved; absent when both were. */
  unresolved?: string;
};

const WRITE_METHODS = new Set(["insert", "update", "upsert", "delete"]);

type ModuleLoader = (
  fromFile: string,
  specifier: string,
) => SourceModule | null;

type SourceModule = {
  file: string;
  sourceFile: ts.SourceFile;
  /** Same-file `const` initialisers by name; `null` when the name is declared twice. */
  constants: Map<string, ts.Expression | null>;
  /** Local name -> { specifier, exported name } for relative named imports. */
  imports: Map<string, { specifier: string; name: string }>;
};

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  )
    current = current.expression;
  return current;
}

function parseModule(file: string, text: string): SourceModule {
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const constants = new Map<string, ts.Expression | null>();
  const imports = new Map<string, { specifier: string; name: string }>();
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclarationList(node) && node.flags & ts.NodeFlags.Const) {
      for (const declaration of node.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer)
          continue;
        const name = declaration.name.text;
        constants.set(
          name,
          constants.has(name) ? null : declaration.initializer,
        );
      }
    }
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith(".") &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings) &&
      !node.importClause.isTypeOnly
    ) {
      for (const element of node.importClause.namedBindings.elements) {
        imports.set(element.name.text, {
          specifier: node.moduleSpecifier.text,
          name: (element.propertyName ?? element.name).text,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { file, sourceFile, constants, imports };
}

/**
 * The string value of an expression, or null. `seen` stops self-reference
 * cycles; `load` follows relative imports.
 */
function resolveString(
  node: ts.Expression,
  module: SourceModule,
  load: ModuleLoader,
  seen: Set<string> = new Set(),
): string | null {
  const expression = unwrap(node);
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  )
    return expression.text;
  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      const part = resolveString(span.expression, module, load, seen);
      if (part === null) return null;
      text += part + span.literal.text;
    }
    return text;
  }
  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = resolveString(expression.left, module, load, seen);
    const right = resolveString(expression.right, module, load, seen);
    return left === null || right === null ? null : left + right;
  }
  if (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === "join" &&
    ts.isArrayLiteralExpression(unwrap(expression.expression.expression)) &&
    expression.arguments.length <= 1
  ) {
    const array = unwrap(
      expression.expression.expression,
    ) as ts.ArrayLiteralExpression;
    const separator = expression.arguments[0]
      ? resolveString(expression.arguments[0], module, load, seen)
      : ",";
    if (separator === null) return null;
    const parts: string[] = [];
    for (const element of array.elements) {
      const part = resolveString(element, module, load, seen);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join(separator);
  }
  if (ts.isIdentifier(expression)) {
    const key = `${module.file}#${expression.text}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const initializer = module.constants.get(expression.text);
    if (initializer) return resolveString(initializer, module, load, seen);
    if (initializer === null) return null;
    const imported = module.imports.get(expression.text);
    if (!imported) return null;
    const target = load(module.file, imported.specifier);
    if (!target) return null;
    const exported = target.constants.get(imported.name);
    return exported ? resolveString(exported, target, load, seen) : null;
  }
  return null;
}

type Chain = {
  schema: ts.Expression | null;
  table: ts.Expression | null;
  hasFrom: boolean;
  rpc: boolean;
  returning: boolean;
};

/** Walks the receiver of `.select` down to its `.from(...)` call. */
function readChain(receiver: ts.Expression): Chain {
  const chain: Chain = {
    schema: null,
    table: null,
    hasFrom: false,
    rpc: false,
    returning: false,
  };
  let current: ts.Expression = unwrap(receiver);
  while (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression)
  ) {
    const method = current.expression.name.text;
    if (method === "rpc") chain.rpc = true;
    if (WRITE_METHODS.has(method) && !chain.hasFrom) chain.returning = true;
    if (method === "from" && !chain.hasFrom) {
      chain.hasFrom = true;
      chain.table = current.arguments[0] ?? null;
    }
    if (method === "schema" && chain.hasFrom)
      chain.schema = current.arguments[0] ?? null;
    current = unwrap(current.expression.expression);
  }
  return chain;
}

function sitesOfModule(module: SourceModule, load: ModuleLoader): SelectSite[] {
  const sites: SelectSite[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "select"
    ) {
      const chain = readChain(node.expression.expression);
      const receiverIsCall = ts.isCallExpression(
        unwrap(node.expression.expression),
      );
      const looksLikeQuery =
        chain.hasFrom || (!receiverIsCall && node.arguments.length > 0);
      if (!chain.rpc && looksLikeQuery) {
        const line =
          module.sourceFile.getLineAndCharacterOfPosition(
            node.expression.name.getStart(module.sourceFile),
          ).line + 1;
        const table = chain.table
          ? resolveString(chain.table, module, load)
          : null;
        const schema = chain.schema
          ? resolveString(chain.schema, module, load)
          : null;
        const argument = node.arguments[0];
        const select = argument ? resolveString(argument, module, load) : "*";
        const reasons: string[] = [];
        if (!chain.hasFrom)
          reasons.push("receiver is not a .from(...) chain in this expression");
        else if (table === null)
          reasons.push("table name is not a static string");
        if (chain.schema && schema === null)
          reasons.push("schema name is not a static string");
        if (select === null) reasons.push("select string is not static");
        sites.push({
          file: module.file,
          line,
          schema,
          table,
          select,
          returning: chain.returning,
          ...(reasons.length > 0 ? { unresolved: reasons.join("; ") } : {}),
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(module.sourceFile);
  return sites;
}

/** Inventory one source text. Imports are not followed. */
export function inventorySelectsInSource(
  file: string,
  source: string,
): SelectSite[] {
  return sitesOfModule(parseModule(file, source), () => null);
}

const SOURCE_FILE = /\.(ts|tsx|mts|cts)$/;
const SKIPPED_FILE = /\.(test|spec)\.[cm]?tsx?$|\.d\.[cm]?ts$/;

function listSources(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      files.push(...listSources(full));
    } else if (SOURCE_FILE.test(entry.name) && !SKIPPED_FILE.test(entry.name))
      files.push(full);
  }
  return files;
}

/** Inventory every source file under `roots` (repository-relative). */
export function inventorySelects(input: {
  repoRoot: string;
  roots: readonly string[];
}): SelectSite[] {
  const cache = new Map<string, SourceModule | null>();
  const relative = (absolute: string) =>
    path.relative(input.repoRoot, absolute).split(path.sep).join("/");
  const loadAbsolute = (absolute: string): SourceModule | null => {
    if (!cache.has(absolute)) {
      cache.set(
        absolute,
        existsSync(absolute) && statSync(absolute).isFile()
          ? parseModule(relative(absolute), readFileSync(absolute, "utf8"))
          : null,
      );
    }
    return cache.get(absolute) ?? null;
  };
  const load: ModuleLoader = (fromFile, specifier) => {
    const base = path.resolve(
      input.repoRoot,
      path.dirname(fromFile),
      specifier,
    );
    const candidates = [
      base,
      ...[".ts", ".tsx", ".mts"].map((extension) => base + extension),
      ...["index.ts", "index.tsx"].map((name) => path.join(base, name)),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate) && statSync(candidate).isFile())
        return loadAbsolute(candidate);
    }
    return null;
  };
  const sites: SelectSite[] = [];
  for (const root of input.roots) {
    for (const file of listSources(path.resolve(input.repoRoot, root)).sort()) {
      const module = loadAbsolute(file);
      if (module) sites.push(...sitesOfModule(module, load));
    }
  }
  return sites;
}
