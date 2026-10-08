// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SidebarProvider,
  useSidebar,
} from "../../../../packages/ui/components/shadcn/sidebar";

function SidebarState() {
  const { open } = useSidebar();
  return <output aria-label="Sidebar state">{open ? "open" : "closed"}</output>;
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderSidebar() {
  return render(
    <SidebarProvider>
      <SidebarState />
      <input aria-label="Name" />
      <textarea aria-label="Description" />
      <select aria-label="Category">
        <option>General</option>
      </select>
      <div contentEditable suppressContentEditableWarning aria-label="Editor">
        <span>Editable text</span>
      </div>
      <div role="textbox" aria-label="Custom editor" tabIndex={0} />
    </SidebarProvider>,
  );
}

describe("sidebar shortcut ownership", () => {
  it.each(["Name", "Description", "Category", "Editor", "Custom editor"])(
    "leaves Ctrl+B to the editable %s target",
    (name) => {
      renderSidebar();
      const target =
        name === "Editor"
          ? screen.getByText("Editable text")
          : screen.getByLabelText(name);
      const event = new KeyboardEvent("keydown", {
        key: "b",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(target, event);
      expect(screen.getByLabelText("Sidebar state").textContent).toBe("open");
      expect(event.defaultPrevented).toBe(false);
    },
  );

  it.each(["defaultPrevented", "isComposing", "repeat"])(
    "ignores a shortcut that is %s",
    (state) => {
      renderSidebar();
      const event = new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
        cancelable: true,
        isComposing: state === "isComposing",
        repeat: state === "repeat",
      });
      if (state === "defaultPrevented") event.preventDefault();
      fireEvent(document.body, event);
      expect(screen.getByLabelText("Sidebar state").textContent).toBe("open");
    },
  );

  it.each(["ctrlKey", "metaKey"])(
    "toggles from the body with %s+B and cancels the browser shortcut",
    (modifier) => {
      renderSidebar();
      const event = new KeyboardEvent("keydown", {
        key: "b",
        [modifier]: true,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(document.body, event);
      expect(screen.getByLabelText("Sidebar state").textContent).toBe("closed");
      expect(event.defaultPrevented).toBe(true);
    },
  );
});
