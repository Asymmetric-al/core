/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import SettingsPage from "../../../../apps/missionary/app/settings/page-client";

vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe() {} } },
      })),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));

afterEach(cleanup);

it("offers only settings that really work", () => {
  render(<SettingsPage />);

  // Real: the sign-in email, a password change, ending other sessions.
  expect(screen.getByRole("heading", { name: "Account" })).toBeTruthy();
  // Shown as text: only the organization can change it.
  expect(screen.getByRole("group", { name: "Sign-in email" })).toBeTruthy();
  expect(screen.queryByRole("textbox", { name: "Sign-in email" })).toBeNull();
  expect(screen.getByRole("form", { name: "Change password" })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Sign out other devices" }),
  ).toBeTruthy();

  // Gone: the preview notice and every control that saved nothing.
  expect(screen.queryByText(/aren't saved yet|aren’t saved yet/i)).toBeNull();
  expect(screen.queryByText(/not available/i)).toBeNull();
  expect(screen.queryByRole("switch")).toBeNull();
  expect(screen.queryByText(/two-factor/i)).toBeNull();
  expect(screen.queryByText(/mailchimp|zapier|developer mode/i)).toBeNull();
  expect(screen.queryByText(/contact our support/i)).toBeNull();
});
