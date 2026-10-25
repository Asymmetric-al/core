/**
 * #2269 acceptance (spec r1 = issue comment 6385584133, approved with all
 * defaults in 6385601889). Static C1, C2 (SDL), C8, then the (R) real-catalog
 * check C3: each endpoint's donations select is parsed, every embed is
 * resolved against the migrated catalog by PostgREST's FK rules (exactly one
 * relationship each), and the equivalent SQL join runs with the endpoint's
 * filters for a profiled donor and a guest donor (`profile_id IS NULL`).
 * (R) uses TENANT_GUARD_IT_ADMIN_DATABASE_URL (#2250's migrate step); without
 * it the DB block skips, except in the CI `migrate` job, where it fails.
 * Writes run in one transaction that is rolled back. No migration is involved.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const REST = "packages/api/src/donations/index.ts";
const GQL = "packages/graphql/handler.ts";
const SELECT_TS = "packages/api/src/donations/select.ts";
const NAME = "DONATION_WITH_PARTIES_SELECT";
/** Spec 1.1, verbatim. */
const SPEC_SELECT =
  "*, donor:donors(id, profile:profiles!profile_id(*)), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))";
const read = (f: string) => (existsSync(f) ? readFileSync(f, "utf8") : "");

type Site = { name: string; file: string; start: RegExp; filter: Filter };
type Filter = "donor" | "missionary" | "id";
const SITES: Site[] = [
  {
    name: "1 REST GET /api/donations",
    file: REST,
    start: /^export async function GET\b/m,
    filter: "donor",
  },
  {
    name: "2 REST POST /api/donations read-back",
    file: REST,
    start: /^export async function POST\b/m,
    filter: "id",
  },
  {
    name: "3 GraphQL myDonations",
    file: GQL,
    start: /^ {4}myDonations: async \(/m,
    filter: "donor",
  },
  {
    name: "4 GraphQL mySupporters",
    file: GQL,
    start: /^ {4}mySupporters: async \(/m,
    filter: "missionary",
  },
  {
    name: "5 GraphQL createDonation",
    file: GQL,
    start: /^ {4}createDonation: async \(/m,
    filter: "id",
  },
];
/** The site's source block: from its declaration to the next resolver/export. */
function block(site: Site) {
  const src = read(site.file);
  const at = src.search(site.start);
  expect(at, `${site.name} not found in ${site.file}`).toBeGreaterThan(-1);
  const rest = src.slice(at + 1);
  const end = rest.search(/^(export async function |\s{4}\w+: async \()/m);
  return end < 0 ? rest : rest.slice(0, end);
}
/** The `.from("donations").select(<arg>)` argument at a site (identifier or string literal). */
function selectArg(site: Site) {
  const all = [
    ...block(site).matchAll(
      /\.from\("donations"\)\s*\.select\(\s*(\w+|"[^"]*"|`[^`]*`)\s*,?\s*\)/g,
    ),
  ].map((m) => m[1]!);
  expect(all, `${site.name}: one donations select`).toHaveLength(1);
  return all[0]!;
}
async function constant(): Promise<string> {
  expect(existsSync(SELECT_TS), `${SELECT_TS} must exist (In 1)`).toBe(true);
  const mod = (await import(/* @vite-ignore */ resolve(SELECT_TS))) as Record<
    string,
    unknown
  >;
  expect(typeof mod[NAME], `${SELECT_TS} exports ${NAME}`).toBe("string");
  return mod[NAME] as string;
}
/** The select string a site actually sends. */
async function selectOf(site: Site) {
  const arg = selectArg(site);
  if (arg === NAME) return constant();
  expect(arg, `${site.name}: select is ${NAME} or a literal`).toMatch(/^["`]/);
  return arg.slice(1, -1);
}

type Embed = { alias: string; table: string; hint?: string; kids: Embed[] };
/** PostgREST select grammar, embeds only: `alias:table!hint(children)`. */
function embeds(select: string): Embed[] {
  const parts: string[] = [];
  let [depth, cur] = [0, ""];
  for (const ch of select) {
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
    if (ch === "(") depth++;
    if (ch === ")") depth--;
  }
  return [...parts, cur].flatMap((p) => {
    const m = /^\s*(?:(\w+):)?(\w+)(?:!(\w+))?\s*\(([\s\S]*)\)\s*$/.exec(p);
    if (!m) return [];
    return [
      { alias: m[1] ?? m[2]!, table: m[2]!, hint: m[3], kids: embeds(m[4]!) },
    ];
  });
}

describe("#2269 static (C1, C2, C8)", () => {
  it("C1: no profiles!donor_id hint under apps/ or packages/; no donors!donor_id in the in-scope files", () => {
    const grep = (pattern: string, ...paths: string[]) =>
      spawnSync(
        "git",
        ["grep", "-n", "--untracked", "-F", "-e", pattern, "--", ...paths],
        {
          encoding: "utf8",
        },
      );
    for (const r of [
      grep("profiles!donor_id", "apps", "packages"),
      // donors!donor_id is narrowed to the in-scope files (donations/index.ts,
      // graphql/handler.ts, select.ts) per Samson's ruling on #2269, because
      // follower-requests uses donors!donor_id legitimately; profiles!donor_id
      // above stays repo-wide.
      grep("donors!donor_id", REST, GQL, SELECT_TS),
    ]) {
      expect(r.stdout).toBe("");
      expect(r.status).toBe(1);
    }
  });
  it(`C1: ${SELECT_TS} exports ${NAME} = spec 1.1`, async () =>
    expect((await constant()).replace(/\s+/g, "")).toBe(
      SPEC_SELECT.replace(/\s+/g, ""),
    ));
  it.each(SITES.map((s) => [s.name, s] as const))(
    "C1: site %s selects DONATION_WITH_PARTIES_SELECT, imported from ./donations/select",
    (_n, site) => {
      expect(selectArg(site)).toBe(NAME);
      expect(read(site.file)).toMatch(
        /import\s*\{[^}]*\bDONATION_WITH_PARTIES_SELECT\b[^}]*\}\s*from\s*"(\.\/select|@asym\/api\/donations\/select)"/,
      );
    },
  );
  it("C1/In 5: package.json exports ./donations/select", () => {
    const pkg = JSON.parse(read("packages/api/package.json")) as {
      exports: Record<string, string>;
    };
    expect(pkg.exports["./donations/select"]).toBe("./src/donations/select.ts");
  });
  it("C2: the SDL declares Donation.donor as nullable Profile", () => {
    const sdl = /type Donation \{([^}]*)\}/.exec(read(GQL))?.[1] ?? "";
    expect(sdl).toMatch(/^\s*donor: Profile$/m);
  });
  it.each(
    SITES.filter((s) => s.filter !== "id").map((s) => [s.name, s] as const),
  )(
    'C3/C7 security: %s keeps .eq("tenant_id", …) on the donations query',
    (_n, site) =>
      expect(/\.from\("donations"\)[^;]*/.exec(block(site))?.[0]).toMatch(
        /\.eq\("tenant_id",/,
      ),
  );
  it.each([
    [REST, 1],
    [GQL, 2],
    [SELECT_TS, 0],
  ] as const)(
    "C8: %s has %i getAdminClient(/createAdminClient( call(s)",
    (file, n) => {
      const src = read(file);
      expect(src.match(/\b(get|create)AdminClient\(/g) ?? []).toHaveLength(n);
      if (n === 0) expect(src).not.toContain("@asym/database/supabase/admin");
    },
  );
});

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "C3: the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2269 C3 real catalog (R)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const u = (): string => randomUUID();
  const [TA, TB, PD, PM, MI, MB, DN1, DN2, DN3, G1, G2, GX] = [
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
    u(),
  ];
  /** One statement under a savepoint, so a failing case doesn't abort the others. */
  async function rows(sql: string, args: unknown[] = []) {
    await db.query("savepoint q");
    try {
      const r = await db.query(sql, args);
      await db.query("release savepoint q");
      return r.rows as Record<string, string | null>[];
    } catch (e) {
      await db.query("rollback to savepoint q");
      throw e;
    }
  }

  beforeAll(async () => {
    await db.connect();
    await db.query("begin");
    await db.query(
      `insert into public.tenants (id, name, slug) values ($1, 'acc2269 A', 'acc2269-' || $1), ($2, 'acc2269 B', 'acc2269-' || $2);
       insert into auth.users (id) values ($3), ($4);
       insert into public.profiles (id, tenant_id, role) values ($3, $1, 'donor'), ($4, $1, 'missionary') on conflict (id) do update set tenant_id = excluded.tenant_id, role = excluded.role;
       insert into public.missionaries (id, tenant_id, profile_id) values ($5, $1, $4), ($6, $2, $4);
       insert into public.donors (id, tenant_id, profile_id) values ($7, $1, $3), ($8, $1, null), ($9, $2, $3);
       insert into public.donations (id, tenant_id, donor_id, missionary_id, amount) values ($10, $1, $7, $5, 1000), ($11, $1, $8, $5, 2000), ($12, $2, $9, $6, 3000);`.replace(
        /\$(\d+)/g,
        (_m, i: string) =>
          `'${[TA, TB, PD, PM, MI, MB, DN1, DN2, DN3, G1, G2, GX][Number(i) - 1]}'`,
      ),
    );
  });
  afterAll(async () => {
    await db.query("rollback").catch(() => undefined);
    await db.end();
  });

  /** Every FK between two tables, either direction, with its columns. */
  async function fks(src: string, tgt: string) {
    return rows(
      `select conname, conrelid = $1::regclass as m2o,
        (select string_agg(attname, ',' order by n) from unnest(conkey) with ordinality k(a, n) join pg_attribute on attrelid = conrelid and attnum = a) cols,
        (select string_agg(attname, ',' order by n) from unnest(confkey) with ordinality k(a, n) join pg_attribute on attrelid = confrelid and attnum = a) fcols
       from pg_constraint where contype = 'f' and ((conrelid = $1::regclass and confrelid = $2::regclass) or (conrelid = $2::regclass and confrelid = $1::regclass))`,
      [`public.${src}`, `public.${tgt}`],
    );
  }
  /** Joins for an embed tree; each embed must resolve to exactly one FK. */
  async function joins(
    src: string,
    alias: string,
    list: Embed[],
    path = "",
  ): Promise<string[]> {
    const out: string[] = [];
    for (const e of list) {
      const all = await fks(src, e.table);
      const hit = all.filter(
        (f) =>
          !e.hint ||
          f.conname === e.hint ||
          (!f.cols!.includes(",") && (f.cols === e.hint || f.fcols === e.hint)),
      );
      const label = `${path}${e.alias}:${e.table}${e.hint ? `!${e.hint}` : ""} from ${src}`;
      expect(
        hit.map((f) => f.conname),
        `${label} must resolve to exactly one relationship`,
      ).toHaveLength(1);
      const f = hit[0]!;
      const [cols, fcols] = [f.cols!.split(","), f.fcols!.split(",")];
      const a = `${alias}__${e.alias}`;
      const on = cols.map((c, i) =>
        f.m2o
          ? `${alias}.${c} = ${a}.${fcols[i]}`
          : `${a}.${c} = ${alias}.${fcols[i]}`,
      );
      out.push(`left join public.${e.table} ${a} on ${on.join(" and ")}`);
      out.push(...(await joins(e.table, a, e.kids, `${label} > `)));
    }
    return out;
  }
  /** The endpoint's query: lookup by profile + tenant (or id), donations filtered, embeds joined. */
  async function run(
    site: Site,
    by: { profile?: string; donor?: string; id?: string },
  ) {
    const j = await joins("donations", "d", embeds(await selectOf(site)));
    const where =
      site.filter === "id"
        ? `d.id = '${by.id}'`
        : site.filter === "missionary"
          ? `d.missionary_id = (select id from public.missionaries where profile_id = '${by.profile}' and tenant_id = '${TA}') and d.tenant_id = '${TA}'`
          : `d.donor_id = ${by.donor ? `'${by.donor}'` : `(select id from public.donors where profile_id = '${by.profile}' and tenant_id = '${TA}')`} and d.tenant_id = '${TA}'`;
    return rows(
      `select d.id, d.tenant_id, d__donor.id donor, d__donor__profile.id profile, d__missionary__profile.id mprofile
       from public.donations d ${j.join(" ")} where ${where} order by d.amount`,
    );
  }

  it.each(SITES.map((s) => [s.name, s] as const))(
    "C3: %s resolves every embed and returns the OQ1 donor shape (profiled + guest)",
    async (_n, site) => {
      const want = (id: string, donor: string, profile: string | null) => ({
        id,
        tenant_id: TA,
        donor,
        profile,
        mprofile: PM,
      });
      if (site.filter === "id") {
        expect(await run(site, { id: G1 })).toEqual([want(G1, DN1, PD)]);
        expect(await run(site, { id: G2 })).toEqual([want(G2, DN2, null)]);
      } else if (site.filter === "missionary") {
        expect(await run(site, { profile: PM })).toEqual([
          want(G1, DN1, PD),
          want(G2, DN2, null),
        ]);
      } else {
        expect(await run(site, { profile: PD })).toEqual([want(G1, DN1, PD)]);
        expect(await run(site, { donor: DN2 })).toEqual([want(G2, DN2, null)]);
      }
    },
  );
});
