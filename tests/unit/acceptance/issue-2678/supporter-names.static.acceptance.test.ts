import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOTS = [
  /^packages\/api\/src\/missionary-portal\//,
  /^packages\/api\/src\/missionaries\//,
  /^packages\/api\/src\/follower-requests\//,
  /^packages\/graphql\//,
];
const GRAPHQL_HANDLER = "packages/graphql/handler.ts";
const OWN_DONATIONS = new Map([
  ["myDonations", "Query"],
  ["createDonation", "Mutation"],
]);
const OWN_SELECT_MODULE = "packages/api/src/donations/select";
const OWN_SELECT_NAME = "DONATION_WITH_PARTIES_SELECT";
const DONOR_EMBED =
  /^donors$|(?:^|_)donor_id(?:_f?key)?$|_donor_same_tenant_fk$/i;
const RPC_ROOT = "(rpc)";
const MIGRATIONS = "supabase/migrations";
const KEY_COLUMNS = new Set([
  "id",
  "tenant_id",
  "profile_id",
  "missionary_id",
  "party_id",
  "donor_is_restricted_party",
]);
const FACT = "donor_is_restricted_party";
const SEAM = "isAnonymousToRecipient";
const RESOLVE_EXTS = ["", ".ts", ".tsx", ".mts", ".mjs", ".js", "/index.ts"];
const MAX_VALUES = 64;

type Rule = "S1" | "S2" | "S3" | "S4";
type Violation = { file: string; line: number; rule: Rule; text: string };
type Item = { name: string; children: Item[] | null };
type Imports = Map<string, { specifier: string; importedName: string }>;
type FileFacts = {
  sf: ts.SourceFile;
  values: Map<string, ts.Expression[]>;
  imports: Imports;
  namespaces: Map<string, string>;
  relativeImports: string[];
  namesDonors: boolean;
  callsSeam: boolean;
};

function matchingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(text: string): Item[] | null {
  const items: Item[] = [];
  for (const part of splitTopLevel(text)) {
    const m =
      /^(?:\.\.\.)?\s*(?:[A-Za-z_]\w*\s*:\s*)?([A-Za-z_]\w*|\*)((?:\s*!\s*\w+)*)\s*(?:->>?\s*\S+)?\s*(?:::\s*\w+)?\s*([\s\S]*)$/.exec(
        part,
      );
    if (!m) return null;
    const rest = m[3]!.trim();
    let children: Item[] | null = null;
    if (rest) {
      if (!rest.startsWith("(") || matchingParen(rest, 0) !== rest.length - 1)
        return null;
      children = parseSelect(rest.slice(1, -1));
      if (!children) return null;
    }
    items.push({ name: m[1]!, children });
  }
  return items;
}

function unwrap(expr: ts.Expression): ts.Expression {
  let cur = expr;
  for (;;) {
    if (ts.isParenthesizedExpression(cur)) cur = cur.expression;
    else if (ts.isAsExpression(cur)) cur = cur.expression;
    else if (ts.isSatisfiesExpression(cur)) cur = cur.expression;
    else if (ts.isNonNullExpression(cur)) cur = cur.expression;
    else if (ts.isTypeAssertionExpression(cur)) cur = cur.expression;
    else return cur;
  }
}

function propertyName(name: ts.PropertyName | undefined): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

function factsOf(file: string, text: string): FileFacts {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const values = new Map<string, ts.Expression[]>();
  const imports: Imports = new Map();
  const namespaces = new Map<string, string>();
  const relativeImports: string[] = [];
  let namesDonors = false;
  let callsSeam = false;
  const remember = (name: string, value: ts.Expression) =>
    values.set(name, [...(values.get(name) ?? []), value]);
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    )
      remember(node.name.text, node.initializer);
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    )
      remember(node.left.text, node.right);
    if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)) &&
      /(?<![A-Za-z0-9_])donors(?![A-Za-z0-9_])/.test(node.text)
    )
      namesDonors = true;
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : null;
      const arg = node.arguments[0] && unwrap(node.arguments[0]);
      if (
        name === SEAM &&
        arg &&
        ts.isObjectLiteralExpression(arg) &&
        arg.properties.some(
          (p) =>
            (ts.isPropertyAssignment(p) ||
              ts.isShorthandPropertyAssignment(p)) &&
            propertyName(p.name) === "restrictedParty",
        )
      )
        callsSeam = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  for (const node of sf.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier)
    )
      continue;
    const specifier = node.moduleSpecifier.text;
    const clause = node.importClause;
    const bindings = clause?.namedBindings;
    const importsValue =
      !!clause &&
      !clause.isTypeOnly &&
      (!!clause.name ||
        (!!bindings &&
          (ts.isNamespaceImport(bindings) ||
            bindings.elements.some((el) => !el.isTypeOnly))));
    if (specifier.startsWith(".") && importsValue)
      relativeImports.push(specifier);
    if (bindings && ts.isNamedImports(bindings))
      for (const el of bindings.elements)
        imports.set(el.name.text, {
          specifier,
          importedName: el.propertyName?.text ?? el.name.text,
        });
    if (bindings && ts.isNamespaceImport(bindings))
      namespaces.set(bindings.name.text, specifier);
  }
  return {
    sf,
    values,
    imports,
    namespaces,
    relativeImports,
    namesDonors,
    callsSeam,
  };
}

function moduleBase(from: string, specifier: string): string | null {
  const base = specifier.startsWith(".")
    ? path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier))
    : specifier.startsWith("@asym/api/")
      ? `packages/api/src/${specifier.slice("@asym/api/".length)}`
      : null;
  return base?.replace(/\.[cm]?[jt]sx?$/, "").replace(/\/index$/, "") ?? null;
}

function resolveModule(
  from: string,
  specifier: string,
  files: ReadonlySet<string>,
): string | null {
  const bases: string[] = [];
  if (specifier.startsWith("."))
    bases.push(
      path.posix.normalize(
        path.posix.join(path.posix.dirname(from), specifier),
      ),
    );
  else if (specifier.startsWith("@asym/")) {
    const rest = specifier.slice("@asym/".length);
    const slash = rest.indexOf("/");
    if (slash > 0)
      bases.push(
        `packages/${rest.slice(0, slash)}/src/${rest.slice(slash + 1)}`,
        `packages/${rest.slice(0, slash)}/${rest.slice(slash + 1)}`,
      );
  }
  for (const base of bases)
    for (const ext of RESOLVE_EXTS)
      if (files.has(base + ext)) return base + ext;
  return null;
}

const SQL_NAME = String.raw`(?:"?public"?\s*\.\s*)?"?(\w+)"?`;
const DONORS_REFERENCE =
  /\breferences\s+(?:"?public"?\s*\.\s*)?"?donors"?(?![\w$])/gi;
const TABLE_HEADER = new RegExp(
  String.raw`\b(?:create\s+(?:(?:global|local)\s+)?(?:(?:temp|temporary|unlogged)\s+)?table|alter\s+table)\s+(?:if\s+(?:not\s+)?exists\s+)?(?:only\s+)?` +
    SQL_NAME,
  "gi",
);
const TABLE_RENAME = new RegExp(
  String.raw`\balter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?` +
    SQL_NAME +
    String.raw`\s+rename\s+to\s+"?(\w+)"?`,
  "gi",
);

function withoutComments(sql: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, " ");
  let out = "";
  let i = 0;
  while (i < sql.length) {
    let j = i + 1;
    if (sql.startsWith("--", i)) {
      j = sql.indexOf("\n", i);
      if (j === -1) j = sql.length;
      out += blank(sql.slice(i, j));
    } else if (sql.startsWith("/*", i)) {
      let depth = 1;
      j = i + 2;
      while (j < sql.length && depth > 0) {
        const step = sql.startsWith("/*", j)
          ? 1
          : sql.startsWith("*/", j)
            ? -1
            : 0;
        depth += step;
        j += step === 0 ? 1 : 2;
      }
      out += blank(sql.slice(i, j));
    } else if (sql[i] === "'") {
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'"))
        j += sql[j] === "'" ? 2 : 1;
      j = Math.min(j + 1, sql.length);
      out += sql.slice(i, j);
    } else out += sql[i];
    i = j;
  }
  return out;
}

function donorTablesFrom(migrations: [string, string][]): Set<string> {
  const tables = new Set<string>();
  const renames: [string, string][] = [];
  const unplaced: string[] = [];
  for (const [file, text] of [...migrations].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    const sql = withoutComments(text);
    const headers = [...sql.matchAll(TABLE_HEADER)];
    for (const reference of sql.matchAll(DONORS_REFERENCE)) {
      const header = headers.filter((h) => h.index < reference.index).at(-1);
      if (header && !sql.slice(header.index, reference.index).includes(";"))
        tables.add(header[1]!.toLowerCase());
      else
        unplaced.push(
          `${file}:${sql.slice(0, reference.index).split("\n").length}`,
        );
    }
    for (const rename of sql.matchAll(TABLE_RENAME))
      renames.push([rename[1]!.toLowerCase(), rename[2]!.toLowerCase()]);
  }
  if (unplaced.length)
    throw new Error(
      `a reference to donors that no CREATE TABLE or ALTER TABLE statement holds: ${unplaced.join(", ")}`,
    );
  for (const [from, to] of renames) if (tables.has(from)) tables.add(to);
  return tables;
}

let treeDonorTables: Set<string> | null = null;
function tablesReferringToDonors(): Set<string> {
  treeDonorTables ??= donorTablesFrom(
    readdirSync(MIGRATIONS)
      .filter((file) => file.endsWith(".sql"))
      .map((file): [string, string] => [
        `${MIGRATIONS}/${file}`,
        readFileSync(path.join(MIGRATIONS, file), "utf8"),
      ]),
  );
  return treeDonorTables;
}

function scanSources(sources: Map<string, string>): Violation[] {
  const files = new Set(sources.keys());
  const facts = new Map<string, FileFacts>();
  for (const [file, text] of sources) facts.set(file, factsOf(file, text));

  const resolveName = (
    file: string,
    name: string,
    seen: Set<string>,
  ): string[] | null => {
    const key = `${file}#${name}`;
    if (seen.has(key)) return null;
    const inner = new Set([...seen, key]);
    const fact = facts.get(file);
    if (!fact) return null;
    const local = fact.values.get(name);
    if (local) {
      const out: string[] = [];
      for (const value of local) {
        const resolved = resolveExpr(file, value, inner);
        if (!resolved) return null;
        out.push(...resolved);
      }
      return out.length > MAX_VALUES ? null : [...new Set(out)];
    }
    const imported = fact.imports.get(name);
    if (!imported) return null;
    const target = resolveModule(file, imported.specifier, files);
    return target ? resolveName(target, imported.importedName, inner) : null;
  };

  const resolveExpr = (
    file: string,
    expr: ts.Expression,
    seen: Set<string>,
  ): string[] | null => {
    const e = unwrap(expr);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))
      return [e.text];
    if (ts.isTemplateExpression(e)) {
      let out = [e.head.text];
      for (const span of e.templateSpans) {
        const parts = resolveExpr(file, span.expression, seen);
        if (!parts) return null;
        out = out.flatMap((left) =>
          parts.map((part) => left + part + span.literal.text),
        );
        if (out.length > MAX_VALUES) return null;
      }
      return out;
    }
    if (ts.isConditionalExpression(e)) {
      const a = resolveExpr(file, e.whenTrue, seen);
      const b = resolveExpr(file, e.whenFalse, seen);
      return a && b ? [...new Set([...a, ...b])] : null;
    }
    if (
      ts.isBinaryExpression(e) &&
      e.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const a = resolveExpr(file, e.left, seen);
      const b = resolveExpr(file, e.right, seen);
      if (!a || !b || a.length * b.length > MAX_VALUES) return null;
      return a.flatMap((left) => b.map((right) => left + right));
    }
    if (ts.isIdentifier(e)) return resolveName(file, e.text, seen);
    return null;
  };

  const violations: Violation[] = [];
  const report = (file: string, node: ts.Node, rule: Rule, text: string) => {
    const sf = facts.get(file)!.sf;
    violations.push({
      file,
      line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
      rule,
      text,
    });
  };

  const needsFact = (items: Item[]) =>
    items.some((i) => i.children !== null || !KEY_COLUMNS.has(i.name));
  const namesFact = (items: Item[]) =>
    items.some((i) => i.children === null && i.name === FACT);
  const donorLists = (items: Item[], root: boolean): Item[][] => {
    const lists: Item[][] = root ? [items] : [];
    for (const item of items)
      if (item.children) {
        if (DONOR_EMBED.test(item.name)) lists.push(item.children);
        lists.push(...donorLists(item.children, false));
      }
    return lists;
  };

  const rootOf = (file: string, receiver: ts.Expression) => {
    let cur = unwrap(receiver);
    while (ts.isCallExpression(cur)) {
      const callee = unwrap(cur.expression);
      if (!ts.isPropertyAccessExpression(callee)) return null;
      if (callee.name.text === "from")
        return cur.arguments[0]
          ? (resolveExpr(file, cur.arguments[0], new Set()) ?? ["?"])
          : ["?"];
      if (callee.name.text === "rpc") return [RPC_ROOT];
      cur = unwrap(callee.expression);
    }
    return null;
  };

  const isOwnSelect = (
    file: string,
    fact: FileFacts,
    arg: ts.Expression | undefined,
  ): boolean => {
    if (arg && ts.isIdentifier(arg)) {
      const imported = fact.imports.get(arg.text);
      return (
        !!imported &&
        !fact.values.has(arg.text) &&
        imported.importedName === OWN_SELECT_NAME &&
        moduleBase(file, imported.specifier) === OWN_SELECT_MODULE
      );
    }
    if (
      arg &&
      ts.isPropertyAccessExpression(arg) &&
      ts.isIdentifier(arg.expression)
    ) {
      const specifier = fact.namespaces.get(arg.expression.text);
      return (
        !!specifier &&
        arg.name.text === OWN_SELECT_NAME &&
        moduleBase(file, specifier) === OWN_SELECT_MODULE
      );
    }
    return false;
  };

  const memberOf = (object: ts.ObjectLiteralExpression, name: string) => {
    const found = object.properties.filter(
      (p): p is ts.PropertyAssignment | ts.MethodDeclaration =>
        (ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)) &&
        propertyName(p.name) === name,
    );
    return found.length === 1 ? found[0]! : null;
  };

  const schemaFields = new Map<string, Set<ts.Node>>();
  const ownDonationsFields = (fact: FileFacts): Set<ts.Node> => {
    const cachedFields = schemaFields.get(fact.sf.fileName);
    if (cachedFields) return cachedFields;
    const fields = new Set<ts.Node>();
    const declaredObject = (name: string) => {
      const declared = fact.values.get(name) ?? [];
      const value = declared.length === 1 ? unwrap(declared[0]!) : null;
      return value && ts.isObjectLiteralExpression(value) ? value : null;
    };
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const callee = unwrap(node.expression);
        const name = ts.isIdentifier(callee)
          ? callee.text
          : ts.isPropertyAccessExpression(callee)
            ? callee.name.text
            : null;
        const options = node.arguments[0] && unwrap(node.arguments[0]);
        if (
          name === "createSchema" &&
          options &&
          ts.isObjectLiteralExpression(options)
        )
          for (const property of options.properties) {
            if (
              !(
                ts.isShorthandPropertyAssignment(property) ||
                ts.isPropertyAssignment(property)
              ) ||
              propertyName(property.name) !== "resolvers"
            )
              continue;
            const value = ts.isShorthandPropertyAssignment(property)
              ? property.name
              : unwrap(property.initializer);
            const resolvers = ts.isIdentifier(value)
              ? declaredObject(value.text)
              : ts.isObjectLiteralExpression(value)
                ? value
                : null;
            if (!resolvers) continue;
            for (const [field, type] of OWN_DONATIONS) {
              const typeField = memberOf(resolvers, type);
              const typeObject =
                typeField && ts.isPropertyAssignment(typeField)
                  ? unwrap(typeField.initializer)
                  : null;
              const resolver =
                typeObject && ts.isObjectLiteralExpression(typeObject)
                  ? memberOf(typeObject, field)
                  : null;
              if (resolver) fields.add(resolver);
            }
          }
      }
      ts.forEachChild(node, visit);
    };
    visit(fact.sf);
    schemaFields.set(fact.sf.fileName, fields);
    return fields;
  };

  const inOwnDonationsResolver = (fact: FileFacts, node: ts.Node) => {
    let resolver: ts.Node | undefined = node.parent;
    while (
      resolver &&
      !(
        (ts.isPropertyAssignment(resolver) ||
          ts.isMethodDeclaration(resolver)) &&
        propertyName(resolver.name)
      )
    )
      resolver = resolver.parent;
    return !!resolver && ownDonationsFields(fact).has(resolver);
  };

  for (const [file, fact] of facts) {
    const inRoots = ROOTS.some((re) => re.test(file));
    let readsDonors = false;
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node) &&
        propertyName(node.name) === "restrictedParty" &&
        !ts.isIdentifier(unwrap(node.initializer)) &&
        !ts.isPropertyAccessExpression(unwrap(node.initializer))
      )
        report(file, node, "S3", node.getText(fact.sf));
      if (
        inRoots &&
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(unwrap(node.expression)) &&
        (unwrap(node.expression) as ts.PropertyAccessExpression).name.text ===
          "select"
      ) {
        const callee = unwrap(node.expression) as ts.PropertyAccessExpression;
        const arg = node.arguments[0] && unwrap(node.arguments[0]);
        if (arg && isOwnSelect(file, fact, arg)) {
          if (!inOwnDonationsResolver(fact, node))
            report(file, callee.name, "S4", arg.getText(fact.sf));
        } else {
          const roots = rootOf(file, callee.expression) ?? [];
          const onDonors = roots.includes("donors");
          const blind =
            fact.namesDonors ||
            roots.some(
              (root) =>
                root === "donors" ||
                root === RPC_ROOT ||
                tablesReferringToDonors().has(root),
            );
          const values = arg
            ? resolveExpr(file, arg, new Set())
            : onDonors
              ? ["*"]
              : [];
          if (!values) {
            if (blind)
              report(
                file,
                callee.name,
                "S1",
                `unresolvable: ${arg ? arg.getText(fact.sf) : "()"}`,
              );
          } else
            for (const value of values) {
              const items = parseSelect(value);
              if (!items) {
                if (blind)
                  report(file, callee.name, "S1", `unparsable: ${value}`);
                continue;
              }
              for (const list of donorLists(items, onDonors)) {
                if (!needsFact(list)) continue;
                readsDonors = true;
                if (!namesFact(list))
                  report(
                    file,
                    callee.name,
                    "S1",
                    value.replace(/\s+/g, " ").trim(),
                  );
              }
            }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(fact.sf);
    if (!readsDonors) continue;
    const seamed =
      fact.callsSeam ||
      fact.relativeImports.some((specifier) => {
        const target = resolveModule(file, specifier, files);
        return target ? facts.get(target)?.callsSeam : false;
      });
    if (!seamed)
      report(
        file,
        fact.sf,
        "S2",
        `reads donors but neither it nor a relative value import calls ${SEAM} with restrictedParty`,
      );
  }
  return violations;
}

function sourceFiles(): string[] {
  return execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "apps",
      "packages",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  )
    .split("\0")
    .filter(Boolean)
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
    .filter((file) => !/(?:^|\/)(?:tests?|__tests__)\//.test(file))
    .filter((file) => !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file));
}

let cached: Violation[] | null = null;
function readSources(
  files: string[],
  read: (file: string) => string,
): Map<string, string> {
  const sources = new Map<string, string>();
  const unreadable: string[] = [];
  for (const file of files) {
    try {
      sources.set(file, read(file));
    } catch (error) {
      const code = (error as { code?: unknown }).code;
      if (code !== "ENOENT") unreadable.push(`${file} (${String(code)})`);
    }
  }
  if (unreadable.length)
    throw new Error(`the scan cannot read: ${unreadable.join(", ")}`);
  return sources;
}

function treeViolations(): Violation[] {
  if (cached) return cached;
  cached = scanSources(
    readSources([...new Set(sourceFiles())].sort(), (file) =>
      readFileSync(file, "utf8"),
    ),
  );
  return cached;
}

const MP = "packages/api/src/missionary-portal";
const planted = (files: Record<string, string>) =>
  scanSources(new Map(Object.entries(files)));
const rules = (files: Record<string, string>) =>
  [...new Set(planted(files).map((v) => v.rule))].sort();

const PLANTED: [string, Record<string, string>, Rule][] = [
  [
    "P1 a donors root selecting a name",
    {
      [`${MP}/p1.ts`]:
        'export const f = (db) => db.from("donors").select("id, name, email");',
    },
    "S1",
  ],
  [
    "P2 a const declared after its use",
    {
      [`${MP}/p2.ts`]:
        'export function f(db) { return db.from("donors").select(S); } const S = "id, name";',
    },
    "S1",
  ],
  [
    "P3 an imported const",
    {
      [`${MP}/p3.ts`]:
        'import { S } from "./s"; export const f = (db) => db.from("donors").select(S);',
      [`${MP}/s.ts`]: 'export const S = "id, avatar_url, giving_preferences";',
    },
    "S1",
  ],
  [
    "P4 an embed with a hint",
    {
      [`${MP}/p4.ts`]:
        'export const f = (db, a) => db.rpc("missionary_owned_tasks", a).select("id, donor:donors!missionary_tasks_donor_id_fkey(id, name)");',
    },
    "S1",
  ],
  [
    "P5 an embed under donors counts",
    {
      [GRAPHQL_HANDLER]:
        'const resolvers = { Query: { mySupporters: async () => db.from("donations").select("*, donor:donors(id, profile:profiles!profile_id(*))") } };',
    },
    "S1",
  ],
  [
    "P6 every column",
    {
      [`${MP}/p6.ts`]:
        'export const f = (db) => db.from("donors").select("*");',
    },
    "S1",
  ],
  [
    "P7 an argument it cannot resolve",
    {
      [`${MP}/p7.ts`]:
        'export const f = (db) => db.from("donors").select(cols());',
    },
    "S1",
  ],
  [
    "P8 the fact selected, the seam never called",
    {
      [`${MP}/p8.ts`]:
        'export const f = (db) => db.from("donors").select("id, name, donor_is_restricted_party");',
    },
    "S2",
  ],
  [
    "P9 a literal false",
    {
      "packages/api/src/x.ts":
        "isAnonymousToRecipient({ givingPreferences: p, restrictedParty: false });",
    },
    "S3",
  ],
  [
    "P10 the own-donations select in another resolver",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { mySupporters: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };',
    },
    "S4",
  ],
  [
    "P11 a select with no argument on a donors root",
    {
      [`${MP}/p11.ts`]: 'export const f = (db) => db.from("donors").select();',
    },
    "S1",
  ],
  [
    "P12 a table name held in a const",
    {
      [`${MP}/p12.ts`]:
        'const T = "donors"; export const f = (db) => db.from(T).select("id, name");',
    },
    "S1",
  ],
  [
    "P13 an embed named by its foreign-key column",
    {
      [`${MP}/p13.ts`]:
        'export const f = (db) => db.from("follower_requests").select("id, donor:donor_id(id, name, avatar_url)");',
    },
    "S1",
  ],
  [
    "P14 an embed named by its default constraint",
    {
      [`${MP}/p14.ts`]:
        'export const f = (db) => db.from("missionary_tasks").select("id, missionary_tasks_donor_id_fkey(id, name)");',
    },
    "S1",
  ],
  [
    "P15 an embed named by its same-tenant constraint",
    {
      [`${MP}/p15.ts`]:
        'export const f = (db) => db.from("donations").select("id, amount, donations_donor_same_tenant_fk(id, email)");',
    },
    "S1",
  ],
  [
    "P16 an embed named by another column that refers to donors",
    {
      [`${MP}/p16.ts`]:
        'export const f = (db) => db.from("notification_queue").select("id, recipient:recipient_donor_id(id, name)");',
    },
    "S1",
  ],
  ...[
    "donations",
    "donor_pledges",
    "donor_activities",
    "missionary_tasks",
    "follower_requests",
    "follows",
  ].map((table): [string, Record<string, string>, Rule] => [
    `P17 a select it cannot resolve on ${table}, in a file that never spells the donors table`,
    {
      [`${MP}/p17.ts`]: `import * as sel from "./sel"; export const f = (db) => db.from("${table}").select(sel.COLUMNS);`,
    },
    "S1",
  ]),
  [
    "P18 a select it cannot resolve on an rpc, in a file that never spells the donors table",
    {
      [`${MP}/p18.ts`]:
        'import * as sel from "./sel"; export const f = (db, a) => db.rpc("missionary_owned_tasks", a).select(sel.TASKS);',
    },
    "S1",
  ],
  [
    "P19 a type-only import of the file that calls the seam",
    {
      [`${MP}/p19.ts`]:
        'import type { Row } from "./seamed"; export const f = (db): Promise<Row[]> => db.from("donors").select("id, name, giving_preferences, donor_is_restricted_party");',
      [`${MP}/seamed.ts`]:
        "export type Row = { id: string }; export const g = (r) => isAnonymousToRecipient({ givingPreferences: r.giving_preferences, restrictedParty: r.donor_is_restricted_party });",
    },
    "S2",
  ],
  [
    "P20 an import whose every binding is type-only",
    {
      [`${MP}/p20.ts`]:
        'import { type Row } from "./seamed"; export const f = (db): Promise<Row[]> => db.from("donors").select("id, name, giving_preferences, donor_is_restricted_party");',
      [`${MP}/seamed.ts`]:
        "export type Row = { id: string }; export const g = (r) => isAnonymousToRecipient({ givingPreferences: r.giving_preferences, restrictedParty: r.donor_is_restricted_party });",
    },
    "S2",
  ],
  [
    "P21 a fact coerced with ?? false",
    {
      "packages/api/src/p21.ts":
        "isAnonymousToRecipient({ givingPreferences: p, restrictedParty: r.donor_is_restricted_party ?? false });",
    },
    "S3",
  ],
  [
    "P22 a fact coerced with || false",
    {
      "packages/api/src/p22.ts":
        "isAnonymousToRecipient({ givingPreferences: p, restrictedParty: r.donor_is_restricted_party || false });",
    },
    "S3",
  ],
  [
    "P23 a fact coerced with Boolean()",
    {
      "packages/api/src/p23.ts":
        "isAnonymousToRecipient({ givingPreferences: p, restrictedParty: Boolean(r.donor_is_restricted_party) });",
    },
    "S3",
  ],
  [
    "P24 a fact coerced with !",
    {
      "packages/api/src/p24.ts":
        "isAnonymousToRecipient({ givingPreferences: p, restrictedParty: !r.donor_is_restricted_party });",
    },
    "S3",
  ],
  [
    "P25 the own-donations select in an object inside another resolver",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { mySupporters: () => ({ myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) }).myDonations() } };',
    },
    "S4",
  ],
  [
    "P26 myDonations under Mutation",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Mutation: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };',
    },
    "S4",
  ],
  [
    "P27 Query.myDonations built inside a function, not the resolvers",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nexport function make() { return { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } }; }',
    },
    "S4",
  ],
  [
    "P28 an unrelated top-level object whose Query.myDonations reads the own-donations select",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };\nconst other = { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
    "S4",
  ],
  [
    "P29 the own-donations select imported under another name, outside the two fields",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT as OWN } from "@asym/api/donations/select";\nconst resolvers = { Query: { mySupporters: () => db.from("donations").select(OWN) } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
    "S4",
  ],
  [
    "P30 the own-donations select read through a namespace import, outside the two fields",
    {
      [GRAPHQL_HANDLER]:
        'import * as selects from "@asym/api/donations/select";\nconst resolvers = { Query: { mySupporters: () => db.from("donations").select(selects.DONATION_WITH_PARTIES_SELECT) } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
    "S4",
  ],
];

const CONTROLS: [string, Record<string, string>][] = [
  [
    "K1 keys only",
    {
      [`${MP}/k1.ts`]:
        'export const f = (db, me) => db.from("donors").select("id").eq("profile_id", me);',
    },
  ],
  [
    "K2 the fact selected and passed to the seam",
    {
      [`${MP}/k2.ts`]:
        'export const f = (db) => db.from("donors").select("id, name, giving_preferences, donor_is_restricted_party");\nexport const g = (r) => isAnonymousToRecipient({ givingPreferences: r.giving_preferences, restrictedParty: r.donor_is_restricted_party });',
    },
  ],
  [
    "K3 the own-donations select in myDonations of the resolvers given to createSchema",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
  ],
  [
    "K4 P1 outside the roots",
    {
      "packages/api/src/donor-portal/x.ts":
        'export const f = (db) => db.from("donors").select("id, name, email");',
    },
  ],
  [
    "K5 a donor_id column, and a donor_id embed of keys only",
    {
      [`${MP}/k5.ts`]:
        'export const f = (db) => db.from("donations").select("id, amount, donor_id, donor:donor_id(id, tenant_id)");',
    },
  ],
  [
    "K6 a select it cannot resolve on a table that does not refer to donors",
    {
      [`${MP}/k6.ts`]:
        'import * as sel from "./sel"; export const f = (db) => db.from("posts").select(sel.COLUMNS);',
    },
  ],
  [
    "K7 a value import of the file that calls the seam, alone and beside a type-only binding",
    {
      [`${MP}/k7a.ts`]:
        'import { g } from "./seamed"; export const f = (db) => db.from("donors").select("id, name, giving_preferences, donor_is_restricted_party").then(g);',
      [`${MP}/k7b.ts`]:
        'import { type Row, g } from "./seamed"; export const f = (db): Promise<Row[]> => db.from("donors").select("id, name, giving_preferences, donor_is_restricted_party").then(g);',
      [`${MP}/seamed.ts`]:
        "export type Row = { id: string }; export const g = (r) => isAnonymousToRecipient({ givingPreferences: r.giving_preferences, restrictedParty: r.donor_is_restricted_party });",
    },
  ],
  [
    "K8 a fact passed as a variable, by name and in shorthand",
    {
      "packages/api/src/k8.ts":
        "const restrictedParty = r.donor_is_restricted_party; isAnonymousToRecipient({ givingPreferences: p, restrictedParty }); isAnonymousToRecipient({ givingPreferences: p, restrictedParty: restrictedParty });",
    },
  ],
  [
    "K9 the own-donations select in Query.myDonations and Mutation.createDonation of the resolvers given to createSchema",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) }, Mutation: { createDonation: async () => db.from("donations").insert({}).select(DONATION_WITH_PARTIES_SELECT).single() } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
  ],
  [
    "K10 the own-donations select imported under another name, in the two fields of the resolvers given to createSchema",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT as OWN } from "@asym/api/donations/select";\nconst resolvers = { Query: { myDonations: () => db.from("donations").select(OWN) }, Mutation: { createDonation: async () => db.from("donations").insert({}).select(OWN).single() } };\nexport const schema = createSchema({ typeDefs, resolvers });',
    },
  ],
];

describe("AL-2678 WP5 part 2-r2s: a colleague reads a donor only with the restriction fact, through the seam (ADR 0008)", () => {
  it.each(PLANTED)("a planted case %s is reported", (_label, files, rule) => {
    expect(rules(files)).toContain(rule);
  });

  it.each(CONTROLS)("a control %s is not reported", (_label, files) => {
    expect(planted(files)).toEqual([]);
  });

  it("the tree has no donors read without the fact, no read outside the seam, no literal false and no own-donations select in another resolver", () => {
    expect(treeViolations()).toEqual([]);
  });

  it("the real GraphQL handler, with the select module it imports, is reported for nothing", () => {
    expect(
      planted({
        [GRAPHQL_HANDLER]: readFileSync(GRAPHQL_HANDLER, "utf8"),
        "packages/api/src/donations/select.ts": readFileSync(
          "packages/api/src/donations/select.ts",
          "utf8",
        ),
      }),
    ).toEqual([]);
  });

  it("the scan reaches the seven readers", () => {
    const scanned = new Set(sourceFiles());
    for (const file of [
      GRAPHQL_HANDLER,
      "packages/api/src/donations/select.ts",
      `${MP}/donors.ts`,
      `${MP}/service.ts`,
      `${MP}/model.ts`,
      `${MP}/donor.ts`,
      "packages/api/src/follower-requests/index.ts",
      "packages/api/src/follower-requests/request.ts",
      "packages/api/src/missionaries/metrics.ts",
    ])
      expect(scanned.has(file), file).toBe(true);
  });
});

const TREE_DONOR_TABLES = [
  "account_claim_requests",
  "campaigns",
  "contribution_notification_events",
  "contribution_operation_audit_events",
  "donation_saga_outbox",
  "donations",
  "donor_activities",
  "donor_feed_preferences",
  "donor_merge_audit",
  "donor_merge_candidates",
  "donor_merge_redirects",
  "donor_pledges",
  "external_identifiers",
  "follower_requests",
  "follows",
  "legacy_account_invitations",
  "missionary_tasks",
  "notification_queue",
  "pledge_charge_attempts",
  "staged_gifts",
];

const readMigrationTexts = (texts: Record<string, string>) =>
  [...donorTablesFrom(Object.entries(texts))].sort();

describe("AL-2678 WP5 part 2-r2s: the migration reader gives every reference to donors a table, or fails naming where it is (ADR 0008)", () => {
  it("R1 a reference it cannot give a table fails, naming the file and the line", () => {
    expect(() =>
      readMigrationTexts({
        "20990101000000_dynamic.sql":
          "CREATE TABLE public.a (id uuid);\nDO $$ BEGIN\n  EXECUTE format('CREATE TABLE %I (donor_id uuid REFERENCES public.donors(id))', 'b');\nEND $$;\n",
      }),
    ).toThrow(/20990101000000_dynamic\.sql:3\b/);
  });

  it("R2 a reference inside a block comment is ignored", () => {
    expect(
      readMigrationTexts({
        "20990101000001_note.sql":
          "CREATE TABLE public.c (id uuid);\n/* ALTER TABLE public.d ADD COLUMN donor_id uuid REFERENCES public.donors(id); */\n",
      }),
    ).toEqual([]);
  });

  it("R3 a semicolon inside a block comment does not end the statement", () => {
    expect(
      readMigrationTexts({
        "20990101000002_split.sql":
          "CREATE TABLE public.e (\n  id uuid, /* first; second */\n  donor_id uuid REFERENCES public.donors(id)\n);\n",
      }),
    ).toEqual(["e"]);
  });

  it("R4 a quoted schema is read", () => {
    expect(
      readMigrationTexts({
        "20990101000003_quoted.sql":
          'ALTER TABLE "public"."f" ADD CONSTRAINT f_donor_fk FOREIGN KEY (donor_id) REFERENCES "public"."donors"(id);\n',
      }),
    ).toEqual(["f"]);
  });

  it("R5 a table renamed after its reference is read under both names", () => {
    expect(
      readMigrationTexts({
        "20990101000005_rename.sql": "ALTER TABLE public.g RENAME TO h;\n",
        "20990101000004_link.sql":
          "ALTER TABLE public.g ADD COLUMN donor_id uuid REFERENCES public.donors(id);\n",
      }),
    ).toEqual(["g", "h"]);
  });

  it("the tree's migrations still give the twenty tables (guard)", () => {
    expect(TREE_DONOR_TABLES).toHaveLength(20);
    expect([...tablesReferringToDonors()]).toEqual(
      expect.arrayContaining(TREE_DONOR_TABLES),
    );
  });
});

const failingRead =
  (failures: Record<string, string>) =>
  (file: string): string => {
    const code = failures[file];
    if (code) throw Object.assign(new Error(`${code}: ${file}`), { code });
    return "export {};";
  };

describe("AL-2678 WP5 part 2-r2s: the scanner reads every file it lists, or fails naming it (ADR 0008)", () => {
  it("V1 a listed file it cannot read fails the scan, naming the path", () => {
    expect(() =>
      readSources(
        ["packages/api/src/a.ts", "packages/api/src/b.ts"],
        failingRead({ "packages/api/src/b.ts": "EACCES" }),
      ),
    ).toThrow(/packages\/api\/src\/b\.ts/);
  });

  it("V2 a listed file deleted from the working tree is skipped", () => {
    expect([
      ...readSources(
        ["packages/api/src/a.ts", "packages/api/src/gone.ts"],
        failingRead({ "packages/api/src/gone.ts": "ENOENT" }),
      ).keys(),
    ]).toEqual(["packages/api/src/a.ts"]);
  });
});
