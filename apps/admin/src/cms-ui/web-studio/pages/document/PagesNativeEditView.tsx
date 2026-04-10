"use client";


import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import {
  DefaultEditView,
  PreviewButton,
  PublishButton,
  SaveDraftButton,
  useDocumentInfo,
  useDocumentTitle,
  useLivePreviewContext,
  usePreferences,
} from "@payloadcms/ui";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PagesWorkspaceSettingsDialog } from "./PagesWorkspaceSettingsDialog";
import { buildDonorPreviewPathForPageSlug } from "../../adapters/preview-url";
import { WEB_STUDIO_PREF_KEYS } from "../../preferences/keys";
import { StudioLayout } from "../../shell/studio-layout";


import type { DocumentViewClientProps } from "payload";

const DEFAULT_DONOR_ORIGIN = "http://127.0.0.1:3000";

function resolveDonorOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DONOR_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_DONOR_ORIGIN;
}

export function PagesNativeEditView(props: DocumentViewClientProps) {
  const { title } = useDocumentTitle();
  const {
    collectionSlug,
    data,
    hasPublishPermission,
    hasSavePermission,
    docPermissions,
  } = useDocumentInfo();
  const { previewURL, setPreviewURL } = useLivePreviewContext();
  const { getPreference } = usePreferences();

  const [workspace, setWorkspace] = useState({
    inspectorOpen: true,
    showSlugChip: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pref = await getPreference<{
          inspectorOpen?: boolean;
          showSlugChip?: boolean;
        }>(WEB_STUDIO_PREF_KEYS.pagesDocWorkspace);
        if (cancelled || !pref) {
          return;
        }
        setWorkspace({
          inspectorOpen:
            typeof pref.inspectorOpen === "boolean"
              ? pref.inspectorOpen
              : true,
          showSlugChip:
            typeof pref.showSlugChip === "boolean" ? pref.showSlugChip : true,
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getPreference]);

  const slug = typeof data?.slug === "string" ? data.slug : "";

  useEffect(() => {
    if (!slug) {
      return;
    }
    const path = buildDonorPreviewPathForPageSlug(slug);
    const nextUrl = `${resolveDonorOrigin()}${path}`;
    if (previewURL !== nextUrl) {
      setPreviewURL(nextUrl);
    }
  }, [previewURL, setPreviewURL, slug]);

  const statusLabel = useMemo(() => {
    const status = data?._status;
    if (status === "published") {
      return "Published";
    }
    return "Draft";
  }, [data?._status]);

  const readOnly = !hasSavePermission;
  const heading = title || "Untitled page";
  const crumb = heading;

  return (
    <StudioLayout sectionLabel="Pages" currentLabel={crumb}>
      <div className="border-border border-b bg-card/40 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-black text-2xl text-foreground tracking-tight uppercase sm:text-3xl">
                {heading}
              </h1>
              {workspace.showSlugChip && slug ? (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] uppercase"
                >
                  {slug === "home" ? "/" : `/${slug}`}
                </Badge>
              ) : null}
              <Badge variant="outline" className="text-[10px] uppercase">
                {statusLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {readOnly
                ? "You can view this document but do not have save access."
                : hasPublishPermission
                  ? "Drafts autosave. Publish when the page should appear on the donor site."
                  : "You can edit drafts but cannot publish."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PreviewButton />
            <SaveDraftButton />
            <PublishButton />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-semibold"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Workspace
            </Button>
            {collectionSlug ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/web-studio/collections/${collectionSlug}`}>
                  Back to list
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <PagesWorkspaceSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <div
        className={cn(
          "px-2 py-6 sm:px-4 lg:px-6",
          workspace.inspectorOpen &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_min(320px,32%)] lg:gap-6",
        )}
      >
        <div className="payload-native-edit min-w-0 rounded-xl border border-border bg-card shadow-sm">
          <DefaultEditView
            {...props}
            BeforeDocumentControls={undefined}
            PreviewButton={null}
            PublishButton={null}
            SaveDraftButton={null}
            Status={null}
          />
        </div>
        {workspace.inspectorOpen ? (
          <aside className="mt-6 hidden rounded-xl border border-border bg-muted/30 p-4 text-muted-foreground text-xs lg:mt-0 lg:block">
            <p className="mb-2 font-bold text-foreground uppercase tracking-wide">
              Inspector
            </p>
            <p>
              Document fields and Lexical content still use Payload&apos;s
              document form. Actions above wrap the stock Payload controls.
            </p>
            {docPermissions ? (
              <ul className="mt-3 list-disc space-y-1 pl-4">
                <li>Update: {docPermissions.update ? "yes" : "no"}</li>
                <li>Publish: {hasPublishPermission ? "yes" : "no"}</li>
              </ul>
            ) : null}
          </aside>
        ) : null}
      </div>
    </StudioLayout>
  );
}
