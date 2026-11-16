/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/crm"} */

import { QueryProvider } from "@asym/database/providers";
import {
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

// The app's own React Query instance, the one the drawer's hooks read.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

import type { CrmDonorDetailResponse, CrmGridRow } from "@asym/database/types";
import type { ComponentType } from "react";

/** The drawer's record: a grid row plus its (incremental) activity list. */
type CrmRecord = CrmGridRow & { activities: [] };
type DrawerProps = {
  contact: CrmRecord;
  open?: boolean;
  onClosed?: () => void;
  onClose: () => void;
  onOpenGift: (donationId: string) => void;
};

/**
 * CRM record drawer: lifetime giving is integer cents, the drawer has one
 * close control, contact details are actionable, and controls that never
 * worked are gone.
 */

const hooks = vi.hoisted(() => ({
  detail: vi.fn(),
  createNote: vi.fn(),
}));
const toastSuccess = vi.hoisted(() => vi.fn());

function mutation() {
  return { isPending: false, mutate: vi.fn(), mutateAsync: vi.fn() };
}

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  useAdminCrmRecordDetail: hooks.detail,
  useCreateLinkedCrmNote: hooks.createNote,
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
  toast: { info: vi.fn(), error: vi.fn(), success: toastSuccess },
}));

const contact: CrmRecord = {
  id: "donor-theodore",
  recordType: "individual",
  displayName: "Theodore Lindqvist",
  title: "High school chemistry teacher",
  primaryOrganization: null,
  primaryContactLine: "theodore@example.org",
  location: "Minneapolis, MN",
  lifecycleStatus: "active",
  lastGiftAt: "2026-10-31T09:13:00.000Z",
  lifetimeGiving: 241_000,
  fundsGivenToSummary: null,
  lastTouchAt: null,
  nextTaskSummary: null,
  portalAccessLabel: "linked",
  linkedAuthUserId: "user-1",
  tags: ["monthly-donor"],
  assignedMissionaryName: "Priya Nair",
  avatarUrl: null,
  email: "theodore@example.org",
  phone: "(612) 555-0137",
  notesPreview: null,
  createdAt: "2017-10-29T14:20:00.000Z",
  updatedAt: "2026-10-31T16:07:00.000Z",
  activities: [],
};

function detailWith(
  overrides: Partial<CrmDonorDetailResponse> = {},
): CrmDonorDetailResponse {
  return {
    donor: {
      id: contact.id,
      name: "Theodore Lindqvist",
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      organization: null,
      location: contact.location,
      status: "active",
      type: "individual",
      profileId: "user-1",
      missionaryId: null,
      notesPreview: null,
      tags: contact.tags,
      avatarUrl: null,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    },
    giftHistory: [],
    giftHistoryTruncated: false,
    timeline: [],
    duplicateWarnings: [],
    support: {
      lifetimeGivingCents: 241_000,
      lastGiftAt: contact.lastGiftAt,
      activeRecurringCommitments: 1,
      lapsedCommitments: 0,
      atRiskCommitments: 0,
      byFund: [],
      byMissionary: [],
    },
    privacy: {
      roleGate: "staff",
      restrictedNotesVisible: false,
      missionaryContactDataExposed: false,
    },
    reconciliation: { crmWriteMode: "disabled", platformPaymentTruth: true },
    ...overrides,
  } as CrmDonorDetailResponse;
}

function query(data: CrmDonorDetailResponse | undefined) {
  return {
    data,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn().mockResolvedValue({ data, isError: false }),
  };
}

let DetailDrawer: ComponentType<DrawerProps>;

function renderDrawer() {
  render(
    <QueryProvider>
      <DetailDrawer contact={contact} onClose={vi.fn()} onOpenGift={vi.fn()} />
    </QueryProvider>,
  );
  return screen.getByRole("dialog", {
    name: "Theodore Lindqvist",
  });
}

describe("CRM record drawer", () => {
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    ({ DetailDrawer } =
      await import("../../../../../apps/admin/app/(app)/crm/detail-drawer"));
  }, 120_000);

  beforeEach(() => {
    hooks.detail.mockReturnValue(query(detailWith()));
    hooks.createNote.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue({}),
    });
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

  it("formats lifetime giving from integer cents before detail loads", () => {
    hooks.detail.mockReturnValue(query(undefined));
    const dialog = renderDrawer();
    expect(within(dialog).getByText("$2,410.00")).toBeTruthy();
    expect(within(dialog).queryByText("$241,000.00")).toBeNull();
  });

  it("formats the detail support total from integer cents", async () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          support: {
            ...detailWith().support,
            lifetimeGivingCents: 315_050,
          },
        }),
      ),
    );
    const dialog = renderDrawer();
    // The summary stat prefers the detail total over the grid row's.
    expect(within(dialog).getByText("$3,150.50")).toBeTruthy();
    expect(within(dialog).queryByText("$315,050.00")).toBeNull();
  });

  it("leads Properties support status with commitments, not the repeated total", async () => {
    const dialog = renderDrawer();
    fireEvent.click(within(dialog).getByRole("tab", { name: "Properties" }));
    const properties = await within(dialog).findByRole("tabpanel", {
      name: "Properties",
    });
    expect(
      within(properties).getByText("1 recurring / 0 at risk"),
    ).toBeTruthy();
    // Lifetime giving already sits in the summary above the tabs.
    expect(within(properties).queryByText("$2,410.00")).toBeNull();
    expect(
      within(properties)
        .getByRole("link", { name: "theodore@example.org" })
        .getAttribute("href"),
    ).toBe("mailto:theodore@example.org");
    expect(
      within(properties)
        .getByRole("link", { name: "(612) 555-0137" })
        .getAttribute("href"),
    ).toBe("tel:(612) 555-0137");
  });

  it("lists the missionaries this donor's gifts supported, apart from the assigned one", async () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          support: {
            ...detailWith().support,
            byMissionary: [
              {
                missionaryId: "m-1",
                missionaryName: "Ruth Okafor",
                amountCents: 5_000,
              },
              {
                missionaryId: null,
                missionaryName: "Unassigned missionary",
                amountCents: 900,
              },
              {
                missionaryId: "m-2",
                missionaryName: "Samuel Ito",
                amountCents: 20_000,
              },
            ],
          },
        }),
      ),
    );
    const dialog = renderDrawer();
    fireEvent.click(within(dialog).getByRole("tab", { name: "Properties" }));
    const properties = await within(dialog).findByRole("tabpanel", {
      name: "Properties",
    });
    const term = within(properties).getByText("Supported missionaries");
    const value = term.nextElementSibling as HTMLElement;
    // Most support first; the unassigned bucket is not a missionary.
    expect(
      within(value)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Samuel Ito", "Ruth Okafor"]);
    expect(within(properties).getByText("Assigned missionary")).toBeTruthy();
  });

  it("says when no gift has gone to a missionary, and when the list is partial", async () => {
    hooks.detail.mockReturnValue(query(detailWith()));
    const dialog = renderDrawer();
    fireEvent.click(within(dialog).getByRole("tab", { name: "Properties" }));
    const properties = await within(dialog).findByRole("tabpanel", {
      name: "Properties",
    });
    expect(
      within(properties).getByText("No gifts to a missionary yet"),
    ).toBeTruthy();
    cleanup();

    hooks.detail.mockReturnValue(
      query(
        detailWith({
          giftHistoryTruncated: true,
          support: {
            ...detailWith().support,
            byMissionary: [
              {
                missionaryId: "m-1",
                missionaryName: "Ruth Okafor",
                amountCents: 5_000,
              },
            ],
          },
        }),
      ),
    );
    const truncated = renderDrawer();
    fireEvent.click(within(truncated).getByRole("tab", { name: "Properties" }));
    expect(
      await within(truncated).findByText("From the most recent 100 gifts"),
    ).toBeTruthy();
  });

  it("says how much lifetime giving comes from outside the gift list", () => {
    const listedGift = (
      id: string,
      amountCents: number,
      paymentStatus: string,
      refundedAmountCents = 0,
    ) => ({
      id,
      donationId: id,
      amountCents,
      currencyCode: "USD",
      giftDate: "2026-10-25T10:31:00.000Z",
      shared: {
        amountCents,
        currencyCode: "USD",
        giftDate: "2026-10-25T10:31:00.000Z",
        designationSummary: { fundName: "Clean Water Initiative" },
        receiptStatus: "sent",
        crmPostStatus: null,
        paymentStatus,
        refundState: refundedAmountCents > 0 ? "partial_refund" : "none",
        refundedAmountCents,
      },
      inlineActions: { nextBestActionType: null, entries: [] },
    });
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          // $2,410.00 lifetime; the list holds $1,000.00 settled after a
          // $100.00 refund, plus a pending gift that does not count.
          giftHistory: [
            listedGift("g-1", 80_000, "completed"),
            listedGift("g-2", 30_000, "completed", 10_000),
            listedGift("g-3", 50_000, "pending"),
          ] as never,
        }),
      ),
    );
    const dialog = renderDrawer();
    const stat = within(dialog).getByText("Lifetime giving").parentElement!;
    expect(stat.textContent).toContain(
      "Includes $1,410.00 not in the gift list",
    );
  });

  it("adds no lifetime note when the gift list accounts for it all", () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          support: { ...detailWith().support, lifetimeGivingCents: 0 },
        }),
      ),
    );
    const dialog = renderDrawer();
    const stat = within(dialog).getByText("Lifetime giving").parentElement!;
    expect(stat.textContent).not.toContain("Includes");
  });

  describe("giving by year", () => {
    const settledGift = (
      id: string,
      amountCents: number,
      giftDate: string,
    ) => ({
      shared: {
        donationId: id,
        amountCents,
        currencyCode: "USD",
        giftDate,
        designationSummary: { fundName: "Clean Water Initiative" },
        receiptStatus: "sent",
        crmPostStatus: null,
        paymentStatus: "completed",
        refundState: "none",
        refundedAmountCents: 0,
      },
      inlineActions: { nextBestActionType: null, entries: [] },
    });
    const thisYear = new Date().getFullYear();

    it("summarises settled giving per year in a table assistive technology reads", () => {
      hooks.detail.mockReturnValue(
        query(
          detailWith({
            giftHistory: [
              settledGift("g-1", 100_000, `${thisYear}-03-01`),
              settledGift("g-2", 50_000, `${thisYear - 2}-04-09`),
            ] as never,
          }),
        ),
      );
      const dialog = renderDrawer();
      const section = within(dialog).getByRole("region", {
        name: "Giving by year",
      });
      const table = within(section).getByRole("table");
      const rows = within(table).getAllByRole("row").slice(1);
      expect(rows.map((row) => row.textContent)).toEqual([
        `${thisYear - 2}$500.001 gift`,
        `${thisYear - 1}$0.000 gifts`,
        `${thisYear} (so far)$1,000.001 gift`,
      ]);
      expect(section.textContent).toContain("Settled gifts, after refunds");
      expect(section.textContent).not.toContain("may be incomplete");
    });

    it("leads Activity with the gift list staff act on, then the chart, the note box and the timeline", () => {
      hooks.detail.mockReturnValue(
        query(
          detailWith({
            giftHistory: [
              settledGift("g-1", 100_000, `${thisYear}-03-01`),
              settledGift("g-2", 50_000, `${thisYear - 2}-04-09`),
            ] as never,
            timeline: [
              {
                id: "t-1",
                kind: "note",
                title: "Called about year-end",
                description: null,
                occurredAt: `${thisYear}-03-02T12:00:00.000Z`,
                amountCents: null,
                currencyCode: null,
                paymentStatus: null,
              },
            ] as never,
          }),
        ),
      );
      const dialog = renderDrawer();
      const order = [
        within(dialog).getByRole("region", { name: "Gift history" }),
        within(dialog).getByRole("region", { name: "Giving by year" }),
        within(dialog).getByLabelText("Add a note"),
        within(dialog).getByRole("region", { name: "Timeline" }),
      ];
      for (let index = 1; index < order.length; index += 1) {
        expect(
          order[index - 1]!.compareDocumentPosition(order[index]!) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      }
    });

    it("says when the capped gift list may leave early years incomplete", () => {
      hooks.detail.mockReturnValue(
        query(
          detailWith({
            giftHistoryTruncated: true,
            giftHistory: [
              settledGift("g-1", 100_000, `${thisYear}-03-01`),
              settledGift("g-2", 50_000, `${thisYear - 1}-04-09`),
            ] as never,
          }),
        ),
      );
      const section = within(renderDrawer()).getByRole("region", {
        name: "Giving by year",
      });
      expect(section.textContent).toContain(
        `Counts the 100 most recent gifts only, so ${thisYear - 1} may be incomplete.`,
      );
    });

    it("shows no chart without two years to compare", () => {
      hooks.detail.mockReturnValue(
        query(
          detailWith({
            giftHistory: [
              settledGift("g-1", 100_000, `${thisYear}-03-01`),
            ] as never,
          }),
        ),
      );
      const dialog = renderDrawer();
      expect(
        within(dialog).queryByRole("region", { name: "Giving by year" }),
      ).toBeNull();
    });

    it("waits for the detail read instead of charting nothing", () => {
      hooks.detail.mockReturnValue({ ...query(undefined), isLoading: true });
      const dialog = renderDrawer();
      expect(within(dialog).getByText("Loading giving by year…")).toBeTruthy();
    });
  });

  it("dims itself while a confirmation opens over it", () => {
    // A nested dialog (e.g. Resend receipt) renders no backdrop of its own,
    // so the drawer opts into the shared sheet's nested-dialog scrim.
    const dialog = renderDrawer();
    expect(
      dialog.querySelector('[data-slot="sheet-nested-dialog-scrim"]'),
    ).toBeTruthy();
    expect(dialog.querySelector('[data-slot="crm-drawer-scrim"]')).toBeNull();
  });

  it("closes through the sheet and reports when it has finished closing", async () => {
    const onClosed = vi.fn();
    const props = { contact, onClose: vi.fn(), onOpenGift: vi.fn(), onClosed };
    const { rerender } = render(
      <QueryProvider>
        <DetailDrawer {...props} open />
      </QueryProvider>,
    );
    expect(
      screen.getByRole("dialog", { name: "Theodore Lindqvist" }),
    ).toBeTruthy();
    expect(onClosed).not.toHaveBeenCalled();

    rerender(
      <QueryProvider>
        <DetailDrawer {...props} open={false} />
      </QueryProvider>,
    );
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1));
  });

  it("has exactly one close control", () => {
    const dialog = renderDrawer();
    expect(
      within(dialog)
        .getAllByRole("button", { name: /close/i })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Close CRM record details"]);
  });

  it("does not submit an empty or whitespace-only note", async () => {
    const mutateAsync = vi.fn();
    hooks.createNote.mockReturnValue({ isPending: false, mutateAsync });
    const dialog = renderDrawer();
    const note = within(dialog).getByLabelText("Add a note");
    const save = within(dialog).getByRole("button", { name: "Save note" });
    expect(save.hasAttribute("disabled")).toBe(true);
    fireEvent.change(note, { target: { value: "   " } });
    expect(save.hasAttribute("disabled")).toBe(true);
    fireEvent.submit(note.closest("form")!);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("drops note tools that never worked and saves notes to the record", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    hooks.createNote.mockReturnValue({ isPending: false, mutateAsync });
    const dialog = renderDrawer();
    expect(
      within(dialog).queryByRole("button", { name: "Attach file to note" }),
    ).toBeNull();
    expect(
      within(dialog).queryByRole("button", { name: "View note history" }),
    ).toBeNull();
    fireEvent.change(within(dialog).getByLabelText("Add a note"), {
      target: { value: "Called to thank him." },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save note" }));
    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        body: "Called to thank him.",
        linkedRecordId: "donor-theodore",
        linkedRecordType: "donor_profile",
        title: "Donor care note: Theodore Lindqvist",
        visibility: "standard",
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith("CRM note saved", {
      description: "Everyone with CRM access can read it now.",
    });
  });

  it("labels the note box visibly and says who can read the note", () => {
    const dialog = renderDrawer();
    const field = within(dialog).getByLabelText("Add a note");
    const description = document.getElementById(
      field.getAttribute("aria-describedby") ?? "",
    );
    expect(description?.textContent).toMatch(
      /Staff with CRM access in your organization can read it/,
    );
    expect(
      within(description!).getByRole("link", { name: "CRM notes" }),
    ).toHaveProperty("pathname", "/crm/notes");
    // The label is on screen, not only for screen readers.
    expect(within(dialog).getByText("Add a note").className).not.toMatch(
      /sr-only/,
    );
  });

  it("titles the drawer with the record name and offers no canned summary", () => {
    const dialog = renderDrawer();
    expect(
      within(dialog).getByRole("heading", {
        level: 2,
        name: "Theodore Lindqvist",
      }),
    ).toBeTruthy();
    expect(
      within(dialog).queryByRole("button", { name: /summary/i }),
    ).toBeNull();
    expect(dialog.textContent).not.toMatch(/next touchpoint|Next step/);
  });

  it("highlights the record's notes and the fund it gives most to, from its data", () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          donor: {
            ...detailWith().donor,
            notesPreview: "Prefers a call after major gifts.",
          },
          support: {
            ...detailWith().support,
            byFund: [
              { amountCents: 10_000, fundId: "fund-a", fundName: "Clinic" },
              { amountCents: 50_000, fundId: "fund-b", fundName: "Schools" },
            ],
          },
        }),
      ),
    );
    const dialog = renderDrawer();
    const highlights = within(dialog).getByRole("region", {
      name: "Highlights",
    });
    expect(highlights.textContent).toContain(
      "Prefers a call after major gifts.",
    );
    expect(highlights.textContent).toContain("Schools");
    expect(highlights.textContent).not.toContain("Clinic");
  });

  it("never reads a failed detail load as a record with no notes", () => {
    hooks.detail.mockReturnValue({
      ...query(undefined),
      isError: true,
      error: new Error("Failed to load CRM record detail (500)"),
    });
    const dialog = renderDrawer();
    expect(dialog.textContent).not.toContain("No notes on file yet");
    expect(
      within(dialog).queryByRole("region", { name: "Highlights" }),
    ).toBeNull();
  });

  it("says when a record has no gifts yet", () => {
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    expect(within(activity).getByText("No gifts recorded yet")).toBeTruthy();
  });

  it("shows loading instead of a false empty timeline while detail loads", () => {
    hooks.detail.mockReturnValue({ ...query(undefined), isLoading: true });
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    expect(within(activity).queryByText(/No timeline entries yet/)).toBeNull();
    expect(within(activity).getByText("Loading timeline…")).toBeTruthy();
  });

  function fullGiftRow(id: string, giftDate: string) {
    return {
      id,
      donationId: id,
      stagedGiftId: null,
      amountCents: 50_000,
      currencyCode: "USD",
      giftDate,
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      refundState: "none",
      correctionState: "none",
      twentyRecordId: null,
      fundId: "fund-water",
      fundName: "Clean Water Initiative",
      missionaryId: null,
      missionaryName: null,
      inlineActions: { nextBestActionType: null, entries: [] },
      shared: {
        donationId: id,
        amountCents: 50_000,
        currencyCode: "USD",
        giftDate,
        donorId: contact.id,
        donorName: "Theodore Lindqvist",
        designationSummary: {
          fundId: "fund-water",
          fundName: "Clean Water Initiative",
          missionaryId: null,
          missionaryName: null,
          lineCount: 1,
        },
        paymentStatus: "completed",
        receiptStatus: "sent",
        crmPostStatus: "posted",
        refundState: "none",
        refundedAmountCents: 0,
        correctionState: "none",
        recurringLinkState: "none",
      },
    } as unknown as CrmDonorDetailResponse["giftHistory"][number];
  }

  it("states the 100-gift cap once", () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          giftHistory: [fullGiftRow("gift-1", "2026-10-25T10:31:00.000Z")],
          giftHistoryTruncated: true,
        }),
      ),
    );
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    expect(within(activity).getByText("First 100 shown")).toBeTruthy();
    expect(within(activity).queryByText(/capped at the 100/)).toBeNull();
  });

  it("marks only received gifts with a plus, not pledges or other activity", () => {
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          timeline: [
            {
              id: "activity-pledge",
              kind: "activity",
              occurredAt: "2026-10-20T12:00:00.000Z",
              title: "Pledged $5,000 at the Kenya vision dinner",
              description: null,
              amountCents: 500_000,
              currencyCode: "USD",
              paymentStatus: null,
              source: "platform",
              visibility: "standard",
            },
            {
              id: "gift-1",
              kind: "gift",
              occurredAt: "2026-10-25T12:00:00.000Z",
              title: "Gift received",
              description: null,
              amountCents: 100_000,
              currencyCode: "USD",
              paymentStatus: "completed",
              source: "platform",
              visibility: "standard",
            },
          ],
        }),
      ),
    );
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    expect(within(activity).getByText("+$1,000.00")).toBeTruthy();
    expect(within(activity).getByText("$5,000.00")).toBeTruthy();
    expect(within(activity).queryByText("+$5,000.00")).toBeNull();
  });

  it("adds a plus only to gifts that settled, and says what happened to the rest", () => {
    const giftEntry = (
      id: string,
      title: string,
      paymentStatus: "completed" | "pending" | "failed" | "refunded",
    ) => ({
      id,
      kind: "gift" as const,
      occurredAt: "2026-10-25T12:00:00.000Z",
      title,
      description: null,
      amountCents: 100_000,
      currencyCode: "USD",
      paymentStatus,
      source: "platform" as const,
      visibility: "standard" as const,
    });
    hooks.detail.mockReturnValue(
      query(
        detailWith({
          timeline: [
            giftEntry("gift-ok", "Gift received", "completed"),
            giftEntry("gift-failed", "Gift failed", "failed"),
            giftEntry("gift-pending", "Gift pending", "pending"),
            giftEntry("gift-refunded", "Gift refunded", "refunded"),
          ],
        }),
      ),
    );
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    const items = within(activity)
      .getAllByRole("listitem")
      .filter((item) => item.textContent?.includes("Gift "));
    const text = items.map((item) => item.textContent ?? "");
    expect(text.filter((line) => line.includes("+$1,000.00"))).toHaveLength(1);
    expect(text.find((line) => line.includes("Gift received"))).toContain(
      "+$1,000.00",
    );
    for (const title of ["Gift failed", "Gift pending", "Gift refunded"]) {
      const line = text.find((entry) => entry.includes(title));
      expect(line).toContain("$1,000.00");
      expect(line).not.toContain("+$");
    }
  });

  it("reports a failed detail load once, with a working Retry", () => {
    const refetch = vi.fn().mockResolvedValue({ data: undefined });
    hooks.detail.mockReturnValue({
      ...query(undefined),
      isError: true,
      error: new Error("Failed to load CRM record detail (500)"),
      refetch,
    });
    const dialog = renderDrawer();
    const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
    const alert = within(activity).getByRole("alert");
    expect(alert.textContent).toContain(
      "Couldn't load gift history and timeline",
    );
    expect(within(activity).queryByText(/No timeline entries yet/)).toBeNull();
    expect(within(activity).queryByText("No gifts recorded yet")).toBeNull();
    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe("CRM record owner from the detail read", () => {
  // A ?donor= link to a record outside the loaded grid pages builds the drawer
  // record from the detail read. Its owner is donors.missionary_id, like the
  // grid's Owner column, never whichever missionary received gifts.
  let toCrmRecordFromDetail: typeof import("../../../../../apps/admin/app/(app)/crm/types").toCrmRecordFromDetail;

  beforeAll(async () => {
    ({ toCrmRecordFromDetail } =
      await import("../../../../../apps/admin/app/(app)/crm/types"));
    ({ DetailDrawer } =
      await import("../../../../../apps/admin/app/(app)/crm/detail-drawer"));
  }, 120_000);

  beforeEach(() => {
    hooks.createNote.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue({}),
    });
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
    vi.unstubAllGlobals();
  });

  /** The drawer names the owner from the detail read; it fetches nothing. */
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  function detailOwnedBy(
    missionaryId: string | null,
    byMissionary: CrmDonorDetailResponse["support"]["byMissionary"],
    missionaryName: string | null = null,
  ) {
    const base = detailWith();
    return detailWith({
      donor: { ...base.donor, missionaryId, missionaryName },
      support: { ...base.support, byMissionary },
    });
  }

  async function ownerProperties(detail: CrmDonorDetailResponse) {
    hooks.detail.mockReturnValue(query(detail));
    // A fresh cache per render, so one test's owner lookup never answers
    // another's.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <DetailDrawer
          contact={toCrmRecordFromDetail(detail)}
          onClose={vi.fn()}
          onOpenGift={vi.fn()}
        />
      </QueryClientProvider>,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Theodore Lindqvist",
    });
    const owner = within(dialog).getByText("Owner").parentElement!;
    fireEvent.click(within(dialog).getByRole("tab", { name: "Properties" }));
    const properties = await within(dialog).findByRole("tabpanel", {
      name: "Properties",
    });
    const assigned = within(properties).getByText(
      "Assigned missionary",
    ).parentElement!;
    return { owner, assigned };
  }

  it("names a deep-linked record's owner from the detail read", async () => {
    const { owner, assigned } = await ownerProperties(
      detailOwnedBy(
        "missionary-owner",
        [
          {
            missionaryId: "missionary-top",
            missionaryName: "Top Recipient",
            amountCents: 90_000,
          },
        ],
        "Priya Nair",
      ),
    );
    for (const field of [owner, assigned]) {
      expect(field.textContent).toContain("Priya Nair");
      expect(field.textContent).not.toContain("Top Recipient");
      expect(field.textContent).not.toContain("name unavailable");
    }
    // The owner comes with the record; no search from the browser.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not show the top gift recipient as the owner", async () => {
    const { owner, assigned } = await ownerProperties(
      detailOwnedBy("missionary-owner", [
        {
          missionaryId: null,
          missionaryName: "Unassigned missionary",
          amountCents: 200_000,
        },
        {
          missionaryId: "missionary-top",
          missionaryName: "Top Recipient",
          amountCents: 90_000,
        },
      ]),
    );
    for (const field of [owner, assigned]) {
      expect(field.textContent).not.toContain("Unassigned missionary");
      expect(field.textContent).not.toContain("Top Recipient");
      // The record has an owner whose name this read does not carry.
      expect(field.textContent).toContain("Assigned (name unavailable)");
    }
  });

  it("ignores a gift recipient even when it shares the owner's id string", async () => {
    // donors.missionary_id is a profile id; gift totals are keyed by
    // missionaries.id, so even an equal string names a different record.
    const { owner, assigned } = await ownerProperties(
      detailOwnedBy("missionary-owner", [
        {
          missionaryId: "missionary-owner",
          missionaryName: "Top Recipient",
          amountCents: 90_000,
        },
      ]),
    );
    for (const field of [owner, assigned]) {
      expect(field.textContent).not.toContain("Top Recipient");
      expect(field.textContent).toContain("Assigned (name unavailable)");
    }
  });

  it("names the owner from the grid row once the record is loaded", async () => {
    hooks.detail.mockReturnValue(
      query(
        detailOwnedBy("missionary-owner", [
          {
            missionaryId: "missionary-top",
            missionaryName: "Top Recipient",
            amountCents: 90_000,
          },
        ]),
      ),
    );
    const dialog = renderDrawer();
    const owner = within(dialog).getByText("Owner").parentElement!;
    expect(owner.textContent).toContain("Priya Nair");
    expect(owner.textContent).not.toContain("Top Recipient");
  });

  it("says not set for a record without an owner", async () => {
    const { owner, assigned } = await ownerProperties(
      detailOwnedBy(null, [
        {
          missionaryId: "missionary-top",
          missionaryName: "Top Recipient",
          amountCents: 90_000,
        },
      ]),
    );
    for (const field of [owner, assigned]) {
      expect(field.textContent).toContain("Not set");
      expect(field.textContent).not.toContain("Top Recipient");
    }
  });
});

describe("CRM gift history rows", () => {
  // Loose props: the fixtures below carry only the fields these rows read.
  let GiftHistoryRows: ComponentType<Record<string, unknown>>;
  let GiftInlineActionControls: ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    GiftHistoryRows = (
      await import("../../../../../apps/admin/app/(app)/crm/gift-history-rows")
    ).GiftHistoryRows as unknown as ComponentType<Record<string, unknown>>;
    GiftInlineActionControls = (
      await import("../../../../../apps/admin/app/(app)/crm/gift-inline-action-controls")
    ).GiftInlineActionControls as unknown as ComponentType<
      Record<string, unknown>
    >;
  }, 120_000);

  afterEach(() => {
    cleanup();
  });

  function giftRow(
    id: string,
    receiptStatus: string,
    crmPostStatus: string | null,
  ) {
    return {
      id,
      donationId: id,
      shared: {
        amountCents: 10_000,
        currencyCode: "USD",
        giftDate: "2026-10-25T10:31:00.000Z",
        designationSummary: { fundName: "Clean Water Initiative" },
        receiptStatus,
        crmPostStatus,
        paymentStatus: "completed",
        refundState: "none",
      },
      inlineActions: { nextBestActionType: null, entries: [] },
    };
  }

  function renderRows(
    rows: ReturnType<typeof giftRow>[],
    { statusLine = true }: { statusLine?: boolean } = {},
  ) {
    return render(
      <GiftHistoryRows
        giftRows={rows as never}
        onOpenGift={vi.fn()}
        onPinRowAction={vi.fn()}
        onRunOperation={vi.fn()}
        tablePreferences={undefined}
        viewSettings={{ columns: { designation: true, statusLine } } as never}
      />,
    );
  }

  function withShared(
    row: ReturnType<typeof giftRow>,
    shared: Record<string, unknown>,
  ) {
    return { ...row, shared: { ...row.shared, ...shared } };
  }

  it("never shows a failed, pending or refunded gift as received money", () => {
    const view = renderRows(
      [
        giftRow("gift-ok", "sent", null),
        withShared(giftRow("gift-failed", "not_sent", null), {
          paymentStatus: "failed",
        }),
        withShared(giftRow("gift-pending", "not_sent", null), {
          paymentStatus: "pending",
        }),
        withShared(giftRow("gift-refunded", "sent", null), {
          paymentStatus: "refunded",
          refundState: "refunded",
        }),
      ],
      // Payment state stays on screen even when receipt lines are hidden.
      { statusLine: false },
    );
    const [ok, failed, pending, refunded] = view.getAllByRole("listitem");
    expect(ok!.querySelectorAll('[data-slot="badge"]')).toHaveLength(0);
    expect(failed!.textContent).toContain("Failed");
    expect(pending!.textContent).toContain("Pending");
    expect(refunded!.textContent).toContain("Refunded");
    // The status is part of the gift's accessible description.
    const open = within(failed!).getByRole("button", {
      name: /^Open gift detail/,
    });
    expect(descriptionOf(open)).toContain("Failed");
  });

  it("flags a partly refunded gift", () => {
    const view = renderRows([
      withShared(giftRow("gift-partial", "sent", null), {
        refundState: "partial_refund",
      }),
    ]);
    const [row] = view.getAllByRole("listitem");
    expect(row!.textContent).toContain("Partially refunded");
    // Still a completed gift: no second payment badge.
    expect(row!.textContent).not.toContain("Completed");
  });

  it("names each gift's actions menu after its gift", () => {
    const actions = {
      nextBestActionType: null,
      entries: [
        {
          actionType: "resend_receipt",
          available: true,
          blockedReason: null,
          nextStep: null,
          riskLevel: "low",
        },
      ],
    };
    const view = renderRows([
      { ...giftRow("gift-a", "sent", null), inlineActions: actions },
      {
        ...withShared(giftRow("gift-b", "sent", null), {
          giftDate: "2026-09-12T10:31:00.000Z",
        }),
        inlineActions: actions,
      },
    ]);
    expect(
      view.getByRole("button", {
        name: "More actions for $100.00 gift on Oct 25, 2026 to Clean Water Initiative",
      }),
    ).toBeTruthy();
    expect(
      view.getByRole("button", {
        name: "More actions for $100.00 gift on Sep 12, 2026 to Clean Water Initiative",
      }),
    ).toBeTruthy();
  });

  it("flags a failed receipt with one badge and leaves retired CRM posting out", () => {
    const view = renderRows([
      giftRow("gift-ok", "sent", "posted"),
      giftRow("gift-receipt-failed", "failed", "blocked"),
      giftRow("gift-crm-blocked", "sent", "blocked"),
    ]);
    const [ok, failed, blocked] = view.getAllByRole("listitem");
    expect(ok!.querySelectorAll('[data-slot="badge"]')).toHaveLength(0);
    expect(ok!.textContent).toContain("Receipt sent");

    const failedBadges = failed!.querySelectorAll('[data-slot="badge"]');
    expect(failedBadges).toHaveLength(1);
    expect(failedBadges[0]!.textContent).toBe("Receipt failed");

    // CRM posting is retired: a stale post state is history in the gift
    // sheet, never a badge here that staff cannot act on.
    expect(blocked!.querySelectorAll('[data-slot="badge"]')).toHaveLength(0);
    for (const row of [ok!, failed!, blocked!]) {
      expect(row.textContent).not.toMatch(/CRM (posted|blocked|not required)/);
    }
  });

  function descriptionOf(element: HTMLElement) {
    return (element.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
  }

  it("tells same-amount gifts to the same fund apart by date", () => {
    const first = giftRow("gift-a", "sent", "posted");
    const second = {
      ...giftRow("gift-b", "sent", "posted"),
      shared: {
        ...giftRow("gift-b", "sent", "posted").shared,
        giftDate: "2026-09-12T10:31:00.000Z",
      },
    };
    const view = renderRows([first, second]);
    const [a, b] = view.getAllByRole("button", {
      name: "Open gift detail for $100.00 to Clean Water Initiative",
    });
    expect(descriptionOf(a!)).toContain("Oct 25, 2026");
    expect(descriptionOf(b!)).toContain("Sep 12, 2026");
  });

  it("says once, visibly, which row action is pinned and lets the viewer unpin it", () => {
    const onPinRowAction = vi.fn();
    const pinnedRow = {
      ...giftRow("gift-pinned", "sent", "posted"),
      inlineActions: {
        nextBestActionType: null,
        entries: [
          {
            actionType: "resend_receipt",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
        ],
      },
    };
    const view = render(
      <GiftHistoryRows
        giftRows={
          [
            pinnedRow,
            { ...pinnedRow, id: "gift-2", donationId: "gift-2" },
          ] as never
        }
        onOpenGift={vi.fn()}
        onPinRowAction={onPinRowAction}
        onRunOperation={vi.fn()}
        tablePreferences={
          {
            tableId: "crm.giftHistory",
            schemaVersion: 1,
            user: { actionId: "resend_receipt", schemaVersion: 1 },
            tenantDefault: null,
          } as never
        }
        viewSettings={
          { columns: { designation: true, statusLine: true } } as never
        }
      />,
    );
    const notes = view.getAllByText(/is the action on every gift/);
    expect(notes).toHaveLength(1);
    // Rows read "Send receipt" or "Resend receipt" by receipt state, so
    // the note names both rather than contradicting the sent rows.
    expect(notes[0]!.textContent).toContain("Send or resend receipt");
    // A quiet one-line note: no tinted box or second pin glyph (each
    // pinned row action already carries one).
    const note = notes[0]!.closest("p")!;
    expect(note.className).not.toContain("bg-muted");
    expect(note.querySelector("svg")).toBeNull();
    // The way back reads as a control beside the note (not a link-styled
    // word inside the sentence), and sits on its own when phones wrap it.
    const useSuggested = view.getByRole("button", {
      name: "Use suggested actions",
    });
    expect(note.contains(useSuggested)).toBe(false);
    expect(useSuggested.getAttribute("data-variant")).toBe("outline");
    expect(useSuggested.parentElement).toBe(note.parentElement);
    fireEvent.click(useSuggested);
    expect(onPinRowAction).toHaveBeenCalledWith(null);
  });

  it("names a pinned row action as pinned", async () => {
    const view = render(
      <GiftInlineActionControls
        inlineActions={
          {
            nextBestActionType: "resend_receipt",
            entries: [
              {
                actionType: "resend_receipt",
                available: true,
                blockedReason: null,
                nextStep: null,
                riskLevel: "low",
              },
            ],
          } as never
        }
        preferences={
          {
            tableId: "crm.giftHistory",
            schemaVersion: 1,
            user: { actionId: "resend_receipt", schemaVersion: 1 },
            tenantDefault: null,
          } as never
        }
        onRunOperation={vi.fn()}
        onPinChange={vi.fn()}
      />,
    );
    const button = view.getByRole("button", { name: "Send receipt, pinned" });
    // A shared tooltip, which keyboard users get too, not a native title.
    expect(button.getAttribute("title")).toBeNull();
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    fireEvent.mouseEnter(button);
    fireEvent.mouseMove(button);
    expect(
      await view.findByText(
        "Pinned row action. Change it in this gift's More actions menu.",
        undefined,
        { timeout: 2000 },
      ),
    ).toBeTruthy();
  });
});
