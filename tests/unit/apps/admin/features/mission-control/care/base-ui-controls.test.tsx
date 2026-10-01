// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "../../../../../../../apps/admin/features/mission-control/care/hooks/use-care",
  () => {
    const useMutation = () => ({ mutateAsync: vi.fn(), isPending: false });
    return {
      useCreateCareThreadPost: useMutation,
      useCreateCarePrivateNote: useMutation,
      useCreateOrUpdateCareGoal: useMutation,
      useLogCareActivity: useMutation,
      useSetManualAttentionFlag: useMutation,
      useUpsertCareRequirement: useMutation,
    };
  },
);

vi.mock("@asym/ui/components/shadcn/rich-text-editor", () => ({
  LegacyRichTextEditor: () => null,
  RichTextViewer: () => null,
}));

import { PersonnelProfile } from "../../../../../../../apps/admin/features/mission-control/care/components/PersonnelProfile";
import { ShortcutsHelp } from "../../../../../../../apps/admin/features/mission-control/care/components/ShortcutsHelp";

import type { CarePersonnel } from "../../../../../../../apps/admin/features/mission-control/care/types";

const personnel: CarePersonnel = {
  id: "person-1",
  name: "Care Member",
  initials: "CM",
  location: "Bangkok",
  timezone: "Asia/Bangkok",
  status: "Healthy",
  lastCheckIn: "2026-09-21",
  role: "Missionary",
  region: "SE Asia",
  healthSignals: { emotional: 80, spiritual: 80, physical: 80, financial: 80 },
  careGaps: [],
};

afterEach(cleanup);

describe("Care Base UI controls", () => {
  it("names the shortcuts dialog and handles Escape from inside it", async () => {
    const onOpenChange = vi.fn();
    render(<ShortcutsHelp open onOpenChange={onOpenChange} />);

    const dialog = screen.getByRole("dialog", { name: "Keyboard Shortcuts" });
    const close = within(dialog).getByRole("button", { name: "Close" });
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    fireEvent.keyDown(close, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it("supports arrow-key navigation between personnel profile tabs", async () => {
    render(
      <PersonnelProfile
        personnel={personnel}
        activities={[]}
        privateNotes={[]}
      />,
    );

    const tablist = screen.getByRole("tablist", { name: "Personnel profile" });
    const overview = within(tablist).getByRole("tab", { name: "overview" });
    const careThread = within(tablist).getByRole("tab", {
      name: "care thread",
    });
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(careThread));
    expect(overview.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(careThread);
    expect(careThread.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "care thread" })).toBeTruthy();
  });
});
