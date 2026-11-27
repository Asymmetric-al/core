import { describe, expect, it, vi } from "vitest";

import { createMissionControlCrmNote } from "../../src/admin/crm/notes/service";

import type { ActorContext } from "../../src/crm/types";

const TENANT = "11111111-1111-4111-8111-111111111111";
const KEY = "22222222-2222-4222-8222-222222222222";
const REQUEST = "33333333-3333-4333-8333-333333333333";
const NOTE = "44444444-4444-4444-8444-444444444444";

const actor: ActorContext = {
  action: "crm.note.create",
  authTenantId: TENANT,
  isTenantAdministrator: false,
  profileId: "profile-from-session",
  role: "staff",
  tenantId: TENANT,
  userId: "user-from-session",
};

function stored(overrides: Record<string, unknown> = {}) {
  return {
    author_name: "Mission Control",
    author_profile_id: "profile-from-session",
    body: "Summary",
    created_at: "2026-11-23T00:00:00.000Z",
    id: NOTE,
    idempotency_key: KEY,
    linked_record_id: null,
    linked_record_label: null,
    linked_record_type: null,
    tenant_id: TENANT,
    title: "Meeting",
    updated_at: "2026-11-23T00:00:00.000Z",
    visibility: "standard",
    ...overrides,
  };
}

function client(reply: { data?: unknown; error?: unknown }) {
  return {
    rpc: vi.fn().mockResolvedValue({
      data: reply.data ?? null,
      error: reply.error ?? null,
    }),
  };
}

describe("createMissionControlCrmNote", () => {
  it("calls the one command with the submission key, the request ID and no actor", async () => {
    const supabase = client({
      data: { note: stored(), commandLogId: "log-1", duplicate: false },
    });
    const response = await createMissionControlCrmNote({
      actor,
      idempotencyKey: KEY,
      input: {
        body: "  Summary ",
        linkedRecordId: " donor-1 ",
        linkedRecordLabel: " Donor ",
        linkedRecordType: "donor_profile",
        title: " Meeting ",
      },
      requestId: REQUEST,
      supabase,
    });
    expect(supabase.rpc).toHaveBeenCalledExactlyOnceWith("create_crm_note", {
      p_body: "Summary",
      p_idempotency_key: KEY,
      p_linked_record_id: "donor-1",
      p_linked_record_label: "Donor",
      p_linked_record_type: "donor_profile",
      p_request_id: REQUEST,
      p_tenant_id: TENANT,
      p_title: "Meeting",
      p_visibility: "standard",
    });
    expect(response).toMatchObject({
      commandLogId: "log-1",
      duplicate: false,
      note: { id: NOTE, source: "local", title: "Meeting" },
    });
  });

  it("returns the stored note for a retried submission", async () => {
    const supabase = client({
      data: { note: stored(), commandLogId: "log-1", duplicate: true },
    });
    const response = await createMissionControlCrmNote({
      actor,
      idempotencyKey: KEY,
      input: { body: "Summary", title: "Meeting" },
      requestId: REQUEST,
      supabase,
    });
    expect(response).toMatchObject({
      commandLogId: "log-1",
      duplicate: true,
      note: { id: NOTE },
    });
  });

  it("leaves the restricted rule to the database and explains its refusal", async () => {
    const supabase = client({
      error: {
        code: "42501",
        message:
          "tenant_guard: a restricted CRM note needs the tenant-administrator flag",
      },
    });
    await expect(
      createMissionControlCrmNote({
        actor,
        idempotencyKey: KEY,
        input: { body: "Summary", title: "Meeting", visibility: "restricted" },
        supabase,
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: "Restricted CRM notes require the tenant-administrator flag.",
    });
    expect(supabase.rpc).toHaveBeenCalledOnce();
  });

  it.each([
    "tenant_guard: the selected assignment is no longer a live assignment of the caller in this tenant",
    "tenant_guard: the caller has no profile",
  ])(
    "gives a restricted note's other refusal the plain forbidden message: %s",
    async (message) => {
      await expect(
        createMissionControlCrmNote({
          actor,
          idempotencyKey: KEY,
          input: {
            body: "Summary",
            title: "Meeting",
            visibility: "restricted",
          },
          supabase: client({ error: { code: "42501", message } }),
        }),
      ).rejects.toMatchObject({
        status: 403,
        message: "Forbidden: this assignment cannot create CRM notes.",
      });
    },
  );

  it.each([
    ["42501", 403],
    ["22023", 400],
    ["23505", 409],
  ])("answers the command's %s refusal with %i", async (code, status) => {
    await expect(
      createMissionControlCrmNote({
        actor,
        idempotencyKey: KEY,
        input: { body: "Summary", title: "Meeting" },
        supabase: client({ error: { code, message: "refused" } }),
      }),
    ).rejects.toMatchObject({ status });
  });

  it("fails without a stored note or log ID", async () => {
    for (const data of [null, { note: stored() }, { commandLogId: "log-1" }])
      await expect(
        createMissionControlCrmNote({
          actor,
          idempotencyKey: KEY,
          input: { body: "Summary", title: "Meeting" },
          supabase: client({ data }),
        }),
      ).rejects.toThrow("Failed to save CRM note.");
  });

  it("refuses a blank title or body before calling the database", async () => {
    const supabase = client({});
    await expect(
      createMissionControlCrmNote({
        actor,
        idempotencyKey: KEY,
        input: { body: "  ", title: "Meeting" },
        supabase,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
