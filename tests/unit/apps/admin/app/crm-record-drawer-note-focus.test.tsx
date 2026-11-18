/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/crm"} */

import { QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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

import type { CrmGridRow } from "@asym/database/types";
import type { ComponentType } from "react";

/**
 * Save note in the CRM record drawer keeps keyboard focus: a natively
 * disabled submit button drops focus to the page, so focus waits on the busy
 * note form, then returns to Save after a failure or to the emptied note box
 * after a save.
 */

type CrmRecord = CrmGridRow & { activities: [] };
type DrawerProps = {
  contact: CrmRecord;
  onClose: () => void;
  onOpenGift: (donationId: string) => void;
};

const note = vi.hoisted(() => ({
  isPending: false,
  mutateAsync: vi.fn(),
}));

function mutation() {
  return { isPending: false, mutate: vi.fn(), mutateAsync: vi.fn() };
}

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  useAdminCrmRecordDetail: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    isFetching: true,
    refetch: vi.fn(),
  }),
  useCreateLinkedCrmNote: () => ({
    isPending: note.isPending,
    mutateAsync: note.mutateAsync,
  }),
  useCrmTablePreferences: () => ({ data: undefined }),
  useCrmNamedViews: () => ({ data: undefined }),
  useSaveCrmRowActionPin: mutation,
  useSaveCrmViewSettings: mutation,
  useSaveCrmTenantDefault: mutation,
  useCreateCrmNamedView: mutation,
  useUpdateCrmNamedView: mutation,
  useDeleteCrmNamedView: mutation,
}));
vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const contact: CrmRecord = {
  id: "donor-theodore",
  recordType: "individual",
  displayName: "Theodore Lindqvist",
  title: null,
  primaryOrganization: null,
  primaryContactLine: null,
  location: null,
  lifecycleStatus: "active",
  lastGiftAt: null,
  lifetimeGiving: 0,
  fundsGivenToSummary: null,
  lastTouchAt: null,
  nextTaskSummary: null,
  portalAccessLabel: "linked",
  linkedAuthUserId: null,
  tags: [],
  assignedMissionaryName: null,
  avatarUrl: null,
  email: null,
  phone: null,
  notesPreview: null,
  createdAt: "2017-10-29T14:20:00.000Z",
  updatedAt: "2026-10-31T16:07:00.000Z",
  activities: [],
};

let DetailDrawer: ComponentType<DrawerProps>;

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

async function startSave() {
  const request = deferred();
  note.mutateAsync.mockReturnValue(request.promise);
  const onClose = vi.fn();
  const onOpenGift = vi.fn();
  // A new element each time, so a rerender reads the mocked pending state.
  const tree = () => (
    <QueryProvider>
      <DetailDrawer
        contact={contact}
        onClose={onClose}
        onOpenGift={onOpenGift}
      />
    </QueryProvider>
  );
  const view = render(tree());
  const dialog = screen.getByRole("dialog", { name: "Theodore Lindqvist" });
  // Let the sheet place its initial focus before the press.
  await waitFor(() =>
    expect(dialog.contains(document.activeElement)).toBe(true),
  );
  const field = within(dialog).getByLabelText("Add a note");
  fireEvent.change(field, { target: { value: "Called to thank him." } });
  const save = within(dialog).getByRole("button", { name: "Save note" });
  const form = save.closest("form");
  if (!form) throw new Error("note form not found");
  save.focus();
  fireEvent.click(save);
  await waitFor(() => expect(note.mutateAsync).toHaveBeenCalled());
  const setPending = (isPending: boolean) => {
    note.isPending = isPending;
    view.rerender(tree());
  };
  setPending(true);
  return { field, form, request, save, setPending };
}

describe("CRM record drawer note focus", () => {
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    ({ DetailDrawer } =
      await import("../../../../../apps/admin/app/(app)/crm/detail-drawer"));
  }, 120_000);

  beforeEach(() => {
    note.isPending = false;
    note.mutateAsync.mockReset();
    window.matchMedia = vi.fn().mockImplementation((media: string) => ({
      matches: false,
      media,
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

  it("parks focus on the busy note form while the note saves", async () => {
    const { form, save } = await startSave();

    expect(save.hasAttribute("disabled")).toBe(true);
    expect(document.activeElement).toBe(form);
    expect(form.getAttribute("aria-busy")).toBe("true");
    expectFocusKept();
  });

  it("returns focus to Save note when the save fails", async () => {
    const { form, request, save, setPending } = await startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.reject(new Error("Network down"));
    });
    setPending(false);

    expect(save.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(save);
    expect(form.getAttribute("aria-busy")).not.toBe("true");
  });

  it("moves focus to the emptied note box after a save", async () => {
    const { field, form, request, setPending } = await startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.resolve();
    });
    expect((field as HTMLTextAreaElement).value).toBe("");
    setPending(false);

    expect(document.activeElement).toBe(field);
  });

  it("moves focus to the note box when the save settles before the box clears", async () => {
    const { field, form, request, save, setPending } = await startSave();
    expect(document.activeElement).toBe(form);

    setPending(false);
    expect(document.activeElement).toBe(save);
    await act(async () => {
      request.resolve();
    });

    expect((field as HTMLTextAreaElement).value).toBe("");
    expect(document.activeElement).toBe(field);
  });
});
