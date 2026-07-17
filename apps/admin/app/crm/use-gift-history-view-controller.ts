"use client";

import { deriveGiftHistoryRows } from "@asym/api/admin/crm/gift-history-row-model";
import {
  CRM_GIFT_HISTORY_TABLE_ID,
  previewCrmViewSettingsReset,
  resolveCrmGiftHistoryViewSettings,
} from "@asym/api/admin/crm/table-preferences";
import {
  useCreateCrmNamedView,
  useCrmNamedViews,
  useCrmTablePreferences,
  useDeleteCrmNamedView,
  useSaveCrmRowActionPin,
  useSaveCrmTenantDefault,
  useSaveCrmViewSettings,
  useUpdateCrmNamedView,
} from "@asym/database/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  viewMutationErrorToast,
  type ViewSettingsPatch,
} from "./crm-detail-shared";

import type { OperationDefinition } from "../contributions/operation-shell";
import type {
  CrmDonorDetailResponse,
  CrmNamedView,
  CrmViewSettingsScope,
} from "@asym/database/types";

export type ViewNameDialogState =
  | { mode: "create" }
  | { mode: "rename"; view: CrmNamedView }
  | { mode: "duplicate"; view: CrmNamedView };

export function useGiftHistoryViewController({
  detail,
}: {
  detail: CrmDonorDetailResponse | undefined;
}) {
  const tablePreferencesQuery = useCrmTablePreferences(
    CRM_GIFT_HISTORY_TABLE_ID,
  );
  const savePinMutation = useSaveCrmRowActionPin(CRM_GIFT_HISTORY_TABLE_ID);
  const saveViewSettingsMutation = useSaveCrmViewSettings(
    CRM_GIFT_HISTORY_TABLE_ID,
  );
  const saveViewSettingsMutate = saveViewSettingsMutation.mutate;
  const saveTenantDefaultMutation = useSaveCrmTenantDefault(
    CRM_GIFT_HISTORY_TABLE_ID,
  );
  const namedViewsQuery = useCrmNamedViews(CRM_GIFT_HISTORY_TABLE_ID);
  const createViewMutation = useCreateCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);
  const updateViewMutation = useUpdateCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);
  const deleteViewMutation = useDeleteCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);

  const [inlineOperation, setInlineOperation] = useState<{
    donationId: string;
    operation: OperationDefinition;
  } | null>(null);
  const [pendingReset, setPendingReset] = useState<CrmViewSettingsScope | null>(
    null,
  );
  const [pendingTenantDefault, setPendingTenantDefault] = useState(false);
  const [viewNameDialog, setViewNameDialog] =
    useState<ViewNameDialogState | null>(null);
  const [viewNameInput, setViewNameInput] = useState("");
  const [deleteViewDialog, setDeleteViewDialog] = useState<CrmNamedView | null>(
    null,
  );
  const [nextDefaultChoice, setNextDefaultChoice] = useState("");

  const tablePreferences = tablePreferencesQuery.data;
  const namedViews = useMemo(
    () => namedViewsQuery.data?.views ?? [],
    [namedViewsQuery.data],
  );
  const activeViewId = tablePreferences?.user?.settings?.activeViewId ?? null;
  const viewSettings = useMemo(
    () =>
      resolveCrmGiftHistoryViewSettings({
        user: tablePreferences?.user?.settings ?? null,
        tenantDefault: tablePreferences?.tenantDefault?.settings ?? null,
      }).settings,
    [tablePreferences],
  );
  const giftRows = useMemo(
    () =>
      deriveGiftHistoryRows({
        gifts: detail?.giftHistory ?? [],
        filtersSort: viewSettings.filtersSort,
      }),
    [detail?.giftHistory, viewSettings.filtersSort],
  );

  const appliedDefaultViewRef = useRef(false);
  const defaultNamedView = useMemo(() => {
    if (!tablePreferencesQuery.data || tablePreferencesQuery.data.user) {
      return null;
    }
    return namedViews.find((view) => view.isDefault) ?? null;
  }, [namedViews, tablePreferencesQuery.data]);

  useEffect(() => {
    if (appliedDefaultViewRef.current || !defaultNamedView) {
      return;
    }

    appliedDefaultViewRef.current = true;
    saveViewSettingsMutate(viewSettingsPatchFromNamedView(defaultNamedView), {
      onError: (error) => {
        appliedDefaultViewRef.current = false;
        viewMutationErrorToast(error);
      },
    });
  }, [defaultNamedView, saveViewSettingsMutate]);

  const resetPreview = pendingReset
    ? previewCrmViewSettingsReset({
        scope: pendingReset,
        user: {
          settings: tablePreferences?.user?.settings ?? null,
          pinnedActionId: tablePreferences?.user?.actionId ?? null,
        },
        tenantDefault: {
          settings: tablePreferences?.tenantDefault?.settings ?? null,
          pinnedActionId: tablePreferences?.tenantDefault?.actionId ?? null,
        },
      })
    : null;

  const pinRowAction = (actionId: string | null) => {
    savePinMutation.mutate(actionId, {
      onError: viewMutationErrorToast,
    });
  };

  const saveViewSettings = (patch: ViewSettingsPatch) => {
    saveViewSettingsMutate(patch, {
      onError: viewMutationErrorToast,
    });
  };

  const applyNamedView = (view: CrmNamedView) => {
    saveViewSettingsMutate(viewSettingsPatchFromNamedView(view), {
      onError: viewMutationErrorToast,
    });
  };

  const submitViewNameDialog = () => {
    if (!viewNameDialog) {
      return;
    }

    const name = viewNameInput.trim();
    if (!name) {
      return;
    }

    switch (viewNameDialog.mode) {
      case "create":
        createViewMutation.mutate(
          {
            name,
            pinnedActionId: tablePreferences?.user?.actionId ?? null,
            columns: tablePreferences?.user?.settings?.columns ?? undefined,
            filtersSort:
              tablePreferences?.user?.settings?.filtersSort ?? undefined,
          },
          {
            onError: viewMutationErrorToast,
            onSuccess: ({ view }) => {
              saveViewSettings({ activeViewId: view.id });
            },
          },
        );
        break;
      case "rename":
        updateViewMutation.mutate(
          { viewId: viewNameDialog.view.id, name },
          { onError: viewMutationErrorToast },
        );
        break;
      case "duplicate":
        createViewMutation.mutate(
          {
            name,
            pinnedActionId: viewNameDialog.view.pinnedActionId,
            columns: viewNameDialog.view.settings?.columns ?? undefined,
            filtersSort: viewNameDialog.view.settings?.filtersSort ?? undefined,
          },
          { onError: viewMutationErrorToast },
        );
        break;
      default: {
        const exhaustiveDialog: never = viewNameDialog;
        return exhaustiveDialog;
      }
    }

    closeViewNameDialog();
  };

  const confirmDeleteView = () => {
    if (!deleteViewDialog) {
      return;
    }

    const deletingActive = deleteViewDialog.id === activeViewId;
    deleteViewMutation.mutate(
      {
        viewId: deleteViewDialog.id,
        nextDefaultViewId:
          deleteViewDialog.isDefault && nextDefaultChoice
            ? nextDefaultChoice
            : undefined,
      },
      {
        onError: viewMutationErrorToast,
        onSuccess: () => {
          if (deletingActive) {
            saveViewSettings({ activeViewId: null });
          }
        },
      },
    );
    closeDeleteViewDialog();
  };

  const confirmPendingReset = () => {
    if (!pendingReset) {
      return;
    }

    saveViewSettings(viewSettingsResetPatch(pendingReset));
    setPendingReset(null);
  };

  // Server-computed flag (#272): visibility follows the tenant-default write
  // gate (capability holders and delegated managers) exactly.
  const canManageTenantDefaults =
    tablePreferences?.canManageTenantDefaults === true;

  /**
   * Publishes the CURRENT resolved settings (user → tenant → system) and the
   * effective pinned row action as the tenant default (#272). Delegates on
   * the tenant default record are left unchanged.
   */
  const confirmSetTenantDefault = () => {
    const effectivePinnedActionId =
      tablePreferences?.user?.actionId ??
      tablePreferences?.tenantDefault?.actionId ??
      null;
    saveTenantDefaultMutation.mutate(
      {
        columns: viewSettings.columns,
        filtersSort: viewSettings.filtersSort,
        pinnedActionId: effectivePinnedActionId,
      },
      {
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to save the tenant default.",
          );
        },
        onSuccess: () => {
          toast.success("Tenant default updated for gift history.");
        },
      },
    );
    setPendingTenantDefault(false);
  };

  const closeViewNameDialog = () => {
    setViewNameDialog(null);
    setViewNameInput("");
  };

  const closeDeleteViewDialog = () => {
    setDeleteViewDialog(null);
    setNextDefaultChoice("");
  };

  return {
    activeViewId,
    applyNamedView,
    canManageTenantDefaults,
    closeDeleteViewDialog,
    closeInlineOperation: () => setInlineOperation(null),
    closePendingReset: () => setPendingReset(null),
    closePendingTenantDefault: () => setPendingTenantDefault(false),
    closeViewNameDialog,
    confirmDeleteView,
    confirmPendingReset,
    confirmSetTenantDefault,
    deleteViewDialog,
    isSavingTenantDefault: saveTenantDefaultMutation.isPending,
    giftRows,
    inlineOperation,
    namedViews,
    nextDefaultChoice,
    openCreateViewDialog: () => {
      setViewNameInput("");
      setViewNameDialog({ mode: "create" });
    },
    openDeleteViewDialog: (view: CrmNamedView) => {
      setNextDefaultChoice("");
      setDeleteViewDialog(view);
    },
    openDuplicateViewDialog: (view: CrmNamedView) => {
      setViewNameInput(`${view.name} copy`);
      setViewNameDialog({ mode: "duplicate", view });
    },
    openRenameViewDialog: (view: CrmNamedView) => {
      setViewNameInput(view.name);
      setViewNameDialog({ mode: "rename", view });
    },
    pendingTenantDefault,
    pinRowAction,
    requestSetTenantDefault: () => setPendingTenantDefault(true),
    requestViewSettingsReset: setPendingReset,
    resetPreview,
    saveTenantDefaultPending: saveTenantDefaultMutation.isPending,
    runInlineOperation: (donationId: string, operation: OperationDefinition) =>
      setInlineOperation({ donationId, operation }),
    saveViewSettings,
    setDefaultView: (view: CrmNamedView) =>
      updateViewMutation.mutate(
        { viewId: view.id, isDefault: true },
        { onError: viewMutationErrorToast },
      ),
    setNextDefaultChoice,
    setViewNameInput,
    submitViewNameDialog,
    tablePreferences,
    viewNameDialog,
    viewNameInput,
    viewSettings,
  };
}

function viewSettingsPatchFromNamedView(view: CrmNamedView): ViewSettingsPatch {
  return {
    columns: view.settings?.columns ?? null,
    filtersSort: view.settings?.filtersSort ?? null,
    pinnedActionId: view.pinnedActionId,
    activeViewId: view.id,
  };
}

function viewSettingsResetPatch(
  pendingReset: CrmViewSettingsScope,
): ViewSettingsPatch {
  switch (pendingReset) {
    case "columns":
      return { columns: null };
    case "filtersSort":
      return { filtersSort: null };
    case "pinnedAction":
      return { pinnedActionId: null };
    case "all":
      return { columns: null, filtersSort: null, pinnedActionId: null };
    default: {
      const exhaustiveScope: never = pendingReset;
      return exhaustiveScope;
    }
  }
}
