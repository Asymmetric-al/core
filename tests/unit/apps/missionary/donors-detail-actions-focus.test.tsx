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

// Use the app public ESM entry: Bun peer isolation gives the root a different context.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import { DonorsPageDetailContact } from "../../../../apps/missionary/app/donors/donors-page-detail-contact";
import { DonorsPageActivityDialogs } from "../../../../apps/missionary/app/donors/donors-page-dialogs";
import { DonorsPageDetailOverview } from "../../../../apps/missionary/app/donors/donors-page-detail-overview";
import {
  DonorsPageViewProvider,
  useDonorsPageViewFields,
} from "../../../../apps/missionary/app/donors/use-donors-page-view";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";
import type { DonorMutationResult } from "../../../../apps/missionary/app/donors/donor-mutation-client";

const mocks = vi.hoisted(() => ({
  rows: [] as Donor[],
  insertActivity: vi.fn(),
  updateTags: vi.fn(),
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

function donor(anonymous = false): Donor {
  return {
    id: "donor-1",
    name: "Partner One",
    initials: "PO",
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
    tags: [],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
    is_anonymous: anonymous,
  };
}

/** A save the test answers when it wants to. */
function deferred() {
  let answer!: (value: DonorMutationResult) => void;
  const promise = new Promise<DonorMutationResult>((resolve) => {
    answer = resolve;
  });
  return { promise, answer };
}

function Probe() {
  const view = useDonorsPageViewFields();
  return (
    <>
      <button type="button" onClick={() => view.donors.selectById("donor-1")}>
        Select partner
      </button>
      <button type="button" onClick={() => view.noteComposer.open("call")}>
        Open call log
      </button>
      <button type="button" onClick={view.tagEditor.open}>
        Open tags
      </button>
    </>
  );
}

function renderPage(children: React.ReactNode) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <Probe />
        {children}
      </DonorsPageViewProvider>
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Select partner" }));
}

beforeEach(() => {
  mocks.rows = [donor()];
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

describe("partner overview Post", () => {
  function startPost() {
    const save = deferred();
    mocks.insertActivity.mockReturnValueOnce(save.promise);
    renderPage(<DonorsPageDetailOverview />);
    const note = screen.getByLabelText("Activity note");
    fireEvent.change(note, { target: { value: "Called to say thanks" } });
    const post = screen.getByRole("button", { name: /Post/ });
    post.focus();
    fireEvent.click(post);
    expect(document.activeElement).toBe(post);
    expect(post.getAttribute("aria-disabled")).toBe("true");
    return { save, note, post };
  }

  it("keeps focus on Post while saving, then returns it to the note field", async () => {
    const { save, note } = startPost();
    await act(async () => save.answer({ ok: true }));
    expect((note as HTMLTextAreaElement).value).toBe("");
    expect(document.activeElement).toBe(note);
  });

  it("leaves focus on Post when the note can't be saved", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { save, post } = startPost();
    await act(async () => save.answer({ ok: false, error: "Fixture" }));
    expect(document.activeElement).toBe(post);
    expect(post.getAttribute("aria-disabled")).not.toBe("true");
  });
});

describe("Log call dialog", () => {
  async function openDialog() {
    renderPage(<DonorsPageActivityDialogs />);
    fireEvent.click(screen.getByRole("button", { name: "Open call log" }));
    const dialog = await screen.findByRole("dialog", { name: "Log Call" });
    const note = within(dialog).getByLabelText("Activity note");
    await waitFor(() => expect(document.activeElement).toBe(note));
    fireEvent.change(note, { target: { value: "Talked about the trip" } });
    return dialog;
  }

  it("is a form that saves on submit", async () => {
    mocks.insertActivity.mockResolvedValueOnce({ ok: true });
    const dialog = await openDialog();
    const form = dialog.querySelector("form");
    expect(form).not.toBeNull();
    const save = within(dialog).getByRole("button", { name: "Save" });
    expect(save.getAttribute("type")).toBe("submit");
    await act(async () => {
      fireEvent.submit(form!);
    });
    expect(mocks.insertActivity).toHaveBeenCalledExactlyOnceWith({
      donorId: "donor-1",
      activityType: "call",
      note: "Talked about the trip",
    });
  });

  it("requires a note within the server's 4000-character limit", async () => {
    const dialog = await openDialog();
    const note = within(dialog).getByLabelText("Activity note");
    expect((note as HTMLTextAreaElement).required).toBe(true);
    expect(note.getAttribute("maxlength")).toBe("4000");
    fireEvent.change(note, { target: { value: "   " } });
    const form = dialog.querySelector("form");
    await act(async () => {
      fireEvent.submit(form!);
    });
    expect(mocks.insertActivity).not.toHaveBeenCalled();
  });

  it("parks focus on the form while saving, then returns it to Save on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const save = deferred();
    mocks.insertActivity.mockReturnValueOnce(save.promise);
    const dialog = await openDialog();
    const saveButton = within(dialog).getByRole("button", { name: "Save" });
    saveButton.focus();
    fireEvent.click(saveButton);
    const form = dialog.querySelector("form");
    await waitFor(() => expect(document.activeElement).toBe(form));
    expect(form?.tabIndex).toBe(-1);
    const pending = within(dialog).getByRole("button", { name: "Saving" });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {
      fireEvent.submit(form!);
    });
    expect(mocks.insertActivity).toHaveBeenCalledOnce();
    await act(async () => save.answer({ ok: false, error: "Fixture" }));
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Save" }),
    );
  });
});

describe("Manage tags dialog", () => {
  async function openDialog() {
    renderPage(<DonorsPageActivityDialogs />);
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    return screen.findByRole("dialog", { name: "Manage tags" });
  }

  it("is a form that saves on submit", async () => {
    mocks.updateTags.mockResolvedValueOnce({ ok: true });
    const dialog = await openDialog();
    const form = dialog.querySelector("form");
    expect(form).not.toBeNull();
    expect(
      within(dialog)
        .getByRole("button", { name: "Save Tags" })
        .getAttribute("type"),
    ).toBe("submit");
    await act(async () => {
      fireEvent.submit(form!);
    });
    expect(mocks.updateTags).toHaveBeenCalledOnce();
  });

  it("parks focus on the form while saving, then returns it to Save Tags on failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const save = deferred();
    mocks.updateTags.mockReturnValueOnce(save.promise);
    const dialog = await openDialog();
    const saveButton = within(dialog).getByRole("button", {
      name: "Save Tags",
    });
    saveButton.focus();
    fireEvent.click(saveButton);
    const form = dialog.querySelector("form");
    await waitFor(() => expect(document.activeElement).toBe(form));
    await act(async () => save.answer({ ok: false, error: "Fixture" }));
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Save Tags" }),
    );
  });
});

describe("anonymous partner actions", () => {
  function expectFocusableWithReason(button: HTMLElement, reason: RegExp) {
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    button.focus();
    expect(document.activeElement).toBe(button);
    const describedBy = button.getAttribute("aria-describedby") ?? "";
    const description = describedBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(description).toMatch(reason);
  }

  it("keeps Add tag reachable and says why it is unavailable", () => {
    mocks.rows = [donor(true)];
    renderPage(<DonorsPageDetail />);
    expectFocusableWithReason(
      screen.getByRole("button", { name: /Add tag/ }),
      /Anonymous partners can’t be tagged/,
    );
  });

  it("keeps contact Edit reachable and says why it is unavailable", () => {
    mocks.rows = [donor(true)];
    renderPage(<DonorsPageDetailContact />);
    expectFocusableWithReason(
      screen.getByRole("button", { name: /^Edit/ }),
      /Anonymous partners’ details can’t be edited/,
    );
  });
});
