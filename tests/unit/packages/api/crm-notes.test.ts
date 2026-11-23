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

  async rpc(fn: "create_crm_note", args: Record<string, unknown>) {
    this.commandCalls.push(args);
    if (this.refusal) {
      return { data: null, error: { code: this.refusal, message: "refused" } };
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

  from(table: string) {
    if (table === "crm_notes") {
      return this.notesFrom();
    }
    if (table === "crm_command_logs") {
      return this.commandLogsFrom();
    }
    throw new Error(`Unexpected table ${table}`);
  }

  private notesFrom() {
    const state: { filters: Array<{ field: string; value: unknown }> } = {
      filters: [],
    };

    const applyFilters = () =>
      this.notes.filter((note) =>
        state.filters.every((filter) => {
          const actual = note[filter.field as keyof NoteRow];
          return actual === filter.value;
        }),
      );

    const chain = {
      eq: (field: string, value: unknown) => {
        state.filters.push({ field, value });
        return chain;
      },
      maybeSingle: async () => {
        const rows = applyFilters();
        return { data: rows[0] ?? null, error: null };
      },
      then: (
        resolve: (value: { data: NoteRow[] | null; error: null }) => unknown,
      ) => resolve({ data: applyFilters(), error: null }),
    };

    return {
      insert: (row: NoteRow) => {
        const duplicate = this.notes.some(
          (existing) =>
            existing.tenant_id === row.tenant_id &&
            existing.idempotency_key &&
            existing.idempotency_key === row.idempotency_key,
        );
        if (duplicate) {
          return {
            select: () => ({
              single: async () => ({
                data: null,
                error: { code: "23505", message: "duplicate key" },
              }),
            }),
          };
        }
        this.notes.push(row);
        return {
          select: () => ({
            single: async () => ({ data: row, error: null }),
          }),
        };
      },
      select: (_columns?: string) => chain,
    };
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

  it("hides restricted notes from non-admin staff", async () => {
    const store = new MemoryCrmNotesSupabase();
    seedNote(store, { title: "Pastoral", visibility: "restricted" });

    const staffResponse = await listMissionControlCrmNotes({
      actor: staffActor(),
      params: defaultParams,
      supabase: store,
    });
    const adminResponse = await listMissionControlCrmNotes({
      actor: adminActor(),
      params: defaultParams,
      supabase: store,
    });

    expect(staffResponse.rows).toEqual([]);
    expect(adminResponse.rows.map((row) => row.title)).toEqual(["Pastoral"]);
  });

  // Council round 1 on WP2a, F14 (plan acceptance line: "A finance staff
  // member cannot read a restricted note"): the actor comes from a finance
  // staff membership through requireCrmAccess, not built by hand.
  it("hides restricted notes from a finance staff member, through requireCrmAccess", async () => {
    const store = new MemoryCrmNotesSupabase();
    seedNote(store, { title: "Pastoral", visibility: "restricted" });
    seedNote(store, {
      id: "77777777-7777-4777-8777-777777777777",
      title: "Follow-up",
    });
    const context = (
      staffRole: "finance" | "development",
      isTenantAdmin: boolean,
    ): AuthContext => ({
      userId: STAFF_ID,
      email: null,
      tenantId: TENANT_A,
      role: isTenantAdmin ? "admin" : "staff",
      memberships: [
        {
          tenantId: TENANT_A,
          role: "staff",
          staffRole,
          isActive: true,
          isTenantAdmin,
        },
      ],
      assignment: null,
      assignmentDenial: null,
      profileId: STAFF_ID,
      isAuthenticated: true,
    });
    const read = (auth: AuthContext) =>
      listMissionControlCrmNotes({
        actor: requireCrmAccess(auth, {
          action: "crm.note.read",
          resourceType: "note",
        }),
        params: defaultParams,
        supabase: store,
      });

    expect(
      (await read(context("finance", false))).rows.map((row) => row.title),
    ).toEqual(["Follow-up"]);
    expect(
      (await read(context("development", true))).rows
        .map((row) => row.title)
        .sort(),
    ).toEqual(["Follow-up", "Pastoral"]);
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
