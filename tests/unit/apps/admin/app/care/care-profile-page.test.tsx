/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the page at its public UI boundary.
import CareProfilePage from "../../../../../../apps/admin/app/(app)/care/directory/[id]/page-client";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import type { CarePersonnel } from "../../../../../../apps/admin/features/mission-control/care/types";

const { detailQuery } = vi.hoisted(() => ({ detailQuery: vi.fn() }));

const PERSON: CarePersonnel = {
  id: "p-1",
  name: "Grace Mwangi",
  initials: "GM",
  location: "Nairobi, Kenya",
  timezone: "Africa/Nairobi",
  status: "Needs Attention",
  lastCheckIn: "2026-10-01",
  role: "Field nurse",
  region: "Africa",
  healthSignals: { emotional: 80, spiritual: 70, physical: 60, financial: 50 },
  careGaps: ["Monthly call overdue"],
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "p-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@asym/database/hooks", () => {
  const mutation = () => ({ isPending: false, mutateAsync: vi.fn() });
  return {
    useMemberCareDetailQuery: detailQuery,
    useCareProfile: () => ({ data: PERSON, isLoading: false }),
    useCareActivity: () => ({ data: [], isLoading: false }),
    useCarePrivateNotes: () => ({ data: [], isLoading: false }),
    useCareDashboard: vi.fn(),
    useCarePersonnel: vi.fn(),
    useCreateCareThreadPost: mutation,
    useCreateCarePrivateNote: mutation,
    useCreatePrivateNote: mutation,
    useCreateOrUpdateCareGoal: mutation,
    useLogCareActivity: mutation,
    useUpsertCareRequirement: mutation,
    useSetManualAttentionFlag: mutation,
    useLogActivity: mutation,
  };
});

beforeEach(() => {
  detailQuery.mockReturnValue({
    data: {
      personnel: PERSON,
      activities: [],
      privateNotes: [],
      goals: [],
      requirements: [],
    },
    isPending: false,
    isError: false,
  });
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

const precedes = (a: Node, b: Node) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("Care profile page", () => {
  it("shows the manual flag, saved cadence and open goals in the care summary", () => {
    detailQuery.mockReturnValue({
      data: {
        personnel: {
          ...PERSON,
          manualAttention: true,
          birthDate: "1990-04-12",
        },
        activities: [],
        privateNotes: [],
        goals: [
          { id: "g1", status: "active" },
          { id: "g2", status: "completed" },
        ],
        requirements: [
          {
            id: "r1",
            personnelId: PERSON.id,
            activityType: "Video Call",
            intervalDays: 7,
          },
        ],
      },
      isPending: false,
      isError: false,
    });
    render(<CareProfilePage />);
    const details = screen.getByRole("region", { name: "Details" });
    expect(within(details).getByText("Flagged")).toBeTruthy();
    expect(within(details).getByText("Apr 12, 1990")).toBeTruthy();
    expect(within(details).getByText("Video call every 7 days")).toBeTruthy();
    expect(
      within(details).getByText("Open goals").nextElementSibling?.textContent,
    ).toBe("1");
  });

  it("keeps a missing name in the muted description instead of presenting it as a member name", () => {
    detailQuery.mockReturnValue({
      data: {
        personnel: {
          ...PERSON,
          name: "Name not set",
          nameMissing: true,
          initials: "",
        },
        activities: [],
        privateNotes: [],
        goals: [],
        requirements: [],
      },
      isPending: false,
      isError: false,
    });
    render(<CareProfilePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Member profile" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Name not set · Field nurse · Nairobi, Kenya"),
    ).toBeTruthy();
  });
  it("shows a retryable load error instead of not found on a failed detail read", () => {
    const refetch = vi.fn();
    detailQuery.mockReturnValue({
      isError: true,
      isPending: false,
      error: new Error("Access denied"),
      refetch,
    });
    render(<CareProfilePage />);
    expect(screen.getByText("Couldn't load this care profile")).toBeTruthy();
    expect(screen.queryByText("This care profile does not exist")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledOnce();
  });
  it("keeps true missing profiles distinct from errors", () => {
    detailQuery.mockReturnValue({
      data: {
        personnel: null,
        activities: [],
        privateNotes: [],
        goals: [],
        requirements: [],
      },
      isPending: false,
      isError: false,
    });
    render(<CareProfilePage />);
    expect(screen.getByText("This care profile does not exist")).toBeTruthy();
  });
  it("puts status, last check-in and local time before the health signals, so phones see them first", () => {
    render(<CareProfilePage />);

    const details = screen.getByRole("region", { name: "Details" });
    expect(details.textContent).toContain("Status");
    expect(details.textContent).toContain("Needs attention");
    expect(details.textContent).toContain("Last contact");
    expect(details.textContent).toContain("Local time");

    const healthSignals = screen.getByRole("region", {
      name: "Health signals",
    });
    expect(precedes(details, healthSignals)).toBe(true);
    expect(
      precedes(
        details,
        screen.getByRole("combobox", { name: "Profile section" }),
      ),
    ).toBe(true);
  });

  it("keeps role, location and region out of the phone triage card and after the care needs", () => {
    render(<CareProfilePage />);

    const details = screen.getByRole("region", { name: "Details" });
    for (const label of ["Role", "Location", "Region"]) {
      expect(within(details).queryByText(label)).toBeNull();
    }

    // One card for phones (after the care needs) and one for wide screens
    // (under Details); CSS displays exactly one of them.
    const [wide, phone] = screen.getAllByRole("region", { name: "Assignment" });
    for (const assignment of [wide, phone]) {
      expect(within(assignment).getByText("Role")).toBeTruthy();
      expect(within(assignment).getByText("Field nurse")).toBeTruthy();
      expect(within(assignment).getByText("Location")).toBeTruthy();
      expect(within(assignment).getByText("Nairobi, Kenya")).toBeTruthy();
      expect(within(assignment).getByText("Region")).toBeTruthy();
      expect(within(assignment).getByText("Africa")).toBeTruthy();
    }

    // Phones read the page top to bottom: care needs come first.
    const healthSignals = screen.getByRole("region", {
      name: "Health signals",
    });
    expect(precedes(healthSignals, phone)).toBe(true);
    expect(phone.closest("[class~='xl:hidden']")).not.toBeNull();

    // Wide screens keep it in the right-hand column under the triage facts.
    expect(precedes(details, wide)).toBe(true);
    const wrapper = wide.closest("[class~='hidden']");
    expect(wrapper?.className).toContain("xl:block");
    expect(wrapper?.closest("[class*='xl:col-start-3']")).toBe(
      details.closest("[class*='xl:col-start-3']"),
    );
  });

  it("keeps the details card in the right-hand column on wide screens", () => {
    render(<CareProfilePage />);

    const details = screen.getByRole("region", { name: "Details" });
    const column = details.closest("[class*='xl:col-start-3']");
    expect(column).not.toBeNull();
    expect(column?.className).toContain("xl:row-start-1");
  });
});
