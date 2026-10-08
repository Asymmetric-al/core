import * as Sentry from "@sentry/nextjs";
import { afterEach, describe, expect, it } from "vitest";

import {
  captureError,
  captureMessage,
  clearUserContext,
  setUserContext,
} from "../../../../packages/lib/monitoring/sentry";
import { getSentryCompatibilityOptions } from "../../../../packages/lib/monitoring/sentry-policy";

afterEach(async () => {
  await Sentry.close(1_000);
});

describe("shared Sentry capture with a local transport", () => {
  it("links captured errors to the release and tenant without sending to a provider", async () => {
    const envelopes: unknown[] = [];
    Sentry.init({
      ...getSentryCompatibilityOptions(),
      dsn: "https://public@example.invalid/1",
      release: "al-1965-fixture-release",
      defaultIntegrations: false,
      transport: () => ({
        send: async (envelope) => {
          envelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });

    setUserContext("fixture-user", "fixture-tenant", "admin");
    captureError(new Error("fixture capture"), {
      requestId: "fixture-request",
    });
    await Sentry.flush(1_000);
    clearUserContext();
    captureMessage("fixture info");
    await Sentry.flush(1_000);

    const serialized = JSON.stringify(envelopes);
    expect(serialized).toContain("al-1965-fixture-release");
    expect(serialized).toContain("fixture capture");
    expect(serialized).toContain("fixture-request");
    expect(serialized).toContain('"tenant_id":"fixture-tenant"');
    expect(serialized).toContain('"user_role":"admin"');
    const events = envelopes.flatMap((envelope) => {
      const [, items] = envelope as [
        unknown,
        [Record<string, string>, Record<string, unknown>][],
      ];
      return items
        .filter(([header]) => header.type === "event")
        .map(([, payload]) => payload);
    });
    expect(events).toHaveLength(2);
    expect(events[0]?.user).toEqual({ id: "fixture-user" });
    expect(
      (events[1]?.user as { id?: string } | undefined)?.id,
    ).toBeUndefined();
    expect(events[1]?.exception).toBeUndefined();
    expect(events[1]?.message).toBe("fixture info");
  });
});
