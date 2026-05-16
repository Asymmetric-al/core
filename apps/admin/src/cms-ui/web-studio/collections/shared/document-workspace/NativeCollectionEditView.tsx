"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
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
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildNativeDocumentStateItems } from "./editor-state";
import { NativeDocumentWorkspaceSettingsDialog } from "./NativeDocumentWorkspaceSettingsDialog";
import {
  buildWebStudioAuthenticatedPreviewPath,
  resolveDonorOrigin,
} from "../../../adapters/preview-url";
import { StudioLayout } from "../../../shell/studio-layout";
import { getWebStudioCollectionConfig } from "../../config";

import type { NativeDocumentStateTone } from "./editor-state";
import type { WebStudioCollectionSlug } from "../../config";
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

export type NativeCollectionEditViewProps = DocumentViewClientProps & {
  studioCollection: WebStudioCollectionSlug;
};

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
  const [workspace, setWorkspace] = useState({
    inspectorOpen: true,
    showSlugChip: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const documentId =
    typeof data?.id === "string" || typeof data?.id === "number"
      ? String(data.id)
      : null;
  const previewSupported = studioConfig.previewMode !== "none";
  const authenticatedPreviewURL =
    previewSupported && documentId
      ? buildWebStudioAuthenticatedPreviewPath({
          collectionSlug:
            studioCollection === "ministry-updates"
              ? "ministry-updates"
              : studioCollection === "missionary-giving-pages"
                ? "missionary-giving-pages"
                : studioCollection === "project-pages"
                  ? "project-pages"
                  : "pages",
          id: documentId,
        })
      : null;
  const publicPreviewPath = studioConfig.previewPathForData?.(
    data as Record<string, unknown> | undefined,
  );
  const publicPreviewURL = publicPreviewPath
    ? `${resolveDonorOrigin()}${publicPreviewPath}`
    : null;

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
      typeof data?.id === "string" || typeof data?.id === "number"
        ? String(data.id)
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
    data?.id,
    getPreference,
    setPreference,
    studioConfig.listPath,
    studioConfig.preferences.recentDocs,
    title,
  ]);

  useEffect(() => {
    if (!authenticatedPreviewURL) {
      return;
    }

    if (previewURL !== authenticatedPreviewURL) {
      setPreviewURL(authenticatedPreviewURL);
    }
  }, [authenticatedPreviewURL, previewURL, setPreviewURL]);

  const slugOrIdentifier = useMemo(() => {
    if (typeof data?.slug === "string" && data.slug.length > 0) {
      return data.slug === "home" ? "/" : `/${data.slug}`;
    }

    if (typeof data?.id === "string" || typeof data?.id === "number") {
      return String(data.id);
    }

    return null;
  }, [data?.id, data?.slug]);

  const statusLabel = useMemo(() => {
    const status = data?._status;
    if (status === "published") {
      return "Published";
    }
    if (status === "draft") {
      return "Draft";
    }
    return "Saved";
  }, [data?._status]);

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
  const inspectorItems: Array<{
    icon: React.ReactNode;
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
      value: String(data.tenant.id),
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

  const mediaPreviewUrl =
    studioCollection === "media" && typeof data?.url === "string"
      ? data.url
      : null;
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
    previewURL: authenticatedPreviewURL,
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
        currentLabel={heading}
      >
        <div className="border-border border-b bg-card/40 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-semibold text-2xl text-foreground tracking-tight uppercase sm:text-3xl">
                  {heading}
                </h1>
                {workspace.showSlugChip && slugOrIdentifier ? (
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
                    primaryState?.tone === "danger"
                      ? "destructive"
                      : "secondary"
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
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="mr-2 size-4" />
                Workspace
              </Button>
              {collectionSlug ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/web-studio/collections/${collectionSlug}`}>
                    Back to list
                  </Link>
                </Button>
              ) : null}
              {versionsHref ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={versionsHref}>Versions</Link>
                </Button>
              ) : null}
              {apiHref ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={apiHref}>API</Link>
                </Button>
              ) : null}
              {livePreviewHref ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={livePreviewHref}>Live preview</Link>
                </Button>
              ) : null}
            </div>
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
          <div className="payload-native-edit min-w-0 rounded-xl border border-border bg-card shadow-sm">
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
            <aside className="mt-6 hidden rounded-xl border border-border bg-muted/30 p-4 text-muted-foreground text-xs lg:mt-0 lg:block">
              <p className="mb-2 font-semibold text-foreground uppercase tracking-wide">
                Inspector
              </p>
              <p>
                Document fields remain on Payload&apos;s document form engine
                while Web Studio owns the surrounding workspace and action
                framing.
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  asChild
                >
                  <a href={previewURL} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 size-4" />
                    Open preview
                  </a>
                </Button>
              ) : null}
              {publicPreviewURL && data?._status === "published" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  asChild
                >
                  <a href={publicPreviewURL} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 size-4" />
                    Open published page
                  </a>
                </Button>
              ) : null}
            </aside>
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
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700",
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
