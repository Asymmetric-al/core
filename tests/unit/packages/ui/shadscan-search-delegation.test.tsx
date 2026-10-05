/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import SearchDialog from "../../../../packages/ui/components/shadcn-studio/blocks/dialog-search";

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

it("delegates a real native trigger click without introducing another interactive element", async () => {
  const onActivate = vi.fn();
  const view = render(
    <SearchDialog
      trigger={
        <button type="button" onClick={onActivate}>
          Open library search
        </button>
      }
    />,
  );
  const trigger = view.getByRole("button", { name: "Open library search" });
  expect(trigger.tabIndex).toBe(0);
  expect(trigger.parentElement?.getAttribute("role")).toBe("presentation");
  expect(trigger.parentElement?.hasAttribute("tabindex")).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
  fireEvent.click(trigger);
  expect(onActivate).toHaveBeenCalledOnce();
  expect(
    await view.findByRole("dialog", { name: "Command Palette" }),
  ).toBeTruthy();
});
