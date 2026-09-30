// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use the app public ESM entry: Bun peer isolation gives the root a different context.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import { DonorsPageDetailContact } from "../../../../apps/missionary/app/donors/donors-page-detail-contact";
import { DonorsPageActivityDialogs } from "../../../../apps/missionary/app/donors/donors-page-dialogs";
import { DonorsPageDetailOverview } from "../../../../apps/missionary/app/donors/donors-page-detail-overview";
import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
import {
  DonorsPageViewProvider,
  useDonorsPageViewFields,
} from "../../../../apps/missionary/app/donors/use-donors-page-view";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const mocks = vi.hoisted(() => ({
  rows: [] as Donor[],
  updateTags: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: mocks.rows,
    isLoading: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" }, loading: false }),
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));
vi.mock("../../../../apps/missionary/app/donors/donor-mutation-client", () => ({
  updateDonorTags: mocks.updateTags,
  insertDonorActivity: vi.fn(),
}));

function donor(index: number, anonymous = false): Donor {
  return {
    id: `donor-${index}`,
    name: `Partner ${String(index).padStart(2, "0")}`,
    initials: "PT",
    type: "Individual",
    status: "Active",
    total_given: 100,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: "partner@example.test",
    phone: "",
    preferred_contact: "email",
    location: "Test City",
    address: {},
    joined_date: "2026-01-01T00:00:00.000Z",
    tags: ["stored-tag"],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
    is_anonymous: anonymous,
  };
}

function ActionsProbe() {
  const view = useDonorsPageViewFields();
  return (
    <>
      <button type="button" onClick={() => view.donors.selectById("donor-1")}>
        Select first partner
      </button>
      <button type="button" onClick={view.editDialog.open}>
        Open profile
      </button>
      <button type="button" onClick={view.tagEditor.open}>
        Open tags
      </button>
      <button type="button" onClick={() => void view.tagEditor.save()}>
        Save tags
      </button>
      <output data-testid="profile-open">
        {String(view.editDialog.isOpen)}
      </output>
      <output data-testid="tags-open">{String(view.tagEditor.isOpen)}</output>
    </>
  );
}

function EditablePage() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <ActionsProbe />
      </DonorsPageViewProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mocks.rows = [donor(1)];
  mocks.updateTags.mockReset().mockResolvedValue({ ok: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Partners roster safety", () => {
  it("edits named partner tags through labeled shared checkboxes without discarding existing tags", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <ActionsProbe />
          <DonorsPageActivityDialogs />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Monthly Partner" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save Tags" }));
    });
    expect(mocks.updateTags).toHaveBeenCalledExactlyOnceWith({
      donorId: "donor-1",
      tags: ["stored-tag", "monthly-partner"],
    });
  });

  it("selects one activity kind through an explicitly named group", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <ActionsProbe />
          <DonorsPageDetailOverview />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    expect(screen.getByLabelText("Activity type")).toBeTruthy();
    const call = screen.getByRole("button", { name: "Call" });
    fireEvent.click(call);
    expect(call.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Meeting" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("switches real detail panels without duplicate React child identities", async () => {
    mocks.rows = [donor(1)];
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(
        <QueryClientProvider client={new QueryClient()}>
          <DonorsPageViewProvider>
            <ActionsProbe />
            <DonorsPageDetail />
          </DonorsPageViewProvider>
        </QueryClientProvider>,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Select first partner" }),
      );
      fireEvent.click(screen.getByRole("tab", { name: "Contact" }));
      expect(
        screen.getByRole("tabpanel", { name: "Contact" }).textContent,
      ).toContain("Mailing Address");
      fireEvent.click(screen.getByRole("tab", { name: "Recurring" }));
      expect(
        screen.getByRole("tabpanel", { name: "Recurring" }).textContent,
      ).toContain("No recurring donations");
      await waitFor(() =>
        expect(screen.queryByRole("tabpanel", { name: "Contact" })).toBeNull(),
      );
      expect(
        errors.mock.calls.filter(([message]) =>
          String(message).includes("same key"),
        ),
      ).toEqual([]);
    } finally {
      errors.mockRestore();
    }
  });

  it("keeps partner type and an Unknown location in the selected partner header", () => {
    mocks.rows = [{ ...donor(1), type: "Church", location: "" }];
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <ActionsProbe />
          <DonorsPageDetail />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    expect(screen.getByText("Church")).toBeTruthy();
    expect(screen.getByText("Unknown")).toBeTruthy();
  });

  it("gives contact copy and external actions meaningful accessible names", () => {
    mocks.rows = [
      {
        ...donor(1),
        website: "https://example.test",
        address: { street: "10 Test Lane", city: "Test City" },
      },
    ];
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <ActionsProbe />
          <DonorsPageDetailContact />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    expect(screen.getByRole("button", { name: "Copy Email" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open partner website" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open partner address in maps" }),
    ).toBeTruthy();
  });

  it("keeps partners after the first ten reachable without a hidden client page", () => {
    mocks.rows = Array.from({ length: 15 }, (_, index) => donor(index + 1));
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DonorsPageViewProvider>
          <DonorsPageRoster />
        </DonorsPageViewProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Partner 11")).toBeTruthy();
    expect(screen.getByText("Partner 15")).toBeTruthy();
  });

  it("does not open profile or tag editing or save redacted anonymous tags", async () => {
    mocks.rows = [donor(1, true)];
    render(<EditablePage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save tags" }));
    });
    expect(screen.getByTestId("profile-open").textContent).toBe("false");
    expect(screen.getByTestId("tags-open").textContent).toBe("false");
    expect(mocks.updateTags).not.toHaveBeenCalled();
  });

  it("keeps named partner edits available with their unredacted tag draft", async () => {
    render(<EditablePage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    expect(screen.getByTestId("profile-open").textContent).toBe("true");
    expect(screen.getByTestId("tags-open").textContent).toBe("true");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save tags" }));
    });
    expect(mocks.updateTags).toHaveBeenCalledExactlyOnceWith({
      donorId: "donor-1",
      tags: ["stored-tag"],
    });
  });

  it("closes edit surfaces and refuses tag save when a refreshed row becomes anonymous", async () => {
    const view = render(<EditablePage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Select first partner" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    mocks.rows = [donor(1, true)];
    view.rerender(<EditablePage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save tags" }));
    });
    expect(screen.getByTestId("profile-open").textContent).toBe("false");
    expect(screen.getByTestId("tags-open").textContent).toBe("false");
    expect(mocks.updateTags).not.toHaveBeenCalled();
  });
});
