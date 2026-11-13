// @vitest-environment jsdom
import { signOutClientSession } from "@asym/auth/client-session";
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderWithDrafts as render } from "../../fixtures/retained-drafts";

import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

it("hides cached profile fields after successful logout even if browser cleanup fails", async () => {
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Private edit" },
  });
  await act(async () => {
    await signOutClientSession({
      signOutOnServer: async () => ({ ok: true }),
      createClient: () =>
        ({
          auth: {
            signOut: async () => {
              throw new Error("Browser cleanup failed");
            },
          },
        }) as never,
      logger: { warn: vi.fn() },
      redirect: vi.fn(),
    });
  });
  expect(screen.queryByRole("textbox", { name: "First name" })).toBeNull();
  expect(screen.queryByText("fixture@example.test")).toBeNull();
  expect(screen.queryByText(/readable draft is kept/i)).toBeNull();
  expect(screen.getByRole("status").textContent).toMatch(/unavailable/i);
});

it("retains profile fields after route eviction without retaining credentials", () => {
  const view = render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Retained name" },
  });
  for (let route = 1; route <= 5; route += 1)
    view.rerender(<p>Route {route}</p>);
  view.rerender(<DonorSettingsPage />);
  expect(screen.getByRole("textbox", { name: "First name" })).toHaveProperty(
    "value",
    "Retained name",
  );
});

it("stops unload protection when profile edits return to the saved values", () => {
  render(<DonorSettingsPage />);
  const firstName = screen.getByRole("textbox", { name: "First name" });
  const originalName = (firstName as HTMLInputElement).value;
  fireEvent.change(firstName, { target: { value: "Unsaved name" } });
  const dirtyUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(dirtyUnload);
  expect(dirtyUnload.defaultPrevented).toBe(true);

  fireEvent.change(firstName, { target: { value: originalName } });
  const cleanUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(cleanUnload);
  expect(cleanUnload.defaultPrevented).toBe(false);
});

it("keeps profile edits made while an earlier revision saves", async () => {
  let finish!: () => void;
  fixture.mutateAsync.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Saving name" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Newer name" },
  });
  await act(async () => finish());
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(true);
  expect(screen.getByRole("textbox", { name: "First name" })).toHaveProperty(
    "value",
    "Newer name",
  );
});

const fixture = vi.hoisted(() => ({
  snapshotError: null as Error | null,
  pending: false,
  desktop: false,
  mutateAsync: vi.fn(),
  givingPreferences: {
    causes: ["water"],
    defaultAnonymousToRecipient: false,
  } as Record<string, unknown>,
}));

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: fixture.snapshotError,
    data: {
      profile: {
        displayName: "Fixture Donor",
        email: "fixture@example.test",
        phone: null,
        avatarUrl: null,
      },
      donor: {
        doNotEmail: false,
        givingPreferences: fixture.givingPreferences,
        address: {
          street: "12 Elm St",
          street2: "",
          city: "Portland",
          state: "OR",
          zip: "97201",
          country: "",
        },
      },
    },
  }),
  useUpdateDonorPortal: () => ({
    isPending: fixture.pending,
    mutateAsync: fixture.mutateAsync,
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));
vi.mock("@asym/lib/hooks/use-mobile", () => ({
  useMediaQuery: () => false,
  useIsDesktop: () => fixture.desktop,
}));
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: () => null,
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  fixture.snapshotError = null;
  fixture.pending = false;
  fixture.desktop = false;
  fixture.givingPreferences = {
    causes: ["water"],
    defaultAnonymousToRecipient: false,
  };
});

it("announces profile saving and completion while keeping the save action disabled pending", async () => {
  let complete!: () => void;
  fixture.mutateAsync.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  const view = render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  fixture.pending = true;
  view.rerender(<DonorSettingsPage />);
  expect(screen.getByRole("status").textContent).toBe("Saving…");
  const save = screen.getByRole("button", { name: "Saving…" });
  expect(save.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(save);
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(1);
  await act(async () => {
    complete();
  });
  fixture.pending = false;
  view.rerender(<DonorSettingsPage />);
  expect(screen.getByRole("status").textContent).toBe("Saved.");
});

it.each([false, true])(
  "gives profile, email & privacy and security sections keyboard-operated tabs and named panels (desktop=%s)",
  async (desktop) => {
    fixture.desktop = desktop;
    render(<DonorSettingsPage />);
    const profile = screen.getByRole("tab", { name: "Profile" });
    expect(profile.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "Profile" })).toBeTruthy();
    profile.focus();
    fireEvent.keyDown(profile, { key: desktop ? "ArrowDown" : "ArrowRight" });
    const email = screen.getByRole("tab", { name: "Email & privacy" });
    await waitFor(() => expect(document.activeElement).toBe(email));
    // jsdom has no native Enter-to-click default; activate the focused tab.
    fireEvent.click(email);
    await waitFor(() =>
      expect(
        screen.getByRole("tabpanel", { name: "Email & privacy" }),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));
    const security = await screen.findByRole("tabpanel", { name: "Security" });
    // Real security controls only: no two-factor or session placeholders.
    expect(
      within(security).getByRole("form", { name: "Change password" }),
    ).toBeTruthy();
    expect(
      within(security).getByRole("button", { name: "Sign out other devices" }),
    ).toBeTruthy();
    expect(within(security).queryByText(/not available/i)).toBeNull();
    expect(within(security).queryByText(/two-factor/i)).toBeNull();
    expect(within(security).queryByText(/contact support/i)).toBeNull();
  },
);

// With no choice saved, missionaries see "Anonymous partner" (the server
// fails closed), so the switch starts off and turning it on names the donor.
it("starts the name switch off until the donor chooses to be named", async () => {
  fixture.mutateAsync.mockResolvedValue(undefined);
  fixture.givingPreferences = { causes: ["water"] };
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const panel = await screen.findByRole("tabpanel", {
    name: "Email & privacy",
  });
  const showName = within(panel).getByRole("switch", {
    name: "Show my name to the missionaries I support",
  });
  expect(showName.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(showName);
  await waitFor(() =>
    expect(fixture.mutateAsync).toHaveBeenCalledWith({
      givingPreferences: {
        causes: ["water"],
        defaultAnonymousToRecipient: false,
      },
    }),
  );
});

it("saves a switch's changes in click order, so a slow save can't win", async () => {
  let finishFirst = () => {};
  fixture.mutateAsync
    .mockImplementationOnce(
      () => new Promise<void>((resolve) => (finishFirst = resolve)),
    )
    .mockResolvedValue(undefined);
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const panel = await screen.findByRole("tabpanel", {
    name: "Email & privacy",
  });
  const news = within(panel).getByRole("switch", { name: "News and appeals" });

  fireEvent.click(news);
  fireEvent.click(news);
  await waitFor(() => expect(fixture.mutateAsync).toHaveBeenCalledTimes(1));
  // The second save waits for the first instead of racing it.
  expect(fixture.mutateAsync).toHaveBeenLastCalledWith({ doNotEmail: true });
  expect(news.getAttribute("aria-checked")).toBe("true");

  finishFirst();
  await waitFor(() => expect(fixture.mutateAsync).toHaveBeenCalledTimes(2));
  expect(fixture.mutateAsync).toHaveBeenLastCalledWith({ doNotEmail: false });
});

it("ignores an older switch failure while the latest choice is saving", async () => {
  const reject: Array<(error: Error) => void> = [];
  fixture.mutateAsync.mockImplementation(
    () => new Promise<void>((_resolve, fail) => reject.push(fail)),
  );
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const panel = await screen.findByRole("tabpanel", {
    name: "Email & privacy",
  });
  const news = within(panel).getByRole("switch", { name: "News and appeals" });
  fireEvent.click(news);
  fireEvent.click(news);
  await waitFor(() => expect(fixture.mutateAsync).toHaveBeenCalledTimes(1));
  await act(async () => reject[0](new Error("Older save failed")));
  await waitFor(() => expect(fixture.mutateAsync).toHaveBeenCalledTimes(2));
  expect(within(panel).queryByRole("alert")).toBeNull();
  expect(news.getAttribute("aria-checked")).toBe("true");
  await act(async () => reject[1](new Error("Latest save failed")));
  expect(within(panel).getByRole("alert").textContent).toContain(
    "Couldn’t save that change",
  );
});

it("preserves privacy save order when the donor leaves and reopens the tab", async () => {
  const finish: Array<() => void> = [];
  fixture.mutateAsync.mockImplementation(
    () => new Promise<void>((resolve) => finish.push(resolve)),
  );
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const nameSwitch = () =>
    screen.getByRole("switch", {
      name: "Show my name to the missionaries I support",
    });

  fireEvent.click(nameSwitch());
  fireEvent.click(nameSwitch());
  await waitFor(() => expect(fixture.mutateAsync).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("tab", { name: "Profile" }));
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  fireEvent.click(nameSwitch());
  await act(async () => {});

  // The last choice must join the existing queue, even after a tab round trip.
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(1);
  await act(async () => finish[0]());
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(2);
  expect(fixture.mutateAsync).toHaveBeenLastCalledWith({
    givingPreferences: {
      causes: ["water"],
      defaultAnonymousToRecipient: false,
    },
  });
  await act(async () => finish[1]());
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(3);
  expect(fixture.mutateAsync).toHaveBeenLastCalledWith({
    givingPreferences: {
      causes: ["water"],
      defaultAnonymousToRecipient: true,
    },
  });
  await act(async () => finish[2]());
});

it("saves email and privacy choices as soon as they change", async () => {
  fixture.mutateAsync.mockResolvedValue(undefined);
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const panel = await screen.findByRole("tabpanel", {
    name: "Email & privacy",
  });

  fireEvent.click(
    within(panel).getByRole("switch", { name: "News and appeals" }),
  );
  await waitFor(() =>
    expect(fixture.mutateAsync).toHaveBeenCalledWith({ doNotEmail: true }),
  );

  fireEvent.click(
    within(panel).getByRole("switch", {
      name: "Show my name to the missionaries I support",
    }),
  );
  await waitFor(() =>
    expect(fixture.mutateAsync).toHaveBeenCalledWith({
      givingPreferences: {
        causes: ["water"],
        defaultAnonymousToRecipient: true,
      },
    }),
  );
  // Nothing on this tab pretends to control emails no one sends.
  expect(
    within(panel).queryByText(/sms|video stories|monthly statements/i),
  ).toBeNull();
});

it("shows the sign-in email as text the organization manages", () => {
  render(<DonorSettingsPage />);
  const email = screen.getByRole("group", { name: "Sign-in email" });
  expect(email.textContent).toContain("fixture@example.test");
  expect(screen.queryByRole("textbox", { name: "Sign-in email" })).toBeNull();
});

it("keeps unsaved profile edits when the donor checks another tab", async () => {
  fixture.desktop = true;
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "Ava" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  fireEvent.click(screen.getByRole("tab", { name: "Profile" }));
  await waitFor(() =>
    expect(
      (screen.getByLabelText("First name") as HTMLInputElement).value,
    ).toBe("Ava"),
  );
});

it("purges private retained fields after a snapshot read denial", async () => {
  const view = render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Private name" },
  });
  fixture.snapshotError = Object.assign(new Error("Forbidden"), {
    status: 403,
  });
  view.rerender(<DonorSettingsPage />);
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toMatch(/unavailable/i),
  );
  fixture.snapshotError = null;
  view.rerender(<p>Away</p>);
  view.rerender(<DonorSettingsPage />);
  expect(screen.queryByDisplayValue("Private name")).toBeNull();
  expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
});

it("keeps readable edits but blocks resubmission after a mutation denial", async () => {
  fixture.mutateAsync.mockRejectedValueOnce(
    Object.assign(new Error("Forbidden"), { status: 403 }),
  );
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "First name" }), {
    target: { value: "Readable name" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(screen.getByText(/Your profile is read-only/)).toBeTruthy(),
  );
  expect(screen.getByDisplayValue("Readable name")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(1);
});
