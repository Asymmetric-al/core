import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
const OWN_DONATIONS = new Set(["myDonations", "createDonation"]);
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
    if (specifier.startsWith(".")) relativeImports.push(specifier);
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const el of bindings.elements)
        imports.set(el.name.text, {
          specifier,
          importedName: el.propertyName?.text ?? el.name.text,
        });
  }
  return { sf, values, imports, relativeImports, namesDonors, callsSeam };
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
        if (item.name === "donors") lists.push(item.children);
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
      if (callee.name.text === "rpc") return [];
      cur = unwrap(callee.expression);
    }
    return null;
  };

  const enclosingProperty = (node: ts.Node): string | null => {
    for (let cur = node.parent; cur; cur = cur.parent)
      if (
        (ts.isPropertyAssignment(cur) || ts.isMethodDeclaration(cur)) &&
        propertyName(cur.name)
      )
        return propertyName(cur.name);
    return null;
  };

  for (const [file, fact] of facts) {
    const inRoots = ROOTS.some((re) => re.test(file));
    let readsDonors = false;
    const visit = (node: ts.Node) => {
      if (
        ts.isPropertyAssignment(node) &&
        propertyName(node.name) === "restrictedParty" &&
        unwrap(node.initializer).kind === ts.SyntaxKind.FalseKeyword
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
        if (
          file === GRAPHQL_HANDLER &&
          arg &&
          ts.isIdentifier(arg) &&
          arg.text === "DONATION_WITH_PARTIES_SELECT"
        ) {
          if (!OWN_DONATIONS.has(enclosingProperty(node) ?? ""))
            report(file, callee.name, "S4", arg.getText(fact.sf));
        } else {
          const roots = rootOf(file, callee.expression) ?? [];
          const onDonors = roots.includes("donors");
          const values = arg
            ? resolveExpr(file, arg, new Set())
            : onDonors
              ? ["*"]
              : [];
          if (!values) {
            if (fact.namesDonors || onDonors)
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
                if (fact.namesDonors || onDonors)
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
        `reads donors but neither it nor a relative import calls ${SEAM} with restrictedParty`,
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
function treeViolations(): Violation[] {
  if (cached) return cached;
  const sources = new Map<string, string>();
  for (const file of [...new Set(sourceFiles())].sort()) {
    try {
      sources.set(file, readFileSync(file, "utf8"));
    } catch {}
  }
  cached = scanSources(sources);
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
    "K3 the own-donations select in myDonations",
    {
      [GRAPHQL_HANDLER]:
        'import { DONATION_WITH_PARTIES_SELECT } from "@asym/api/donations/select";\nconst resolvers = { Query: { myDonations: () => db.from("donations").select(DONATION_WITH_PARTIES_SELECT) } };',
    },
  ],
  [
    "K4 P1 outside the roots",
    {
      "packages/api/src/donor-portal/x.ts":
        'export const f = (db) => db.from("donors").select("id, name, email");',
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
