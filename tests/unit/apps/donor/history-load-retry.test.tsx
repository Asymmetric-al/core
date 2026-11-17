// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const history = vi.hoisted(() => ({
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useDonorHistoryTransactions: () => ({
    data: [],
    isLoading: false,
    isError: history.isError,
    collection: { utils: { refetch: history.refetch } },
  }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => true,
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function MonthlyGivingChartStub() {
      return <svg data-testid="monthly-giving-chart" />;
    },
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor history page at its app boundary.
import DonorHistoryPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((settle, fail) => {
    resolve = settle;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  history.isError = false;
  history.refetch.mockReset();
});

function failToLoad() {
  history.isError = true;
  const view = render(<DonorHistoryPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

it("offers Try again instead of asking the donor to refresh the page", () => {
  failToLoad();
  expect(screen.getByRole("alert").textContent).toBe(
    "We couldn’t load your giving history.",
  );
  expect(screen.queryByText(/Refresh the page/)).toBeNull();
});

it("keeps focus on Try again while it retries, then moves it to the heading once the gifts load", async () => {
  const pending = deferred<unknown>();
  history.refetch.mockReturnValue(pending.promise);
  const { retry } = failToLoad();
  fireEvent.click(retry);
  expect(history.refetch).toHaveBeenCalledTimes(1);

  // The collection stays in its error state until the refetch lands.
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);
  fireEvent.click(busy);
  expect(history.refetch).toHaveBeenCalledTimes(1);

  history.isError = false;
  await act(async () => pending.resolve([{ isError: false, data: [] }]));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(
    screen.getByRole("textbox", { name: "Search giving history" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Giving history" }),
  );
});

it("returns to Try again and says so again when the retry fails", async () => {
  const pending = deferred<unknown>();
  history.refetch.mockReturnValue(pending.promise);
  const { retry } = failToLoad();
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);

  // A refetch the collection gives up on rejects rather than resolving.
  await act(async () => pending.reject(new Error("Still offline")));
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("We couldn’t load your giving history.");

  history.refetch.mockResolvedValue([{ isError: true }]);
  fireEvent.click(again);
  await act(async () => {});
  const third = screen.getByRole("alert");
  expect(third).not.toBe(secondAlert);
  expect(document.activeElement).toBe(again);

  history.refetch.mockResolvedValue([{ isError: false, data: [] }]);
  fireEvent.click(again);
  expect(history.refetch).toHaveBeenCalledTimes(3);
  history.isError = false;
  await act(async () => {});
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Giving history" }),
  );
});

it("moves focus to the heading when the gifts recover on their own while Try again has focus", async () => {
  const pending = deferred<unknown>();
  history.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  await act(async () => pending.reject(new Error("Still offline")));
  expect(document.activeElement).toBe(retry);

  // Later the connection returns and the collection refetches by itself,
  // removing the button the keyboard is on.
  history.isError = false;
  view.rerender(<DonorHistoryPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Giving history" }),
  );
});

it("leaves focus alone when the gifts recover on their own while nothing has focus", async () => {
  const pending = deferred<unknown>();
  history.refetch.mockReturnValue(pending.promise);
  const { view } = failToLoad();
  // A tap on Safari does not focus the button; nothing holds focus.
  act(() => (document.activeElement as HTMLElement).blur());
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await act(async () => pending.reject(new Error("Still offline")));
  expect(document.activeElement).toBe(document.body);

  history.isError = false;
  view.rerender(<DonorHistoryPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(document.body);
  expect(
    screen
      .getByRole("heading", { level: 1, name: "Giving history" })
      .hasAttribute("tabindex"),
  ).toBe(false);
});
