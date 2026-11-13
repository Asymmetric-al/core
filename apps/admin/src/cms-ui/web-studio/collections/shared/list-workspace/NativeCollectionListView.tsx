"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DefaultListView,
  RelationshipProvider,
  SelectionProvider,
  TableColumnsProvider,
  useConfig,
  useListDrawerContext,
  useListQuery,
} from "@payloadcms/ui";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import {
  getStudioListConfig,
  type StudioListCollectionSlug,
} from "./list-config";
import { NativeCollectionGrid } from "./NativeCollectionGrid";
import { Link } from "../../../routing";
import { StudioLayout } from "../../../shell/studio-layout";

import type {
  ListViewGroup,
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
  collectionSlug: StudioListCollectionSlug;
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
  /** Payload's grouped documents while the list has a groupBy. */
  groupedData?: ListViewGroup[];
  viewType: ViewTypes;
};

/**
 * Payload list view override shared by every native Web Studio collection.
 * Payload owns the query (URL + preferences), access, column state and cell
 * rendering; Mission Control owns the page shell, toolbar and ReUI grid.
 *
 * Payload also renders this view inside its list drawers (choosing an
 * existing upload, pinning documents). There a row must select rather than
 * navigate and a second Studio chrome would nest, so drawers get Payload's
 * stock list, which already implements selection.
 */
export function NativeCollectionListView(props: NativeCollectionListViewProps) {
  const { isInDrawer } = useListDrawerContext();
  if (isInDrawer) {
    return (
      <DefaultListView {...(props as ComponentProps<typeof DefaultListView>)} />
    );
  }
  return <StudioCollectionListView {...props} />;
}

function StudioCollectionListView({
  AfterList,
  AfterListTable,
  BeforeList,
  BeforeListTable,
  createHrefOverride,
  collectionSlug,
  columnState,
  disableBulkDelete,
  disableBulkEdit,
  enableRowSelections,
  hasCreatePermission,
  hasDeletePermission,
  hasTrashPermission,
  newDocumentURL,
  Table,
  groupedData,
  viewType,
}: NativeCollectionListViewProps) {
  const recordsId = useId();
  const { data } = useListQuery();
  const studioConfig = getStudioListConfig(collectionSlug);
  const { getEntityConfig } = useConfig();
  const collectionConfig = getEntityConfig({ collectionSlug });
  // Studio titles match the rail and breadcrumbs ("Navigation", not
  // Payload's generated "Navigations").
  const title = studioConfig.titlePlural;
  const createHref = hasCreatePermission
    ? (createHrefOverride ?? studioConfig.createHref ?? newDocumentURL)
    : null;
  const useAsTitle = String(collectionConfig?.admin?.useAsTitle ?? "id");
  const trash = viewType === "trash";
  const trashEnabled = Boolean(collectionConfig?.trash);
  const noun = title.toLowerCase();
  // Payload's bulk actions, as its own list view offers them.
  const bulk =
    enableRowSelections && collectionConfig
      ? {
          collection: collectionConfig,
          disableBulkDelete,
          disableBulkEdit,
          hasDeletePermission,
          hasTrashPermission,
        }
      : null;

  return (
    <StudioLayout
      recordsId={recordsId}
      sectionLabel={studioConfig.sectionLabel}
      currentLabel={trash ? "Trash" : undefined}
    >
      <PageShell
        title={trash ? `${title} trash` : title}
        description={
          trash
            ? trashEnabled
              ? `Deleted ${noun}. Open one to restore it or delete it permanently.`
              : `${title} are deleted permanently, so nothing is kept here.`
            : studioConfig.description
        }
        density="compact"
        actions={
          trash ? (
            <Link
              href={studioConfig.listPath}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeft aria-hidden="true" />
              Back to {noun}
            </Link>
          ) : (
            <>
              {trashEnabled ? (
                <Link
                  href={`${studioConfig.listPath}/trash`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Trash2 aria-hidden="true" />
                  Trash
                </Link>
              ) : null}
              {createHref ? (
                <Link
                  href={createHref}
                  className={buttonVariants({ size: "sm" })}
                >
                  <Plus aria-hidden="true" />
                  {studioConfig.createLabel}
                </Link>
              ) : null}
            </>
          )
        }
      >
        <div className="flex flex-col gap-6">
          {BeforeList}
          {BeforeListTable}
          <TableColumnsProvider
            collectionSlug={collectionSlug}
            columnState={columnState}
          >
            <RelationshipProvider>
              <SelectionProvider
                docs={data?.docs ?? []}
                totalDocs={data?.totalDocs ?? 0}
              >
                <div id={recordsId} tabIndex={-1}>
                  <NativeCollectionGrid
                    title={title}
                    singularTitle={studioConfig.titleSingular}
                    bulk={bulk}
                    useAsTitle={useAsTitle}
                    hasDrafts={studioConfig.hasDrafts}
                    listPath={studioConfig.listPath}
                    createHref={createHref}
                    createLabel={studioConfig.createLabel}
                    fields={collectionConfig?.fields ?? []}
                    groupedTable={Table}
                    groupedData={groupedData}
                    trash={trash}
                    trashEnabled={trashEnabled}
                  />
                </div>
              </SelectionProvider>
            </RelationshipProvider>
          </TableColumnsProvider>
          {AfterListTable}
          {AfterList}
        </div>
      </PageShell>
    </StudioLayout>
  );
}
