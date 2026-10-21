// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
import { PersonnelList } from "../../../../../../../apps/admin/features/mission-control/care/components/PersonnelList";
import { ShortcutsHelp } from "../../../../../../../apps/admin/features/mission-control/care/components/ShortcutsHelp";
import { Calendar } from "../../../../../../../apps/admin/features/mission-control/care/components/UI";

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

beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Care Base UI controls", () => {
  it("keeps calendar month navigation named and date selection inside a form non-submitting", () => {
    const onSelect = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Calendar
          defaultMonth={new Date(2026, 9, 1)}
          onSelect={onSelect}
          disabled={[new Date(2026, 9, 2)]}
        />
      </form>,
    );
    const next = screen.getByRole("button", { name: "Next month" });
    expect(next.getAttribute("type")).toBe("button");
    next.focus();
    fireEvent.click(next);
    expect(screen.getByText("November 2026")).toBeTruthy();
    expect(document.activeElement).toBe(next);
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("October 2026")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "2", exact: true }));
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "1", exact: true }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("offers personnel details as one named link without a nested button", () => {
    render(<PersonnelList data={[personnel]} />);
    const link = screen.getByRole("link", {
      name: "View Care Member's care profile",
    });
    expect(link.getAttribute("href")).toBe("/care/directory/person-1");
    expect(link.querySelector("button")).toBeNull();
  });

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
