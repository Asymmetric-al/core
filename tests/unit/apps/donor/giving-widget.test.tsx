// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

type GivingWidgetComponent =
  (typeof import("../../../../apps/donor/app/(public)/(solid)/workers/[id]/giving-widget"))["GivingWidget"]; // eslint-disable-line @typescript-eslint/consistent-type-imports -- Defer the app import until boundary mocks are registered.

let GivingWidget: GivingWidgetComponent;

beforeAll(async () => {
  const module =
    await import("../../../../apps/donor/app/(public)/(solid)/workers/[id]/giving-widget");
  GivingWidget = module.GivingWidget;
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const renderWidget = () =>
  render(
    <GivingWidget
      missionaryId="20000000-0000-0000-0000-000000000001"
      workerId="worker_1"
      raised={50}
      goal={1000}
      percentRaised={5}
    />,
  );

describe("GivingWidget preset selection", () => {
  it("updates the donation checkout amount with arrow-key selection", async () => {
    renderWidget();
    const current = screen.getByRole("radio", { name: "$100" });
    act(() => current.focus());
    fireEvent.keyDown(current, { key: "ArrowRight" });
    const next = screen.getByRole("radio", { name: "$200" });
    await waitFor(() => expect(next.getAttribute("aria-checked")).toBe("true"));
    expect(document.activeElement).toBe(next);
    expect(
      screen.getAllByRole("radio").filter((item) => item.tabIndex === 0),
    ).toEqual([next]);
    const checkout = screen.getByRole("link", { name: /Give/ });
    expect(
      new URL(
        checkout.getAttribute("href")!,
        "https://example.com",
      ).searchParams.get("amount"),
    ).toBe("200");
  });

  it("clears a custom amount when returning to a preset", () => {
    renderWidget();
    const custom = screen.getByLabelText("Custom donation amount");
    fireEvent.change(custom, { target: { value: "123.45" } });
    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "$50" }));
    expect(
      screen.getByRole("radio", { name: "$50", checked: true }),
    ).toBeTruthy();
    expect((custom as HTMLInputElement).value).toBe("");
    const checkout = screen.getByRole("link", { name: /Give/ });
    expect(
      new URL(
        checkout.getAttribute("href")!,
        "https://example.com",
      ).searchParams.get("amount"),
    ).toBe("50");
  });
});
