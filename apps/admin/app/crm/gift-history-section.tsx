"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";

import {
  DeleteNamedViewDialog,
  NamedViewNameDialog,
  SetTenantDefaultDialog,
  ViewSettingsResetDialog,
} from "./gift-history-dialogs";
import { GiftHistoryRows } from "./gift-history-rows";
import { GiftHistoryViewSettingsMenu } from "./gift-history-view-settings-menu";
import { GiftHistoryViewSwitcher } from "./gift-history-view-switcher";
import { useGiftHistoryViewController } from "./use-gift-history-view-controller";
import { ContributionOperationShell } from "../contributions/operation-shell";

import type { CrmDonorDetailResponse } from "@asym/database/types";

interface GiftHistorySectionProps {
  detail: CrmDonorDetailResponse | undefined;
  isLoading: boolean;
  onOpenGift: (donationId: string) => void;
  onRefresh: () => void | Promise<unknown>;
}

export function GiftHistorySection({
  detail,
  isLoading,
  onOpenGift,
  onRefresh,
}: GiftHistorySectionProps) {
  const giftHistory = useGiftHistoryViewController({ detail });

  return (
    <>
      {detail?.giftHistory.length ? (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Gift history
            </h3>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {giftHistory.giftRows.length}
              </Badge>
              {detail.giftHistoryTruncated ? (
                <Badge variant="outline" className="text-[10px]">
                  First 100 shown
                </Badge>
              ) : null}
              <GiftHistoryViewSwitcher
                views={giftHistory.namedViews}
                activeViewId={giftHistory.activeViewId}
                onApplyView={giftHistory.applyNamedView}
                onSaveCurrentAs={giftHistory.openCreateViewDialog}
                onRename={giftHistory.openRenameViewDialog}
                onDuplicate={giftHistory.openDuplicateViewDialog}
                onSetDefault={giftHistory.setDefaultView}
                onResetToSaved={giftHistory.applyNamedView}
                onDelete={giftHistory.openDeleteViewDialog}
              />
              <GiftHistoryViewSettingsMenu
                settings={giftHistory.viewSettings}
                canManageTenantDefaults={giftHistory.canManageTenantDefaults}
                onPatch={giftHistory.saveViewSettings}
                onRequestReset={giftHistory.requestViewSettingsReset}
                onRequestSetTenantDefault={giftHistory.requestSetTenantDefault}
              />
            </div>
          </div>
          {detail.giftHistoryTruncated ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Gift history is capped at the 100 most recent gifts.
            </p>
          ) : null}
          <GiftHistoryRows
            giftRows={giftHistory.giftRows}
            onOpenGift={onOpenGift}
            onPinRowAction={giftHistory.pinRowAction}
            onRunOperation={giftHistory.runInlineOperation}
            tablePreferences={giftHistory.tablePreferences}
            viewSettings={giftHistory.viewSettings}
          />
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading donor workflow history...
        </div>
      ) : null}

      <ContributionOperationShell
        open={giftHistory.inlineOperation !== null}
        onClose={giftHistory.closeInlineOperation}
        operation={giftHistory.inlineOperation?.operation ?? null}
        donationId={giftHistory.inlineOperation?.donationId ?? null}
        sourceSurface="donor_crm_record"
        onOpenFullDetail={(donationId) => {
          giftHistory.closeInlineOperation();
          onOpenGift(donationId);
        }}
        onRowRefresh={async () => {
          await onRefresh();
        }}
      />
      <ViewSettingsResetDialog
        description={giftHistory.resetPreview?.description}
        onCancel={giftHistory.closePendingReset}
        onConfirm={giftHistory.confirmPendingReset}
      />
      <SetTenantDefaultDialog
        open={giftHistory.pendingTenantDefault}
        isSaving={giftHistory.saveTenantDefaultPending}
        onCancel={giftHistory.closePendingTenantDefault}
        onConfirm={giftHistory.confirmSetTenantDefault}
      />
      <NamedViewNameDialog
        state={giftHistory.viewNameDialog}
        value={giftHistory.viewNameInput}
        onCancel={giftHistory.closeViewNameDialog}
        onSubmit={giftHistory.submitViewNameDialog}
        onValueChange={giftHistory.setViewNameInput}
      />
      <DeleteNamedViewDialog
        view={giftHistory.deleteViewDialog}
        views={giftHistory.namedViews}
        nextDefaultChoice={giftHistory.nextDefaultChoice}
        onCancel={giftHistory.closeDeleteViewDialog}
        onConfirm={giftHistory.confirmDeleteView}
        onNextDefaultChoiceChange={giftHistory.setNextDefaultChoice}
      />
    </>
  );
}
