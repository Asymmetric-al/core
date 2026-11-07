import { useState } from "react";

// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser regression exercises the actual assignee menu with synthetic agents.
import { ConversationAssigneeMenu } from "../../../apps/admin/features/support-hub/components/detail/ConversationAssigneeMenu";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser regression exercises the actual macro launcher with synthetic macros.
import { MacroLauncher } from "../../../apps/admin/features/support-hub/components/macros/MacroLauncher";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser regression measures the actual filter card and selectors.
import { ReportFilters } from "../../../apps/admin/features/support-hub/components/reports/ReportFilters";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser regression exercises the actual label selector with synthetic labels.
import { LabelFilter } from "../../../apps/admin/features/support-hub/components/toolbar/LabelFilter";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser regression measures real saved-view hit targets.
import { SavedViewItem } from "../../../apps/admin/features/support-hub/components/views/SavedViewItem";

import type {
  SupportConversation,
  SupportSavedView,
} from "@asym/database/hooks";

const timestamp = "2026-10-01T00:00:00.000Z";
const conversation: SupportConversation = {
  id: "conversation-a",
  tenantId: "tenant-a",
  inboxId: "inbox-a",
  subject: "Fixture conversation",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactEmail: "donor@example.test",
  externalContactName: null,
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: timestamp,
  lastMessageAt: timestamp,
  lastCustomerMessageAt: timestamp,
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 0,
  slaPolicyId: null,
  createdAt: timestamp,
  updatedAt: timestamp,
};

const savedViews: SupportSavedView[] = [
  { id: "priority", name: "Priority escalations" },
  { id: "onboarding", name: "Saved onboarding views" },
].map(({ id, name }) => ({
  id,
  name,
  slug: id,
  tenantId: "tenant-a",
  ownerAgentId: null,
  scope: "workspace",
  filter: {
    view: "all",
    layout: "list",
    status: "all",
    q: "",
    labelSlugs: [],
    assignee: "",
  },
  createdAt: timestamp,
  updatedAt: timestamp,
}));

export function SupportControlLayouts({ surface }: { surface: string }) {
  const [result, setResult] = useState("");
  const [labelSlugs, setLabelSlugs] = useState<string[]>([]);

  return (
    <main className="p-2">
      {surface === "assignee" && (
        <section className="flex justify-end">
          <ConversationAssigneeMenu conversation={conversation} />
        </section>
      )}
      {surface === "report" && (
        <section id="report-layout">
          <ReportFilters />
        </section>
      )}
      {surface === "saved" && (
        <section className="flex max-w-56 flex-wrap gap-2">
          {savedViews.map((view) => (
            <SavedViewItem
              key={view.id}
              view={view}
              isActive={false}
              onSelect={() => setResult("Selected " + view.id)}
              onRename={() => setResult("Renamed " + view.id)}
              onDelete={() => setResult("Deleted " + view.id)}
            />
          ))}
        </section>
      )}
      {surface === "labels" && (
        <LabelFilter value={labelSlugs} onValueChange={setLabelSlugs} />
      )}
      {surface === "macros" && (
        <section className="flex justify-end">
          <MacroLauncher conversation={conversation} />
        </section>
      )}
      <output id="support-layout-result">
        {surface === "labels" ? labelSlugs.join(",") : result}
      </output>
    </main>
  );
}
