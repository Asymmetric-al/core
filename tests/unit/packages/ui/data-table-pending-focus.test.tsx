// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataTablePagination } from "../../../../packages/ui/components/shadcn/data-table/data-table-pagination";
import { DataTableToolbar } from "../../../../packages/ui/components/shadcn/data-table/data-table-toolbar";
import { DataTableToolbarResponsive } from "../../../../packages/ui/components/shadcn/data-table/data-table-toolbar-responsive";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

import type {
  ColumnFiltersState,
  PaginationState,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

vi.mock("../../../../packages/ui/components/shadcn/drawer", () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DrawerFooter: ({ children, className }: React.ComponentProps<"div">) => (
    <div className={className}>{children}</div>
  ),
  DrawerHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DrawerTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DrawerTrigger: ({
    render,
    children,
  }: {
    render?: React.ReactElement;
    children?: React.ReactNode;
  }) => render ?? <>{children}</>,
  DrawerVirtualKeyboardProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

const rows = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  name: `Ada ${i}`,
}));
const columns = [{ accessorKey: "name", header: "Name" }];

function Harness({
  kind = "pagination",
  transition = true,
  delayPending = false,
  delayedRefresh = false,
  onAction = () => {},
}: {
  kind?: "pagination" | "standard" | "responsive";
  transition?: boolean;
  delayPending?: boolean;
  delayedRefresh?: boolean;
  onAction?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "name", value: "Ada" },
  ]);
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<(typeof rows)[number]>(),
    columns,
    data: rows,
    state: { pagination, columnFilters },
    onPaginationChange: (updater) => {
      onAction();
      setPagination(updater);
      if (transition) {
        if (delayPending) setTimeout(() => setPending(true), 0);
        else setPending(true);
      }
    },
    onColumnFiltersChange: (updater) => {
      onAction();
      setColumnFilters(updater);
      if (transition) {
        if (delayPending) setTimeout(() => setPending(true), 0);
        else setPending(true);
      }
    },
    autoResetPageIndex: false,
  });
  return (
    <>
      <button onClick={() => setPending(true)}>Unrelated URL transition</button>
      <button onClick={() => setLoading(true)}>Background load</button>
      <button
        onClick={() => {
          setPending(false);
          setLoading(false);
        }}
      >
        Finish
      </button>
      <button onClick={() => setColumnFilters([{ id: "name", value: "Ada" }])}>
        Restore filters
      </button>
      <div data-testid="chrome">
        {kind === "pagination" ? (
          <DataTablePagination table={table} urlStatePending={pending} />
        ) : kind === "standard" ? (
          <DataTableToolbar table={table} urlStatePending={pending} />
        ) : (
          <DataTableToolbarResponsive
            table={table}
            urlStatePending={pending}
            isLoading={loading}
            onRefresh={() => {
              onAction();
              if (transition) {
                if (delayedRefresh) setTimeout(() => setLoading(true), 0);
                else setLoading(true);
              }
            }}
          />
        )}
      </div>
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name, exact: true }));
}

describe("table chrome pending focus ownership", () => {
  it("keeps only the pagination initiator focusable even when it reaches the page boundary", () => {
    const onAction = vi.fn();
    render(<Harness onAction={onAction} />);
    const next = screen.getByRole("button", { name: "Go to next page" });
    next.focus();
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
    expect(next.hasAttribute("disabled")).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    for (const name of [
      "Go to first page",
      "Go to previous page",
      "Go to last page",
    ])
      expect(
        screen.getByRole("button", { name }).hasAttribute("disabled"),
      ).toBe(true);
    fireEvent.click(next);
    expect(onAction).toHaveBeenCalledOnce();
    click("Finish");
    expect(next.hasAttribute("disabled")).toBe(true);
    click("Unrelated URL transition");
    for (const button of within(screen.getByTestId("chrome")).getAllByRole(
      "button",
    ))
      expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("does not retain a stale pagination initiator when a local table never becomes pending", async () => {
    vi.useFakeTimers();
    render(<Harness transition={false} />);
    click("Go to next page");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    click("Unrelated URL transition");
    for (const button of within(screen.getByTestId("chrome")).getAllByRole(
      "button",
    ))
      expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("keeps the pagination initiator focusable when URL pending starts after the local click render", async () => {
    vi.useFakeTimers();
    render(<Harness delayPending />);
    const next = screen.getByRole("button", { name: "Go to next page" });
    next.focus();
    fireEvent.click(next);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(document.activeElement).toBe(next);
    expect(next.hasAttribute("disabled")).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
  });

  it("does not consume delayed pagination pending focus after an unrelated transition finishes", async () => {
    vi.useFakeTimers();
    render(<Harness delayPending />);
    click("Unrelated URL transition");
    click("Finish");
    const next = screen.getByRole("button", { name: "Go to next page" });
    next.focus();
    fireEvent.click(next);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(document.activeElement).toBe(next);
    expect(next.hasAttribute("disabled")).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
  });

  it.each(["standard", "responsive"] as const)(
    "keeps only an initiating %s reset while optimistic filters disappear",
    (kind) => {
      const onAction = vi.fn();
      render(<Harness kind={kind} onAction={onAction} />);
      const label = kind === "standard" ? "Reset filters" : "Reset";
      const reset = screen.getByRole("button", { name: label, exact: true });
      reset.focus();
      fireEvent.click(reset);
      expect(reset.isConnected).toBe(true);
      expect(document.activeElement).toBe(reset);
      expect(reset.getAttribute("aria-disabled")).toBe("true");
      expect(reset.hasAttribute("disabled")).toBe(false);
      fireEvent.click(reset);
      expect(onAction).toHaveBeenCalledOnce();
      click("Finish");
      expect(
        screen.queryByRole("button", { name: label, exact: true }),
      ).toBeNull();
      click("Restore filters");
      click("Unrelated URL transition");
      expect(
        screen
          .getByRole("button", { name: label, exact: true })
          .hasAttribute("disabled"),
      ).toBe(true);
    },
  );

  it.each(["standard", "responsive"] as const)(
    "keeps an initiating %s reset mounted when URL pending starts after filters clear",
    async (kind) => {
      vi.useFakeTimers();
      render(<Harness kind={kind} delayPending />);
      const label = kind === "standard" ? "Reset filters" : "Reset";
      const reset = screen.getByRole("button", { name: label, exact: true });
      reset.focus();
      fireEvent.click(reset);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(reset.isConnected).toBe(true);
      expect(document.activeElement).toBe(reset);
      expect(reset.hasAttribute("disabled")).toBe(false);
      expect(reset.getAttribute("aria-disabled")).toBe("true");
    },
  );

  it.each(["standard", "responsive"] as const)(
    "does not consume delayed %s reset focus after an unrelated transition finishes",
    async (kind) => {
      vi.useFakeTimers();
      render(<Harness kind={kind} delayPending />);
      click("Unrelated URL transition");
      click("Finish");
      const label = kind === "standard" ? "Reset filters" : "Reset";
      const reset = screen.getByRole("button", { name: label, exact: true });
      reset.focus();
      fireEvent.click(reset);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(reset.isConnected).toBe(true);
      expect(document.activeElement).toBe(reset);
      expect(reset.hasAttribute("disabled")).toBe(false);
      expect(reset.getAttribute("aria-disabled")).toBe("true");
    },
  );

  it("keeps mobile Clear All native-disabled during another transition and preserves its own pending focus", async () => {
    render(<Harness kind="responsive" />);
    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    const clear = await screen.findByRole("button", { name: "Clear All" });
    act(() => {
      screen
        .getByRole("button", { name: "Unrelated URL transition", hidden: true })
        .click();
    });
    expect(clear.hasAttribute("disabled")).toBe(true);
    act(() => {
      screen.getByRole("button", { name: "Finish", hidden: true }).click();
    });
    clear.focus();
    fireEvent.click(clear);
    expect(clear.hasAttribute("disabled")).toBe(false);
    expect(clear.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(clear);
    act(() => {
      screen.getByRole("button", { name: "Finish", hidden: true }).click();
    });
    expect(clear.hasAttribute("disabled")).toBe(true);
    act(() => {
      screen
        .getByRole("button", { name: "Unrelated URL transition", hidden: true })
        .click();
    });
    expect(clear.hasAttribute("disabled")).toBe(true);
  });

  it("preserves mobile Clear All focus when URL pending starts after filters clear", async () => {
    vi.useFakeTimers();
    render(<Harness kind="responsive" delayPending />);
    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    const clear = screen.getByRole("button", { name: "Clear All" });
    clear.focus();
    fireEvent.click(clear);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(document.activeElement).toBe(clear);
    expect(clear.hasAttribute("disabled")).toBe(false);
    expect(clear.getAttribute("aria-disabled")).toBe("true");
  });

  it("does not consume delayed mobile Clear All focus after an unrelated transition finishes", async () => {
    vi.useFakeTimers();
    render(<Harness kind="responsive" delayPending />);
    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    click("Unrelated URL transition");
    click("Finish");
    const clear = screen.getByRole("button", { name: "Clear All" });
    clear.focus();
    fireEvent.click(clear);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(document.activeElement).toBe(clear);
    expect(clear.hasAttribute("disabled")).toBe(false);
    expect(clear.getAttribute("aria-disabled")).toBe("true");
  });

  it("preserves existing Refresh focus while loading and does not retain focus after a no-op refresh blurs", () => {
    const onAction = vi.fn();
    const view = render(<Harness kind="responsive" onAction={onAction} />);
    click("Background load");
    const refresh = screen.getByRole("button", { name: "Refresh table" });
    expect(refresh.hasAttribute("disabled")).toBe(true);
    click("Finish");
    refresh.focus();
    fireEvent.click(refresh);
    expect(refresh.hasAttribute("disabled")).toBe(false);
    expect(refresh.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(refresh);
    fireEvent.click(refresh);
    expect(onAction).toHaveBeenCalledOnce();
    click("Finish");
    view.rerender(
      <Harness kind="responsive" transition={false} onAction={onAction} />,
    );
    fireEvent.click(refresh);
    act(() => screen.getByRole("button", { name: "Background load" }).focus());
    click("Background load");
    expect(refresh.hasAttribute("disabled")).toBe(true);
  });

  it("preserves Refresh focus when the loading notification arrives on a later tick", async () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    render(<Harness kind="responsive" delayedRefresh onAction={onAction} />);
    const refresh = screen.getByRole("button", { name: "Refresh table" });
    refresh.focus();
    fireEvent.click(refresh);
    expect(refresh.getAttribute("aria-disabled")).not.toBe("true");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(refresh.hasAttribute("disabled")).toBe(false);
    expect(refresh.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(refresh);
    fireEvent.click(refresh);
    expect(onAction).toHaveBeenCalledOnce();
    act(() => screen.getByRole("button", { name: "Background load" }).focus());
    expect(refresh.hasAttribute("disabled")).toBe(true);
  });
});
