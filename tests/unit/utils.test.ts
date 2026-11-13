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

  it("keeps initials to the first and last name", () => {
    expect(getInitials("Mary Ann Elizabeth Smith")).toBe("MS");
    expect(getInitials("  ada   lovelace  ")).toBe("AL");
    expect(getInitials("Jean-Luc	Picard")).toBe("JP");
  });

  it("returns an empty string for a blank name", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
  });
});
