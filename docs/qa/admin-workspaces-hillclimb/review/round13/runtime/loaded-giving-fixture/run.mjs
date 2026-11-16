import { parseArgs } from "node:util";

import { startDashboardHttpFixture } from "./server.mjs";

if (
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_TARGET_ENV
) {
  throw new Error(
    "This helper is only for local synthetic QA, not deployed runtimes.",
  );
}
const { values } = parseArgs({
  options: {
    "as-of": { type: "string" },
    "lifetime-ms": { type: "string", default: "900000" },
    "max-requests": { type: "string", default: "256" },
    scenario: { type: "string", default: "loaded" },
  },
  strict: true,
  allowPositionals: false,
});
const fixture = await startDashboardHttpFixture({
  asOf: values["as-of"],
  lifetimeMs: Number(values["lifetime-ms"]),
  maxRequests: Number(values["max-requests"]),
  scenario: values.scenario,
});
const stop = () => void fixture.close();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
console.log(JSON.stringify({ event: "started", fixture: fixture.proof }));
await fixture.closed;
process.removeListener("SIGINT", stop);
process.removeListener("SIGTERM", stop);
console.log(
  JSON.stringify({
    event: "closed",
    fixture: fixture.proof,
    requests: fixture.requests,
  }),
);
