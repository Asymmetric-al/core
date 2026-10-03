/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MissionControlNavigationSearch } from "../../../../apps/admin/features/mission-control/components/navigation-search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";

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

describe("Mission Control navigation search", () => {
  it("preserves another modal's keyboard ownership", async () => {
    const view = render(
      <>
        <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />
        <Dialog open>
          <DialogContent>
            <DialogTitle>Edit record</DialogTitle>
            <DialogDescription>Review changes before saving.</DialogDescription>
            <button type="button">Save record</button>
          </DialogContent>
        </Dialog>
      </>,
    );
    const save = await view.findByRole("button", { name: "Save record" });
    save.focus();
    fireEvent.keyDown(save, { key: "k", ctrlKey: true });
    expect(
      view.queryByRole("dialog", { name: "Mission Control navigation" }),
    ).toBeNull();
    expect(document.activeElement).toBe(save);
  });

  it("toggles an open palette when its non-editing control owns focus", async () => {
    const view = render(
      <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />,
    );
    fireEvent.click(
      view.getAllByRole("button", { name: "Open Mission Control search" })[0]!,
    );
    const close = await view.findByRole("button", { name: "Close" });
    close.focus();
    fireEvent.keyDown(close, { key: "k", ctrlKey: true });
    await waitFor(() =>
      expect(
        view.queryByRole("dialog", { name: "Mission Control navigation" }),
      ).toBeNull(),
    );
  });

  it("opens advertised keyboard search with only the role's permitted routes", async () => {
    const view = render(
      <MissionControlNavigationSearch role="staff" onNavigate={vi.fn()} />,
    );
    const trigger = view.getAllByRole("button", {
      name: "Open Mission Control search",
    })[0]!;
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "k", ctrlKey: true });
    await view.findByRole("dialog", { name: "Mission Control navigation" });
    expect(view.getByRole("option", { name: "Web Studio" })).toBeTruthy();
    expect(
      view.getByRole("option", { name: "People & Churches" }),
    ).toBeTruthy();
    expect(view.queryByRole("option", { name: "Contributions" })).toBeNull();
    expect(view.queryByRole("option", { name: "Admin" })).toBeNull();
  });

  it("runs a real navigation command and restores trigger focus on dismissal", async () => {
    const navigate = vi.fn();
    const view = render(
      <MissionControlNavigationSearch role="admin" onNavigate={navigate} />,
    );
    const trigger = view.getAllByRole("button", {
      name: "Open Mission Control search",
    })[0]!;
    fireEvent.click(trigger);
    const search = await view.findByRole("combobox", {
      name: "Search Mission Control pages",
    });
    fireEvent.change(search, { target: { value: "contributions" } });
    fireEvent.click(await view.findByRole("option", { name: "Contributions" }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/contributions");
    await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("does not intercept typing, composition, repeats, or a scoped handled shortcut", () => {
    const view = render(
      <>
        <input aria-label="Message" />
        <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />
      </>,
    );
    fireEvent.keyDown(view.getByRole("textbox", { name: "Message" }), {
      key: "k",
      ctrlKey: true,
    });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true, isComposing: true });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true, repeat: true });
    const handled = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    handled.preventDefault();
    window.dispatchEvent(handled);
    expect(view.queryByRole("dialog")).toBeNull();
  });
});
