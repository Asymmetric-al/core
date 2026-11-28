import { applyContributionCorrection } from "../../../../../packages/api/src/admin/contribution-operations/operations";

import type { ReceiptSnapshotContentV1 } from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export type Row = Record<string, unknown>;

export const TENANT_ID = "tenant-1";
export const DONATION_ID = "donation-1";
export const W = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a01";
export const V = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a02";
export const X = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a03";
export const GONE = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a04";
export const OTHER_WORKER = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0a05";
export const FUND_W = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0f01";
export const FUND_OTHER = "0d8f6a52-4f0e-4a77-9a55-1f3f2b6c0f02";
export const FORBIDDEN =
  /Profile Rowan|Profile Vale|Profile Xu|Profile Gone|Party Xu|Legal Rowan/;

export const profile = (first: string, last: string) => ({
  display_name: `${first} ${last}`,
  full_name: `${first} ${last}`,
  first_name: first,
  last_name: last,
  email: `${last.toLowerCase()}@example.test`,
});

export const WORKER_ROWS: Record<string, Row> = {
  [W]: {
    id: W,
    worker_public_name: "Cedar",
    profile: profile("Profile", "Rowan"),
  },
  [V]: {
    id: V,
    worker_public_name: "Party Vale",
    profile: profile("Profile", "Vale"),
  },
  [X]: { id: X, worker_public_name: null, profile: profile("Profile", "Xu") },
  [GONE]: { id: GONE, profile: profile("Profile", "Gone") },
  [OTHER_WORKER]: {
    id: OTHER_WORKER,
    tenant_id: "tenant-2",
    worker_public_name: "Other Worker",
    profile: profile("Other", "Worker"),
  },
};

export const fundRow = (
  id: string,
  tenantId: string,
  missionaryId: string,
) => ({
  id,
  tenant_id: tenantId,
  name: `Fund of ${missionaryId.slice(-4)}`,
  missionary_id: missionaryId,
  goal_amount: null,
  start_date: null,
  end_date: null,
});

export const EMBEDDED = new Set(["profile"]);

export function topLevel(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")") depth--;
    if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function project(row: Row, select: string): Row {
  const out: Row = {};
  for (const part of topLevel(select)) {
    const embed = /^(?:(\w+):)?(\w+)(?:![\w!]+)?\((.+)\)$/s.exec(part);
    const key = embed ? (embed[1] ?? embed[2]!) : null;
    if (embed && key && EMBEDDED.has(key)) {
      const value = row[key] as Row | null | undefined;
      out[key] = value ? project(value, embed[3]!) : (value ?? null);
    } else if (part === "*") {
      for (const [k, v] of Object.entries(row))
        if (!EMBEDDED.has(k)) out[k] = v;
    } else if (/^\w+$/.test(part)) {
      if (!Object.hasOwn(row, part))
        throw new Error(`the stub's row has no column "${part}"`);
      out[part] = row[part];
    } else throw new Error(`the stub cannot project "${part}"`);
  }
  return out;
}

export const STAGED_GIFT = {
  id: "staged-1",
  tenant_id: TENANT_ID,
  donation_id: DONATION_ID,
  donor_id: "donor-1",
  missionary_id: null,
  fund_id: null,
  stripe_raw_event_id: null,
  stripe_event_id: null,
  stripe_payment_intent_id: null,
  stripe_charge_id: null,
  amount: 25_000,
  currency: "usd",
  status: "posted",
  donor_match_status: "matched",
  allocation_status: "allocated",
  review_reason: null,
  receipt_status: "sent",
  crm_post_status: "posted",
  crm_outbound_job_id: null,
  twenty_record_id: null,
  metadata: {},
};

export const TABLE_RULES: Record<
  string,
  { required: string[]; notNull: string[]; unique: string[][] }
> = {
  contribution_adjustments: {
    required: [
      "tenant_id",
      "donation_id",
      "adjustment_type",
      "reason",
      "source_surface",
    ],
    notNull: [
      "id",
      "tenant_id",
      "donation_id",
      "adjustment_type",
      "status",
      "effective_values",
      "reason",
      "source_surface",
      "created_at",
    ],
    unique: [["tenant_id", "idempotency_key"]],
  },
  contribution_receipt_snapshots: {
    required: ["tenant_id", "donation_id", "kind"],
    notNull: [
      "id",
      "tenant_id",
      "donation_id",
      "kind",
      "content",
      "created_at",
    ],
    unique: [["adjustment_id", "kind"]],
  },
  email_send_logs: {
    required: ["tenant_id", "idempotency_key", "correlation_id"],
    notNull: [
      "id",
      "tenant_id",
      "idempotency_key",
      "correlation_id",
      "status",
      "recipient_count",
      "message_type",
      "requested_at",
      "retry_count",
      "metadata",
    ],
    unique: [["tenant_id", "idempotency_key"]],
  },
  staged_gifts: {
    required: ["tenant_id", "donation_id", "amount", "intake_format"],
    notNull: [
      "id",
      "tenant_id",
      "donation_id",
      "amount",
      "currency",
      "status",
      "donor_match_status",
      "allocation_status",
      "receipt_status",
      "crm_post_status",
      "metadata",
      "created_at",
      "updated_at",
      "intake_format",
    ],
    unique: [["donation_id"], ["tenant_id", "id", "legal_entity_id"]],
  },
};

export interface State {
  donationMissionaryId: string | null;
  allocations: Row[];
  adjustments: Row[];
  snapshots: Row[];
  emailSendLogs: Row[];
  selects: Array<[string, string]>;
  failWorkerNames?: number;
  donationFundId?: string | null;
  funds?: Row[];
  failFundWorkers?: number;
  ops?: string[];
  failHoldsOnceCorrected?: boolean;
  failSnapshotInserts?: number;
  snapshotConflictOnce?: boolean;
  winnerRow?: Row;
  stagedGift: Row;
  commitOnFirstKeyLookup?: Row;
  commitOnSecondKeyLookup?: Row;
  keyLookups?: number;
  donorDoNotEmail?: boolean;
  suppressionTypes?: string[];
  writeGate?: (
    table: string,
    operation: "insert" | "update",
    payload: Row,
  ) => Promise<void> | void;
  onSecondKeyLookup?: () => void;
  currentDonorId?: string;
  donorRows?: Record<string, Row>;
}

export class QueryBuilder {
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private columns = "*";
  private wantsSingle = false;
  private inValues: unknown[] = [];
  private eqs: Array<[string, unknown]> = [];
  private neqs: Array<[string, unknown]> = [];

  constructor(
    private readonly table: string,
    private readonly state: State,
  ) {}

  select(columns = "*") {
    if (this.operation === "select") {
      this.columns = columns;
      this.state.selects.push([this.table, columns]);
    }
    return this;
  }
  insert(payload: Row) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }
  eq(column: string, value: unknown) {
    this.eqs.push([column, value]);
    return this;
  }
  neq(column: string, value: unknown) {
    this.neqs.push([column, value]);
    return this;
  }
  ilike() {
    return this;
  }
  is() {
    return this;
  }
  in(_column: string, values: unknown[]) {
    this.inValues = values;
    return this;
  }
  order() {
    return this;
  }
  limit() {
    return this;
  }
  single() {
    this.wantsSingle = true;
    return this;
  }
  maybeSingle() {
    this.wantsSingle = true;
    return this;
  }

  private resolve(): {
    data: unknown;
    error: { code?: string; message: string } | null;
  } {
    const { state } = this;
    state.ops?.push(
      this.operation === "select"
        ? `select ${this.table} ${this.columns}`
        : `${this.operation} ${this.table}`,
    );
    switch (this.table) {
      case "donations":
        return {
          data: {
            id: DONATION_ID,
            tenant_id: TENANT_ID,
            donor_id: state.currentDonorId ?? "donor-1",
            missionary_id: state.donationMissionaryId,
            fund_id: state.donationFundId ?? null,
            amount: 25_000,
            currency: "usd",
            status: "completed",
            gift_date: "2026-05-01",
            refund_amount: 0,
            refunded_at: null,
            created_at: "2026-05-01T00:00:00.000Z",
            updated_at: "2026-05-01T00:00:00.000Z",
          },
          error: null,
        };
      case "staged_gifts":
        if (this.operation === "update") {
          Object.assign(state.stagedGift, this.payload);
          return { data: null, error: null };
        }
        return { data: state.stagedGift, error: null };
      case "staged_gift_allocations":
        return { data: state.allocations, error: null };
      case "donors": {
        const id = this.eqs.find(([column]) => column === "id")?.[1];
        const own = typeof id === "string" ? state.donorRows?.[id] : undefined;
        if (own) return { data: structuredClone(own), error: null };
        return {
          data: {
            id: "donor-1",
            profile_id: null,
            name: "Ada Lovelace",
            email: "donor@example.com",
            do_not_email: state.donorDoNotEmail === true,
            do_not_contact: false,
          },
          error: null,
        };
      }
      case "missionaries": {
        const wantsPublicName = /\bworker_public_name\b/.test(this.columns);
        if (wantsPublicName && (state.failWorkerNames ?? 0) > 0) {
          state.failWorkerNames! -= 1;
          return {
            data: null,
            error: { message: "worker public names are unavailable" },
          };
        }
        return {
          data: this.inValues.flatMap((id) => {
            const row = WORKER_ROWS[id as string];
            if (
              !row ||
              (wantsPublicName && !("worker_public_name" in row)) ||
              !this.eqs.every(([column, value]) =>
                column in row ? row[column] === value : true,
              )
            )
              return [];
            return [project(row, this.columns)];
          }),
          error: null,
        };
      }
      case "funds": {
        if (
          this.columns === "id, missionary_id" &&
          (state.failFundWorkers ?? 0) > 0
        ) {
          state.failFundWorkers! -= 1;
          return { data: null, error: { message: "funds are unavailable" } };
        }
        return {
          data: (state.funds ?? []).filter(
            (row) =>
              this.inValues.includes(row.id) &&
              this.eqs.every(([column, value]) => row[column] === value),
          ),
          error: null,
        };
      }
      case "staged_gift_holds":
        return state.failHoldsOnceCorrected && state.adjustments.length > 0
          ? { data: null, error: { message: "gift holds are unavailable" } }
          : { data: [], error: null };
      case "contribution_receipt_snapshots": {
        if (this.operation !== "insert")
          return {
            data: state.snapshots
              .filter((row) =>
                this.eqs.every(([column, value]) => row[column] === value),
              )
              .map((row) => structuredClone(row)),
            error: null,
          };
        if (
          this.payload?.adjustment_id &&
          !state.snapshotConflictOnce &&
          state.snapshots.some(
            (row) =>
              row.adjustment_id === this.payload?.adjustment_id &&
              row.kind === this.payload?.kind,
          )
        )
          return {
            data: null,
            error: {
              code: "23505",
              message:
                "duplicate key value violates unique constraint contribution_receipt_snapshots_adjustment_kind_key",
            },
          };
        if ((state.failSnapshotInserts ?? 0) > 0) {
          state.failSnapshotInserts! -= 1;
          return {
            data: null,
            error: { message: "snapshots are unavailable" },
          };
        }
        if (state.snapshotConflictOnce) {
          state.snapshotConflictOnce = false;
          state.snapshots.push({
            id: `snap-${state.snapshots.length + 1}`,
            created_at: new Date().toISOString(),
            ...structuredClone(this.payload),
          });
          return {
            data: null,
            error: {
              code: "23505",
              message: "duplicate key value violates unique constraint",
            },
          };
        }
        const row = {
          id: `snap-${state.snapshots.length + 1}`,
          created_at: new Date().toISOString(),
          ...structuredClone(this.payload),
        };
        state.snapshots.push(row);
        return { data: { id: row.id }, error: null };
      }
      case "email_send_logs": {
        const cell = (row: Row, column: string) =>
          column.startsWith("metadata->>")
            ? (row.metadata as Row | undefined)?.[
                column.slice("metadata->>".length)
              ]
            : row[column];
        const matching = () =>
          state.emailSendLogs
            .filter(
              (row) =>
                this.eqs.every(
                  ([column, value]) => cell(row, column) === value,
                ) &&
                this.neqs.every(
                  ([column, value]) => cell(row, column) !== value,
                ),
            )
            .sort((a, b) =>
              String(b.requested_at ?? "").localeCompare(
                String(a.requested_at ?? ""),
              ),
            );
        if (this.operation === "update") {
          for (const row of matching())
            Object.assign(row, structuredClone(this.payload));
          return { data: null, error: null };
        }
        if (this.operation === "select") {
          const rows = matching().map((row) => structuredClone(row));
          return {
            data: this.wantsSingle ? (rows[0] ?? null) : rows,
            error: null,
          };
        }
        if (
          state.emailSendLogs.some(
            (row) =>
              row.tenant_id === this.payload?.tenant_id &&
              row.idempotency_key === this.payload?.idempotency_key,
          )
        )
          return {
            data: null,
            error: {
              code: "23505",
              message:
                "duplicate key value violates unique constraint email_send_logs_tenant_idempotency_unique",
            },
          };
        const row = {
          id: `send-log-${state.emailSendLogs.length + 1}`,
          ...structuredClone(this.payload),
        };
        state.emailSendLogs.push(row);
        return { data: { id: row.id, status: row.status }, error: null };
      }
      case "email_suppressions":
        return {
          data: (state.suppressionTypes ?? []).map((type) => ({
            suppression_type: type,
          })),
          error: null,
        };
      case "contribution_operation_audit_events":
      case "contribution_corrections":
        return { data: [], error: null };
      case "contribution_adjustments": {
        if (this.operation === "insert") {
          const key = this.payload?.idempotency_key;
          if (state.winnerRow && state.winnerRow.idempotency_key === key) {
            state.adjustments.push(state.winnerRow);
            state.winnerRow = undefined;
            return {
              data: null,
              error: { code: "23505", message: "duplicate idempotency key" },
            };
          }
          if (
            typeof key === "string" &&
            state.adjustments.some(
              (row) =>
                row.idempotency_key === key &&
                (row.tenant_id ?? this.payload?.tenant_id) ===
                  this.payload?.tenant_id,
            )
          )
            return {
              data: null,
              error: { code: "23505", message: "duplicate idempotency key" },
            };
          const row = {
            id: `adj-${state.adjustments.length + 1}`,
            created_at: new Date(
              Date.UTC(2026, 5, 1, 0, 0, state.adjustments.length),
            ).toISOString(),
            ...this.payload,
          };
          state.adjustments.push(row);
          return { data: { id: row.id }, error: null };
        }
        if (this.eqs.some(([column]) => column === "idempotency_key")) {
          state.keyLookups = (state.keyLookups ?? 0) + 1;
          if (state.keyLookups === 2 && state.commitOnSecondKeyLookup) {
            state.adjustments.push(state.commitOnSecondKeyLookup);
            state.commitOnSecondKeyLookup = undefined;
            state.onSecondKeyLookup?.();
          }
        }
        const adjustments = state.adjustments.filter((row) =>
          this.eqs.every(
            ([column, value]) => !(column in row) || row[column] === value,
          ),
        );
        if (
          state.commitOnFirstKeyLookup &&
          this.eqs.some(([column]) => column === "idempotency_key")
        ) {
          state.adjustments.push(state.commitOnFirstKeyLookup);
          state.commitOnFirstKeyLookup = undefined;
        }
        return {
          data: this.wantsSingle ? (adjustments[0] ?? null) : adjustments,
          error: null,
        };
      }
      default:
        return { data: null, error: null };
    }
  }

  then<T>(
    onfulfilled: (value: {
      data: unknown;
      error: { code?: string; message: string } | null;
    }) => T,
  ): Promise<T> {
    const gate =
      this.operation === "select"
        ? undefined
        : this.state.writeGate?.(
            this.table,
            this.operation,
            this.payload ?? {},
          );
    return Promise.resolve(gate)
      .then(() => this.resolve())
      .then(onfulfilled);
  }
}

export function stub(state: State): AdminSupabaseClient {
  return {
    from: (table: string) => new QueryBuilder(table, state),
  } as unknown as AdminSupabaseClient;
}

export const allocation = (
  id: string,
  cents: number,
  missionaryId: string,
) => ({
  id,
  amount: cents,
  fund_id: null,
  missionary_id: missionaryId,
  memo: `Memo ${id}`,
});

export function freshState(split: boolean): State {
  return {
    donationMissionaryId: split ? null : X,
    allocations: split
      ? [
          allocation("w", 10_000, W),
          allocation("v", 8_000, V),
          allocation("x", 4_000, X),
          allocation("gone", 3_000, GONE),
        ]
      : [],
    adjustments: [],
    snapshots: [],
    emailSendLogs: [],
    selects: [],
    stagedGift: { ...STAGED_GIFT },
  };
}

export async function correct(
  state: State,
  choice: "pdf" | "email" | "defer",
  idempotencyKey?: string,
  expectedRevision?: string,
) {
  return applyContributionCorrection({
    supabaseAdmin: stub(state),
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    actionType: "amount_correction",
    payload: {
      amount: 20_000,
      receiptDelivery:
        choice === "defer"
          ? { choice, deferReason: "The donor asked to wait" }
          : { choice },
    },
    reason: "data entry error",
    actorProfileId: "profile-1",
    sourceSurface: "contribution_hub",
    actorCapabilities: ["contributions.manage_receipts"],
    idempotencyKey,
    expectedRevision,
  });
}

export const workerNameLookups = (state: State) =>
  state.selects.filter(
    ([table, columns]) =>
      table === "missionaries" && /\bworker_public_name\b/.test(columns),
  ).length;

export const namesOf = (content: unknown) =>
  (content as ReceiptSnapshotContentV1).designationLines.map((line) => [
    line.missionaryId,
    line.missionaryName,
  ]);
