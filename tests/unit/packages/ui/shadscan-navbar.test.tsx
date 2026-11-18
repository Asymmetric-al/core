/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { NavbarClient } from "../../../../packages/ui/components/public/navbar-client";

const navigation = vi.hoisted(() => ({ pathname: "/", reads: 0 }));

vi.mock("next/navigation", () => ({
  usePathname: () => {
    navigation.reads += 1;
    return navigation.pathname;
  },
}));

let root: Root | undefined;

beforeEach(() => {
  navigation.pathname = "/";
  navigation.reads = 0;
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  cleanup();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function publicNavbar() {
  return (
    <NavbarClient
      navLinks={[
        { label: "Mission", href: "/about" },
        { label: "Deployments", href: "/workers" },
      ]}
      ctaLabel="Give Now"
      ctaHref="/workers"
      siteName="Give Hope"
      shortName="GH"
      variant="solid"
    />
  );
}

it("removes closed mobile links from keyboard navigation and owns dismissal with a dialog", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(
    <NavbarClient
      navLinks={[{ label: "Workers", href: "/workers" }]}
      ctaLabel="Give"
      ctaHref="/give"
      siteName="Give Hope"
      shortName="GH"
      variant="solid"
    />,
  );
  expect(document.getElementById("mobile-menu")).toBeNull();
  const trigger = screen.getByRole("button", { name: "Open menu" });
  fireEvent.click(trigger);
  expect(
    await screen.findByRole("dialog", { name: "Main navigation" }),
  ).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("marks the open section in the desktop links and the phone menu", async () => {
  navigation.pathname = "/workers/42";
  render(publicNavbar());

  const nav = screen.getByRole("navigation", { name: "Main navigation" });
  await waitFor(() =>
    expect(
      within(nav)
        .getByRole("link", { name: "Deployments" })
        .getAttribute("aria-current"),
    ).toBe("true"),
  );
  expect(
    within(nav)
      .getByRole("link", { name: "Mission" })
      .hasAttribute("aria-current"),
  ).toBe(false);
  // The call to action shares the section's address but is not a page link.
  expect(
    within(nav)
      .getByRole("link", { name: "Give Now" })
      .hasAttribute("aria-current"),
  ).toBe(false);

  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  const menu = await screen.findByRole("dialog", { name: "Main navigation" });
  expect(
    within(menu)
      .getByRole("link", { name: "Deployments" })
      .getAttribute("aria-current"),
  ).toBe("true");
  expect(
    within(menu)
      .getByRole("link", { name: "Mission" })
      .hasAttribute("aria-current"),
  ).toBe(false);
});

it("moves the mark when the visitor goes to another page", async () => {
  navigation.pathname = "/about";
  const { rerender } = render(publicNavbar());
  const mission = screen.getByRole("link", { name: "Mission" });
  const deployments = screen.getByRole("link", { name: "Deployments" });
  await waitFor(() =>
    expect(mission.getAttribute("aria-current")).toBe("page"),
  );

  navigation.pathname = "/workers";
  rerender(publicNavbar());
  await waitFor(() =>
    expect(deployments.getAttribute("aria-current")).toBe("page"),
  );
  expect(mission.hasAttribute("aria-current")).toBe(false);

  navigation.pathname = "/workers/42";
  rerender(publicNavbar());
  await waitFor(() =>
    expect(deployments.getAttribute("aria-current")).toBe("true"),
  );

  // A sibling path that only starts with the same letters is another page.
  navigation.pathname = "/aboutness";
  rerender(publicNavbar());
  await waitFor(() =>
    expect(deployments.hasAttribute("aria-current")).toBe(false),
  );
  expect(mission.hasAttribute("aria-current")).toBe(false);
});

// The public routes prerender their navbar; a pathname read there is request
// data for every route with a dynamic param (static-shell-contract.test.ts).
it("reads no URL on the server and marks the current page once hydrated", async () => {
  navigation.pathname = "/workers";
  const html = renderToString(publicNavbar());
  expect(navigation.reads).toBe(0);
  expect(html).not.toContain("aria-current");

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const serverLink = within(container).getByRole("link", {
    name: "Deployments",
  });
  const errors: unknown[] = [];
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  await act(async () => {
    root = hydrateRoot(container, publicNavbar(), {
      onRecoverableError: (error) => errors.push(error),
    });
  });

  expect(errors).toEqual([]);
  expect(
    consoleError.mock.calls
      .map((args) => args.join(" "))
      .filter((message) =>
        /hydrated|hydration|server rendered|didn't match/i.test(message),
      ),
  ).toEqual([]);
  const link = within(container).getByRole("link", { name: "Deployments" });
  expect(link).toBe(serverLink);
  expect(link.getAttribute("aria-current")).toBe("page");
});
