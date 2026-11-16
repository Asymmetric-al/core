// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RouteError from "../../../../apps/admin/app/(app)/error";
import RouteNotFound from "../../../../apps/admin/app/(app)/not-found";

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException }));
afterEach(cleanup);

describe("in-shell route recovery", () => {
  it("reports the exception but shows only its support reference and retries", () => {
    const error = Object.assign(new Error("private database detail"), {
      digest: "ref-123",
    });
    const retry = vi.fn();
    render(<RouteError error={error} retry={retry} />);
    expect(captureException).toHaveBeenCalledWith(error);
    expect(screen.getByRole("alert").textContent).toContain(
      "This page couldn't load",
    );
    expect(screen.getByText("Reference: ref-123")).toBeTruthy();
    expect(screen.queryByText(/private database detail/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("link", { name: "Back to Home" }).getAttribute("href"),
    ).toBe("/");
    expect(document.querySelectorAll("html")).toHaveLength(1);
  });

  it("offers a Home destination for a missing nested page", () => {
    render(<RouteNotFound />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to Home" }).getAttribute("href"),
    ).toBe("/");
  });
});
