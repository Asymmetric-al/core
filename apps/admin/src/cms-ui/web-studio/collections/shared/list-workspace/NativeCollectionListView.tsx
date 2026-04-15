"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { FilterBar } from "@asym/ui/components/shadcn/filter-bar";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { cn } from "@asym/ui/lib/utils";
import {
  ListControls,
  PageControls,
  SelectionProvider,
  Table,
  TableColumnsProvider,
  useConfig,
  useListQuery,
  usePreferences,
  useTableColumns,
} from "@payloadcms/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { formatAdminURL } from "payload/shared";
import { useEffect, useMemo, useState } from "react";

import { StudioLayout } from "../../../shell/studio-layout";
import { getWebStudioCollectionConfig } from "../../config";

import type { WebStudioCollectionSlug } from "../../config";
import type {
  QueryPreset,
  ResolvedFilterOptions,
  SanitizedCollectionPermission,
  ViewTypes,
} from "payload";
import type { ComponentProps } from "react";

type TableColumnsProviderProps = ComponentProps<typeof TableColumnsProvider>;

export type NativeCollectionListViewProps = {
  AfterList?: React.ReactNode;
  AfterListTable?: React.ReactNode;
  beforeActions?: React.ReactNode[];
  BeforeList?: React.ReactNode;
  BeforeListTable?: React.ReactNode;
  /** When set, overrides `createHref` from collection config and Payload default create URL */
  createHrefOverride?: string;
  collectionSlug: WebStudioCollectionSlug;
  columnState: TableColumnsProviderProps["columnState"];
  Description?: React.ReactNode;
  disableBulkDelete?: boolean;
  disableBulkEdit?: boolean;
  disableQueryPresets?: boolean;
  enableRowSelections?: boolean;
  hasCreatePermission: boolean;
  hasDeletePermission?: boolean;
  hasTrashPermission?: boolean;
  listMenuItems?: React.ReactNode[];
  newDocumentURL: string;
  queryPreset?: QueryPreset;
  queryPresetPermissions?: SanitizedCollectionPermission;
  renderedFilters?: Map<string, React.ReactNode>;
  resolvedFilterOptions?: Map<string, ResolvedFilterOptions>;
  Table?: React.ReactNode | React.ReactNode[];
  viewType: ViewTypes;
};

export function NativeCollectionListView(props: NativeCollectionListViewProps) {
  const {
    AfterList,
    AfterListTable,
    beforeActions,
    BeforeList,
    BeforeListTable,
    createHrefOverride,
    collectionSlug,
    columnState,
    Description: _Description,
    disableBulkDelete: _disableBulkDelete,
    disableBulkEdit: _disableBulkEdit,
    disableQueryPresets,
    enableRowSelections: _enableRowSelections,
    hasCreatePermission,
    hasDeletePermission: _hasDeletePermission,
    hasTrashPermission: _hasTrashPermission,
    listMenuItems,
    newDocumentURL,
    queryPreset,
    queryPresetPermissions,
    renderedFilters,
    resolvedFilterOptions,
    Table: InitialTable,
    viewType: _viewType,
  } = props;

  const studioConfig = getWebStudioCollectionConfig(collectionSlug);
  const { getPreference, setPreference } = usePreferences();
  const [filterExpanded, setFilterExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const pref = await getPreference<{ filterExpanded?: boolean }>(
          studioConfig.preferences.listUi,
        );

        if (!cancelled && pref && typeof pref.filterExpanded === "boolean") {
          setFilterExpanded(pref.filterExpanded);
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getPreference, studioConfig.preferences.listUi]);

  const persistFilterExpanded = async (next: boolean) => {
    setFilterExpanded(next);

    try {
      await setPreference(studioConfig.preferences.listUi, {
        filterExpanded: next,
      });
    } catch {
      /* ignore */
    }
  };

  const {
    config: {
      routes: { admin: adminRoute },
    },
    getEntityConfig,
  } = useConfig();
  const collectionConfig = getEntityConfig({ collectionSlug });

  const title = useMemo(
    () =>
      collectionConfig?.labels?.plural
        ? typeof collectionConfig.labels.plural === "string"
          ? collectionConfig.labels.plural
          : String(collectionConfig.labels.plural)
        : studioConfig.titlePlural,
    [collectionConfig?.labels?.plural, studioConfig.titlePlural],
  );

  const listHref = formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}`,
  });

  const { data, handleSearchChange, query } = useListQuery();
  const docs = data?.docs ?? [];
  const totalDocs = data?.totalDocs ?? 0;
  const createHref =
    createHrefOverride ?? studioConfig.createHref ?? newDocumentURL;

  return (
    <StudioLayout sectionLabel={studioConfig.sectionLabel}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <PageShell
          title={title}
          description={studioConfig.description}
          className="gap-8 p-0 pb-12"
          headerClassName="border-0 pb-6"
          actions={
            hasCreatePermission && createHref ? (
              <Button
                size="sm"
                className="font-semibold uppercase tracking-wide"
                asChild
              >
                <Link href={createHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  {studioConfig.createLabel}
                </Link>
              </Button>
            ) : null
          }
        >
          <FilterBar
            className="mb-6"
            search={{
              value: query?.search ?? "",
              onChange: (value) => void handleSearchChange?.(value),
              placeholder: `Search ${title.toLowerCase()}...`,
            }}
            filters={
              <Button
                type="button"
                variant={filterExpanded ? "secondary" : "outline"}
                size="sm"
                className="font-semibold text-[10px] uppercase tracking-wider"
                onClick={() => void persistFilterExpanded(!filterExpanded)}
              >
                Columns &amp; filters
              </Button>
            }
            activeFilters={
              filterExpanded
                ? [
                    {
                      label: "Columns & filters",
                      onRemove: () => void persistFilterExpanded(false),
                    },
                  ]
                : []
            }
            onReset={() => {
              void handleSearchChange?.("");
              void persistFilterExpanded(false);
            }}
          />

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div
              className={cn(
                "border-border border-b px-4 py-3",
                !filterExpanded && "hidden",
              )}
            >
              <ListControls
                beforeActions={beforeActions}
                collectionConfig={collectionConfig}
                collectionSlug={collectionSlug}
                disableQueryPresets={
                  collectionConfig?.enableQueryPresets !== true ||
                  disableQueryPresets
                }
                listMenuItems={listMenuItems}
                queryPreset={queryPreset}
                queryPresetPermissions={queryPresetPermissions}
                renderedFilters={renderedFilters}
                resolvedFilterOptions={resolvedFilterOptions}
              />
            </div>

            <div className="px-2 py-4 sm:px-4">
              {BeforeList}
              {BeforeListTable}
              <TableColumnsProvider
                collectionSlug={collectionSlug}
                columnState={columnState}
              >
                <SelectionProvider docs={docs} totalDocs={totalDocs}>
                  <NativeCollectionTableBridge InitialTable={InitialTable} />
                  <div className="mt-6 border-border border-t pt-4">
                    <PageControls collectionConfig={collectionConfig} />
                  </div>
                </SelectionProvider>
              </TableColumnsProvider>
              {AfterListTable}
              {AfterList}
            </div>
          </div>

          <p className="mt-6 text-muted-foreground text-xs">
            Tip: Column visibility and ordering persist via Payload list
            preferences.{" "}
            <Link
              className="font-semibold text-primary underline-offset-4 hover:underline"
              href={listHref}
            >
              Open stock list view
            </Link>{" "}
            if you need the default Payload chrome.
          </p>
        </PageShell>
      </div>
    </StudioLayout>
  );
}

function NativeCollectionTableBridge({
  InitialTable,
}: {
  InitialTable: NativeCollectionListViewProps["Table"];
}) {
  const { columns } = useTableColumns();
  const { data } = useListQuery();
  const rows = data?.docs ?? [];

  if (!InitialTable) {
    return (
      <div className="payload-table-native">
        <Table columns={columns} data={rows} />
      </div>
    );
  }

  return <>{InitialTable}</>;
}
