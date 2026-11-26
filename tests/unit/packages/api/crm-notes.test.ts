import { describe, expect, it } from "vitest";

import { ApiHttpError } from "../../../../packages/api/src/shared/api-http-error";
import {
  createMissionControlCrmNote,
  listMissionControlCrmNotes,
} from "../../../../packages/api/src/admin/crm/notes/service";
import { requireCrmAccess } from "../../../../packages/api/src/crm/auth/access";

import type { ActorContext } from "../../../../packages/api/src/crm/types";
import type { AuthContext } from "../../../../packages/auth/context";

const TENANT_A = "11111111-1111-4111-8111-111111111111";
const TENANT_B = "22222222-2222-4222-8222-222222222222";
const STAFF_ID = "33333333-3333-4333-8333-333333333333";
const ADMIN_ID = "44444444-4444-4444-8444-444444444444";
const NOTE_ID = "55555555-5555-4555-8555-555555555555";
const SUBMISSION_KEY = "88888888-8888-4888-8888-888888888888";

type NoteRow = {
  id: string;
  tenant_id: string;
  title: string;
  body: string;
  visibility: "standard" | "restricted";
  linked_record_id: string | null;
  linked_record_type: string | null;
  author_profile_id: string | null;
  author_name: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
};

type CommandLogRow = Record<string, unknown>;

class MemoryCrmNotesSupabase {
  notes: NoteRow[] = [];
  commandLogs: CommandLogRow[] = [];
  commandCalls: Record<string, unknown>[] = [];
  refusal: string | null = null;
  refusalMessage = "refused";

  pageCalls: Record<string, unknown>[] = [];
  pageError: { code?: string; message: string } | null = null;

  async rpc(
    fn: "create_crm_note" | "crm_notes_page",
    args: Record<string, unknown>,
  ) {
    if (fn === "crm_notes_page") return this.page(args);
    this.commandCalls.push(args);
    if (this.refusal) {
      return {
        data: null,
        error: { code: this.refusal, message: this.refusalMessage },
      };
    }
    const existing = this.notes.find(
      (note) =>
        note.tenant_id === args.p_tenant_id &&
        note.idempotency_key === args.p_idempotency_key,
    );
    if (existing) {
      return {
        data: { note: existing, commandLogId: "log-1", duplicate: true },
        error: null,
      };
    }
    const note: NoteRow = {
      author_name: "Mission Control",
      author_profile_id: STAFF_ID,
      body: String(args.p_body),
      created_at: "2026-08-18T12:00:00.000Z",
      id: NOTE_ID,
      idempotency_key: String(args.p_idempotency_key),
      linked_record_id: (args.p_linked_record_id as string | null) ?? null,
      linked_record_type: (args.p_linked_record_type as string | null) ?? null,
      tenant_id: String(args.p_tenant_id),
      title: String(args.p_title),
      updated_at: "2026-08-18T12:00:00.000Z",
      visibility: args.p_visibility as NoteRow["visibility"],
    };
    this.notes.push(note);
    this.commandLogs.push({
      action: "crm.note.create",
      status: "succeeded",
      tenant_id: note.tenant_id,
    });
    return {
      data: {
        note,
        commandLogId: `log-${this.commandLogs.length}`,
        duplicate: false,
      },
      error: null,
    };
  }

  /**
   * AL-2678 (WP5 rest, r6): the page function's answer for the notes held,
   * by tenant only; row security's restricted rule is proved on the real
   * stack (issue-2678/crm-pages), not here.
   */
  private page(args: Record<string, unknown>) {
    this.pageCalls.push(args);
    if (this.pageError) return { data: null, error: this.pageError };
    const rows = this.notes
      .filter((note) => note.tenant_id === args.p_tenant_id)
      .sort(
        (a, b) =>
          b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id),
      );
    const offset = Number(args.p_offset);
    return {
      data: {
        totalCount: rows.length,
        rows: rows.slice(offset, offset + Number(args.p_limit)),
      },
      error: null,
    };
  }

  from(table: string) {
    if (table === "crm_notes") {
      throw new Error("The list reads crm_notes only through crm_notes_page");
    }
    if (table === "crm_command_logs") {
      return this.commandLogsFrom();
    }
    throw new Error(`Unexpected table ${table}`);
  }

  private commandLogsFrom() {
    return {
      insert: (row: CommandLogRow) => {
        this.commandLogs.push(row);
        return {
          select: () => ({
            single: async () => ({
              data: { id: `log-${this.commandLogs.length}` },
              error: null,
            }),
          }),
        };
      },
    };
  }
}

function staffActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    action: "crm.note.read",
    authTenantId: TENANT_A,
    isSuperAdmin: false,
    isTenantAdministrator: false,
    profileId: STAFF_ID,
    role: "staff",
    tenantId: TENANT_A,
    userId: STAFF_ID,
    ...overrides,
  };
}

function adminActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return staffActor({
    // AL-2675: restricted notes are the tenant administrator's (plan 5.5).
    isTenantAdministrator: true,
    profileId: ADMIN_ID,
    role: "admin",
    userId: ADMIN_ID,
    ...overrides,
  });
}

const defaultParams = {
  cursor: null,
  limit: 50,
  search: null,
  sort: {
    direction: "desc" as const,
    field: "updatedAt" as const,
  },
};

function seedNote(
  store: MemoryCrmNotesSupabase,
  overrides: Partial<NoteRow> = {},
): NoteRow {
  const note: NoteRow = {
    author_name: "Staff Member",
    author_profile_id: STAFF_ID,
    body: "Called the household.",
    created_at: "2026-08-18T12:00:00.000Z",
    id: NOTE_ID,
    idempotency_key: null,
    linked_record_id: "donor-1",
    linked_record_type: "donor_profile",
    tenant_id: TENANT_A,
    title: "Follow-up",
    updated_at: "2026-08-18T12:00:00.000Z",
    visibility: "standard",
    ...overrides,
  };
  store.notes.push(note);
  return note;
}

describe("listMissionControlCrmNotes", () => {
  it("returns local Asym notes for the actor tenant", async () => {
    const store = new MemoryCrmNotesSupabase();
    seedNote(store);
    seedNote(store, {
      id: "66666666-6666-4666-8666-666666666666",
      tenant_id: TENANT_B,
      title: "Other tenant",
    });

    const response = await listMissionControlCrmNotes({
      actor: staffActor(),
      params: defaultParams,
      supabase: store,
    });

    expect(response.mode).toBe("local");
    expect(response.configured).toBe(true);
    expect(response.missing).toEqual([]);
    expect(response.rows.map((row) => row.title)).toEqual(["Follow-up"]);
    expect(response.rows[0]?.source).toBe("local");
    expect(response.rows[0]).not.toHaveProperty("outboundJobId");
  });

  // AL-2678 (WP5 rest, r6; plan line 999): the list is one page of
  // public.crm_notes_page on the caller's token, which filters, counts, sorts
  // and pages in Postgres under row security; restricted notes are left out
  // there for anyone but a tenant administrator (issue-2678/crm-pages proves
  // it on the real stack, with a finance staff member among the callers).
  it("reads one page through crm_notes_page with the actor's tenant, the search, the sort and the page, and states the exact total", async () => {
    const store = new MemoryCrmNotesSupabase();
    for (let i = 0; i < 3; i += 1)
      seedNote(store, {
        id: `7777777${i}-7777-4777-8777-777777777777`,
        title: `Note ${i}`,
      });

    const response = await listMissionControlCrmNotes({
      actor: staffActor(),
      params: {
        cursor: { offset: 1 },
        limit: 1,
        search: "note",
        sort: { direction: "asc", field: "title" },
      },
      supabase: store,
    });

    expect(store.pageCalls).toEqual([
      {
        p_tenant_id: TENANT_A,
        p_search: "note",
        p_sort: "title",
        p_descending: false,
        p_offset: 1,
        p_limit: 1,
      },
    ]);
    expect(response.totalCount).toBe(3);
    expect(response.rows.map((row) => row.title)).toEqual(["Note 1"]);
    expect(response.hasMore).toBe(true);
    expect(response.nextCursor).toBeTruthy();
  });

  it("ends the list at the filtered total", async () => {
    const store = new MemoryCrmNotesSupabase();
    seedNote(store);

    const response = await listMissionControlCrmNotes({
      actor: staffActor(),
      params: defaultParams,
      supabase: store,
    });

    expect(response.totalCount).toBe(1);
    expect(response.hasMore).toBe(false);
    expect(response.nextCursor).toBeNull();
  });

  it("answers an error, not an empty list, when the page read fails", async () => {
    const store = new MemoryCrmNotesSupabase();
    store.pageError = { code: "42501", message: "denied" };

    await expect(
      listMissionControlCrmNotes({
        actor: staffActor(),
        params: defaultParams,
        supabase: store,
      }),
    ).rejects.toThrow("denied");
  });

  it("refuses an actor of another tenant before any read, through requireCrmAccess", async () => {
    const store = new MemoryCrmNotesSupabase();
    const auth: AuthContext = {
      userId: STAFF_ID,
      email: null,
      tenantId: TENANT_A,
      role: "staff",
      memberships: [
        {
          tenantId: TENANT_A,
          role: "staff",
          staffRole: "finance",
          isActive: true,
          isTenantAdmin: false,
        },
      ],
      assignment: null,
      assignmentDenial: null,
      profileId: STAFF_ID,
      isAuthenticated: true,
    };
    const actor = requireCrmAccess(auth, {
      action: "crm.note.read",
      resourceType: "note",
    });

    await expect(
      listMissionControlCrmNotes({
        actor: { ...actor, tenantId: TENANT_B },
        params: defaultParams,
        supabase: store,
      }),
    ).rejects.toBeInstanceOf(ApiHttpError);
    expect(store.pageCalls).toEqual([]);
  });
});

describe("createMissionControlCrmNote", () => {
  it("persists an authoritative local note and records succeeded audit", async () => {
    const store = new MemoryCrmNotesSupabase();

    const response = await createMissionControlCrmNote({
      actor: staffActor({ action: "crm.note.create" }),
      idempotencyKey: SUBMISSION_KEY,
      input: {
        body: "Family is doing well.",
        linkedRecordId: "donor-1",
        linkedRecordType: "donor_profile",
        title: "Visit notes",
      },
      supabase: store,
    });

    expect(response.note.source).toBe("local");
    expect(response.note.title).toBe("Visit notes");
    expect(response.note.body).toBe("Family is doing well.");
    expect(response.note.authorName).toBe("Mission Control");
    expect(response).not.toHaveProperty("outboundJobId");
    expect(response).not.toHaveProperty("replay");
    expect(store.commandCalls).toEqual([
      expect.objectContaining({
        p_idempotency_key: SUBMISSION_KEY,
        p_tenant_id: TENANT_A,
        p_visibility: "standard",
      }),
    ]);
    expect(store.commandCalls[0]).not.toHaveProperty("p_author_profile_id");
    expect(store.notes).toHaveLength(1);
    expect(store.notes[0]?.tenant_id).toBe(TENANT_A);
    expect(store.commandLogs).toEqual([
      expect.objectContaining({
        action: "crm.note.create",
        status: "succeeded",
        tenant_id: TENANT_A,
      }),
    ]);
  });

  it("makes the created note immediately readable from local list", async () => {
    const store = new MemoryCrmNotesSupabase();

    await createMissionControlCrmNote({
      actor: staffActor({ action: "crm.note.create" }),
      idempotencyKey: SUBMISSION_KEY,
      input: { body: "Read after write.", title: "Immediate" },
      supabase: store,
    });

    const listed = await listMissionControlCrmNotes({
      actor: staffActor(),
      params: defaultParams,
      supabase: store,
    });

    expect(listed.rows.map((row) => row.title)).toEqual(["Immediate"]);
  });

  it("rejects restricted note creation for non-admin staff", async () => {
    const store = new MemoryCrmNotesSupabase();
    store.refusal = "42501";
    store.refusalMessage =
      "tenant_guard: a restricted CRM note needs the tenant-administrator flag";

    await expect(
      createMissionControlCrmNote({
        actor: staffActor({ action: "crm.note.create" }),
        idempotencyKey: SUBMISSION_KEY,
        input: {
          body: "Pastoral detail",
          title: "Restricted",
          visibility: "restricted",
        },
        supabase: store,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Restricted CRM notes require the tenant-administrator flag.",
        status: 403,
      }),
    );
    expect(store.notes).toHaveLength(0);
    expect(() => {
      throw new ApiHttpError(
        403,
        "Restricted CRM notes require the tenant-administrator flag.",
      );
    }).toThrow(ApiHttpError);
  });

  it("returns the existing note for a duplicate idempotent submission", async () => {
    const store = new MemoryCrmNotesSupabase();
    const first = await createMissionControlCrmNote({
      actor: staffActor({ action: "crm.note.create" }),
      idempotencyKey: SUBMISSION_KEY,
      input: { body: "Body", title: "Same" },
      requestId: "request-1",
      supabase: store,
    });
    const second = await createMissionControlCrmNote({
      actor: staffActor({ action: "crm.note.create" }),
      idempotencyKey: SUBMISSION_KEY,
      input: { body: "Body", title: "Same" },
      requestId: "request-2",
      supabase: store,
    });

    expect(store.notes).toHaveLength(1);
    expect(second.note.id).toBe(first.note.id);
    expect(second.duplicate).toBe(true);
    expect(store.commandCalls.map((call) => call.p_idempotency_key)).toEqual([
      SUBMISSION_KEY,
      SUBMISSION_KEY,
    ]);
  });

  it("does not create a Twenty outbound job", async () => {
    const store = new MemoryCrmNotesSupabase();

    const response = await createMissionControlCrmNote({
      actor: staffActor({ action: "crm.note.create" }),
      idempotencyKey: SUBMISSION_KEY,
      input: { body: "No vendor job.", title: "Local only" },
      supabase: store,
    });

    expect(response).not.toHaveProperty("outboundJobId");
    expect(JSON.stringify(store)).not.toMatch(/twenty/i);
  });
});
