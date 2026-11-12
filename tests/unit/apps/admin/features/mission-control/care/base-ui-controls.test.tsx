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

const requirementMutation = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({}),
}));

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
      useUpsertCareRequirement: () => ({
        mutateAsync: requirementMutation.mutateAsync,
        isPending: false,
      }),
    };
  },
);

vi.mock(
  "@asym/ui/components/shadcn/rich-text-editor",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    LegacyRichTextEditor: () => null,
    RichTextViewer: () => null,
  }),
);

import { PersonnelProfile } from "../../../../../../../apps/admin/features/mission-control/care/components/PersonnelProfile";

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
  it("supports arrow-key navigation between personnel profile tabs", async () => {
    render(
      <PersonnelProfile
        personnel={personnel}
        activities={[]}
        privateNotes={[]}
      />,
    );

    const tablist = screen.getByRole("tablist", { name: "Personnel profile" });
    const overview = within(tablist).getByRole("tab", { name: "Overview" });
    const careThread = within(tablist).getByRole("tab", {
      name: "Care thread",
    });
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(careThread));
    expect(overview.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(careThread);
    expect(careThread.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "Care thread" })).toBeTruthy();
  });

  it("shows health signals as measurements (meters), not as progress", () => {
    render(
      <PersonnelProfile
        personnel={personnel}
        activities={[]}
        privateNotes={[]}
      />,
    );
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(screen.getAllByRole("meter").length).toBeGreaterThanOrEqual(4);
  });

  it("lets phones reach every profile section from a select, Private notes included", async () => {
    render(
      <PersonnelProfile
        personnel={personnel}
        activities={[]}
        privateNotes={[]}
      />,
    );

    // Five tabs overflow a phone; the select lists them all, so the last
    // section is never hidden off the edge with no cue.
    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Profile section" }),
    );
    const option = await screen.findByRole("option", {
      name: "Private notes",
    });
    fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
    fireEvent.click(option);

    // The select and the tab strip drive the same section.
    await waitFor(() =>
      expect(
        screen
          .getByRole("tab", { name: "Private notes", hidden: true })
          .getAttribute("aria-selected"),
      ).toBe("true"),
    );
  });

  it("sets a contact rhythm from the care plan, as the base version could", async () => {
    render(
      <PersonnelProfile
        personnel={personnel}
        activities={[]}
        privateNotes={[]}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Care plan" }));
    const days = await screen.findByRole("spinbutton", {
      name: "Every (days)",
    });
    fireEvent.change(days, { target: { value: "14" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Note (optional)" }), {
      target: { value: "Fortnightly call while on furlough" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    await waitFor(() =>
      expect(requirementMutation.mutateAsync).toHaveBeenCalledWith({
        personnelId: "person-1",
        activityType: "Check-in",
        intervalDays: 14,
        notes: "Fortnightly call while on furlough",
      }),
    );
  });
});
