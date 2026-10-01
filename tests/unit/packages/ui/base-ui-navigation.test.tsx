// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Header from "../../../../packages/ui/components/shadcn-studio/blocks/hero-section-09/header";

vi.mock(
  "../../../../packages/ui/components/shadcn-studio/blocks/menu-navigation",
  () => ({ default: () => null }),
);
vi.mock(
  "../../../../packages/ui/components/shadcn-studio/blocks/menu-dropdown",
  () => ({ default: () => null }),
);
afterEach(cleanup);

describe("styled navigation links", () => {
  it("keeps the hero sign-in destination as a native link without button-only attributes", () => {
    render(<Header navigationData={[]} />);
    const signIn = screen.getByRole("link", { name: "Sign In" });
    expect(signIn.getAttribute("href")).toBe("/");
    expect(signIn.getAttribute("type")).toBeNull();
    expect(signIn.getAttribute("role")).toBeNull();
    expect(signIn.classList.contains("press-feedback")).toBe(true);
    signIn.focus();
    expect(document.activeElement).toBe(signIn);
    expect(fireEvent.keyDown(signIn, { key: " " })).toBe(true);
  });
});
