/**
 * AL-2676 (WP3a part 1a), round M (M1) & round N (F1): an app embeds between
 * the five money tables and `funds`/`missionaries` — in either direction — only
 * in a form that resolves on both sides of 20261120130004.
 *
 * That migration replaces each money table's single-column keys to funds and
 * missionaries with composite (tenant_id, target) keys. A column hint
 * (`missionaries!missionary_id`), a column-named embed (`fund:fund_id(...)` or
 * `missionary_id(...)`), or a reverse key hint (`donations!donations_fund_id_fkey(...)`)
 * resolves only on the single-column key, so a release built with one fails its
 * reads from the migration's commit until its replacement is promoted; a
 * key-name hint or constraint-named embed resolves only on one schema. Without
 * a hint and using the target table name, PostgREST resolves the embed in
 * either direction on both schemas, because each schema has exactly one
 * relationship per pair. That is what keeps the release already running whole
 * (plan 7.4).
 *
 * The static half scans source under apps/ and packages/ (tracked files and
 * untracked ones that are not ignored; tests excluded) for embeds of funds,
 * missionaries, their FK columns, the five money tables, or their FK constraint
 * names, and binds each match to the actual `.from("…")` root the select
 * belongs to via the TypeScript AST (including local and imported select
 * constants). SITES is closed: every match is listed with its actual root and
 * direction, and any new match or root change fails. `!inner` and `!left`
 * choose the join, not the relationship, and are allowed. Column-named and
 * constraint-named embeds are refused outright on guarded roots. The
 * real-catalog half runs in the migrate job (TENANT_GUARD_IT_ADMIN_DATABASE_URL)
 * and resolves every guarded site's literal table name as PostgREST does, plus
 * verifies all ten money↔target pairs have one relationship and zero
 * single-column keys on fund_id/missionary_id.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import ts from "typescript";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

const MONEY_TABLES = [
  "donations",
  "donor_pledges",
  "staged_gifts",
  "staged_gift_allocations",
  "donation_saga_outbox",
] as const;
type MoneyTable = (typeof MONEY_TABLES)[number];

const TARGET_TABLES = ["funds", "missionaries"] as const;
type TargetTable = (typeof TARGET_TABLES)[number];

const FK_COLUMNS = ["fund_id", "missionary_id"] as const;

const MONEY_SET = new Set<string>(MONEY_TABLES);
const TARGET_SET = new Set<string>(TARGET_TABLES);
const FK_COL_SET = new Set<string>(FK_COLUMNS);

const MONEY_PREFIX_RE = MONEY_TABLES.join("|");
const FK_CONSTRAINT_RE = new RegExp(
  `^(?:${MONEY_PREFIX_RE})_[A-Za-z0-9_]*(?:fkey|fk)$`,
);

/**
 * Any PostgREST embed naming funds/missionaries, their FK columns, any of the
 * five money tables, or a money-table FK constraint name.
 */
const EMBED = new RegExp(
  `(?<![A-Za-z0-9_.!$])(?:[A-Za-z_][A-Za-z0-9_]*\\s*:\\s*)?(funds|missionaries|fund_id|missionary_id|${MONEY_PREFIX_RE}|(?:${MONEY_PREFIX_RE})_[A-Za-z0-9_]*(?:fkey|fk))((?:![A-Za-z0-9_]+)*)\\s*\\(`,
  "g",
);

/** Join modifiers, which do not pick a relationship. */
const JOIN_MODIFIERS = new Set(["inner", "left"]);

const DYNAMIC_ROOT = "<dynamic>";
const RESOLVE_EXTS = ["", ".ts", ".tsx", ".mts", ".mjs", ".js", "/index.ts"];

type Direction = "money->target" | "target->money" | null;

type FoundEmbed = {
  file: string;
  /**
   * Actual `.from("…")` root table the select belongs to, `null` when not part
   * of a `.from(…).select(…)` (e.g. a comment or GraphQL SDL), or `"<dynamic>"`
   * when `.from(expr)` uses a non-literal table expression.
   */
  root: string | null;
  embed: string;
};

type Site = FoundEmbed & {
  direction: Direction;
  note: string;
};

const SITES: Site[] = [
  {
    file: "apps/admin/app/(app)/crm/records-grid.tsx",
    root: null,
    direction: null,
    embed: "donations(",
    note: "JSDoc prose (`from donations (including ones with no…`), not a select",
  },
  {
    file: "packages/api/src/donations/select.ts",
    root: "donations",
    direction: "money->target",
    embed: "missionary:missionaries(",
    note: "DONATION_WITH_PARTIES_SELECT (REST and GraphQL donation reads)",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    root: "donations",
    direction: "money->target",
    embed: "fund:funds(",
    note: "DONATION_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    root: "donations",
    direction: "money->target",
    embed: "missionary:missionaries(",
    note: "DONATION_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    root: "donor_pledges",
    direction: "money->target",
    embed: "fund:funds(",
    note: "PLEDGE_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    root: "donor_pledges",
    direction: "money->target",
    embed: "missionary:missionaries(",
    note: "PLEDGE_SELECT",
  },
  {
    file: "packages/api/src/missionary-portal/donors.ts",
    root: "donor_pledges",
    direction: "money->target",
    embed: "missionary:missionaries!inner(",
    note: "a partner's pledges, scoped through the missionary's profile",
  },
  {
    file: "packages/database/hooks/missionary-donors-model.ts",
    root: null,
    direction: null,
    embed: "missionaries(",
    note: "a comment naming the key `missionaries(id)`, not a select",
  },
  {
    file: "packages/graphql/handler.ts",
    root: null,
    direction: null,
    embed: "missionaries(",
    note: "the GraphQL schema's `missionaries(limit, offset)` field, not a select",
  },
  ...[1, 2, 3, 4].map((): Site => ({
    file: "packages/graphql/handler.ts",
    root: "posts",
    direction: null,
    embed: "missionary:missionaries!missionary_id(",
    note: "reads from posts, whose key to missionaries 20261120130004 does not change",
  })),
];

function resourceNameOf(embed: string): string {
  const withoutParen = embed.replace(/\($/, "");
  const withoutAlias = withoutParen.includes(":")
    ? withoutParen.slice(withoutParen.indexOf(":") + 1)
    : withoutParen;
  const bang = withoutAlias.indexOf("!");
  return bang >= 0 ? withoutAlias.slice(0, bang) : withoutAlias;
}

function hintsOf(embed: string): string[] {
  return embed
    .replace(/\($/, "")
    .split("!")
    .slice(1)
    .filter((part) => !JOIN_MODIFIERS.has(part));
}

function directionOf(root: string | null, resource: string): Direction {
  if (root === null || root === DYNAMIC_ROOT) return null;
  if (
    MONEY_SET.has(root) &&
    (TARGET_SET.has(resource) ||
      FK_COL_SET.has(resource) ||
      FK_CONSTRAINT_RE.test(resource))
  ) {
    return "money->target";
  }
  if (
    TARGET_SET.has(root) &&
    (MONEY_SET.has(resource) || FK_CONSTRAINT_RE.test(resource))
  ) {
    return "target->money";
  }
  return null;
}

function embedViolations(matches: FoundEmbed[]): string[] {
  const violations: string[] = [];
  for (const match of matches) {
    if (match.root === DYNAMIC_ROOT) {
      violations.push(`${match.file}: dynamic .from() root for ${match.embed}`);
      continue;
    }
    const resource = resourceNameOf(match.embed);
    const direction = directionOf(match.root, resource);
    if (direction === null) continue;
    if (direction === "money->target" && !TARGET_SET.has(resource)) {
      violations.push(
        `${match.file} (${match.root}): column/constraint-named embed ${match.embed} is refused; use the target table name without a hint`,
      );
      continue;
    }
    if (direction === "target->money" && !MONEY_SET.has(resource)) {
      violations.push(
        `${match.file} (${match.root}): constraint-named embed ${match.embed} is refused; use the money table name without a hint`,
      );
      continue;
    }
    const hints = hintsOf(match.embed);
    if (hints.length > 0) {
      violations.push(
        `${match.file} (${match.root}): ${match.embed} carries forbidden hint(s): ${hints.join(", ")}`,
      );
    }
  }
  return violations;
}

function unwrapExpr(expr: ts.Expression): ts.Expression {
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

function resolveTableArg(
  arg: ts.Expression,
  stringConsts: Map<string, string>,
): string {
  const expr = unwrapExpr(arg);
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    return expr.text;
  }
  if (ts.isIdentifier(expr)) {
    return stringConsts.get(expr.text) ?? DYNAMIC_ROOT;
  }
  return DYNAMIC_ROOT;
}

function findFromRootInChain(
  receiver: ts.Expression,
  stringConsts: Map<string, string>,
  varFromRoots: Map<string, string>,
): string | null {
  let cur: ts.Expression = unwrapExpr(receiver);
  while (ts.isCallExpression(cur)) {
    const callee = unwrapExpr(cur.expression);
    if (!ts.isPropertyAccessExpression(callee)) return null;
    if (callee.name.text === "from" && cur.arguments.length >= 1) {
      return resolveTableArg(cur.arguments[0]!, stringConsts);
    }
    cur = unwrapExpr(callee.expression);
  }
  if (ts.isIdentifier(cur)) {
    return varFromRoots.get(cur.text) ?? null;
  }
  return null;
}

function collectIdentifiers(node: ts.Node, out: Set<string>): void {
  if (ts.isIdentifier(node)) {
    out.add(node.text);
    return;
  }
  if (ts.isPropertyAccessExpression(node)) {
    collectIdentifiers(node.expression, out);
    return;
  }
  ts.forEachChild(node, (child) => collectIdentifiers(child, out));
}

function resolveModuleFile(
  fromFile: string,
  specifier: string,
  sources: Map<string, string>,
): string | null {
  const candidates: string[] = [];
  if (specifier.startsWith(".")) {
    const base = path.posix.normalize(
      path.posix.join(path.posix.dirname(fromFile), specifier),
    );
    candidates.push(base);
  } else if (specifier.startsWith("@asym/")) {
    const rest = specifier.slice("@asym/".length);
    const slash = rest.indexOf("/");
    if (slash > 0) {
      const pkg = rest.slice(0, slash);
      const sub = rest.slice(slash + 1);
      candidates.push(`packages/${pkg}/src/${sub}`, `packages/${pkg}/${sub}`);
    } else {
      candidates.push(`packages/${rest}/src/index`, `packages/${rest}/index`);
    }
  }
  for (const base of candidates) {
    for (const ext of RESOLVE_EXTS) {
      const full = base + ext;
      if (sources.has(full)) return full;
    }
  }
  return null;
}

type FileIndex = {
  stringSpans: [number, number][];
  inlineSelectSpans: { start: number; end: number; root: string }[];
  varDecls: Map<
    string,
    { spans: [number, number][]; referencedIds: Set<string> }
  >;
  imports: Map<string, { specifier: string; importedName: string }>;
  selectRefs: { name: string; root: string }[];
};

function indexFile(file: string, text: string): FileIndex {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const stringSpans: [number, number][] = [];
  const inlineSelectSpans: { start: number; end: number; root: string }[] = [];
  const varDecls = new Map<
    string,
    { spans: [number, number][]; referencedIds: Set<string> }
  >();
  const imports = new Map<
    string,
    { specifier: string; importedName: string }
  >();
  const selectRefs: { name: string; root: string }[] = [];
  const stringConsts = new Map<string, string>();
  const varFromRoots = new Map<string, string>();

  // Pass 1: string constants, imports, and variable-bound `.from(...)` builders.
  function pass1(node: ts.Node): void {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      stringSpans.push([node.getStart(sf), node.getEnd()]);
    }
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const el of bindings.elements) {
          imports.set(el.name.text, {
            specifier,
            importedName: el.propertyName?.text ?? el.name.text,
          });
        }
      }
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      const name = node.name.text;
      const init = unwrapExpr(node.initializer);
      if (
        ts.isStringLiteral(init) ||
        ts.isNoSubstitutionTemplateLiteral(init)
      ) {
        stringConsts.set(name, init.text);
      }
      const entry = varDecls.get(name) ?? {
        spans: [],
        referencedIds: new Set<string>(),
      };
      entry.spans.push([
        node.initializer.getStart(sf),
        node.initializer.getEnd(),
      ]);
      collectIdentifiers(node.initializer, entry.referencedIds);
      varDecls.set(name, entry);

      const fromRoot = findFromRootInChain(
        node.initializer,
        stringConsts,
        varFromRoots,
      );
      if (fromRoot !== null) {
        varFromRoots.set(name, fromRoot);
      }
    }
    ts.forEachChild(node, pass1);
  }
  pass1(sf);

  // Pass 2: `.from(...)...select(arg0)` calls.
  function pass2(node: ts.Node): void {
    if (ts.isCallExpression(node) && node.arguments.length >= 1) {
      const callee = unwrapExpr(node.expression);
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.name.text === "select"
      ) {
        const root = findFromRootInChain(
          callee.expression,
          stringConsts,
          varFromRoots,
        );
        if (root !== null) {
          const arg0 = node.arguments[0]!;
          inlineSelectSpans.push({
            start: arg0.getStart(sf),
            end: arg0.getEnd(),
            root,
          });
          const ids = new Set<string>();
          collectIdentifiers(arg0, ids);
          for (const id of ids) {
            selectRefs.push({ name: id, root });
          }
        }
      }
    }
    ts.forEachChild(node, pass2);
  }
  pass2(sf);

  return { stringSpans, inlineSelectSpans, varDecls, imports, selectRefs };
}

function scanSources(sources: Map<string, string>): FoundEmbed[] {
  const files = [...sources.keys()].sort();
  const indices = new Map<string, FileIndex>();
  for (const file of files) {
    indices.set(file, indexFile(file, sources.get(file)!));
  }

  // Bind variable declarations to every `.from(...)` root that selects them
  // (directly, via imports, or via transitive string-const composition).
  const varRoots = new Map<string, Set<string>>();
  const addVarRoot = (file: string, name: string, root: string): boolean => {
    const key = `${file}\0${name}`;
    let set = varRoots.get(key);
    if (!set) {
      set = new Set<string>();
      varRoots.set(key, set);
    }
    if (set.has(root)) return false;
    set.add(root);
    return true;
  };

  const resolveAndBind = (
    callerFile: string,
    name: string,
    root: string,
  ): boolean => {
    const idx = indices.get(callerFile);
    if (!idx) return false;
    if (idx.varDecls.has(name)) {
      return addVarRoot(callerFile, name, root);
    }
    const imp = idx.imports.get(name);
    if (imp) {
      const targetFile = resolveModuleFile(callerFile, imp.specifier, sources);
      if (
        targetFile &&
        indices.get(targetFile)?.varDecls.has(imp.importedName)
      ) {
        return addVarRoot(targetFile, imp.importedName, root);
      }
    }
    return false;
  };

  for (const file of files) {
    for (const ref of indices.get(file)!.selectRefs) {
      resolveAndBind(file, ref.name, ref.root);
    }
  }

  // Transitive propagation through helper string constants (`const B = `${A}, id``).
  let changed = true;
  while (changed) {
    changed = false;
    for (const [key, roots] of [...varRoots.entries()]) {
      const sep = key.indexOf("\0");
      const file = key.slice(0, sep);
      const name = key.slice(sep + 1);
      const decl = indices.get(file)?.varDecls.get(name);
      if (!decl) continue;
      for (const refId of decl.referencedIds) {
        if (refId === name) continue;
        for (const root of roots) {
          if (resolveAndBind(file, refId, root)) changed = true;
        }
      }
    }
  }

  const found: FoundEmbed[] = [];
  for (const file of files) {
    const text = sources.get(file)!;
    const idx = indices.get(file)!;
    for (const match of text.matchAll(EMBED)) {
      const pos = match.index;
      const embed = match[0].replace(/\s+/g, "");
      const inString = idx.stringSpans.some(([s, e]) => pos >= s && pos < e);
      if (!inString) {
        found.push({ file, root: null, embed });
        continue;
      }

      // Prefer the narrowest enclosing inline `.from(...)...select(arg0)` span.
      const inlineHits = idx.inlineSelectSpans
        .filter((s) => pos >= s.start && pos < s.end)
        .sort((a, b) => a.end - a.start - (b.end - b.start));
      if (inlineHits.length > 0) {
        found.push({ file, root: inlineHits[0]!.root, embed });
        continue;
      }

      // Otherwise check variable declarations bound to `.from(...)` selects.
      const boundRoots = new Set<string>();
      for (const [name, decl] of idx.varDecls.entries()) {
        if (decl.spans.some(([s, e]) => pos >= s && pos < e)) {
          for (const root of varRoots.get(`${file}\0${name}`) ?? []) {
            boundRoots.add(root);
          }
        }
      }
      if (boundRoots.size > 0) {
        for (const root of [...boundRoots].sort()) {
          found.push({ file, root, embed });
        }
      } else {
        found.push({ file, root: null, embed });
      }
    }
  }
  return found;
}

function scanText(file: string, text: string): FoundEmbed[] {
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
    .filter((file) => !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file));
}

function foundEmbeds(): FoundEmbed[] {
  const sources = new Map<string, string>();
  for (const file of [...new Set(sourceFiles())].sort()) {
    try {
      sources.set(file, readFileSync(file, "utf8"));
    } catch {
      // Listed by Git but deleted in the working tree.
    }
  }
  return scanSources(sources);
}

const guardedSites = SITES.filter(
  (
    site,
  ): site is Site & {
    root: MoneyTable | TargetTable;
    direction: Exclude<Direction, null>;
  } => site.direction !== null,
);

describe("money-table embeds of funds and missionaries in both directions (round M M1, round N F1)", () => {
  it("every embed involving funds, missionaries, money tables, or their keys in apps/ and packages/ is a listed site bound to its actual .from() root", () => {
    expect(foundEmbeds()).toEqual(
      SITES.map(({ file, root, embed }) => ({ file, root, embed })),
    );
  });

  it("each site's declared direction agrees with its root and embedded resource", () => {
    for (const site of SITES) {
      expect(
        directionOf(site.root, resourceNameOf(site.embed)),
        `${site.file}: ${site.note}`,
      ).toBe(site.direction);
    }
    expect(guardedSites.length).toBeGreaterThan(0);
  });

  it("no guarded site carries a column/constraint name or a column/key-name hint", () => {
    expect(embedViolations(SITES)).toEqual([]);
    expect(embedViolations(foundEmbeds())).toEqual([]);
  });
});

describe("negative scanner cases (round N, F1)", () => {
  it("catches a reverse key-hint embed from funds to donations", () => {
    const matches = scanText(
      "fixture.ts",
      `client.from("funds").select("id, donations!donations_fund_id_fkey(id)");`,
    );
    expect(matches).toEqual([
      {
        file: "fixture.ts",
        root: "funds",
        embed: "donations!donations_fund_id_fkey(",
      },
    ]);
    expect(embedViolations(matches)).toHaveLength(1);
  });

  it("catches a reverse column-hint embed from missionaries to donor_pledges", () => {
    const matches = scanText(
      "fixture.ts",
      `client.from("missionaries").select("id, donor_pledges!missionary_id(id)");`,
    );
    expect(matches).toEqual([
      {
        file: "fixture.ts",
        root: "missionaries",
        embed: "donor_pledges!missionary_id(",
      },
    ]);
    expect(embedViolations(matches)).toHaveLength(1);
  });

  it("inventories an unhinted reverse embed cleanly with no violation", () => {
    const matches = scanText(
      "fixture.ts",
      `client.from("funds").select("id, donations!inner(id)");`,
    );
    expect(matches).toEqual([
      {
        file: "fixture.ts",
        root: "funds",
        embed: "donations!inner(",
      },
    ]);
    expect(embedViolations(matches)).toEqual([]);
  });

  it("refuses column-named embeds on a money-table root outright", () => {
    const matches = scanText(
      "fixture.ts",
      `client.from("donations").select("id, fund:fund_id(id), missionary_id(id)");`,
    );
    expect(matches).toEqual([
      { file: "fixture.ts", root: "donations", embed: "fund:fund_id(" },
      { file: "fixture.ts", root: "donations", embed: "missionary_id(" },
    ]);
    expect(embedViolations(matches)).toHaveLength(2);
  });

  it("refuses constraint-named embeds on money and target roots outright", () => {
    const matches = scanText(
      "fixture.ts",
      `
      client.from("donations").select("id, missionary:donations_missionary_id_fkey(id)");
      client.from("funds").select("id, gifts:donations_fund_same_tenant_fk(id)");
      `,
    );
    expect(matches).toEqual([
      {
        file: "fixture.ts",
        root: "donations",
        embed: "missionary:donations_missionary_id_fkey(",
      },
      {
        file: "fixture.ts",
        root: "funds",
        embed: "gifts:donations_fund_same_tenant_fk(",
      },
    ]);
    expect(embedViolations(matches)).toHaveLength(2);
  });

  it("binds each select in one file to its own .from() root so a guarded select cannot ride on an unguarded one", () => {
    const matches = scanText(
      "fixture.ts",
      `
      client.from("posts").select("id, missionary:missionaries!missionary_id(id)");
      client.from("donations").select("id, missionary:missionaries!missionary_id(id)");
      `,
    );
    expect(matches).toEqual([
      {
        file: "fixture.ts",
        root: "posts",
        embed: "missionary:missionaries!missionary_id(",
      },
      {
        file: "fixture.ts",
        root: "donations",
        embed: "missionary:missionaries!missionary_id(",
      },
    ]);
    expect(embedViolations(matches)).toHaveLength(1);
  });

  it("binds a shared select constant to every .from() root that uses it and refuses dynamic roots", () => {
    const shared = scanText(
      "fixture.ts",
      `
      const SHARED = "id, fund:funds(id)";
      client.from("donations").select(SHARED);
      client.from("donor_pledges").select(SHARED);
      `,
    );
    expect(shared).toEqual([
      { file: "fixture.ts", root: "donations", embed: "fund:funds(" },
      { file: "fixture.ts", root: "donor_pledges", embed: "fund:funds(" },
    ]);

    const dynamic = scanText(
      "fixture.ts",
      `
      function read(table: string) {
        return client.from(table).select("id, fund:funds(id)");
      }
      `,
    );
    expect(dynamic).toEqual([
      { file: "fixture.ts", root: DYNAMIC_ROOT, embed: "fund:funds(" },
    ]);
    expect(embedViolations(dynamic)).toHaveLength(1);
  });
});

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "money-table embeds resolve on the migrated catalog as PostgREST does (round M M1, round N F1)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const sitePairs = [
      ...new Map(
        guardedSites.map((site) => {
          const target = resourceNameOf(site.embed);
          return [`${site.root}>${target}`, [site.root, target] as const];
        }),
      ).values(),
    ];

    it.each(sitePairs)(
      "site %s -> %s resolves literal table name to exactly one relationship",
      async (root, target) => {
        const { rows } = await db.query(
          `with pk as (select conrelid, conkey from pg_constraint where contype = 'p'),
                fk as (select conrelid, confrelid, conkey from pg_constraint where contype = 'f')
           select
             exists (
               select 1 from pg_class c
               join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relname = $2 and c.relkind in ('r', 'p')
             ) as target_is_table,
             (select count(*)::int from pg_constraint
               where contype = 'f'
                 and ((conrelid = $1::regclass and confrelid = ('public.' || $2)::regclass)
                   or (conrelid = ('public.' || $2)::regclass and confrelid = $1::regclass))) as direct,
             (select count(distinct a.conrelid)::int from fk a
               join fk b on b.conrelid = a.conrelid
               join pk on pk.conrelid = a.conrelid
              where a.confrelid = $1::regclass and b.confrelid = ('public.' || $2)::regclass
                and a.conrelid not in ($1::regclass, ('public.' || $2)::regclass)
                and a.conkey <@ pk.conkey and b.conkey <@ pk.conkey) as junctions`,
          [`public.${root}`, target],
        );
        expect(rows[0]).toEqual({
          target_is_table: true,
          direct: 1,
          junctions: 0,
        });
      },
    );

    const allPairs = MONEY_TABLES.flatMap((money) =>
      TARGET_TABLES.map((target) => [money, target] as const),
    );

    it.each(allPairs)(
      "pair %s <-> %s has one composite relationship in both directions and zero single-column FKs",
      async (money, target) => {
        const { rows } = await db.query(
          `with pk as (select conrelid, conkey from pg_constraint where contype = 'p'),
                fk as (select conrelid, confrelid, conkey from pg_constraint where contype = 'f')
           select
             (select count(*)::int from pg_constraint
               where contype = 'f'
                 and ((conrelid = $1::regclass and confrelid = $2::regclass)
                   or (conrelid = $2::regclass and confrelid = $1::regclass))) as direct,
             (select count(*)::int from pg_constraint
               where contype = 'f'
                 and conrelid = $1::regclass and confrelid = $2::regclass
                 and array_length(conkey, 1) = 1) as single_col_fks,
             (select count(distinct a.conrelid)::int from fk a
               join fk b on b.conrelid = a.conrelid
               join pk on pk.conrelid = a.conrelid
              where a.confrelid = $1::regclass and b.confrelid = $2::regclass
                and a.conrelid not in ($1::regclass, $2::regclass)
                and a.conkey <@ pk.conkey and b.conkey <@ pk.conkey) as junctions`,
          [`public.${money}`, `public.${target}`],
        );
        expect(rows[0]).toEqual({
          direct: 1,
          single_col_fks: 0,
          junctions: 0,
        });
      },
    );
  },
);
