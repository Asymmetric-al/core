import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("ui package high-complexity extraction contracts", () => {
  it("keeps KpiTile on loading, delta helper, and badge siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/primitives/chart-wrappers.tsx",
    );

    expect(source).toContain("function kpiDeltaBadgeClass(");
    expect(source).toContain("function KpiTileLoading(");
    expect(source).toContain("function KpiTileDeltaBadge(");
    expect(source).toContain("export function KpiTile(");

    const kpiTile = source.slice(source.indexOf("export function KpiTile("));
    expect(kpiTile).toContain("<KpiTileLoading");
    expect(kpiTile).toContain("<KpiTileDeltaBadge");
    expect(kpiTile).not.toContain("bg-emerald-50 text-emerald-700");
    expect(kpiTile).not.toContain('Skeleton className="h-4 w-24"');
    expect(kpiTile).not.toContain('TrendingUp className="mr-1 size-3"');
  });

  it("keeps ImageUploadCustomTrigger on clone-props helpers", () => {
    const helpers = readRepoFile(
      "packages/ui/components/primitives/image-upload-helpers.ts",
    );
    const source = readRepoFile(
      "packages/ui/components/primitives/image-upload.tsx",
    );

    expect(helpers).toContain("function isImageUploadButtonLike(");
    expect(helpers).toContain("function imageUploadClonedTriggerProps(");
    expect(source).toContain("function ImageUploadCustomTrigger(");

    const trigger = source.slice(
      source.indexOf("function ImageUploadCustomTrigger("),
      source.indexOf("function ImageUploadDefaultContent("),
    );
    expect(trigger).toContain("isImageUploadButtonLike(");
    expect(trigger).toContain("imageUploadClonedTriggerProps(");
    expect(trigger).toContain("React.cloneElement(");
    expect(trigger).not.toContain("composeEventHandlers(");
    expect(trigger).not.toContain("resolveButtonTriggerType(");
  });

  it("keeps MotionPreset variants on a non-React builder", () => {
    const source = readRepoFile(
      "packages/ui/components/primitives/motion-preset.tsx",
    );

    expect(source).toContain("function buildMotionPresetVariants(");
    expect(source).toContain("function MotionPreset(");

    const preset = source.slice(source.indexOf("function MotionPreset("));
    expect(preset).toContain("buildMotionPresetVariants(");
    expect(preset).not.toContain("hiddenVariant.filter");
    expect(preset).not.toContain("visibleVariant.filter");
    expect(preset).not.toContain('const axis = direction === "up"');
  });

  it("keeps DataGridCell on per-type siblings and format helpers", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/data-grid/data-grid-cell.tsx",
    );

    expect(source).toContain("function formatDataGridDisplayValue(");
    expect(source).toContain("function dataGridInputType(");
    expect(source).toContain("function DataGridReadonlyCell(");
    expect(source).toContain("function DataGridCheckboxCell(");
    expect(source).toContain("function DataGridSelectCell(");
    expect(source).toContain("function DataGridDisplayCell(");
    expect(source).toContain("function DataGridEditingInput(");
    expect(source).toContain("export function DataGridCell(");

    const cell = source.slice(source.indexOf("export function DataGridCell("));
    expect(cell).toContain("<DataGridReadonlyCell");
    expect(cell).toContain("<DataGridCheckboxCell");
    expect(cell).toContain("<DataGridSelectCell");
    expect(cell).toContain("<DataGridDisplayCell");
    expect(cell).toContain("<DataGridEditingInput");
    expect(cell).not.toContain("SelectValue");
    expect(cell).not.toContain("parseFloat(");
  });

  it("keeps DataTableBodyWithTableState on empty, toolbar, table, and footer siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/data-table/data-table-body.tsx",
    );

    expect(source).toContain("function DataTableBodyEmptyState(");
    expect(source).toContain("function DataTableBodyToolbar<");
    expect(source).toContain("function DataTableBodyTableFrame<");
    expect(source).toContain("function DataTableBodyFooter<");
    expect(source).toContain("export function DataTableBodyWithTableState<");

    const body = source.slice(
      source.indexOf("export function DataTableBodyWithTableState<"),
    );
    expect(body).toContain("<DataTableBodyEmptyState");
    expect(body).toContain("<DataTableBodyToolbar");
    expect(body).toContain("<DataTableBodyTableFrame");
    expect(body).toContain("<DataTableBodyFooter");
    expect(body).not.toContain("No results found");
    expect(body).not.toContain("<DataTablePagination");
    expect(body).not.toContain("<DataTableActionBar");
  });

  it("keeps DataTableCardItem on field helper and identity siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/data-table/data-table-card-view.tsx",
    );

    expect(source).toContain("function cardField(");
    expect(source).toContain("function DataTableCardSelection<");
    expect(source).toContain("function DataTableCardAvatar(");
    expect(source).toContain("function DataTableCardIdentity(");
    expect(source).toContain("function DataTableCardTrailing<");
    expect(source).toContain("function DataTableCardItem<");

    const item = source.slice(source.indexOf("function DataTableCardItem<"));
    expect(item).toContain("cardField(");
    expect(item).toContain("<DataTableCardSelection");
    expect(item).toContain("<DataTableCardAvatar");
    expect(item).toContain("<DataTableCardIdentity");
    expect(item).toContain("<DataTableCardTrailing");
    expect(item).not.toContain("Select row");
    expect(item).not.toContain('Badge variant="secondary"');
  });

  it("keeps DataTableResponsiveInner on view-mode helper and result siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx",
    );

    expect(source).toContain("function resolveResponsiveViewMode(");
    expect(source).toContain("function DataTableResponsiveEmptyState(");
    expect(source).toContain("function DataTableResponsiveResults<");
    expect(source).toContain("function DataTableResponsiveFooter<");
    expect(source).toContain("export function DataTableResponsiveInner<");

    const inner = source.slice(
      source.indexOf("export function DataTableResponsiveInner<"),
    );
    expect(inner).toContain("resolveResponsiveViewMode(");
    expect(inner).toContain("<DataTableResponsiveResults");
    expect(inner).toContain("<DataTableResponsiveFooter");
    expect(inner).not.toContain("No results found");
    expect(inner).not.toContain("<DataTableCardView");
    expect(inner).not.toContain("<DataTableFloatingBar");
  });

  it("keeps DataTableToolbarResponsive on search, filters, and actions siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/data-table/data-table-toolbar-responsive.tsx",
    );

    expect(source).toContain("function DataTableToolbarSearch<");
    expect(source).toContain("function DataTableToolbarFacetFilters<");
    expect(source).toContain("function DataTableToolbarActions<");
    expect(source).toContain("function DataTableToolbarMobileSearch<");
    expect(source).toContain("function DataTableToolbarActiveFilters(");
    expect(source).toContain("export function DataTableToolbarResponsive<");

    const toolbar = source.slice(
      source.indexOf("export function DataTableToolbarResponsive<"),
      source.indexOf("interface MobileFiltersDrawerProps"),
    );
    expect(toolbar).toContain("<DataTableToolbarSearch");
    expect(toolbar).toContain("<DataTableToolbarFacetFilters");
    expect(toolbar).toContain("<DataTableToolbarActions");
    expect(toolbar).toContain("<DataTableToolbarMobileSearch");
    expect(toolbar).toContain("<DataTableToolbarActiveFilters");
    expect(toolbar).not.toContain("Toggle columns");
    expect(toolbar).not.toContain("Open search");
  });

  it("keeps EditorToolbar on enabled-tools helper and section siblings", () => {
    const source = readRepoFile(
      "packages/ui/components/shadcn/rich-text-editor/toolbar.tsx",
    );

    expect(source).toContain("function editorToolbarEnabledTools(");
    expect(source).toContain("function EditorToolbarFormattingSection(");
    expect(source).toContain("function EditorToolbarHeadingsSection(");
    expect(source).toContain("function EditorToolbarListsSection(");
    expect(source).toContain("function EditorToolbarMediaSection(");
    expect(source).toContain("function EditorToolbarHistorySection(");
    expect(source).toContain("function EditorToolbarSectionList(");
    expect(source).toContain("export function EditorToolbar(");

    const toolbar = source.slice(
      source.indexOf("export function EditorToolbar("),
      source.indexOf("function ToolbarButton("),
    );
    expect(toolbar).toContain("editorToolbarEnabledTools(");
    expect(toolbar).toContain("<EditorToolbarSectionList");
    expect(toolbar).not.toContain("toggleBold");
    expect(toolbar).not.toContain("Heading 1");
    expect(toolbar).not.toContain("Numbered List");
  });
});
