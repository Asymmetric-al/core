/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { NavbarClient } from "../../../../packages/ui/components/public/navbar-client";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("removes closed mobile links from keyboard navigation and owns dismissal with a dialog", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(
    <NavbarClient
      navLinks={[{ label: "Workers", href: "/workers" }]}
      ctaLabel="Give"
      ctaHref="/give"
      siteName="Give Hope"
      shortName="GH"
      variant="solid"
    />,
  );
  expect(document.getElementById("mobile-menu")).toBeNull();
  const trigger = screen.getByRole("button", { name: "Open menu" });
  fireEvent.click(trigger);
  expect(
    await screen.findByRole("dialog", { name: "Main navigation" }),
  ).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
