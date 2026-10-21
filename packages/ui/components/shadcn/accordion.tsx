"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { mergeBaseUIClassName } from "../../lib/base-ui";

import type * as React from "react";

function Accordion({ ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "border-b last:border-b-0",
      card: "border last:border-b rounded-2xl px-6 overflow-hidden transition-colors duration-(--duration-standard) border-border bg-card data-open:border-ring data-open:bg-accent data-open:shadow-sm",
    },
  },
  defaultVariants: { variant: "default" },
});

function AccordionItem({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Item.Props & VariantProps<typeof accordionItemVariants>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={mergeBaseUIClassName(
        accordionItemVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={mergeBaseUIClassName(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-colors outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-panel-open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContentLayout({
  panelProps,
  state,
  render,
  className,
  children,
  variant,
}: {
  panelProps: React.ComponentPropsWithRef<"div">;
  state: AccordionPrimitive.Panel.State;
  render: AccordionPrimitive.Panel.Props["render"];
  className: AccordionPrimitive.Panel.Props["className"];
  children: React.ReactNode;
  variant: "default" | "faq";
}) {
  const contentClassName = mergeBaseUIClassName(
    variant === "faq"
      ? "pt-0 pb-6 text-muted-foreground leading-relaxed font-light"
      : "pt-0 pb-4",
    className,
  );
  return useRender({
    defaultTagName: "div",
    render,
    ref: panelProps.ref,
    state: { ...state },
    props: {
      ...panelProps,
      children: (
        <div
          className={
            typeof contentClassName === "function"
              ? contentClassName(state)
              : contentClassName
          }
        >
          {children}
        </div>
      ),
    },
  });
}

function AccordionContent({
  className,
  children,
  render,
  variant = "default",
  animation = "height",
  ...props
}: AccordionPrimitive.Panel.Props & {
  variant?: "default" | "faq";
  animation?: "height" | "none";
}) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={
        animation === "none"
          ? "overflow-hidden text-sm"
          : "overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      }
      {...props}
      render={(panelProps, state) => (
        <AccordionContentLayout
          panelProps={panelProps}
          state={state}
          render={render}
          className={className}
          variant={variant}
        >
          {children}
        </AccordionContentLayout>
      )}
    />
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
