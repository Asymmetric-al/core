/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { CrmNoteRow } from "@asym/database/types";
import type { ComponentType } from "react";

/**
 * CRM notes (/crm/notes): every returned note renders in the ReUI grid, a
 * note opens to its full body, linked donors open in CRM, and the composer
 * keeps its save contract.
 */

const notesHook = vi.hoisted(() => vi.fn());

vi.mock("@asym/database/hooks", () => ({
  useAdminCrmNotesGrid: notesHook,
}));
const toastMock = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

function makeNote(index: number, overrides: Partial<CrmNoteRow> = {}) {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `note-${number}`,
    tenantId: "tenant-1",
    title: `Follow-up note ${number}`,
    body: `Body for note ${number}.`,
    bodyPreview: `Body for note ${number}.`,
    authorName: "Joel Ramirez",
    linkedRecordId: null,
    linkedRecordLabel: null,
    linkedRecordType: null,
    visibility: "standard",
    source: "local",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-02T12:00:00.000Z",
    ...overrides,
  } as CrmNoteRow;
}

const FIFTY_NOTES = Array.from({ length: 50 }, (_, index) => makeNote(index));

function notesState(overrides: Record<string, unknown> = {}) {
  return {
    configured: true,
    createNote: vi.fn().mockResolvedValue({}),
    createNoteError: null,
    isCreatingNote: false,
    hasMore: false,
    isFetchingMore: false,
    isLoading: false,
    loadMore: vi.fn(),
    missing: [],
    mode: "local",
    notes: FIFTY_NOTES,
    onRefresh: vi.fn().mockResolvedValue(undefined),
    onSearchChange: vi.fn(),
    onSortingChange: vi.fn(),
    rollback: { existingCrmPath: "/crm" },
    search: "",
    sorting: [{ id: "updatedAt", desc: true }],
    tableError: null,
    ...overrides,
  };
}

let NotesPage: ComponentType;

describe("CRM notes workspace", () => {
  beforeAll(async () => {
    NotesPage = (
      await import("../../../../../apps/admin/app/(app)/crm/notes/page-client")
    ).default;
  }, 120_000);

  // jsdom has no layout: give the virtualized grid body a tall viewport so
  // every loaded row is inside the rendered window (as the records test).
  const clientHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientHeight",
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 6000,
    });
  });
  afterAll(() => {
    if (clientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientHeight",
        clientHeight,
      );
    }
  });

  beforeEach(() => {
    notesHook.mockReturnValue(notesState());
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.getAnimations ??= () => [];
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders every loaded note and says when all are loaded", () => {
    render(<NotesPage />);
    expect(
      screen.getAllByRole("button", { name: /^Follow-up note \d+/ }),
    ).toHaveLength(50);
    expect(screen.getByRole("region", { name: "CRM notes" })).toBeTruthy();
    // The hook pages by cursor; with nothing left to load the list says so.
    expect(screen.getByText("All 50 notes loaded")).toBeTruthy();
    expect(screen.getByText("50 notes")).toBeTruthy();
    expect(screen.queryByText(/showing the first/i)).toBeNull();
  });

  it("offers a skip link that lands on the first note", () => {
    render(<NotesPage />);
    const link = screen.getByRole("link", { name: "Skip to notes" });
    // Invisible until focused, so it never moves the layout.
    expect(link.className.split(" ")).toEqual(
      expect.arrayContaining(["opacity-0", "focus:opacity-100"]),
    );
    fireEvent.click(link);
    const first = document.querySelector<HTMLElement>(
      "[data-grid-row-primary]",
    );
    expect(first).toBeTruthy();
    expect(document.activeElement).toBe(first);
  });

  describe("below the md breakpoint", () => {
    const innerWidth = window.innerWidth;
    beforeEach(() => {
      window.innerWidth = 390;
    });
    afterEach(() => {
      window.innerWidth = innerWidth;
    });

    it("offers server sorting on phones, where the table headers are gone", async () => {
      const state = notesState();
      notesHook.mockReturnValue(state);
      render(<NotesPage />);
      const sort = screen.getByRole("combobox", { name: "Sort notes" });
      expect(sort.textContent).toContain("Updated: newest");
      fireEvent.click(sort);
      const option = await screen.findByRole("option", { name: "Title: A–Z" });
      fireEvent.pointerDown(option, { pointerType: "mouse" });
      fireEvent.click(option);
      expect(state.onSortingChange).toHaveBeenCalledWith([
        { id: "title", desc: false },
      ]);
      // Refresh stays on phones as a named icon button beside the search.
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
      expect(state.onRefresh).toHaveBeenCalledTimes(1);
    });

    it("gives a card's linked record its own line instead of clipping it", () => {
      notesHook.mockReturnValue(
        notesState({
          notes: [
            makeNote(0, {
              title: "Year-end call plan",
              linkedRecordId: "donor-9",
              linkedRecordLabel: "Margaret Okonkwo-Hale",
              linkedRecordType: "donor_profile",
            }),
          ],
        }),
      );
      render(<NotesPage />);
      const linked = screen.getByText("Margaret Okonkwo-Hale", {
        exact: false,
      });
      expect(linked.textContent).toBe("Linked to Margaret Okonkwo-Hale");
      expect(linked.className.split(" ")).not.toContain("truncate");
      // The author and date line no longer carries it.
      const meta = screen.getByText(/Joel Ramirez/);
      expect(meta.textContent).not.toContain("Margaret");
    });

    it("continues past the first page from Load more", () => {
      const state = notesState({ hasMore: true });
      notesHook.mockReturnValue(state);
      render(<NotesPage />);
      fireEvent.click(screen.getByRole("button", { name: "Load more" }));
      expect(state.loadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("counts notes below the page limit", () => {
    notesHook.mockReturnValue(notesState({ notes: FIFTY_NOTES.slice(0, 25) }));
    render(<NotesPage />);
    expect(screen.getByText("25 notes")).toBeTruthy();
  });

  it("shows the data source only when it needs attention", () => {
    const view = render(<NotesPage />);
    const region = screen.getByRole("region", { name: "CRM notes" });
    // Working normally, a provenance chip is only noise.
    expect(
      within(region).queryByRole("group", { name: "Data sources" }),
    ).toBeNull();
    view.unmount();

    notesHook.mockReturnValue(notesState({ configured: false }));
    render(<NotesPage />);
    const notConfigured = screen.getByRole("region", { name: "CRM notes" });
    const sources = within(notConfigured).getByRole("group", {
      name: "Data sources",
    });
    expect(within(sources).getByText("Mission Control")).toBeTruthy();
    // The API's rollback contract ("/crm") is not a data source.
    expect(sources.textContent).not.toMatch(/rollback/i);
  });

  it("opens a note to read its full body", async () => {
    notesHook.mockReturnValue(
      notesState({
        notes: [
          makeNote(0, {
            title: "Year-end call plan",
            body: "Margaret asked for a call the week of Dec 8 to finalize her pledge. She prefers mornings and wants the vision dinner recap first.",
            bodyPreview: "Margaret asked for a call the week of Dec 8...",
          }),
        ],
      }),
    );
    render(<NotesPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Year-end call plan/ }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Year-end call plan",
    });
    expect(dialog.textContent).toContain(
      "She prefers mornings and wants the vision dinner recap first.",
    );
    // Notes run to 10,000 characters: the dialog stays inside the viewport
    // and scrolls, while the title, author, linked record and both Close
    // controls stay pinned however long the note is.
    expect(dialog.className).toContain("overflow-y-auto");
    expect(dialog.className).toMatch(/max-h-/);
    const header = dialog.querySelector<HTMLElement>(
      '[data-slot="crm-note-dialog-header"]',
    )!;
    const footer = dialog.querySelector<HTMLElement>(
      '[data-slot="crm-note-dialog-footer"]',
    )!;
    expect(header.className.split(" ")).toEqual(
      expect.arrayContaining(["sticky", "-top-6", "bg-background"]),
    );
    expect(footer.className.split(" ")).toEqual(
      expect.arrayContaining(["sticky", "-bottom-6", "bg-background"]),
    );
    for (const pinned of [
      within(dialog).getByRole("heading", { name: "Year-end call plan" }),
      within(dialog).getByText(/^Joel Ramirez · Updated/),
      within(dialog).getByText("Linked record"),
      within(dialog).getByText("Visibility"),
    ]) {
      expect(header.contains(pinned)).toBe(true);
    }
    const [closeIcon, closeButton] = within(dialog).getAllByRole("button", {
      name: "Close",
    });
    expect(header.contains(closeIcon!)).toBe(true);
    expect(footer.contains(closeButton!)).toBe(true);
    const body = within(dialog).getByText(/She prefers mornings/);
    expect(header.contains(body) || footer.contains(body)).toBe(false);
  });

  it("clears a lingering save toast when a note opens, so it never covers the note", async () => {
    notesHook.mockReturnValue(
      notesState({ notes: [makeNote(0, { title: "Year-end call plan" })] }),
    );
    render(<NotesPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /^Year-end call plan/ }),
    );
    await screen.findByRole("dialog", { name: "Year-end call plan" });
    expect(toastMock.dismiss).toHaveBeenCalled();
  });

  it("links notes on CRM records back to the record drawer", () => {
    notesHook.mockReturnValue(
      notesState({
        notes: [
          makeNote(0, {
            linkedRecordId: "donor-9",
            linkedRecordLabel: "Margaret Okonkwo-Hale",
            linkedRecordType: "donor_profile",
          }),
          makeNote(1, {
            linkedRecordId: "missionary-3",
            linkedRecordLabel: "Daniel & Grace Okafor",
            linkedRecordType: "missionary_profile",
          }),
        ],
      }),
    );
    render(<NotesPage />);
    expect(
      screen
        .getByRole("link", { name: "Margaret Okonkwo-Hale" })
        .getAttribute("href"),
    ).toBe("/crm?donor=donor-9");
    // Long linked names wrap to a second line rather than cutting off.
    const linked = screen.getByRole("link", { name: "Margaret Okonkwo-Hale" });
    expect(linked.className).toContain("line-clamp-2");
    expect(linked.className.split(" ")).not.toContain("truncate");
    // Missionary profiles are not CRM records; the label stays plain text.
    expect(screen.getByText("Daniel & Grace Okafor")).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: "Daniel & Grace Okafor" }),
    ).toBeNull();
  });

  it("marks restricted notes", () => {
    notesHook.mockReturnValue(
      notesState({
        notes: [makeNote(0, { visibility: "restricted" })],
      }),
    );
    render(<NotesPage />);
    const table = screen.getByRole("table");
    expect(within(table).getByText("Restricted")).toBeTruthy();
  });

  it("saves a note through the composer and clears it", async () => {
    const state = notesState();
    notesHook.mockReturnValue(state);
    render(<NotesPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Gala follow-up" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Body" }), {
      target: { value: "Thank the table hosts." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));
    await waitFor(() =>
      expect(state.createNote).toHaveBeenCalledWith({
        body: "Thank the table hosts.",
        title: "Gala follow-up",
      }),
    );
    await waitFor(() =>
      expect(
        (screen.getByRole("textbox", { name: "Title" }) as HTMLInputElement)
          .value,
      ).toBe(""),
    );
  });

  it("explains what a new note needs before it can be saved", () => {
    render(<NotesPage />);
    const composer = screen.getByRole("complementary", { name: "New note" });
    const title = within(composer).getByRole("textbox", { name: "Title" });
    const body = within(composer).getByRole("textbox", { name: "Body" });
    expect(title.hasAttribute("required")).toBe(true);
    expect(body.hasAttribute("required")).toBe(true);
    expect(within(composer).getAllByText("(required)")).toHaveLength(2);
    // Both fields count characters against their limits.
    expect(composer.textContent).toContain("0 / 160 characters");

    const save = within(composer).getByRole("button", { name: "Save note" });
    expect(save.hasAttribute("disabled")).toBe(true);
    const hint = document.getElementById(
      save.getAttribute("aria-describedby") ?? "",
    );
    expect(hint?.textContent).toBe("Add a title and note to save.");

    fireEvent.change(title, { target: { value: "Gala follow-up" } });
    fireEvent.change(body, { target: { value: "Thank the hosts." } });
    expect(save.hasAttribute("disabled")).toBe(false);
    expect(composer.textContent).not.toContain("Add a title and note to save.");
  });

  it.each([
    [
      "notes are not set up here",
      { configured: false, missing: ["crm_notes"], notes: [] },
      "CRM notes are not available in this environment.",
    ],
    [
      "the viewer lacks CRM access",
      {
        notes: [],
        tableError: new Error("Forbidden: staff CRM access required"),
      },
      "You need staff CRM access to add notes.",
    ],
    [
      "access is still being checked",
      { isLoading: true, notes: [] },
      "Checking your CRM access…",
    ],
  ])("turns writing off when %s, and says why", (_case, overrides, reason) => {
    notesHook.mockReturnValue(notesState(overrides));
    render(<NotesPage />);
    const composer = screen.getByRole("complementary", { name: "New note" });
    expect(
      within(composer)
        .getByRole("textbox", { name: "Title" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(composer)
        .getByRole("textbox", { name: "Body" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(composer)
        .getByRole("button", { name: "Save note" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(composer.textContent).toContain(reason);
    // The phone jump to the composer is off too.
    expect(
      screen.getByRole("button", { name: "New note" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("keeps writing on after a load failure that is not an access denial", () => {
    notesHook.mockReturnValue(
      notesState({ notes: [], tableError: new Error("Gateway timeout") }),
    );
    render(<NotesPage />);
    const composer = screen.getByRole("complementary", { name: "New note" });
    expect(
      within(composer)
        .getByRole("textbox", { name: "Title" })
        .hasAttribute("disabled"),
    ).toBe(false);
  });

  it("shows an empty state that keeps the e2e copy", () => {
    notesHook.mockReturnValue(notesState({ notes: [] }));
    render(<NotesPage />);
    expect(screen.getByText("No CRM notes")).toBeTruthy();
  });

  it("leaves no blank footer band under an empty list", () => {
    notesHook.mockReturnValue(notesState({ notes: [] }));
    render(<NotesPage />);
    const panel = screen.getByRole("region", { name: "CRM notes" });
    const last = panel.lastElementChild as HTMLElement | null;
    expect(last?.textContent?.trim()).not.toBe("");
  });

  it("explains a staff-access denial once, without a Retry that cannot help", () => {
    const state = notesState({
      notes: [],
      tableError: new Error("Forbidden: staff CRM access required"),
    });
    notesHook.mockReturnValue(state);
    render(<NotesPage />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.textContent).toContain("Access required");
    expect(alerts[0]!.textContent).toContain(
      "Your account doesn't have staff access to this organization's CRM. Ask an administrator for access.",
    );
    expect(screen.queryByText("Couldn't load CRM notes")).toBeNull();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("keeps Retry for a load failure that is not an access denial", () => {
    const state = notesState({
      notes: [],
      tableError: new Error("Gateway timeout"),
    });
    notesHook.mockReturnValue(state);
    render(<NotesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(state.onRefresh).toHaveBeenCalledTimes(1);
  });
});
