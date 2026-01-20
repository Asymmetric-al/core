import { describe, expect, it } from "vitest";
import { cn, formatCurrency, getInitials } from "../../src/lib/utils";

describe("lib/utils", () => {
  it("merges tailwind classes with precedence", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("formats currency in USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("gets initials from names", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane")).toBe("J");
  });
});
