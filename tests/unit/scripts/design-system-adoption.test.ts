import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { describe, expect, it } from "vitest";

describe("existing Button sizes replace redundant consumer overrides", () => {
  it("preserves compact icon geometry through the existing icon-sm API", () => {
    const colors =
      "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10";
    expect(
      cn(
        buttonVariants({
          variant: "ghost",
          size: "icon",
          className: `size-8 ${colors}`,
        }),
      ),
    ).toBe(
      cn(
        buttonVariants({
          variant: "ghost",
          size: "icon-sm",
          className: colors,
        }),
      ),
    );
  });

  it("preserves small-button geometry without repeating its h-8 class", () => {
    const colors =
      "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10";
    expect(
      cn(
        buttonVariants({
          variant: "ghost",
          size: "sm",
          className: `h-8 ${colors}`,
        }),
      )
        .split(" ")
        .sort(),
    ).toEqual(
      cn(buttonVariants({ variant: "ghost", size: "sm", className: colors }))
        .split(" ")
        .sort(),
    );
  });
});
