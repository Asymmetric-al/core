/** @vitest-environment jsdom */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

const workspace = vi.hoisted(() => ({ role: "admin" as string }));

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ role: workspace.role }),
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
    await import("../../../../../apps/admin/app/(app)/admin/page-client")
  ).default;
}, 20_000);

afterEach(() => {
  cleanup();
  workspace.role = "admin";
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
    expect(routeExists(href), href).toBe(true);
  }
  expect(
    screen.getByRole("link", { name: /staff directory/i }).getAttribute("href"),
  ).toBe("/admin/teams");
  expect(screen.getByRole("link", { name: /^eve/i }).getAttribute("href")).toBe(
    "/admin/eve",
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

it("lists Eve and the staff directory only for roles their pages admit", () => {
  workspace.role = "finance";
  render(<AdminPage />);
  expect(screen.queryByRole("link", { name: /^eve/i })).toBeNull();
  // The account directory is read through an admin-only endpoint.
  expect(screen.queryByRole("link", { name: /staff directory/i })).toBeNull();
  expect(screen.getByRole("link", { name: /email delivery/i })).toBeTruthy();
});

it("sets the sections side by side on wide screens instead of one narrow column", () => {
  render(<AdminPage />);
  const people = screen.getByRole("region", { name: "People and access" });
  const layout = people.parentElement!.className.split(" ");
  expect(layout).toContain("xl:grid-cols-2");
  // Narrower screens keep a readable single column.
  expect(layout).toContain("max-xl:max-w-3xl");
});
