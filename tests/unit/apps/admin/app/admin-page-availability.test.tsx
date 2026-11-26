/** @vitest-environment jsdom */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

const workspace = vi.hoisted(() => ({
  role: "admin" as string,
  capabilities: [] as string[],
}));

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ role: workspace.role, capabilities: workspace.capabilities }),
}));

import type { ComponentType } from "react";

let AdminPage: ComponentType;

const ADMIN_APP = join(__dirname, "../../../../../apps/admin/app");

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }),
  });
  AdminPage = (
    await import("../../../../../apps/admin/app/(app)/settings/page-client")
  ).default;
}, 20_000);

afterEach(() => {
  cleanup();
  workspace.role = "admin";
  workspace.capabilities = [];
});

/** The admin page file an href renders, Web Studio's catch-all included. */
function routeExists(href: string) {
  if (href.startsWith("/web-studio")) {
    return existsSync(
      join(ADMIN_APP, "(payload)/web-studio/[[...segments]]/page.tsx"),
    );
  }
  return existsSync(join(ADMIN_APP, "(app)", href.slice(1), "page.tsx"));
}

it("links only to administration pages that exist", () => {
  render(<AdminPage />);
  const links = screen.getAllByRole("link");
  expect(links.length).toBeGreaterThanOrEqual(4);
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    expect(href.startsWith("/mc/"), href).toBe(false);
    expect(href === "/admin" || href.startsWith("/admin/"), href).toBe(false);
    expect(routeExists(href), href).toBe(true);
  }
  expect(
    screen.getByRole("link", { name: /^members/i }).getAttribute("href"),
  ).toBe("/settings/teams");
  expect(screen.getByRole("link", { name: /^eve/i }).getAttribute("href")).toBe(
    "/settings/eve",
  );
  expect(
    screen.getByRole("link", { name: /email delivery/i }).getAttribute("href"),
  ).toBe("/settings/integrations/resend");
});

it("shows no unavailable controls or invented service health", () => {
  render(<AdminPage />);
  expect(screen.queryByRole("button", { name: "Audit Logs" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Security Scan" })).toBeNull();
  expect(screen.queryByText("Operational")).toBeNull();
  expect(screen.queryByText(/Postmark/)).toBeNull();
});

it("lists Eve only for admins while offering Members read-only to all live staff", () => {
  workspace.role = "finance";
  render(<AdminPage />);
  expect(screen.queryByRole("link", { name: /^eve/i })).toBeNull();
  expect(
    screen.getByRole("link", { name: /^members/i }).getAttribute("href"),
  ).toBe("/settings/teams");
  expect(screen.getByRole("link", { name: /email delivery/i })).toBeTruthy();
});

it("lists Sites under Public identity only for an assignment that holds sites.manage (AL-2676 WP3b part 3)", () => {
  workspace.capabilities = ["admin.dashboard.access", "sites.manage"];
  render(<AdminPage />);
  const identity = screen.getByRole("region", { name: "Public identity" });
  const link = within(identity).getByRole("link", { name: /^sites/i });
  expect(link.getAttribute("href")).toBe("/settings/sites");
  expect(routeExists("/settings/sites")).toBe(true);
  cleanup();

  workspace.capabilities = ["admin.dashboard.access"];
  render(<AdminPage />);
  expect(screen.queryByRole("region", { name: "Public identity" })).toBeNull();
  expect(screen.queryByRole("link", { name: /^sites/i })).toBeNull();
  cleanup();

  workspace.role = "finance";
  workspace.capabilities = [];
  render(<AdminPage />);
  expect(screen.queryByRole("link", { name: /^sites/i })).toBeNull();
});

it("sets the sections side by side on wide screens instead of one narrow column", () => {
  render(<AdminPage />);
  const people = screen.getByRole("region", { name: "People and access" });
  const layout = people.parentElement!.className.split(" ");
  expect(layout).toContain("xl:grid-cols-2");
  // Narrower screens keep a readable single column.
  expect(layout).toContain("max-xl:max-w-3xl");
});
