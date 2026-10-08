import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  // Base: press-feedback (subtle scale on :active) plus a transition
  // list that already covers color/border/box-shadow. Don't add
  // `transition-colors` or `transition-all` here — they would compete
  // with `press-feedback` for the cascade. See docs/ai/skills/anim/SKILL.md.
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap press-feedback outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:cursor-default data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        upload:
          "flex-col gap-2 rounded-full border border-dashed bg-background text-muted-foreground hover:bg-accent data-dragging:border-ring data-dragging:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        "ghost-inverse":
          "text-invert-foreground hover:bg-invert-foreground/10 hover:text-invert-foreground",
        "ghost-inverse-destructive":
          "text-invert-foreground hover:bg-destructive/20 hover:text-invert-foreground",
        inverse:
          "bg-invert-foreground text-invert hover:bg-invert-foreground/90",
        "outline-inverse":
          "border border-invert-foreground/20 bg-invert-foreground/5 text-invert-foreground hover:bg-invert-foreground/10 hover:text-invert-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Maia: hover scale gated for fine pointers via .hover-scale-subtle;
        // press from base .press-feedback. Semantic colors from shadcn audit.
        maia: "rounded-2xl bg-foreground text-background shadow-xl font-semibold tracking-wide hover:bg-foreground/90 hover-scale-subtle",
        "maia-outline":
          "rounded-2xl border border-border bg-background text-muted-foreground shadow-sm font-semibold tracking-wide hover:bg-accent hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md hover-scale-subtle",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        avatar: "size-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
