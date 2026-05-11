import { describe, expect, it, vi } from "vitest";

import { TwentyCoreClient } from "../../../../packages/api/src/crm/client/core";
import {
  buildCrmOutboundIdempotencyKey,
  enqueueCrmOutboundJob,
  processCrmOutboundJob,
} from "../../../../packages/api/src/crm/sync/outbound";
import { MemoryCrmSyncStore } from "./crm-sync-test-store";

const outboundConfig = {
  inboundEnabled: false,
  outboundEnabled: true,
  replayEnabled: true,
  reconciliationEnabled: false,
  webhookToleranceSeconds: 300,
};

describe("CRM outbound sync queue", () => {
  it("builds stable idempotency keys and dedupes queued writes", async () => {
    const store = new MemoryCrmSyncStore();
    const input = {
      tenantId: "tenant-1",
      domain: "people" as const,
      jobType: "upsert" as const,
      twentyObjectName: "people",
      sourceEntityType: "donor_profile" as const,
      sourceEntityId: "donor-1",
      payload: {
        name: "Ada Lovelace",
        primaryEmail: "ada@example.test",
      },
    };

    expect(buildCrmOutboundIdempotencyKey(input)).toBe(
      buildCrmOutboundIdempotencyKey({
        ...input,
        payload: {
          primaryEmail: "ada@example.test",
          name: "Ada Lovelace",
        },
      }),
    );

    const first = await enqueueCrmOutboundJob(store, outboundConfig, input);
    const duplicate = await enqueueCrmOutboundJob(store, outboundConfig, input);

    expect(first.id).toBe(duplicate.id);
    expect(store.jobs.size).toBe(1);
    expect(first.idempotencyKey).toMatch(/^crm:/);
  });

  it("marks queued writes paused when the domain is paused", async () => {
    const store = new MemoryCrmSyncStore();
    store.pause.people = {
      outboundPaused: true,
      pausedReason: "maintenance",
    };

    const job = await enqueueCrmOutboundJob(store, outboundConfig, {
      tenantId: "tenant-1",
      domain: "people",
      jobType: "create",
      twentyObjectName: "people",
      payload: { name: "Ada" },
    });

    expect(job).toMatchObject({
      status: "paused",
      lastError: "maintenance",
    });
  });

  it("processes jobs with idempotency and dead-letters exhausted retries", async () => {
    const store = new MemoryCrmSyncStore();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ id: "person-1" }))
      .mockImplementation(async () =>
        Response.json({ error: "down" }, { status: 500 }),
      );
    const client = new TwentyCoreClient({
      apiBaseUrl: "https://twenty.example.test/rest",
      apiKey: "twenty-secret",
      fetchImpl,
    });

    const job = await enqueueCrmOutboundJob(store, outboundConfig, {
      tenantId: "tenant-1",
      domain: "people",
      jobType: "create",
      twentyObjectName: "people",
      payload: { name: "Ada" },
    });
    const processed = await processCrmOutboundJob(
      store,
      client,
      outboundConfig,
      job,
    );

    expect(processed.status).toBe("succeeded");
    expect(
      new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get("idempotency-key"),
    ).toBe(job.idempotencyKey);

    const failedJob = await enqueueCrmOutboundJob(store, outboundConfig, {
      tenantId: "tenant-1",
      domain: "people",
      jobType: "create",
      twentyObjectName: "people",
      payload: { name: "Grace" },
      maxAttempts: 1,
    });
    const failed = await processCrmOutboundJob(
      store,
      client,
      outboundConfig,
      failedJob,
    );

    expect(failed.status).toBe("dead_letter");
    expect(failed.lastError).toMatch(/status 500/);
  });
});
