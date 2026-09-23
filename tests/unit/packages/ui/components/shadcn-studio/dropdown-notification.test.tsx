/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import NotificationDropdown from "../../../../../../packages/ui/components/shadcn-studio/blocks/dropdown-notification";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("NotificationDropdown", () => {
  it("exposes both tabs outside the menu group label and restores trigger focus", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    render(
      <NotificationDropdown
        trigger={<button type="button">Open notifications</button>}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open notifications" });
    trigger.focus();
    fireEvent.click(trigger);

    const menu = await screen.findByRole("menu");
    const inbox = within(menu).getByRole("tab", { name: "Inbox" });
    const general = within(menu).getByRole("tab", { name: "General" });
    expect(inbox.getAttribute("aria-selected")).toBe("true");
    inbox.focus();
    fireEvent.keyDown(inbox, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(general));
    fireEvent.click(general);
    expect(general.getAttribute("aria-selected")).toBe("true");
    const panel = await within(menu).findByRole("tabpanel", {
      name: "General",
    });
    expect(
      within(panel).getByRole("menuitem", { name: /Fred Campbell/ }),
    ).toBeTruthy();

    fireEvent.keyDown(general, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
