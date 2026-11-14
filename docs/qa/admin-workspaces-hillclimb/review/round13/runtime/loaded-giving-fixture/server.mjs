import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";

export const FIXTURE_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const FIXTURE_SERVICE_KEY =
  "round13-local-synthetic-service-key-not-a-secret";
export const FIXTURE_ID = "round13-loaded-giving-v1";

const GIFT_SELECT =
  "id,amount,refund_amount,currency,status,gift_date,created_at";
const ADJUSTMENT_SELECT =
  "id,donation_id,adjustment_type,status,effective_values,reason,actor_profile_id,source_surface,created_at";
const OTHER_TENANT = "00000000-0000-0000-0000-000000000099";
const MONTH_TOTALS = [
  125000, 142500, 137500, 168000, 155000, 181000, 174000, 192500, 210000,
  205000, 223000, 240000,
];

function rowId(group, index) {
  return `${group}0000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function monthStart(asOf, offset) {
  const date = new Date(asOf);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1),
  ).toISOString();
}

function buildRows(asOf) {
  const donations = MONTH_TOTALS.flatMap((total, index) =>
    [25000, 40000, total - 65000].map((amount, giftIndex) => ({
      id: rowId("1", index * 3 + giftIndex + 1),
      tenant_id: FIXTURE_TENANT_ID,
      amount,
      refund_amount: 0,
      currency: "USD",
      status: ["completed", "succeeded", "success"][giftIndex],
      gift_date: null,
      created_at: new Date(
        Date.parse(monthStart(asOf, index - 12)) + giftIndex * 7 * 86400000,
      ).toISOString(),
    })),
  );
  donations.push(
    ...[10000, 6000, 12000, 5000].map((amount, index) => ({
      id: rowId("1", 37 + index),
      tenant_id: FIXTURE_TENANT_ID,
      amount,
      refund_amount: index === 0 ? 1000 : index === 3 ? 5000 : 0,
      currency: "USD",
      status: ["completed", "succeeded", "success", "completed"][index],
      gift_date: null,
      created_at: monthStart(asOf, 0),
    })),
  );
  const sample = donations.at(-1);
  donations.push(
    { ...sample, id: rowId("1", 41), amount: 900000, status: "pending" },
    { ...sample, id: rowId("1", 42), amount: 800000, status: "failed" },
    { ...sample, id: rowId("1", 43), amount: 700000, status: "canceled" },
    {
      ...sample,
      id: rowId("1", 44),
      amount: 800000,
      created_at: monthStart(asOf, -13),
    },
    { ...sample, id: rowId("1", 45), amount: 9000000, tenant_id: OTHER_TENANT },
  );
  const correction = {
    id: rowId("2", 1),
    tenant_id: FIXTURE_TENANT_ID,
    donation_id: rowId("1", 37),
    adjustment_type: "amount_correction",
    status: "applied",
    effective_values: { amountCents: 8000 },
    reason: "Synthetic QA amount correction, not a provider operation.",
    actor_profile_id: rowId("3", 1),
    source_surface: "qa_fixture",
    created_at: monthStart(asOf, 0),
  };
  return {
    donors: Array.from({ length: 49 }, (_, index) => ({
      id: rowId("4", index + 1),
      tenant_id: index < 48 ? FIXTURE_TENANT_ID : OTHER_TENANT,
    })),
    missionaries: Array.from({ length: 13 }, (_, index) => ({
      id: rowId("5", index + 1),
      tenant_id: index < 12 ? FIXTURE_TENANT_ID : OTHER_TENANT,
    })),
    funds: Array.from({ length: 7 }, (_, index) => ({
      id: rowId("6", index + 1),
      tenant_id: index < 6 ? FIXTURE_TENANT_ID : OTHER_TENANT,
      is_active: index < 4 || index === 6,
    })),
    donations,
    contribution_adjustments: [
      correction,
      {
        ...correction,
        id: rowId("2", 2),
        status: "reversed",
        effective_values: { amountCents: 999999 },
      },
      {
        ...correction,
        id: rowId("2", 3),
        tenant_id: OTHER_TENANT,
        effective_values: { amountCents: 999999 },
      },
      {
        ...correction,
        id: rowId("2", 4),
        donation_id: rowId("1", 44),
        effective_values: { amountCents: 999999 },
      },
    ],
  };
}

function reject(status, message) {
  throw Object.assign(new Error(message), { status });
}

function inDashboardWindow(row, start) {
  return row.gift_date == null
    ? row.created_at >= start
    : row.gift_date >= start.slice(0, 10);
}

function dashboardRows(request, url, tables, asOf) {
  const table = url.pathname.slice("/rest/v1/".length);
  if (!url.pathname.startsWith("/rest/v1/") || !Object.hasOwn(tables, table))
    reject(404, "Only dashboard fixture tables are available.");
  const params = url.searchParams;
  if (params.get("tenant_id") !== `eq.${FIXTURE_TENANT_ID}`)
    reject(403, "An exact fixture tenant predicate is required.");
  const allowed = new Set(["select", "tenant_id"]);
  const add = (...keys) => keys.forEach((key) => allowed.add(key));
  let rows = tables[table].filter((row) => row.tenant_id === FIXTURE_TENANT_ID);
  const select = (params.get("select") ?? "").replaceAll(" ", "");
  if (request.method === "HEAD") {
    if (
      table === "donations" ||
      table === "contribution_adjustments" ||
      select !== "id" ||
      request.headers.prefer !== "count=exact"
    )
      reject(400, "Dashboard counts require HEAD, select=id and count=exact.");
  } else {
    if (table !== "donations" && table !== "contribution_adjustments")
      reject(405, "This dashboard table only supports HEAD counts.");
    add("offset", "limit", "order");
    const offset = params.get("offset");
    const limit = params.get("limit");
    if (
      !/^\d+$/.test(offset ?? "") ||
      !/^\d+$/.test(limit ?? "") ||
      Number(offset) > 10000 ||
      Number(limit) < 1 ||
      Number(limit) > 1000
    )
      reject(400, "An explicit bounded offset/limit is required.");
    if (request.headers.prefer && request.headers.prefer !== "count=exact")
      reject(400, "Unsupported read preference.");
  }
  if (table === "funds") {
    add("is_active");
    if (params.get("is_active") !== "eq.true")
      reject(400, "Active funds must be filtered explicitly.");
    rows = rows.filter((row) => row.is_active);
  }
  if (table === "donations") {
    add("or");
    const start = monthStart(asOf, -12);
    if (
      params.get("or") !==
      `(gift_date.gte.${start.slice(0, 10)},and(gift_date.is.null,created_at.gte.${start}))`
    )
      reject(400, "The fixture requires the declared UTC dashboard window.");
    if (select !== GIFT_SELECT || params.get("order") !== "id.asc")
      reject(400, "Unsupported gift candidate projection or order.");
    rows = rows.filter((row) => inDashboardWindow(row, start));
  }
  if (table === "contribution_adjustments") {
    add("status", "donation_id");
    if (
      select !== ADJUSTMENT_SELECT ||
      params.get("status") !== "eq.applied" ||
      params.get("order") !== "created_at.asc,id.asc"
    )
      reject(400, "Only applied, ordered dashboard corrections are supported.");
    const filter = params.get("donation_id") ?? "";
    if (!/^in\.\([0-9a-f,-]+\)$/.test(filter))
      reject(400, "A bounded donation ID set is required.");
    const ids = filter.slice(4, -1).split(",");
    const visibleIds = new Set(
      tables.donations
        .filter(
          (row) =>
            row.tenant_id === FIXTURE_TENANT_ID &&
            inDashboardWindow(row, monthStart(asOf, -12)),
        )
        .map((row) => row.id),
    );
    if (ids.length > 150 || ids.some((id) => !visibleIds.has(id)))
      reject(403, "Correction IDs must belong to loaded fixture gifts.");
    rows = rows.filter(
      (row) => row.status === "applied" && ids.includes(row.donation_id),
    );
  }
  for (const key of params.keys()) {
    if (!allowed.has(key) || params.getAll(key).length !== 1)
      reject(400, "Unsupported or repeated dashboard query parameter.");
  }
  rows.sort(
    (left, right) =>
      (table === "contribution_adjustments"
        ? left.created_at.localeCompare(right.created_at)
        : 0) || left.id.localeCompare(right.id),
  );
  const total = rows.length;
  const offset = Number(params.get("offset") ?? 0);
  const limit = Number(params.get("limit") ?? 1000);
  const columns = select.split(",");
  return {
    table,
    total,
    offset,
    rows: rows
      .slice(offset, offset + limit)
      .map((row) =>
        Object.fromEntries(columns.map((column) => [column, row[column]])),
      ),
  };
}

export async function startDashboardHttpFixture({
  asOf = "",
  host = "127.0.0.1",
  port = 0,
  lifetimeMs = 900000,
  maxRequests = 256,
  scenario = "loaded",
} = {}) {
  if (host !== "127.0.0.1")
    throw new Error("The fixture may bind only 127.0.0.1.");
  if (
    typeof asOf !== "string" ||
    !Number.isFinite(Date.parse(asOf)) ||
    new Date(asOf).toISOString() !== asOf
  )
    throw new Error("An explicit canonical UTC asOf timestamp is required.");
  if (
    !Number.isInteger(port) ||
    port < 0 ||
    port > 65535 ||
    (port > 0 && port < 1024)
  )
    throw new Error(
      "Use an unprivileged loopback port, or zero for an ephemeral port.",
    );
  if (
    !Number.isInteger(lifetimeMs) ||
    lifetimeMs < 1 ||
    lifetimeMs > 900000 ||
    !Number.isInteger(maxRequests) ||
    maxRequests < 1 ||
    maxRequests > 1024
  )
    throw new Error("Fixture lifetime and request budget must be bounded.");
  if (scenario !== "loaded" && scenario !== "adjustments-unavailable")
    throw new Error("Unsupported fixture scenario.");
  const tables = buildRows(asOf);
  const proof = {
    fixtureId: FIXTURE_ID,
    runId: randomUUID(),
    asOf,
    scenario,
    tenantId: FIXTURE_TENANT_ID,
    dataSha256: createHash("sha256")
      .update(JSON.stringify(tables))
      .digest("hex"),
    syntheticOnly: true,
    lifetimeMs,
    maxRequests,
  };
  const requests = [];
  const server = createServer({ maxHeaderSize: 16384 }, (request, response) => {
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("x-core-qa-fixture", FIXTURE_ID);
    response.setHeader("x-core-qa-fixture-run", proof.runId);
    response.setHeader("x-core-qa-fixture-sha256", proof.dataSha256);
    response.setHeader("x-core-qa-fixture-as-of", asOf);
    response.setHeader("x-core-qa-fixture-scenario", scenario);
    let result;
    let url;
    let status = 200;
    let body;
    try {
      if (requests.length >= maxRequests)
        reject(429, "Fixture request budget exhausted.");
      if (
        request.socket.remoteAddress !== "127.0.0.1" ||
        request.headers.host !== `127.0.0.1:${server.address().port}` ||
        request.headers.origin ||
        Object.keys(request.headers).some(
          (name) => name.startsWith("x-forwarded-") || name === "forwarded",
        )
      )
        reject(403, "Only direct loopback server requests are allowed.");
      if (request.method !== "GET" && request.method !== "HEAD")
        reject(405, "The fixture is read-only.");
      if (
        request.headers.authorization !== `Bearer ${FIXTURE_SERVICE_KEY}` ||
        request.headers.apikey !== FIXTURE_SERVICE_KEY
      )
        reject(
          401,
          "Only the public synthetic fixture credential is accepted.",
        );
      if (
        request.headers["accept-profile"] &&
        request.headers["accept-profile"] !== "public"
      )
        reject(403, "Only the public fixture schema is available.");
      if (request.headers.range || request.headers["range-unit"])
        reject(
          400,
          "Only the dashboard SDK offset/limit query paging is supported.",
        );
      if (
        request.headers.accept &&
        !["*/*", "application/json"].includes(request.headers.accept)
      )
        reject(406, "Only dashboard JSON array responses are supported.");
      if (
        request.headers["transfer-encoding"] ||
        Number(request.headers["content-length"] ?? 0) !== 0 ||
        (request.url?.length ?? 0) > 16384 ||
        !request.url?.startsWith("/") ||
        request.url.startsWith("//")
      )
        reject(400, "Unsupported dashboard request framing.");
      url = new URL(request.url, "http://127.0.0.1");
      result = dashboardRows(request, url, tables, asOf);
      if (
        scenario === "adjustments-unavailable" &&
        result.table === "contribution_adjustments"
      )
        reject(503, "Synthetic dashboard corrections unavailable.");
      const end = result.offset + result.rows.length - 1;
      response.setHeader("range-unit", "items");
      response.setHeader(
        "content-range",
        `${result.rows.length ? `${result.offset}-${end}` : "*"}/${request.headers.prefer === "count=exact" ? result.total : "*"}`,
      );
      if (request.headers.prefer === "count=exact")
        response.setHeader("preference-applied", "count=exact");
      body = result.rows;
    } catch (error) {
      status = error.status ?? 500;
      body = {
        code: "CORE_QA_FIXTURE",
        message: error.status ? error.message : "Fixture request failed.",
        details: null,
        hint: null,
      };
      if (status === 405) response.setHeader("allow", "GET, HEAD");
    }
    if (requests.length < maxRequests)
      requests.push({
        sequence: requests.length + 1,
        method: request.method,
        path: url?.pathname ?? null,
        query:
          result && status === 200
            ? Object.fromEntries(url.searchParams)
            : null,
        tenantId:
          url?.searchParams.get("tenant_id") === `eq.${FIXTURE_TENANT_ID}`
            ? FIXTURE_TENANT_ID
            : null,
        status,
        rowCount: status === 200 ? (result?.rows.length ?? 0) : 0,
        total: status === 200 ? (result?.total ?? null) : null,
        contentRange: response.getHeader("content-range") ?? null,
        runId: proof.runId,
        dataSha256: proof.dataSha256,
      });
    response.writeHead(status);
    response.end(request.method === "HEAD" ? undefined : JSON.stringify(body));
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.keepAliveTimeout = 1000;
  const closed = new Promise((resolveClosed) =>
    server.once("close", resolveClosed),
  );
  await new Promise((resolve, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let closing;
  const close = () => {
    clearTimeout(expiry);
    closing ??= new Promise((resolve, rejectClose) => {
      server.close((error) => (error ? rejectClose(error) : resolve()));
      server.closeAllConnections();
    });
    return closing;
  };
  const expiry = setTimeout(() => void close(), lifetimeMs);
  expiry.unref();
  return { baseUrl, proof: { ...proof, baseUrl }, requests, close, closed };
}
