import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary-app high-complexity extraction contracts", () => {
  it("keeps DonorsPageContent on header, stats, list, detail, and dialog siblings", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).toContain("const PARTNER_DETAIL_TABS = [");
    expect(source).toContain("function partnerDetailTabLabel(");
    expect(source).toContain("function noteComposerDialogTitle(");
    expect(source).toContain("function noteComposerPlaceholder(");
    expect(source).toContain("function DonorsPageHeader(");
    expect(source).toContain("function DonorsPageSummaryCards(");
    expect(source).toContain("function DonorsPartnerListPanel(");
    expect(source).toContain("function DonorsPartnerListToolbar(");
    expect(source).toContain("function DonorsPartnerListResults(");
    expect(source).toContain("function DonorsPartnerListLoadMore(");
    expect(source).toContain("function DonorsSelectedPartnerHeader(");
    expect(source).toContain("function DonorsPartnerOverviewTab(");
    expect(source).toContain("function DonorsPartnerTasksTab(");
    expect(source).toContain("function DonorsPartnerContactTab(");
    expect(source).toContain("function DonorsPartnerRecurringTab(");
    expect(source).toContain("function DonorsPartnerGivingTab(");
    expect(source).toContain("function DonorsPartnerTabList(");
    expect(source).toContain("function DonorsSelectedPartnerCard(");
    expect(source).toContain("function DonorsEmptySelectionPanel(");
    expect(source).toContain("function DonorsPartnerDetailPane(");
    expect(source).toContain("function DonorsNoteComposerDialog(");
    expect(source).toContain("function DonorsTagEditorDialog(");
    expect(source).toContain("export function DonorsPageContent(");

    const pageContent = source.slice(
      source.indexOf("export function DonorsPageContent("),
    );
    expect(pageContent).toContain("<DonorsPageHeader");
    expect(pageContent).toContain("<DonorsPageSummaryCards");
    expect(pageContent).toContain("<DonorsPartnerListPanel");
    expect(pageContent).toContain("<DonorsPartnerDetailPane");
    expect(pageContent).toContain("<DonorsNoteComposerDialog");
    expect(pageContent).toContain("<DonorsTagEditorDialog");
    expect(pageContent).toContain("<EditDonorDialog");
    expect(pageContent).not.toContain("Manage your support network");
    expect(pageContent).not.toContain("Partners loaded");
    expect(pageContent).not.toContain("Select a Partner");

    const listPanel = source.slice(
      source.indexOf("function DonorsPartnerListPanel("),
      source.indexOf("function DonorsSelectedPartnerHeader("),
    );
    expect(listPanel).toContain("<DonorsPartnerListToolbar");
    expect(listPanel).toContain("<DonorsPartnerListResults");
    expect(listPanel).toContain("<DonorsPartnerListLoadMore");
    expect(listPanel).not.toContain("Search partners...");
    expect(listPanel).not.toContain("Load more partners");

    const selectedCard = source.slice(
      source.indexOf("function DonorsSelectedPartnerCard("),
      source.indexOf("function DonorsEmptySelectionPanel("),
    );
    expect(selectedCard).toContain("<DonorsSelectedPartnerHeader");
    expect(selectedCard).toContain("<DonorsPartnerTabList");
    expect(selectedCard).toContain("<DonorsPartnerOverviewTab");
    expect(selectedCard).toContain("<DonorsPartnerTasksTab");
    expect(selectedCard).toContain("<DonorsPartnerContactTab");
    expect(selectedCard).toContain("<DonorsPartnerRecurringTab");
    expect(selectedCard).toContain("<DonorsPartnerGivingTab");
    expect(selectedCard).not.toContain("selected: selectedDonor");
  });
});
