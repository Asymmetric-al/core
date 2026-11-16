// Playwright API interception for the admin CRM + Contributions hillclimb.
//
// Plain Node ESM (node builtins only). Answers the browser's /api/admin/**
// requests from fixtures.json (regenerate with
// `bun docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts`).
//
//   import { installApiFixtures } from "./route-fixtures.mjs";
//   const fixtures = await installApiFixtures(page, { scenario: "populated" });
//   ...
//   console.log(fixtures.missing); // [{ method, url }] answered 404 "fixture missing"
//
// Query semantics mirror the server parsers in packages/api/src/admin/crm/**,
// packages/api/src/admin/contributions/query.ts and the notes/relationships
// models. State (created notes, table preferences, named views) lives per
// installApiFixtures() call, so each page/test starts from the same fixtures.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURES_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures.json",
);
const SCENARIOS = new Set(["populated", "empty", "error"]);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

let cachedBundle = null;

/** Reads fixtures.json once per process. */
export function loadFixtureBundle() {
  if (!cachedBundle) {
    cachedBundle = JSON.parse(readFileSync(FIXTURES_PATH, "utf8"));
  }
  return cachedBundle;
}

const clone = (value) => structuredClone(value);

// --- deterministic ids (same FNV-1a scheme as crm-contrib-fixtures.ts) -----

function fnv1a(input, seed) {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function fixtureUuid(key) {
  const hex = [0x811c9dc5, 0x01234567, 0x89abcdef, 0x5bd1e995]
    .map((seed) => fnv1a(key, seed).toString(16).padStart(8, "0"))
    .join("");
  const variant = "89ab"[Number.parseInt(hex.charAt(16), 16) % 4];
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// --- shared query helpers ----------------------------------------------------

function parseLimit(value, fallback = DEFAULT_LIMIT) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_LIMIT);
}

function parseSort(searchParams, supported, fallbackField) {
  const field = searchParams.get("sort");
  if (!field || !supported.includes(field)) {
    return { field: fallbackField, direction: "desc" };
  }
  return {
    field,
    direction: searchParams.get("dir") === "asc" ? "asc" : "desc",
  };
}

function getNormalizedValues(searchParams, key) {
  return Array.from(
    new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function encodeCursor(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(value) {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function compareValues(left, right) {
  if (typeof left === "number" && typeof right === "number")
    return left - right;
  return String(left).localeCompare(String(right));
}

/**
 * Keyset ordering like `ORDER BY col <dir> NULLS <first|last>, id <dir>`.
 * Returns negative when `a` comes first.
 */
function compareKeyset(a, b, direction, nullsFirst) {
  const sign = direction === "asc" ? 1 : -1;
  const aNull = a.value == null;
  const bNull = b.value == null;
  if (aNull !== bNull) return aNull === nullsFirst ? -1 : 1;
  if (!aNull) {
    const byValue = compareValues(a.value, b.value) * sign;
    if (byValue !== 0) return byValue;
  }
  return a.id.localeCompare(b.id) * sign;
}

function keysetPage(
  rows,
  { accessor, direction, nullsFirst, cursor, limit, field },
) {
  const keyed = rows.map((row) => ({
    row,
    key: { id: row.id, value: accessor(row) ?? null },
  }));
  keyed.sort((left, right) =>
    compareKeyset(left.key, right.key, direction, nullsFirst),
  );
  let start = 0;
  if (cursor && typeof cursor.id === "string") {
    const cursorKey = { id: cursor.id, value: cursor.value ?? null };
    start = keyed.findIndex(
      (entry) => compareKeyset(entry.key, cursorKey, direction, nullsFirst) > 0,
    );
    if (start < 0) start = keyed.length;
  }
  const page = keyed.slice(start, start + limit);
  const hasMore = start + limit < keyed.length;
  const last = page.at(-1);
  return {
    rows: page.map((entry) => entry.row),
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            id: last.key.id,
            field,
            direction,
            value: last.key.value,
          })
        : null,
  };
}

function offsetPage(rows, searchParams, limit) {
  const cursor = decodeCursor(searchParams.get("after"));
  const offset =
    cursor && Number.isInteger(cursor.offset) && cursor.offset >= 0
      ? cursor.offset
      : 0;
  const page = rows.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const hasMore = nextOffset < rows.length;
  return {
    rows: page,
    hasMore,
    nextCursor: hasMore ? encodeCursor({ offset: nextOffset }) : null,
  };
}

// --- CRM records ---------------------------------------------------------------

const CRM_SORT_FIELDS = [
  "updatedAt",
  "createdAt",
  "name",
  "recordType",
  "lifecycleStatus",
  "lifetimeGiving",
  "lastGiftAt",
];
const CRM_SORT_ACCESSORS = {
  updatedAt: (row) => row.updatedAt,
  createdAt: (row) => row.createdAt,
  name: (row) => row.displayName,
  recordType: (row) => row.recordType,
  lifecycleStatus: (row) => row.lifecycleStatus,
  lifetimeGiving: (row) => row.lifetimeGiving,
  lastGiftAt: (row) => row.lastGiftAt,
};

function listCrmRecords(rows, searchParams) {
  const limit = parseLimit(searchParams.get("limit"));
  const sort = parseSort(searchParams, CRM_SORT_FIELDS, "updatedAt");
  const hasPortalRaw = searchParams.get("hasPortal");
  const filters = {
    recordTypes: getNormalizedValues(searchParams, "recordType"),
    lifecycleStatuses: getNormalizedValues(searchParams, "status"),
    tags: getNormalizedValues(searchParams, "tag"),
    hasPortal:
      hasPortalRaw === "true" ? true : hasPortalRaw === "false" ? false : null,
  };
  // Server: `name|email|organization|phone ilike %term%` with %(), stripped.
  const search =
    searchParams
      .get("q")
      ?.trim()
      .replace(/[%(),]/g, " ")
      .toLowerCase() || null;

  const filtered = rows.filter((row) => {
    if (
      filters.recordTypes.length > 0 &&
      !filters.recordTypes.includes(row.recordType)
    )
      return false;
    if (
      filters.lifecycleStatuses.length > 0 &&
      !filters.lifecycleStatuses.includes(row.lifecycleStatus)
    )
      return false;
    if (
      filters.tags.length > 0 &&
      !row.tags.some((tag) => filters.tags.includes(tag))
    )
      return false;
    if (filters.hasPortal === true && !row.linkedAuthUserId) return false;
    if (filters.hasPortal === false && row.linkedAuthUserId) return false;
    if (search) {
      return [row.displayName, row.email, row.primaryOrganization, row.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    }
    return true;
  });

  const page = keysetPage(filtered, {
    accessor: CRM_SORT_ACCESSORS[sort.field],
    direction: sort.direction,
    // Server passes nullsFirst only for lastGiftAt ascending.
    nullsFirst: sort.field === "lastGiftAt" ? sort.direction === "asc" : false,
    cursor: decodeCursor(searchParams.get("after")),
    limit,
    field: sort.field,
  });

  return {
    rows: page.rows,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    limit,
    sort,
    filters,
  };
}

// --- CRM notes ---------------------------------------------------------------

function listCrmNotes(template, rows, searchParams) {
  const limit = parseLimit(searchParams.get("limit"));
  const sort = parseSort(
    searchParams,
    ["updatedAt", "createdAt", "title"],
    "updatedAt",
  );
  const search = searchParams.get("q")?.trim() || null;
  const needle = search?.toLowerCase() ?? "";
  const filtered = rows.filter((row) =>
    needle
      ? [
          row.title,
          row.body,
          row.bodyPreview,
          row.authorName,
          row.linkedRecordId,
          row.linkedRecordLabel,
          row.linkedRecordType,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))
      : true,
  );
  const direction = sort.direction === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((left, right) => {
    let compared;
    if (sort.field === "title")
      compared = (left.title ?? "").localeCompare(right.title ?? "");
    else if (sort.field === "createdAt")
      compared = Date.parse(left.createdAt) - Date.parse(right.createdAt);
    else compared = Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
    return compared !== 0
      ? compared * direction
      : left.id.localeCompare(right.id);
  });
  const page = offsetPage(sorted, searchParams, limit);
  return {
    ...template,
    rows: page.rows,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    limit,
    sort,
    filters: { search },
  };
}

function previewBody(body) {
  const singleLine = body.replace(/\s+/g, " ").trim();
  return singleLine.length <= 160
    ? singleLine
    : `${singleLine.slice(0, 157).trimEnd()}...`;
}

// --- CRM relationships -----------------------------------------------------------

const RELATIONSHIP_DOMAINS = [
  "people",
  "churches",
  "organizations",
  "households",
  "pledges",
  "activity",
];
const RELATIONSHIP_SORT_FIELDS = [
  "updatedAt",
  "createdAt",
  "displayName",
  "domain",
  "status",
  "lastActivityAt",
  "commitmentAmountCents",
];

function listCrmRelationships(template, rows, searchParams) {
  const limit = parseLimit(searchParams.get("limit"));
  const sort = parseSort(searchParams, RELATIONSHIP_SORT_FIELDS, "updatedAt");
  const search = searchParams.get("q")?.trim() || null;
  const domains = Array.from(
    new Set(
      searchParams
        .getAll("domain")
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter((value) => RELATIONSHIP_DOMAINS.includes(value)),
    ),
  );
  const selected = domains.length > 0 ? domains : RELATIONSHIP_DOMAINS;
  const needle = search?.toLowerCase() ?? "";
  const filtered = rows.filter((row) => {
    if (!selected.includes(row.domain)) return false;
    if (!needle) return true;
    return [
      row.displayName,
      row.primaryContactName,
      row.recordKind,
      row.relationshipKind,
      row.status,
      row.sourceSystem,
      row.secondaryLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const direction = sort.direction === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((left, right) => {
    let compared;
    switch (sort.field) {
      case "commitmentAmountCents":
        compared =
          (left.commitmentAmountCents ?? 0) -
          (right.commitmentAmountCents ?? 0);
        break;
      case "status":
      case "lastActivityAt":
        compared = (left[sort.field] ?? "").localeCompare(
          right[sort.field] ?? "",
        );
        break;
      default:
        compared = String(left[sort.field]).localeCompare(
          String(right[sort.field]),
        );
    }
    return compared !== 0
      ? compared * direction
      : left.id.localeCompare(right.id);
  });
  const page = offsetPage(sorted, searchParams, limit);
  return {
    ...template,
    rows: page.rows,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    limit,
    sort,
    filters: { search, domains },
  };
}

// --- Contributions hub -------------------------------------------------------------

const CONTRIBUTION_SORT_ACCESSORS = {
  giftDate: (row) => row.date,
  createdAt: (row) => row.createdAt,
  amount: (row) => row.amount,
  status: (row) => row.status,
  paymentMethod: (row) => row.paymentMethod,
  source: (row) => row.source,
};

function listContributions(template, rows, searchParams, defaultLimit) {
  const limit = parseLimit(searchParams.get("limit"), defaultLimit);
  const sort = parseSort(
    searchParams,
    Object.keys(CONTRIBUTION_SORT_ACCESSORS),
    "giftDate",
  );
  const page = keysetPage(rows, {
    accessor: CONTRIBUTION_SORT_ACCESSORS[sort.field],
    direction: sort.direction,
    nullsFirst: false,
    cursor: decodeCursor(searchParams.get("after")),
    limit,
    field: sort.field,
  });
  // Filters are echoed with the server's empty defaults; the page sends none.
  return {
    ...template,
    rows: page.rows,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    limit,
    sort,
  };
}

// --- Table preferences (mirrors applyCrmViewSettingsPatch) ---------------------------

function applySettingsPatch(existing, patch) {
  const next = { ...(existing ?? {}) };
  for (const key of [
    "columns",
    "filtersSort",
    "delegatedManagerProfileIds",
    "activeViewId",
  ]) {
    if (patch[key] === undefined) continue;
    if (patch[key] === null) delete next[key];
    else next[key] = patch[key];
  }
  return next;
}

function settingsPatchFromBody(body, { allowActiveView, allowDelegates }) {
  const patch = {};
  if (body.columns !== undefined) patch.columns = body.columns;
  if (body.filtersSort !== undefined) patch.filtersSort = body.filtersSort;
  if (allowDelegates && body.delegatedManagerProfileIds !== undefined) {
    patch.delegatedManagerProfileIds = body.delegatedManagerProfileIds;
  }
  if (allowActiveView && body.activeViewId !== undefined)
    patch.activeViewId = body.activeViewId;
  return patch;
}

function applyPreferenceLayer(layer, body, schemaVersion, options) {
  return {
    ...(layer ?? {}),
    actionId:
      body.pinnedActionId !== undefined
        ? body.pinnedActionId
        : (layer?.actionId ?? null),
    schemaVersion: layer?.schemaVersion ?? schemaVersion,
    settings: applySettingsPatch(
      layer?.settings ?? null,
      settingsPatchFromBody(body, options),
    ),
  };
}

// --- install -------------------------------------------------------------------------

/**
 * Intercepts /api/admin/** for `page` and answers from fixtures.json.
 *
 * @param {import("playwright-core").Page} page
 * @param {{
 *   scenario?: "populated" | "empty" | "error",
 *   latencyMs?: number,
 *   contributionsDefaultLimit?: number,
 *   logger?: Pick<Console, "warn">,
 *   bundle?: import("./crm-contrib-fixtures.ts").FixtureBundle,
 * }} [options]
 *   - latencyMs: artificial delay per fixture response (loading states).
 *   - contributionsDefaultLimit: limit used when the hub sends no `limit`
 *     (server default 50 of the 60 fixture gifts; pass 100 to see all 60).
 * @returns {Promise<{ missing: Array<{ method: string, url: string }>, handled: Array<{ method: string, url: string, status: number }>, state: object }>}
 */
export async function installApiFixtures(page, options = {}) {
  const {
    scenario = "populated",
    latencyMs = 0,
    contributionsDefaultLimit = DEFAULT_LIMIT,
    logger = console,
  } = options;
  if (!SCENARIOS.has(scenario)) {
    throw new Error(
      `Unknown fixture scenario "${scenario}" (expected populated | empty | error).`,
    );
  }

  const bundle = options.bundle ?? loadFixtureBundle();
  const populated = scenario === "populated";
  const endpoints = populated
    ? bundle.endpoints
    : { ...bundle.endpoints, ...bundle.empty };
  const state = {
    crmRecords: populated ? bundle.datasets.crmRecords : [],
    crmNotes: populated ? clone(bundle.datasets.crmNotes) : [],
    crmRelationships: populated ? bundle.datasets.crmRelationships : [],
    contributions: populated ? bundle.datasets.contributions : [],
    crmRecordDetails: populated
      ? bundle.details["GET /api/admin/crm/records/:recordId"]
      : {},
    contributionDetails: populated
      ? bundle.details["GET /api/admin/contribution-operations/:contributionId"]
      : {},
    tablePreferences: clone(endpoints["GET /api/admin/crm/table-preferences"]),
    namedViews: clone(
      endpoints["GET /api/admin/crm/table-preferences/views"].views,
    ),
    createdCount: 0,
  };
  const missing = [];
  const handled = [];
  let requestCounter = 0;
  const nextRequestId = () =>
    fixtureUuid(`fixture-request:${scenario}:${(requestCounter += 1)}`);
  // Deterministic clock for created records: just after the fixture reference date.
  const createdAt = () =>
    new Date(
      Date.parse(bundle.meta.referenceDate) +
        9 * 3_600_000 +
        state.createdCount * 60_000,
    ).toISOString();

  const json = (status, body) => ({ status, body });
  const withRequestId = (status, body) => ({
    status,
    body: { ...body, requestId: nextRequestId() },
  });

  /** Route table: [method, pattern, errorKey, handler]. First match wins. */
  const routes = [
    [
      "GET",
      /^\/api\/admin\/crm\/records$/,
      "GET /api/admin/crm/records",
      (ctx) => json(200, listCrmRecords(state.crmRecords, ctx.searchParams)),
    ],
    // Tenant-wide tag options (B's Tag filter); derived from the same records.
    [
      "GET",
      /^\/api\/admin\/crm\/tags$/,
      "GET /api/admin/crm/tags",
      () =>
        json(200, {
          tags: [
            ...new Set(state.crmRecords.flatMap((row) => row.tags ?? [])),
          ].sort((a, b) => a.localeCompare(b)),
        }),
    ],
    [
      "GET",
      /^\/api\/admin\/crm\/records\/([^/]+)$/,
      "GET /api/admin/crm/records/:recordId",
      (ctx) => {
        const detail = state.crmRecordDetails[ctx.params[0]];
        return detail
          ? withRequestId(200, detail)
          : withRequestId(404, { error: "CRM donor record not found." });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/crm\/notes$/,
      "GET /api/admin/crm/notes",
      (ctx) =>
        withRequestId(
          200,
          listCrmNotes(
            endpoints["GET /api/admin/crm/notes"],
            state.crmNotes,
            ctx.searchParams,
          ),
        ),
    ],
    [
      "POST",
      /^\/api\/admin\/crm\/notes$/,
      "POST /api/admin/crm/notes",
      (ctx) => {
        const input = ctx.body ?? {};
        const body = typeof input.body === "string" ? input.body.trim() : "";
        const title = typeof input.title === "string" ? input.title.trim() : "";
        if (!body)
          return withRequestId(400, { error: "Note body is required." });
        if (!title)
          return withRequestId(400, { error: "Note title is required." });
        state.createdCount += 1;
        const timestamp = createdAt();
        const note = {
          authorName: "Mission Control",
          body,
          bodyPreview: previewBody(body || title),
          createdAt: timestamp,
          id: fixtureUuid(`fixture-created-note:${state.createdCount}`),
          linkedRecordId: input.linkedRecordId?.trim?.() || null,
          linkedRecordLabel: input.linkedRecordLabel?.trim?.() || null,
          linkedRecordType: input.linkedRecordType ?? null,
          source: "local",
          tenantId: bundle.meta.tenantId,
          title,
          updatedAt: timestamp,
          visibility:
            input.visibility === "restricted" ? "restricted" : "standard",
        };
        state.crmNotes.push(note);
        return withRequestId(201, {
          note,
          commandLogId: fixtureUuid(
            `fixture-command-log:${state.createdCount}`,
          ),
          rollback: { existingCrmPath: "/crm" },
        });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/crm\/relationships$/,
      "GET /api/admin/crm/relationships",
      (ctx) =>
        withRequestId(
          200,
          listCrmRelationships(
            endpoints["GET /api/admin/crm/relationships"],
            state.crmRelationships,
            ctx.searchParams,
          ),
        ),
    ],
    [
      "GET",
      /^\/api\/admin\/crm\/table-preferences$/,
      "GET /api/admin/crm/table-preferences",
      (ctx) => {
        const tableId =
          ctx.searchParams.get("tableId") ?? state.tablePreferences.tableId;
        if (tableId !== state.tablePreferences.tableId)
          return withRequestId(400, {
            error: `Unknown table id "${tableId}".`,
          });
        return withRequestId(200, state.tablePreferences);
      },
    ],
    [
      "PUT",
      /^\/api\/admin\/crm\/table-preferences$/,
      "PUT /api/admin/crm/table-preferences",
      (ctx) => {
        const prefs = state.tablePreferences;
        prefs.user = applyPreferenceLayer(
          prefs.user,
          ctx.body ?? {},
          prefs.schemaVersion,
          { allowActiveView: true, allowDelegates: false },
        );
        return withRequestId(200, { user: prefs.user });
      },
    ],
    [
      "PUT",
      /^\/api\/admin\/crm\/table-preferences\/tenant-default$/,
      "PUT /api/admin/crm/table-preferences/tenant-default",
      (ctx) => {
        const prefs = state.tablePreferences;
        if (!prefs.canManageTenantDefaults) {
          return withRequestId(403, {
            error: "Forbidden: requires crm.gift_history.manage_view_defaults",
          });
        }
        prefs.tenantDefault = applyPreferenceLayer(
          prefs.tenantDefault,
          ctx.body ?? {},
          prefs.schemaVersion,
          { allowActiveView: false, allowDelegates: true },
        );
        return withRequestId(200, { tenantDefault: prefs.tenantDefault });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/crm\/table-preferences\/views$/,
      "GET /api/admin/crm/table-preferences/views",
      () =>
        withRequestId(200, {
          tableId: state.tablePreferences.tableId,
          views: state.namedViews,
        }),
    ],
    [
      "POST",
      /^\/api\/admin\/crm\/table-preferences\/views$/,
      "POST /api/admin/crm/table-preferences/views",
      (ctx) => {
        const input = ctx.body ?? {};
        const name = typeof input.name === "string" ? input.name.trim() : "";
        if (!name)
          return withRequestId(400, {
            error: "Too small: expected string to have >=1 characters",
          });
        state.createdCount += 1;
        const settings = {};
        if (input.columns != null) settings.columns = input.columns;
        if (input.filtersSort != null) settings.filtersSort = input.filtersSort;
        const view = {
          id: fixtureUuid(`fixture-created-view:${state.createdCount}`),
          name,
          isDefault: input.isDefault === true,
          schemaVersion: state.tablePreferences.schemaVersion,
          pinnedActionId: input.pinnedActionId ?? null,
          settings: Object.keys(settings).length > 0 ? settings : null,
        };
        if (view.isDefault)
          for (const existing of state.namedViews) existing.isDefault = false;
        state.namedViews.push(view);
        return withRequestId(200, { view });
      },
    ],
    [
      "PUT",
      /^\/api\/admin\/crm\/table-preferences\/views\/([^/]+)$/,
      "PUT /api/admin/crm/table-preferences/views/:viewId",
      (ctx) => {
        const view = state.namedViews.find(
          (candidate) => candidate.id === ctx.params[0],
        );
        if (!view)
          return withRequestId(404, { error: "Named view not found." });
        const input = ctx.body ?? {};
        if (typeof input.name === "string" && input.name.trim())
          view.name = input.name.trim();
        if (input.pinnedActionId !== undefined)
          view.pinnedActionId = input.pinnedActionId;
        if (input.columns !== undefined || input.filtersSort !== undefined) {
          view.settings = applySettingsPatch(
            view.settings,
            settingsPatchFromBody(input, {
              allowActiveView: false,
              allowDelegates: false,
            }),
          );
        }
        if (input.isDefault === true) {
          for (const existing of state.namedViews)
            existing.isDefault = existing.id === view.id;
        } else if (input.isDefault === false) {
          view.isDefault = false;
        }
        return withRequestId(200, { ok: true, view });
      },
    ],
    [
      "DELETE",
      /^\/api\/admin\/crm\/table-preferences\/views\/([^/]+)$/,
      "DELETE /api/admin/crm/table-preferences/views/:viewId",
      (ctx) => {
        const index = state.namedViews.findIndex(
          (candidate) => candidate.id === ctx.params[0],
        );
        if (index < 0)
          return withRequestId(404, { error: "Named view not found." });
        const [removed] = state.namedViews.splice(index, 1);
        const nextDefaultViewId = ctx.searchParams.get("nextDefaultViewId");
        if (removed.isDefault && nextDefaultViewId) {
          for (const view of state.namedViews)
            view.isDefault = view.id === nextDefaultViewId;
        }
        return withRequestId(200, { ok: true });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/contributions$/,
      "GET /api/admin/contributions",
      (ctx) =>
        json(
          200,
          listContributions(
            endpoints["GET /api/admin/contributions"],
            state.contributions,
            ctx.searchParams,
            contributionsDefaultLimit,
          ),
        ),
    ],
    [
      "GET",
      /^\/api\/admin\/contribution-operations\/(?!actions$)([^/]+)$/,
      "GET /api/admin/contribution-operations/:contributionId",
      (ctx) => {
        const contribution =
          state.contributionDetails[decodeURIComponent(ctx.params[0])];
        return contribution
          ? withRequestId(200, { contribution })
          : withRequestId(404, { error: "Contribution not found." });
      },
    ],
    [
      "GET",
      /^\/api\/admin\/mission-control\/needs-attention$/,
      "GET /api/admin/mission-control/needs-attention",
      () =>
        withRequestId(
          200,
          endpoints["GET /api/admin/mission-control/needs-attention"],
        ),
    ],
  ];

  await page.route("**/api/admin/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());

    for (const [routeMethod, pattern, errorKey, handler] of routes) {
      if (routeMethod !== method) continue;
      const match = pattern.exec(url.pathname);
      if (!match) continue;

      let result;
      if (scenario === "error") {
        // Endpoints added after the bundle was exported fail like the API.
        const spec = bundle.errors[errorKey] ?? {
          status: 500,
          body: { error: "Request failed." },
          withRequestId: true,
        };
        result = spec.withRequestId
          ? withRequestId(spec.status, spec.body)
          : json(spec.status, spec.body);
      } else {
        let body = null;
        try {
          body = request.postDataJSON();
        } catch {
          body = null;
        }
        result = handler({
          params: match.slice(1),
          searchParams: url.searchParams,
          body,
        });
      }

      if (latencyMs > 0)
        await new Promise((resolve) => setTimeout(resolve, latencyMs));
      handled.push({
        method,
        url: url.pathname + url.search,
        status: result.status,
      });
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        headers: { "x-fixture": `admin-workspaces-hillclimb/${scenario}` },
        body: JSON.stringify(result.body),
      });
      return;
    }

    missing.push({ method, url: url.pathname + url.search });
    logger.warn(
      `[api-fixtures] fixture missing: ${method} ${url.pathname}${url.search}`,
    );
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      headers: { "x-fixture": "missing" },
      body: JSON.stringify({ error: "fixture missing" }),
    });
  });

  return { missing, handled, state };
}
