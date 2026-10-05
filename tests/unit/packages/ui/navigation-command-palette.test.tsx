/** @vitest-environment jsdom */

import { NavigationCommandPalette } from "@asym/ui/components/primitives/navigation-command-palette";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

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

it("filters supplied workspace destinations and navigates with Enter", async () => {
  const navigate = vi.fn();
  const view = render(
    <NavigationCommandPalette
      title="Workspace navigation"
      triggerLabel="Open workspace navigation search"
      items={[
        { label: "Overview", href: "/workspace" },
        {
          label: "Settings",
          href: "/workspace/settings",
          keywords: ["preferences"],
        },
      ]}
      onNavigate={navigate}
    />,
  );
  fireEvent.click(
    view.getByRole("button", { name: "Open workspace navigation search" }),
  );
  await view.findByRole("dialog", { name: "Workspace navigation" });
  const search = view.getByRole("combobox", {
    name: "Search workspace navigation",
  });
  await waitFor(() => expect(document.activeElement).toBe(search));
  fireEvent.change(search, { target: { value: "preferences" } });
  await view.findByRole("option", { name: "Settings" });
  expect(view.queryByRole("option", { name: "Overview" })).toBeNull();
  fireEvent.keyDown(search, { key: "Enter" });
  expect(navigate).toHaveBeenCalledExactlyOnceWith("/workspace/settings");
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
});

it("restores the opening control and starts a fresh search after Escape", async () => {
  const view = render(
    <NavigationCommandPalette
      title="Workspace navigation"
      triggerLabel="Open workspace navigation search"
      items={[{ label: "Overview", href: "/workspace" }]}
      onNavigate={vi.fn()}
    />,
  );
  const trigger = view.getByRole("button", {
    name: "Open workspace navigation search",
  });
  trigger.focus();
  fireEvent.click(trigger);
  const search = await view.findByRole("combobox", {
    name: "Search workspace navigation",
  });
  fireEvent.change(search, { target: { value: "nothing matches" } });
  expect(
    view.getByText("No matching pages. Try another page name."),
  ).toBeTruthy();
  fireEvent.keyDown(search, { key: "Escape" });
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  fireEvent.click(trigger);
  const reopened = await view.findByRole("combobox", {
    name: "Search workspace navigation",
  });
  expect((reopened as HTMLInputElement).value).toBe("");
  expect(view.getByRole("option", { name: "Overview" })).toBeTruthy();
});

it.each(["Control", "Meta"])(
  "opens with %s+K and restores the focused workspace control",
  async (modifier) => {
    const view = render(
      <>
        <button type="button">Workspace action</button>
        <NavigationCommandPalette
          title="Workspace navigation"
          triggerLabel="Open workspace navigation search"
          items={[{ label: "Overview", href: "/workspace" }]}
          onNavigate={vi.fn()}
        />
      </>,
    );
    const origin = view.getByRole("button", { name: "Workspace action" });
    const trigger = view.getByRole("button", {
      name: "Open workspace navigation search",
    });
    origin.focus();
    fireEvent.keyDown(origin, {
      key: "k",
      ctrlKey: modifier === "Control",
      metaKey: modifier === "Meta",
    });
    const search = await view.findByRole("combobox", {
      name: "Search workspace navigation",
    });
    await waitFor(() => expect(document.activeElement).toBe(search));
    expect(trigger.getAttribute("aria-keyshortcuts")).toBe("Control+k Meta+k");
    fireEvent.keyDown(search, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(origin));
  },
);

it("preserves editing, composition, modifier and locally handled keyboard ownership", () => {
  const view = render(
    <>
      <input aria-label="Workspace note" />
      <textarea aria-label="Workspace details" />
      <div contentEditable aria-label="Workspace editor" />
      <button type="button" onKeyDown={(event) => event.preventDefault()}>
        Local shortcut
      </button>
      <NavigationCommandPalette
        title="Workspace navigation"
        triggerLabel="Open workspace navigation search"
        items={[{ label: "Overview", href: "/workspace" }]}
        onNavigate={vi.fn()}
      />
    </>,
  );
  for (const target of [
    view.getByRole("textbox", { name: "Workspace note" }),
    view.getByRole("textbox", { name: "Workspace details" }),
    view.getByLabelText("Workspace editor"),
    view.getByRole("button", { name: "Local shortcut" }),
  ]) {
    fireEvent.keyDown(target, { key: "k", ctrlKey: true });
  }
  for (const extra of [
    { isComposing: true },
    { repeat: true },
    { altKey: true },
    { shiftKey: true },
    { ctrlKey: false },
    { key: "l" },
  ]) {
    fireEvent.keyDown(window, { key: "k", ctrlKey: true, ...extra });
  }
  expect(view.queryByRole("dialog")).toBeNull();
});

it("leaves another dialog's shortcut and focused control alone", async () => {
  const view = render(
    <>
      <NavigationCommandPalette
        title="Workspace navigation"
        triggerLabel="Open workspace navigation search"
        items={[{ label: "Overview", href: "/workspace" }]}
        onNavigate={vi.fn()}
      />
      <Dialog open>
        <DialogContent>
          <DialogTitle>Edit workspace note</DialogTitle>
          <DialogDescription>Review before saving.</DialogDescription>
          <button type="button">Save note</button>
        </DialogContent>
      </Dialog>
    </>,
  );
  const save = await view.findByRole("button", { name: "Save note" });
  save.focus();
  fireEvent.keyDown(save, { key: "k", ctrlKey: true });
  expect(
    view.queryByRole("dialog", { name: "Workspace navigation" }),
  ).toBeNull();
  expect(document.activeElement).toBe(save);
});

it("removes the global shortcut when its workspace unmounts", () => {
  const view = render(
    <NavigationCommandPalette
      title="Workspace navigation"
      triggerLabel="Open workspace navigation search"
      items={[{ label: "Overview", href: "/workspace" }]}
      onNavigate={vi.fn()}
    />,
  );
  view.unmount();
  const event = new KeyboardEvent("keydown", {
    key: "k",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});
