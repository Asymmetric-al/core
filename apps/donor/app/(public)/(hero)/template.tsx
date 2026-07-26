import { RouteMainViewTransitionTemplate } from "@asym/ui/components/view-transitions";

/**
 * `template.tsx` renders between this group's `layout.tsx` and its children and
 * does not wrap the layout of its own segment, so the fixed `<Navbar>` stays
 * outside the animated region. Next gives each template instance a fresh key on
 * navigation, which is what replaces the old `key={pathname}` — and removing
 * that `usePathname()` read is what lets these routes prerender a static shell.
 *
 * Do NOT hoist this to `(public)/template.tsx`: that sits above the group
 * layouts and would drag the navbar into the transition layer.
 */
export default function HeroPublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteMainViewTransitionTemplate>
      {children}
    </RouteMainViewTransitionTemplate>
  );
}
