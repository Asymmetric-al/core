// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor settings page at its app boundary.
import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";
import { renderWithDrafts as render } from "../../fixtures/retained-drafts";

const fixture = vi.hoisted(() => ({
  isLoading: false,
  // Offline, a load waits for the connection without fetching.
  isPaused: false,
  error: null as Error | null,
  // Whether the settings stay cached while the error is set.
  cached: false,
  avatarUrl: null as string | null,
  refetch: vi.fn(),
  mutateAsync: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => {
    const data =
      fixture.isLoading ||
      fixture.isPaused ||
      (fixture.error && !fixture.cached)
        ? undefined
        : {
            profile: {
              displayName: "Fixture Donor",
              email: "fixture@example.test",
              phone: null,
              avatarUrl: fixture.avatarUrl,
            },
            donor: { doNotEmail: false, givingPreferences: {} },
          };
    return {
      isLoading: fixture.isLoading,
      // Like TanStack Query: pending while nothing has loaded or failed.
      isPending: data === undefined && !fixture.error,
      isPaused: fixture.isPaused,
      error: fixture.error,
      refetch: fixture.refetch,
      data,
    };
  },
  useUpdateDonorPortal: () => ({
    isPending: false,
    mutateAsync: fixture.mutateAsync,
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: {}, storage: {} }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));
vi.mock("@asym/lib/hooks/use-mobile", () => ({
  useMediaQuery: () => false,
  useIsDesktop: () => false,
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  fixture.isLoading = false;
  fixture.isPaused = false;
  fixture.error = null;
  fixture.cached = false;
  fixture.avatarUrl = null;
});

const textbox = (name: string) =>
  screen.getByRole<HTMLInputElement>("textbox", { name });
const emailPanel = () =>
  screen.getByRole("tabpanel", { name: "Email & privacy" });

function describedText(input: HTMLElement) {
  return (input.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

it("caps the profile fields at the lengths the settings API accepts", () => {
  render(<DonorSettingsPage />);
  // donorPortalPatchSchema: names up to 120 characters, phone up to 80.
  expect(textbox("First name").maxLength).toBe(120);
  expect(textbox("Last name").maxLength).toBe(120);
  expect(textbox("Phone").maxLength).toBe(80);
});

it("ties a missing-name error to its field and moves focus there", () => {
  render(<DonorSettingsPage />);
  const firstName = textbox("First name");
  const lastName = textbox("Last name");
  expect(firstName.required).toBe(true);
  expect(lastName.required).toBe(true);
  expect(firstName.getAttribute("aria-invalid")).toBeNull();

  fireEvent.change(firstName, { target: { value: "  " } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

  expect(fixture.mutateAsync).not.toHaveBeenCalled();
  expect(firstName.getAttribute("aria-invalid")).toBe("true");
  expect(describedText(firstName)).toBe("First name is required.");
  expect(screen.getAllByText("First name is required.")).toHaveLength(1);
  expect(document.activeElement).toBe(firstName);
  expect(lastName.getAttribute("aria-invalid")).toBeNull();

  // Fixing the field clears its error.
  fireEvent.change(firstName, { target: { value: "Ava" } });
  expect(firstName.getAttribute("aria-invalid")).toBeNull();
  expect(screen.queryByText("First name is required.")).toBeNull();

  fireEvent.change(lastName, { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(lastName.getAttribute("aria-invalid")).toBe("true");
  expect(describedText(lastName)).toBe("Last name is required.");
  expect(document.activeElement).toBe(lastName);
  expect(fixture.mutateAsync).not.toHaveBeenCalled();
});

it("shows a read-only profile as read-only instead of discarding edits", async () => {
  fixture.avatarUrl = "https://example.test/ava.jpg";
  fixture.mutateAsync.mockRejectedValueOnce(
    Object.assign(new Error("Forbidden"), { status: 403 }),
  );
  render(<DonorSettingsPage />);
  expect(textbox("First name").readOnly).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(screen.getByText(/Your profile is read-only/)).toBeTruthy(),
  );

  for (const name of ["First name", "Last name", "Phone"])
    expect(textbox(name).readOnly).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Change photo" })
      .disabled,
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Remove" }).disabled,
  ).toBe(true);
});

it("keeps focus on the photo controls after removing the photo", () => {
  fixture.avatarUrl = "https://example.test/ava.jpg";
  render(<DonorSettingsPage />);
  const remove = screen.getByRole("button", { name: "Remove" });
  act(() => remove.focus());
  fireEvent.click(remove);
  expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Upload photo" }),
  );
});

it("exposes the loading profile as a named status", () => {
  fixture.isLoading = true;
  render(<DonorSettingsPage />);
  expect(screen.getByRole("status", { name: "Loading profile" })).toBeTruthy();
});

it("shows each settings tab loading, not a blank form or a failure, while a first load waits offline", () => {
  // Nothing has loaded or failed, and nothing is fetching.
  fixture.isPaused = true;
  render(<DonorSettingsPage />);
  expect(screen.getByRole("status", { name: "Loading profile" })).toBeTruthy();
  expect(screen.queryByRole("textbox", { name: "First name" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();

  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  expect(
    within(emailPanel()).getByRole("status", {
      name: "Loading email settings",
    }),
  ).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function failToLoad({ cached = false } = {}) {
  fixture.error = new Error("Offline fixture");
  fixture.cached = cached;
  const view = render(<DonorSettingsPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

const profilePanel = () => screen.getByRole("tabpanel", { name: "Profile" });

it("keeps focus on Try again while it retries, then in the tab once the settings load", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  expect(fixture.refetch).toHaveBeenCalledTimes(1);

  // With nothing cached, TanStack Query clears the error and loads again; the
  // button stays put instead of giving way to the skeleton.
  fixture.error = null;
  fixture.isLoading = true;
  view.rerender(<DonorSettingsPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);

  fixture.isLoading = false;
  await act(async () => pending.resolve({ isError: false }));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(textbox("First name")).toBeTruthy();
  expect(document.activeElement).toBe(profilePanel());
});

it("shows Try again as busy while it retries over cached settings, and refetches once", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad({ cached: true });
  fireEvent.click(retry);

  // With settings cached, the error stays set and nothing loads while the
  // retry runs.
  view.rerender(<DonorSettingsPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);
  fireEvent.click(busy);
  expect(fixture.refetch).toHaveBeenCalledTimes(1);

  fixture.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(textbox("First name")).toBeTruthy();
  expect(document.activeElement).toBe(profilePanel());
});

it("shows the retry as busy in the other tab too, so switching tabs does not refetch twice", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad({ cached: true });
  fireEvent.click(retry);
  view.rerender(<DonorSettingsPage />);

  // Both tabs show the same settings, so they share one retry.
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const emailRetry = within(emailPanel()).getByRole("button", {
    name: "Trying again…",
  });
  expect(emailRetry.getAttribute("aria-disabled")).toBe("true");
  act(() => emailRetry.focus());
  fireEvent.click(emailRetry);
  expect(fixture.refetch).toHaveBeenCalledTimes(1);

  fixture.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(
    within(emailPanel()).queryByRole("button", { name: /Try/ }),
  ).toBeNull();
  expect(document.activeElement).toBe(emailPanel());
});

it("keeps focus in the email tab while its Try again runs, then in the tab once the settings load", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view } = failToLoad({ cached: true });
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const retry = within(emailPanel()).getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(fixture.refetch).toHaveBeenCalledTimes(1);

  view.rerender(<DonorSettingsPage />);
  const busy = within(emailPanel()).getByRole("button", {
    name: "Trying again…",
  });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);

  fixture.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(
    within(emailPanel()).getByRole("switch", { name: "News and appeals" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(emailPanel());
});

it("returns to Try again and says so again when the retry fails", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { retry } = failToLoad({ cached: true });
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);

  fixture.error = new Error("Still offline");
  await act(async () =>
    pending.resolve({ isError: true, error: fixture.error }),
  );
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("We couldn’t load your settings.");

  fixture.refetch.mockResolvedValue({ isError: false });
  fireEvent.click(again);
  expect(fixture.refetch).toHaveBeenCalledTimes(2);
  fixture.error = null;
  await act(async () => {});
  expect(document.activeElement).toBe(profilePanel());
});

it("moves focus into the tab once a tapped Try again loads the settings", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  failToLoad({ cached: true });
  // A tap on Safari does not focus the button; nothing holds focus.
  act(() => (document.activeElement as HTMLElement).blur());
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  fixture.error = null;
  await act(async () => pending.resolve({ isError: false }));
  expect(textbox("First name")).toBeTruthy();
  expect(document.activeElement).toBe(profilePanel());
});

it("leaves focus alone when the settings recover on their own after a retry that failed again", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view } = failToLoad({ cached: true });
  // A tap on Safari does not focus the button; nothing holds focus.
  act(() => (document.activeElement as HTMLElement).blur());
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  fixture.error = new Error("Still offline");
  await act(async () =>
    pending.resolve({ isError: true, error: fixture.error }),
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

  // Later the connection returns and the query refetches by itself.
  fixture.error = null;
  view.rerender(<DonorSettingsPage />);
  expect(textbox("First name")).toBeTruthy();
  expect(document.activeElement).toBe(document.body);
  expect(
    screen
      .getByRole("heading", { level: 1, name: "Settings" })
      .hasAttribute("tabindex"),
  ).toBe(false);
});

it("keeps focus in the tab when the settings recover on their own while Try again has focus", async () => {
  const pending = deferred<unknown>();
  fixture.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad({ cached: true });
  fireEvent.click(retry);
  fixture.error = new Error("Still offline");
  await act(async () =>
    pending.resolve({ isError: true, error: fixture.error }),
  );
  expect(document.activeElement).toBe(retry);

  // Later the connection returns and the query refetches by itself, removing
  // the button the keyboard is on.
  fixture.error = null;
  view.rerender(<DonorSettingsPage />);
  expect(textbox("First name")).toBeTruthy();
  expect(document.activeElement).toBe(profilePanel());
});
