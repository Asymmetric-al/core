// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { type ReactNode, useRef } from "react";
import { afterEach, expect, it, vi } from "vitest";

import {
  pageHeading,
  useLoadRetry,
} from "../../../../packages/ui/hooks/load-retry";

// Like a query store: the page reads the load's state when it renders, and a
// test changes it before the page next renders.
const load = { error: null as string | null, loading: false };

type Landing = (from: HTMLElement | null) => HTMLElement | null | undefined;

function Page({
  onRetry,
  landing = pageHeading,
  withRetryRef = false,
  loaded = <p>Partners loaded</p>,
}: {
  onRetry?: () => unknown;
  landing?: Landing;
  withRetryRef?: boolean;
  loaded?: ReactNode;
}) {
  const retryButton = useRef<HTMLButtonElement>(null);
  const retry = useLoadRetry({
    error: load.error,
    loading: load.loading,
    onRetry,
    landing,
    retryRef: withRetryRef ? retryButton : undefined,
  });
  return (
    <main>
      <h1>Partners</h1>
      <button type="button">Elsewhere</button>
      <div role="tabpanel" aria-label="Partner list" tabIndex={-1}>
        {retry.error != null ? (
          <div ref={retry.failureView}>
            <p key={retry.failedRetries} role="alert">
              {retry.error}
            </p>
            <button ref={retryButton} type="button" onClick={retry.retry}>
              {retry.retrying ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : load.loading ? (
          <p role="status">Loading partners</p>
        ) : (
          loaded
        )}
      </div>
    </main>
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((settle, fail) => {
    resolve = settle;
    reject = fail;
  });
  return { promise, resolve, reject };
}

afterEach(() => {
  cleanup();
  load.error = null;
  load.loading = false;
});

const heading = () =>
  screen.getByRole("heading", { level: 1, name: "Partners" });
const elsewhere = () => screen.getByRole("button", { name: "Elsewhere" });

function failToLoad(page: ReactNode, { focus = true } = {}) {
  load.error = "Offline";
  const view = render(page);
  const button = screen.getByRole("button", { name: "Try again" });
  if (focus) act(() => button.focus());
  return { view, button, alert: screen.getByRole("alert") };
}

// 1. While a retry runs.

it("keeps the failure view and its busy Try again up while a retry runs, and ignores a second press", () => {
  const pending = deferred<unknown>();
  const onRetry = vi.fn(() => pending.promise);
  const { view, button } = failToLoad(<Page onRetry={onRetry} />);
  fireEvent.click(button);

  // With nothing cached, the reload clears the error while it runs.
  load.error = null;
  load.loading = true;
  view.rerender(<Page onRetry={onRetry} />);
  expect(screen.getByRole("button", { name: "Trying again…" })).toBe(button);
  expect(screen.getByRole("alert").textContent).toBe("Offline");
  expect(screen.queryByRole("status")).toBeNull();
  expect(document.activeElement).toBe(button);

  fireEvent.click(button);
  expect(onRetry).toHaveBeenCalledTimes(1);
});

// 2. A retry that fails again.

it("counts a retry that fails again, so its alert is new, and leaves focus on Try again", async () => {
  const pending = deferred<unknown>();
  const { button, alert } = failToLoad(
    <Page onRetry={() => pending.promise} />,
  );
  fireEvent.click(button);

  load.error = "Still offline";
  await act(async () => pending.resolve({ isError: true }));
  expect(screen.getByRole("button", { name: "Try again" })).toBe(button);
  expect(screen.getByRole("alert")).not.toBe(alert);
  expect(screen.getByRole("alert").textContent).toBe("Still offline");
  expect(document.activeElement).toBe(button);
});

it("puts lost focus back on Try again after a retry that fails again, given its ref", async () => {
  const pending = deferred<unknown>();
  // A tap on Safari does not focus the button.
  const { button } = failToLoad(
    <Page withRetryRef onRetry={() => pending.promise} />,
    { focus: false },
  );
  fireEvent.click(button);
  expect(document.activeElement).toBe(document.body);

  await act(async () => pending.resolve({ isError: true }));
  expect(button.textContent).toBe("Try again");
  expect(document.activeElement).toBe(button);
});

it("leaves lost focus alone after a retry that fails again without a ref to Try again", async () => {
  const pending = deferred<unknown>();
  const { button, alert } = failToLoad(
    <Page onRetry={() => pending.promise} />,
    { focus: false },
  );
  fireEvent.click(button);

  await act(async () => pending.resolve({ isError: true }));
  expect(button.textContent).toBe("Try again");
  expect(screen.getByRole("alert")).not.toBe(alert);
  expect(document.activeElement).toBe(document.body);
});

// 3. A retry that works.

it("moves focus from Try again to the landing once a retry works", async () => {
  const pending = deferred<unknown>();
  const { button } = failToLoad(<Page onRetry={() => pending.promise} />);
  fireEvent.click(button);

  load.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(heading());
});

it("moves lost focus to the landing, found from the pressed Try again, once a retry works", async () => {
  const pending = deferred<unknown>();
  const landing = vi.fn<Landing>(pageHeading);
  const { button } = failToLoad(
    <Page landing={landing} onRetry={() => pending.promise} />,
    { focus: false },
  );
  fireEvent.click(button);

  load.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(document.activeElement).toBe(heading());
  expect(landing).toHaveBeenCalledWith(button);
});

it("leaves focus that moved elsewhere during a retry where it is", async () => {
  const pending = deferred<unknown>();
  const { button } = failToLoad(<Page onRetry={() => pending.promise} />);
  fireEvent.click(button);
  act(() => elsewhere().focus());

  load.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(document.activeElement).toBe(elsewhere());
  expect(heading().hasAttribute("tabindex")).toBe(false);
});

// 4. A load that recovers without a press.

it("moves focus held by the failure view to the landing when the load recovers on its own", () => {
  const landing = vi.fn<Landing>(pageHeading);
  const { view } = failToLoad(<Page landing={landing} />);

  // A refetch on reconnect: Try again was never pressed.
  load.error = null;
  view.rerender(<Page landing={landing} />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());
  expect(landing).toHaveBeenCalledWith(
    screen.getByRole("tabpanel", { name: "Partner list" }),
  );
});

it("lands focus held by the failure view however the load recovers, after a retry that failed", async () => {
  const pending = deferred<unknown>();
  const { view, button } = failToLoad(<Page onRetry={() => pending.promise} />);
  fireEvent.click(button);
  await act(async () => pending.resolve({ isError: true }));
  expect(document.activeElement).toBe(button);

  // With nothing cached, the next load clears the error and loads afresh.
  load.error = null;
  load.loading = true;
  view.rerender(<Page />);
  expect(document.activeElement).toBe(heading());
});

it("leaves focus elsewhere, or nowhere, where it is when the load recovers on its own", () => {
  const { view } = failToLoad(<Page />);
  act(() => elsewhere().focus());
  load.error = null;
  view.rerender(<Page />);
  expect(document.activeElement).toBe(elsewhere());

  cleanup();
  const again = failToLoad(<Page />, { focus: false });
  load.error = null;
  again.view.rerender(<Page />);
  expect(document.activeElement).toBe(document.body);
  expect(heading().hasAttribute("tabindex")).toBe(false);
});

// 5. Nowhere to land yet.

it("tries to land again after later renders while there is nowhere to land and focus is still lost", () => {
  const landing: Landing = () =>
    document.querySelector<HTMLElement>("[data-landing]");
  const loaded = (
    <h2 data-landing tabIndex={-1}>
      Partner list
    </h2>
  );
  const { view } = failToLoad(<Page landing={landing} loaded={loaded} />);

  // The load starts over, with no heading to land on until it finishes.
  load.error = null;
  load.loading = true;
  view.rerender(<Page landing={landing} loaded={loaded} />);
  expect(document.activeElement).toBe(document.body);

  load.loading = false;
  view.rerender(<Page landing={landing} loaded={loaded} />);
  const target = screen.getByRole("heading", { level: 2 });
  expect(document.activeElement).toBe(target);

  // Landed once: later renders with focus lost leave it.
  act(() => target.blur());
  view.rerender(<Page landing={landing} loaded={loaded} />);
  expect(document.activeElement).toBe(document.body);
});

it("stops waiting to land once focus is put somewhere", () => {
  const landing = vi.fn<Landing>(() => null);
  const { view } = failToLoad(<Page landing={landing} />);
  load.error = null;
  view.rerender(<Page landing={landing} />);
  const tries = landing.mock.calls.length;
  view.rerender(<Page landing={landing} />);
  expect(landing.mock.calls.length).toBeGreaterThan(tries);

  // Once the user puts focus somewhere, it is theirs.
  const calls = landing.mock.calls.length;
  act(() => elsewhere().focus());
  view.rerender(<Page landing={landing} />);
  act(() => elsewhere().blur());
  view.rerender(<Page landing={landing} />);
  expect(landing).toHaveBeenCalledTimes(calls);
});

// A tapped retry works while its failure view is still up, and the page then
// renders without anywhere to land; returns a render that adds the landing.
async function tapRetryThatWorksBeforeALanding() {
  const pending = deferred<unknown>();
  const landing: Landing = () =>
    document.querySelector<HTMLElement>("[data-landing]");
  const page = (loaded: ReactNode) => (
    <Page landing={landing} loaded={loaded} onRetry={() => pending.promise} />
  );
  // A tap on Safari does not focus the button.
  const { view, button } = failToLoad(page(<p>Loading details</p>), {
    focus: false,
  });
  fireEvent.click(button);

  load.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(document.body);
  return () =>
    view.rerender(
      page(
        <h2 data-landing tabIndex={-1}>
          Partner list
        </h2>,
      ),
    );
}

it("moves lost focus to the landing once there is one, after a tapped retry that worked before it", async () => {
  const showLanding = await tapRetryThatWorksBeforeALanding();
  showLanding();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 2 }),
  );
});

it("leaves focus put somewhere before the landing appears, after a tapped retry that worked", async () => {
  const showLanding = await tapRetryThatWorksBeforeALanding();
  act(() => elsewhere().focus());
  showLanding();
  expect(document.activeElement).toBe(elsewhere());
});

// 6. Settling, with or without a promise.

it("ends a retry that returns nothing once its load stops, by whether the error is back", () => {
  const onRetry = vi.fn();
  const { view, button, alert } = failToLoad(<Page onRetry={onRetry} />);
  fireEvent.click(button);
  load.error = null;
  load.loading = true;
  view.rerender(<Page onRetry={onRetry} />);
  expect(button.textContent).toBe("Trying again…");

  load.loading = false;
  load.error = "Offline";
  view.rerender(<Page onRetry={onRetry} />);
  expect(button.textContent).toBe("Try again");
  expect(screen.getByRole("alert")).not.toBe(alert);
  expect(document.activeElement).toBe(button);

  fireEvent.click(button);
  load.error = null;
  load.loading = true;
  view.rerender(<Page onRetry={onRetry} />);
  load.loading = false;
  view.rerender(<Page onRetry={onRetry} />);
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(heading());
});

it("counts an error that is still there a task after the retry settles as a failure", async () => {
  const { button, alert } = failToLoad(
    <Page onRetry={() => Promise.resolve()} />,
  );
  fireEvent.click(button);
  await waitFor(() => expect(button.textContent).toBe("Try again"));
  expect(screen.getByRole("alert")).not.toBe(alert);
  expect(document.activeElement).toBe(button);
});

it("waits a task for a result that says the retry worked while the error still shows", async () => {
  // A query store renders a settled refetch a task later.
  const onRetry = () =>
    Promise.resolve({ isError: false }).finally(() =>
      setTimeout(() => (load.error = null)),
    );
  const { button } = failToLoad(<Page onRetry={onRetry} />);
  fireEvent.click(button);
  await act(async () => {});
  expect(button.textContent).toBe("Trying again…");

  await waitFor(() => expect(button.isConnected).toBe(false));
  expect(document.activeElement).toBe(heading());
});

it("reads a query collection's list of results, and a rejection, as the retry's outcome", async () => {
  const { button, alert } = failToLoad(
    <Page
      onRetry={() => Promise.resolve([{ isError: false }, { isError: true }])}
    />,
  );
  fireEvent.click(button);
  await act(async () => {});
  expect(button.textContent).toBe("Try again");
  const second = screen.getByRole("alert");
  expect(second).not.toBe(alert);

  cleanup();
  const failed = failToLoad(
    <Page onRetry={() => Promise.reject(new Error("Offline"))} />,
  );
  fireEvent.click(failed.button);
  await act(async () => {});
  expect(failed.button.textContent).toBe("Try again");
  expect(screen.getByRole("alert")).not.toBe(failed.alert);

  cleanup();
  const worked = failToLoad(
    <Page onRetry={() => Promise.resolve([{ isError: false }])} />,
  );
  fireEvent.click(worked.button);
  load.error = null;
  await act(async () => {});
  expect(document.activeElement).toBe(heading());
});

// A page that knows only whether its load failed passes that boolean.
function FailedFlagPage({
  failed,
  onRetry,
}: {
  failed: boolean;
  onRetry: () => unknown;
}) {
  const { failureView, ...retry } = useLoadRetry({
    error: failed,
    loading: false,
    onRetry,
    landing: pageHeading,
  });
  return (
    <main>
      <h1>Partners</h1>
      <div ref={failureView}>
        <p>{retry.error === null ? "Loaded" : "Could not load"}</p>
        <button type="button" onClick={retry.retry}>
          {retry.retrying ? "Trying again…" : "Try again"}
        </button>
      </div>
    </main>
  );
}

it("takes false for no failure, so a page can pass whether its load failed", () => {
  const onRetry = vi.fn();
  const view = render(<FailedFlagPage failed={false} onRetry={onRetry} />);
  screen.getByText("Loaded");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(onRetry).not.toHaveBeenCalled();
  screen.getByRole("button", { name: "Try again" });

  view.rerender(<FailedFlagPage failed onRetry={onRetry} />);
  screen.getByText("Could not load");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  screen.getByRole("button", { name: "Trying again…" });

  view.rerender(<FailedFlagPage failed={false} onRetry={onRetry} />);
  screen.getByText("Loaded");
  screen.getByRole("button", { name: "Try again" });
});

// 7. Where landing looks from.

it("lands from the element the failure view was removed from, or from the pressed Try again", async () => {
  const panel = () => screen.getByRole("tabpanel", { name: "Partner list" });
  const landing = vi.fn<Landing>(
    (from) => from?.closest<HTMLElement>('[role="tabpanel"]') ?? null,
  );
  const { view } = failToLoad(<Page landing={landing} />);
  load.error = null;
  view.rerender(<Page landing={landing} />);
  expect(landing).toHaveBeenLastCalledWith(panel());
  expect(document.activeElement).toBe(panel());

  cleanup();
  const pressed = failToLoad(
    <Page
      landing={landing}
      onRetry={() => Promise.resolve({ isError: false })}
    />,
  );
  fireEvent.click(pressed.button);
  load.error = null;
  await act(async () => {});
  expect(landing).toHaveBeenLastCalledWith(pressed.button);
  expect(document.activeElement).toBe(panel());
});

function ReplacedPage() {
  const retry = useLoadRetry({
    error: load.error,
    loading: load.loading,
    onRetry: undefined,
    landing: pageHeading,
  });
  return (
    <main>
      <h1>Partners</h1>
      {/* The recovered list replaces the failure view's container too. */}
      {retry.error != null ? (
        <section key="failed" aria-label="Failed">
          <div ref={retry.failureView}>
            <p role="alert">{retry.error}</p>
            <button type="button">Try again</button>
          </div>
        </section>
      ) : (
        <section key="loaded" aria-label="Loaded">
          <p>Partners loaded</p>
        </section>
      )}
    </main>
  );
}

it("lands from an element that has left the page with the failure view", () => {
  const { view } = failToLoad(<ReplacedPage />);
  load.error = null;
  view.rerender(<ReplacedPage />);
  expect(document.activeElement).toBe(heading());
});
