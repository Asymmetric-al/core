import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const NAME_COLUMNS = new Set([
  "display_name",
  "full_name",
  "first_name",
  "last_name",
]);
const AUTHOR_COLUMNS = new Set(["id", "avatar_url"]);
const MISSION_CONTROL = [/^apps\/admin\//, /^packages\/api\/src\/admin\//];
const ALLOWLIST: { file: string; owner: string }[] = [
  { file: "packages/api/src/public-giving/columns.ts", owner: "WP7" },
];
const RESOLVE_EXTS = ["", ".ts", ".tsx", ".mts", ".mjs", ".js", "/index.ts"];

type Item = {
  name: string;
  hints: string[];
  children: Item[] | null;
};

type Violation = { file: string; rule: string; text: string };

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
    items.push({
      name: m[1]!,
      hints: m[2]!
        .split("!")
        .map((h) => h.trim())
        .filter(Boolean),
      children,
    });
  }
  return items;
}

function workerSelectProblems(items: Item[]): string[] {
  const problems: string[] = [];
  for (const item of items) {
    if (item.children === null && NAME_COLUMNS.has(item.name))
      problems.push(`a worker row's ${item.name}`);
    if (item.children === null && item.name === "*")
      problems.push("every column of a worker row");
  }
  return [...problems, ...nestedProfileProblems(items)];
}

function nestedProfileProblems(items: Item[]): string[] {
  const problems: string[] = [];
  for (const item of items) {
    if (item.children === null) continue;
    if (item.name === "profiles")
      for (const child of item.children)
        if (child.name === "*" || NAME_COLUMNS.has(child.name))
          problems.push(`a worker's profile ${child.name}`);
    problems.push(...nestedProfileProblems(item.children));
  }
  return problems;
}

type Literal = { start: number; end: number; text: string; whole: boolean };

type Imports = Map<string, { specifier: string; importedName: string }>;

type FileFacts = {
  literals: Literal[];
  fromRoots: { start: number; end: number; root: string }[];
  varSpans: Map<string, [number, number][]>;
  selectIds: { name: string; root: string }[];
  imports: Imports;
  partiesFrom: string[];
  authorNames: string[];
  cacheReads: { rule: string; text: string }[];
  functions: { name: string; start: number; end: number }[];
  workerReads: number[];
  calls: { pos: number; name: string }[];
  cachedSpans: [number, number][];
};

type ValuesOf = (file: string, name: string) => ReadonlySet<string>;

const CACHE_DIRECTIVES = new Set([
  "use cache",
  "use cache: remote",
  "use cache: private",
]);
const WORKER_NAME_COLUMN =
  /(?<![A-Za-z0-9_])(?:worker_public_name|post_author_public_name)(?![A-Za-z0-9_])/;

function unwrap(expr: ts.Expression): ts.Expression {
  let cur = expr;
  for (;;) {
    if (ts.isParenthesizedExpression(cur)) cur = cur.expression;
    else if (ts.isAsExpression(cur)) cur = cur.expression;
    else if (ts.isSatisfiesExpression(cur)) cur = cur.expression;
    else if (ts.isNonNullExpression(cur)) cur = cur.expression;
    else if (ts.isAwaitExpression(cur)) cur = cur.expression;
    else return cur;
  }
}

function assignedString(
  node: ts.Node,
): { name: string; value: ts.Expression } | null {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name))
    return node.initializer
      ? { name: node.name.text, value: node.initializer }
      : null;
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    ts.isIdentifier(node.left)
  )
    return { name: node.left.text, value: node.right };
  return null;
}

function stringVariablesOf(sf: ts.SourceFile): Map<string, Set<string>> {
  const values = new Map<string, Set<string>>();
  const visit = (node: ts.Node) => {
    const assigned = assignedString(node);
    if (assigned) {
      const value = unwrap(assigned.value);
      if (
        ts.isStringLiteral(value) ||
        ts.isNoSubstitutionTemplateLiteral(value)
      ) {
        const set = values.get(assigned.name) ?? new Set<string>();
        set.add(value.text);
        values.set(assigned.name, set);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return values;
}

function importsOf(sf: ts.SourceFile): Imports {
  const imports: Imports = new Map();
  for (const node of sf.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier)
    )
      continue;
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const el of bindings.elements)
        imports.set(el.name.text, {
          specifier: node.moduleSpecifier.text,
          importedName: el.propertyName?.text ?? el.name.text,
        });
  }
  return imports;
}

function startsWithCacheDirective(statements: ts.NodeArray<ts.Statement>) {
  for (const statement of statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    )
      return false;
    if (CACHE_DIRECTIVES.has(statement.expression.text)) return true;
  }
  return false;
}

function opensCache(node: ts.Node) {
  if (ts.isSourceFile(node)) return startsWithCacheDirective(node.statements);
  if (
    (ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)) &&
    node.body !== undefined &&
    ts.isBlock(node.body)
  )
    return startsWithCacheDirective(node.body.statements);
  return false;
}

function propertyNamed(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | null {
  for (const p of object.properties) {
    if (
      ts.isPropertyAssignment(p) &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
      p.name.text === name
    )
      return unwrap(p.initializer);
    if (ts.isShorthandPropertyAssignment(p) && p.name.text === name)
      return p.name;
  }
  return null;
}

function revalidateCaches(value: ts.Expression) {
  const v = unwrap(value);
  if (ts.isNumericLiteral(v)) return Number(v.text) > 0;
  return true;
}

function factsOf(
  file: string,
  sf: ts.SourceFile,
  imports: Imports,
  valuesOf: ValuesOf,
): FileFacts {
  const facts: FileFacts = {
    literals: [],
    fromRoots: [],
    varSpans: new Map(),
    selectIds: [],
    imports,
    partiesFrom: [],
    authorNames: [],
    cacheReads: [],
    functions: [],
    workerReads: [],
    calls: [],
    cachedSpans: [],
  };
  const objectBindings = new Map<
    string,
    { count: number; literal: ts.ObjectLiteralExpression | null }
  >();
  const countBindings = (node: ts.Node) => {
    const assigned = assignedString(node);
    if (assigned) {
      const value = unwrap(assigned.value);
      const seen = objectBindings.get(assigned.name);
      objectBindings.set(assigned.name, {
        count: (seen?.count ?? 0) + 1,
        literal: ts.isObjectLiteralExpression(value) ? value : null,
      });
    }
    ts.forEachChild(node, countBindings);
  };
  countBindings(sf);
  const optionsOf = (arg: ts.Expression | undefined) => {
    const e = arg && unwrap(arg);
    if (!e) return null;
    if (ts.isObjectLiteralExpression(e)) return e;
    if (ts.isIdentifier(e)) {
      const bound = objectBindings.get(e.text);
      if (bound?.count === 1 && bound.literal) return bound.literal;
    }
    return null;
  };
  const tableOf = (arg: ts.Expression | undefined): ReadonlySet<string> => {
    if (!arg) return new Set();
    const e = unwrap(arg);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))
      return new Set([e.text]);
    if (ts.isIdentifier(e)) return valuesOf(file, e.text);
    return new Set();
  };
  const rootOf = (receiver: ts.Expression): ReadonlySet<string> => {
    let cur = unwrap(receiver);
    while (ts.isCallExpression(cur)) {
      const callee = unwrap(cur.expression);
      if (!ts.isPropertyAccessExpression(callee)) return new Set();
      if (callee.name.text === "from") return tableOf(cur.arguments[0]);
      cur = unwrap(callee.expression);
    }
    return new Set();
  };
  const textsOf = (expr: ts.Node): string[] => {
    const out: string[] = [];
    const walk = (n: ts.Node) => {
      if (
        ts.isStringLiteral(n) ||
        ts.isNoSubstitutionTemplateLiteral(n) ||
        ts.isTemplateHead(n) ||
        ts.isTemplateMiddle(n) ||
        ts.isTemplateTail(n)
      )
        out.push(n.text);
      else if (ts.isIdentifier(n)) out.push(...valuesOf(file, n.text));
      ts.forEachChild(n, walk);
    };
    walk(expr);
    return out;
  };
  const isUnstableCache = (callee: ts.Expression) => {
    if (ts.isPropertyAccessExpression(callee))
      return callee.name.text === "unstable_cache";
    if (!ts.isIdentifier(callee)) return false;
    const imported = imports.get(callee.text);
    return imported
      ? imported.specifier === "next/cache" &&
          imported.importedName === "unstable_cache"
      : callee.text === "unstable_cache";
  };
  const isFetch = (callee: ts.Expression) =>
    (ts.isIdentifier(callee) && callee.text === "fetch") ||
    (ts.isPropertyAccessExpression(callee) && callee.name.text === "fetch");
  const collectIds = (node: ts.Node, out: Set<string>) => {
    if (ts.isIdentifier(node)) out.add(node.text);
    else if (ts.isPropertyAccessExpression(node))
      collectIds(node.expression, out);
    else ts.forEachChild(node, (c) => collectIds(c, out));
  };
  let cached = 0;
  const visit = (node: ts.Node) => {
    const opens = opensCache(node);
    if (opens) {
      cached++;
      facts.cachedSpans.push([node.getStart(sf), node.getEnd()]);
    }
    if (ts.isFunctionDeclaration(node) && node.name)
      facts.functions.push({
        name: node.name.text,
        start: node.getStart(sf),
        end: node.getEnd(),
      });
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const init = unwrap(node.initializer);
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
        facts.functions.push({
          name: node.name.text,
          start: init.getStart(sf),
          end: init.getEnd(),
        });
    }
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    )
      facts.literals.push({
        start: node.getStart(sf),
        end: node.getEnd(),
        text: node.text,
        whole:
          ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node),
      });
    const assigned = assignedString(node);
    if (assigned) {
      const spans = facts.varSpans.get(assigned.name) ?? [];
      spans.push([assigned.value.getStart(sf), assigned.value.getEnd()]);
      facts.varSpans.set(assigned.name, spans);
    }
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      if (ts.isIdentifier(callee))
        facts.calls.push({ pos: node.getStart(sf), name: callee.text });
      if (isUnstableCache(callee))
        facts.cacheReads.push({
          rule: "unstable_cache outside Mission Control",
          text: node.getText(sf),
        });
      const options = optionsOf(node.arguments[1]);
      if (isFetch(callee) && options) {
        const cache = propertyNamed(options, "cache");
        const next = propertyNamed(options, "next");
        const revalidate =
          next && ts.isObjectLiteralExpression(next)
            ? propertyNamed(next, "revalidate")
            : null;
        if (
          (cache !== null && tableOf(cache).has("force-cache")) ||
          (revalidate !== null && revalidateCaches(revalidate))
        )
          facts.cacheReads.push({
            rule: "a fetch cached on the server outside Mission Control",
            text: node.getText(sf),
          });
      }
      if (ts.isPropertyAccessExpression(callee)) {
        if (
          callee.name.text === "from" &&
          tableOf(node.arguments[0]).has("parties")
        )
          facts.partiesFrom.push(node.getText(sf));
        if (
          callee.name.text === "rpc" &&
          tableOf(node.arguments[0]).has("post_comment_authors")
        ) {
          facts.workerReads.push(node.getStart(sf));
          if (cached > 0)
            facts.cacheReads.push({
              rule: "commenters' names in a server cache",
              text: node.getText(sf),
            });
        }
        if (callee.name.text === "select" && node.arguments[0]) {
          const arg = node.arguments[0];
          if (textsOf(arg).some((t) => WORKER_NAME_COLUMN.test(t))) {
            facts.workerReads.push(node.getStart(sf));
            if (cached > 0)
              facts.cacheReads.push({
                rule: "a worker's public name in a server cache",
                text: node.getText(sf),
              });
          }
          for (const root of rootOf(callee.expression)) {
            facts.fromRoots.push({
              start: arg.getStart(sf),
              end: arg.getEnd(),
              root,
            });
            const ids = new Set<string>();
            collectIds(arg, ids);
            for (const name of ids) facts.selectIds.push({ name, root });
          }
        }
      }
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      NAME_COLUMNS.has(node.name.text)
    ) {
      const target = unwrap(node.expression);
      if (
        (ts.isIdentifier(target) && target.text === "author") ||
        (ts.isPropertyAccessExpression(target) && target.name.text === "author")
      )
        facts.authorNames.push(node.getText(sf));
    }
    ts.forEachChild(node, visit);
    if (opens) cached--;
  };
  visit(sf);
  return facts;
}

function resolveModule(
  from: string,
  specifier: string,
  files: Set<string>,
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

const INTERPOLATED_HINT =
  /(?:(?<![A-Za-z0-9_])(?:missionaries|profiles|posts|post_comments)(?:\s*!\s*\w+)*\s*!\s*|(?:^|[,(])\s*(?:[A-Za-z_]\w*\s*:\s*)?(?:missionaries|profiles|posts|post_comments)\s*)$/;

const EMBED_RE =
  /(?<![A-Za-z0-9_])(?:\.\.\.\s*)?(?:[A-Za-z_]\w*\s*:\s*)?(missionaries|profiles|donors|parties|posts|post_comments)((?:\s*!\s*\w+)*)\s*\(/g;

type Embed = {
  resource: string;
  hints: string[];
  start: number;
  open: number;
  close: number;
};

function embedsIn(text: string): Embed[] {
  const out: Embed[] = [];
  for (const m of text.matchAll(EMBED_RE)) {
    const open = m.index + m[0].length - 1;
    out.push({
      resource: m[1]!,
      hints: m[2]!
        .split("!")
        .map((h) => h.trim())
        .filter(Boolean),
      start: m.index,
      open,
      close: matchingParen(text, open),
    });
  }
  return out;
}

function scanSources(sources: Map<string, string>): Violation[] {
  const files = new Set(sources.keys());
  const parsed = new Map<string, ts.SourceFile>();
  for (const [file, text] of sources)
    parsed.set(
      file,
      ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true),
    );
  const strings = new Map<string, Map<string, Set<string>>>();
  const imports = new Map<string, Imports>();
  for (const [file, sf] of parsed) {
    strings.set(file, stringVariablesOf(sf));
    imports.set(file, importsOf(sf));
  }
  const none: ReadonlySet<string> = new Set();
  const valuesOf: ValuesOf = (file, name) => {
    const own = strings.get(file)?.get(name);
    const imported = imports.get(file)?.get(name);
    const resolved = imported && resolveModule(file, imported.specifier, files);
    const theirs =
      resolved && strings.get(resolved)?.get(imported.importedName);
    if (own && theirs) return new Set([...own, ...theirs]);
    return own ?? theirs ?? none;
  };
  const facts = new Map<string, FileFacts>();
  for (const [file, sf] of parsed)
    facts.set(file, factsOf(file, sf, imports.get(file)!, valuesOf));
  const varRoots = new Map<string, Set<string>>();
  const bind = (file: string, name: string, root: string) => {
    const f = facts.get(file)!;
    const targets: [string, string][] = [];
    if (f.varSpans.has(name)) targets.push([file, name]);
    const imp = f.imports.get(name);
    const resolved = imp && resolveModule(file, imp.specifier, files);
    if (resolved && facts.get(resolved)!.varSpans.has(imp!.importedName))
      targets.push([resolved, imp!.importedName]);
    for (const [targetFile, targetName] of targets) {
      const key = `${targetFile}\0${targetName}`;
      const set = varRoots.get(key) ?? new Set<string>();
      set.add(root);
      varRoots.set(key, set);
    }
  };
  for (const [file, f] of facts)
    for (const ref of f.selectIds) bind(file, ref.name, ref.root);
  const readsThrough = (
    file: string,
    name: string,
    seen: Set<string>,
  ): boolean => {
    const key = `${file}\0${name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    const f = facts.get(file);
    if (!f) return false;
    const own = f.functions.filter((fn) => fn.name === name);
    if (own.length > 0)
      return own.some(
        (fn) =>
          f.workerReads.some((pos) => pos >= fn.start && pos < fn.end) ||
          f.calls.some(
            (call) =>
              call.pos >= fn.start &&
              call.pos < fn.end &&
              readsThrough(file, call.name, seen),
          ),
      );
    const imp = f.imports.get(name);
    const resolved = imp && resolveModule(file, imp.specifier, files);
    return resolved ? readsThrough(resolved, imp.importedName, seen) : false;
  };

  const violations: Violation[] = [];
  for (const [file, f] of facts) {
    const push = (rule: string, text: string) =>
      violations.push({ file, rule, text });
    for (const call of f.partiesFrom) push("a parties read", call);
    for (const access of f.authorNames)
      push("a post author's profile name", access);
    for (const read of f.cacheReads) push(read.rule, read.text);
    for (const [start, end] of f.cachedSpans)
      for (const call of f.calls)
        if (
          call.pos >= start &&
          call.pos < end &&
          readsThrough(file, call.name, new Set())
        )
          push(
            "a worker's public name in a server cache, through a call",
            call.name,
          );
    for (const lit of f.literals) {
      if (lit.text.trim() === "parties") push("a parties read", lit.text);
      const roots = new Set<string>();
      for (const r of f.fromRoots)
        if (lit.start >= r.start && lit.end <= r.end) roots.add(r.root);
      for (const [name, spans] of f.varSpans)
        if (spans.some(([s, e]) => lit.start >= s && lit.end <= e))
          for (const root of varRoots.get(`${file}\0${name}`) ?? [])
            roots.add(root);
      if (!lit.whole && INTERPOLATED_HINT.test(lit.text))
        push("an unreadable worker embed: its hint is interpolated", lit.text);
      const embeds = embedsIn(lit.text);
      const inside = (e: Embed, resource: string) =>
        embeds.some(
          (o) =>
            o !== e &&
            o.resource === resource &&
            o.open < e.start &&
            (o.close === -1 || o.close > e.start),
        );
      for (const e of embeds) {
        const body =
          e.close === -1
            ? null
            : parseSelect(lit.text.slice(e.open + 1, e.close));
        const shown = lit.text.slice(
          e.start,
          e.close === -1 ? undefined : e.close + 1,
        );
        if (e.resource === "parties") {
          push("a parties read", shown);
          continue;
        }
        if (
          e.resource === "donors" ||
          e.resource === "posts" ||
          e.resource === "post_comments"
        )
          continue;
        if (e.resource === "missionaries") {
          if (body === null) push("an unreadable worker embed", shown);
          else
            for (const problem of workerSelectProblems(body))
              push(problem, shown);
          continue;
        }
        const nested = embeds.some(
          (o) =>
            o !== e &&
            o.open < e.start &&
            (o.close === -1 || o.close > e.start),
        );
        if (
          (!nested && roots.has("post_comments")) ||
          inside(e, "post_comments")
        ) {
          push(
            "a commenter's profile: commenters come only from post_comment_authors",
            shown,
          );
          continue;
        }
        if (
          e.hints.includes("missionary_id") ||
          e.hints.includes("posts_missionary_id_fkey") ||
          (!nested && roots.has("posts")) ||
          inside(e, "posts")
        ) {
          if (
            body === null ||
            body.some((i) => i.children !== null || !AUTHOR_COLUMNS.has(i.name))
          )
            push("a post author's profile beyond id and avatar_url", shown);
          continue;
        }
        if (inside(e, "missionaries") || inside(e, "donors")) continue;
        if (nested) continue;
        const workerRead = roots.size === 0 || roots.has("missionaries");
        if (!workerRead) continue;
        if (body === null) push("an unreadable worker embed", shown);
        else
          for (const child of body)
            if (child.name === "*" || NAME_COLUMNS.has(child.name))
              push(`a worker's profile ${child.name}`, shown);
      }
      if (roots.has("missionaries")) {
        if (lit.whole) {
          const top = parseSelect(lit.text);
          if (top === null)
            push("an unreadable worker select", lit.text.trim());
          else
            for (const item of top) {
              if (item.children === null && NAME_COLUMNS.has(item.name))
                push(`a worker row's ${item.name}`, lit.text.trim());
              if (item.children === null && item.name === "*")
                push("every column of a worker row", lit.text.trim());
            }
        } else {
          let flat = lit.text;
          while (/\([^()]*\)/.test(flat))
            flat = flat.replace(/\([^()]*\)/g, "");
          for (const name of NAME_COLUMNS)
            if (new RegExp(`(?<![\\w.])${name}(?![\\w])`).test(flat))
              push(`a worker row's ${name}`, lit.text.trim());
          if (/(?<![\w.])\*/.test(flat))
            push("every column of a worker row", lit.text.trim());
        }
      }
    }
  }
  return violations;
}

function scanText(file: string, text: string) {
  return scanSources(new Map([[file, text]]));
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
    .filter((file) => !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file))
    .filter((file) => !MISSION_CONTROL.some((re) => re.test(file)));
}

let cached: Violation[] | null = null;
function repoViolations(): Violation[] {
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

const FAILS: [string, string][] = [
  [
    "a worker's profile display name in a missionaries embed",
    'const s = "missionaries(id, profile:profiles(display_name))";',
  ],
  [
    "a worker's whole profile in a missionaries embed",
    'const s = "missionaries(*, profile:profiles(*))";',
  ],
  ["a worker row's first name", 'const s = "missionaries(id, first_name)";'],
  [
    "a post author's first name",
    'const s = "profiles!missionary_id(first_name)";',
  ],
  [
    "a parties read",
    'export const go = (db) => db.from("parties").select("id");',
  ],
  [
    "a parties read by a single-quoted name",
    "export const go = (db) => db.from('parties');",
  ],
  ["a parties embed", 'const s = "parties(display_name)";'],
  [
    "a worker's whole profile from a missionaries root",
    'export const go = (db) => db.from("missionaries").select("*, profile:profiles!profile_id(*)");',
  ],
  [
    "a post author's first name read in code",
    "export const n = (post) => post.author.first_name;",
  ],
  [
    "a post author's last name read optionally",
    "export const n = (author) => author?.last_name;",
  ],
  [
    "a post author's name by the key's constraint name under a posts root (F2)",
    'export const go = (db) => db.from("posts").select("*, author:profiles!posts_missionary_id_fkey(first_name)");',
  ],
  [
    "a post author's name with no hint under a posts root (F2)",
    'export const go = (db) => db.from("posts").select("*, author:profiles(display_name)");',
  ],
  [
    "a post author's full name by the column hint under a posts root (F2)",
    'export const go = (db) => db.from("posts").select("*, author:profiles!missionary_id(id, full_name)");',
  ],
  [
    "a post author's name by the constraint name in an unbound literal (F2)",
    'const s = "author:profiles!posts_missionary_id_fkey(id, display_name)";',
  ],
  [
    "a post author's display name read in code (F2)",
    "export const n = (post) => post.author.display_name;",
  ],
  [
    "a post author's full name read optionally (F2)",
    "export const n = (author) => author?.full_name;",
  ],
  [
    "every column of a worker row in a missionaries embed (Q4)",
    'const s = "missionary:missionaries(*, worker_public_name)";',
  ],
  [
    "every column of a worker row from a missionaries root (Q4)",
    'export const go = (db) => db.from("missionaries").select("*");',
  ],
  [
    "a post author's name nested in a posts embed under another root (C1a)",
    'export const go = (db) => db.from("post_likes").select("id, post:posts(id, author:profiles(display_name))");',
  ],
  [
    "a post author's name nested in a posts embed inside a missionaries embed (C1a)",
    'export const go = (db) => db.from("donations").select("id, missionary:missionaries(id, posts(id, author:profiles(display_name)))");',
  ],
  [
    "a worker's whole profile two embeds deep in a missionaries embed (C1a)",
    'const s = "missionaries(id, party:assignments(id, profile:profiles(*)))";',
  ],
  [
    "a missionaries embed whose hint is interpolated before its parenthesis (C1b)",
    'export const go = (db, h) => db.from("donations").select(`*, missionary:missionaries!${h}(*, profile:profiles(display_name))`);',
  ],
  [
    "a profiles embed whose hint is interpolated before its parenthesis (C1b)",
    'export const go = (db, h) => db.from("missionaries").select(`id, profile:profiles!${h}(display_name)`);',
  ],
];

const PASSES: [string, string][] = [
  [
    "a donor's own profile by id",
    'export const go = (db) => db.from("profiles").select("id, display_name, first_name, last_name");',
  ],
  [
    "a donor's own profile under donors",
    'const s = "donor:donors(id, profile:profiles!profile_id(*))";',
  ],
  [
    "the donor portal's worker embed",
    'const s = "missionary:missionaries(id, worker_public_name, profile:profiles(id, avatar_url))";',
  ],
  [
    "the feed's author embed",
    'const s = "*, author:profiles!missionary_id(id, avatar_url), post_author_public_name";',
  ],
  [
    "the feed's author embed under a posts root",
    'export const go = (db) => db.from("posts").select("*, author:profiles!missionary_id(id, avatar_url), post_author_public_name");',
  ],
  [
    "the donations read's explicit worker columns",
    'const s = "missionary:missionaries(id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url))";',
  ],
];

const FEED_SELECT_MODULE =
  'export const FEED_POST_SELECT = "*, author:profiles!missionary_id(id, avatar_url), post_author_public_name";';
const CACHED_FEED_READ =
  'export async function g(db) { "use cache"; return db.from("posts").select(FEED_POST_SELECT); }';
const FEED_IMPORT = 'import { FEED_POST_SELECT } from "./t";\n';

function planted(code: string, t: string | null) {
  return scanSources(
    new Map([
      ["apps/donor/planted.ts", code],
      ...(t === null ? [] : [["apps/donor/t.ts", t] as [string, string]]),
    ]),
  );
}

const R2A_FAILS: [string, string, string | null][] = [
  [
    "P1 (the bot's case on #2810): a missionaries root through a constant declared after its use",
    'function f(db) { return db.from(T).select("*"); } const T = "missionaries";',
    null,
  ],
  [
    "P2: a name with two values, the second a missionaries root",
    'function a(db) { const T = "profiles"; return db.from(T).select("id"); } function b(db) { return db.from(T).select("*"); } const T = "missionaries";',
    null,
  ],
  [
    "P3: a missionaries root through an imported constant",
    'import { T } from "./t";\nexport const go = (db) => db.from(T).select("*");',
    'export const T = "missionaries";',
  ],
  [
    "P4: a commenter's profile under a post_comments root named by a later constant",
    'function f(db) { return db.from(T).select("id, author:profiles(id, avatar_url)"); } const T = "post_comments";',
    null,
  ],
  [
    "P5: a commenter's whole profile under a post_comments root (the shape of GraphQL addComment)",
    'export const go = (db) => db.from("post_comments").select("*, author:profiles!user_id(*)");',
    null,
  ],
  [
    "P6: a commenter's profile nested in a post_comments embed under another root",
    'export const go = (db) => db.from("tenants").select("id, comments:post_comments(id, author:profiles(display_name))");',
    null,
  ],
  [
    "P7: a cached function selecting an imported select that holds post_author_public_name (the shape of the feed)",
    FEED_IMPORT + CACHED_FEED_READ,
    FEED_SELECT_MODULE,
  ],
  [
    "P8a: the same with use cache: remote",
    FEED_IMPORT +
      CACHED_FEED_READ.replace('"use cache"', '"use cache: remote"'),
    FEED_SELECT_MODULE,
  ],
  [
    "P8b: the same with use cache: private",
    FEED_IMPORT +
      CACHED_FEED_READ.replace('"use cache"', '"use cache: private"'),
    FEED_SELECT_MODULE,
  ],
  [
    "P8c: the same with use cache as the file's first statement",
    '"use cache";\n' +
      FEED_IMPORT +
      'export async function g(db) { return db.from("posts").select(FEED_POST_SELECT); }',
    FEED_SELECT_MODULE,
  ],
  [
    "P9: a cached function calling post_comment_authors",
    'export async function h(db, id) { "use cache"; return db.rpc("post_comment_authors", { p_post_id: id }); }',
    null,
  ],
  [
    "P10: unstable_cache outside Mission Control",
    'export const r = (db) => unstable_cache(async () => db.from("posts").select("id"));',
    null,
  ],
  [
    "P11: P7 as a cached arrow function, single-quoted",
    FEED_IMPORT +
      "export const g = async (db) => { 'use cache'; return db.from(\"posts\").select(FEED_POST_SELECT); };",
    FEED_SELECT_MODULE,
  ],
  [
    "P12: P7 as a cached object method",
    FEED_IMPORT +
      'export const o = { async g(db) { "use cache"; return db.from("posts").select(FEED_POST_SELECT); } };',
    FEED_SELECT_MODULE,
  ],
  [
    "P13: a fetch that sets cache: force-cache",
    'export const r = (url) => fetch(url, { cache: "force-cache" });',
    null,
  ],
  [
    "P14: next/cache's unstable_cache under another local name",
    'import { unstable_cache as memo } from "next/cache";\nexport const m = memo(async () => 1);',
    null,
  ],
  [
    "K1 (P1's control, a guard): a missionaries root through a constant declared before its use",
    'const T = "missionaries"; function f(db) { return db.from(T).select("*"); }',
    null,
  ],
  [
    "P15 (fix round F2): a missionaries root through an imported constant that a local name of the same name shadows elsewhere in the file",
    'import { T } from "./t";\nfunction a(db) { const T = "profiles"; return db.from(T).select("id"); }\nexport function c(db) { return db.from(T).select("*"); }',
    'export const T = "missionaries";',
  ],
  [
    "P16 (F2): a cached select of an imported constant holding post_author_public_name that a local name shadows elsewhere",
    'import { S } from "./t";\nfunction a(db) { const S = "id"; return db.from("posts").select(S); }\nexport async function b(db) { "use cache"; return db.from("posts").select(S); }',
    'export const S = "*, post_author_public_name";',
  ],
  [
    "P17 (F2): every column of a worker row through an imported select constant that a local name shadows elsewhere",
    'import { S } from "./t";\nfunction a(db) { const S = "id"; return db.from("posts").select(S); }\nexport const c = (db) => db.from("missionaries").select(S);',
    'export const S = "*";',
  ],
  [
    "P18 (F3.1): a commenter's profile in a post_comments embed whose hint is interpolated before its parenthesis",
    'export const go = (db, h) => db.from("tenants").select(`id, comments:post_comments!${h}(id, author:profiles(display_name))`);',
    null,
  ],
  [
    "P19 (F3.2): a fetch whose next option sets revalidate by a shorthand property",
    "const revalidate = 60;\nexport const r = (url) => fetch(url, { next: { revalidate } });",
    null,
  ],
  [
    "P20 (F3.2): a fetch whose cache option is a template literal force-cache",
    "export const r = (url) => fetch(url, { cache: `force-cache` });",
    null,
  ],
  [
    "P21 (F3.2): a fetch whose cache option is a variable holding force-cache",
    'const mode = "force-cache";\nexport const r = (url) => fetch(url, { cache: mode });',
    null,
  ],
  [
    "K6 (F3.5, a guard): a fetch whose next option sets revalidate: 60",
    "export const r = (url) => fetch(url, { next: { revalidate: 60 } });",
    null,
  ],
  [
    "P22 (F3.3): a missionaries root through a let assigned after its declaration",
    'let T = "profiles";\nT = "missionaries";\nexport const go = (db) => db.from(T).select("*");',
    null,
  ],
  [
    "P23 (F3.3): a missionaries root through a let declared without a value",
    'let T;\nT = "missionaries";\nexport const go = (db) => db.from(T).select("*");',
    null,
  ],
  [
    "P24 (F3.3): every column of a worker row through a select assigned to a let after its declaration",
    'let S;\nS = "*";\nexport const go = (db) => db.from("missionaries").select(S);',
    null,
  ],
  [
    "P25 (F3.4): a cached function whose use cache directive follows use strict",
    FEED_IMPORT +
      'export async function g(db) { "use strict"; "use cache"; return db.from("posts").select(FEED_POST_SELECT); }',
    FEED_SELECT_MODULE,
  ],
  [
    "P27 (second round B2): a cached function returning a same-file helper's read of post_author_public_name",
    'function loadFeed(db) { return db.from("posts").select("id, post_author_public_name"); }\nexport async function g(db) { "use cache"; return loadFeed(db); }',
    null,
  ],
  [
    "P28 (B2): a cached function returning an imported helper's read",
    'import { loadFeed } from "./t";\nexport async function g(db) { "use cache"; return loadFeed(db); }',
    'export function loadFeed(db) { return db.from("posts").select("id, post_author_public_name"); }',
  ],
  [
    "P29 (B2): a cached function reaching the read two helpers deep",
    'function inner(db) { return db.from("posts").select("id, post_author_public_name"); }\nfunction outer(db) { return inner(db); }\nexport async function g(db) { "use cache"; return outer(db); }',
    null,
  ],
  [
    "P30 (B2): a cached function calling an arrow helper that reads post_comment_authors",
    'const loadAuthors = (db, id) => db.rpc("post_comment_authors", { p_post_id: id });\nexport async function g(db, id) { "use cache"; return loadAuthors(db, id); }',
    null,
  ],
  [
    "P31 (B3): a fetch whose options are a local constant holding cache: force-cache",
    'const opts = { cache: "force-cache" };\nexport const r = (url) => fetch(url, opts);',
    null,
  ],
  [
    "K15 (B4, a guard): a fetch whose next option sets revalidate: false (cached indefinitely)",
    "export const r = (url) => fetch(url, { next: { revalidate: false } });",
    null,
  ],
  [
    "K16 (B4, a guard): a fetch whose revalidate is a value the scanner cannot read as a literal",
    "const seconds = 60;\nexport const r = (url) => fetch(url, { next: { revalidate: seconds } });",
    null,
  ],
  [
    "P32 (C3): a worker embed whose hint is interpolated with no ! before its parenthesis",
    'export const go = (db, h) => db.from("donations").select(`id, missionary:missionaries${h}(*, profile:profiles(display_name))`);',
    null,
  ],
  [
    "P26 (F3.4): a file whose use cache directive follows use strict",
    '"use strict";\n"use cache";\n' +
      FEED_IMPORT +
      'export async function g(db) { return db.from("posts").select(FEED_POST_SELECT); }',
    FEED_SELECT_MODULE,
  ],
];

const R2A_PASSES: [string, string, string | null][] = [
  [
    "K2 (a red control): a donor's profile under a donors root named by a later constant",
    'function f(db) { return db.from(T).select("id, profile:profiles(id, display_name)"); } const T = "donors";',
    null,
  ],
  [
    "K3 (guard): a post_comments read of its own columns",
    'export const go = (db) => db.from("post_comments").select("id, content");',
    null,
  ],
  [
    "K4 (guard): a cached function selecting no worker name",
    'export async function g(db) { "use cache"; return db.from("posts").select("id, title"); }',
    null,
  ],
  [
    "K5 (F2, guard): a local name that shadows nothing, a profiles root's own columns",
    'function a(db) { const T = "profiles"; return db.from(T).select("id, display_name"); }',
    null,
  ],
  [
    "K7 (F3.2, guard): a fetch whose cache option is no-store, literally and through a variable",
    'const mode = "no-store";\nexport const r = (url) => fetch(url, { cache: mode });\nexport const q = (url) => fetch(url, { cache: "no-store" });',
    null,
  ],
  [
    "K8 (F3.3, guard): a let assigned a second table that is no worker read",
    'let T = "profiles";\nT = "donors";\nexport const go = (db) => db.from(T).select("id, profile:profiles(id, display_name)");',
    null,
  ],
  [
    "K10 (B2, guard): a helper reading post_author_public_name called only from uncached code",
    'function loadFeed(db) { return db.from("posts").select("id, post_author_public_name"); }\nexport async function g(db) { return loadFeed(db); }',
    null,
  ],
  [
    "K11 (B2, guard): a cached function calling a helper that reads no worker name",
    'function loadIds(db) { return db.from("posts").select("id, title"); }\nexport async function g(db) { "use cache"; return loadIds(db); }',
    null,
  ],
  [
    "K12 (B2, guard): a cached function calling two helpers that call each other and read nothing",
    'function a(db) { return b(db); }\nfunction b(db) { return a(db); }\nexport async function g(db) { "use cache"; return a(db); }',
    null,
  ],
  [
    "K13 (B3, guard): a fetch whose options are a local constant holding cache: no-store",
    'const opts = { cache: "no-store" };\nexport const r = (url) => fetch(url, opts);',
    null,
  ],
  [
    "K14 (B4, a red control): a fetch whose next option sets revalidate: 0, which Next.js does not cache",
    "export const r = (url) => fetch(url, { next: { revalidate: 0 } });",
    null,
  ],
  [
    "K9 (F3.4, guard): use strict alone, and a use cache string that is not a directive",
    FEED_IMPORT +
      'export async function g(db) { "use strict"; return db.from("posts").select(FEED_POST_SELECT); }\nexport async function h(db) { const x = 1; "use cache"; return db.from("posts").select(FEED_POST_SELECT); }',
    FEED_SELECT_MODULE,
  ],
];

describe("AL-2678 r2a: roots from every string variable and import, commenters only from post_comment_authors, and no worker name in a server cache (gates f, b; ADR 0008)", () => {
  it.each(R2A_FAILS)("a planted %s fails", (_label, code, t) => {
    expect(planted(code, t)).not.toEqual([]);
  });

  it.each(R2A_PASSES)("a planted %s passes", (_label, code, t) => {
    expect(planted(code, t)).toEqual([]);
  });
});

describe("AL-2678 r1: outside Mission Control a worker is named only by worker_public_name or post_author_public_name (#2805 obligation 2, ADR 0005 scope)", () => {
  it.each(FAILS)("a planted %s fails", (_label, code) => {
    expect(scanText("apps/donor/planted.ts", code)).not.toEqual([]);
  });

  it.each(PASSES)("a planted %s passes", (_label, code) => {
    expect(scanText("apps/donor/planted.ts", code)).toEqual([]);
  });

  it("the same reads inside Mission Control are out of scope", () => {
    expect(sourceFiles().some((f) => f.startsWith("apps/admin/"))).toBe(false);
    expect(
      sourceFiles().some((f) => f.startsWith("packages/api/src/admin/")),
    ).toBe(false);
  });

  it("no source outside Mission Control reads parties or a worker's profile name, except the shrink-only allowlist", () => {
    const allowed = new Set(ALLOWLIST.map((a) => a.file));
    expect(repoViolations().filter((v) => !allowed.has(v.file))).toEqual([]);
  });

  it("every allowlist entry still has a violation, so a stale entry fails", () => {
    const hit = new Set(repoViolations().map((v) => v.file));
    expect(ALLOWLIST.filter((a) => !hit.has(a.file))).toEqual([]);
  });

  it("the scan reaches the readers this contract moved", () => {
    const scanned = new Set(sourceFiles());
    for (const file of [
      "packages/api/src/donor-portal/service.ts",
      "packages/api/src/posts/index.ts",
      "packages/api/src/donations/select.ts",
      "packages/graphql/handler.ts",
      "packages/database/hooks/donor-feed-posts.ts",
    ])
      expect(scanned.has(file), file).toBe(true);
  });
});
