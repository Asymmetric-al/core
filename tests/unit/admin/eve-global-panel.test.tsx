// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  status: "ready" as string,
  statusListeners: new Set<() => void>(),
  role: "admin" as string,
  user: {
    id: "user-1",
    email: "admin@example.com",
    name: "Admin",
    role: "admin" as const,
    tenantId: "tenant-1",
  } as {
    id: string;
    email: string;
    name: string;
    role: "admin";
    tenantId: string;
  } | null,
}));

function setStatus(next: string) {
  testState.status = next;
  for (const listener of testState.statusListeners) listener();
}

// EveAgentStore.send flips status to "submitted" and notifies before its first
// await, so the status change lands in the same render as the cleared composer.
function sendStartsATurn() {
  testState.send.mockImplementationOnce(() => {
    setStatus("submitted");
    return new Promise(() => {});
  });
}

vi.mock(
  "../../../apps/admin/node_modules/eve/dist/src/react/index.js",
  async () => {
    const { useSyncExternalStore } = await import("react");
    const subscribe = (listener: () => void) => {
      testState.statusListeners.add(listener);
      return () => {
        testState.statusListeners.delete(listener);
      };
    };
    const getStatus = () => testState.status;
    return {
      useEveAgent: () => ({
        status: useSyncExternalStore(subscribe, getStatus, getStatus),
        data: { messages: [] },
        send: testState.send,
        reset: vi.fn(),
        stop: testState.stop,
      }),
    };
  },
);

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({
    role: testState.role,
    tenant: { id: "tenant-1", name: "Give Hope", slug: "give-hope" },
    user: testState.user,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/crm/donors/private-record-id",
}));

vi.mock("@asym/ui/components/shadcn/sheet", async () => {
  const ReactModule = await import("react");
  const SheetContext = ReactModule.createContext<{
    onOpenChange: (open: boolean) => void;
    open: boolean;
  } | null>(null);

  return {
    Sheet: ({
      children,
      onOpenChange,
      open,
    }: React.PropsWithChildren<{
      onOpenChange: (open: boolean) => void;
      open: boolean;
    }>) => (
      <SheetContext.Provider value={{ onOpenChange, open }}>
        {children}
      </SheetContext.Provider>
    ),
    SheetTrigger: ({ render: trigger }: { render: React.ReactElement }) => {
      const sheet = ReactModule.useContext(SheetContext);
      return ReactModule.cloneElement(trigger, {
        onClick: () => sheet?.onOpenChange(true),
      } as React.HTMLAttributes<HTMLElement>);
    },
    SheetContent: ({ children }: React.PropsWithChildren) => {
      const sheet = ReactModule.useContext(SheetContext);
      return sheet?.open ? <aside>{children}</aside> : null;
    },
    SheetHeader: ({ children }: React.PropsWithChildren) => (
      <header>{children}</header>
    ),
    SheetTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
    SheetDescription: ({ children }: React.PropsWithChildren) => (
      <p>{children}</p>
    ),
  };
});

import { EveGlobalPanel } from "../../../apps/admin/app/eve/global-panel";
import { listShortcuts } from "../../../packages/ui/components/primitives/shortcut";

describe("EveGlobalPanel", () => {
  beforeEach(() => {
    setPlatform("other");
    testState.status = "ready";
    testState.statusListeners.clear();
    testState.role = "admin";
    testState.user = {
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      tenantId: "tenant-1",
    };
  });

  afterEach(() => {
    cleanup();
    setPlatform("other");
    vi.clearAllMocks();
  });

  it("does not create an Eve client for non-admin Mission Control roles", () => {
    testState.role = "staff";

    render(<EveGlobalPanel />);

    expect(screen.queryByRole("button", { name: /open eve/i })).toBeNull();
  });

  it("does not create an Eve client after Mission Control sign-out", () => {
    testState.user = null;
    testState.role = "admin";

    render(<EveGlobalPanel />);

    expect(screen.queryByRole("button", { name: /open eve/i })).toBeNull();
  });

  it("sits in the app header instead of floating over page actions", () => {
    render(<EveGlobalPanel placement="header" />);
    const trigger = screen.getByRole("button", { name: /open eve/i });
    expect(trigger.className).not.toMatch(/\bfixed\b/);
  });

  it("opens globally with a bounded text-only composer and a clear data boundary", () => {
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));

    expect(screen.getByRole("heading", { name: "Eve" })).toBeTruthy();
    expect(screen.getByText(/not records, payment details/i)).toBeTruthy();

    const composer = screen.getByLabelText("Message Eve");
    expect(composer.getAttribute("maxlength")).toBe("2000");
    expect(screen.queryByLabelText(/attach/i)).toBeNull();
  });

  it("describes the character count and keyboard shortcut and retains the text-only boundary", () => {
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const composer = screen.getByLabelText("Message Eve");
    const description = composer
      .getAttribute("aria-describedby")
      ?.split(" ")
      .map((id) => document.getElementById(id)?.textContent)
      .join(" ");
    expect(description).toContain("0 / 2,000 characters");
    expect(description?.replace(/[⁦⁩]/g, "")).toContain(
      "Press Ctrl+Enter to send.",
    );
    expect(
      screen
        .getByRole("button", { name: "Send" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+Enter");
    expect(screen.getByText("Ask about this page")).toBeTruthy();
    expect(
      screen.getByText(/cannot execute tools from this panel/i),
    ).toBeTruthy();
  });

  it.each([
    ["other", "ctrlKey", "metaKey"],
    ["apple", "metaKey", "ctrlKey"],
  ] as const)(
    "on %s platforms sends with %s + Enter but not the other modifier, bare Enter or composition",
    (platform, modifier, otherModifier) => {
      setPlatform(platform);
      render(<EveGlobalPanel />);
      fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
      const composer = screen.getByLabelText("Message Eve");
      fireEvent.change(composer, { target: { value: "Explain this page" } });
      composer.focus();
      fireEvent.keyDown(composer, { key: "Enter" });
      fireEvent.keyDown(composer, { key: "Enter", [otherModifier]: true });
      fireEvent.keyDown(composer, {
        key: "Enter",
        [modifier]: true,
        isComposing: true,
      });
      expect(testState.send).not.toHaveBeenCalled();
      fireEvent.keyDown(composer, { key: "Enter", [modifier]: true });
      expect(testState.send).toHaveBeenCalledTimes(1);
      expect(testState.send).toHaveBeenCalledWith({
        message: "Explain this page",
      });
    },
  );

  it("registers send on the shared shortcut owner only while focus is in the composer", () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const composer = screen.getByLabelText("Message Eve");
    fireEvent.change(composer, { target: { value: "Explain this page" } });

    outside.focus();
    fireEvent.keyDown(outside, { key: "Enter", ctrlKey: true });
    expect(testState.send).not.toHaveBeenCalled();
    expect(
      listShortcuts().some(
        ({ description }) => description === "Send message to Eve",
      ),
    ).toBe(false);

    composer.focus();
    expect(
      listShortcuts().find(
        ({ description }) => description === "Send message to Eve",
      )?.keys,
    ).toBe("mod+enter");
    outside.remove();
  });

  it("never submits empty or busy keyboard requests", () => {
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const composer = screen.getByLabelText("Message Eve");
    composer.focus();
    fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });
    cleanup();
    testState.status = "streaming";
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const busyComposer = screen.getByLabelText("Message Eve");
    fireEvent.change(busyComposer, { target: { value: "Explain this page" } });
    expect(busyComposer).toHaveProperty("value", "Explain this page");
    // The composer is read-only, not disabled, while busy, so it keeps focus
    // and the shortcut; the submit handler is what refuses a second turn.
    expect(busyComposer).toHaveProperty("readOnly", true);
    expect(busyComposer.matches(":disabled")).toBe(false);
    const detach = screen.getByRole("button", { name: "Detach" });
    const submitted = vi.fn();
    detach.closest("form")?.addEventListener("submit", submitted);
    busyComposer.focus();
    fireEvent.keyDown(busyComposer, { key: "Enter", ctrlKey: true });
    detach.focus();
    fireEvent.keyDown(detach, { key: "Enter", ctrlKey: true });
    expect(submitted).toHaveBeenCalledTimes(2);
    expect(testState.send).not.toHaveBeenCalled();
  });

  describe("keeps focus in the composer across a turn", () => {
    function openComposerWithMessage() {
      render(<EveGlobalPanel />);
      fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
      const composer = screen.getByLabelText(
        "Message Eve",
      ) as HTMLTextAreaElement;
      fireEvent.change(composer, { target: { value: "Explain this page" } });
      sendStartsATurn();
      return composer;
    }

    // Chromium blurs a focused control once it is disabled; jsdom does not, so
    // assert the composer both holds focus and stays focusable.
    function expectComposerFocused(composer: HTMLTextAreaElement) {
      expect(document.activeElement).toBe(composer);
      expect(composer.matches(":disabled")).toBe(false);
    }

    function expectShortcutStillSends(composer: HTMLTextAreaElement) {
      fireEvent.change(composer, { target: { value: "What next?" } });
      fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });
      expect(testState.send).toHaveBeenCalledTimes(2);
      expect(testState.send).toHaveBeenLastCalledWith({
        message: "What next?",
      });
    }

    it("after Ctrl+Enter, while the reply streams and after it", () => {
      const composer = openComposerWithMessage();
      composer.focus();
      fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });

      expect(testState.send).toHaveBeenCalledTimes(1);
      expect(composer).toHaveProperty("value", "");
      expect(composer).toHaveProperty("readOnly", true);
      expectComposerFocused(composer);
      act(() => setStatus("streaming"));
      expectComposerFocused(composer);
      act(() => setStatus("ready"));
      expectComposerFocused(composer);
      expect(composer).toHaveProperty("readOnly", false);
      expectShortcutStillSends(composer);
    });

    it("after the Send button, which turns into Detach and then a disabled Send", () => {
      const composer = openComposerWithMessage();
      const send = screen.getByRole("button", { name: "Send" });
      // A click focuses the button in Chromium before the form submits.
      send.focus();
      fireEvent.click(send);

      expect(testState.send).toHaveBeenCalledTimes(1);
      expectComposerFocused(composer);
      act(() => setStatus("streaming"));
      expectComposerFocused(composer);
      act(() => setStatus("ready"));
      expect(screen.getByRole("button", { name: "Send" })).toBe(send);
      expect(send.matches(":disabled")).toBe(true);
      expectComposerFocused(composer);
      expectShortcutStillSends(composer);
    });

    it.each([
      ["the reply ends", false],
      ["the turn is detached", true],
    ])("when %s while Detach has focus", (_case, clickDetach) => {
      const composer = openComposerWithMessage();
      composer.focus();
      fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });
      act(() => setStatus("streaming"));
      const detach = screen.getByRole("button", { name: "Detach" });
      detach.focus();
      if (clickDetach) {
        fireEvent.click(detach);
        expect(testState.stop).toHaveBeenCalledTimes(1);
      }

      // Stopping aborts the turn and the store reports ready afterwards.
      act(() => setStatus("ready"));
      expectComposerFocused(composer);
      expectShortcutStillSends(composer);
    });

    it("leaves focus alone when the reply ends while focus is elsewhere", () => {
      const composer = openComposerWithMessage();
      const outside = document.createElement("button");
      document.body.append(outside);
      composer.focus();
      fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });
      outside.focus();

      act(() => setStatus("ready"));
      expect(document.activeElement).toBe(outside);
      outside.remove();
    });
  });
});
