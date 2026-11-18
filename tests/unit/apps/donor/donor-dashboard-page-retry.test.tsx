// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  isError: true,
  isPending: false,
  message: "Bootstrap unavailable",
}));

vi.mock(
  "../../../../apps/donor/app/(dashboard)/donor-dashboard/use-donor-dashboard-bootstrap",
  () => ({
    useDonorDashboardBootstrap: () => ({
      isError: mocks.isError,
      error: mocks.isError ? new Error(mocks.message) : null,
      isPending: mocks.isPending,
      refetch: mocks.refetch,
    }),
  }),
);
vi.mock(
  "../../../../apps/donor/features/donor/components/donor-dashboard-main-body",
  () => ({
    DonorDashboardMainBody: () => {
      if (mocks.isError)
        throw new Error(
          "The dashboard body must not render on the bootstrap error path.",
        );
      return <h1>Welcome back</h1>;
    },
  }),
);
vi.mock(
  "../../../../apps/donor/features/donor/components/dashboard-ui",
  () => ({ DashboardSkeleton: () => null }),
);

// eslint-disable-next-line no-restricted-imports -- AL-1931 Component integration tests exercise the actual donor page, not an application dependency.
import DonorDashboardPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/page-client";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

beforeEach(() => {
  // The loaded dashboard renders inside the Boneyard skeleton, which measures
  // its container and follows the colour scheme.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  mocks.refetch.mockResolvedValue({ isError: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  mocks.isError = true;
  mocks.isPending = false;
  mocks.message = "Bootstrap unavailable";
  mocks.refetch.mockReset();
});

function failToLoad() {
  const view = render(<DonorDashboardPage />);
  const retry = view.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

it("announces the visible bootstrap error and retries through the existing refetch callback", () => {
  const view = render(<DonorDashboardPage />);

  const alert = view.getByRole("alert");
  expect(alert.textContent).toContain("Load failed");
  expect(alert.textContent).toContain("Bootstrap unavailable");
  const button = view.getByRole("button", { name: "Try again" });
  expect(button.getAttribute("type")).toBe("button");
  fireEvent.click(button);

  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(mocks.refetch).toHaveBeenCalledWith();
});

it("keeps focus on Try again while it retries, then moves it to the dashboard heading once it loads", async () => {
  const pending = deferred<unknown>();
  mocks.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  expect(mocks.refetch).toHaveBeenCalledTimes(1);

  // With nothing cached, TanStack Query clears the error and goes back to
  // pending; the error view stays put instead of giving way to the skeleton,
  // and keeps saying what went wrong.
  mocks.isError = false;
  mocks.isPending = true;
  view.rerender(<DonorDashboardPage />);
  const busy = view.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);
  expect(view.getByRole("alert").textContent).toContain(
    "Bootstrap unavailable",
  );

  mocks.isPending = false;
  await act(async () => pending.resolve({ isError: false }));
  expect(view.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    view.getByRole("heading", { level: 1, name: "Welcome back" }),
  );
});

it("shows Try again as busy while it retries over a cached dashboard, and refetches once", async () => {
  const pending = deferred<unknown>();
  mocks.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);

  // With a result cached, the error stays set while the retry runs.
  view.rerender(<DonorDashboardPage />);
  const busy = view.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);
  fireEvent.click(busy);
  expect(mocks.refetch).toHaveBeenCalledTimes(1);

  mocks.isError = false;
  await act(async () => pending.resolve({ isError: false }));
  expect(view.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    view.getByRole("heading", { level: 1, name: "Welcome back" }),
  );
});

it("returns to Try again and says so again when the retry fails", async () => {
  const pending = deferred<unknown>();
  mocks.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  const firstAlert = view.getByRole("alert");
  fireEvent.click(retry);

  mocks.isError = false;
  mocks.isPending = true;
  view.rerender(<DonorDashboardPage />);

  mocks.isError = true;
  mocks.isPending = false;
  mocks.message = "Still unavailable";
  await act(async () => pending.resolve({ isError: true }));
  const again = view.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = view.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toContain("Still unavailable");

  mocks.refetch.mockResolvedValue({ isError: false });
  fireEvent.click(again);
  expect(mocks.refetch).toHaveBeenCalledTimes(2);
  mocks.isError = false;
  await act(async () => {});
  expect(document.activeElement).toBe(
    view.getByRole("heading", { level: 1, name: "Welcome back" }),
  );
});

it("moves focus to the dashboard heading once a tapped Try again loads it", async () => {
  const pending = deferred<unknown>();
  mocks.refetch.mockReturnValue(pending.promise);
  const view = render(<DonorDashboardPage />);
  // A tap on Safari does not focus the button; nothing holds focus.
  fireEvent.click(view.getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  // The heading arrives with the dashboard, after the error view has gone.
  mocks.isError = false;
  mocks.isPending = true;
  view.rerender(<DonorDashboardPage />);
  mocks.isPending = false;
  await act(async () => pending.resolve({ isError: false }));
  expect(view.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(
    view.getByRole("heading", { level: 1, name: "Welcome back" }),
  );
});

it("leaves focus alone when the dashboard recovers on its own after a retry that failed again", async () => {
  const pending = deferred<unknown>();
  mocks.refetch.mockReturnValue(pending.promise);
  const view = render(<DonorDashboardPage />);
  // A tap on Safari does not focus the button; nothing holds focus.
  fireEvent.click(view.getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  await act(async () => pending.resolve({ isError: true }));
  expect(view.getByRole("button", { name: "Try again" })).toBeTruthy();

  // Later the query refetches by itself and works.
  mocks.isError = false;
  view.rerender(<DonorDashboardPage />);
  const heading = view.getByRole("heading", { level: 1, name: "Welcome back" });
  expect(document.activeElement).toBe(document.body);
  expect(heading.hasAttribute("tabindex")).toBe(false);
});

it.each([
  ["with a result cached", false],
  ["through a fresh load", true],
])(
  "moves focus to the dashboard heading when it recovers on its own %s while Try again has focus",
  async (_case, freshLoad) => {
    const pending = deferred<unknown>();
    mocks.refetch.mockReturnValue(pending.promise);
    const { view, retry } = failToLoad();
    fireEvent.click(retry);
    await act(async () => pending.resolve({ isError: true }));
    expect(document.activeElement).toBe(retry);

    // Later the query refetches by itself, removing the button the keyboard
    // is on. With nothing cached it loads afresh first, with no heading yet.
    mocks.isError = false;
    if (freshLoad) {
      mocks.isPending = true;
      view.rerender(<DonorDashboardPage />);
      expect(view.queryByRole("button", { name: /Try/ })).toBeNull();
      mocks.isPending = false;
    }
    view.rerender(<DonorDashboardPage />);
    expect(view.queryByRole("button", { name: /Try/ })).toBeNull();
    expect(document.activeElement).toBe(
      view.getByRole("heading", { level: 1, name: "Welcome back" }),
    );
  },
);
