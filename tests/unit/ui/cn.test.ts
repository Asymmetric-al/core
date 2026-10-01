import { cn, type ClassValue } from "@asym/ui/lib/utils";
import { describe, expect, it } from "vitest";

describe("shared cn input contract", () => {
  it("returns an empty string for absent and disabled classes", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined, "", 0, 0n, Number.NaN, true)).toBe("");
  });

  it("accepts the exported ClassValue type and flattens nested conditional inputs", () => {
    const classes: ClassValue[] = [
      "p-2",
      ["text-sm", [null, { "bg-card": true, hidden: false }, "p-4"]],
      { "text-foreground": 1, "opacity-0": 0 },
      7,
      -2,
    ];

    expect(cn(...classes)).toBe("text-sm bg-card p-4 text-foreground 7 -2");
  });

  it("preserves application classes and their order", () => {
    expect(cn("core-layout", "group", "core-layout", "peer")).toBe(
      "core-layout group core-layout peer",
    );
  });

  it("re-evaluates reused objects when condition values change", () => {
    const classes = { "bg-card": true, "bg-muted": false };
    expect(cn("bg-background", classes)).toBe("bg-card");

    classes["bg-card"] = false;
    classes["bg-muted"] = true;
    expect(cn("bg-background", classes)).toBe("bg-muted");
  });

  it("re-evaluates nested arrays after their contents change", () => {
    const nested: ClassValue[] = ["p-2"];
    const classes: ClassValue[] = [nested, { "text-foreground": true }];
    expect(cn(classes)).toBe("p-2 text-foreground");

    nested.push("p-4");
    expect(cn(classes)).toBe("p-4 text-foreground");
  });
});

describe("shared cn Tailwind conflict contract", () => {
  it.each([
    {
      name: "preserves vertical padding when a horizontal override replaces side padding",
      inputs: ["p-6 px-2 pl-1", "px-4"],
      expected: "p-6 px-4",
    },
    {
      name: "allows a later shorthand to replace axis and side padding",
      inputs: ["p-6 px-2 pl-1", "p-4"],
      expected: "p-4",
    },
    {
      name: "resolves responsive and hover variants independently",
      inputs: ["p-2 sm:p-4 hover:p-3", "sm:p-6 hover:p-5"],
      expected: "p-2 sm:p-6 hover:p-5",
    },
    {
      name: "recognizes equivalent modifier ordering",
      inputs: ["hover:focus:bg-card", "focus:hover:bg-muted"],
      expected: "focus:hover:bg-muted",
    },
    {
      name: "preserves order-sensitive child modifiers",
      inputs: ["*:hover:text-primary", "hover:*:text-destructive"],
      expected: "*:hover:text-primary hover:*:text-destructive",
    },
    {
      name: "keeps important declarations separate from normal declarations",
      inputs: ["p-2 !p-4", "p-6 !p-8"],
      expected: "p-6 !p-8",
    },
    {
      name: "supports Tailwind 4 important suffixes",
      inputs: ["p-2 p-4!", "p-6 p-8!"],
      expected: "p-6 p-8!",
    },
    {
      name: "distinguishes arbitrary font sizes from arbitrary colors",
      inputs: [
        "text-[length:var(--size)] text-[color:var(--color)]",
        "text-sm text-foreground",
      ],
      expected: "text-sm text-foreground",
    },
    {
      name: "resolves arbitrary values and CSS-variable shorthand widths",
      inputs: ["w-[calc(100%-2rem)] w-(--sidebar-width)", "w-64"],
      expected: "w-64",
    },
    {
      name: "resolves duplicate arbitrary CSS properties",
      inputs: ["[mask-type:luminance]", "[mask-type:alpha]"],
      expected: "[mask-type:alpha]",
    },
    {
      name: "resolves matching arbitrary variants without combining different selectors",
      inputs: ["[&>svg]:size-3", "[&>svg]:size-5 [&_svg]:size-4"],
      expected: "[&>svg]:size-5 [&_svg]:size-4",
    },
    {
      name: "resolves Base UI state overrides independently",
      inputs: ["data-open:bg-muted data-closed:bg-card", "data-open:bg-accent"],
      expected: "data-closed:bg-card data-open:bg-accent",
    },
    {
      name: "separates semantic colors from font sizes and border and ring widths",
      inputs: [
        "bg-background text-sm text-muted-foreground border border-border ring-2 ring-ring",
        "bg-card text-foreground",
      ],
      expected:
        "text-sm border border-border ring-2 ring-ring bg-card text-foreground",
    },
    {
      name: "preserves Core motion utilities and animation-plugin classes",
      inputs: [
        "press-feedback hover-scale-subtle transition-[color,box-shadow]",
        "animate-in fade-in-0 zoom-in-95",
      ],
      expected:
        "press-feedback hover-scale-subtle transition-[color,box-shadow] animate-in fade-in-0 zoom-in-95",
    },
  ])("$name", ({ inputs, expected }) => {
    expect(cn(...inputs)).toBe(expected);
  });
});

describe("background image and color independence", () => {
  it("preserves a semantic background color behind a legacy gradient", () => {
    expect(cn("bg-background", "bg-gradient-to-r")).toBe(
      "bg-background bg-gradient-to-r",
    );
  });

  it("lets a modern gradient replace the legacy background image", () => {
    expect(cn("bg-gradient-to-r", "bg-linear-to-r")).toBe("bg-linear-to-r");
  });
});
