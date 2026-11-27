import { randomUUID } from "node:crypto";

import {
  fixtureIds as baseIds,
  fixtureSql as baseSql,
} from "../issue-2678/harness";

import type { Ids as BaseIds } from "../issue-2678/harness";
import type pg from "pg";

export {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  backendPid,
  caller,
  keepAs,
  migration,
  preflight,
  waitsOn,
  type Outcome,
} from "../issue-2678/harness";

export const STAFF_ROLES = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
] as const;

const EXTRA = [
  "UST",
  "mST",
  "mMS",
  "UMR",
  "mMR",
  "mMRD",
  "pMR",
  "dMR",
  "mR",
  "UMBO",
  "mMBO",
  "pMBO",
  "mBO",
  ...STAFF_ROLES.flatMap((r) => [`U_${r}`, `m_${r}`]),
] as const;

export type Ids = BaseIds & Record<(typeof EXTRA)[number], string>;

export function fixtureIds(): Ids {
  return {
    ...baseIds(),
    ...Object.fromEntries(EXTRA.map((k) => [k, randomUUID()])),
  } as Ids;
}

export function fixtureSql(id: Ids) {
  const q = (k: keyof Ids) => `'${id[k]}'`;
  const staffUsers = STAFF_ROLES.map((r) => q(`U_${r}`));
  const users = [q("UST"), q("UMR"), q("UMBO"), ...staffUsers].join(", ");
  return `${baseSql(id)}
    update authz.memberships set is_tenant_admin = true where id = ${q("mS")};
    insert into auth.users (id, email, email_confirmed_at) select u, 'acc2680-' || u || '@example.test', now() from unnest(array[${users}]::uuid[]) u;
    delete from authz.memberships where user_id = any(array[${users}]::uuid[]);
    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, revoked_at) values
      (${q("mST")}, ${q("UST")}, ${q("TA")}, 'staff', 'development', true, null),
      (${q("mMS")}, ${q("UM")}, ${q("TA")}, 'staff', 'development', true, null),
      (${q("mMR")}, ${q("UMR")}, ${q("TA")}, 'missionary', null, false, now()),
      (${q("mMRD")}, ${q("UMR")}, ${q("TA")}, 'donor', null, true, null),
      (${q("mMBO")}, ${q("UMBO")}, ${q("TB")}, 'missionary', null, true, null),
      ${STAFF_ROLES.map((r) => `(${q(`m_${r}`)}, ${q(`U_${r}`)}, ${q("TA")}, 'staff', '${r}', true, null)`).join(",\n      ")};
    insert into public.parties (id, tenant_id, display_name) values
      (${q("pMR")}, ${q("TA")}, 'Revoked missionary'),
      (${q("pMBO")}, ${q("TB")}, 'Missionary of B only');
    insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
      (${q("mR")}, ${q("TA")}, ${q("pMR")}, ${q("UMR")}, ${q("TA")}),
      (${q("mBO")}, ${q("TB")}, ${q("pMBO")}, ${q("UMBO")}, ${q("TB")});
    insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values
      (${q("dMR")}, ${q("TA")}, ${q("pMR")}, ${q("UMR")}, 'Revoked missionary', 'acc2680-r-' || ${q("dMR")} || '@example.test');
    insert into public.account_links (tenant_id, user_id, party_id, linked_via) values
      (${q("TA")}, ${q("UMR")}, ${q("pMR")}, 'profile_backfill'),
      (${q("TB")}, ${q("UMBO")}, ${q("pMBO")}, 'profile_backfill');
    update public.follows set ministry_assignment_id = ${q("mA")} where id in (${q("fA")}, ${q("fC")});
    update public.follows set ministry_assignment_id = ${q("mB")} where id = ${q("fB")};
    delete from public.follows where id = ${q("f2")};`;
}

export type Who = {
  sub: string;
  headers: Record<string, string>;
};

export function who(
  id: Ids,
  user: keyof Ids,
  assignment: keyof Ids,
  tenant: keyof Ids,
): Who {
  return {
    sub: user as string,
    headers: {
      "x-asym-tenant": id[tenant],
      "x-asym-assignment": id[assignment],
    },
  };
}

export const lit = (value: string | null) =>
  value === null ? "null" : `'${value.replaceAll("'", "''")}'`;

export function submitSql(
  tenant: string,
  post: string | null,
  title: string,
  options: { visibility?: string; publish?: boolean } = {},
) {
  return `select public.submit_ministry_update(${lit(tenant)}, ${post ? `${lit(post)}::uuid` : "null::uuid"}, ${lit(title)}, ${lit(`${title} body`)}, '[]'::jsonb, ${lit(options.visibility ?? "public")}, null, ${options.publish ?? true}) as id`;
}

export async function counts(db: pg.Client, tenant: string) {
  const r = await db.query(
    `select (select count(*)::int from public.posts where tenant_id = $1) posts,
            (select count(*)::int from public.audit_logs where tenant_id = $1 and action like 'ministry_update.%') audits,
            (select count(*)::int from public.publication_policies where tenant_id = $1) policies,
            (select coalesce(string_agg(id::text || ':' || review_state || ':' || coalesce(title, ''), ',' order by id), '') from public.posts where tenant_id = $1) states`,
    [tenant],
  );
  return r.rows[0] as {
    posts: number;
    audits: number;
    policies: number;
    states: string;
  };
}
