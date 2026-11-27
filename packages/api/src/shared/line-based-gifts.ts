export const COUNTED_INTAKE_FILTER =
  "intake_format.eq.legacy_header,status.in.(processing,completed,failed,refunded)";

const COUNTED_LINE_BASED_STATUSES = new Set([
  "processing",
  "completed",
  "failed",
  "refunded",
]);

export function isCountedIntake(row: {
  intake_format?: string | null;
  status?: string | null;
}): boolean {
  return (
    row.intake_format !== "line_based" ||
    COUNTED_LINE_BASED_STATUSES.has(row.status ?? "")
  );
}

export type LineBasedGiftLine = {
  donation_id: string;
  line_number: number;
  fund_id: string | null;
  fund_name: string | null;
  missionary_id: string | null;
  worker_public_name: string | null;
  is_fee_cover: boolean;
  amount: number;
};

export type GiftHold = {
  id: string;
  reason: string;
  createdAt: string | null;
  resolvedAt: string | null;
  resolutionReason: string | null;
};

type LinesPage = {
  order(column: string): LinesPage;
  range(
    from: number,
    to: number,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

type RpcClient = {
  rpc(
    fn: "line_based_gift_lines",
    args: { p_tenant_id: string; p_donation_ids: string[] },
  ): LinesPage;
};

export const GIFT_LINES_PAGE = 500;

export async function loadLineBasedGiftLines(
  client: unknown,
  tenantId: string,
  donationIds: string[],
): Promise<Map<string, LineBasedGiftLine[]>> {
  const byIntake = new Map<string, LineBasedGiftLine[]>();
  if (donationIds.length === 0) return byIntake;
  for (let from = 0; ; from += GIFT_LINES_PAGE) {
    const { data, error } = await (client as RpcClient)
      .rpc("line_based_gift_lines", {
        p_tenant_id: tenantId,
        p_donation_ids: donationIds,
      })
      .order("donation_id")
      .order("line_number")
      .range(from, from + GIFT_LINES_PAGE - 1);
    if (error) throw new Error(error.message || "Unable to load gift lines");
    const rows = (Array.isArray(data) ? data : []) as LineBasedGiftLine[];
    for (const row of rows) {
      const lines = byIntake.get(row.donation_id) ?? [];
      lines.push({ ...row, amount: Number(row.amount) });
      byIntake.set(row.donation_id, lines);
    }
    if (rows.length < GIFT_LINES_PAGE) return byIntake;
  }
}

type SelectClient = {
  from(table: "staged_gift_holds"): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        eq(
          column: string,
          value: string,
        ): {
          order(
            column: string,
            options: { ascending: boolean },
          ): PromiseLike<{
            data: unknown;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export async function loadGiftHolds(
  client: unknown,
  tenantId: string,
  stagedGiftId: string,
): Promise<GiftHold[]> {
  const { data, error } = await (client as SelectClient)
    .from("staged_gift_holds")
    .select("id, reason, created_at, resolved_at, resolution_reason")
    .eq("tenant_id", tenantId)
    .eq("staged_gift_id", stagedGiftId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message || "Unable to load gift holds");
  return ((Array.isArray(data) ? data : []) as Record<string, unknown>[]).map(
    (row) => ({
      id: String(row.id),
      reason: String(row.reason),
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
      resolvedAt: typeof row.resolved_at === "string" ? row.resolved_at : null,
      resolutionReason:
        typeof row.resolution_reason === "string"
          ? row.resolution_reason
          : null,
    }),
  );
}
