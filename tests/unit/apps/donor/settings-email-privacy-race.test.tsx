// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { act, type ComponentType } from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

import { renderWithDrafts as render } from "../../fixtures/retained-drafts";

type DonorState = {
  doNotEmail: boolean;
  givingPreferences: {
    defaultAnonymousToRecipient: boolean;
  };
};

type PendingCall = {
  patch: Partial<DonorState>;
  resolve: () => void;
};

const store = vi.hoisted(() => {
  const state = {
    donor: {
      doNotEmail: false,
      givingPreferences: { defaultAnonymousToRecipient: false },
    } satisfies DonorState,
    calls: [] as PendingCall[],
  };
  return {
    state,
    reset() {
      state.donor = {
        doNotEmail: false,
        givingPreferences: { defaultAnonymousToRecipient: false },
      };
      state.calls = [];
    },
  };
});

function snapshot() {
  return {
    profile: {
      displayName: "Fixture Donor",
      email: "fixture@example.test",
      phone: null,
      avatarUrl: null,
    },
    donor: {
      ...store.state.donor,
      address: {},
    },
  };
}

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: snapshot(),
  }),
  useUpdateDonorPortal: () => ({
    isPending: false,
    mutateAsync: (patch: Partial<DonorState>) =>
      new Promise<void>((resolve) => {
        store.state.calls.push({
          patch,
          resolve: () => {
            store.state.donor = { ...store.state.donor, ...patch };
            resolve();
          },
        });
      }),
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: {} }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));
vi.mock("@asym/lib/hooks/use-mobile", () => ({
  useMediaQuery: () => false,
  useIsDesktop: () => false,
}));
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: () => null,
}));

let DonorSettingsPage: ComponentType;
beforeAll(async () => {
  const module =
    await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client");
  DonorSettingsPage = module.default;
}, 20000);

afterEach(() => {
  cleanup();
  store.reset();
});

it("serializes repeated email preference flips so the last click wins", async () => {
  const view = render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const news = await screen.findByRole("switch", {
    name: "News and appeals",
  });

  fireEvent.click(news);
  fireEvent.click(news);

  expect(news.getAttribute("aria-checked")).toBe("true");
  await waitFor(() => expect(store.state.calls).toHaveLength(1));
  await act(async () => {
    store.state.calls[0]!.resolve();
  });
  await waitFor(() => expect(store.state.calls).toHaveLength(2));
  view.rerender(<DonorSettingsPage />);
  await act(async () => {
    store.state.calls[1]!.resolve();
  });
  view.rerender(<DonorSettingsPage />);

  await waitFor(() => expect(news.getAttribute("aria-checked")).toBe("true"));
  expect(store.state.donor.doNotEmail).toBe(false);
});

// Each save answers with the whole donor snapshot, so two preference saves in
// flight at once could land out of order and restore the other's old value.
it("saves different preferences one at a time, in click order", async () => {
  render(<DonorSettingsPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Email & privacy" }));
  const news = await screen.findByRole("switch", {
    name: "News and appeals",
  });
  const showName = screen.getByRole("switch", {
    name: "Show my name to the missionaries I support",
  });

  fireEvent.click(news);
  fireEvent.click(showName);

  await waitFor(() => expect(store.state.calls).toHaveLength(1));
  expect(store.state.calls[0]!.patch).toEqual({ doNotEmail: true });
  // The name save waits for the email save instead of racing it.
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(store.state.calls).toHaveLength(1);

  await act(async () => {
    store.state.calls[0]!.resolve();
  });
  await waitFor(() => expect(store.state.calls).toHaveLength(2));
  expect(store.state.calls[1]!.patch).toMatchObject({
    givingPreferences: { defaultAnonymousToRecipient: true },
  });
  await act(async () => {
    store.state.calls[1]!.resolve();
  });
  expect(store.state.donor).toMatchObject({
    doNotEmail: true,
    givingPreferences: { defaultAnonymousToRecipient: true },
  });
});
