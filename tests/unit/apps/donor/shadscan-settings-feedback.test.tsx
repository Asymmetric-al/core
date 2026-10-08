// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
    },
  }),
  useUpdateDonorPortal: () => ({
    isPending: fixture.pending,
    mutateAsync: fixture.mutateAsync,
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
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  fixture.pending = true;
  view.rerender(<DonorSettingsPage />);
  expect(screen.getByRole("status").textContent).toBe("Saving profile…");
  const save = screen.getByRole("button", { name: "Saving..." });
  expect(save.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(save);
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(1);
  await act(async () => {
    complete();
  });
  fixture.pending = false;
  view.rerender(<DonorSettingsPage />);
  expect(screen.getByRole("status").textContent).toBe("Profile saved.");
});

it.each([false, true])(
  "gives profile, notification and security sections keyboard-operated tabs and named panels (desktop=%s)",
  async (desktop) => {
    fixture.desktop = desktop;
    render(<DonorSettingsPage />);
    const profile = screen.getByRole("tab", { name: "My Profile" });
    expect(profile.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "My Profile" })).toBeTruthy();
    profile.focus();
    fireEvent.keyDown(profile, { key: desktop ? "ArrowDown" : "ArrowRight" });
    const notifications = screen.getByRole("tab", { name: "Notifications" });
    await waitFor(() => expect(document.activeElement).toBe(notifications));
    // jsdom has no native Enter-to-click default; activate the focused tab.
    fireEvent.click(notifications);
    await waitFor(() => {
      expect(notifications.getAttribute("aria-selected")).toBe("true");
      expect(
        screen.getByRole("tabpanel", { name: "Notifications" }),
      ).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));
    await waitFor(() =>
      expect(screen.getByRole("tabpanel", { name: "Security" })).toBeTruthy(),
    );
    const password = screen.getByLabelText("Current Password");
    fireEvent.change(password, { target: { value: "unchanged-password" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Show Current Password" }),
    );
    expect(password.getAttribute("type")).toBe("text");
    expect((password as HTMLInputElement).value).toBe("unchanged-password");
    expect(
      screen
        .getByRole("button", { name: "Hide Current Password" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(
      screen.getByRole("button", { name: "Hide Current Password" }),
    );
    expect(password.getAttribute("type")).toBe("password");
  },
);

it("preserves edited profile values through validation, snapshot rerenders, a save failure and retry", async () => {
  fixture.mutateAsync
    .mockRejectedValueOnce(new Error("save unavailable"))
    .mockResolvedValueOnce(undefined);
  const view = render(<DonorSettingsPage />);
  const firstName = screen.getByRole("textbox", { name: "First Name" });
  const lastName = screen.getByRole("textbox", { name: "Last Name" });
  const phone = screen.getByRole("textbox", { name: "Phone Number" });
  fireEvent.change(firstName, { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  expect(screen.getByRole("alert").textContent).toBe("First name is required.");
  expect(fixture.mutateAsync).not.toHaveBeenCalled();
  fireEvent.change(firstName, { target: { value: "Pat" } });
  fireEvent.change(lastName, { target: { value: "Garcia" } });
  fireEvent.change(phone, { target: { value: "555-2020" } });
  view.rerender(<DonorSettingsPage />);
  expect((firstName as HTMLInputElement).value).toBe("Pat");
  expect((lastName as HTMLInputElement).value).toBe("Garcia");
  expect(
    screen
      .getByRole("textbox", { name: "Email Address" })
      .hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe(
      "Couldn't save your changes.",
    ),
  );
  expect(fixture.mutateAsync).toHaveBeenLastCalledWith({
    firstName: "Pat",
    lastName: "Garcia",
    displayName: "Pat Garcia",
    phone: "555-2020",
    avatarUrl: null,
  });
  expect((firstName as HTMLInputElement).value).toBe("Pat");
  expect((phone as HTMLInputElement).value).toBe("555-2020");
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Profile saved."),
  );
  expect(fixture.mutateAsync).toHaveBeenCalledTimes(2);
});
