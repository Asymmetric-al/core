import { NextResponse } from "next/server";
import { z } from "zod";

import { sendStagedGiftReceipt } from "../../giving/receipts";
import {
  approveStagedGiftForFinance,
  canTransitionStagedGift,
  loadStagedGiftById,
  rejectRetiredCrmPostingRetry,
  type StagedGiftRow,
  type StagedGiftStatus,
} from "../../giving/staged-gifts";
import { revalidateAdminContributionsCache } from "../../shared/cache-tags";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import {
  withOperation,
  withPlatformOperation,
} from "../../shared/with-operation";
import {
  assertContributionActionPermission,
  assertContributionPermission,
} from "../contribution-operations/permissions";

/*
 * Legacy staged-gift routes (WP0, audit findings NB-01 and NV-03). They stay
 * the only approve and relink path until the money kernel replaces them, so
 * they keep working, but the wrapper's staff gate is no longer the authority:
 * each handler requires the finance capability for its action from the shared
 * contribution capability table, and the edit and receipt handlers check the
 * staged gift's state before they write.
 */

const allocationSchema = z.object({
  fundId: z.string().uuid().nullable().optional(),
  missionaryId: z.string().uuid().nullable().optional(),
  amount: z.number().int().nonnegative(),
  memo: z.string().max(500).nullable().optional(),
});

const reviewPatchSchema = z.object({
  donorId: z.string().uuid().nullable().optional(),
  allocations: z.array(allocationSchema).min(1).optional(),
  status: z
    .enum(["received", "needs_review", "ready_to_post", "failed", "voided"])
    .optional(),
  note: z.string().max(1000).nullable().optional(),
});

const actionSchema = z.object({
  note: z.string().max(1000).nullable().optional(),
});

function getStagedGiftIdFromPath(request: Request) {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf("staged-gifts");
  const stagedGiftId = index >= 0 ? segments[index + 1] : null;

  if (!stagedGiftId) {
    throw new ApiHttpError(400, "Missing staged gift id.");
  }

  return stagedGiftId;
}

/**
 * A gift is still under review while the state machine lets it go back to
 * review or forward to posting. A posted, refunded or voided gift is not, and
 * the legacy edit handler changes nothing about it.
 */
function isUnderReview(status: StagedGiftStatus): boolean {
  return (
    canTransitionStagedGift(status, "needs_review") ||
    canTransitionStagedGift(status, "ready_to_post")
  );
}

function assertEditableStagedGift(
  gift: StagedGiftRow,
  nextStatus: StagedGiftStatus | undefined,
) {
  if (!isUnderReview(gift.status)) {
    throw new ApiHttpError(
      409,
      `Cannot edit a staged gift in ${gift.status} status.`,
    );
  }

  if (nextStatus && !canTransitionStagedGift(gift.status, nextStatus)) {
    throw new ApiHttpError(
      409,
      `Cannot move a staged gift from ${gift.status} to ${nextStatus}.`,
    );
  }
}

/** Gifts that no receipt may be sent for, whatever their receipt status. */
const RECEIPT_BLOCKED_STATUSES: ReadonlySet<StagedGiftStatus> = new Set([
  "refunded",
  "voided",
]);

function assertReceiptableStagedGift(gift: StagedGiftRow) {
  if (RECEIPT_BLOCKED_STATUSES.has(gift.status)) {
    throw new ApiHttpError(
      409,
      `Cannot send a receipt for a staged gift in ${gift.status} status.`,
    );
  }

  if (gift.receiptStatus === "suppressed") {
    throw new ApiHttpError(409, "Receipts are suppressed for this gift.");
  }
}

/**
 * Every donor, fund and missionary a review edit names must belong to the
 * gift's tenant. A staff-supplied fund must also be an ordinary designation.
 */
async function assertTenantReferences(input: {
  supabaseAdmin: Parameters<typeof loadStagedGiftById>[0]["supabaseAdmin"];
  tenantId: string;
  donorId: string | null | undefined;
  allocations: z.infer<typeof allocationSchema>[] | undefined;
}) {
  const references: Array<{
    table: "donors" | "funds" | "missionaries";
    label: string;
    ids: string[];
  }> = [
    {
      table: "donors",
      label: "donor",
      ids: input.donorId ? [input.donorId] : [],
    },
    {
      table: "funds",
      label: "fund",
      ids: (input.allocations ?? []).flatMap((allocation) =>
        allocation.fundId ? [allocation.fundId] : [],
      ),
    },
    {
      table: "missionaries",
      label: "missionary",
      ids: (input.allocations ?? []).flatMap((allocation) =>
        allocation.missionaryId ? [allocation.missionaryId] : [],
      ),
    },
  ];

  for (const reference of references) {
    const ids = Array.from(new Set(reference.ids));
    if (ids.length === 0) {
      continue;
    }

    const query = input.supabaseAdmin
      .from(reference.table)
      .select("id")
      .eq("tenant_id", input.tenantId)
      .in("id", ids);
    const { data, error } = await (reference.table === "funds"
      ? query.is("system_purpose", null)
      : query);
    if (error) {
      throw new Error(error.message);
    }

    if ((data ?? []).length !== ids.length) {
      throw new ApiHttpError(
        400,
        `Every ${reference.label} must belong to this organization.`,
      );
    }
  }
}

type FeeCoverLine = { fundId: string; amount: number };

async function loadFeeCoverLine(input: {
  supabaseAdmin: Parameters<typeof loadStagedGiftById>[0]["supabaseAdmin"];
  tenantId: string;
  stagedGiftId: string;
}): Promise<FeeCoverLine | null> {
  const stored = await input.supabaseAdmin
    .from("staged_gift_allocations")
    .select("fund_id, amount")
    .eq("tenant_id", input.tenantId)
    .eq("staged_gift_id", input.stagedGiftId);
  if (stored.error) {
    throw new Error(stored.error.message);
  }
  const rows = (stored.data ?? []) as {
    fund_id: string | null;
    amount: number;
  }[];
  const fundIds = Array.from(
    new Set(rows.flatMap((row) => (row.fund_id ? [row.fund_id] : []))),
  );
  if (fundIds.length === 0) {
    return null;
  }
  const fees = await input.supabaseAdmin
    .from("funds")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("system_purpose", "fee_cover")
    .in("id", fundIds);
  if (fees.error) {
    throw new Error(fees.error.message);
  }
  const feeFundIds = new Set(
    ((fees.data ?? []) as { id: string }[]).map((fund) => fund.id),
  );
  const line = rows.find((row) => row.fund_id && feeFundIds.has(row.fund_id));
  return line?.fund_id
    ? { fundId: line.fund_id, amount: Number(line.amount) }
    : null;
}

function withoutKeptFeeCoverLine(
  allocations: z.infer<typeof allocationSchema>[],
  feeLine: FeeCoverLine,
) {
  const fee = allocations.filter(
    (allocation) => allocation.fundId === feeLine.fundId,
  );
  if (
    fee.length !== 1 ||
    fee[0]!.amount !== feeLine.amount ||
    fee[0]!.missionaryId
  ) {
    throw new ApiHttpError(
      400,
      "A review keeps the fee-cover line as it was: its fund and amount.",
    );
  }
  return allocations.filter((allocation) => allocation !== fee[0]);
}

async function appendReviewAudit(input: {
  supabaseAdmin: Parameters<typeof loadStagedGiftById>[0]["supabaseAdmin"];
  tenantId: string;
  stagedGiftId: string;
  actorProfileId: string | null;
  action: string;
  note?: string | null;
  details?: Record<string, unknown>;
}) {
  const { error } = await input.supabaseAdmin
    .from("staged_gift_audit_events")
    .insert({
      tenant_id: input.tenantId,
      staged_gift_id: input.stagedGiftId,
      actor_profile_id: input.actorProfileId,
      action: input.action,
      note: input.note ?? null,
      details: input.details ?? {},
    });

  if (error) {
    throw new Error(error.message);
  }
}

/** SQLSTATE the replacement RPC raises when the gift's status has moved. */
const STAGED_GIFT_CHANGED = "40001";

/**
 * Replace a staged gift's allocation split through a tenant-scoped Postgres
 * RPC. The RPC locks the staged gift row, refuses when its status is no longer
 * `gift.status` (the status the caller checked), deletes the previous
 * allocation set and inserts the replacement rows in one transaction, so
 * concurrent PATCHes cannot interleave partial allocation state and a refund
 * or posting that lands after the check keeps its split. A refusal is a 409.
 */
export async function replaceStagedGiftAllocations(input: {
  supabaseAdmin: Parameters<typeof loadStagedGiftById>[0]["supabaseAdmin"];
  gift: { id: string; tenantId: string; status: StagedGiftStatus };
  allocations: z.infer<typeof allocationSchema>[];
}): Promise<void> {
  const { supabaseAdmin, gift, allocations } = input;

  const replacementRows = allocations.map((allocation) => ({
    fund_id: allocation.fundId ?? null,
    missionary_id: allocation.missionaryId ?? null,
    amount: allocation.amount,
    memo: allocation.memo ?? null,
  }));

  const { error } = await supabaseAdmin.rpc("replace_staged_gift_allocations", {
    p_tenant_id: gift.tenantId,
    p_staged_gift_id: gift.id,
    p_expected_status: gift.status,
    p_allocations: replacementRows,
  });
  if (error?.code === STAGED_GIFT_CHANGED) {
    throw new ApiHttpError(
      409,
      "The staged gift changed while its split was being saved. Reload it and check the split.",
    );
  }
  if (error) {
    throw new Error(error.message);
  }
}

export const GET = withPlatformOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      assertContributionPermission(auth, "finance:manage_contributions");
      const searchParams = new URL(request.url).searchParams;
      const statuses = searchParams
        .getAll("status")
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean);
      let query = supabaseAdmin
        .from("staged_gifts")
        .select("*")
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statuses.length > 0) {
        query = query.in("status", Array.from(new Set(statuses)));
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ rows: data ?? [], requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to load staged gifts.", requestId);
    }
  },
  { capability: "admin.gifts.manage" },
);

export const PATCH = withPlatformOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      assertContributionActionPermission(auth, "metadata_update");
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const body = reviewPatchSchema.parse(await ensureJsonBody(request));
      if (body.donorId !== undefined) {
        assertContributionActionPermission(auth, "donor_relink");
      }
      if (body.allocations) {
        assertContributionActionPermission(auth, "allocation_correction");
      }

      const gift = await loadStagedGiftById({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
      });

      // Every check runs before the first write, so a refused edit changes
      // nothing (NV-03).
      assertEditableStagedGift(gift, body.status);
      if (body.allocations) {
        const total = body.allocations.reduce(
          (sum, allocation) => sum + allocation.amount,
          0,
        );
        if (total !== gift.amount) {
          throw new ApiHttpError(
            400,
            "Allocation split must equal staged gift amount.",
          );
        }
      }
      const feeLine = body.allocations
        ? await loadFeeCoverLine({
            supabaseAdmin,
            tenantId: gift.tenantId,
            stagedGiftId: gift.id,
          })
        : null;
      await assertTenantReferences({
        supabaseAdmin,
        tenantId: gift.tenantId,
        donorId: body.donorId,
        allocations:
          body.allocations && feeLine
            ? withoutKeptFeeCoverLine(body.allocations, feeLine)
            : body.allocations,
      });

      const patch = {
        ...(body.donorId !== undefined
          ? {
              donor_id: body.donorId,
              donor_match_status: body.donorId ? "corrected" : "needs_review",
            }
          : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.note !== undefined ? { review_reason: body.note } : {}),
        updated_at: new Date().toISOString(),
      };
      // Conditional on the state that was checked: a gift posted, refunded or
      // otherwise moved since it was read matches no row.
      const updated = await supabaseAdmin
        .from("staged_gifts")
        .update(patch)
        .eq("id", gift.id)
        .eq("tenant_id", gift.tenantId)
        .eq("status", gift.status)
        .select("*")
        .maybeSingle();
      if (updated.error) {
        throw new Error(updated.error.message);
      }
      if (!updated.data) {
        throw new ApiHttpError(
          409,
          "The staged gift changed while it was being edited. Reload it and try again.",
        );
      }
      // The status that write checked and left the gift in.
      const statusAfterEdit: StagedGiftStatus = body.status ?? gift.status;

      // What became of the split, for the audit row. The write above is
      // saved by now, so an edit whose split is then refused is still audited
      // and still refreshes the lists before it answers 409 (council round 3).
      let split: "replaced" | "refused" | "replaced_gift_moved" | null = null;
      let splitRefusal: ApiHttpError | null = null;
      if (body.allocations) {
        try {
          // The RPC checks that status under the gift's lock, so a refund or
          // posting that landed since keeps its split and the edit answers
          // 409 (council round 2, B5).
          await replaceStagedGiftAllocations({
            supabaseAdmin,
            gift: {
              id: gift.id,
              tenantId: gift.tenantId,
              status: statusAfterEdit,
            },
            allocations: body.allocations,
          });
          split = "replaced";
        } catch (error) {
          if (!(error instanceof ApiHttpError) || error.status !== 409) {
            throw error;
          }
          split = "refused";
          splitRefusal = error;
        }

        if (split === "replaced") {
          // Recorded only while the gift is still in the state this edit
          // left it in; a gift posted or refunded meanwhile is reported, not
          // marked.
          const allocationStatus =
            body.allocations.length > 1 ? "split" : "corrected";
          const allocationPatch = await supabaseAdmin
            .from("staged_gifts")
            .update({
              allocation_status: allocationStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", gift.id)
            .eq("tenant_id", gift.tenantId)
            .eq("status", statusAfterEdit)
            .select("id")
            .maybeSingle();
          if (allocationPatch.error) {
            throw new Error(allocationPatch.error.message);
          }
          if (!allocationPatch.data) {
            split = "replaced_gift_moved";
            splitRefusal = new ApiHttpError(
              409,
              "The staged gift changed while its split was being saved. Reload it and check the split.",
            );
          }
        }
      }

      await appendReviewAudit({
        supabaseAdmin,
        tenantId: gift.tenantId,
        stagedGiftId: gift.id,
        actorProfileId: auth.profileId,
        action: "staged_gift_review_updated",
        note: body.note,
        details: {
          donorCorrected: body.donorId !== undefined,
          allocationCount: body.allocations?.length ?? null,
          status: body.status ?? null,
          ...(split ? { split } : {}),
        },
      });

      revalidateAdminContributionsCache(auth.tenantId);

      if (splitRefusal) {
        throw splitRefusal;
      }

      return NextResponse.json({ stagedGift: updated.data, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to update staged gift.", requestId);
    }
  },
  { capability: "contributions.apply_corrections" },
);

export const POST_APPROVE = withPlatformOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      assertContributionActionPermission(auth, "approve_staged_gift");
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const body = actionSchema.parse(await ensureJsonBody(request));
      // approveStagedGiftForFinance applies the state machine check itself.
      const stagedGift = await approveStagedGiftForFinance({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        note: body.note,
      });

      revalidateAdminContributionsCache(auth.tenantId);

      return NextResponse.json({ stagedGift, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to approve staged gift.",
        requestId,
      );
    }
  },
  { capability: "contributions.apply_corrections" },
);

export const POST_RETRY = withOperation(
  async ({ request, auth, requestId }) => {
    try {
      assertContributionActionPermission(auth, "retry_staged_gift");
      getStagedGiftIdFromPath(request);
      actionSchema.parse(await ensureJsonBody(request));
      rejectRetiredCrmPostingRetry();
    } catch (error) {
      return toErrorResponse(error, "Failed to retry staged gift.", requestId);
    }
  },
  { capability: "contributions.retry_crm_post" },
);

export const POST_RECEIPT = withPlatformOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      assertContributionActionPermission(auth, "resend_receipt");
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const gift = await loadStagedGiftById({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
      });
      assertReceiptableStagedGift(gift);
      await appendReviewAudit({
        action: "staged_gift_receipt_resend_requested",
        actorProfileId: auth.profileId,
        details: {
          receiptStatus: gift.receiptStatus,
          source: "mission_control_crm",
        },
        stagedGiftId: gift.id,
        supabaseAdmin,
        tenantId: gift.tenantId,
      });

      const receipt = await sendStagedGiftReceipt({
        supabaseAdmin,
        stagedGiftId: gift.id,
        tenantId: auth.tenantId,
      });
      await appendReviewAudit({
        action: "staged_gift_receipt_resent",
        actorProfileId: auth.profileId,
        details: {
          receiptStatus: receipt.status,
          sendLogId: receipt.sendLogId,
          source: "mission_control_crm",
        },
        stagedGiftId: gift.id,
        supabaseAdmin,
        tenantId: gift.tenantId,
      });

      revalidateAdminContributionsCache(auth.tenantId);

      return NextResponse.json({ receipt, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to send gift receipt.", requestId);
    }
  },
  { capability: "contributions.manage_receipts" },
);
