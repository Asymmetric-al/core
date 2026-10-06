/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

import type { ComponentType } from "react";

let AdminPage: ComponentType;

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
  vi.restoreAllMocks();
});

function describedText(control: HTMLElement) {
  const ids = control.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

it("marks Audit Logs unavailable with an accessible explanation and no action", () => {
  const openWindow = vi.spyOn(window, "open").mockImplementation(() => null);
  const request = vi.spyOn(globalThis, "fetch");
  render(<AdminPage />);

  const control = screen.getByRole("button", { name: "Audit Logs" });
  expect(control.tagName).toBe("BUTTON");
  expect(control.hasAttribute("disabled")).toBe(true);
  expect(describedText(control)).toMatch(/audit logs.*not available/i);
  expect(screen.getByText(/audit logs.*not available/i)).toBeTruthy();
  fireEvent.click(control);
  fireEvent.keyDown(control, { key: "Enter" });
  fireEvent.keyUp(control, { key: "Enter" });
  expect(openWindow).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
  expect(window.location.pathname).toBe("/");

  expect(
    screen
      .getByRole("link", { name: /security settings/i })
      .getAttribute("href"),
  ).toBe("/mc/admin/security");
  expect(
    screen.getByRole("link", { name: /view eve status/i }).getAttribute("href"),
  ).toBe("/mc/admin/eve");
});

it("marks Security Scan unavailable with the same accessible explanation and no action", () => {
  const openWindow = vi.spyOn(window, "open").mockImplementation(() => null);
  const request = vi.spyOn(globalThis, "fetch");
  render(<AdminPage />);

  const control = screen.getByRole("button", { name: "Security Scan" });
  const audit = screen.getByRole("button", { name: "Audit Logs" });
  expect(control.tagName).toBe("BUTTON");
  expect(control.hasAttribute("disabled")).toBe(true);
  expect(describedText(control)).toBe(
    "Audit logs and security scans are not available from this page.",
  );
  expect(control.getAttribute("aria-describedby")).toBe(
    audit.getAttribute("aria-describedby"),
  );
  fireEvent.click(control);
  fireEvent.keyDown(control, { key: " " });
  fireEvent.keyUp(control, { key: " " });
  expect(openWindow).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
  expect(window.location.pathname).toBe("/");
});
