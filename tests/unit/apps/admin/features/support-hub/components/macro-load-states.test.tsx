// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App public boundary regression.
import { RunMacroPopover } from "../../../../../../../apps/admin/features/support-hub/components/macros/RunMacroPopover";
const source = vi.hoisted(() => ({
  data: [],
  isLoading: false,
  isReady: true,
  isError: false,
  refetch: vi.fn(),
}));
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-macros",
  () => ({ useSupportMacros: () => source }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({ useRunSupportMacro: () => ({ mutateAsync: vi.fn() }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => null }),
);
afterEach(cleanup);
beforeEach(() =>
  Object.assign(source, { isLoading: false, isReady: true, isError: false }),
);
it("links successful empty macros to setup", () => {
  render(<RunMacroPopover conversation={{ id: "conversation" } as never} />);
  expect(
    screen.getByRole("link", { name: "Set up macros" }).getAttribute("href"),
  ).toBe("/support/settings/macros");
});
it("retries errors instead of claiming no macros exist", () => {
  source.isError = true;
  render(<RunMacroPopover conversation={{ id: "conversation" } as never} />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(source.refetch).toHaveBeenCalled();
  expect(screen.queryByRole("link", { name: "Set up macros" })).toBeNull();
});
it("announces loading without empty setup guidance", () => {
  source.isLoading = true;
  source.isReady = false;
  render(<RunMacroPopover conversation={{ id: "conversation" } as never} />);
  expect(screen.getByRole("status").textContent).toContain("Loading macros");
  expect(screen.queryByRole("link", { name: "Set up macros" })).toBeNull();
});
