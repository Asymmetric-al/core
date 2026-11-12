import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  FIXTURE_ID,
  FIXTURE_SERVICE_KEY,
  FIXTURE_TENANT_ID,
} from "./server.mjs";

const [baseUrl, runId, dataSha256, ...extra] = process.argv.slice(2);
const target = new URL(baseUrl ?? "about:blank");
if (
  extra.length ||
  target.protocol !== "http:" ||
  target.hostname !== "127.0.0.1" ||
  Number(target.port) < 1024 ||
  target.origin !== baseUrl ||
  !/^[0-9a-f-]{36}$/.test(runId ?? "") ||
  !/^[0-9a-f]{64}$/.test(dataSha256 ?? "") ||
  process.env.NEXT_PUBLIC_SUPABASE_URL !== baseUrl ||
  process.env.SUPABASE_SERVICE_ROLE_KEY !== FIXTURE_SERVICE_KEY ||
  !["test", "development"].includes(process.env.NODE_ENV ?? "") ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_TARGET_ENV
) {
  throw new Error(
    "Use only the declared loopback fixture and its public synthetic credential in a local process.",
  );
}

const nativeFetch = globalThis.fetch;
const transport: Array<{ method: string; path: string; status: number }> = [];
globalThis.fetch = async (input, options) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const method =
    options?.method ?? (input instanceof Request ? input.method : "GET");
  if (
    url.origin !== baseUrl ||
    !url.pathname.startsWith("/rest/v1/") ||
    !["GET", "HEAD"].includes(method)
  ) {
    throw new Error(
      "The probe refuses non-fixture URLs, writes and auth requests.",
    );
  }
  const response = await nativeFetch(input, {
    ...options,
    redirect: "error",
    signal: options?.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(3000)])
      : AbortSignal.timeout(3000),
  });
  if (
    response.headers.get("x-core-qa-fixture") !== FIXTURE_ID ||
    response.headers.get("x-core-qa-fixture-run") !== runId ||
    response.headers.get("x-core-qa-fixture-sha256") !== dataSha256 ||
    response.headers.get("x-core-qa-fixture-scenario") !== "loaded"
  ) {
    throw new Error(
      "HTTP response does not match the declared synthetic fixture run.",
    );
  }
  transport.push({ method, path: url.pathname, status: response.status });
  return response;
};

const proofResponse = await fetch(
  `${baseUrl}/rest/v1/donors?select=id&tenant_id=eq.${FIXTURE_TENANT_ID}`,
  {
    method: "HEAD",
    headers: {
      apikey: FIXTURE_SERVICE_KEY,
      authorization: `Bearer ${FIXTURE_SERVICE_KEY}`,
      prefer: "count=exact",
    },
  },
);
const fixtureAsOf = proofResponse.headers.get("x-core-qa-fixture-as-of");
if (
  !proofResponse.ok ||
  fixtureAsOf?.slice(0, 7) !== new Date().toISOString().slice(0, 7)
) {
  throw new Error(
    "The live-clock dashboard read needs a loaded fixture in its current UTC month.",
  );
}

const { getDashboardStats } =
  await import("../../../../../../../packages/api/src/reads/dashboard-stats.ts");
const stats = await getDashboardStats(FIXTURE_TENANT_ID);
if (
  stats.revenueThisMonthCents !== 25000 ||
  stats.givingTrend.currency !== "USD" ||
  stats.givingTrend.months.length !== 13 ||
  transport.length !== 7 ||
  transport.some((entry) => entry.status !== 200)
) {
  throw new Error(
    "The unmodified server read did not satisfy the loaded fixture contract.",
  );
}

const sourceSha256: Record<string, string> = {};
for (const relative of [
  "server.mjs",
  "probe.ts",
  "../../../../../../../packages/api/src/reads/dashboard-stats.ts",
  "../../../../../../../packages/database/supabase/admin.ts",
]) {
  sourceSha256[relative] = createHash("sha256")
    .update(await readFile(new URL(relative, import.meta.url)))
    .digest("hex");
}
console.log(
  JSON.stringify({
    fixtureId: FIXTURE_ID,
    baseUrl,
    runId,
    dataSha256,
    fixtureAsOf,
    observedAt: new Date().toISOString(),
    adminFactory: "unmocked",
    transport,
    sourceSha256,
    stats,
  }),
);
