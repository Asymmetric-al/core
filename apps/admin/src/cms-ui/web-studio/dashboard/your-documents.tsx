"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { useAuth, useConfig, useServerFunctions } from "@payloadcms/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Pin,
  PinOff,
  RotateCw,
  UsersRound,
} from "lucide-react";
import { useId, useState } from "react";

import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import {
  DASHBOARD_DOCUMENTS_QUERY_KEY,
  pinnedDocumentKey,
  pinnedDocumentsURL,
  updatePinnedDocument,
} from "../preferences/pinned-documents";
import { Link } from "../routing";
import { WEB_STUDIO_ADMIN_COLLECTIONS } from "../shell/admin-collections";

import type { WebStudioCollectionSlug } from "../collections/config";
import type { ComponentType } from "react";

/** One row of Payload's `get-dashboard-documents` server function. */
export type DashboardDocument = {
  id: string | number;
  collectionSlug: string;
  title: string;
  href: string;
  typeLabel?: string;
  dateLabel?: string;
  dateTime?: string;
  isChanged?: boolean;
  isDraft?: boolean;
  statusLabel?: string;
};

type DashboardDocumentsPage = {
  items: DashboardDocument[];
  page: number;
  totalDocs: number;
};

type DocumentsTab = "pinned" | "recents";

const PAGE_SIZE = 5;
const QUERY_KEY = DASHBOARD_DOCUMENTS_QUERY_KEY;
const SAVE_ERROR = "Pins couldn't be updated. Try again.";

const ADMIN_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "cms-users": UsersRound,
  tenants: Building2,
};

function studioConfigFor(slug: string) {
  return slug in WEB_STUDIO_COLLECTION_CONFIGS
    ? WEB_STUDIO_COLLECTION_CONFIGS[slug as WebStudioCollectionSlug]
    : null;
}

function collectionLabel(document: DashboardDocument): string {
  return (
    studioConfigFor(document.collectionSlug)?.titlePlural ??
    WEB_STUDIO_ADMIN_COLLECTIONS.find(
      (collection) => collection.slug === document.collectionSlug,
    )?.title ??
    document.typeLabel ??
    document.collectionSlug
  );
}

function DocumentIcon({ slug }: { slug: string }) {
  const Icon = studioConfigFor(slug)?.icon ?? ADMIN_ICONS[slug] ?? FileText;
  return <Icon aria-hidden="true" className="size-4 text-muted-foreground" />;
}

/** Same three states, words and colours as the collection lists. */
function DocumentStatusBadge({ document }: { document: DashboardDocument }) {
  if (document.isChanged) return <Badge variant="warning">Changed</Badge>;
  if (document.isDraft) return <Badge variant="info">Draft</Badge>;
  if (document.statusLabel) return <Badge variant="success">Published</Badge>;
  return null;
}

function DocumentMeta({ document }: { document: DashboardDocument }) {
  return (
    <ItemDescription>
      {collectionLabel(document)}
      {document.dateLabel && document.dateTime ? (
        <>
          <span aria-hidden="true"> · </span>
          <time dateTime={document.dateTime}>{document.dateLabel}</time>
        </>
      ) : null}
    </ItemDescription>
  );
}

function useDashboardDocuments(tab: DocumentsTab, page: number) {
  const { serverFunction } = useServerFunctions();
  const { user } = useAuth();
  return useQuery({
    queryKey: [...QUERY_KEY, tab, page],
    enabled: Boolean(user),
    queryFn: async () =>
      (await serverFunction({
        name: "get-dashboard-documents",
        args: { limit: PAGE_SIZE, page, tab },
      })) as DashboardDocumentsPage,
  });
}

function DocumentsSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 py-2">
          <Skeleton className="size-4" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DocumentsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-dashed">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load documents</EmptyTitle>
          <EmptyDescription>Check your connection and retry.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

/** The last page that has documents; 1 when there are none. */
function lastPage(totalDocs: number) {
  return Math.max(1, Math.ceil(totalDocs / PAGE_SIZE));
}

function DocumentsPager({
  page,
  totalDocs,
  disabled,
  onPageChange,
}: {
  page: number;
  totalDocs: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}) {
  // A page past the end still shows the pager, so Previous stays reachable.
  const totalPages = Math.max(lastPage(totalDocs), page);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1">
      <p
        aria-live="polite"
        className="me-1 text-xs text-muted-foreground tabular-nums"
      >
        Page {page} of {totalPages}
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous page"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next page"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}

function PinnedList({
  documents,
  disabled,
  onUnpin,
}: {
  documents: DashboardDocument[];
  disabled: boolean;
  onUnpin: (document: DashboardDocument) => void;
}) {
  return (
    <ul aria-label="Pinned documents" className="-mx-4 flex flex-col divide-y">
      {documents.map((document) => (
        <li key={pinnedDocumentKey(document)}>
          {/* A plain div: the <li> is the list item, and the row holds two
              controls (open, unpin), so it cannot be one link. */}
          <Item size="sm" render={<div />}>
            <ItemMedia>
              <DocumentIcon slug={document.collectionSlug} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full">
                <Link
                  href={document.href}
                  className="truncate underline-offset-4 hover:underline"
                >
                  {document.title}
                </Link>
              </ItemTitle>
              <DocumentMeta document={document} />
            </ItemContent>
            <ItemActions>
              <DocumentStatusBadge document={document} />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Unpin ${document.title}`}
                disabled={disabled}
                onClick={() => onUnpin(document)}
              >
                <PinOff aria-hidden="true" />
              </Button>
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
}

function RecentlyViewedList({ documents }: { documents: DashboardDocument[] }) {
  return (
    <ul
      aria-label="Recently viewed documents"
      className="-mx-4 flex flex-col divide-y"
    >
      {documents.map((document) => (
        <li key={pinnedDocumentKey(document)} className="flex">
          <Item
            size="sm"
            className="w-full"
            render={<Link href={document.href} />}
          >
            <ItemMedia>
              <DocumentIcon slug={document.collectionSlug} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full">
                <span className="truncate">{document.title}</span>
              </ItemTitle>
              <DocumentMeta document={document} />
            </ItemContent>
            <ItemActions>
              <DocumentStatusBadge document={document} />
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
}

function TabBody({
  tab,
  query,
  saving,
  onUnpin,
  onPageChange,
}: {
  tab: DocumentsTab;
  query: ReturnType<typeof useDashboardDocuments>;
  saving: boolean;
  onUnpin: (document: DashboardDocument) => void;
  onPageChange: (page: number) => void;
}) {
  if (query.isError) {
    return <DocumentsError onRetry={() => void query.refetch()} />;
  }
  if (!query.data) return <DocumentsSkeleton />;
  const { items, page, totalDocs } = query.data;
  // A page past the end while earlier pages still have documents (another
  // session unpinned them): keep the pager so they stay reachable.
  if (items.length === 0 && totalDocs > 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          No documents on this page.
        </p>
        <DocumentsPager
          page={page}
          totalDocs={totalDocs}
          disabled={query.isFetching || saving}
          onPageChange={onPageChange}
        />
      </div>
    );
  }
  // One short line: an empty personal list should not push Collections down.
  if (items.length === 0) {
    const Icon = tab === "pinned" ? Pin : History;
    return (
      <div
        data-slot="your-documents-empty"
        className="flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm"
      >
        <Icon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        />
        <p className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">
            {tab === "pinned" ? "No pinned documents" : "Nothing viewed yet"}
          </span>
          <span className="text-muted-foreground">
            {tab === "pinned"
              ? "Open a document and choose Pin to keep it here."
              : "Documents you open will show up here."}
          </span>
        </p>
      </div>
    );
  }
  return (
    <div aria-busy={query.isFetching} className="flex flex-col gap-3">
      {tab === "pinned" ? (
        <PinnedList documents={items} disabled={saving} onUnpin={onUnpin} />
      ) : (
        <RecentlyViewedList documents={items} />
      )}
      <DocumentsPager
        page={page}
        totalDocs={totalDocs}
        disabled={query.isFetching || saving}
        onPageChange={onPageChange}
      />
    </div>
  );
}

/**
 * Payload's per-user "Pinned" and "Recently viewed" dashboard lists in the
 * Studio's own card. Documents come from Payload's `get-dashboard-documents`
 * server function (access-checked, with draft/changed status) and pins live
 * in Payload's `pinned-documents` preference, shared with its stock widget.
 * Documents are pinned from their workspace header (`DocumentPinToggle`).
 */
export function YourDocuments() {
  const headingId = useId();
  const queryClient = useQueryClient();
  const {
    config: { routes, serverURL },
  } = useConfig();
  const pinsURL = pinnedDocumentsURL({ apiRoute: routes.api, serverURL });
  const [tab, setTab] = useState<DocumentsTab>("pinned");
  const [pages, setPages] = useState<Record<DocumentsTab, number>>({
    pinned: 1,
    recents: 1,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const query = useDashboardDocuments(tab, pages[tab]);

  const unpin = async (document: DashboardDocument) => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updatePinnedDocument({ document, shouldPin: false, url: pinsURL });
      // Unpinning the only document on a later page empties that page; show
      // the page before it, which still has pins.
      const shown = query.data;
      if (shown?.items.length === 1 && pages.pinned > 1) {
        const remaining = shown.totalDocs - 1;
        setPages((currentPages) => ({
          ...currentPages,
          pinned: Math.min(currentPages.pinned - 1, lastPage(remaining)),
        }));
      }
      await queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, "pinned"],
      });
    } catch {
      setSaveError(SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const tabBody = (current: DocumentsTab) => (
    <TabBody
      tab={current}
      query={query}
      saving={saving}
      onUnpin={(document) => void unpin(document)}
      onPageChange={(page) =>
        setPages((currentPages) => ({ ...currentPages, [current]: page }))
      }
    />
  );

  return (
    <section aria-labelledby={headingId}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>Your documents</h2>
          </CardTitle>
          <CardDescription>
            Pinned and recently viewed, just for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(value) => {
              setSaveError(null);
              setTab(value as DocumentsTab);
            }}
          >
            <TabsList>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
              <TabsTrigger value="recents">Recently viewed</TabsTrigger>
            </TabsList>
            <TabsContent value="pinned">{tabBody("pinned")}</TabsContent>
            <TabsContent value="recents">{tabBody("recents")}</TabsContent>
          </Tabs>
          {saveError ? (
            <p role="alert" className="pt-3 text-sm text-destructive">
              {saveError}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
