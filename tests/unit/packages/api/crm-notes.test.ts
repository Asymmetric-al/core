import { describe, expect, it, vi } from "vitest";

import { normalizeTwentyNotesResponse } from "../../../../packages/api/src/admin/crm/notes/model";
import {
  createMissionControlCrmNote,
  listMissionControlCrmNotes,
} from "../../../../packages/api/src/admin/crm/notes/service";
import { MemoryCrmSyncStore } from "./crm-sync-test-store";

import type { ActorContext } from "../../../../packages/api/src/crm/types";

const actor: ActorContext = {
  action: "crm.note.read",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
  profileId: "profile-1",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
};

const syncConfig = {
  inboundEnabled: false,
  outboundEnabled: true,
  replayEnabled: true,
  reconciliationEnabled: true,
  webhookToleranceSeconds: 300,
};

describe("CRM notes Mission Control domain", () => {
  it("normalizes Twenty note responses without leaking cross-tenant rows", async () => {
    const coreClient = {
      listRecords: vi.fn(async () => ({
        data: {
          notes: [
            {
              asymTenantId: "tenant-2",
              body: "Other tenant note",
              createdAt: "2026-05-01T10:00:00.000Z",
              id: "note-cross-tenant",
              title: "Hidden",
              updatedAt: "2026-05-01T10:00:00.000Z",
            },
            {
              asymTenantId: "tenant-1",
              body: "Follow up about annual pledge",
              createdAt: "2026-05-01T10:00:00.000Z",
              id: "note-1",
              title: "Pledge follow-up",
              updatedAt: "2026-05-02T10:00:00.000Z",
            },
          ],
        },
      })),
    };

    const response = await listMissionControlCrmNotes({
      actor,
      coreClient,
      env: {
        TWENTY_API_KEY: "secret",
        TWENTY_API_URL: "https://twenty.example.test/rest",
      },
      params: {
        cursor: null,
        limit: 50,
        search: "pledge",
        sort: {
          direction: "desc",
          field: "updatedAt",
        },
      },
    });

    expect(response.mode).toBe("twenty");
    expect(response.rows.map((row) => row.id)).toEqual(["note-1"]);
    expect(coreClient.listRecords).toHaveBeenCalledWith(
      "notes",
      expect.objectContaining({
        filter: expect.stringContaining("tenant-1"),
      }),
    );
  });

  it("returns queue-only mode when Twenty reads are not configured", async () => {
    const response = await listMissionControlCrmNotes({
      actor,
      params: {
        cursor: null,
        limit: 50,
        search: null,
        sort: {
          direction: "desc",
          field: "updatedAt",
        },
      },
    });

    expect(response).toMatchObject({
      configured: false,
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      mode: "not_configured",
      rows: [],
    });
  });

  it("queues note writes with command audit and replayable outbound state", async () => {
    const store = new MemoryCrmSyncStore();
    const logCommand = vi.fn(async () => ({
      id: "command-log-1",
      ok: true as const,
    }));

    const result = await createMissionControlCrmNote({
      actor: {
        ...actor,
        action: "crm.note.create",
      },
      commandClient: {} as never,
      input: {
        body: "Met after Sunday service.",
        title: "Church partner note",
      },
      logCommand,
      now: new Date("2026-05-08T12:00:00.000Z"),
      requestId: "request-1",
      store,
      syncConfig,
    });

    const job = await store.loadOutboundJob(result.outboundJobId);

    expect(logCommand).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "crm.note.create",
        resourceType: "note",
        status: "queued",
      }),
    );
    expect(job).toMatchObject({
      domain: "notes",
      jobType: "create",
      status: "queued",
      tenantId: "tenant-1",
      twentyObjectName: "notes",
    });
    expect(job?.payload).toMatchObject({
      asymTenantId: "tenant-1",
      body: "Met after Sunday service.",
      title: "Church partner note",
    });
    expect(result.note).toMatchObject({
      outboundJobId: result.outboundJobId,
      source: "queued",
    });
    expect(result.replay.outboundJobId).toBe(result.outboundJobId);
    expect(store.logs).toContainEqual(
      expect.objectContaining({
        direction: "outbound",
        domain: "notes",
        sourceId: result.outboundJobId,
      }),
    );
  });

  it("keeps malformed Twenty notes out of the native read model", () => {
    expect(
      normalizeTwentyNotesResponse({
        notes: [
          { asymTenantId: "tenant-1", title: "Missing id" },
          { id: "note-1", title: "Missing tenant" },
        ],
      }),
    ).toEqual([]);
  });
});
