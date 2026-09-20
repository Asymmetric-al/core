import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("admin high-complexity extraction contracts", () => {
  it("keeps Eve launch readiness as composed section siblings", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/admin/eve/launch-readiness-panel.tsx",
    );

    expect(source).toContain("function LaunchReadinessStatusGrid(");
    expect(source).toContain("function LaunchManifestImportSection(");
    expect(source).toContain("function LaunchReasonSection(");
    expect(source).toContain("function LaunchIndependentReviewSection(");
    expect(source).toContain("function LaunchPermissionsSection(");
    expect(source).toContain("function LaunchReleaseControlsSection(");
    expect(source).toContain("function LaunchCanarySection(");
    expect(source).toContain("export function EveLaunchReadinessPanel(");
    expect(source).toContain("<LaunchReadinessStatusGrid");
    expect(source).toContain("<LaunchManifestImportSection");
    expect(source).toContain("<LaunchCanarySection");
  });

  it("keeps Eve model policy loaded state on sibling cards", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/admin/eve/model-policy-panel.tsx",
    );

    expect(source).toContain("function EveModelPolicyLoading(");
    expect(source).toContain("function EveModelPolicyLoadError(");
    expect(source).toContain("function EveModelPolicyActiveAlert(");
    expect(source).toContain("function EveModelPolicyVersionList(");
    expect(source).toContain("function EveModelPolicyDraftCard(");
    expect(source).toContain("function EveModelPolicyOverrideCard(");
    expect(source).toContain("function EveModelPolicyLoadedView(");
    expect(source).toContain("export function EveModelPolicyPanel(");
    expect(source).toContain("<EveModelPolicyLoadedView");
  });

  it("keeps Eve governance view on loading, error, and history siblings", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/admin/eve/page-client.tsx",
    );

    expect(source).toContain("function EveGovernanceLoading(");
    expect(source).toContain("function EveGovernanceLoadError(");
    expect(source).toContain("function EveGovernanceStatusAlert(");
    expect(source).toContain("function EveRecentRunsCard(");
    expect(source).toContain("function EveGovernedFailuresCard(");
    expect(source).toContain("function EveAuditHistoryCard(");
    expect(source).toContain("export function EveGovernanceView(");
    expect(source).toContain("<EveGovernanceLoading");
    expect(source).toContain("<EveAuditHistoryCard");
  });

  it("moves contribution overlay mutations into a dedicated actions hook", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/contributions/contribution-detail-overlay.tsx",
    );

    expect(source).toContain("function useContributionDetailOverlayActions(");
    expect(source).toContain("export function ContributionDetailOverlay(");
    expect(source).toContain("useContributionDetailOverlayActions({");
  });

  it("keeps contribution detail sheet states on frame and body siblings", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/contributions/contribution-detail-sheet.tsx",
    );

    expect(source).toContain("function ContributionDetailSheetFrame(");
    expect(source).toContain("function ContributionDetailLoadingState(");
    expect(source).toContain("function ContributionDetailErrorState(");
    expect(source).toContain("function ContributionDetailEmptyBody(");
    expect(source).toContain("function ContributionDetailDonorHeader(");
    expect(source).toContain("function ContributionDetailAmountCard(");
    expect(source).toContain("function ContributionDetailFieldsGrid(");
    expect(source).toContain(
      "function resolveCrmDesignationRecordPresentation(",
    );
    expect(source).toContain("function CrmDesignationRetryUnsupportedNote(");
    expect(source).toContain("function CrmDesignationRetryButton(");
    expect(source).toContain("export function ContributionDetailSheet(");
    expect(source).toContain("<ContributionDetailSheetFrame");
    expect(source).toContain("<ContributionDetailEmptyBody");
  });

  it("resolves operation-shell view state outside the dialog components", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/contributions/operation-shell.tsx",
    );

    expect(source).toContain("function resolveOperationShellViewModel(");
    expect(source).toContain("function ReceiptOutcomeResultItems(");
    expect(source).toContain("function OperationShellForm(");
    expect(source).toContain("function OperationShellDialogBody(");
    expect(source).toContain("function resolveResultPresentation(");
    expect(source).toContain("function OperationResultHeadline(");
    expect(source).toContain("function OperationResultCorrectionItem(");
    expect(source).toContain("function OperationResultReceiptOutcomeItem(");
    expect(source).toContain("function OperationResultDetailsList(");
    expect(source).toContain("function OperationResultPanel(");
    expect(source).toContain("export function ContributionOperationShell(");
    expect(source).toContain("<OperationShellDialogBody");
    expect(source).toContain("<OperationResultHeadline");
    expect(source).toContain("<ReceiptOutcomeResultItems");
  });

  it("keeps CRM detail drawer chrome on header, timeline, and tab siblings", () => {
    const source = readRepoFile("apps/admin/app/(app)/crm/detail-drawer.tsx");

    expect(source).toContain("function DetailDrawerTitleLine(");
    expect(source).toContain("function DetailDrawerHeader(");
    expect(source).toContain("function DetailDrawerIdentity(");
    expect(source).toContain("function DetailDrawerSummary(");
    expect(source).toContain("function DetailDrawerNoteComposer(");
    expect(source).toContain("function DetailDrawerTimeline(");
    expect(source).toContain("function DetailDrawerProperties(");
    expect(source).toContain("function DetailDrawerActivityTab(");
    expect(source).toContain("export function DetailDrawer(");
    expect(source).toContain("<DetailDrawerHeader");
    expect(source).toContain("<DetailDrawerActivityTab");
  });

  it("keeps CRM relationships metrics, filters, and empty state as siblings", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/crm/relationships/page-client.tsx",
    );

    expect(source).toContain("function CrmRelationshipsMetrics(");
    expect(source).toContain("function CrmRelationshipsSourceBadges(");
    expect(source).toContain("function CrmRelationshipsFilters(");
    expect(source).toContain("function CrmRelationshipsEmptyState(");
    expect(source).toContain("function CrmRelationshipsMobileCard(");
    expect(source).toContain(
      "export default function CrmRelationshipsPageClient(",
    );
    expect(source).toContain("<CrmRelationshipsMetrics");
    expect(source).toContain("<CrmRelationshipsEmptyState");
  });

  it("keeps support ticket detail metrics and contact cards as siblings", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/tickets/[id]/page.tsx",
    );

    expect(source).toContain("function SupportTicketNotFoundPage(");
    expect(source).toContain("function SupportTicketMetrics(");
    expect(source).toContain("function SupportTicketContactCard(");
    expect(source).toContain("function SupportTicketMacroCard(");
    expect(source).toContain(
      "export default async function SupportTicketDetailPage(",
    );
    expect(source).toContain("<SupportTicketMetrics");
    expect(source).toContain("<SupportTicketContactCard");
  });

  it("derives board card accessible names outside the card render tree", () => {
    const source = readRepoFile(
      "apps/admin/features/support-hub/components/board/BoardCard.tsx",
    );

    expect(source).toContain("function boardCardAriaLabel(");
    expect(source).toContain("function BoardCardHeader(");
    expect(source).toContain("function BoardCardAssignee(");
    expect(source).toContain("function BoardCardFooter(");
    expect(source).toContain("export function BoardCard(");
    expect(source).toContain("boardCardAriaLabel({");
    expect(source).toContain("<BoardCardHeader");
  });

  it("keeps email message chrome, header, and attachments as siblings", () => {
    const source = readRepoFile(
      "apps/admin/features/support-hub/components/detail/timeline/EmailMessage.tsx",
    );

    expect(source).toContain("function emailMessageChrome(");
    expect(source).toContain("function EmailMessageHeader(");
    expect(source).toContain("function EmailMessageAttachmentsFooter(");
    expect(source).toContain("export function EmailMessage(");
    expect(source).toContain("<EmailMessageHeader");
    expect(source).toContain("<EmailMessageAttachmentsFooter");
  });

  it("keeps automation dry-run results on a dedicated result sibling", () => {
    const source = readRepoFile(
      "apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview.tsx",
    );

    expect(source).toContain("function AutomationDryRunResult(");
    expect(source).toContain("export function AutomationDryRunPreview(");
    expect(source).toContain("<AutomationDryRunResult");
  });

  it("resolves native collection edit model outside the Payload edit view", () => {
    const source = readRepoFile(
      "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx",
    );

    expect(source).toContain("function resolveAuthenticatedPreviewCollection(");
    expect(source).toContain("function buildNativeInspectorItems(");
    expect(source).toContain("function resolveNativeCollectionEditModel(");
    expect(source).toContain("function useNativeCollectionWorkspace(");
    expect(source).toContain("function NativeCollectionEditHeader(");
    expect(source).toContain("function NativeCollectionEditActions(");
    expect(source).toContain("function NativeCollectionInspector(");
    expect(source).toContain("export function NativeCollectionEditView(");
    const modelHelper = source.slice(
      source.indexOf("function resolveNativeCollectionEditModel("),
      source.indexOf("function useNativeCollectionWorkspace("),
    );
    expect(modelHelper).toContain("hasSavePermission");
    expect(modelHelper).not.toContain("hasPublishPermission");
    expect(source).toContain("<NativeCollectionEditHeader");
    expect(source).toContain("<NativeCollectionInspector");
    const workspaceHook = source.slice(
      source.indexOf("function useNativeCollectionWorkspace("),
      source.indexOf("function NativeCollectionEditHeader("),
    );
    expect(workspaceHook).not.toContain("setPreviewURL");
    const editView = source.slice(
      source.indexOf("export function NativeCollectionEditView("),
    );
    expect(editView).toContain("setPreviewURL(model.authenticatedPreviewURL)");
  });

  it("keeps studio nav rail state in a hook with header and recent-doc siblings", () => {
    const source = readRepoFile(
      "apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail.tsx",
    );

    expect(source).toContain("function useStudioNavRailState(");
    expect(source).toContain("function StudioNavRailHeader(");
    expect(source).toContain("function StudioNavRailRecentDocs(");
    expect(source).toContain("export function StudioNavRail(");
    expect(source).toContain("useStudioNavRailState()");
    expect(source).toContain("<StudioNavRailHeader");
    expect(source).toContain("<StudioNavRailRecentDocs");
  });
});
