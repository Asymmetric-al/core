// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../../../../../../packages/ui/components/shadcn/sidebar";

beforeEach(() => {
  // Phone width: the sidebar renders as a sheet.
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: media.includes("max-width"),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Sidebar on phones", () => {
  it("closes the sheet on the first Escape, even from a menu item with a tooltip", async () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Home">Home</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    const home = await screen.findByRole("button", { name: "Home" });
    home.focus();
    fireEvent.focus(home);
    fireEvent.keyDown(home, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Home" })).toBeNull(),
    );
  });
  it("offers a visible close control that closes the sheet", async () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Home</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    const close = await screen.findByRole("button", { name: "Close sidebar" });
    // Visible, outside the panel's free edge, so it never covers the
    // sidebar's own header or links.
    expect(close.className).not.toMatch(/(hidden|sr-only)/);
    expect(close.className).toContain("-right-14");
    // After the links, so opening still focuses the first link.
    const home = screen.getByRole("button", { name: "Home" });
    expect(
      home.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(close);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Home" })).toBeNull(),
    );
  });
});
