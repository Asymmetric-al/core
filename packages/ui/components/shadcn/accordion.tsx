"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { useRender } from "@base-ui/react/use-render";
import { ChevronDownIcon } from "lucide-react";

import { mergeBaseUIClassName } from "../../lib/base-ui";

import type * as React from "react";

function Accordion({ ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={mergeBaseUIClassName("border-b last:border-b-0", className)}
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
}: {
  panelProps: React.ComponentPropsWithRef<"div">;
  state: AccordionPrimitive.Panel.State;
  render: AccordionPrimitive.Panel.Props["render"];
  className: AccordionPrimitive.Panel.Props["className"];
  children: React.ReactNode;
}) {
  const contentClassName = mergeBaseUIClassName("pt-0 pb-4", className);
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
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      {...props}
      render={(panelProps, state) => (
        <AccordionContentLayout
          panelProps={panelProps}
          state={state}
          render={render}
          className={className}
        >
          {children}
        </AccordionContentLayout>
      )}
    />
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
