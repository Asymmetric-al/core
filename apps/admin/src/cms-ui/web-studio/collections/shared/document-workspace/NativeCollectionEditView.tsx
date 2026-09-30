"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import {
  DefaultEditView,
  PreviewButton,
  PublishButton,
  SaveButton,
  SaveDraftButton,
  UnpublishButton,
  useDocumentInfo,
  useDocumentTitle,
  useForm,
  useFormBackgroundProcessing,
  useFormInitializing,
  useFormModified,
  useFormProcessing,
  useFormSubmitted,
  useLivePreviewContext,
  usePreferences,
} from "@payloadcms/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileWarning,
  ImageIcon,
  Link2,
  Loader2,
  LockKeyhole,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { buildNativeDocumentStateItems } from "./editor-state";
import { NativeDocumentWorkspaceSettingsDialog } from "./NativeDocumentWorkspaceSettingsDialog";
import {
  buildWebStudioAuthenticatedPreviewPath,
  resolveDonorOrigin,
} from "../../../adapters/preview-url";
import { Link } from "../../../routing";
import { StudioLayout } from "../../../shell/studio-layout";
import { getWebStudioCollectionConfig } from "../../config";

import type { NativeDocumentStateTone } from "./editor-state";
import type {
  WebStudioCollectionConfig,
  WebStudioCollectionSlug,
} from "../../config";
import type { DocumentViewClientProps } from "payload";

function warnPreferenceDev(context: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[Web Studio] ${context}`, error);
  }
}

type RecentDocPreferenceEntry = {
  href: string;
  id: string;
  title: string;
  updatedAt?: string;
};

function isRecentDocPreferenceEntry(
  value: unknown,
): value is RecentDocPreferenceEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RecentDocPreferenceEntry>;
  return (
    typeof candidate.href === "string" &&
    candidate.href.length > 0 &&
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.length > 0
  );
}

const ghostSmLinkClass = buttonVariants({ variant: "ghost", size: "sm" });

export type NativeCollectionEditViewProps = DocumentViewClientProps & {
  studioCollection: WebStudioCollectionSlug;
};

function resolveAuthenticatedPreviewCollection(
  studioCollection: WebStudioCollectionSlug,
): "ministry-updates" | "missionary-giving-pages" | "project-pages" | "pages" {
  if (studioCollection === "ministry-updates") {
    return "ministry-updates";
  }
  if (studioCollection === "missionary-giving-pages") {
    return "missionary-giving-pages";
  }
  if (studioCollection === "project-pages") {
    return "project-pages";
  }
  return "pages";
}

function documentIdFromData(
  data: { id?: unknown } | null | undefined,
): string | null {
  return typeof data?.id === "string" || typeof data?.id === "number"
    ? String(data.id)
    : null;
}

function buildNativeInspectorItems({
  data,
  studioCollection,
  studioConfig,
  unpublishedVersionCount,
  versionCount,
}: {
  data: Record<string, unknown> | null | undefined;
  studioCollection: WebStudioCollectionSlug;
  studioConfig: WebStudioCollectionConfig;
  unpublishedVersionCount: number | undefined;
  versionCount: number | undefined;
}): Array<{ icon: ReactNode; label: string; value: string }> {
  const inspectorItems: Array<{
    icon: ReactNode;
    label: string;
    value: string;
  }> = [
    {
      icon: <Link2 className="size-3.5" />,
      label: "Document ID",
      value:
        typeof data?.id === "string" || typeof data?.id === "number"
          ? String(data.id)
          : "Unsaved",
    },
  ];

  if (typeof data?.tenant === "string") {
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Tenant",
      value: data.tenant,
    });
  } else if (
    data?.tenant &&
    typeof data.tenant === "object" &&
    "id" in data.tenant
  ) {
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Tenant",
      value: String((data.tenant as { id: unknown }).id),
    });
  }

  if (studioCollection === "navigation" && Array.isArray(data?.items)) {
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Nav items",
      value: String(data.items.length),
    });
  }

  if (studioCollection === "missionary-profiles") {
    inspectorItems.push({
      icon: <ImageIcon className="size-3.5" />,
      label: "Portrait",
      value: data?.portrait ? "Linked" : "Missing",
    });
  }

  if (studioCollection === "ministry-updates") {
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Missionary",
      value: data?.missionary ? "Linked" : "Missing",
    });
  }

  if (studioCollection === "media") {
    inspectorItems.push({
      icon: <ImageIcon className="size-3.5" />,
      label: "Asset",
      value:
        typeof data?.filename === "string" ? data.filename : "Upload pending",
    });
  }

  if (studioConfig.hasVersions) {
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Versions",
      value: String(versionCount),
    });
    inspectorItems.push({
      icon: <Link2 className="size-3.5" />,
      label: "Unpublished",
      value: String(unpublishedVersionCount),
    });
  }

  return inspectorItems;
}

function resolveNativeCollectionEditModel({
  collectionSlug,
  data,
  documentId,
  hasSavePermission,
  isLivePreviewEnabled,
  previewSupported,
  studioCollection,
  studioConfig,
  title,
  unpublishedVersionCount,
  versionCount,
}: {
  collectionSlug: string | undefined;
  data: Record<string, unknown> | null | undefined;
  documentId: string | null;
  hasSavePermission: boolean | undefined;
  isLivePreviewEnabled: boolean | undefined;
  previewSupported: boolean;
  studioCollection: WebStudioCollectionSlug;
  studioConfig: WebStudioCollectionConfig;
  title: string | undefined;
  unpublishedVersionCount: number | undefined;
  versionCount: number | undefined;
}) {
  const authenticatedPreviewURL =
    previewSupported && documentId
      ? buildWebStudioAuthenticatedPreviewPath({
          collectionSlug:
            resolveAuthenticatedPreviewCollection(studioCollection),
          id: documentId,
        })
      : null;
  const publicPreviewPath = studioConfig.previewPathForData?.(
    data ?? undefined,
  );
  const publicPreviewURL = publicPreviewPath
    ? `${resolveDonorOrigin()}${publicPreviewPath}`
    : null;
  const slugOrIdentifier =
    typeof data?.slug === "string" && data.slug.length > 0
      ? data.slug === "home"
        ? "/"
        : `/${data.slug}`
      : documentId;
  const status =
    data?._status === "published"
      ? "Published"
      : data?._status === "draft"
        ? "Draft"
        : "Saved";
  const readOnly = !hasSavePermission;
  const heading =
    title || `Untitled ${studioConfig.titleSingular.toLowerCase()}`;
  const actionMode = studioConfig.hasDrafts
    ? {
        showPublish: true,
        showSaveDraft: true,
        showUnpublish: true,
      }
    : {
        showPublish: false,
        showSaveDraft: false,
        showUnpublish: false,
      };
  const apiHref =
    collectionSlug && documentId
      ? `${studioConfig.listPath}/${documentId}/api`
      : null;
  const versionsHref =
    studioConfig.hasVersions && collectionSlug && documentId
      ? `${studioConfig.listPath}/${documentId}/versions`
      : null;
  const livePreviewHref =
    isLivePreviewEnabled && collectionSlug && documentId
      ? `${studioConfig.listPath}/${documentId}/preview`
      : null;
  const inspectorItems = buildNativeInspectorItems({
    data,
    studioCollection,
    studioConfig,
    unpublishedVersionCount,
    versionCount,
  });
  const mediaPreviewUrl =
    studioCollection === "media" && typeof data?.url === "string"
      ? data.url
      : null;

  return {
    actionMode,
    apiHref,
    authenticatedPreviewURL,
    heading,
    inspectorItems,
    livePreviewHref,
    mediaPreviewUrl,
    publicPreviewURL,
    readOnly,
    slugOrIdentifier,
    statusLabel: status,
    versionsHref,
  };
}

function useNativeCollectionWorkspace({
  dataId,
  getPreference,
  setPreference,
  studioCollection,
  studioConfig,
  title,
}: {
  dataId: unknown;
  getPreference: ReturnType<typeof usePreferences>["getPreference"];
  setPreference: ReturnType<typeof usePreferences>["setPreference"];
  studioCollection: WebStudioCollectionSlug;
  studioConfig: WebStudioCollectionConfig;
  title: string | undefined;
}) {
  const [workspace, setWorkspace] = useState({
    inspectorOpen: true,
    showSlugChip: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsOpenChange = useCallback(
    (open: boolean) => {
      setSettingsOpen(open);
      if (!open) {
        void (async () => {
          try {
            const pref = await getPreference<{
              inspectorOpen?: boolean;
              showSlugChip?: boolean;
            }>(studioConfig.preferences.workspace);
            if (!pref) return;
            setWorkspace({
              inspectorOpen:
                typeof pref.inspectorOpen === "boolean"
                  ? pref.inspectorOpen
                  : true,
              showSlugChip:
                typeof pref.showSlugChip === "boolean"
                  ? pref.showSlugChip
                  : true,
            });
          } catch {
            /* ignore */
          }
        })();
      }
    },
    [
      getPreference,
      setSettingsOpen,
      setWorkspace,
      studioConfig.preferences.workspace,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const pref = await getPreference<{
          inspectorOpen?: boolean;
          showSlugChip?: boolean;
        }>(studioConfig.preferences.workspace);

        if (cancelled || !pref) {
          return;
        }

        setWorkspace({
          inspectorOpen:
            typeof pref.inspectorOpen === "boolean" ? pref.inspectorOpen : true,
          showSlugChip:
            typeof pref.showSlugChip === "boolean" ? pref.showSlugChip : true,
        });
      } catch (error) {
        warnPreferenceDev("workspace preference read failed", error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // `studioCollection`: re-hydrate when navigating between native collections even if the
    // workspace preference key string were unchanged (defensive); ESLint allows this here.
  }, [getPreference, studioCollection, studioConfig.preferences.workspace]);

  useEffect(() => {
    const identifier =
      typeof dataId === "string" || typeof dataId === "number"
        ? String(dataId)
        : null;
    const titleValue = typeof title === "string" ? title : null;
    if (!identifier || !titleValue) {
      return;
    }

    void (async () => {
      const rawExisting =
        (await getPreference<unknown>(
          studioConfig.preferences.recentDocs,
        ).catch((error: unknown) => {
          warnPreferenceDev("recent docs preference read failed", error);
          return [];
        })) ?? [];
      const existing = Array.isArray(rawExisting)
        ? rawExisting.filter(isRecentDocPreferenceEntry)
        : [];
      const next = [
        {
          id: identifier,
          title: titleValue,
          href: `${studioConfig.listPath}/${identifier}`,
          updatedAt: new Date().toISOString(),
        },
        ...existing.filter((entry) => entry.id !== identifier),
      ].slice(0, 6);

      await setPreference(studioConfig.preferences.recentDocs, next).catch(
        (error: unknown) => {
          warnPreferenceDev("recent docs preference write failed", error);
        },
      );
    })();
  }, [
    dataId,
    getPreference,
    setPreference,
    studioConfig.listPath,
    studioConfig.preferences.recentDocs,
    title,
  ]);

  return {
    handleSettingsOpenChange,
    setSettingsOpen,
    settingsOpen,
    workspace,
  };
}

function NativeCollectionEditHeader({
  heading,
  primaryState,
  readOnly,
  showSlugChip,
  slugOrIdentifier,
  statusLabel,
  studioConfig,
}: {
  heading: string;
  primaryState: { label?: string; tone?: string } | undefined;
  readOnly: boolean;
  showSlugChip: boolean;
  slugOrIdentifier: string | null;
  statusLabel: string;
  studioConfig: WebStudioCollectionConfig;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="truncate font-semibold text-foreground text-xl tracking-tight sm:text-2xl">
          {heading}
        </h1>
        {showSlugChip && slugOrIdentifier ? (
          <Badge
            variant="secondary"
            className="font-mono text-[10px] uppercase"
          >
            {slugOrIdentifier}
          </Badge>
        ) : null}
        <Badge variant="outline" className="text-[10px] uppercase">
          {statusLabel}
        </Badge>
        <Badge
          variant={
            primaryState?.tone === "danger" ? "destructive" : "secondary"
          }
          className="text-[10px] uppercase"
        >
          {primaryState?.label}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">
        {readOnly
          ? `You can view this ${studioConfig.titleSingular.toLowerCase()} but do not have save access.`
          : studioConfig.editDescription}
      </p>
    </div>
  );
}

function NativeCollectionEditActions({
  actionMode,
  apiHref,
  collectionSlug,
  hasPublishPermission,
  hasSavePermission,
  livePreviewHref,
  onOpenSettings,
  previewSupported,
  versionsHref,
}: {
  actionMode: {
    showPublish: boolean;
    showSaveDraft: boolean;
    showUnpublish: boolean;
  };
  apiHref: string | null;
  collectionSlug: string | undefined;
  hasPublishPermission: boolean | undefined;
  hasSavePermission: boolean | undefined;
  livePreviewHref: string | null;
  onOpenSettings: () => void;
  previewSupported: boolean;
  versionsHref: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {previewSupported ? <PreviewButton /> : null}
      {hasSavePermission ? (
        actionMode.showSaveDraft ? (
          <SaveDraftButton />
        ) : (
          <SaveButton />
        )
      ) : null}
      {hasPublishPermission && actionMode.showPublish ? (
        <PublishButton />
      ) : null}
      {hasPublishPermission && actionMode.showUnpublish ? (
        <UnpublishButton />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="font-semibold"
        onClick={onOpenSettings}
      >
        <Settings2 className="mr-2 size-4" />
        Workspace
      </Button>
      {collectionSlug ? (
        <Link
          href={`/web-studio/collections/${collectionSlug}`}
          className={ghostSmLinkClass}
        >
          Back to list
        </Link>
      ) : null}
      {versionsHref ? (
        <Link href={versionsHref} className={ghostSmLinkClass}>
          Versions
        </Link>
      ) : null}
      {apiHref ? (
        <Link href={apiHref} className={ghostSmLinkClass}>
          API
        </Link>
      ) : null}
      {livePreviewHref ? (
        <Link href={livePreviewHref} className={ghostSmLinkClass}>
          Live preview
        </Link>
      ) : null}
    </div>
  );
}

function NativeCollectionInspector({
  data,
  docPermissions,
  hasPublishPermission,
  heading,
  inspectorItems,
  mediaPreviewUrl,
  previewSupported,
  previewURL,
  publicPreviewURL,
}: {
  data: Record<string, unknown> | null | undefined;
  docPermissions: { read?: boolean; update?: boolean } | null | undefined;
  hasPublishPermission: boolean | undefined;
  heading: string;
  inspectorItems: Array<{ icon: ReactNode; label: string; value: string }>;
  mediaPreviewUrl: string | null;
  previewSupported: boolean;
  previewURL: string | undefined;
  publicPreviewURL: string | null;
}) {
  return (
    <aside className="mt-6 hidden rounded-lg border border-border bg-muted/30 p-4 text-muted-foreground text-xs lg:mt-0 lg:block">
      <p className="mb-2 font-semibold text-foreground uppercase tracking-wide">
        Inspector
      </p>
      <p>
        Document fields remain on Payload&apos;s document form engine while Web
        Studio owns the surrounding workspace and action framing.
      </p>
      {mediaPreviewUrl ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
          <Image
            alt={typeof data?.alt === "string" ? data.alt : heading}
            className="h-40 w-full object-cover"
            height={160}
            src={mediaPreviewUrl}
            unoptimized
            width={640}
          />
        </div>
      ) : null}
      <ul className="mt-4 space-y-2">
        {inspectorItems.map((item) => (
          <li
            key={`${item.label}-${item.value}`}
            className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2"
          >
            <span className="flex items-center gap-2 text-foreground">
              {item.icon}
              {item.label}
            </span>
            <span className="max-w-[11rem] truncate text-right">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
      {docPermissions ? (
        <ul className="mt-3 list-disc space-y-1 pl-4">
          <li>Read: {docPermissions.read ? "yes" : "no"}</li>
          <li>Update: {docPermissions.update ? "yes" : "no"}</li>
          <li>Publish: {hasPublishPermission ? "yes" : "no"}</li>
        </ul>
      ) : null}
      {previewSupported && previewURL ? (
        <a
          href={previewURL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4 w-full",
          )}
        >
          <ExternalLink className="mr-2 size-4" />
          Open preview
        </a>
      ) : null}
      {publicPreviewURL && data?._status === "published" ? (
        <a
          href={publicPreviewURL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mt-2 w-full",
          )}
        >
          <ExternalLink className="mr-2 size-4" />
          Open published page
        </a>
      ) : null}
    </aside>
  );
}

export function NativeCollectionEditView({
  studioCollection,
  ...props
}: NativeCollectionEditViewProps) {
  const studioConfig = getWebStudioCollectionConfig(studioCollection);
  const { title } = useDocumentTitle();
  const {
    collectionSlug,
    data,
    docPermissions,
    documentIsLocked,
    hasPublishedDoc,
    hasPublishPermission,
    hasSavePermission,
    isInitializing: documentIsInitializing,
    isTrashed,
    mostRecentVersionIsAutosaved,
    unpublishedVersionCount,
    uploadStatus,
    versionCount,
  } = useDocumentInfo();
  const { isLivePreviewEnabled, previewURL, setPreviewURL } =
    useLivePreviewContext();
  const { getPreference, setPreference } = usePreferences();
  const form = useForm();
  const backgroundProcessing = useFormBackgroundProcessing();
  const formInitializing = useFormInitializing();
  const modified = useFormModified();
  const processing = useFormProcessing();
  const submitted = useFormSubmitted();
  const documentId = documentIdFromData(data);
  const previewSupported = studioConfig.previewMode !== "none";
  const model = resolveNativeCollectionEditModel({
    collectionSlug,
    data: data as Record<string, unknown> | null | undefined,
    documentId,
    hasSavePermission,
    isLivePreviewEnabled,
    previewSupported,
    studioCollection,
    studioConfig,
    title,
    unpublishedVersionCount,
    versionCount,
  });
  const { handleSettingsOpenChange, setSettingsOpen, settingsOpen, workspace } =
    useNativeCollectionWorkspace({
      dataId: data?.id,
      getPreference,
      setPreference,
      studioCollection,
      studioConfig,
      title,
    });

  useEffect(() => {
    if (!model.authenticatedPreviewURL) {
      return;
    }

    if (previewURL !== model.authenticatedPreviewURL) {
      setPreviewURL(model.authenticatedPreviewURL);
    }
  }, [model.authenticatedPreviewURL, previewURL, setPreviewURL]);

  const stateItems = buildNativeDocumentStateItems({
    backgroundProcessing,
    documentId,
    documentIsLocked: Boolean(documentIsLocked),
    hasDrafts: studioConfig.hasDrafts,
    hasPublishedDoc: Boolean(hasPublishedDoc),
    isTrashed: Boolean(isTrashed),
    isValid: form.isValid,
    modified,
    mostRecentVersionIsAutosaved: Boolean(mostRecentVersionIsAutosaved),
    previewSupported,
    previewURL: model.authenticatedPreviewURL,
    processing: processing || documentIsInitializing || formInitializing,
    status: data?._status,
    submitted,
    unpublishedVersionCount,
    uploadStatus,
  });
  const primaryState = stateItems[0];

  return (
    <div data-web-studio-native-document="true">
      <StudioLayout
        sectionLabel={studioConfig.sectionLabel}
        currentLabel={model.heading}
      >
        <div className="border-border border-b bg-card/40 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <NativeCollectionEditHeader
              heading={model.heading}
              primaryState={primaryState}
              readOnly={model.readOnly}
              showSlugChip={workspace.showSlugChip}
              slugOrIdentifier={model.slugOrIdentifier}
              statusLabel={model.statusLabel}
              studioConfig={studioConfig}
            />
            <NativeCollectionEditActions
              actionMode={model.actionMode}
              apiHref={model.apiHref}
              collectionSlug={collectionSlug}
              hasPublishPermission={hasPublishPermission}
              hasSavePermission={hasSavePermission}
              livePreviewHref={model.livePreviewHref}
              onOpenSettings={() => setSettingsOpen(true)}
              previewSupported={previewSupported}
              versionsHref={model.versionsHref}
            />
          </div>
        </div>

        <NativeDocumentWorkspaceSettingsDialog
          open={settingsOpen}
          onOpenChange={handleSettingsOpenChange}
          preferenceKey={studioConfig.preferences.workspace}
          sectionLabel={studioConfig.sectionLabel}
        />

        <div
          className={cn(
            "px-2 py-6 sm:px-4 lg:px-6",
            workspace.inspectorOpen &&
              "lg:grid lg:grid-cols-[minmax(0,1fr)_min(320px,32%)] lg:gap-6",
          )}
        >
          <div className="payload-native-edit min-w-0 rounded-lg border border-border bg-card shadow-sm">
            <NativeDocumentStateStrip items={stateItems} />
            <DefaultEditView
              {...props}
              BeforeDocumentControls={undefined}
              PreviewButton={null}
              PublishButton={null}
              SaveButton={null}
              SaveDraftButton={null}
              Status={null}
              UnpublishButton={null}
            />
          </div>
          {workspace.inspectorOpen ? (
            <NativeCollectionInspector
              data={data as Record<string, unknown> | null | undefined}
              docPermissions={docPermissions}
              hasPublishPermission={hasPublishPermission}
              heading={model.heading}
              inspectorItems={model.inspectorItems}
              mediaPreviewUrl={model.mediaPreviewUrl}
              previewSupported={previewSupported}
              previewURL={previewURL}
              publicPreviewURL={model.publicPreviewURL}
            />
          ) : null}
        </div>
      </StudioLayout>
    </div>
  );
}

const stateToneClass: Record<NativeDocumentStateTone, string> = {
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-primary/25 bg-primary/10 text-primary",
  muted: "border-border bg-muted/40 text-muted-foreground",
  success: "border-chart-2/25 bg-chart-2/10 text-chart-2",
  warning: "border-chart-4/25 bg-chart-4/10 text-chart-4",
};

function NativeDocumentStateStrip({
  items,
}: {
  items: ReturnType<typeof buildNativeDocumentStateItems>;
}) {
  const iconMap = {
    autosave: Clock3,
    editing: Loader2,
    preview: Eye,
    publication: ShieldCheck,
  } as const;

  return (
    <section
      aria-label="Document state"
      className="grid gap-2 border-border border-b bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((item) => {
        const Icon =
          item.id === "editing" && item.tone === "danger"
            ? AlertTriangle
            : item.id === "editing" && item.tone === "warning"
              ? FileWarning
              : item.id === "editing" && item.label === "Locked"
                ? LockKeyhole
                : item.tone === "success"
                  ? CheckCircle2
                  : iconMap[item.id];

        return (
          <div
            key={item.id}
            className={cn(
              "min-w-0 rounded-lg border px-3 py-2",
              stateToneClass[item.tone],
            )}
          >
            <p className="flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wide">
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug">
              {item.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
