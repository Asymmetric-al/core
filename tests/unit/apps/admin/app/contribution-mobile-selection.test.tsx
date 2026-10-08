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

import { ContributionsMainBody } from "../../../../../apps/admin/app/(app)/contributions/main-body";
import { makeMobileContribution } from "./contribution-mobile-fixture";

// Real DataTableResponsive, installed TanStack beta9 engine, shared Checkbox,
// floating actions and confirmation dialog. Only browser/network seams adapted.
const rows = [
  makeMobileContribution(),
  makeMobileContribution({
    id: "00000000-0000-4000-8000-000000000002",
    donorName: "Fixture Beta",
    donorEmail: "beta@example.invalid",
    stagedGiftId: "00000000-0000-4000-8000-000000000102",
  }),
];
const fetchBatch = vi.fn<typeof fetch>(
  () => new Promise<Response>(() => undefined),
);

beforeEach(() => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches:
      query.includes("max-width") || query.includes("prefers-reduced-motion"),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("fetch", fetchBatch);
  fetchBatch.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function checkboxLabel(index: number) {
  return `Select contribution ${rows[index].id} from ${rows[index].donorName}`;
}

describe("Contribution mobile card selection", () => {
  it("selects actual rows without opening detail and sends their exact receipt identities after confirmation", async () => {
    const onOpen = vi.fn();
    render(
      <ContributionsMainBody
        data={rows}
        isLoading={false}
        onSelectContribution={onOpen}
      />,
    );
    const first = await screen.findByRole("checkbox", {
      name: checkboxLabel(0),
      exact: true,
    });
    const second = screen.getByRole("checkbox", {
      name: checkboxLabel(1),
      exact: true,
    });
    expect(first.closest("button")).toBeNull();
    fireEvent.click(first);
    fireEvent.click(second);
    await waitFor(() =>
      expect(first.getAttribute("aria-checked")).toBe("true"),
    );
    expect(second.getAttribute("aria-checked")).toBe("true");
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: "Send Receipts", exact: true }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Send receipts?",
      exact: true,
    });
    expect(within(dialog).getByText(/2 selected contributions/)).toBeTruthy();
    expect(fetchBatch).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Send receipts",
        exact: true,
      }),
    );
    await waitFor(() => expect(fetchBatch).toHaveBeenCalledTimes(1));
    const [path, init] = fetchBatch.mock.calls[0];
    expect(path).toBe("/api/admin/contribution-batches");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      actionType: "resend_receipt",
      records: rows.map((row) => ({
        id: row.id,
        receiptStatus: row.receiptStatus,
        stagedGiftId: row.stagedGiftId,
      })),
    });
  });

  it("keeps selection tied to the stable record ID after reordered input and leaves detail navigation independent", async () => {
    const onOpen = vi.fn();
    const view = render(
      <ContributionsMainBody
        data={rows}
        isLoading={false}
        onSelectContribution={onOpen}
      />,
    );
    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: checkboxLabel(0),
        exact: true,
      }),
    );
    view.rerender(
      <ContributionsMainBody
        data={[...rows].reverse()}
        isLoading={false}
        onSelectContribution={onOpen}
      />,
    );
    const first = screen.getByRole("checkbox", {
      name: checkboxLabel(0),
      exact: true,
    });
    expect(first.getAttribute("aria-checked")).toBe("true");
    expect(
      screen
        .getByRole("checkbox", { name: checkboxLabel(1), exact: true })
        .getAttribute("aria-checked"),
    ).toBe("false");
    fireEvent.click(
      screen.getByRole("button", { name: /Fixture Alpha.*General Fund/ }),
    );
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(rows[0]);
    fireEvent.click(first);
    await waitFor(() =>
      expect(
        screen.queryByRole("toolbar", { name: "Selected record actions" }),
      ).toBeNull(),
    );
  });
});
