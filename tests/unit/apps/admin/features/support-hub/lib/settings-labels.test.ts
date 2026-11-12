import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import {
  AUTOMATION_TRIGGER_LABELS,
  AUTOMATION_CONDITION_LABELS,
  AUTOMATION_ACTION_LABELS,
  MACRO_ACTION_LABELS,
  INBOX_VIEW_LABELS,
  INBOX_LAYOUT_LABELS,
  SAVED_VIEW_SCOPE_LABELS,
} from "../../../../../../../apps/admin/features/support-hub/lib/status-labels";
it("uses one typed sentence-case settings vocabulary", () => {
  expect(AUTOMATION_TRIGGER_LABELS.past_due_reached).toBe("Past-due reached");
  expect(AUTOMATION_CONDITION_LABELS.assignee_is_present).toBe(
    "Assignee is present",
  );
  expect(AUTOMATION_ACTION_LABELS.mark_escalated).toBe("Mark escalated");
  expect(MACRO_ACTION_LABELS.send_canned_response).toBe(
    "Insert canned response",
  );
  expect(INBOX_VIEW_LABELS.mine).toBe("Mine");
  expect(INBOX_LAYOUT_LABELS.table).toBe("Table");
  expect(SAVED_VIEW_SCOPE_LABELS.personal).toBe("Personal");
});

it("reuses view and layout label maps at both switchers", () => {
  for (const [path, map] of [
    ["components/tabs/ViewTabs.tsx", "INBOX_VIEW_LABELS"],
    ["components/toolbar/LayoutToggle.tsx", "INBOX_LAYOUT_LABELS"],
  ])
    expect(
      readFileSync(resolve("apps/admin/features/support-hub", path!), "utf8"),
    ).toContain(map);
});
