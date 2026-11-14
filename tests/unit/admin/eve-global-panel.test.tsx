// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue(undefined),
  status: "ready" as string,
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

vi.mock("../../../apps/admin/node_modules/eve/dist/src/react/index.js", () => ({
  useEveAgent: () => ({
    status: testState.status,
    data: { messages: [] },
    send: testState.send,
    reset: vi.fn(),
    stop: vi.fn(),
  }),
}));

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

describe("EveGlobalPanel", () => {
  beforeEach(() => {
    testState.status = "ready";
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
    expect(description).toContain("Ctrl or Command + Enter");
    expect(screen.getByText("Ask about this page")).toBeTruthy();
    expect(
      screen.getByText(/cannot execute tools from this panel/i),
    ).toBeTruthy();
  });

  it.each(["ctrlKey", "metaKey"])(
    "sends with %s + Enter but not bare Enter or composition",
    (modifier) => {
      render(<EveGlobalPanel />);
      fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
      const composer = screen.getByLabelText("Message Eve");
      fireEvent.change(composer, { target: { value: "Explain this page" } });
      fireEvent.keyDown(composer, { key: "Enter" });
      fireEvent.keyDown(composer, {
        key: "Enter",
        [modifier]: true,
        isComposing: true,
      });
      expect(testState.send).not.toHaveBeenCalled();
      fireEvent.keyDown(composer, { key: "Enter", [modifier]: true });
      expect(testState.send).toHaveBeenCalledWith({
        message: "Explain this page",
      });
    },
  );

  it("never submits empty or busy keyboard requests", () => {
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const composer = screen.getByLabelText("Message Eve");
    fireEvent.keyDown(composer, { key: "Enter", ctrlKey: true });
    cleanup();
    testState.status = "streaming";
    render(<EveGlobalPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open eve/i }));
    const busyComposer = screen.getByLabelText("Message Eve");
    fireEvent.change(busyComposer, { target: { value: "Explain this page" } });
    fireEvent.keyDown(busyComposer, { key: "Enter", ctrlKey: true });
    expect(testState.send).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Detach" })).toBeTruthy();
  });
});
