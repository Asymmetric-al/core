// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  NavTabs,
  NavTabsLink,
} from "../../../../../../packages/ui/components/primitives/nav-tabs";

afterEach(cleanup);

describe("NavTabs", () => {
  it("is page navigation: a named nav of links, the current one marked", () => {
    render(
      <NavTabs aria-label="Support Hub section">
        <NavTabsLink href="/support" active>
          Inbox
        </NavTabsLink>
        <NavTabsLink href="/support/reports">Reports</NavTabsLink>
      </NavTabs>,
    );
    const nav = screen.getByRole("navigation", { name: "Support Hub section" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Inbox", "Reports"]);
    expect(links[0]!.getAttribute("aria-current")).toBe("page");
    expect(links[1]!.hasAttribute("aria-current")).toBe(false);
    // Links, not a tablist: these change the page, they do not swap panels.
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("looks like the shared line tabs: underline on the current page only", () => {
    render(
      <NavTabs aria-label="Sections">
        <NavTabsLink href="/a" active>
          A
        </NavTabsLink>
        <NavTabsLink href="/b">B</NavTabsLink>
      </NavTabs>,
    );
    const [a, b] = screen.getAllByRole("link");
    expect(a!.getAttribute("data-slot")).toBe("nav-tabs-link");
    expect(a!.getAttribute("data-active")).toBe("");
    expect(b!.hasAttribute("data-active")).toBe(false);
    expect(a!.className).toContain("data-active:after:opacity-100");
  });

  it("renders through a router link when one is given", () => {
    function RouterLink(props: React.ComponentProps<"a">) {
      return <a data-router="" {...props} />;
    }
    render(
      <NavTabs aria-label="Sections">
        <NavTabsLink href="/a" render={<RouterLink href="/a" />}>
          A
        </NavTabsLink>
      </NavTabs>,
    );
    expect(screen.getByRole("link").hasAttribute("data-router")).toBe(true);
  });
});
