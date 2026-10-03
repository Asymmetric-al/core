/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  Toaster: ({ theme }: { theme: string }) => (
    <ol aria-label="Notifications" data-theme={theme} />
  ),
}));

import { Toaster } from "../../../../packages/ui/components/shadcn/sonner";
import { ThemeProvider } from "../../../../packages/ui/lib/theme-provider";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("preserves the forced theme while escaping the isolated application stacking context", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  const { container } = render(
    <ThemeProvider forcedTheme="light" defaultTheme="dark" enableSystem={false}>
      <div className="app-root">
        <Toaster />
      </div>
    </ThemeProvider>,
  );
  expect(container.querySelector('ol[aria-label="Notifications"]')).toBeNull();
  expect(
    screen
      .getByRole("list", { name: "Notifications" })
      .getAttribute("data-theme"),
  ).toBe("light");
});

it("does not access or emit a DOM portal during server rendering", () => {
  expect(renderToString(<Toaster />)).toBe("");
});
