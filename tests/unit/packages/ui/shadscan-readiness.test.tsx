/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterBar } from "../../../../packages/ui/components/primitives/filter-bar";
import { DemoOnlyLoginCard } from "../../../../packages/ui/components/auth/DemoOnlyLoginCard";
import { FullLoginCard } from "../../../../packages/ui/components/auth/FullLoginCard";
import { ChartCard } from "../../../../packages/ui/components/primitives/chart-wrappers";
import ActivityDialog from "../../../../packages/ui/components/shadcn-studio/blocks/dialog-activity";
import ProfileDropdown from "../../../../packages/ui/components/shadcn-studio/blocks/dropdown-profile";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "../../../../packages/ui/components/shadcn/command";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("shared UI readiness", () => {
  it("names the link rendered through a Base UI profile menu item", () => {
    render(
      <ProfileDropdown
        defaultOpen
        trigger={<button type="button">Open profile</button>}
        menuItems={[{ label: "My Profile", href: "/profile" }]}
      />,
    );
    const item = screen.getByRole("menuitem", { name: "My Profile" });
    expect(item.tagName).toBe("A");
    expect(item.getAttribute("href")).toBe("/profile");
  });
  it("names search independently of its placeholder and passes edits to the caller", () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        search={{ value: "", onChange, placeholder: "Find people" }}
      />,
    );
    const search = screen.getByRole("textbox", { name: "Search" });
    fireEvent.change(search, { target: { value: "Conrad" } });
    expect(onChange).toHaveBeenCalledWith("Conrad");
  });

  it.each(["demo", "full"])("announces the %s login error", (variant) => {
    if (variant === "demo") {
      render(
        <DemoOnlyLoginCard
          title="Demo login"
          error="Unable to sign in"
          onDemoLogin={vi.fn()}
        />,
      );
    } else {
      render(
        <FullLoginCard
          title="Login"
          email=""
          password=""
          error="Unable to sign in"
          onEmailChange={vi.fn()}
          onPasswordChange={vi.fn()}
          onSubmit={vi.fn()}
        />,
      );
    }
    expect(screen.getByRole("alert").textContent).toBe("Unable to sign in");
  });

  it("announces chart loading, failure, and empty results with the chart name", () => {
    const { rerender } = render(
      <ChartCard title="Giving trends" isLoading>
        <span>Chart data</span>
      </ChartCard>,
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Loading Giving trends",
    );
    rerender(
      <ChartCard title="Giving trends" isError errorMessage="Please try again">
        <span>Chart data</span>
      </ChartCard>,
    );
    expect(screen.getByRole("alert").textContent).toContain("Please try again");
    rerender(
      <ChartCard
        title="Giving trends"
        isEmpty
        emptyMessage="No giving activity yet"
      >
        <span>Chart data</span>
      </ChartCard>,
    );
    expect(screen.getByRole("status").textContent).toContain(
      "No giving activity yet",
    );
  });

  it("names the activity reply field", () => {
    render(
      <ActivityDialog
        defaultOpen
        trigger={<button type="button">Open activity</button>}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: "Reply to Joe Lincoln" }),
    ).toBeTruthy();
  });

  it("passes the application command label to the cmdk-owned combobox name", () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    render(
      <CommandDialog open commandLabel="Search Mission Control pages">
        <CommandInput />
        <CommandList />
      </CommandDialog>,
    );
    expect(
      screen.getByRole("combobox", { name: "Search Mission Control pages" }),
    ).toBeTruthy();
  });
});
