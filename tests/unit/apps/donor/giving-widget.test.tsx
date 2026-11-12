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

  it("restores the last preset when a custom amount is cleared", () => {
    renderWidget();
    const custom = screen.getByLabelText("Custom donation amount");
    fireEvent.change(custom, { target: { value: "37" } });
    expect(screen.getByRole("link", { name: "Give $37.00" })).toBeTruthy();
    fireEvent.change(custom, { target: { value: "" } });
    // The visible inputs and the money CTA must agree: no stale $37 link.
    expect(
      screen.getByRole("radio", { name: "$100", checked: true }),
    ).toBeTruthy();
    const checkout = screen.getByRole("link", { name: "Give $100.00" });
    expect(
      new URL(
        checkout.getAttribute("href")!,
        "https://example.com",
      ).searchParams.get("amount"),
    ).toBe("100");
  });

  it("treats an incomplete amount like an empty one", () => {
    renderWidget();
    const custom = screen.getByLabelText("Custom donation amount");
    fireEvent.change(custom, { target: { value: "37" } });
    fireEvent.change(custom, { target: { value: "." } });
    expect(screen.queryByRole("link", { name: "Give $37.00" })).toBeNull();
    expect(screen.getByRole("link", { name: "Give $100.00" })).toBeTruthy();
  });

  it("does not offer a checkout link for a zero amount", () => {
    renderWidget();
    fireEvent.change(screen.getByLabelText("Custom donation amount"), {
      target: { value: "0" },
    });
    expect(screen.queryByRole("link", { name: /Give/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Enter an amount above $0" }),
    ).toBeTruthy();
  });

  // Worker profiles use static demo funding figures; label them beside the
  // progress bar so they never read as live totals next to the Give button.
  it("labels sample funding progress as sample figures", () => {
    render(
      <GivingWidget
        missionaryId="20000000-0000-0000-0000-000000000001"
        workerId="worker_1"
        raised={50}
        goal={1000}
        percentRaised={5}
        sampleFunding
      />,
    );
    expect(screen.getByText("Sample figures")).toBeTruthy();
    expect(
      screen.getByRole("meter", {
        name: "Sample figures: 5% of funding goal reached",
      }),
    ).toBeTruthy();
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
