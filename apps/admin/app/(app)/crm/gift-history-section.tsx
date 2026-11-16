"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useId } from "react";

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

function GiftHistoryLoading() {
  return (
    <div role="status" className="flex flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">
        Loading donor workflow history...
      </p>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function GiftHistorySection({
  detail,
  isLoading,
  onOpenGift,
  onRefresh,
}: GiftHistorySectionProps) {
  const giftHistory = useGiftHistoryViewController({ detail });
  const headingId = useId();

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

  let body;
  if (detail?.giftHistory.length) {
    body = (
      // The heading's "First 100 shown" badge states the cap once.
      <GiftHistoryRows
        giftRows={giftHistory.giftRows}
        onOpenGift={onOpenGift}
        onPinRowAction={handleGiftHistoryPinRowAction}
        onRunOperation={handleGiftHistoryRunInlineOperation}
        tablePreferences={giftHistory.tablePreferences}
        viewSettings={giftHistory.viewSettings}
      />
    );
  } else if (isLoading) {
    body = <GiftHistoryLoading />;
  } else if (detail) {
    body = (
      <div className="rounded-lg border border-dashed p-4">
        <p className="text-sm font-medium">No gifts recorded yet</p>
        <p className="text-sm text-muted-foreground">
          Gifts appear here once this donor gives.
        </p>
      </div>
    );
  } else {
    body = null;
  }

  return (
    <>
      {body ? (
        <section aria-labelledby={headingId} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3
                id={headingId}
                className="text-sm font-semibold text-foreground"
              >
                Gift history
              </h3>
              {detail?.giftHistory.length ? (
                <>
                  <Badge variant="secondary">
                    {giftHistory.giftRows.length}
                  </Badge>
                  {detail.giftHistoryTruncated ? (
                    <Badge variant="outline">First 100 shown</Badge>
                  ) : null}
                </>
              ) : null}
            </div>
            {detail?.giftHistory.length ? (
              <div className="flex items-center gap-1">
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
            ) : null}
          </div>
          {body}
        </section>
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
