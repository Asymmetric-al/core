import { queryJson } from "../../release/lib/postgres.mjs";

export const SITE_PRESENTATION_TABLES_SQL = `SELECT json_build_object(
  'presentations', to_regclass('cms.site_presentations') IS NOT NULL,
  'sites', to_regclass('public.sites') IS NOT NULL
)::text;`;

export const SITE_PRESENTATIONS_SQL = `SELECT coalesce(json_agg(json_build_object(
  'id', p.id::text, 'tenant', p.tenant) ORDER BY p.id), '[]'::json)::text
FROM cms.site_presentations AS p;`;

export const SITES_SQL = `SELECT coalesce(json_agg(json_build_object(
  'id', s.id::text, 'tenantId', s.tenant_id::text) ORDER BY s.id), '[]'::json)::text
FROM public.sites AS s;`;

const UUID_TEXT =
  /^(\{)?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})(\})?$/i;

export function uuidKey(value) {
  if (typeof value !== "string") return null;
  const match = UUID_TEXT.exec(value);
  if (!match || Boolean(match[1]) !== Boolean(match[7])) return null;
  return match.slice(2, 7).join("-").toLowerCase();
}

export function readSitePresentationState({ databaseUrl, query = queryJson }) {
  const tables = query({
    databaseUrl,
    sql: SITE_PRESENTATION_TABLES_SQL,
    label: "find the Site presentation tables",
  });
  if (!tables?.presentations) {
    return { presentationsTable: false, presentations: [], sites: [] };
  }
  const presentations = query({
    databaseUrl,
    sql: SITE_PRESENTATIONS_SQL,
    label: "read the Site presentations",
  });
  const sites = tables.sites
    ? query({ databaseUrl, sql: SITES_SQL, label: "read the Sites" })
    : [];
  return { presentationsTable: true, presentations, sites };
}

export function judgeSitePresentations({ presentations, sites }) {
  const siteTenants = new Map();
  for (const site of sites) {
    const id = uuidKey(site.id);
    if (id !== null) siteTenants.set(id, site.tenantId);
  }
  const presented = new Set();
  const orphans = [];
  const mismatches = [];
  for (const presentation of presentations) {
    const id = uuidKey(presentation.id);
    presented.add(id);
    if (id === null || !siteTenants.has(id)) {
      orphans.push({ id: presentation.id, tenant: presentation.tenant });
      continue;
    }
    const siteTenant = siteTenants.get(id);
    const expected = uuidKey(siteTenant);
    if (expected === null || uuidKey(presentation.tenant) !== expected) {
      mismatches.push({
        id: presentation.id,
        tenant: presentation.tenant,
        siteTenant,
      });
    }
  }
  const missing = [];
  for (const site of sites) {
    const id = uuidKey(site.id);
    const tenantId = uuidKey(site.tenantId);
    if (id !== null && tenantId !== null && !presented.has(id)) {
      missing.push({ id, tenantId });
    }
  }
  return { orphans, mismatches, missing };
}

export function describeSitePresentationProblems({ orphans, mismatches }) {
  return [
    ...orphans.map(
      (presentation) =>
        `presentation ${presentation.id} (tenant ${presentation.tenant}) has no Site in public.sites`,
    ),
    ...mismatches.map(
      (presentation) =>
        `presentation ${presentation.id} is under tenant ${presentation.tenant}, but its Site belongs to tenant ${presentation.siteTenant}`,
    ),
  ].join("; ");
}
