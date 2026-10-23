import { randomUUID } from "node:crypto";

import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSentryCompatibilityOptions } from "../../../../packages/lib/monitoring/sentry-policy";

describe("Sentry request collection with Core's compatibility policy", () => {
  const envelopes: unknown[] = [];
  // Default ContextLines may capture fixture source; runtime sentinels must not
  // also appear as literals in that source or its assertion expressions.
  const hookSecret = randomUUID();
  const refererSecret = randomUUID();

  beforeEach(() => {
    envelopes.length = 0;
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the Sentry privacy fixture"),
    );
    Sentry.init({
      ...getSentryCompatibilityOptions(),
      dsn: "https://public@example.invalid/1",
      transport: () => ({
        send: async (envelope: unknown) => {
          envelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });
  });

  afterEach(async () => {
    await Sentry.close(1_000);
    vi.restoreAllMocks();
  });

  it("does not inherit permissive MCP or queue payload collection defaults", () => {
    const collection = Sentry.getClient()?.getDataCollectionOptions();
    expect(collection?.mcp).toEqual({ inputs: false, outputs: false });
    expect(collection?.queues).toBe(false);
  });

  async function captureRequest(headers: Record<string, string>) {
    Sentry.captureEvent({
      message: "local request privacy fixture",
      sdkProcessingMetadata: {
        normalizedRequest: {
          method: "GET",
          url: "https://core.example.test/reports?campaign=fall&jwt=request-secret&forwarded=request-ip",
          query_string: "campaign=fall&jwt=request-secret&forwarded=request-ip",
          headers,
        },
      },
    });
    await Sentry.flush(1_000);

    const event = envelopes.flatMap((envelope) => {
      const [, items] = envelope as [
        unknown,
        [Record<string, string>, { request?: Record<string, unknown> }][],
      ];
      return items
        .filter(([header]) => header.type === "event")
        .map(([, payload]) => payload);
    })[0];
    expect(event).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
    return event?.request;
  }

  it("filters sensitive URL/query values, cookies and IP headers while retaining useful request context", async () => {
    const request = await captureRequest({
      authorization: "Bearer authorization-secret",
      cookie: "session=cookie-secret",
      "x-forwarded-for": "203.0.113.7",
      "content-type": "application/json",
    });

    expect(request?.url).toBe(
      "https://core.example.test/reports?campaign=fall&jwt=[Filtered]&forwarded=[Filtered]",
    );
    expect(request?.query_string).toBe(
      "campaign=fall&jwt=[Filtered]&forwarded=[Filtered]",
    );
    expect(request?.headers).toEqual({
      authorization: "[Filtered]",
      "content-type": "application/json",
    });
    expect(request).not.toHaveProperty("cookies");
    expect(request?.data).toBeUndefined();
    expect(JSON.stringify(envelopes)).not.toMatch(
      /request-secret|request-ip|authorization-secret|cookie-secret|203\.0\.113\.7/,
    );
  });

  it.each(["referer", "Referer", "referrer"])(
    "filters %s on the same captureRequestError path exported by every app",
    async (header) => {
      // Keep the production SDK defaults enabled; the custom transport retains
      // actual emitted envelopes locally without sending fixture telemetry.
      expect(
        Sentry.getDefaultIntegrations({}).some(
          (integration) => integration.name === "RequestData",
        ),
      ).toBe(true);
      Sentry.captureRequestError(
        new Error("local Next request-error fixture"),
        {
          method: "GET",
          path: `/reports?campaign=fall&jwt=${hookSecret}`,
          headers: {
            [header]: `https://core.example.test/checkout?campaign=fall&jwt=${refererSecret}`,
            "content-type": "application/json",
          },
        },
        {
          routerKind: "App Router",
          routePath: "/reports",
          routeType: "render",
        },
      );
      await Sentry.flush(1_000);

      const serialized = JSON.stringify(envelopes);
      expect(serialized).toContain(
        '"referer":"[Filtered]"'.replace("referer", header),
      );
      expect(serialized).toContain("/reports?campaign=fall&jwt=[Filtered]");
      expect(serialized).not.toContain(hookSecret);
      expect(serialized).not.toContain(refererSecret);
      expect(serialized).toContain("application/json");
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
