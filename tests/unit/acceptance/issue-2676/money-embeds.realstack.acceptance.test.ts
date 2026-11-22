/**
 * AL-2676 (WP3a part 1a), round M, M1: an app embeds `funds` or `missionaries`
 * from the five money tables only in a form that resolves on both sides of
 * 20261120130004.
 *
 * That migration replaces each money table's single-column keys to funds and
 * missionaries with composite (tenant_id, target) keys. A column hint
 * (`missionaries!missionary_id`) resolves only on the single-column key, so a
 * release built with one fails its reads from the migration's commit until
 * its replacement is promoted; a key-name hint resolves only on one schema.
 * Without a hint, PostgREST resolves the embed on both, because each schema
 * has exactly one relationship per pair. That is what keeps the release
 * already running whole (plan 7.4).
 *
 * The static half holds for every embed of either table, by table name or by
 * foreign-key column, in source under apps/ and packages/ (tracked files and
 * untracked ones that are not ignored; tests excluded). SITES is closed: each
 * match is listed in file order with its root table, read by hand, and a match
 * that is not listed fails, so a new site must be classified here. `!inner`
 * and `!left` choose the join, not the relationship, and are allowed. A
 * select assembled at run time from parts is not seen. The real-catalog half
 * runs in the migrate job (TENANT_GUARD_IT_ADMIN_DATABASE_URL) and counts
 * what PostgREST resolves between each money-table root and its target: a
 * key in either direction, or a junction table whose keys to both lie in its
 * primary key.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import pg from "pg";
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

/** An embed of funds or missionaries, by table name or foreign-key column. */
const EMBED =
  /(?<![A-Za-z0-9_.!$])(?:[A-Za-z_][A-Za-z0-9_]*\s*:\s*)?(funds|missionaries|fund_id|missionary_id)((?:![A-Za-z0-9_]+)*)\s*\(/g;
/** Join modifiers, which do not pick a relationship. */
const JOIN_MODIFIERS = new Set(["inner", "left"]);

type Site = {
  file: string;
  embed: string;
  /** The table the select reads from, or null with the reason it is no read of a money table. */
  root: MoneyTable | null;
  note: string;
};

const SITES: Site[] = [
  {
    file: "packages/api/src/donations/select.ts",
    embed: "missionary:missionaries!donations_missionary_same_tenant_fk(",
    root: "donations",
    note: "DONATION_WITH_PARTIES_SELECT (REST and GraphQL donation reads)",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    embed: "fund:funds(",
    root: "donations",
    note: "DONATION_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    embed: "missionary:missionaries(",
    root: "donations",
    note: "DONATION_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    embed: "fund:funds(",
    root: "donor_pledges",
    note: "PLEDGE_SELECT",
  },
  {
    file: "packages/api/src/donor-portal/service.ts",
    embed: "missionary:missionaries(",
    root: "donor_pledges",
    note: "PLEDGE_SELECT",
  },
  {
    file: "packages/api/src/missionary-portal/donors.ts",
    embed: "missionary:missionaries!inner(",
    root: "donor_pledges",
    note: "a partner's pledges, scoped through the missionary's profile",
  },
  {
    file: "packages/database/hooks/missionary-donors-model.ts",
    embed: "missionaries(",
    root: null,
    note: "a comment naming the key `missionaries(id)`, not a select",
  },
  {
    file: "packages/graphql/handler.ts",
    embed: "missionaries(",
    root: null,
    note: "the GraphQL schema's `missionaries(limit, offset)` field, not a select",
  },
  ...[1, 2, 3, 4].map(() => ({
    file: "packages/graphql/handler.ts",
    embed: "missionary:missionaries!missionary_id(",
    root: null,
    note: "reads from posts, whose key to missionaries 20261120130004 does not change",
  })),
];

const targetOf = (embed: string) =>
  /(?:^|:)(?:funds|fund_id)!?/.test(embed) ? "funds" : "missionaries";
const hintsOf = (embed: string) =>
  embed
    .replace(/\($/, "")
    .split("!")
    .slice(1)
    .filter((part) => !JOIN_MODIFIERS.has(part));

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

function foundEmbeds(): { file: string; embed: string }[] {
  const found: { file: string; embed: string }[] = [];
  for (const file of [...new Set(sourceFiles())].sort()) {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      // Listed by Git but deleted in the working tree.
      continue;
    }
    for (const match of text.matchAll(EMBED))
      found.push({ file, embed: match[0].replace(/\s+/g, "") });
  }
  return found;
}

const moneySites = SITES.filter(
  (site): site is Site & { root: MoneyTable } => site.root !== null,
);

describe("money-table embeds of funds and missionaries (round M, M1)", () => {
  it("every embed of funds or missionaries in apps/ and packages/ is a listed site", () => {
    expect(foundEmbeds()).toEqual(
      SITES.map(({ file, embed }) => ({ file, embed })),
    );
  });

  it("the listed roots are money tables or carry their reason", () => {
    for (const site of SITES)
      expect(
        site.root === null || MONEY_TABLES.includes(site.root),
        site.note,
      ).toBe(true);
    expect(moneySites.length).toBeGreaterThan(0);
  });

  it.each(
    moneySites.map(
      (site) => [`${site.root} ${site.embed} in ${site.file}`, site] as const,
    ),
  )("%s carries no column or key-name hint", (_label, site) => {
    expect(hintsOf(site.embed), site.note).toEqual([]);
  });
});

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "money-table embeds resolve on the migrated catalog (round M, M1)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const pairs = [
      ...new Map(
        moneySites.map((site) => {
          const target = targetOf(site.embed);
          return [`${site.root}>${target}`, [site.root, target] as const];
        }),
      ).values(),
    ];

    it.each(pairs)(
      "%s to %s is exactly one relationship",
      async (root, target) => {
        const { rows } = await db.query(
          `with pk as (select conrelid, conkey from pg_constraint where contype = 'p'),
                fk as (select conrelid, confrelid, conkey from pg_constraint where contype = 'f')
           select
             (select count(*)::int from pg_constraint
               where contype = 'f'
                 and ((conrelid = $1::regclass and confrelid = $2::regclass)
                   or (conrelid = $2::regclass and confrelid = $1::regclass))) as direct,
             (select count(distinct a.conrelid)::int from fk a
               join fk b on b.conrelid = a.conrelid
               join pk on pk.conrelid = a.conrelid
              where a.confrelid = $1::regclass and b.confrelid = $2::regclass
                and a.conrelid not in ($1::regclass, $2::regclass)
                and a.conkey <@ pk.conkey and b.conkey <@ pk.conkey) as junctions`,
          [`public.${root}`, `public.${target}`],
        );
        expect(rows[0]).toEqual({ direct: 1, junctions: 0 });
      },
    );
  },
);
