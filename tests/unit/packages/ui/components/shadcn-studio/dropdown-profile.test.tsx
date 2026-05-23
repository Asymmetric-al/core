/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", async () => {
  const React = await import("react");

  return {
    default: ({
      children,
      href,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      children: React.ReactNode;
    }) => React.createElement("a", { href, ...props }, children),
  };
});

import ProfileDropdown from "../../../../../../packages/ui/components/shadcn-studio/blocks/dropdown-profile";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function TestIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" {...props} />;
}

function renderOpenProfileDropdown(
  props: Partial<React.ComponentProps<typeof ProfileDropdown>> = {},
) {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  return render(
    <ProfileDropdown
      defaultOpen
      trigger={<button type="button">Open profile menu</button>}
      user={{ name: "Grace Hopper", email: "grace@example.com" }}
      {...props}
    />,
  );
}

describe("ProfileDropdown", () => {
  it("does not render misleading template links by default", () => {
    renderOpenProfileDropdown();

    expect(screen.queryByText("My account")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
    expect(screen.queryByText("Customization")).toBeNull();
    expect(screen.queryByText("Add team account")).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeTruthy();
  });

  it("renders caller-provided menu items with their configured hrefs", () => {
    renderOpenProfileDropdown({
      menuItems: [
        { label: "Administration", href: "/admin", icon: TestIcon },
        { label: "Manage team", href: "/admin/teams", icon: TestIcon },
        { label: "About", href: "/help/about", icon: TestIcon },
      ],
    });

    const administration = screen.getByRole("menuitem", {
      name: "Administration",
    });
    const manageTeam = screen.getByRole("menuitem", { name: "Manage team" });
    const about = screen.getByRole("menuitem", { name: "About" });

    expect(administration.getAttribute("href")).toBe("/admin");
    expect(manageTeam.getAttribute("href")).toBe("/admin/teams");
    expect(about.getAttribute("href")).toBe("/help/about");

    const hrefs = [administration, manageTeam, about].map((item) =>
      item.getAttribute("href"),
    );
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
