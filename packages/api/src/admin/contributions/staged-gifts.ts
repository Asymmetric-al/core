import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveCrmSyncRuntimeConfig } from "../../crm/sync/config";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import {
  loadStagedGiftById,
  queueStagedGiftPostingToTwenty,
  retryStagedGiftPostingToTwenty,
} from "../../giving/staged-gifts";
import { revalidateAdminContributionsCache } from "../../shared/cache-tags";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

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

type StagedGiftAllocationRow = {
  tenant_id: string;
  staged_gift_id: string;
  fund_id: string | null;
  missionary_id: string | null;
  amount: number;
  memo: string | null;
};

/**
 * Replace a staged gift's allocation split as a delete-then-insert, restoring
 * the original rows if the replacement insert fails.
 *
 * `staged_gift_allocations` has no route-level transaction (see the giving
 * guide), so a failed insert after the delete would otherwise leave a
 * reviewed gift with zero allocations on a money table. We snapshot the
 * existing rows first and, on insert failure, re-insert them (a compensating
 * write) before surfacing the original error. If the restore itself fails,
 * both errors are reported so an operator can reconcile manually.
 */
export async function replaceStagedGiftAllocations(input: {
  supabaseAdmin: Parameters<typeof loadStagedGiftById>[0]["supabaseAdmin"];
  gift: { id: string; tenantId: string };
  allocations: z.infer<typeof allocationSchema>[];
}): Promise<void> {
  const { supabaseAdmin, gift, allocations } = input;

  const existing = await supabaseAdmin
    .from("staged_gift_allocations")
    .select("tenant_id, staged_gift_id, fund_id, missionary_id, amount, memo")
    .eq("staged_gift_id", gift.id);
  if (existing.error) {
    throw new Error(existing.error.message);
  }
  const originalRows = (existing.data ?? []) as StagedGiftAllocationRow[];

  const deleteResult = await supabaseAdmin
    .from("staged_gift_allocations")
    .delete()
    .eq("staged_gift_id", gift.id);
  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  const replacementRows: StagedGiftAllocationRow[] = allocations.map(
    (allocation) => ({
      tenant_id: gift.tenantId,
      staged_gift_id: gift.id,
      fund_id: allocation.fundId ?? null,
      missionary_id: allocation.missionaryId ?? null,
      amount: allocation.amount,
      memo: allocation.memo ?? null,
    }),
  );

  const insertResult = await supabaseAdmin
    .from("staged_gift_allocations")
    .insert(replacementRows);
  if (!insertResult.error) {
    return;
  }

  // Compensating write: the replacement insert failed after the original
  // rows were deleted. Restore them so the gift is never left without
  // allocations.
  if (originalRows.length > 0) {
    const restore = await supabaseAdmin
      .from("staged_gift_allocations")
      .insert(originalRows);
    if (restore.error) {
      throw new Error(
        `Failed to replace staged gift allocations (${insertResult.error.message}); ` +
          `original allocations could not be restored (${restore.error.message}). ` +
          `Staged gift ${gift.id} requires manual reconciliation.`,
      );
    }
  }

  throw new Error(insertResult.error.message);
}

export const GET = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
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
  { roles: ["staff", "admin", "super_admin"] },
);

export const PATCH = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const body = reviewPatchSchema.parse(await ensureJsonBody(request));
      const gift = await loadStagedGiftById({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
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
      const updated = await supabaseAdmin
        .from("staged_gifts")
        .update(patch)
        .eq("id", gift.id)
        .select("*")
        .single();
      if (updated.error) {
        throw new Error(updated.error.message);
      }

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

        await replaceStagedGiftAllocations({
          supabaseAdmin,
          gift: { id: gift.id, tenantId: gift.tenantId },
          allocations: body.allocations,
        });

        const allocationStatus =
          body.allocations.length > 1 ? "split" : "corrected";
        const allocationPatch = await supabaseAdmin
          .from("staged_gifts")
          .update({
            allocation_status: allocationStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", gift.id);
        if (allocationPatch.error) {
          throw new Error(allocationPatch.error.message);
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
        },
      });

      revalidateAdminContributionsCache(auth.tenantId);

      return NextResponse.json({ stagedGift: updated.data, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to update staged gift.", requestId);
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST_APPROVE = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const body = actionSchema.parse(await ensureJsonBody(request));
      const stagedGift = await queueStagedGiftPostingToTwenty({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        note: body.note,
        crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
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
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST_RETRY = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const body = actionSchema.parse(await ensureJsonBody(request));
      const stagedGift = await retryStagedGiftPostingToTwenty({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        note: body.note,
        crmConfig: resolveCrmSyncRuntimeConfig(serverEnv),
      });

      revalidateAdminContributionsCache(auth.tenantId);

      return NextResponse.json({ stagedGift, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to retry staged gift.", requestId);
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST_RECEIPT = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const stagedGiftId = getStagedGiftIdFromPath(request);
      const gift = await loadStagedGiftById({
        supabaseAdmin,
        stagedGiftId,
        tenantId: auth.tenantId,
      });
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
  { roles: ["staff", "admin", "super_admin"] },
);
