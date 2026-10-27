import type {
  ActiveAssignment,
  AssignmentReader,
  AssignmentRow,
} from "../../../../../packages/api/src/principal/types";

/** Fixed ids so failures read clearly. */
export const id = (n: number) =>
  `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
export const TA = id(0xa);
export const TB = id(0xb);
export const TC = id(0xc);
export const U1 = id(0x1);
export const U2 = id(0x2);

let next = 0x100;
export function row(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staff: string | null = null,
  user = U1,
): AssignmentRow {
  next += 1;
  return {
    id: id(next),
    user_id: user,
    tenant_id: tenant,
    role,
    staff_role: staff,
    updated_at: `2026-10-26T15:00:00.${String(next).padStart(6, "0")}+00:00`,
  };
}

export function asAssignment(r: AssignmentRow): ActiveAssignment {
  return {
    assignmentId: r.id,
    userId: r.user_id,
    tenantId: r.tenant_id,
    revision: r.updated_at,
    membershipRole: r.role as ActiveAssignment["membershipRole"],
    staffRole: r.staff_role as ActiveAssignment["staffRole"],
  };
}

/** DI reader returning `pages[i]` on call i (the last page repeats); counts calls. */
type CountingReader = AssignmentReader & { calls: number };

export function fakeReader(...pages: ReadonlyArray<unknown>[]): CountingReader {
  const reader: CountingReader = {
    calls: 0,
    async listActiveAssignments() {
      const page = pages[Math.min(reader.calls, pages.length - 1)] ?? [];
      reader.calls += 1;
      return page as AssignmentRow[];
    },
  };
  return reader;
}

export function failingReader(
  error: unknown = new Error("rpc down"),
): CountingReader {
  const reader: CountingReader = {
    calls: 0,
    async listActiveAssignments(): Promise<AssignmentRow[]> {
      reader.calls += 1;
      throw error;
    },
  };
  return reader;
}
