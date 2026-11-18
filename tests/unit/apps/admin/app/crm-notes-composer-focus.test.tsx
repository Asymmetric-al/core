/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ComponentType } from "react";

/**
 * Save note on /crm/notes keeps keyboard focus: a natively disabled submit
 * button drops focus to the page, so focus waits on the busy composer, then
 * returns to Save after a failure or to the emptied Title after a save.
 */

const notes = vi.hoisted(() => ({
  configured: true,
  isCreatingNote: false,
  createNote: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useAdminCrmNotesGrid: () => ({
    configured: notes.configured,
    createNote: notes.createNote,
    createNoteError: null,
    isCreatingNote: notes.isCreatingNote,
    hasMore: false,
    isFetchingMore: false,
    isLoading: false,
    loadMore: vi.fn(),
    missing: [],
    mode: "local",
    notes: [],
    onRefresh: vi.fn(),
    onSearchChange: vi.fn(),
    onSortingChange: vi.fn(),
    rollback: { existingCrmPath: "/crm" },
    search: "",
    sorting: [{ id: "updatedAt", desc: true }],
    tableError: null,
  }),
}));
vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn(), dismiss: vi.fn() },
}));

let NotesPage: ComponentType;

function deferred() {
  let resolve: () => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function expectFocusKept() {
  const active = document.activeElement;
  expect(active).not.toBe(document.body);
  expect(active?.matches(":disabled")).toBe(false);
}

function startSave() {
  const request = deferred();
  notes.createNote.mockReturnValue(request.promise);
  const view = render(<NotesPage />);
  const composer = screen.getByRole("complementary", { name: "New note" });
  const title = within(composer).getByRole("textbox", { name: "Title" });
  fireEvent.change(title, { target: { value: "Gala follow-up" } });
  fireEvent.change(within(composer).getByRole("textbox", { name: "Body" }), {
    target: { value: "Thank the table hosts." },
  });
  const save = within(composer).getByRole("button", { name: "Save note" });
  const form = save.closest("form");
  if (!form) throw new Error("composer form not found");
  save.focus();
  fireEvent.click(save);
  expect(notes.createNote).toHaveBeenCalled();
  const setPending = (isCreatingNote: boolean) => {
    notes.isCreatingNote = isCreatingNote;
    view.rerender(<NotesPage />);
  };
  setPending(true);
  return { form, request, save, setPending, title };
}

describe("CRM notes composer focus", () => {
  beforeAll(async () => {
    NotesPage = (
      await import("../../../../../apps/admin/app/(app)/crm/notes/page-client")
    ).default;
  }, 120_000);

  beforeEach(() => {
    notes.configured = true;
    notes.isCreatingNote = false;
    notes.createNote.mockReset();
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

  it("parks focus on the busy composer while the note saves", () => {
    const { form, save } = startSave();

    expect(save.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(form);
    expect(form.getAttribute("aria-busy")).toBe("true");
    expectFocusKept();
  });

  it("returns focus to Save note when the save fails", async () => {
    const { form, request, save, setPending } = startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.reject(new Error("Network down"));
    });
    setPending(false);

    expect(save.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(save);
    expect(form.getAttribute("aria-busy")).not.toBe("true");
  });

  it("moves focus to the emptied Title after a save", async () => {
    const { form, request, setPending, title } = startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.resolve();
    });
    expect((title as HTMLInputElement).value).toBe("");
    setPending(false);

    expect(document.activeElement).toBe(title);
  });

  it("moves focus to Title when the save settles before the composer clears", async () => {
    const { form, request, save, setPending, title } = startSave();
    expect(document.activeElement).toBe(form);

    setPending(false);
    expect(document.activeElement).toBe(save);
    await act(async () => {
      request.resolve();
    });

    expect((title as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(title);
  });

  it("moves focus to the composer when writing becomes blocked while Save has focus", () => {
    const view = render(<NotesPage />);
    const composer = screen.getByRole("complementary", { name: "New note" });
    fireEvent.change(within(composer).getByRole("textbox", { name: "Title" }), {
      target: { value: "Gala follow-up" },
    });
    fireEvent.change(within(composer).getByRole("textbox", { name: "Body" }), {
      target: { value: "Thank the table hosts." },
    });
    const save = within(composer).getByRole("button", { name: "Save note" });
    const form = save.closest("form");
    save.focus();
    expect(document.activeElement).toBe(save);

    notes.configured = false;
    view.rerender(<NotesPage />);

    expect(save.hasAttribute("disabled")).toBe(true);
    // Title is disabled too, so focus waits on the composer form.
    expect(document.activeElement).toBe(form);
    expectFocusKept();
  });
});
