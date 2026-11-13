"use client";

import { useRender } from "@base-ui/react/use-render";

import { cn } from "@asym/ui/lib/utils";

import { mergeBaseUIClassName } from "../../lib/base-ui";

import type { ComponentProps } from "react";

/**
 * Section tabs that change the page: a named `<nav>` of links drawn like the
 * shared `TabsList variant="line"` (underline on the current page). Use the
 * Tabs component when the tabs swap panels in place; use NavTabs when each
 * tab is its own route, so screen readers hear links and "current page"
 * rather than a tablist.
 */
function NavTabs({
  className,
  children,
  ...props
}: ComponentProps<"nav"> & { "aria-label": string }) {
  return (
    <nav
      data-slot="nav-tabs"
      // The inset keeps the 3px focus ring inside the scroll box, which
      // would otherwise clip it; the negative margin keeps the alignment.
      className={cn("-m-1 min-w-0 overflow-x-auto", className)}
      {...props}
    >
      <ul className="flex w-fit items-center gap-1 p-1 pb-2.25">{children}</ul>
    </nav>
  );
}

/** The line-tab trigger look, keyed to `data-active` like TabsTrigger. */
const NAV_TABS_LINK_CLASS =
  "relative inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-active:text-foreground dark:text-foreground/70 dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 after:absolute after:inset-x-0 after:-bottom-1.25 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:after:opacity-100";

/**
 * One section link. `active` marks the current page (aria-current="page"
 * and the underline). Pass `render={<Link href=… />}` for client routing.
 */
function NavTabsLink({
  className,
  active = false,
  render,
  ...props
}: useRender.ComponentProps<"a"> & { active?: boolean }) {
  const link = useRender({
    defaultTagName: "a",
    render,
    props: {
      ...props,
      "aria-current": active ? "page" : undefined,
      "data-slot": "nav-tabs-link",
      "data-active": active ? "" : undefined,
      className: mergeBaseUIClassName(NAV_TABS_LINK_CLASS, className),
    },
  });
  return <li className="flex">{link}</li>;
}

export { NavTabs, NavTabsLink };
