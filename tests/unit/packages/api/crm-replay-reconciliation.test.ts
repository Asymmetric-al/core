import { describe, expect, it } from "vitest";

import { runCrmReconciliation } from "../../../../packages/api/src/crm/reconciliation/run";
import {
  replayInboundWebhookEvent,
  replayOutboundJob,
} from "../../../../packages/api/src/crm/sync/replay";
import { MemoryCrmSyncStore } from "./crm-sync-test-store";

const config = {
  inboundEnabled: true,
  outboundEnabled: true,
  replayEnabled: true,
  reconciliationEnabled: true,
  webhookToleranceSeconds: 300,
};

describe("CRM replay and reconciliation", () => {
  it("replays inbound events and outbound jobs without duplicating durable records", async () => {
    const store = new MemoryCrmSyncStore();
    const event = await store.storeInboundEvent({
      action: "updated",
      domain: "people",
      eventKey: "event-key-1",
      eventType: "person.updated",
      objectName: "person",
      payload: {
        event: "person.updated",
        data: { id: "twenty-person-1", asymTenantId: "tenant-1" },
        timestamp: "2026-05-08T00:00:00.000Z",
      },
      payloadHash: "payload-hash",
      recordId: "twenty-person-1",
      signatureHash: "signature-hash",
      tenantId: "tenant-1",
      timestamp: new Date("2026-05-08T00:00:00.000Z"),
    });
    const job = await store.enqueueOutboundJob({
      tenantId: "tenant-1",
      domain: "people",
      jobType: "create",
      twentyObjectName: "people",
      idempotencyKey: "job-key-1",
      payload: { name: "Ada" },
    });

    await replayInboundWebhookEvent(store, config, event);
    await replayOutboundJob(store, config, { ...job, status: "failed" });

    expect(store.events.size).toBe(1);
    expect(store.jobs.size).toBe(1);
    expect(store.events.get(event.id)?.status).toBe("processed");
    expect(store.jobs.get(job.id)?.status).toBe("queued");
    expect(store.appliedEvents).toEqual([event.id]);
  });

  it("honors replay pause controls", async () => {
    const store = new MemoryCrmSyncStore();
    store.pause.people = {
      replayPaused: true,
      pausedReason: "operator_pause",
    };
    const event = await store.storeInboundEvent({
      action: "updated",
      domain: "people",
      eventKey: "event-key-1",
      eventType: "person.updated",
      objectName: "person",
      payload: {
        event: "person.updated",
        data: { id: "twenty-person-1", asymTenantId: "tenant-1" },
        timestamp: "2026-05-08T00:00:00.000Z",
      },
      payloadHash: "payload-hash",
      recordId: "twenty-person-1",
      signatureHash: "signature-hash",
      tenantId: "tenant-1",
      timestamp: new Date("2026-05-08T00:00:00.000Z"),
    });

    const replayed = await replayInboundWebhookEvent(store, config, event);

    expect(replayed.status).toBe("paused");
    expect(store.appliedEvents).toEqual([]);
  });

  it("records reconciliation findings for orphan links, stale projections, stalled jobs, duplicate candidates, and failed webhooks", async () => {
    const store = new MemoryCrmSyncStore();
    store.snapshot = {
      orphanLinks: [{ id: "link-1", reason: "active_link_without_last_seen" }],
      staleProjections: [{ id: "projection-1", reason: "stale_projection" }],
      stalledJobs: [{ id: "job-1", reason: "stalled_job" }],
      duplicateCandidates: [{ id: "duplicate-1", reason: "pending_duplicate" }],
      failedWebhooks: [{ id: "webhook-1", reason: "failed_webhook" }],
      giftLinkDrift: [{ id: "gift-link-1", reason: "gift_link_failed" }],
    };

    const run = await runCrmReconciliation(store, config, {
      tenantId: "tenant-1",
      domain: "people",
      requestedByProfileId: "profile-1",
    });

    expect(run.status).toBe("succeeded");
    expect(run.checkedCounts).toEqual({
      duplicateCandidates: 1,
      failedWebhooks: 1,
      giftLinkDrift: 1,
      orphanLinks: 1,
      staleProjections: 1,
      stalledJobs: 1,
    });
    expect(store.logs.at(-1)).toMatchObject({
      direction: "reconciliation",
      status: "failed",
      message: expect.stringContaining("operator review"),
    });
  });
});
