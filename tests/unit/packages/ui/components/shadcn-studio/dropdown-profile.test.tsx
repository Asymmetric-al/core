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

import ProfileDropdown, {
  initialsOf,
} from "../../../../../../packages/ui/components/shadcn-studio/blocks/dropdown-profile";

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
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeTruthy();
  });

  it("shows who is signed in without placeholder people", () => {
    const { container } = renderOpenProfileDropdown({
      user: { name: "", email: "grace@example.org" },
      detail: "Administrator · Give Hope",
    });

    // No stock photo, fake presence dot or placeholder address.
    expect(container.ownerDocument.querySelector("img")).toBeNull();
    expect(screen.queryByText("user@example.com")).toBeNull();
    expect(screen.getByText("grace@example.org")).toBeTruthy();
    expect(screen.getByText("Administrator · Give Hope")).toBeTruthy();
    expect(screen.getByText("G")).toBeTruthy();
  });

  it("heads the menu with the role and organisation when the account has no name or email", () => {
    renderOpenProfileDropdown({
      user: { name: "", email: "" },
      detail: "Administrator · Give Hope",
    });

    // A bare "Signed in" says nothing about whose menu this is.
    expect(screen.queryByText("Signed in")).toBeNull();
    expect(screen.getAllByText("Administrator · Give Hope")).toHaveLength(1);
  });

  it("falls back to Your account with no name, email or detail", () => {
    renderOpenProfileDropdown({ user: { name: "", email: "" } });

    expect(screen.queryByText("Signed in")).toBeNull();
    expect(screen.getByText("Your account")).toBeTruthy();
  });
});

describe("initialsOf", () => {
  it("takes up to two initials from a name or an email", () => {
    expect(initialsOf("Grace Brewster Hopper")).toBe("GB");
    expect(initialsOf("grace.hopper@example.org")).toBe("GH");
    // No name: the avatar shows a person icon instead of a "?".
    expect(initialsOf("")).toBe("");
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
