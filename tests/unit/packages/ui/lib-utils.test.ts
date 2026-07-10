import { describe, expect, it } from "vitest";

import { cn, type ClassValue } from "../../../../packages/ui/lib/utils";

describe("packages/ui cn helper", () => {
  it("keeps the standard cn variadic API while merging Tailwind conflicts", () => {
    const conditionalClasses: ClassValue = {
      "text-red-500": true,
      hidden: false,
    };

    expect(
      cn(
        "px-2 py-1 text-sm",
        ["px-4", conditionalClasses],
        false && "opacity-50",
      ),
    ).toBe("py-1 text-sm px-4 text-red-500");
  });

  it("exports ClassValue for the shapes accepted by the shared helper", () => {
    const values = [
      "flex px-2",
      ["px-4", { "items-center": true }],
      null,
      undefined,
      false,
    ] satisfies ClassValue[];

    expect(cn(values)).toBe("flex px-4 items-center");
  });
});
