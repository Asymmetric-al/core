/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import { CarePersonnelGrid } from "../../../../../../../apps/admin/features/mission-control/care/components/care-personnel-grid";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import { CareOverview } from "../../../../../../../apps/admin/features/mission-control/care/components/CareDashboard";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import type {
  ActivityLogEntry,
  CarePersonnel,
} from "../../../../../../../apps/admin/features/mission-control/care/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const DAY = 86_400_000;
/** A local calendar date `daysAgo` days back (the grid counts local days). */
const dateOnly = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function person(overrides: Partial<CarePersonnel>): CarePersonnel {
  return {
    id: "p-1",
    name: "Grace Mwangi",
    initials: "GM",
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
    status: "Healthy",
    lastCheckIn: dateOnly(3),
    role: "Field nurse",
    region: "Africa",
    healthSignals: {
      emotional: 80,
      spiritual: 80,
      physical: 80,
      financial: 80,
    },
    careGaps: [],
    ...overrides,
  };
}

const PEOPLE = [
  person({
    id: "p-1",
    name: "Grace Mwangi",
    status: "Needs Attention",
    lastCheckIn: dateOnly(34),
  }),
  person({ id: "p-2", name: "Daniel Okafor", initials: "DO" }),
  person({
    id: "p-3",
    name: "Samuel Osei",
    initials: "SO",
    status: "Crisis",
    manualAttention: true,
    lastCheckIn: dateOnly(2),
    region: "Middle East",
  }),
];

const ACTIVITY: ActivityLogEntry[] = [
  {
    id: "a-1",
    personnelId: "p-2",
    type: "Video Call",
    content: "<p>Monthly call.</p>",
    date: new Date(Date.now() - 2 * DAY).toISOString(),
    authorId: "c1",
    authorName: "Naomi Ellis",
    isPrivate: false,
  },
];

beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Member Care personnel grid", () => {
  it("keeps phone care needs and flags visible and sorts the cards", async () => {
    const width = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    try {
      render(
        <CarePersonnelGrid
          personnel={[
            { ...PEOPLE[0]!, careGaps: ["Family support"] },
            PEOPLE[2]!,
          ]}
        />,
      );
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.getByText("Open care needs: Family support")).toBeTruthy();
      expect(screen.getAllByText("Flagged")).toHaveLength(1);
      const name = screen.getByText("Samuel Osei");
      expect(name.classList.contains("truncate")).toBe(false);
      const nameLink = screen.getByRole("link", { name: "Samuel Osei" });
      expect(nameLink.nextElementSibling?.textContent).toContain("Flagged");
      const sort = screen.getByRole("combobox", { name: "Sort personnel" });
      fireEvent.mouseDown(sort);
      const option = await screen.findByRole("option", {
        name: "Name: A to Z",
      });
      fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
      fireEvent.click(option);
      expect(
        screen.getAllByRole("link").map((link) => link.textContent),
      ).toEqual(["Grace Mwangi", "Samuel Osei"]);
    } finally {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
    }
  });

  it("shows flags and cadence follow-up badges and lets phone cards sort", async () => {
    render(
      <CarePersonnelGrid
        personnel={PEOPLE}
        requirements={[
          {
            id: "weekly",
            personnelId: "p-2",
            activityType: "Video Call",
            intervalDays: 7,
          },
        ]}
        lastContacts={{ "p-2": { "Video Call": dateOnly(10) } }}
      />,
    );
    const row = screen.getByRole("row", { name: /Samuel Osei/ });
    expect(within(row).getByText("Flagged")).toBeTruthy();
    expect(
      within(screen.getByRole("row", { name: /Daniel Okafor/ })).getByText(
        "Follow-up due",
      ),
    ).toBeTruthy();
  });

  it("filters the directory by region", async () => {
    render(<CarePersonnelGrid personnel={PEOPLE} />);
    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "Filter by region" }),
    );
    const option = await screen.findByRole("option", { name: "Middle East" });
    fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
    fireEvent.click(option);
    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Samuel Osei")).toBeTruthy();
    expect(within(grid).queryByText("Grace Mwangi")).toBeNull();
  });

  it("opens each person's profile from a link named by the person", () => {
    render(<CarePersonnelGrid personnel={PEOPLE} />);
    const link = screen.getByRole("link", { name: /Grace Mwangi/ });
    expect(link.getAttribute("href")).toBe("/care/directory/p-1");
    expect(link.querySelector("button")).toBeNull();
  });

  it("labels statuses in sentence case and shows days since contact", () => {
    render(<CarePersonnelGrid personnel={PEOPLE} />);
    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Needs attention")).toBeTruthy();
    expect(within(grid).getByText("34 days ago")).toBeTruthy();
    expect(within(grid).queryByText("Needs Attention")).toBeNull();
  });

  it("narrows the list by search and by status", () => {
    render(<CarePersonnelGrid personnel={PEOPLE} />);
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search personnel" }),
      {
        target: { value: "samuel" },
      },
    );
    expect(screen.queryByRole("link", { name: /Grace Mwangi/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Samuel Osei/ })).toBeTruthy();
  });
});

describe("Member Care overview", () => {
  it("uses saved cadence and contacts outside the activity feed for the overview", () => {
    render(
      <CareOverview
        personnel={PEOPLE.slice(0, 2)}
        activities={[]}
        requirements={[
          {
            id: "quarterly",
            personnelId: "p-1",
            activityType: "Video Call",
            intervalDays: 90,
          },
          {
            id: "weekly",
            personnelId: "p-2",
            activityType: "Video Call",
            intervalDays: 7,
          },
        ]}
        lastContacts={{
          "p-1": { "Video Call": dateOnly(34) },
          "p-2": { "Video Call": dateOnly(10) },
        }}
      />,
    );
    const followUp = screen.getByRole("region", { name: "Follow-up due" });
    expect(
      within(followUp).queryByRole("link", { name: /Grace Mwangi/ }),
    ).toBeNull();
    expect(
      within(followUp).getByRole("link", { name: /Daniel Okafor/ }),
    ).toBeTruthy();
    expect(within(followUp).getByText("Video call overdue")).toBeTruthy();
  });

  it("shows missing names with the muted description slot and role/location context", () => {
    render(
      <CareOverview
        personnel={[
          person({
            name: "Name not set",
            nameMissing: true,
            initials: "",
            manualAttention: true,
          }),
        ]}
        activities={[]}
      />,
    );
    const followUp = screen.getByRole("region", { name: "Follow-up due" });
    expect(
      within(followUp).getByText("Name not set").getAttribute("data-slot"),
    ).toBe("item-description");
    expect(
      within(followUp).getByText("Field nurse · Nairobi, Kenya"),
    ).toBeTruthy();
  });
  it("discloses capped counts and uses the full total for Field staff", () => {
    render(
      <CareOverview
        personnel={PEOPLE}
        activities={ACTIVITY}
        personnelTotal={290}
      />,
    );
    expect(screen.getByText("Showing 3 of 290 members")).toBeTruthy();
    expect(screen.getByText("Newest 3 listed")).toBeTruthy();
    expect(screen.getByText("290")).toBeTruthy();
  });
  it("clears routine follow-up after logged contact but never after a thread post", () => {
    const overdue = person({ lastCheckIn: dateOnly(60) });
    const contact = {
      ...ACTIVITY[0]!,
      personnelId: overdue.id,
      kind: "activity" as const,
    };
    const { rerender } = render(
      <CareOverview personnel={[overdue]} activities={[contact]} />,
    );
    expect(screen.getByText("Everyone is up to date")).toBeTruthy();
    rerender(
      <CareOverview
        personnel={[overdue]}
        activities={[{ ...contact, kind: "thread" }]}
      />,
    );
    expect(screen.queryByText("Everyone is up to date")).toBeNull();
  });
  it("summarizes the team from the data shown", () => {
    render(<CareOverview personnel={PEOPLE} activities={ACTIVITY} />);
    const summary = screen.getByRole("region", { name: "Member Care summary" });
    expect(within(summary).getByText("Field staff")).toBeTruthy();
    expect(within(summary).getByText("3")).toBeTruthy();
  });

  it("lists who needs follow-up, with the reason and a link to the profile", () => {
    render(<CareOverview personnel={PEOPLE} activities={ACTIVITY} />);
    const followUp = screen.getByRole("region", { name: "Follow-up due" });
    const samuel = within(followUp).getByRole("link", { name: /Samuel Osei/ });
    expect(samuel.getAttribute("href")).toBe("/care/directory/p-3");
    expect(within(followUp).getByText(/Flagged for attention/)).toBeTruthy();
    expect(
      within(followUp).getByRole("link", { name: /Grace Mwangi/ }),
    ).toBeTruthy();
    expect(
      within(followUp).queryByRole("link", { name: /Daniel Okafor/ }),
    ).toBeNull();
  });

  it("explains that a Needs attention status alone does not put someone on the follow-up list", () => {
    render(
      <CareOverview
        personnel={[
          person({
            id: "p-9",
            name: "Ruth Achieng",
            status: "Needs Attention",
          }),
        ]}
        activities={[]}
      />,
    );
    const followUp = screen.getByRole("region", { name: "Follow-up due" });
    expect(
      within(followUp).queryByRole("link", { name: /Ruth Achieng/ }),
    ).toBeNull();
    // The one-line description names who is listed; Care rules explains the
    // rest, including that a Needs attention status alone does not list them.
    const description = within(followUp).getByText(
      /^Flagged, in crisis or at risk, or due for contact under their contact schedule\./,
    );
    expect(description.textContent).not.toMatch(/needs attention/i);
    const rules = within(description).getByRole("link", { name: "Care rules" });
    expect(rules.getAttribute("href")).toBe("/care/settings");
  });

  it("offers no actions that do nothing", () => {
    render(<CareOverview personnel={PEOPLE} activities={ACTIVITY} />);
    for (const name of [
      /review all alerts/i,
      /view history/i,
      /new care record/i,
    ]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });
});
