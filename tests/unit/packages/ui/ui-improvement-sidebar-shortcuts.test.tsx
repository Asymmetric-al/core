// @vitest-environment jsdom

import { setPlatform } from "@ui-sdk/core/testing";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../../packages/ui/components/shadcn/dialog";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../../../packages/ui/components/shadcn/sidebar";

function SidebarState() {
  const { open } = useSidebar();
  return <output aria-label="Sidebar state">{open ? "open" : "closed"}</output>;
}

beforeEach(() => {
  setPlatform("other");
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  setPlatform("other");
  vi.unstubAllGlobals();
});

function renderSidebar() {
  return render(
    <SidebarProvider>
      <SidebarState />
      <SidebarTrigger />
      <input aria-label="Name" />
      <textarea aria-label="Description" />
      <select aria-label="Category">
        <option>General</option>
      </select>
      <div
        contentEditable
        suppressContentEditableWarning
        aria-label="Editor"
        tabIndex={0}
      >
        <span>Editable text</span>
      </div>
      <div role="textbox" aria-label="Custom editor" tabIndex={0} />
    </SidebarProvider>,
  );
}

const shortcut = (init: KeyboardEventInit = {}) =>
  new KeyboardEvent("keydown", {
    key: "b",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
    ...init,
  });

const sidebarState = () => screen.getByLabelText("Sidebar state").textContent;

describe("sidebar shortcut ownership", () => {
  it.each(["Name", "Description", "Category", "Editor", "Custom editor"])(
    "leaves Ctrl+B to the editable %s target",
    (name) => {
      renderSidebar();
      // A real key press goes to the focused element.
      screen.getByLabelText(name).focus();
      const target =
        name === "Editor"
          ? screen.getByText("Editable text")
          : screen.getByLabelText(name);
      const event = shortcut();
      fireEvent(target, event);
      expect(sidebarState()).toBe("open");
      expect(event.defaultPrevented).toBe(false);
    },
  );

  it.each(["defaultPrevented", "isComposing", "repeat"])(
    "ignores a shortcut that is %s",
    (state) => {
      renderSidebar();
      const event = shortcut({
        isComposing: state === "isComposing",
        repeat: state === "repeat",
      });
      if (state === "defaultPrevented") event.preventDefault();
      fireEvent(document.body, event);
      expect(sidebarState()).toBe("open");
    },
  );

  it.each([
    ["other", "ctrlKey", "Control+B"],
    ["apple", "metaKey", "Meta+B"],
  ] as const)(
    "on an %s platform toggles from the body with %s+B and cancels the browser shortcut",
    (platform, modifier, advertised) => {
      setPlatform(platform);
      renderSidebar();
      const other = modifier === "ctrlKey" ? "metaKey" : "ctrlKey";
      fireEvent(
        document.body,
        shortcut({ ctrlKey: false, [other]: true } as KeyboardEventInit),
      );
      expect(sidebarState()).toBe("open");

      const event = shortcut({
        ctrlKey: false,
        [modifier]: true,
      } as KeyboardEventInit);
      fireEvent(document.body, event);
      expect(sidebarState()).toBe("closed");
      expect(event.defaultPrevented).toBe(true);
      expect(
        screen
          .getByRole("button", { name: "Toggle Sidebar" })
          .getAttribute("aria-keyshortcuts"),
      ).toBe(advertised);
    },
  );

  it("closes the phone sidebar sheet with the same keys that opened it", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("innerWidth", 375);
    render(
      <SidebarProvider>
        <Sidebar>
          <a href="/">Home</a>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    fireEvent(document.body, shortcut());
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" });
    const link = within(sheet).getByRole("link", { name: "Home" });
    link.focus();
    const close = shortcut();
    fireEvent(link, close);
    expect(close.defaultPrevented).toBe(true);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Sidebar" })).toBeNull(),
    );
  });

  it("does not toggle behind an open dialog", async () => {
    render(
      <SidebarProvider>
        <SidebarState />
        <Dialog open>
          <DialogContent>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>Describe the task.</DialogDescription>
            <button type="button">Cancel</button>
          </DialogContent>
        </Dialog>
      </SidebarProvider>,
    );
    const cancel = await screen.findByRole("button", { name: "Cancel" });
    cancel.focus();
    const event = shortcut();
    fireEvent(cancel, event);
    expect(sidebarState()).toBe("open");
    expect(event.defaultPrevented).toBe(false);
  });
});
