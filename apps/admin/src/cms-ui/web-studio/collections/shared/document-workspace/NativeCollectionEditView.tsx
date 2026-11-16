"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import {
  DefaultEditView,
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
import { ChevronDown, ChevronUp, ExternalLink, Settings2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { DocumentPinToggle } from "./document-pin-toggle";
import {
  DocumentPreviewLinks,
  DocumentPreviewMenu,
} from "./document-preview-links";
import { NativeDocumentSubtitle } from "./document-subtitle";
import {
  buildNativeDocumentStateItems,
  describeUnpublishedVersions,
  documentHeading,
  glanceNativeDocumentStateItems,
} from "./editor-state";
import { NativeRevertToPublished } from "./native-revert-status";
import { NativeDocumentWorkspaceSettingsDialog } from "./NativeDocumentWorkspaceSettingsDialog";
import { usePopupTriggerRoles } from "./popup-trigger-roles";
import { usePublishedPageURL } from "./use-published-page-url";
import { buildWebStudioAuthenticatedPreviewPath } from "../../../adapters/preview-url";
import { Link } from "../../../routing";
import { StudioLayout } from "../../../shell/studio-layout";
import { getWebStudioCollectionConfig } from "../../config";
import { DocumentReference } from "../list-workspace/document-reference";

import type { NativeDocumentStateTone } from "./editor-state";
import type {
  WebStudioCollectionConfig,
  WebStudioCollectionSlug,
} from "../../config";
import type { DocumentViewClientProps } from "payload";
import type { ReactNode } from "react";

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

export type NativeCollectionEditViewProps = DocumentViewClientProps & {
  studioCollection: WebStudioCollectionSlug;
};

type InspectorItem = { label: string; value: string };

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

/** The tenant's name when the document carries it, else its ID. */
function tenantItem(tenant: unknown): InspectorItem | null {
  if (typeof tenant === "string" || typeof tenant === "number") {
    return { label: "Organization ID", value: String(tenant) };
  }
  if (tenant && typeof tenant === "object") {
    const record = tenant as { id?: unknown; name?: unknown };
    if (typeof record.name === "string" && record.name) {
      return { label: "Organization", value: record.name };
    }
    if (record.id !== undefined) {
      return { label: "Organization ID", value: String(record.id) };
    }
  }
  return null;
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
}): InspectorItem[] {
  const inspectorItems: InspectorItem[] = [
    {
      label: "Document ID",
      value: documentIdFromData(data) ?? "Unsaved",
    },
  ];

  const tenant = tenantItem(data?.tenant);
  if (tenant) {
    inspectorItems.push(tenant);
  }

  if (studioCollection === "navigation" && Array.isArray(data?.items)) {
    inspectorItems.push({
      label: "Nav items",
      value: String(data.items.length),
    });
  }

  if (studioCollection === "missionary-profiles") {
    inspectorItems.push({
      label: "Portrait",
      value: data?.portrait ? "Linked" : "Missing",
    });
  }

  if (studioCollection === "ministry-updates") {
    inspectorItems.push({
      label: "Missionary",
      value: data?.missionary ? "Linked" : "Missing",
    });
  }

  if (studioCollection === "media") {
    inspectorItems.push({
      label: "File",
      value:
        typeof data?.filename === "string" ? data.filename : "Upload pending",
    });
  }

  if (studioConfig.hasVersions) {
    inspectorItems.push({
      label: "Versions",
      value: String(versionCount ?? 0),
    });
    inspectorItems.push({
      label: "Unpublished changes",
      value: describeUnpublishedVersions(unpublishedVersionCount),
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
  publicPreviewURL,
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
  publicPreviewURL: string | null;
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
  // The page address under the title; documents without one show none (the
  // Document state card lists the ID).
  const slugOrIdentifier =
    typeof data?.slug === "string" && data.slug.length > 0
      ? data.slug === "home"
        ? "/"
        : `/${data.slug}`
      : null;
  const readOnly = !hasSavePermission;
  const heading = documentHeading({
    title,
    documentId,
    singular: studioConfig.titleSingular,
  });
  const documentPath =
    collectionSlug && documentId
      ? `${studioConfig.listPath}/${encodeURIComponent(documentId)}`
      : null;
  const apiHref = documentPath ? `${documentPath}/api` : null;
  const versionsHref =
    studioConfig.hasVersions && documentPath
      ? `${documentPath}/versions`
      : null;
  const livePreviewHref =
    isLivePreviewEnabled && documentPath ? `${documentPath}/preview` : null;
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
    apiHref,
    authenticatedPreviewURL,
    documentPath,
    heading,
    inspectorItems,
    livePreviewHref,
    mediaPreviewUrl,
    publicPreviewURL,
    readOnly,
    slugOrIdentifier,
    versionsHref,
  };
}

type NativeCollectionEditModel = ReturnType<
  typeof resolveNativeCollectionEditModel
>;

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

const STATE_BADGE_VARIANT: Record<
  NativeDocumentStateTone,
  "destructive-subtle" | "info" | "outline" | "success" | "warning"
> = {
  danger: "destructive-subtle",
  info: "info",
  muted: "outline",
  success: "success",
  warning: "warning",
};

const STATE_DOT_CLASS: Record<NativeDocumentStateTone, string> = {
  danger: "bg-destructive",
  info: "bg-info",
  muted: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
};

const STATE_LABELS = {
  autosave: "Autosave",
  editing: "Status",
  preview: "Preview",
  publication: "Visibility",
} as const;

function NativeCollectionEditHeader({
  actions,
  heading,
  readOnly,
  reference,
  setStatusTarget,
  showSlugChip,
  slugOrIdentifier,
  studioConfig,
}: {
  actions: ReactNode;
  heading: string;
  readOnly: boolean;
  /** The record the document is for ("for Grace Okafor"), if any. */
  reference: ReactNode;
  setStatusTarget: (node: HTMLSpanElement | null) => void;
  showSlugChip: boolean;
  slugOrIdentifier: string | null;
  studioConfig: WebStudioCollectionConfig;
}) {
  return (
    <header className="flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-balance wrap-break-word">
            {heading}
          </h1>
          <span ref={setStatusTarget} className="flex items-center" />
          {readOnly ? <Badge variant="outline">View only</Badge> : null}
        </div>
        <NativeDocumentSubtitle
          readOnly={readOnly}
          reference={reference}
          slug={showSlugChip ? slugOrIdentifier : null}
          titleSingular={studioConfig.titleSingular}
        />
      </div>
      {actions}
    </header>
  );
}

function NativeCollectionEditActions({
  apiHref,
  documentPath,
  livePreviewHref,
  onOpenSettings,
  pinToggle,
  previewLinks,
  previewMenu,
  versionCount,
  versionsHref,
}: {
  apiHref: string | null;
  documentPath: string | null;
  livePreviewHref: string | null;
  onOpenSettings: () => void;
  pinToggle?: ReactNode;
  previewLinks?: ReactNode;
  /** Phones: the preview links as one menu, after the views. */
  previewMenu?: ReactNode;
  versionCount: number | undefined;
  versionsHref: string | null;
}) {
  const views = [
    documentPath ? { href: documentPath, label: "Edit", current: true } : null,
    versionsHref
      ? {
          href: versionsHref,
          label: "Versions",
          count: versionCount,
          current: false,
        }
      : null,
    apiHref ? { href: apiHref, label: "API", current: false } : null,
    livePreviewHref
      ? { href: livePreviewHref, label: "Live preview", current: false }
      : null,
  ].filter((view) => view !== null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {previewLinks}
      {views.length > 1 ? (
        <nav aria-label="Document views">
          <ul className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
            {views.map((view) => (
              <li key={view.href}>
                <Link
                  href={view.href}
                  aria-current={view.current ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    view.current
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {view.label}
                  {"count" in view && view.count ? (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {view.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {previewMenu}
      {pinToggle}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Workspace settings"
              onClick={onOpenSettings}
            >
              <Settings2 aria-hidden="true" />
            </Button>
          }
        />
        <TooltipContent>Workspace settings</TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Where "Open preview" and "Open published page" point, when they apply. */
function resolvePreviewLinks({
  previewSupported,
  previewURL,
  publicPreviewURL,
}: {
  previewSupported: boolean;
  previewURL: string | undefined;
  publicPreviewURL: string | null;
}) {
  return {
    previewHref: previewSupported && previewURL ? previewURL : null,
    publishedHref: publicPreviewURL,
  };
}

/** The document facts list: ids, counts and the viewer's access. */
function NativeCollectionDetailsList({
  docPermissions,
  hasPublishPermission,
  inspectorItems,
}: {
  docPermissions: { read?: boolean; update?: boolean } | null | undefined;
  hasPublishPermission: boolean | undefined;
  inspectorItems: InspectorItem[];
}) {
  const access = docPermissions
    ? [
        docPermissions.read ? "read" : null,
        docPermissions.update ? "edit" : null,
        hasPublishPermission ? "publish" : null,
      ].filter(Boolean)
    : [];
  return (
    <dl className="flex flex-col gap-2 text-sm">
      {inspectorItems.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="flex items-center justify-between gap-4"
        >
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 truncate text-right font-medium tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
      {docPermissions ? (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Your access</dt>
          <dd className="text-right font-medium capitalize">
            {access.length > 0 ? access.join(", ") : "None"}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function NativeCollectionStateStrip({
  details,
  setCompactTarget,
  setStateTarget,
}: {
  details: ReactNode;
  setCompactTarget: (node: HTMLDivElement | null) => void;
  setStateTarget: (node: HTMLDivElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      data-web-studio-state-strip=""
      className="rounded-xl border bg-card px-4 py-3 shadow-sm md:p-4 xl:hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-3">
          <div
            ref={setCompactTarget}
            className={cn("min-w-0 flex-1", open && "hidden")}
          />
          {open ? (
            <p className="min-w-0 flex-1 text-sm font-medium">Document state</p>
          ) : null}
          <CollapsibleTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                Details
                {open ? (
                  <ChevronUp aria-hidden="true" />
                ) : (
                  <ChevronDown aria-hidden="true" />
                )}
              </Button>
            }
          />
        </div>
        <CollapsibleContent>
          <div className="mt-4 flex flex-col gap-6 border-t pt-4 md:flex-row">
            <div ref={setStateTarget} className="min-w-0 flex-1" />
            <div className="md:w-64 md:shrink-0">{details}</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
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
  setStateTarget,
}: {
  data: Record<string, unknown> | null | undefined;
  docPermissions: { read?: boolean; update?: boolean } | null | undefined;
  hasPublishPermission: boolean | undefined;
  heading: string;
  inspectorItems: InspectorItem[];
  mediaPreviewUrl: string | null;
  previewSupported: boolean;
  previewURL: string | undefined;
  publicPreviewURL: string | null;
  setStateTarget: (node: HTMLDivElement | null) => void;
}) {
  const detailsHeadingId = useId();
  const { previewHref, publishedHref } = resolvePreviewLinks({
    previewSupported,
    previewURL,
    publicPreviewURL,
  });
  const showPreview = Boolean(previewHref);
  const showPublished = Boolean(publishedHref);

  return (
    <aside
      aria-label="Inspector"
      className="hidden w-80 shrink-0 flex-col gap-6 xl:sticky xl:top-20 xl:flex"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Document state</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={setStateTarget} />
        </CardContent>
      </Card>
      <section aria-labelledby={detailsHeadingId}>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 id={detailsHeadingId}>Details</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mediaPreviewUrl ? (
              <div className="overflow-hidden rounded-lg border bg-muted">
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
            <NativeCollectionDetailsList
              docPermissions={docPermissions}
              hasPublishPermission={hasPublishPermission}
              inspectorItems={inspectorItems}
            />
          </CardContent>
          {showPreview || showPublished ? (
            <CardFooter className="flex-col gap-2">
              {showPreview && previewHref ? (
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full",
                  )}
                >
                  <ExternalLink aria-hidden="true" />
                  Open preview
                </a>
              ) : null}
              {showPublished && publishedHref ? (
                <a
                  href={publishedHref}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "w-full",
                  )}
                >
                  <ExternalLink aria-hidden="true" />
                  View live page
                </a>
              ) : null}
            </CardFooter>
          ) : null}
        </Card>
      </section>
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
    hasPublishPermission,
    hasSavePermission,
    unpublishedVersionCount,
    versionCount,
  } = useDocumentInfo();
  const { isLivePreviewEnabled, previewURL, setPreviewURL } =
    useLivePreviewContext();
  const { getPreference, setPreference } = usePreferences();
  const [statusTarget, setStatusTarget] = useState<HTMLSpanElement | null>(
    null,
  );
  const [stateTarget, setStateTarget] = useState<HTMLDivElement | null>(null);
  const [stripCompactTarget, setStripCompactTarget] =
    useState<HTMLDivElement | null>(null);
  const [stripStateTarget, setStripStateTarget] =
    useState<HTMLDivElement | null>(null);
  const [payloadEditRoot, setPayloadEditRoot] = useState<HTMLDivElement | null>(
    null,
  );
  usePopupTriggerRoles(payloadEditRoot);
  const documentId = documentIdFromData(data);
  const previewSupported = studioConfig.previewMode !== "none";
  const publicPreviewURL = usePublishedPageURL(studioConfig);
  const model = resolveNativeCollectionEditModel({
    collectionSlug,
    data: data as Record<string, unknown> | null | undefined,
    documentId,
    hasSavePermission,
    isLivePreviewEnabled,
    previewSupported,
    publicPreviewURL,
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

  const headerPreviewLinks = resolvePreviewLinks({
    previewSupported,
    previewURL,
    publicPreviewURL: model.publicPreviewURL,
  });

  useEffect(() => {
    if (!model.authenticatedPreviewURL) {
      return;
    }

    if (previewURL !== model.authenticatedPreviewURL) {
      setPreviewURL(model.authenticatedPreviewURL);
    }
  }, [model.authenticatedPreviewURL, previewURL, setPreviewURL]);

  return (
    <div
      data-web-studio-native-document="true"
      className="flex flex-1 flex-col"
    >
      <StudioLayout
        sectionLabel={studioConfig.sectionLabel}
        currentLabel={model.heading}
      >
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 md:gap-6 md:py-6 lg:px-8">
          <NativeCollectionEditHeader
            actions={
              <NativeCollectionEditActions
                apiHref={model.apiHref}
                documentPath={model.documentPath}
                livePreviewHref={model.livePreviewHref}
                onOpenSettings={() => setSettingsOpen(true)}
                pinToggle={
                  collectionSlug &&
                  (typeof data?.id === "string" ||
                    typeof data?.id === "number") ? (
                    <DocumentPinToggle
                      collectionSlug={collectionSlug}
                      documentId={data.id}
                    />
                  ) : null
                }
                previewLinks={
                  <DocumentPreviewLinks
                    className={
                      workspace.inspectorOpen ? "xl:hidden" : undefined
                    }
                    previewURL={headerPreviewLinks.previewHref}
                    publishedURL={headerPreviewLinks.publishedHref}
                  />
                }
                previewMenu={
                  <DocumentPreviewMenu
                    previewURL={headerPreviewLinks.previewHref}
                    publishedURL={headerPreviewLinks.publishedHref}
                  />
                }
                versionCount={versionCount}
                versionsHref={model.versionsHref}
              />
            }
            heading={model.heading}
            readOnly={model.readOnly}
            reference={
              <DocumentReference
                data={data as Record<string, unknown> | null | undefined}
              />
            }
            setStatusTarget={setStatusTarget}
            showSlugChip={workspace.showSlugChip}
            slugOrIdentifier={model.slugOrIdentifier}
            studioConfig={studioConfig}
          />

          <NativeDocumentWorkspaceSettingsDialog
            open={settingsOpen}
            onOpenChange={handleSettingsOpenChange}
            preferenceKey={studioConfig.preferences.workspace}
            sectionLabel={studioConfig.sectionLabel}
          />

          {workspace.inspectorOpen ? (
            <NativeCollectionStateStrip
              details={
                <NativeCollectionDetailsList
                  docPermissions={docPermissions}
                  hasPublishPermission={hasPublishPermission}
                  inspectorItems={model.inspectorItems}
                />
              }
              setCompactTarget={setStripCompactTarget}
              setStateTarget={setStripStateTarget}
            />
          ) : null}

          <div
            className={cn(
              "flex flex-col gap-6",
              workspace.inspectorOpen && "xl:flex-row xl:items-start",
            )}
          >
            <div
              ref={setPayloadEditRoot}
              className="payload-native-edit min-w-0 flex-1 overflow-clip rounded-xl border bg-card shadow-sm"
            >
              <DefaultEditView
                {...props}
                BeforeDocumentControls={
                  <NativeDocumentFormBridge
                    model={model}
                    previewSupported={previewSupported}
                    stateTarget={stateTarget}
                    statusTarget={statusTarget}
                    stripCompactTarget={stripCompactTarget}
                    stripStateTarget={stripStateTarget}
                    studioConfig={studioConfig}
                  />
                }
                Status={<NativeRevertToPublished />}
                // Preview is offered by the workspace (Details "Open preview"
                // and the phone Preview menu). Payload's unnamed icon-only
                // link button would duplicate it, so its slot stays empty
                // (a null slot falls back to Payload's default button).
                PreviewButton={<NoPayloadPreviewButton />}
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
                setStateTarget={setStateTarget}
              />
            ) : null}
          </div>
          {workspace.inspectorOpen ? null : (
            <div ref={setStateTarget} className="sr-only" />
          )}
        </div>
      </StudioLayout>
    </div>
  );
}

/**
 * Lives inside Payload's form (as `BeforeDocumentControls`) so it can read
 * form state, and portals the live status into the header and the document
 * state into the inspector (xl) and the state strip (below xl). It renders
 * nothing in Payload's bar.
 */
function NativeDocumentFormBridge({
  model,
  previewSupported,
  stateTarget,
  statusTarget,
  stripCompactTarget,
  stripStateTarget,
  studioConfig,
}: {
  model: NativeCollectionEditModel;
  previewSupported: boolean;
  stateTarget: HTMLDivElement | null;
  statusTarget: HTMLSpanElement | null;
  stripCompactTarget: HTMLDivElement | null;
  stripStateTarget: HTMLDivElement | null;
  studioConfig: WebStudioCollectionConfig;
}) {
  const {
    data,
    documentIsLocked,
    hasPublishedDoc,
    isInitializing: documentIsInitializing,
    isTrashed,
    mostRecentVersionIsAutosaved,
    unpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo();
  const form = useForm();
  const backgroundProcessing = useFormBackgroundProcessing();
  const formInitializing = useFormInitializing();
  const modified = useFormModified();
  const processing = useFormProcessing();
  const submitted = useFormSubmitted();
  const stateItems = buildNativeDocumentStateItems({
    backgroundProcessing,
    documentId: documentIdFromData(data),
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
  const primary = stateItems[0];

  return (
    <>
      {statusTarget && primary
        ? createPortal(
            <Badge variant={STATE_BADGE_VARIANT[primary.tone]}>
              {primary.label}
            </Badge>,
            statusTarget,
          )
        : null}
      {stateTarget
        ? createPortal(
            <NativeDocumentStateSummary items={stateItems} />,
            stateTarget,
          )
        : null}
      {stripCompactTarget
        ? createPortal(
            <NativeDocumentStateCompact items={stateItems} />,
            stripCompactTarget,
          )
        : null}
      {stripStateTarget
        ? createPortal(
            <NativeDocumentStateSummary items={stateItems} />,
            stripStateTarget,
          )
        : null}
    </>
  );
}

function NativeDocumentStateCompact({
  items,
}: {
  items: ReturnType<typeof buildNativeDocumentStateItems>;
}) {
  const glance = glanceNativeDocumentStateItems(items);
  return (
    <>
      {glance.length > 0 ? (
        <dl className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 lg:hidden">
          {glance.map((item) => (
            <div key={item.id} className="flex min-w-0 items-center">
              <dt className="sr-only">{STATE_LABELS[item.id]}</dt>
              <dd className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATE_DOT_CLASS[item.tone],
                  )}
                />
                <span className="truncate">{item.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm font-medium lg:hidden">Document state</p>
      )}
      <NativeDocumentStateGrid items={items} />
    </>
  );
}

function NativeDocumentStateGrid({
  items,
}: {
  items: ReturnType<typeof buildNativeDocumentStateItems>;
}) {
  return (
    <dl className="hidden grid-cols-4 gap-x-4 gap-y-3 lg:grid">
      {items.map((item) => (
        <div key={item.id} className="flex min-w-0 flex-col gap-1">
          <dt className="text-xs text-muted-foreground">
            {STATE_LABELS[item.id]}
          </dt>
          <dd className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                STATE_DOT_CLASS[item.tone],
              )}
            />
            <span className="truncate">{item.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function NativeDocumentStateSummary({
  items,
}: {
  items: ReturnType<typeof buildNativeDocumentStateItems>;
}) {
  return (
    <section aria-label="Document state">
      <dl className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">
              {STATE_LABELS[item.id]}
            </dt>
            <dd className="flex items-center gap-2 text-sm font-medium">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  STATE_DOT_CLASS[item.tone],
                )}
              />
              <span>{item.label}</span>
            </dd>
            <dd className="text-xs text-muted-foreground">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Fills Payload's preview-button slot with nothing; see the edit view. */
function NoPayloadPreviewButton() {
  return null;
}
