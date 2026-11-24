import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ALL_SURFACES,
  HOME_SURFACES,
  SITE_TABLES,
  claimSql,
  expectCode,
  resolveAsAnon,
  setProofsSql,
  snapshot,
} from "./site-fixture";
import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const SEED = {
  "00000000-0000-0000-0000-000000000001": "give-hope-demo",
  "00000000-0000-0000-0000-000000000002": "harbor-light-mission",
};

describe.skipIf(!ADMIN_URL)("the claimed-name record", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  type Fixture = {
    ta: string;
    tb: string;
    siteA: string;
    siteB: string;
    homeA: string;
    homeB: string;
    hostA: string;
    hostB: string;
  };

  async function fixture(run: (f: Fixture) => Promise<void>) {
    const f: Fixture = {
      ta: randomUUID(),
      tb: randomUUID(),
      siteA: randomUUID(),
      siteB: randomUUID(),
      homeA: randomUUID(),
      homeB: randomUUID(),
      hostA: "",
      hostB: "",
    };
    f.hostA = `a-${f.ta}.example.org`;
    f.hostB = `b-${f.tb}.example.org`;
    await db.query("begin");
    try {
      await db.query(
        "insert into public.tenants(id,name,slug) values ($1::uuid,'Claims A','claims-'||$1::uuid::text),($2::uuid,'Claims B','claims-'||$2::uuid::text)",
        [f.ta, f.tb],
      );
      await db.query(
        "insert into public.sites(id,tenant_id,name,is_default) values ($1,$2,'Default A',true),($3,$4,'Default B',true)",
        [f.siteA, f.ta, f.siteB, f.tb],
      );
      await db.query(
        "insert into public.donor_portal_hosts(id,tenant_id) values ($1,$2),($3,$4)",
        [f.homeA, f.ta, f.homeB, f.tb],
      );
      await db.query(claimSql({ host: f.hostB, tenant: f.tb, site: f.siteB }));
      await db.query(
        "update public.donor_portal_hosts set primary_domain=$1 where id=$2",
        [f.hostB, f.homeB],
      );
      await db.query("set constraints all immediate");
      await db.query("set constraints all deferred");
      await run(f);
    } finally {
      await db.query("rollback");
    }
  }

  it("resolves an unknown or unverified host to nothing, and a ready or active one to its own tenant", () =>
    fixture(async (f) => {
      const tbBefore = await snapshot(db, [f.tb]);
      expect(await resolveAsAnon(db, `${randomUUID()}.invalid`)).toEqual([]);
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 1 }),
      );
      expect(await resolveAsAnon(db, f.hostA)).toEqual([]);
      await db.query(
        "update public.donor_portal_hosts set primary_domain=$1 where id=$2",
        [f.hostA, f.homeA],
      );
      for (const proofs of [1, 2, 3, 4]) {
        await db.query(setProofsSql(f.hostA, proofs));
        expect(await resolveAsAnon(db, f.hostA), `${proofs} proofs`).toEqual(
          [],
        );
      }
      const generation = (
        await db.query(
          "select generation from public.site_domains where host=$1",
          [f.hostA],
        )
      ).rows[0]!.generation;
      await db.query(setProofsSql(f.hostA, 5));
      expect(await resolveAsAnon(db, f.hostA)).toEqual([
        {
          tenant_id: f.ta,
          site_id: f.siteA,
          generation,
          surfaces: ALL_SURFACES,
          state: "ready",
          is_home: true,
        },
      ]);
      await db.query(setProofsSql(f.hostA, 6));
      expect(await resolveAsAnon(db, f.hostA)).toMatchObject([
        { tenant_id: f.ta, site_id: f.siteA, state: "active", is_home: true },
      ]);
      expect(await resolveAsAnon(db, f.hostB)).toMatchObject([
        { tenant_id: f.tb, site_id: f.siteB, state: "active", is_home: true },
      ]);
      const extraA = `extra.${f.hostA}`;
      await db.query(claimSql({ host: extraA, tenant: f.ta, site: f.siteA }));
      expect(await resolveAsAnon(db, extraA)).toMatchObject([
        { tenant_id: f.ta, site_id: f.siteA, state: "active", is_home: false },
      ]);
      await db.query("set constraints all immediate");
      expect(await snapshot(db, [f.tb])).toEqual(tbBefore);
    }));

  it("resolves a ready home-only name with no Site as home", () =>
    fixture(async (f) => {
      const host = `home.${f.hostA}`;
      await db.query(claimSql({ host, tenant: f.ta, proofs: 5 }));
      await db.query(
        "update public.donor_portal_hosts set primary_domain=$1 where id=$2",
        [host, f.homeA],
      );
      await db.query("set constraints all immediate");
      expect(await resolveAsAnon(db, host)).toMatchObject([
        {
          tenant_id: f.ta,
          site_id: null,
          surfaces: HOME_SURFACES,
          state: "ready",
          is_home: true,
        },
      ]);
    }));

  it("writes a claimed name only as the owner, after its control proof, with proofs in order and a database generation", () =>
    fixture(async (f) => {
      const privileges = await db.query(
        `select role_name, privilege from unnest(array['anon','authenticated','service_role','tenant_guard']) role_name
           cross join unnest(array['INSERT','UPDATE','DELETE','TRUNCATE']) privilege
          where has_table_privilege(role_name,'public.site_domains',privilege)
             or case when privilege in ('INSERT','UPDATE') then has_any_column_privilege(role_name,'public.site_domains',privilege) else false end`,
      );
      expect(privileges.rows).toEqual([]);
      const tbBefore = await snapshot(db, [f.tb]);
      expect(
        await expectCode(
          db,
          "insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project) values ($1,$2,$3,array['website'],'donor')",
          [f.hostA, f.ta, f.siteA],
        ),
      ).toBe("23502");
      for (const [column, needs] of [
        ["attached_at", "control"],
        ["routing_proved_at", "attached"],
        ["https_proved_at", "routing"],
        ["sign_in_ready_at", "https"],
        ["activation_proved_at", "sign-in ready"],
      ])
        expect(
          await expectCode(
            db,
            `insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project,control_proved_at,${column}) values ($1,$2,$3,array['website'],'donor',${column === "attached_at" ? "null" : "now()"},now())`,
            [f.hostA, f.ta, f.siteA],
          ),
          `${column} without ${needs}`,
        ).toBe(column === "attached_at" ? "23502" : "23514");
      const actor = randomUUID();
      await db.query("insert into auth.users(id) values ($1)", [actor]);
      for (const column of ["attached_by", "activation_proved_by"])
        expect(
          await expectCode(
            db,
            `insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project,control_proved_at,${column}) values ($1,$2,$3,array['website'],'donor',now(),$4)`,
            [f.hostA, f.ta, f.siteA, actor],
          ),
          `${column} without its time`,
        ).toBe("23514");
      expect(
        await expectCode(
          db,
          "insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project,control_proved_at,generation) values ($1,$2,$3,array['website'],'donor',now(),1)",
          [f.hostA, f.ta, f.siteA],
        ),
      ).toBe("428C9");
      expect(
        await expectCode(
          db,
          "insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project,control_proved_at,state) values ($1,$2,$3,array['website'],'donor',now(),'active')",
          [f.hostA, f.ta, f.siteA],
        ),
      ).toBe("428C9");
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 1 }),
      );
      const state = async () =>
        (
          await db.query(
            "select state from public.site_domains where host=$1",
            [f.hostA],
          )
        ).rows[0]!.state;
      expect(await state()).toBe("claimed");
      for (const [proofs, expected] of [
        [4, "claimed"],
        [5, "ready"],
        [6, "active"],
      ] as const) {
        await db.query(setProofsSql(f.hostA, proofs));
        expect(await state(), `${proofs} proofs`).toBe(expected);
      }
      expect(
        await expectCode(
          db,
          "update public.site_domains set generation=generation+1 where host=$1",
          [f.hostA],
        ),
      ).toBe("428C9");
      expect(
        await expectCode(
          db,
          "update public.site_domains set sign_in_ready_at=null where host=$1",
          [f.hostA],
        ),
      ).toBe("23514");
      await db.query(
        "update public.site_domains set activation_proved_by=$1 where host=$2",
        [actor, f.hostA],
      );
      await db.query("delete from auth.users where id=$1", [actor]);
      expect(
        (
          await db.query(
            "select activation_proved_by, state from public.site_domains where host=$1",
            [f.hostA],
          )
        ).rows,
      ).toEqual([{ activation_proved_by: null, state: "active" }]);
      const first = BigInt(
        (
          await db.query(
            "select generation from public.site_domains where host=$1",
            [f.hostA],
          )
        ).rows[0]!.generation,
      );
      await db.query("delete from public.site_domains where host=$1", [
        f.hostA,
      ]);
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 1 }),
      );
      const second = BigInt(
        (
          await db.query(
            "select generation from public.site_domains where host=$1",
            [f.hostA],
          )
        ).rows[0]!.generation,
      );
      expect(second > first).toBe(true);
      await db.query("set constraints all immediate");
      expect(await snapshot(db, [f.tb])).toEqual(tbBefore);
    }));

  it("binds Sites and names within one tenant", () =>
    fixture(async (f) => {
      const tbBefore = await snapshot(db, [f.tb]);
      const second = randomUUID();
      await db.query(
        "insert into public.sites(id,tenant_id,name) values ($1,$2,'Second A')",
        [second, f.ta],
      );
      await db.query("set constraints all immediate");
      expect(
        (
          await db.query(
            "select primary_domain, is_default, status from public.sites where id=$1",
            [second],
          )
        ).rows,
      ).toEqual([
        { primary_domain: null, is_default: false, status: "active" },
      ]);
      await db.query("set constraints all deferred");
      await db.query(claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA }));
      expect(
        await expectCode(
          db,
          "update public.sites set primary_domain=$1 where id=$2",
          [f.hostA, second],
        ),
      ).toBe("23503");
      expect(
        await expectCode(
          db,
          "update public.sites set primary_domain=$1 where id=$2",
          [`missing.${f.hostA}`, f.siteA],
        ),
      ).toBe("23503");
      await db.query("update public.sites set primary_domain=$1 where id=$2", [
        f.hostA,
        f.siteA,
      ]);
      await db.query("set constraints all immediate");
      await db.query("set constraints all deferred");
      await db.query(
        "grant insert on public.site_domains to service_role; grant usage on schema public to service_role",
      );
      await db.query("savepoint as_service");
      await db.query("set local role service_role");
      await expect(
        db.query(
          claimSql({ host: `other.${f.hostA}`, tenant: f.tb, site: f.siteA }),
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await db.query("rollback to savepoint as_service");
      for (const [label, sql] of [
        [
          "website without a Site",
          claimSql({
            host: `w.${f.hostA}`,
            tenant: f.ta,
            surfaces: ALL_SURFACES,
          }),
        ],
        [
          "a Site without website",
          claimSql({
            host: `w.${f.hostA}`,
            tenant: f.ta,
            site: f.siteA,
            surfaces: HOME_SURFACES,
          }),
        ],
        [
          "no surface",
          claimSql({ host: `w.${f.hostA}`, tenant: f.ta, surfaces: [] }),
        ],
        [
          "an unknown surface",
          claimSql({
            host: `w.${f.hostA}`,
            tenant: f.ta,
            surfaces: ["staff", "admin"],
          }),
        ],
        [
          "a surface twice",
          claimSql({
            host: `w.${f.hostA}`,
            tenant: f.ta,
            surfaces: ["staff", "staff"],
          }),
        ],
        [
          "an unknown project",
          claimSql({ host: `w.${f.hostA}`, tenant: f.ta, project: "web" }),
        ],
      ] as [string, string][])
        expect(await expectCode(db, sql), label).toBe("23514");
      for (const host of [
        "www.Example.org",
        "example.org.",
        "example.org:443",
        "bücher.example",
        "first..example",
        "-invalid.example",
        "192.0.2.1",
      ])
        expect(
          await expectCode(db, claimSql({ host, tenant: f.ta })),
          host,
        ).toBe("23514");
      await db.query(
        claimSql({
          host: `xn--bcher-kva.${f.ta}.example`,
          tenant: f.ta,
          proofs: 1,
        }),
      );
      expect(
        await expectCode(
          db,
          claimSql({ host: f.hostA, tenant: f.tb, site: f.siteB }),
        ),
      ).toBe("23505");
      await db.query("set constraints all immediate");
      expect(await snapshot(db, [f.tb])).toEqual(tbBefore);
    }));

  it("keeps one home record per tenant, naming only that tenant's own claimed name", () =>
    fixture(async (f) => {
      const tbBefore = await snapshot(db, [f.tb]);
      expect(
        (
          await db.query(
            "select primary_domain from public.donor_portal_hosts where id=$1",
            [f.homeA],
          )
        ).rows,
      ).toEqual([{ primary_domain: null }]);
      expect(
        await expectCode(
          db,
          "insert into public.donor_portal_hosts(tenant_id) values ($1)",
          [f.ta],
        ),
      ).toBe("23505");
      expect(
        await expectCode(
          db,
          "update public.donor_portal_hosts set primary_domain=$1 where id=$2",
          [f.hostB, f.homeA],
        ),
      ).toBe("23503");
      await db.query("set constraints all immediate");
      expect(await snapshot(db, [f.tb])).toEqual(tbBefore);
    }));

  it.each(SITE_TABLES)("gives no client direct access to %s", async (table) => {
    const granted = await db.query(
      `select role_name, privilege from unnest(array['anon','authenticated','service_role']) role_name
         cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) privilege
        where has_table_privilege(role_name,$1,privilege)
           or case when privilege in ('SELECT','INSERT','UPDATE','REFERENCES') then has_any_column_privilege(role_name,$1,privilege) else false end`,
      [`public.${table}`],
    );
    expect(granted.rows).toEqual([]);
    expect(
      (
        await db.query(
          "select relrowsecurity and relforcerowsecurity as forced from pg_class where oid=$1::regclass",
          [`public.${table}`],
        )
      ).rows,
    ).toEqual([{ forced: true }]);
  });

  it("shows the guard entered as one tenant none of the other tenant's rows", () =>
    fixture(async (f) => {
      await db.query(claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA }));
      await db.query(
        "insert into public.donor_account_brands(tenant_id,display_name) values ($1,'A'),($2,'B')",
        [f.ta, f.tb],
      );
      await db.query("set constraints all immediate");
      await db.query("savepoint as_guard");
      await db.query("set local role tenant_guard");
      await db.query("select tenant_guard.enter($1)", [f.ta]);
      for (const table of SITE_TABLES) {
        const { rows } = await db.query(
          `select tenant_id from public.${table} where tenant_id=any($1::uuid[])`,
          [[f.ta, f.tb]],
        );
        expect(rows.length, table).toBeGreaterThan(0);
        expect(
          rows.every((row) => row.tenant_id === f.ta),
          table,
        ).toBe(true);
      }
      await db.query("rollback to savepoint as_guard");
    }));

  it("normalises HTTP host spelling, not Unicode or malformed names", () =>
    fixture(async (f) => {
      const ascii = `xn--bcher-kva.${f.ta}.org`;
      await db.query(claimSql({ host: ascii, tenant: f.ta, site: f.siteA }));
      for (const spelling of [
        ascii,
        ascii.toUpperCase(),
        `${ascii}:443`,
        `${ascii}.`,
        `${ascii.toUpperCase()}.:8443`,
      ])
        expect(await resolveAsAnon(db, spelling), spelling).toMatchObject([
          { tenant_id: f.ta, site_id: f.siteA },
        ]);
      for (const spelling of [
        ascii.replace("xn--bcher-kva", "bücher"),
        `${ascii}..`,
        `${ascii}:no`,
        `${ascii}:12:23`,
      ])
        expect(await resolveAsAnon(db, spelling), spelling).toEqual([]);
    }));

  it("leaves tenant and Site status to the request path: a suspended tenant's ready name still resolves", () =>
    fixture(async (f) => {
      const second = randomUUID();
      const host = `second.${f.hostA}`;
      await db.query(
        "insert into public.sites(id,tenant_id,name,status) values ($1,$2,'Second A','inactive')",
        [second, f.ta],
      );
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 5 }),
      );
      await db.query(claimSql({ host, tenant: f.ta, site: second, proofs: 5 }));
      await db.query(
        "update public.tenants set status='suspended' where id=$1",
        [f.ta],
      );
      await db.query("set constraints all immediate");
      expect(await resolveAsAnon(db, f.hostA)).toMatchObject([
        { tenant_id: f.ta, state: "ready" },
      ]);
      expect(await resolveAsAnon(db, host)).toMatchObject([
        { tenant_id: f.ta, site_id: second, state: "ready" },
      ]);
    }));

  it("projects exactly five public fields of the claimed-name record and derives only is_home", async () => {
    const fields = await db.query(
      "select field_key from public.field_policies where record_type='site_domains' and surface='public' and visible order by 1",
    );
    expect(fields.rows.map((row) => row.field_key)).toEqual([
      "generation",
      "site_id",
      "state",
      "surfaces",
      "tenant_id",
    ]);
    const output = await db.query(
      `select array_agg(name order by ord) filter (where mode='t') as columns
         from pg_proc p, unnest(p.proargnames, p.proargmodes::text[]) with ordinality as a(name, mode, ord)
        where p.oid='public.resolve_verified_host(text)'::regprocedure`,
    );
    expect(output.rows[0]!.columns).toEqual([
      "tenant_id",
      "site_id",
      "generation",
      "surfaces",
      "state",
      "is_home",
    ]);
    const invisible = await db.query(
      "select count(*)::int as n from public.field_policies where record_type in ('sites','donor_portal_hosts','donor_account_brands') and surface<>'mission_control' and (visible or editable or exportable)",
    );
    expect(invisible.rows[0]!.n).toBe(0);
  });

  it("seeds each organization's own active home name, its default Site, and a second Site without a name", async () => {
    const tenants = Object.keys(SEED);
    for (const [tenant, slug] of Object.entries(SEED)) {
      const site = (
        await db.query(
          "select id, primary_domain from public.sites where tenant_id=$1 and is_default",
          [tenant],
        )
      ).rows[0];
      expect(site?.primary_domain).toBe(`${slug}.localhost`);
      await db.query("begin");
      try {
        expect(await resolveAsAnon(db, `${slug}.localhost`)).toMatchObject([
          {
            tenant_id: tenant,
            site_id: site.id,
            state: "active",
            is_home: true,
            surfaces: ALL_SURFACES,
          },
        ]);
      } finally {
        await db.query("rollback");
      }
    }
    const count = async (table: string) =>
      (
        await db.query(
          `select count(*)::int as n from public.${table} where tenant_id=any($1::uuid[])`,
          [tenants],
        )
      ).rows[0]!.n;
    expect({
      sites: await count("sites"),
      site_domains: await count("site_domains"),
      donor_portal_hosts: await count("donor_portal_hosts"),
      donor_account_brands: await count("donor_account_brands"),
    }).toEqual({
      sites: 3,
      site_domains: 2,
      donor_portal_hosts: 2,
      donor_account_brands: 2,
    });
    expect(
      (
        await db.query(
          "select count(*)::int as n from public.sites where tenant_id=$1 and primary_domain is null and not is_default",
          ["00000000-0000-0000-0000-000000000002"],
        )
      ).rows[0]!.n,
    ).toBe(1);
    expect(
      (
        await db.query(
          "select b.tenant_id, b.display_name = t.name as named from public.donor_account_brands b join public.tenants t on t.id=b.tenant_id where b.tenant_id=any($1::uuid[]) order by 1",
          [tenants],
        )
      ).rows,
    ).toEqual(tenants.map((tenant_id) => ({ tenant_id, named: true })));
    expect(
      (
        await db.query(
          "select host from public.site_domains where tenant_id=any($1::uuid[]) order by 1",
          [tenants],
        )
      ).rows.map((row) => row.host),
    ).toEqual(
      Object.values(SEED)
        .map((slug) => `${slug}.localhost`)
        .sort(),
    );
  });

  it("refuses a proof recorded before the one it follows", () =>
    fixture(async (f) => {
      const tbBefore = await snapshot(db, [f.tb]);
      for (const [label, columns, values] of [
        ["attached before control", "attached_at", "now() - interval '1 hour'"],
        [
          "routing before attached",
          "attached_at,routing_proved_at",
          "now(),now() - interval '1 hour'",
        ],
        [
          "https before routing",
          "attached_at,routing_proved_at,https_proved_at",
          "now(),now(),now() - interval '1 hour'",
        ],
        [
          "sign-in ready before https",
          "attached_at,routing_proved_at,https_proved_at,sign_in_ready_at",
          "now(),now(),now(),now() - interval '1 hour'",
        ],
        [
          "activation before sign-in ready",
          "attached_at,routing_proved_at,https_proved_at,sign_in_ready_at,activation_proved_at",
          "now(),now(),now(),now(),now() - interval '1 hour'",
        ],
      ] as [string, string, string][])
        expect(
          await expectCode(
            db,
            `insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project,control_proved_at,${columns}) values ($1,$2,$3,array['website'],'donor',now(),${values})`,
            [f.hostA, f.ta, f.siteA],
          ),
          label,
        ).toBe("23514");
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 6 }),
      );
      expect(
        await expectCode(
          db,
          "update public.site_domains set routing_proved_at = attached_at - interval '1 second' where host=$1",
          [f.hostA],
        ),
      ).toBe("23514");
      await db.query("set constraints all immediate");
      expect(await snapshot(db, [f.tb])).toEqual(tbBefore);
    }));

  it("gives no role any privilege on the generation sequence or any other sequence of the four tables", async () => {
    const sequences = await db.query(
      `select s.oid::regclass::text as name
         from pg_class s
         join pg_depend d on d.objid = s.oid and d.classid = 'pg_class'::regclass and d.refclassid = 'pg_class'::regclass
        where s.relkind = 'S' and d.refobjid = any(array['public.sites','public.site_domains','public.donor_portal_hosts','public.donor_account_brands']::regclass[])
        order by 1`,
    );
    expect(sequences.rows.map((row) => row.name)).toEqual([
      "site_domains_generation_seq",
    ]);
    const granted = await db.query(
      `select role_name, privilege from unnest(array['public','anon','authenticated','service_role','tenant_guard']) role_name
         cross join unnest(array['USAGE','SELECT','UPDATE']) privilege
        where has_sequence_privilege(role_name,'public.site_domains_generation_seq',privilege)`,
    );
    expect(granted.rows).toEqual([]);
  });

  it("resolves nothing for a null, empty or overlong host, even one that would normalise to a ready name", () =>
    fixture(async (f) => {
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 5 }),
      );
      await db.query("set constraints all immediate");
      expect(await resolveAsAnon(db, `${f.hostA}:443`)).toHaveLength(1);
      await db.query("savepoint null_lookup");
      await db.query("set local role anon");
      expect(
        (await db.query("select * from public.resolve_verified_host(null)"))
          .rows,
      ).toEqual([]);
      await db.query("rollback to savepoint null_lookup");
      expect(await resolveAsAnon(db, "")).toEqual([]);
      expect(await resolveAsAnon(db, `${f.hostA}:${"4".repeat(300)}`)).toEqual(
        [],
      );
      expect(await resolveAsAnon(db, "a".repeat(100000))).toEqual([]);
    }));

  it("still resolves a closed tenant's ready name: status is the request path's", () =>
    fixture(async (f) => {
      await db.query(
        claimSql({ host: f.hostA, tenant: f.ta, site: f.siteA, proofs: 5 }),
      );
      await db.query("update public.tenants set status='closed' where id=$1", [
        f.ta,
      ]);
      await db.query("set constraints all immediate");
      expect(await resolveAsAnon(db, f.hostA)).toMatchObject([
        { tenant_id: f.ta, state: "ready" },
      ]);
    }));

  it("refuses a Site name or display name with leading or trailing whitespace of any kind", () =>
    fixture(async (f) => {
      for (const name of ["\t", "\n", "\tSite", "Site\r", " Site"])
        expect(
          await expectCode(
            db,
            "insert into public.sites(tenant_id,name) values ($1,$2)",
            [f.ta, name],
          ),
          JSON.stringify(name),
        ).toBe("23514");
      for (const name of ["\t", "Brand\n"])
        expect(
          await expectCode(
            db,
            "insert into public.donor_account_brands(tenant_id,display_name) values ($1,$2)",
            [f.ta, name],
          ),
          JSON.stringify(name),
        ).toBe("23514");
    }));
});
