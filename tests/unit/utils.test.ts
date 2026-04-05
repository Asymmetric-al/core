import { formatCurrency, getInitials } from "@asym/lib/utils";
import { cn } from "@asym/ui/lib/utils";
import { describe, expect, it } from "vitest";

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
