// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

const fixture = vi.hoisted(() => ({
  pending: false,
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
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: () => null,
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  fixture.pending = false;
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
