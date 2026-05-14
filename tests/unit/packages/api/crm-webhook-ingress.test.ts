import { describe, expect, it } from "vitest";

import { receiveTwentyWebhook } from "../../../../packages/api/src/crm/webhooks/twenty";
import {
  signTwentyWebhookPayload,
  TWENTY_WEBHOOK_SIGNATURE_HEADER,
  TWENTY_WEBHOOK_TIMESTAMP_HEADER,
} from "../../../../packages/api/src/crm/webhooks/signature";
import { MemoryCrmSyncStore } from "./crm-sync-test-store";

const secret = "twenty-webhook-secret";
const timestamp = "2026-05-08T00:00:00.000Z";

function signedHeaders(rawBody: string) {
  return new Headers({
    [TWENTY_WEBHOOK_TIMESTAMP_HEADER]: timestamp,
    [TWENTY_WEBHOOK_SIGNATURE_HEADER]: signTwentyWebhookPayload(
      rawBody,
      timestamp,
      secret,
    ),
  });
}

function signedHeadersWithPrefix(rawBody: string) {
  return new Headers({
    [TWENTY_WEBHOOK_TIMESTAMP_HEADER]: timestamp,
    [TWENTY_WEBHOOK_SIGNATURE_HEADER]: `sha256=${signTwentyWebhookPayload(
      rawBody,
      timestamp,
      secret,
    )}`,
  });
}

function body(event: string, data: Record<string, unknown>) {
  return JSON.stringify({
    event,
    data,
    timestamp,
  });
}

describe("Twenty webhook ingress", () => {
  it("requires the server-side webhook secret before persisting signed deliveries", async () => {
    const store = new MemoryCrmSyncStore();
    const rawBody = body("person.updated", {
      id: "twenty-person-1",
      asymTenantId: "tenant-1",
    });

    const result = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret: null,
      store,
    });

    expect(result).toMatchObject({
      ok: false,
      status: 500,
      code: "missing_secret",
    });
    expect(store.events.size).toBe(0);
  });

  it("stores accepted events before idempotent processing", async () => {
    const store = new MemoryCrmSyncStore();
    const rawBody = body("person.updated", {
      id: "twenty-person-1",
      asymTenantId: "tenant-1",
    });

    const result = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret,
      store,
    });

    expect(result).toMatchObject({
      ok: true,
      duplicate: false,
      status: "processed",
    });
    expect(store.events.size).toBe(1);
    expect(store.appliedEvents).toEqual(["event-1"]);
    expect(store.events.get("event-1")?.status).toBe("processed");

    const duplicate = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret,
      store,
    });

    expect(duplicate).toMatchObject({
      ok: true,
      duplicate: true,
      status: "duplicate",
    });
    expect(store.events.size).toBe(1);
    expect(store.appliedEvents).toEqual(["event-1"]);
  });

  it("accepts provider-style sha256-prefixed signatures and still dedupes repeated delivery", async () => {
    const store = new MemoryCrmSyncStore();
    const rawBody = body("giftSummaries.updated", {
      id: "twenty-gift-1",
      asymTenantId: "tenant-1",
    });

    const first = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: false },
      headers: signedHeadersWithPrefix(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret,
      store,
    });
    const second = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: false },
      headers: signedHeadersWithPrefix(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret,
      store,
    });

    expect(first).toMatchObject({
      ok: true,
      duplicate: false,
      status: "queued",
    });
    expect(second).toMatchObject({
      ok: true,
      duplicate: true,
      status: "duplicate",
    });
    expect(store.events.size).toBe(1);
  });

  it("keeps ignored events distinct from failed events", async () => {
    const store = new MemoryCrmSyncStore();
    const ignoredBody = body("opportunity.updated", {
      id: "opportunity-1",
      asymTenantId: "tenant-1",
    });

    const ignored = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(ignoredBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody: ignoredBody,
      secret,
      store,
    });

    expect(ignored).toMatchObject({
      ok: true,
      status: "ignored",
      ignoredReason: "unsupported_object",
    });
    expect(store.events.get("event-1")?.status).toBe("ignored");

    const failedBody = body("person.updated", {
      id: "twenty-person-1",
    });
    const failed = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(failedBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody: failedBody,
      secret,
      store,
    });

    expect(failed).toMatchObject({
      ok: false,
      status: 409,
    });
    expect(store.events.get("event-2")?.status).toBe("failed");
  });

  it("stores accepted events as paused without applying them when inbound sync is paused", async () => {
    const store = new MemoryCrmSyncStore();
    store.pause.people = {
      inboundPaused: true,
      pausedReason: "operator_pause",
    };
    const rawBody = body("person.updated", {
      id: "twenty-person-1",
      asymTenantId: "tenant-1",
    });

    const result = await receiveTwentyWebhook({
      env: { CRM_SYNC_INBOUND_ENABLED: true },
      headers: signedHeaders(rawBody),
      now: new Date("2026-05-08T00:01:00.000Z"),
      rawBody,
      secret,
      store,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "paused",
      ignoredReason: "operator_pause",
    });
    expect(store.events.get("event-1")?.status).toBe("paused");
    expect(store.appliedEvents).toEqual([]);
  });
});
