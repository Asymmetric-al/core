// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

const fixture = vi.hoisted(() => ({
  pending: false,
  desktop: false,
  mutateAsync: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: {
      profile: {
        displayName: "Fixture Donor",
        email: "fixture@example.test",
        phone: null,
        avatarUrl: null,
      },
      donor: {
        doNotEmail: false,
        givingPreferences: {
          causes: ["water"],
          defaultAnonymousToRecipient: false,
        },
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
  fixture.pending = false;
  fixture.desktop = false;
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

it("saves the mailing address with the profile", async () => {
  fixture.mutateAsync.mockResolvedValue(undefined);
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "Apartment, suite" }), {
    target: { value: "Apt 4" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(fixture.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        address: {
          street: "12 Elm St",
          street2: "Apt 4",
          city: "Portland",
          state: "OR",
          zip: "97201",
        },
      }),
    ),
  );
});

it("asks for a street and city before saving a partial address", async () => {
  render(<DonorSettingsPage />);
  fireEvent.change(screen.getByRole("textbox", { name: "Street address" }), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(
    await screen.findByText(
      "Add the street address, or clear the whole address.",
    ),
  ).toBeTruthy();
  expect(fixture.mutateAsync).not.toHaveBeenCalled();
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
