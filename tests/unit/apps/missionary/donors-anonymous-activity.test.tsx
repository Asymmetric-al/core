// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import { DonorsPageDetailOverview } from "../../../../apps/missionary/app/donors/donors-page-detail-overview";
import { DonorsPageActivityDialogs } from "../../../../apps/missionary/app/donors/donors-page-dialogs";
import {
  DonorsPageViewProvider,
  useDonorsPageViewFields,
} from "../../../../apps/missionary/app/donors/use-donors-page-view";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const mocks = vi.hoisted(() => ({
  rows: [] as Donor[],
  insertActivity: vi.fn(),
  updateTags: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: [...mocks.rows],
    isLoading: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" }, loading: false }),
  useMediaQuery: () => false,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));
vi.mock("../../../../apps/missionary/app/donors/donor-mutation-client", () => ({
  insertDonorActivity: mocks.insertActivity,
  updateDonorTags: mocks.updateTags,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const REASON = /^Activity can’t be logged for anonymous partners$/;
const INVITATION = "Start by logging your first interaction";
const NO_INVITATION = "Activity isn’t shown or logged for anonymous partners";

function donor(id: string, anonymous: boolean): Donor {
  return {
    id,
    name: anonymous ? "Anonymous partner" : "Partner One",
    initials: anonymous ? "AP" : "PO",
    type: "Individual",
    status: "Active",
    total_given: anonymous ? null : 100,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: anonymous ? "" : "partner@example.test",
    phone: "",
    preferred_contact: "email",
    location: "",
    address: {},
    joined_date: "2026-01-01T00:00:00.000Z",
    tags: [],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
    is_anonymous: anonymous,
  };
}

function Probe() {
  const view = useDonorsPageViewFields();
  return (
    <>
      <button type="button" onClick={() => view.donors.selectById("named")}>
        Select named partner
      </button>
      <button type="button" onClick={() => view.donors.selectById("anon")}>
        Select anonymous partner
      </button>
      <button type="button" onClick={() => view.donors.selectById("second")}>
        Select second named partner
      </button>
      <button type="button" onClick={() => view.noteComposer.open("call")}>
        Open call log
      </button>
      <button type="button" onClick={view.tagEditor.open}>
        Open tags
      </button>
      <button type="button" onClick={view.editDialog.open}>
        Open edit
      </button>
      <button
        type="button"
        onClick={() => view.noteComposer.setNoteInput("Called to say thanks")}
      >
        Type note
      </button>
      <button type="button" onClick={() => void view.noteComposer.save()}>
        Save note
      </button>
      <output aria-label="Composer open">
        {String(view.noteComposer.isOpen)}
      </output>
      <output aria-label="Composer type">
        {view.noteComposer.activityType}
      </output>
      <output aria-label="Composer draft">{view.noteComposer.noteInput}</output>
      <output aria-label="Tags open">{String(view.tagEditor.isOpen)}</output>
      <output aria-label="Edit open">{String(view.editDialog.isOpen)}</output>
    </>
  );
}

function renderPage(children: React.ReactNode, select: "named" | "anon") {
  const client = new QueryClient();
  const tree = () => (
    <QueryClientProvider client={client}>
      <DonorsPageViewProvider>
        <Probe />
        {children}
      </DonorsPageViewProvider>
    </QueryClientProvider>
  );
  const { rerender } = render(tree());
  fireEvent.click(
    screen.getByRole("button", {
      name:
        select === "anon" ? "Select anonymous partner" : "Select named partner",
    }),
  );
  return (rows: Donor[]) => {
    mocks.rows = rows;
    rerender(tree());
  };
}

function probe(name: string) {
  fireEvent.click(screen.getByRole("button", { name, hidden: true }));
}

function state(name: string) {
  return screen.getByRole("status", { name, hidden: true }).textContent;
}

function descriptionOf(element: HTMLElement) {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

function expectFocusableWithReason(button: HTMLElement) {
  expect(button.hasAttribute("disabled")).toBe(false);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  button.focus();
  expect(document.activeElement).toBe(button);
  expect(descriptionOf(button)).toMatch(REASON);
}

function topBarNoteButton() {
  const buttons = screen
    .getAllByRole("button", { name: "Note" })
    .filter((button) => !button.hasAttribute("aria-pressed"));
  expect(buttons).toHaveLength(1);
  return buttons[0]!;
}

function openPartnerActions() {
  fireEvent.click(screen.getByRole("button", { name: "Partner actions" }));
}

function logItems() {
  return ["Log a call", "Log a meeting", "Log an email"].map((name) =>
    screen.getByRole("menuitem", { name }),
  );
}

function composer() {
  return {
    note: screen.getByLabelText("Activity note") as HTMLTextAreaElement,
    type: screen.getByRole("group", { name: "Activity type" }),
    post: screen.getByRole("button", { name: /Post/ }),
  };
}

beforeEach(() => {
  mocks.rows = [donor("named", false), donor("anon", true)];
  mocks.insertActivity.mockReset();
  mocks.updateTags.mockReset();
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

describe("AL-2678 WP5 part 2-r2s, ruling Q2: no control logs activity on an anonymous partner, whose write answers 404", () => {
  it("the top bar's Note button is disabled, stays focusable and says why", () => {
    renderPage(<DonorsPageDetail />, "anon");
    expectFocusableWithReason(topBarNoteButton());
  });

  it("Log a call, Log a meeting and Log an email are disabled and say why", async () => {
    renderPage(
      <>
        <DonorsPageDetail />
        <DonorsPageActivityDialogs />
      </>,
      "anon",
    );
    openPartnerActions();
    await screen.findByRole("menuitem", { name: "Log a call" });
    for (const item of logItems()) {
      expect(item.getAttribute("aria-disabled")).toBe("true");
      expect(descriptionOf(item)).toMatch(REASON);
      fireEvent.click(item);
    }
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(mocks.insertActivity).not.toHaveBeenCalled();
  });

  it("the Overview's note, activity type and Post are disabled and say why", () => {
    renderPage(<DonorsPageDetailOverview />, "anon");
    const { note, type, post } = composer();
    expect(note.disabled).toBe(true);
    expect(descriptionOf(note)).toMatch(REASON);
    expect(descriptionOf(type)).toMatch(REASON);
    const kinds = within(type).getAllByRole("button");
    expect(kinds.map((kind) => kind.textContent)).toEqual([
      "Call",
      "Meeting",
      "Note",
    ]);
    for (const kind of kinds)
      expect(
        kind.hasAttribute("disabled") ||
          kind.getAttribute("aria-disabled") === "true",
      ).toBe(true);
    expectFocusableWithReason(post);
  });

  it("the Overview's empty state does not invite logging an interaction", () => {
    renderPage(<DonorsPageDetailOverview />, "anon");
    expect(screen.queryByText(INVITATION)).toBeNull();
    expect(screen.getByText(NO_INVITATION)).toBeTruthy();
  });

  it("the view model opens no composer for an anonymous partner, and the refused open leaves nothing that a named partner later shows", async () => {
    const refresh = renderPage(<DonorsPageActivityDialogs />, "anon");
    probe("Open call log");
    expect(state("Composer open")).toBe("false");
    expect(state("Composer type")).toBe("note");
    expect(screen.queryByRole("dialog")).toBeNull();
    refresh([donor("named", false), donor("anon", false)]);
    await act(async () => {});
    expect(state("Composer open")).toBe("false");
    expect(state("Composer type")).toBe("note");
    expect(screen.queryByRole("dialog")).toBeNull();
    probe("Select named partner");
    await act(async () => {});
    expect(state("Composer open")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("the view model sends nothing when asked to save on an anonymous partner", async () => {
    mocks.insertActivity.mockResolvedValue({ ok: true });
    renderPage(<DonorsPageDetailOverview />, "anon");
    fireEvent.click(screen.getByRole("button", { name: "Type note" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save note" }));
    });
    expect(mocks.insertActivity).not.toHaveBeenCalled();
  });

  it("an open composer closes when the selection moves to an anonymous partner", async () => {
    renderPage(<DonorsPageActivityDialogs />, "named");
    fireEvent.click(screen.getByRole("button", { name: "Open call log" }));
    await screen.findByRole("dialog", { name: "Log Call" });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select anonymous partner",
        hidden: true,
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      screen.getByRole("status", { name: "Composer open" }).textContent,
    ).toBe("false");
  });

  it("a named partner keeps every activity control (guard)", async () => {
    mocks.insertActivity.mockResolvedValue({ ok: true });
    renderPage(
      <>
        <DonorsPageDetail />
        <DonorsPageActivityDialogs />
      </>,
      "named",
    );
    const note = topBarNoteButton();
    expect(note.hasAttribute("disabled")).toBe(false);
    expect(note.getAttribute("aria-disabled")).not.toBe("true");
    expect(note.getAttribute("aria-describedby")).toBeNull();
    openPartnerActions();
    await screen.findByRole("menuitem", { name: "Log a call" });
    for (const item of logItems()) {
      expect(item.getAttribute("aria-disabled")).not.toBe("true");
      expect(item.getAttribute("aria-describedby")).toBeNull();
    }
    fireEvent.click(screen.getByRole("menuitem", { name: "Log a meeting" }));
    const dialog = await screen.findByRole("dialog", { name: "Log Meeting" });
    fireEvent.change(within(dialog).getByLabelText("Activity note"), {
      target: { value: "Met for coffee" },
    });
    await act(async () => {
      fireEvent.submit(dialog.querySelector("form")!);
    });
    expect(mocks.insertActivity).toHaveBeenCalledExactlyOnceWith({
      donorId: "named",
      activityType: "meeting",
      note: "Met for coffee",
    });
  });

  it("a named partner keeps the Overview composer and its invitation (guard)", async () => {
    mocks.insertActivity.mockResolvedValue({ ok: true });
    renderPage(<DonorsPageDetailOverview />, "named");
    const { note, type, post } = composer();
    expect(note.disabled).toBe(false);
    expect(note.getAttribute("aria-describedby")).toBeNull();
    expect(type.getAttribute("aria-describedby")).toBeNull();
    expect(screen.getByText(INVITATION)).toBeTruthy();
    expect(screen.queryByText(NO_INVITATION)).toBeNull();
    expect(screen.queryByText(REASON)).toBeNull();
    fireEvent.change(note, { target: { value: "Called to say thanks" } });
    expect(post.hasAttribute("disabled")).toBe(false);
    expect(post.getAttribute("aria-disabled")).not.toBe("true");
    await act(async () => {
      fireEvent.click(post);
    });
    expect(mocks.insertActivity).toHaveBeenCalledExactlyOnceWith({
      donorId: "named",
      activityType: "note",
      note: "Called to say thanks",
    });
  });
});

describe("AL-2678 WP5 part 2-r2s: a note, the tag dialog and the edit dialog belong to the partner they were opened for", () => {
  const two = () => [donor("named", false), donor("second", false)];

  async function openNoteOnFirst(refreshRows = two()) {
    mocks.rows = refreshRows;
    const refresh = renderPage(<DonorsPageActivityDialogs />, "named");
    probe("Open call log");
    const dialog = await screen.findByRole("dialog", { name: "Log Call" });
    fireEvent.change(within(dialog).getByLabelText("Activity note"), {
      target: { value: "Spoke with the first partner" },
    });
    expect(state("Composer draft")).toBe("Spoke with the first partner");
    return refresh;
  }

  async function expectNothingOpenOnSecond() {
    probe("Select second named partner");
    await act(async () => {});
    expect(state("Composer open")).toBe("false");
    expect(state("Composer draft")).toBe("");
    expect(state("Composer type")).toBe("note");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  }

  it("a note typed on a partner who then turns anonymous is gone, and nothing reopens on the next named partner, whose own note starts empty", async () => {
    mocks.insertActivity.mockResolvedValue({ ok: true });
    const refresh = await openNoteOnFirst();
    refresh([donor("named", true), donor("second", false)]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectNothingOpenOnSecond();
    probe("Open call log");
    const reopened = await screen.findByRole("dialog", { name: "Log Call" });
    expect(
      (within(reopened).getByLabelText("Activity note") as HTMLTextAreaElement)
        .value,
    ).toBe("");
    expect(mocks.insertActivity).not.toHaveBeenCalled();
  });

  it("a note typed before the selection moves to an anonymous partner does not reopen on the next named partner", async () => {
    mocks.rows = [...two(), donor("anon", true)];
    await openNoteOnFirst(mocks.rows);
    probe("Select anonymous partner");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expectNothingOpenOnSecond();
  });

  it("moving to another named partner ends the note, and coming back does not reopen it", async () => {
    await openNoteOnFirst();
    await expectNothingOpenOnSecond();
    probe("Select named partner");
    await act(async () => {});
    expect(state("Composer open")).toBe("false");
    expect(state("Composer draft")).toBe("");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("a draft typed in the Overview stays with its partner", () => {
    mocks.rows = two();
    renderPage(<DonorsPageDetailOverview />, "named");
    fireEvent.change(screen.getByLabelText("Activity note"), {
      target: { value: "Draft for the first partner" },
    });
    probe("Select second named partner");
    expect(
      (screen.getByLabelText("Activity note") as HTMLTextAreaElement).value,
    ).toBe("");
  });

  it("a refresh that still shows the same named partner keeps the open note and its draft (guard)", async () => {
    const refresh = await openNoteOnFirst();
    refresh(two());
    await act(async () => {});
    expect(state("Composer open")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: "Log Call" });
    expect(
      (within(dialog).getByLabelText("Activity note") as HTMLTextAreaElement)
        .value,
    ).toBe("Spoke with the first partner");
  });

  it.each([
    ["Open tags", "Tags open", "Manage tags"],
    ["Open edit", "Edit open", "Edit partner"],
  ])(
    "the dialog opened by %s on a partner who then turns anonymous does not reopen on the next named partner",
    async (open, flag, title) => {
      mocks.rows = two();
      const refresh = renderPage(<DonorsPageActivityDialogs />, "named");
      probe(open);
      await screen.findByRole("dialog", { name: title });
      refresh([donor("named", true), donor("second", false)]);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      probe("Select second named partner");
      await act(async () => {});
      expect(state(flag)).toBe("false");
      expect(screen.queryByRole("dialog")).toBeNull();
    },
  );
});
