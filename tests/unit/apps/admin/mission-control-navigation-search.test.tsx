/** @vitest-environment jsdom */

import { setPlatform } from "@ui-sdk/core/testing";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MissionControlNavigationSearch } from "../../../../apps/admin/features/mission-control/components/navigation-search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";

vi.mock("@asym/config/navigation", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@asym/config/navigation")>();
  return {
    ...actual,
    getNavItemsByRole: (
      role: Parameters<typeof actual.getNavItemsByRole>[0],
      capabilities?: Parameters<typeof actual.getNavItemsByRole>[1],
    ) =>
      actual.getNavItemsByRole(role, capabilities).map((item) => ({
        ...item,
        keywords: item.id === "contributions" ? ["donations"] : [],
        items: item.items?.map((sub) => ({
          ...sub,
          keywords: sub.href === "/crm/notes" ? ["contact memos"] : [],
        })),
      })),
  };
});

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  setPlatform("other");
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
  it("matches module and page aliases without exposing restricted destinations", async () => {
    const view = render(
      <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />,
    );
    fireEvent.click(
      view.getAllByRole("button", { name: "Open Mission Control search" })[0]!,
    );
    const input = await view.findByRole("combobox", {
      name: "Search Mission Control pages",
    });
    fireEvent.change(input, { target: { value: "donations" } });
    expect(
      await view.findByRole("option", { name: "Contributions" }),
    ).toBeTruthy();
    fireEvent.change(input, { target: { value: "contact memos" } });
    expect(
      await view.findByRole("option", { name: "CRM › Notes" }),
    ).toBeTruthy();
    cleanup();
    const restricted = render(
      <MissionControlNavigationSearch role="staff" onNavigate={vi.fn()} />,
    );
    fireEvent.click(
      restricted.getAllByRole("button", {
        name: "Open Mission Control search",
      })[0]!,
    );
    fireEvent.change(await restricted.findByRole("combobox"), {
      target: { value: "donations" },
    });
    expect(
      restricted.queryByRole("option", { name: "Contributions" }),
    ).toBeNull();
  });

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

  it("advertises and runs this platform's own shortcut", async () => {
    setPlatform("apple");
    const view = render(
      <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />,
    );
    const trigger = view.getAllByRole("button", {
      name: "Open Mission Control search",
    })[0]!;
    await waitFor(() =>
      expect(trigger.getAttribute("aria-keyshortcuts")).toBe("Meta+K"),
    );
    expect(trigger.textContent).toContain("⌘K");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "k", ctrlKey: true });
    expect(view.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(trigger, { key: "k", metaKey: true });
    await view.findByRole("dialog", { name: "Mission Control navigation" });
    setPlatform("other");
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
    expect(view.getByRole("option", { name: "CRM" })).toBeTruthy();
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

  it("finds the pages inside a module", async () => {
    const navigate = vi.fn();
    const view = render(
      <MissionControlNavigationSearch role="admin" onNavigate={navigate} />,
    );
    fireEvent.click(
      view.getAllByRole("button", { name: "Open Mission Control search" })[0]!,
    );
    const search = await view.findByRole("combobox", {
      name: "Search Mission Control pages",
    });
    fireEvent.change(search, { target: { value: "notes" } });
    fireEvent.click(await view.findByRole("option", { name: "CRM › Notes" }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/crm/notes");
  });

  it("does not intercept typing, composition, repeats, or a scoped handled shortcut", () => {
    const view = render(
      <>
        <input aria-label="Message" />
        <MissionControlNavigationSearch role="admin" onNavigate={vi.fn()} />
      </>,
    );
    // A real key press goes to the focused element.
    const message = view.getByRole("textbox", { name: "Message" });
    message.focus();
    fireEvent.keyDown(message, { key: "k", ctrlKey: true });
    message.blur();
    fireEvent.keyDown(document.body, {
      key: "k",
      ctrlKey: true,
      isComposing: true,
    });
    fireEvent.keyDown(document.body, { key: "k", ctrlKey: true, repeat: true });
    const handled = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    handled.preventDefault();
    document.body.dispatchEvent(handled);
    expect(view.queryByRole("dialog")).toBeNull();
  });
});
