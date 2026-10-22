// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getSentryCompatibilityOptions } from "../../../../packages/lib/monitoring/sentry-policy";

import type * as SentrySdk from "@sentry/nextjs";

const libraryRequire = createRequire(path.resolve("packages/lib/package.json"));
const nextPackageJson = libraryRequire.resolve("@sentry/nextjs/package.json");
const packageExports = JSON.parse(
  readFileSync(nextPackageJson, "utf8"),
).exports;
const browserEntry = path.resolve(
  path.dirname(nextPackageJson),
  packageExports["."].browser.require,
);
// Exercise the installed public browser export used by instrumentation-client,
// independently of Vitest's default Node export condition.
const Sentry = await vi.importActual<typeof SentrySdk>(browserEntry);
const originalUrl = window.location.href;

afterEach(async () => {
  await Sentry.close(1_000);
  window.history.replaceState({}, "", originalUrl);
  vi.restoreAllMocks();
});

describe("real Sentry browser HTTP context under Core's collection policy", () => {
  it("filters collected page queries and denies Referer before delivering a local envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the browser privacy fixture"),
    );
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://core.example.test/checkout?campaign=fall&jwt=referer-secret&remote-user=referer-user",
    );
    window.history.replaceState(
      {},
      "",
      "/reports?campaign=fall&jwt=page-secret&forwarded=page-ip",
    );
    const envelopes: unknown[] = [];
    Sentry.init({
      ...getSentryCompatibilityOptions(),
      dsn: "https://public@example.invalid/1",
      defaultIntegrations: false,
      integrations: [Sentry.httpContextIntegration()],
      transport: () => ({
        send: async (envelope: unknown) => {
          envelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });

    Sentry.captureMessage("local browser privacy fixture");
    await Sentry.flush(1_000);
    const events = envelopes.flatMap((envelope) => {
      const [, items] = envelope as [
        unknown,
        [
          Record<string, string>,
          { request?: { url?: string; headers?: Record<string, string> } },
        ][],
      ];
      return items
        .filter(([header]) => header.type === "event")
        .map(([, payload]) => payload);
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.request?.url).toBe(
      `${window.location.origin}/reports?campaign=fall&jwt=[Filtered]&forwarded=[Filtered]`,
    );
    expect(events[0]?.request?.headers?.Referer).toBe("[Filtered]");
    expect(JSON.stringify(envelopes)).not.toMatch(
      /page-secret|page-ip|referer-secret|referer-user/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
