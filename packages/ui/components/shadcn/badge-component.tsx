import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@asym/ui/lib/utils";

import { badgeVariants } from "./badge-variants";

import type { VariantProps } from "class-variance-authority";

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<
  "span",
  { slot: string; variant: VariantProps<typeof badgeVariants>["variant"] }
> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge };
