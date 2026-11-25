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

type FileFacts = {
  literals: Literal[];
  fromRoots: { start: number; end: number; root: string }[];
  varSpans: Map<string, [number, number][]>;
  selectIds: { name: string; root: string }[];
  imports: Map<string, { specifier: string; importedName: string }>;
  partiesFrom: string[];
  authorNames: string[];
};

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

function factsOf(file: string, text: string): FileFacts {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const facts: FileFacts = {
    literals: [],
    fromRoots: [],
    varSpans: new Map(),
    selectIds: [],
    imports: new Map(),
    partiesFrom: [],
    authorNames: [],
  };
  const consts = new Map<string, string>();
  const tableOf = (arg: ts.Expression | undefined) => {
    if (!arg) return null;
    const e = unwrap(arg);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))
      return e.text;
    if (ts.isIdentifier(e)) return consts.get(e.text) ?? null;
    return null;
  };
  const rootOf = (receiver: ts.Expression): string | null => {
    let cur = unwrap(receiver);
    while (ts.isCallExpression(cur)) {
      const callee = unwrap(cur.expression);
      if (!ts.isPropertyAccessExpression(callee)) return null;
      if (callee.name.text === "from") return tableOf(cur.arguments[0]);
      cur = unwrap(callee.expression);
    }
    return null;
  };
  const collectIds = (node: ts.Node, out: Set<string>) => {
    if (ts.isIdentifier(node)) out.add(node.text);
    else if (ts.isPropertyAccessExpression(node))
      collectIds(node.expression, out);
    else ts.forEachChild(node, (c) => collectIds(c, out));
  };
  const visit = (node: ts.Node) => {
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
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const el of bindings.elements)
          facts.imports.set(el.name.text, {
            specifier: node.moduleSpecifier.text,
            importedName: el.propertyName?.text ?? el.name.text,
          });
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const init = unwrap(node.initializer);
      if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init))
        consts.set(node.name.text, init.text);
      const spans = facts.varSpans.get(node.name.text) ?? [];
      spans.push([node.initializer.getStart(sf), node.initializer.getEnd()]);
      facts.varSpans.set(node.name.text, spans);
    }
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      if (ts.isPropertyAccessExpression(callee)) {
        if (
          callee.name.text === "from" &&
          tableOf(node.arguments[0]) === "parties"
        )
          facts.partiesFrom.push(node.getText(sf));
        if (callee.name.text === "select" && node.arguments[0]) {
          const root = rootOf(callee.expression);
          if (root !== null) {
            const arg = node.arguments[0];
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
  /(?<![A-Za-z0-9_])(?:missionaries|profiles|posts)(?:\s*!\s*\w+)*\s*!\s*$/;

const EMBED_RE =
  /(?<![A-Za-z0-9_])(?:\.\.\.\s*)?(?:[A-Za-z_]\w*\s*:\s*)?(missionaries|profiles|donors|parties|posts)((?:\s*!\s*\w+)*)\s*\(/g;

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
  const facts = new Map<string, FileFacts>();
  for (const [file, text] of sources) facts.set(file, factsOf(file, text));
  const varRoots = new Map<string, Set<string>>();
  const bind = (file: string, name: string, root: string) => {
    const f = facts.get(file)!;
    let target: [string, string] | null = null;
    if (f.varSpans.has(name)) target = [file, name];
    else {
      const imp = f.imports.get(name);
      const resolved = imp && resolveModule(file, imp.specifier, files);
      if (resolved && facts.get(resolved)!.varSpans.has(imp!.importedName))
        target = [resolved, imp!.importedName];
    }
    if (!target) return;
    const key = `${target[0]}\0${target[1]}`;
    const set = varRoots.get(key) ?? new Set<string>();
    set.add(root);
    varRoots.set(key, set);
  };
  for (const [file, f] of facts)
    for (const ref of f.selectIds) bind(file, ref.name, ref.root);

  const violations: Violation[] = [];
  for (const [file, f] of facts) {
    const push = (rule: string, text: string) =>
      violations.push({ file, rule, text });
    for (const call of f.partiesFrom) push("a parties read", call);
    for (const access of f.authorNames)
      push("a post author's profile name", access);
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
        if (e.resource === "donors" || e.resource === "posts") continue;
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
