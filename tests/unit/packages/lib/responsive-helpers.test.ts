import { describe, expect, it } from "vitest";

import {
  BREAKPOINTS,
  clamp,
  fluidSize,
  getBreakpoint,
  getResponsiveValue,
  isBreakpoint,
} from "../../../../packages/lib/responsive";

describe("responsive helpers", () => {
  it("isBreakpoint compares width to breakpoint minima", () => {
    expect(isBreakpoint(639, "sm")).toBe(false);
    expect(isBreakpoint(640, "sm")).toBe(true);
    expect(isBreakpoint(1535, "2xl")).toBe(false);
    expect(isBreakpoint(1536, "2xl")).toBe(true);
  });

  it("getBreakpoint returns the largest matching bucket or xs", () => {
    expect(getBreakpoint(400)).toBe("xs");
    expect(getBreakpoint(640)).toBe("sm");
    expect(getBreakpoint(1024)).toBe("lg");
    expect(getBreakpoint(2000)).toBe("2xl");
  });

  it("clamp emits a CSS clamp() string", () => {
    expect(clamp(10, "5vw", 100)).toBe("clamp(10px, 5vw, 100px)");
  });

  it("fluidSize computes a linear fluid clamp between viewports", () => {
    expect(fluidSize(16, 32, 320, 640)).toBe(
      "clamp(16px, 0.0000px + 5.0000vw, 32px)",
    );
  });

  it("getResponsiveValue picks mobile/tablet/desktop by breakpoint", () => {
    const v = { mobile: "a", tablet: "b", desktop: "c" };
    expect(getResponsiveValue(v, "xs")).toBe("a");
    expect(getResponsiveValue(v, "sm")).toBe("a");
    expect(getResponsiveValue(v, "md")).toBe("b");
    expect(getResponsiveValue(v, "lg")).toBe("c");
    expect(getResponsiveValue(v, "2xl")).toBe("c");
  });

  it("BREAKPOINTS stay aligned with getBreakpoint thresholds", () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(getBreakpoint(BREAKPOINTS.sm)).toBe("sm");
  });
});
