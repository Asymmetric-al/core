"use client";

import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridToolbarSpacer,
  dataGridFeatures,
  useTable,
} from "@asym/ui/components/data-grid-panel";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
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
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RotateCw, SearchX, UserRound } from "lucide-react";
import { formatAdminURL } from "payload/shared";
import { useId, useState } from "react";

import {
  studioMissionaryContext,
  studioMissionaryName,
  useStudioMissionaries,
} from "./studio-missionaries";
import { GridSortMenu } from "../collections/shared/list-workspace/grid-sort-menu";
import { ReferenceId } from "../collections/shared/list-workspace/reference-id";
import { Link } from "../routing";
import { StudioLayout } from "../shell/studio-layout";

import type {
  DataGridColumnDef,
  DataGridRow,
  PaginationState,
  SortingState,
} from "@asym/ui/components/data-grid-panel";

/** Payload's list status: "changed" is live with a newer draft. */
type GivingPageStatusValue = "changed" | "draft" | "published";

type GivingPage = { id: string; status: GivingPageStatusValue | null };

/** Whether each missionary's giving page is known yet. */
type GivingPagesState = "loading" | "unavailable" | "ready";

type HubRow = {
  id: string;
  name: string;
  context: string | null;
  givingPage: GivingPage | null;
};

const GIVING_PAGES_LIST = "/web-studio/collections/missionary-giving-pages";

function rowHref(row: HubRow): string {
  return row.givingPage
    ? `${GIVING_PAGES_LIST}/${encodeURIComponent(row.givingPage.id)}`
    : `/web-studio/pages/give?missionaryId=${encodeURIComponent(row.id)}`;
}

/** The giving pages list filtered to one missionary (Payload's where query). */
function givingPagesForMissionaryHref(missionaryId: string): string {
  const params = new URLSearchParams({
    "where[or][0][and][0][missionaryId][equals]": missionaryId,
  });
  return `${GIVING_PAGES_LIST}?${params.toString()}`;
}

/**
 * Where the name opens. Once giving page status is known it is the row's
 * verb (edit the page, or create one). While the status is loading or failed
 * a missing page is not proven, so the name opens the giving pages kept for
 * that missionary instead of a create flow.
 */
function nameHref(row: HubRow, state: GivingPagesState): string {
  return state === "ready"
    ? rowHref(row)
    : givingPagesForMissionaryHref(row.id);
}

function GivingPageStatus({
  page,
  state,
}: {
  page: GivingPage | null;
  state: GivingPagesState;
}) {
  if (state === "loading") {
    return <span className="text-xs text-muted-foreground">Checking…</span>;
  }
  // Never claim "Not created" when the lookup failed.
  if (state === "unavailable" || page?.status === null) {
    return <span className="text-sm text-muted-foreground">Unavailable</span>;
  }
  if (!page) {
    return <span className="text-sm text-muted-foreground">Not created</span>;
  }
  if (page.status === "published") {
    return <Badge variant="success">Published</Badge>;
  }
  if (page.status === "changed") {
    return <Badge variant="warning">Changed</Badge>;
  }
  return <Badge variant="info">Draft</Badge>;
}

/**
 * The explicit verb once the giving page status is known. When the status
 * failed to load, a missing page is not proven, so instead of Create (which
 * could duplicate a page) the row opens that missionary's giving pages.
 */
function RowAction({
  row,
  state,
  variant = "ghost",
}: {
  row: HubRow;
  state: GivingPagesState;
  variant?: "ghost" | "outline";
}) {
  if (state === "unavailable") {
    return (
      <Link
        href={givingPagesForMissionaryHref(row.id)}
        aria-label={`View giving pages for ${row.name}`}
        className={buttonVariants({ variant, size: "sm" })}
      >
        View giving pages
      </Link>
    );
  }
  if (state !== "ready") return null;
  const verb = row.givingPage ? "Edit giving page" : "Create giving page";
  return (
    <Link
      href={rowHref(row)}
      aria-label={`${verb} for ${row.name}`}
      className={buttonVariants({ variant, size: "sm" })}
    >
      {verb}
    </Link>
  );
}

function GivingPagesUnavailable({
  onRetry,
  versionsOnly = false,
  isRetrying,
}: {
  onRetry: () => void;
  versionsOnly?: boolean;
  isRetrying: boolean;
}) {
  return (
    <>
      <p
        role="status"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <AlertCircle aria-hidden="true" className="size-4 text-destructive" />
        {versionsOnly ? (
          <>
            Publication status didn&apos;t load for draft pages. Existing pages
            can still be edited.
          </>
        ) : (
          <>
            Giving page status didn&apos;t load, so Create and Edit are hidden
            to avoid a duplicate page.
          </>
        )}
      </p>
      <Button
        variant="outline"
        size="sm"
        aria-label={
          versionsOnly ? "Retry publication status" : "Retry giving page status"
        }
        disabled={isRetrying}
        onClick={onRetry}
      >
        <RotateCw aria-hidden="true" />
        Retry
      </Button>
    </>
  );
}

async function fetchChangedPageIds(
  versionsUrl: string,
  draftIds: string[],
): Promise<Set<string> | null> {
  if (draftIds.length === 0) return new Set();
  const params = new URLSearchParams({
    depth: "0",
    limit: "0",
    pagination: "false",
    "select[parent]": "true",
    "where[and][1][version._status][equals]": "published",
  });
  draftIds.forEach((id, index) => {
    params.append(`where[and][0][parent][in][${index}]`, id);
  });
  try {
    const res = await fetch(`${versionsUrl}?${params.toString()}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { docs?: Array<{ parent?: unknown }> };
    if (!Array.isArray(json.docs)) return null;
    return new Set(
      json.docs.flatMap(({ parent }) => {
        if (typeof parent === "string" || typeof parent === "number") {
          return [String(parent)];
        }
        if (parent && typeof parent === "object" && "id" in parent) {
          return [String((parent as { id: unknown }).id)];
        }
        return [];
      }),
    );
  } catch {
    return null;
  }
}

function useHubData() {
  const {
    config: { routes, serverURL },
  } = useConfig();
  const missionariesQuery = useStudioMissionaries();
  const givingPagesUrl = `${serverURL}${formatAdminURL({
    apiRoute: routes.api,
    path: "/missionary-giving-pages",
  })}?limit=500&pagination=false&depth=0&draft=true&select[missionaryId]=true&select[_status]=true`;
  const versionsUrl = `${serverURL}${formatAdminURL({
    apiRoute: routes.api,
    path: "/missionary-giving-pages/versions",
  })}`;
  const givingPagesQuery = useQuery({
    queryKey: ["web-studio", "giving-pages-by-missionary", givingPagesUrl],
    queryFn: async () => {
      const res = await fetch(givingPagesUrl, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Giving pages didn't load.");
      }
      const json = (await res.json()) as {
        docs?: Array<{
          id: unknown;
          missionaryId?: unknown;
          _status?: unknown;
        }>;
      };
      const docs = json.docs ?? [];
      const changedIds = await fetchChangedPageIds(
        versionsUrl,
        docs
          .filter((doc) => doc._status === "draft")
          .map((doc) => String(doc.id)),
      );
      const byMissionary = new Map<string, GivingPage>();
      for (const doc of docs) {
        if (typeof doc.missionaryId !== "string") continue;
        const id = String(doc.id);
        byMissionary.set(doc.missionaryId, {
          id,
          status:
            doc._status === "draft"
              ? changedIds === null
                ? null
                : changedIds.has(id)
                  ? "changed"
                  : "draft"
              : doc._status === "published"
                ? "published"
                : null,
        });
      }
      return { byMissionary, versionsUnavailable: changedIds === null };
    },
  });

  const rows: HubRow[] = (missionariesQuery.data ?? []).map((missionary) => ({
    id: missionary.id,
    name: studioMissionaryName(missionary),
    context: studioMissionaryContext(missionary),
    givingPage: givingPagesQuery.data?.byMissionary.get(missionary.id) ?? null,
  }));

  return { givingPagesQuery, missionariesQuery, rows };
}

export function MissionariesHubView() {
  const recordsId = useId();
  const { givingPagesQuery, missionariesQuery, rows } = useHubData();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagesState: GivingPagesState = givingPagesQuery.isError
    ? "unavailable"
    : givingPagesQuery.isPending
      ? "loading"
      : "ready";

  const needle = search.trim().toLowerCase();
  const visibleRows = needle
    ? rows.filter(
        (row) =>
          row.name.toLowerCase().includes(needle) ||
          row.context?.toLowerCase().includes(needle) ||
          row.id.toLowerCase().includes(needle),
      )
    : rows;

  const columns: DataGridColumnDef<HubRow>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-1">
          <DataGridRowPrimary
            render={<Link href={nameHref(row.original, pagesState)} />}
          >
            <span className="truncate font-medium">{row.original.name}</span>
          </DataGridRowPrimary>
          {row.original.context ? (
            <span className="text-xs text-muted-foreground">
              {row.original.context}
            </span>
          ) : null}
        </div>
      ),
      enableHiding: false,
      meta: { headerTitle: "Name" },
    },
    {
      id: "missionaryId",
      accessorKey: "id",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Missionary ID" />
      ),
      // Both ends of the ID (names can repeat; the ID tells missionaries
      // apart) with a copy button for the full value, as the cards show it.
      cell: ({ row }) => (
        <ReferenceId value={row.original.id} label="Missionary ID" />
      ),
      enableSorting: false,
      meta: { headerTitle: "Missionary ID" },
    },
    {
      id: "givingPage",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Giving page" />
      ),
      cell: ({ row }) => (
        <GivingPageStatus page={row.original.givingPage} state={pagesState} />
      ),
      enableSorting: false,
      meta: { headerTitle: "Giving page" },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowAction row={row.original} state={pagesState} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useTable({
    features: dataGridFeatures,
    data: visibleRows,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <StudioLayout sectionLabel="Missionaries" recordsId={recordsId}>
      <PageShell
        title="Missionaries"
        description="Give each missionary a page for their supporters."
        density="compact"
      >
        <div id={recordsId} tabIndex={-1}>
          <DataGridPanel
            table={table}
            recordCount={visibleRows.length}
            label="Missionaries"
            isLoading={missionariesQuery.isPending}
            error={
              missionariesQuery.isError
                ? {
                    title: "Couldn't load missionaries",
                    message: (missionariesQuery.error as Error).message,
                    onRetry: () => void missionariesQuery.refetch(),
                  }
                : null
            }
            pagination={{ sizes: [10, 25, 50] }}
            toolbar={
              <>
                <DataGridSearch
                  label="Search missionaries"
                  placeholder="Search missionaries…"
                  value={search}
                  onValueChange={(value) => {
                    setSearch(value);
                    setPagination((current) => ({ ...current, pageIndex: 0 }));
                  }}
                />
                <GridSortMenu table={table} />
                {pagesState === "unavailable" ||
                givingPagesQuery.data?.versionsUnavailable ? (
                  <>
                    <DataGridToolbarSpacer />
                    <GivingPagesUnavailable
                      onRetry={() => void givingPagesQuery.refetch()}
                      versionsOnly={pagesState !== "unavailable"}
                      isRetrying={givingPagesQuery.isFetching}
                    />
                  </>
                ) : null}
              </>
            }
            empty={
              needle ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No matching missionaries</EmptyTitle>
                    <EmptyDescription>
                      Try another name, location, mission field or missionary
                      ID.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearch("")}
                    >
                      Clear search
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UserRound aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No missionaries yet</EmptyTitle>
                    <EmptyDescription>
                      Missionaries added in Mission Control appear here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            }
            renderMobileRow={(row: DataGridRow<HubRow>) => (
              <Item variant="outline" size="sm" render={<div />}>
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full">
                    <DataGridRowPrimary
                      render={
                        <Link href={nameHref(row.original, pagesState)} />
                      }
                    >
                      <span className="truncate">{row.original.name}</span>
                    </DataGridRowPrimary>
                  </ItemTitle>
                  {row.original.context ? (
                    <ItemDescription>{row.original.context}</ItemDescription>
                  ) : null}
                  <ItemDescription>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      Giving page
                      <GivingPageStatus
                        page={row.original.givingPage}
                        state={pagesState}
                      />
                    </span>
                  </ItemDescription>
                  <ItemDescription>
                    <ReferenceId
                      value={row.original.id}
                      label="Missionary ID"
                    />
                  </ItemDescription>
                </ItemContent>
                {/* Its own row, so the status line never wraps beside it.
                  With status unavailable it opens the giving pages, as the
                  table row does. */}
                {pagesState === "ready" || pagesState === "unavailable" ? (
                  <ItemFooter>
                    <RowAction
                      row={row.original}
                      state={pagesState}
                      variant="outline"
                    />
                  </ItemFooter>
                ) : null}
              </Item>
            )}
          />
        </div>
      </PageShell>
    </StudioLayout>
  );
}
