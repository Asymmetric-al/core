/**
 * Parse/contract check for fixtures.json. Fails loudly (exit 1) on any problem.
 *
 *   bun docs/qa/admin-workspaces-hillclimb/fixtures/verify-fixtures.ts
 *
 * 1. fixtures.json is fresh (byte-identical to a rebuild) and deterministic.
 * 2. The consuming hooks do not zod-validate responses (they cast with `as`),
 *    so instead every id the UI sends back into a zod-validated server request
 *    body (`contributionId`/`stagedGiftId` on contribution actions,
 *    `activeViewId`, view ids, delegate profile ids) is parsed with the real
 *    zod `z.string().uuid()` the routes use, and with the client UUID_PATTERN
 *    that gates `?gift=`.
 * 3. Scenario invariants the hillclimb relies on (pagination, truncation,
 *    duplicates, split designations, chip coverage, cents, detail coverage).
 * 4. route-fixtures.mjs query handling, exercised with a fake Playwright page.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { matchesSharedContributionFilter } from "@asym/api/admin/contribution-shared";

import { z } from "../../../../packages/api/node_modules/zod";
import { buildFixtureBundle, type FixtureBundle } from "./crm-contrib-fixtures";
import { installApiFixtures } from "./route-fixtures.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..", "..");
const failures: string[] = [];
let checks = 0;

function check(condition: unknown, message: string) {
  checks += 1;
  if (!condition) failures.push(message);
}

// --- 1. freshness ------------------------------------------------------------
const onDisk = process.argv.includes("--stdin")
  ? readFileSync(0, "utf8")
  : readFileSync(join(here, "fixtures.json"), "utf8");
const rebuilt = `${JSON.stringify(buildFixtureBundle(), null, 1)}\n`;
const rebuiltAgain = `${JSON.stringify(buildFixtureBundle(), null, 1)}\n`;
check(rebuilt === rebuiltAgain, "buildFixtureBundle() is not deterministic");
check(onDisk === rebuilt, "fixtures.json is stale: rerun export-fixtures.ts");
const fx = JSON.parse(onDisk) as FixtureBundle;

// --- 2. hooks + zod -------------------------------------------------------------
const consumers = [
  "packages/database/hooks/admin-crm-infinite.ts",
  "packages/database/hooks/admin-crm-detail.ts",
  "packages/database/hooks/admin-crm-notes.ts",
  "packages/database/hooks/admin-crm-relationships.ts",
  "packages/database/hooks/admin-crm-table-preferences.ts",
  "packages/database/hooks/admin-crm-named-views.ts",
  "packages/database/hooks/mission-control-tasks.ts",
  "apps/admin/app/(app)/contributions/use-admin-contributions.ts",
  "apps/admin/app/(app)/contributions/contribution-detail-query.ts",
];
const zodConsumers = consumers.filter((file) =>
  /from\s+["']zod["']/.test(readFileSync(join(repoRoot, file), "utf8")),
);
check(
  zodConsumers.length === 0,
  `hooks now validate with zod, add schema parsing here: ${zodConsumers.join(", ")}`,
);

const uuid = z.string().uuid();
// apps/admin/app/(app)/contributions/contribution-detail-query.ts
const CLIENT_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function checkUuid(value: string | null | undefined, label: string) {
  if (value == null) return;
  check(uuid.safeParse(value).success, `${label} is not a zod uuid: ${value}`);
  check(
    CLIENT_UUID_PATTERN.test(value),
    `${label} fails client UUID_PATTERN: ${value}`,
  );
}

const hub = fx.datasets.contributions;
const crmDetails = fx.details["GET /api/admin/crm/records/:recordId"];
const contributionDetails =
  fx.details["GET /api/admin/contribution-operations/:contributionId"];

for (const row of hub) {
  checkUuid(row.id, "hub row id");
  checkUuid(row.stagedGiftId, "hub stagedGiftId");
}
for (const row of fx.datasets.crmRecords) checkUuid(row.id, "crm record id");
for (const detail of Object.values(crmDetails)) {
  for (const gift of detail.giftHistory) {
    checkUuid(gift.donationId, "gift history donationId");
    checkUuid(gift.stagedGiftId, "gift history stagedGiftId");
  }
}
for (const view of fx.endpoints["GET /api/admin/crm/table-preferences/views"]
  .views)
  checkUuid(view.id, "named view id");
for (const id of fx.endpoints["GET /api/admin/crm/table-preferences"]
  .tenantDefault?.settings?.delegatedManagerProfileIds ?? []) {
  // The demo-account cookie's profile id (1111...) is not RFC-variant; it is the
  // real viewer id the server would store, and the UI never sends delegates back.
  if (id === fx.meta.viewerProfileId) continue;
  checkUuid(id, "delegatedManagerProfileId");
}

// --- 3. invariants -----------------------------------------------------------------
const crmRows = fx.datasets.crmRecords;
check(
  crmRows.length >= 51 && crmRows.length <= 100,
  `CRM needs 2 pages of 50 (got ${crmRows.length})`,
);
check(
  fx.endpoints["GET /api/admin/crm/records"].hasMore,
  "CRM first page should report hasMore",
);
check(
  crmRows.every((row) => crmDetails[row.id]),
  "every CRM record needs a detail body",
);
check(
  crmRows.every((row) => Number.isInteger(row.lifetimeGiving)),
  "lifetimeGiving must be integer cents",
);

const truncated = Object.values(crmDetails).filter(
  (detail) => detail.giftHistoryTruncated,
);
check(
  truncated.length >= 1 &&
    truncated.every((detail) => detail.giftHistory.length === 100),
  "one record must hit the 100-gift cap",
);
check(
  Object.values(crmDetails).some(
    (detail) => detail.duplicateWarnings.length > 0,
  ),
  "need a duplicate warning",
);
check(
  Object.values(crmDetails).some((detail) =>
    detail.giftHistory.some(
      (gift) => gift.shared.designationSummary.lineCount > 1,
    ),
  ),
  "CRM gift history needs a split designation",
);

const giftIds = new Set<string>([
  ...hub.map((row) => row.id),
  ...Object.values(crmDetails).flatMap((detail) =>
    detail.giftHistory.map((gift) => gift.donationId),
  ),
  ...fx.endpoints[
    "GET /api/admin/mission-control/needs-attention"
  ].items.flatMap((item) => (item.contributionId ? [item.contributionId] : [])),
]);
for (const id of giftIds)
  check(contributionDetails[id], `no contribution detail for gift ${id}`);

check(hub.length === 60, `hub needs 60 gifts (got ${hub.length})`);
check(
  hub.every(
    (row) =>
      Number.isInteger(row.amount) && row.amount === row.shared.amountCents,
  ),
  "hub amounts must be integer cents",
);
check(
  hub.some((row) => row.amount === 1_250_000) &&
    hub.some((row) => row.amount === 500),
  "need 1,250,000 and 500 cent gifts",
);
const details = Object.values(contributionDetails);
check(
  details.some((detail) => detail.designations.lines.length === 3),
  "need a 3-line split",
);
check(
  details.some((detail) => detail.designations.lines.length === 2),
  "need a 2-line split",
);
check(
  details.some(
    (detail) =>
      !detail.designations.reconcilesToGiftAmount &&
      detail.designations.issues.length > 0,
  ),
  "need a designation mismatch",
);
const decidable = details.filter((detail) =>
  detail.correctionRequests.some(
    (request) => request.status === "pending" && request.viewerCanDecide,
  ),
);
check(
  decidable.length >= 2,
  `need 2 decidable pending correction requests (got ${decidable.length})`,
);
check(
  details.some((detail) =>
    detail.correctionRequests.some(
      (request) =>
        request.actionType === "refund" && request.status === "pending",
    ),
  ),
  "need a pending refund correction",
);
check(
  details.some((detail) =>
    detail.actionAvailability.some(
      (entry) =>
        entry.actionType === "refund" &&
        !entry.available &&
        entry.blockedReason,
    ),
  ),
  "need a blocked refund",
);
check(
  details.some((detail) =>
    detail.actionAvailability.some(
      (entry) => entry.actionType === "refund" && entry.available,
    ),
  ),
  "need an available refund",
);
check(
  details.some((detail) => detail.adjustments.length >= 2),
  "need revision history (2+ adjustments)",
);
check(
  details.some((detail) => detail.recurring.agreement !== null),
  "need a recurring agreement",
);
check(
  details.some((detail) => detail.providerProof !== null),
  "need provider proof",
);

const notes = fx.datasets.crmNotes;
check(notes.length >= 20, "need ~25 notes");
check(
  new Set(notes.map((note) => note.authorName)).size >= 4,
  "notes need mixed authors",
);
check(
  notes.some((note) => note.linkedRecordId) &&
    notes.some((note) => !note.linkedRecordId),
  "notes need linked and unlinked rows",
);

const relationships = fx.datasets.crmRelationships;
const relationshipDomains = new Set(relationships.map((row) => row.domain));
check(
  [
    "people",
    "organizations",
    "churches",
    "households",
    "pledges",
    "activity",
  ].every((domain) => relationshipDomains.has(domain as never)),
  "relationships must cover all domains",
);
check(
  relationships.some((row) => row.memberCount != null) &&
    relationships.some((row) => row.commitmentAmountCents != null),
  "relationships need memberCount and commitmentAmountCents",
);
check(
  fx.endpoints["GET /api/admin/mission-control/needs-attention"].groups
    .length >= 3,
  "need 3+ needs-attention groups",
);

// Hub chip coverage on the FIRST page (what the page actually renders).
const firstPage = fx.endpoints["GET /api/admin/contributions"].rows;
const facet = (
  values: string[],
  pick: (row: (typeof firstPage)[number]) => string,
) => {
  for (const value of values)
    check(
      firstPage.some((row) => pick(row) === value),
      `first hub page has no row for facet "${value}"`,
    );
};
facet(
  ["completed", "pending", "processing", "failed", "refunded"],
  (row) => row.status,
);
facet(["One-time", "Recurring", "Pledge", "In-kind"], (row) => row.type);
facet(
  ["Credit Card", "Bank Transfer", "Check", "Cash", "PayPal", "Other"],
  (row) => row.paymentMethod,
);
facet(
  ["Online", "Mobile", "In-person", "Mail", "Phone", "Import"],
  (row) => row.source,
);
facet(["sent", "pending", "failed", "not_sent"], (row) => row.receiptStatus);
const sharedChips = [
  { id: "receipt_affected" },
  { id: "pending_correction" },
  ...(["none", "pending", "applied"] as const).map((value) => ({
    id: "approval_state",
    value,
  })),
  ...(["none", "partial_refund", "refunded"] as const).map((value) => ({
    id: "refund_state",
    value,
  })),
  ...(["not_required", "queued", "posted", "failed", "blocked"] as const).map(
    (value) => ({ id: "crm_post_state", value }),
  ),
  ...(["agreement_linked", "provider_only", "none"] as const).map((value) => ({
    id: "recurring_link",
    value,
  })),
  ...(["completed", "pending", "failed", "refunded"] as const).map((value) => ({
    id: "payment_status",
    value,
  })),
] as Parameters<typeof matchesSharedContributionFilter>[1][];
for (const filter of sharedChips) {
  check(
    firstPage.some((row) =>
      matchesSharedContributionFilter({ shared: row.shared }, filter),
    ),
    `no first-page match for shared chip ${JSON.stringify(filter)}`,
  );
}

// --- 4. route-fixtures.mjs with a fake page ------------------------------------------
type Fulfilled = { status: number; body: Record<string, unknown> };
async function makeHarness(
  scenario: "populated" | "empty" | "error",
  options: Record<string, unknown> = {},
) {
  let handler: ((route: unknown) => Promise<void>) | null = null;
  const fakePage = {
    route: async (_glob: string, next: (route: unknown) => Promise<void>) => {
      handler = next;
    },
  };
  const warnings: string[] = [];
  const installed = await installApiFixtures(fakePage as never, {
    scenario,
    logger: { warn: (message: string) => warnings.push(message) },
    ...options,
    bundle: fx,
  });
  const call = async (
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Fulfilled> => {
    let fulfilled: Fulfilled | null = null;
    await handler!({
      request: () => ({
        method: () => method,
        url: () => `http://localhost:3030${path}`,
        postDataJSON: () => body ?? null,
      }),
      fulfill: async (response: { status: number; body: string }) => {
        fulfilled = {
          status: response.status,
          body: JSON.parse(response.body),
        };
      },
    });
    return fulfilled!;
  };
  return { call, warnings, installed };
}

const pop = await makeHarness("populated");
const page1 = await pop.call(
  "GET",
  "/api/admin/crm/records?limit=50&sort=updatedAt&dir=desc",
);
const page2 = await pop.call(
  "GET",
  `/api/admin/crm/records?limit=50&sort=updatedAt&dir=desc&after=${page1.body.nextCursor}`,
);
const page1Rows = page1.body.rows as Array<{ id: string }>;
const page2Rows = page2.body.rows as Array<{ id: string }>;
check(
  page1Rows.length === 50 && page1.body.hasMore === true,
  "route: CRM page 1 should be 50 rows with hasMore",
);
check(
  page2Rows.length === crmRows.length - 50 &&
    page2.body.hasMore === false &&
    page2.body.nextCursor === null,
  "route: CRM page 2 should hold the remainder",
);
check(
  new Set([...page1Rows, ...page2Rows].map((row) => row.id)).size ===
    crmRows.length,
  "route: CRM pages overlap or drop rows",
);
const search = await pop.call(
  "GET",
  "/api/admin/crm/records?limit=50&sort=updatedAt&dir=desc&q=MBEKI",
);
check(
  (search.body.rows as unknown[]).length === 2,
  "route: q=MBEKI should match Daniel + Dan Mbeki",
);
const byOrg = await pop.call(
  "GET",
  "/api/admin/crm/records?q=kim%20%26%20associates",
);
check(
  (byOrg.body.rows as unknown[]).length === 1,
  "route: q should match organization",
);
const byPhone = await pop.call("GET", "/api/admin/crm/records?q=919");
check(
  (byPhone.body.rows as unknown[]).length === 2,
  "route: q should match phone",
);
const churches = await pop.call(
  "GET",
  "/api/admin/crm/records?recordType=Church&status=active&hasPortal=false",
);
check(
  (churches.body.rows as Array<{ recordType: string }>).every(
    (row) => row.recordType === "Church",
  ) && (churches.body.rows as unknown[]).length === 5,
  "route: recordType/status/hasPortal filters",
);
const tagged = await pop.call(
  "GET",
  "/api/admin/crm/records?tag=monthly-donor&tag=foundation",
);
check(
  (tagged.body.rows as Array<{ tags: string[] }>).every(
    (row) =>
      row.tags.includes("monthly-donor") || row.tags.includes("foundation"),
  ),
  "route: tag overlap filter",
);
const byGiving = await pop.call(
  "GET",
  "/api/admin/crm/records?sort=lifetimeGiving&dir=desc&limit=3",
);
const giving = (byGiving.body.rows as Array<{ lifetimeGiving: number }>).map(
  (row) => row.lifetimeGiving,
);
check(
  giving[0]! >= giving[1]! && giving[1]! >= giving[2]!,
  "route: lifetimeGiving desc sort",
);
const byLastGiftAsc = await pop.call(
  "GET",
  "/api/admin/crm/records?sort=lastGiftAt&dir=asc&limit=1",
);
check(
  (byLastGiftAsc.body.rows as Array<{ lastGiftAt: string | null }>)[0]
    ?.lastGiftAt === null,
  "route: lastGiftAt asc puts nulls first",
);
const nameAsc = await pop.call(
  "GET",
  "/api/admin/crm/records?sort=name&dir=asc&limit=100",
);
const names = (nameAsc.body.rows as Array<{ displayName: string }>).map(
  (row) => row.displayName,
);
check(
  names.every(
    (name, index) => index === 0 || names[index - 1]!.localeCompare(name) <= 0,
  ),
  "route: name asc sort",
);

const notesBefore = await pop.call(
  "GET",
  "/api/admin/crm/notes?limit=50&sort=updatedAt&dir=desc",
);
const created = await pop.call("POST", "/api/admin/crm/notes", {
  title: "Donor care note: Grace Kim",
  body: "Called to confirm the matching gift.",
  linkedRecordId: crmRows[0]!.id,
  linkedRecordType: "donor_profile",
  visibility: "standard",
});
const notesAfter = await pop.call(
  "GET",
  "/api/admin/crm/notes?limit=50&sort=updatedAt&dir=desc",
);
check(
  created.status === 201 && typeof created.body.requestId === "string",
  "route: POST note should be 201 with requestId",
);
check(
  (notesAfter.body.rows as Array<{ id: string }>)[0]?.id ===
    (created.body.note as { id: string }).id,
  "route: created note should lead the next GET",
);
check(
  (notesAfter.body.rows as unknown[]).length ===
    (notesBefore.body.rows as unknown[]).length + 1,
  "route: GET after POST should include the note",
);
const badNote = await pop.call("POST", "/api/admin/crm/notes", {
  title: "x",
  body: "  ",
});
check(badNote.status === 400, "route: empty note body should 400");
const noteSearch = await pop.call("GET", "/api/admin/crm/notes?q=borehole");
check((noteSearch.body.rows as unknown[]).length >= 1, "route: notes q");

const relDomain = await pop.call(
  "GET",
  "/api/admin/crm/relationships?limit=50&sort=updatedAt&dir=desc&domain=pledges&domain=households",
);
check(
  (relDomain.body.rows as Array<{ domain: string }>).every(
    (row) => row.domain === "pledges" || row.domain === "households",
  ) && (relDomain.body.rows as unknown[]).length > 0,
  "route: relationships domain filter",
);
const relSearch = await pop.call(
  "GET",
  "/api/admin/crm/relationships?q=okafor",
);
check((relSearch.body.rows as unknown[]).length >= 1, "route: relationships q");

const hubDefault = await pop.call("GET", "/api/admin/contributions");
check(
  (hubDefault.body.rows as unknown[]).length === 50 &&
    hubDefault.body.hasMore === true,
  "route: hub default limit is the server's 50",
);
const hubAll = await makeHarness("populated", {
  contributionsDefaultLimit: 100,
});
check(
  (
    (await hubAll.call("GET", "/api/admin/contributions")).body
      .rows as unknown[]
  ).length === 60,
  "route: contributionsDefaultLimit=100 returns all 60",
);

const detail = await pop.call(
  "GET",
  `/api/admin/contribution-operations/${hub[0]!.id}`,
);
check(
  detail.status === 200 &&
    (detail.body.contribution as { id: string }).id === hub[0]!.id,
  "route: contribution detail",
);
const crmDetail = await pop.call(
  "GET",
  `/api/admin/crm/records/${crmRows[0]!.id}`,
);
check(
  crmDetail.status === 200 && typeof crmDetail.body.requestId === "string",
  "route: crm detail",
);
const prefsPut = await pop.call("PUT", "/api/admin/crm/table-preferences", {
  tableId: "crm.giftHistory",
  activeViewId: fx.meta.keyIds.namedViewId,
});
const prefsGet = await pop.call(
  "GET",
  "/api/admin/crm/table-preferences?tableId=crm.giftHistory",
);
check(
  prefsPut.status === 200 &&
    (prefsGet.body.user as { settings: { activeViewId?: string } }).settings
      .activeViewId === fx.meta.keyIds.namedViewId,
  "route: table-preferences PUT persists",
);
const viewPost = await pop.call(
  "POST",
  "/api/admin/crm/table-preferences/views",
  { tableId: "crm.giftHistory", name: "Large gifts" },
);
const viewId = (viewPost.body.view as { id: string }).id;
checkUuid(viewId, "created named view id");
await pop.call("PUT", `/api/admin/crm/table-preferences/views/${viewId}`, {
  tableId: "crm.giftHistory",
  isDefault: true,
});
await pop.call(
  "DELETE",
  `/api/admin/crm/table-preferences/views/${viewId}?tableId=crm.giftHistory`,
);
const viewsAfter = await pop.call(
  "GET",
  "/api/admin/crm/table-preferences/views?tableId=crm.giftHistory",
);
check(
  (viewsAfter.body.views as unknown[]).length === 1,
  "route: named view create/update/delete round trip",
);
const unknown = await pop.call("GET", "/api/admin/funds");
check(
  unknown.status === 404 &&
    unknown.body.error === "fixture missing" &&
    pop.warnings.length === 1,
  "route: unknown endpoints 404 + warn",
);

const empty = await makeHarness("empty");
const emptyRecords = await empty.call("GET", "/api/admin/crm/records");
const emptyRel = await empty.call("GET", "/api/admin/crm/relationships");
check(
  (emptyRecords.body.rows as unknown[]).length === 0 &&
    (emptyRel.body.report as { totalRows: number }).totalRows === 0,
  "route: empty scenario lists/counts",
);
check(
  (await empty.call("GET", `/api/admin/contribution-operations/${hub[0]!.id}`))
    .status === 404,
  "route: empty scenario details 404",
);

const error = await makeHarness("error");
const errorRecords = await error.call("GET", "/api/admin/crm/records");
const errorNotes = await error.call("GET", "/api/admin/crm/notes");
check(
  errorRecords.status === 500 &&
    errorRecords.body.error === "Failed to load CRM records." &&
    !("requestId" in errorRecords.body),
  "route: error scenario records (no requestId)",
);
check(
  errorNotes.status === 500 && typeof errorNotes.body.requestId === "string",
  "route: error scenario withOperation routes include requestId",
);

// --- result --------------------------------------------------------------------------
if (failures.length > 0) {
  console.error(
    `verify-fixtures: ${failures.length} of ${checks} checks FAILED`,
  );
  for (const failure of failures) console.error(`  x ${failure}`);
  process.exit(1);
}
console.log(
  `verify-fixtures: all ${checks} checks passed (hooks: no zod; ids: zod uuid + client UUID_PATTERN)`,
);
