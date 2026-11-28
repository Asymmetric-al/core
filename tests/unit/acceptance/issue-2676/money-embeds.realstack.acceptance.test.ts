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
const SEVEN_TABLES = new Set<string>([...MONEY_TABLES, ...TARGET_TABLES]);
const FK_COL_SET = new Set<string>(FK_COLUMNS);

const MONEY_PREFIX_RE = MONEY_TABLES.join("|");
const FK_CONSTRAINT_RE = new RegExp(
  `^(?:${MONEY_PREFIX_RE})_[A-Za-z0-9_]*(?:fkey|fk)$`,
);

const EMBED = new RegExp(
  `(?<![A-Za-z0-9_!$]|(?<!\\.\\.)\\.)(?:\\.\\.\\.\\s*)?(?:[A-Za-z_][A-Za-z0-9_]*\\s*:\\s*)?(funds|missionaries|fund_id|missionary_id|${MONEY_PREFIX_RE}|(?:${MONEY_PREFIX_RE})_[A-Za-z0-9_]*(?:fkey|fk))((?:\\s*!\\s*[A-Za-z0-9_]+)*)\\s*\\(`,
  "g",
);

const JOIN_MODIFIERS = new Set(["inner", "left"]);

const DYNAMIC_ROOT = "<dynamic>";
const RESOLVE_EXTS = ["", ".ts", ".tsx", ".mts", ".mjs", ".js", "/index.ts"];

const VIOLATION_REMEDY =
  "embed funds or missionaries by table name with no hint; a column or key-name hint resolves on one side of 20261120130004 only";
const INVENTORY_REMEDY =
  "list it with its root (and ensure it is hint-free and table-named)";
const DYNAMIC_REMEDY = "use a literal table name";

type Direction = "money->target" | "target->money";

type FoundEmbed = {
  file: string;
  root: string | null;
  embed: string;
};

type InventorySite = {
  file: string;
  root: MoneyTable | TargetTable;
  direction: Direction;
  embed: string;
  note: string;
};

type Exemption = {
  file: string;
  embed: string;
  parent: string;
  note: string;
};

const INVENTORY: InventorySite[] = [
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
];

const EXEMPTIONS: Exemption[] = [1, 2].map(() => ({
  file: "packages/graphql/handler.ts",
  embed: "missionary:missionaries!missionary_id(",
  parent: "posts",
  note: "reads from posts, whose key to missionaries 20261120130004 does not change",
}));

function resourceNameOf(embed: string): string {
  const withoutParen = embed.replace(/\($/, "");
  const withoutSpread = withoutParen.replace(/^\.\.\./, "");
  const withoutAlias = withoutSpread.includes(":")
    ? withoutSpread.slice(withoutSpread.indexOf(":") + 1)
    : withoutSpread;
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

function directionOf(root: string | null, resource: string): Direction | null {
  if (root === null || root === DYNAMIC_ROOT) return null;
  if (MONEY_SET.has(root) && TARGET_SET.has(resource)) return "money->target";
  if (TARGET_SET.has(root) && MONEY_SET.has(resource)) return "target->money";
  return null;
}

function isRelationshipChoosingViolation(embed: string): boolean {
  const resource = resourceNameOf(embed);
  if (FK_COL_SET.has(resource) || FK_CONSTRAINT_RE.test(resource)) return true;
  if (SEVEN_TABLES.has(resource) && hintsOf(embed).length > 0) return true;
  return false;
}

type Evaluation = {
  violations: string[];
  usedExemptions: number;
  unusedExemptions: Exemption[];
  inventoryMatches: FoundEmbed[];
};

function evaluateEmbeds(
  matches: FoundEmbed[],
  exemptions: Exemption[] = EXEMPTIONS,
): Evaluation {
  const violations: string[] = [];
  const remaining = exemptions.map((ex, index) => ({ ex, index, used: false }));
  const inventoryMatches: FoundEmbed[] = [];

  for (const match of matches) {
    if (match.root === DYNAMIC_ROOT) {
      violations.push(
        `${match.file}: dynamic .from() root for ${match.embed} — ${DYNAMIC_REMEDY}`,
      );
      continue;
    }

    if (isRelationshipChoosingViolation(match.embed)) {
      const hit = remaining.find(
        (slot) =>
          !slot.used &&
          slot.ex.file === match.file &&
          slot.ex.embed === match.embed &&
          match.root !== null &&
          !SEVEN_TABLES.has(slot.ex.parent) &&
          slot.ex.parent === match.root,
      );
      if (hit) {
        hit.used = true;
      } else {
        violations.push(
          `${match.file} (root=${match.root ?? "unbound"}): ${match.embed} — ${VIOLATION_REMEDY}`,
        );
      }
      continue;
    }

    const resource = resourceNameOf(match.embed);
    if (directionOf(match.root, resource) !== null) {
      inventoryMatches.push(match);
    }
  }

  return {
    violations,
    usedExemptions: remaining.filter((s) => s.used).length,
    unusedExemptions: remaining.filter((s) => !s.used).map((s) => s.ex),
    inventoryMatches,
  };
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

function setOrDynamic(map: Map<string, string>, name: string, value: string) {
  const prev = map.get(name);
  if (prev === undefined) map.set(name, value);
  else if (prev !== value) map.set(name, DYNAMIC_ROOT);
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
        setOrDynamic(stringConsts, name, init.text);
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
        setOrDynamic(varFromRoots, name, fromRoot);
      }
    }
    ts.forEachChild(node, pass1);
  }
  pass1(sf);

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
      const inString = idx.stringSpans.some(([s, e]) => pos >= s && pos < e);
      if (!inString) continue;
      if (/!\s*$/.test(text.slice(Math.max(0, pos - 16), pos))) continue;

      const embed = match[0].replace(/\s+/g, "");

      const inlineHits = idx.inlineSelectSpans
        .filter((s) => pos >= s.start && pos < s.end)
        .sort((a, b) => a.end - a.start - (b.end - b.start));
      if (inlineHits.length > 0) {
        found.push({ file, root: inlineHits[0]!.root, embed });
        continue;
      }

      const boundRoots = new Set<string>();
      let ambiguousSameName = false;
      for (const [name, decl] of idx.varDecls.entries()) {
        if (decl.spans.some(([s, e]) => pos >= s && pos < e)) {
          const roots = varRoots.get(`${file}\0${name}`);
          if (roots && roots.size > 0) {
            if (decl.spans.length > 1 && roots.size > 1) {
              ambiguousSameName = true;
            }
            for (const root of roots) boundRoots.add(root);
          }
        }
      }
      if (ambiguousSameName) {
        found.push({ file, root: DYNAMIC_ROOT, embed });
      } else if (boundRoots.size > 0) {
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

let cachedRepoEvaluation: Evaluation | null = null;
function repoEvaluation(): Evaluation {
  if (cachedRepoEvaluation) return cachedRepoEvaluation;
  const sources = new Map<string, string>();
  for (const file of [...new Set(sourceFiles())].sort()) {
    try {
      sources.set(file, readFileSync(file, "utf8"));
    } catch {}
  }
  cachedRepoEvaluation = evaluateEmbeds(scanSources(sources), EXEMPTIONS);
  return cachedRepoEvaluation;
}

describe("money-table embeds of funds and missionaries (round M M1, round N F1, round O A)", () => {
  it("no string or template literal in apps/ and packages/ chooses a money/target relationship by hint, column, or constraint (outside verified exemptions)", () => {
    const result = repoEvaluation();
    expect(result.violations, VIOLATION_REMEDY).toEqual([]);
  });

  it("every declared exemption names an unaltered parent table and matches an actual select in apps/ and packages/ (AL-2680: GraphQL createPost and its posts select are removed, so handler.ts holds two)", () => {
    for (const ex of EXEMPTIONS) {
      expect(
        SEVEN_TABLES.has(ex.parent),
        `${ex.file}: exempt parent ${ex.parent} must not be altered by 20261120130004`,
      ).toBe(false);
    }
    const result = repoEvaluation();
    expect(result.unusedExemptions, "remove stale exemptions").toEqual([]);
    expect(result.usedExemptions).toBe(EXEMPTIONS.length);
  });

  it("every hint-free embed between money tables and funds/missionaries matches the closed inventory with its bound root", () => {
    const result = repoEvaluation();
    expect(result.inventoryMatches, INVENTORY_REMEDY).toEqual(
      INVENTORY.map(({ file, root, embed }) => ({ file, root, embed })),
    );
    for (const site of INVENTORY) {
      expect(
        directionOf(site.root, resourceNameOf(site.embed)),
        `${site.file}: ${site.note}`,
      ).toBe(site.direction);
    }
    expect(INVENTORY.length).toBeGreaterThan(0);
  });
});

describe("negative scanner cases (round N F1, round O A)", () => {
  it("refuses a hinted embed nested under an unguarded outer .from() root", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `client.from("donors").select("id, donations(id, missionary:missionaries!missionary_id(*))");`,
      ),
    );
    expect(res.violations).toHaveLength(1);
    expect(res.violations[0]).toContain(VIOLATION_REMEDY);
  });

  it("refuses a hinted embed in a constant passed to a helper with no .from() near it", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `
        const PLEDGE_SELECT = "id, fund:funds!fund_id(id, name)";
        selectTenantRows(supabase, "donor_pledges", tenantId, PLEDGE_SELECT);
        `,
      ),
    );
    expect(res.violations).toHaveLength(1);
    expect(res.violations[0]).toContain(VIOLATION_REMEDY);
  });

  it("refuses spread embeds with hints and whitespace before ! in either direction", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `
        client.from("donations").select("id, ...funds!fund_id(name), ...missionaries!missionary_id(profile_id), funds !fund_id(id)");
        client.from("funds").select("id, ...donations!donations_fund_id_fkey(id)");
        `,
      ),
    );
    expect(res.violations).toHaveLength(4);
    for (const v of res.violations) expect(v).toContain(VIOLATION_REMEDY);
  });

  it("refuses column-named embeds in a helper-passed string and on a money root", () => {
    const helperRes = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `maybeFetchTenantRow({ table: "donor_pledges", select: "id, fund:fund_id(id), missionary_id(id)" });`,
      ),
    );
    expect(helperRes.violations).toHaveLength(2);
    for (const v of helperRes.violations) expect(v).toContain(VIOLATION_REMEDY);

    const directRes = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `client.from("donations").select("id, fund:fund_id(id), missionary_id(id)");`,
      ),
    );
    expect(directRes.violations).toHaveLength(2);
  });

  it("refuses an exempted embed text when moved off posts onto donations in the same file", () => {
    const res = evaluateEmbeds(
      scanText(
        "packages/graphql/handler.ts",
        `client.from("donations").select("*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))");`,
      ),
      EXEMPTIONS,
    );
    expect(res.violations).toHaveLength(1);
    expect(res.violations[0]).toContain(VIOLATION_REMEDY);
    expect(res.usedExemptions).toBe(0);
  });

  it("refuses reverse key-hint, reverse column-hint, and constraint-named embeds", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `
        client.from("funds").select("id, donations!donations_fund_id_fkey(id)");
        client.from("missionaries").select("id, donor_pledges!missionary_id(id)");
        client.from("donations").select("id, missionary:donations_missionary_id_fkey(id)");
        client.from("funds").select("id, gifts:donations_fund_same_tenant_fk(id)");
        `,
      ),
    );
    expect(res.violations).toHaveLength(4);
    for (const v of res.violations) expect(v).toContain(VIOLATION_REMEDY);
  });

  it("fails closed as dynamic when a root is non-literal or one builder name binds to two different roots", () => {
    const dynamicRes = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `
        function read(table: string) {
          return client.from(table).select("id, fund:funds(id)");
        }
        `,
      ),
    );
    expect(dynamicRes.violations).toHaveLength(1);
    expect(dynamicRes.violations[0]).toContain(DYNAMIC_REMEDY);

    const reusedBuilder = evaluateEmbeds(
      scanText(
        "packages/graphql/handler.ts",
        `
        function a() {
          const q = client.from("donations");
          return q.select("id, missionary:missionaries!missionary_id(*)");
        }
        function b() {
          const q = client.from("posts");
          return q.select("id");
        }
        `,
      ),
      EXEMPTIONS,
    );
    expect(reusedBuilder.violations).toHaveLength(1);
    expect(reusedBuilder.violations[0]).toContain(DYNAMIC_REMEDY);
    expect(reusedBuilder.usedExemptions).toBe(0);
  });
});

describe("positive scanner controls (round O, A)", () => {
  it("allows hints on tables outside the seven (donor -> profiles!profile_id) while inventorying unhinted missionaries", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `client.from("donations").select("*, donor:donors(id, profile:profiles!profile_id(*)), missionary:missionaries(*, profile:profiles!profile_id(*))");`,
      ),
    );
    expect(res.violations).toEqual([]);
    expect(res.inventoryMatches).toEqual([
      {
        file: "fixture.ts",
        root: "donations",
        embed: "missionary:missionaries(",
      },
    ]);
  });

  it("allows an unhinted spread embed and inventories it under its root", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `client.from("donations").select("id, ...funds(name)");`,
      ),
    );
    expect(res.violations).toEqual([]);
    expect(res.inventoryMatches).toEqual([
      { file: "fixture.ts", root: "donations", embed: "...funds(" },
    ]);
  });

  it("allows an unhinted reverse embed and inventories it under its target root", () => {
    const res = evaluateEmbeds(
      scanText(
        "fixture.ts",
        `client.from("funds").select("id, donations!inner(id)");`,
      ),
    );
    expect(res.violations).toEqual([]);
    expect(res.inventoryMatches).toEqual([
      { file: "fixture.ts", root: "funds", embed: "donations!inner(" },
    ]);
  });

  it("allows the two posts exemptions when bound to .from('posts') (AL-2680: GraphQL's posts and post share one select, and its fix round removes createPost's)", () => {
    const res = evaluateEmbeds(
      scanText(
        "packages/graphql/handler.ts",
        [1, 2]
          .map(
            () =>
              `client.from("posts").select("*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))");`,
          )
          .join("\n"),
      ),
      EXEMPTIONS,
    );
    expect(res.violations).toEqual([]);
    expect(res.usedExemptions).toBe(2);
    expect(res.unusedExemptions).toEqual([]);
  });

  it("ignores profiles!missionary_id(...) anywhere, property access, and prose in comments/JSX", () => {
    const matches = scanText(
      "fixture.tsx",
      `
      // The report is built from donations (including ones with no fund) and missionaries(id).
      client.from("posts").select("id, author:profiles!missionary_id(full_name), alt:profiles! missionary_id(id)");
      obj.funds(id);
      export const el = <p>donations (pending)</p>;
      `,
    );
    expect(matches).toEqual([]);
    expect(evaluateEmbeds(matches).violations).toEqual([]);
  });
});

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "money-table embeds resolve on the migrated catalog as PostgREST does (round M M1, round N F1, round O A)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const sitePairs = [
      ...new Map(
        INVENTORY.map((site) => {
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

    const LINE_KEYED = new Set([
      "staged_gift_allocations>funds",
      "staged_gift_allocations>missionaries",
    ]);

    it.each(allPairs)(
      "pair %s <-> %s has one composite relationship in both directions and zero single-column FKs (D-18, AL-2681 WP8a part 2 R2a: staged_gift_allocations has a second composite key to funds and to missionaries, carrying the line's entity and fee flag; no live read embeds a target from allocations, INVENTORY above)",
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
          direct: LINE_KEYED.has(`${money}>${target}`) ? 2 : 1,
          single_col_fks: 0,
          junctions: 0,
        });
      },
    );
  },
);
