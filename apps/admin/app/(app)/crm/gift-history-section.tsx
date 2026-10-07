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

  const handleGiftHistoryApplyNamedView = giftHistory.applyNamedView;
  const handleGiftHistoryOpenCreateViewDialog =
    giftHistory.openCreateViewDialog;
  const handleGiftHistoryOpenRenameViewDialog =
    giftHistory.openRenameViewDialog;
  const handleGiftHistoryOpenDuplicateViewDialog =
    giftHistory.openDuplicateViewDialog;
  const handleGiftHistorySetDefaultView = giftHistory.setDefaultView;
  const handleGiftHistoryOpenDeleteViewDialog =
    giftHistory.openDeleteViewDialog;
  const handleGiftHistorySaveViewSettings = giftHistory.saveViewSettings;
  const handleGiftHistoryRequestViewSettingsReset =
    giftHistory.requestViewSettingsReset;
  const handleGiftHistoryRequestSetTenantDefault =
    giftHistory.requestSetTenantDefault;
  const handleGiftHistoryPinRowAction = giftHistory.pinRowAction;
  const handleGiftHistoryRunInlineOperation = giftHistory.runInlineOperation;
  const handleGiftHistoryCloseInlineOperation =
    giftHistory.closeInlineOperation;
  const handleGiftHistoryClosePendingReset = giftHistory.closePendingReset;
  const handleGiftHistoryConfirmPendingReset = giftHistory.confirmPendingReset;
  const handleGiftHistoryClosePendingTenantDefault =
    giftHistory.closePendingTenantDefault;
  const handleGiftHistoryConfirmSetTenantDefault =
    giftHistory.confirmSetTenantDefault;
  const handleGiftHistoryCloseViewNameDialog = giftHistory.closeViewNameDialog;
  const handleGiftHistorySubmitViewNameDialog =
    giftHistory.submitViewNameDialog;
  const handleGiftHistorySetViewNameInput = giftHistory.setViewNameInput;
  const handleGiftHistoryCloseDeleteViewDialog =
    giftHistory.closeDeleteViewDialog;
  const handleGiftHistoryConfirmDeleteView = giftHistory.confirmDeleteView;
  const handleGiftHistorySetNextDefaultChoice =
    giftHistory.setNextDefaultChoice;
  return (
    <>
      {detail?.giftHistory.length ? (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Gift history
            </h3>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="">
                {giftHistory.giftRows.length}
              </Badge>
              {detail.giftHistoryTruncated ? (
                <Badge variant="outline" className="">
                  First 100 shown
                </Badge>
              ) : null}
              <GiftHistoryViewSwitcher
                views={giftHistory.namedViews}
                activeViewId={giftHistory.activeViewId}
                onApplyView={handleGiftHistoryApplyNamedView}
                onSaveCurrentAs={handleGiftHistoryOpenCreateViewDialog}
                onRename={handleGiftHistoryOpenRenameViewDialog}
                onDuplicate={handleGiftHistoryOpenDuplicateViewDialog}
                onSetDefault={handleGiftHistorySetDefaultView}
                onResetToSaved={handleGiftHistoryApplyNamedView}
                onDelete={handleGiftHistoryOpenDeleteViewDialog}
              />
              <GiftHistoryViewSettingsMenu
                settings={giftHistory.viewSettings}
                canManageTenantDefaults={giftHistory.canManageTenantDefaults}
                onPatch={handleGiftHistorySaveViewSettings}
                onRequestReset={handleGiftHistoryRequestViewSettingsReset}
                onRequestSetTenantDefault={
                  handleGiftHistoryRequestSetTenantDefault
                }
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
            onPinRowAction={handleGiftHistoryPinRowAction}
            onRunOperation={handleGiftHistoryRunInlineOperation}
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
        onClose={handleGiftHistoryCloseInlineOperation}
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
        onCancel={handleGiftHistoryClosePendingReset}
        onConfirm={handleGiftHistoryConfirmPendingReset}
      />
      <SetTenantDefaultDialog
        open={giftHistory.pendingTenantDefault}
        isSaving={giftHistory.saveTenantDefaultPending}
        onCancel={handleGiftHistoryClosePendingTenantDefault}
        onConfirm={handleGiftHistoryConfirmSetTenantDefault}
      />
      <NamedViewNameDialog
        state={giftHistory.viewNameDialog}
        value={giftHistory.viewNameInput}
        onCancel={handleGiftHistoryCloseViewNameDialog}
        onSubmit={handleGiftHistorySubmitViewNameDialog}
        onValueChange={handleGiftHistorySetViewNameInput}
      />
      <DeleteNamedViewDialog
        view={giftHistory.deleteViewDialog}
        views={giftHistory.namedViews}
        nextDefaultChoice={giftHistory.nextDefaultChoice}
        onCancel={handleGiftHistoryCloseDeleteViewDialog}
        onConfirm={handleGiftHistoryConfirmDeleteView}
        onNextDefaultChoiceChange={handleGiftHistorySetNextDefaultChoice}
      />
    </>
  );
}
