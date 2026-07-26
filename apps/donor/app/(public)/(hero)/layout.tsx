import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Public routes whose first screen is full-bleed artwork: the navbar starts
 * transparent and solidifies on scroll.
 *
 * The variant is a static prop, not a `usePathname()` lookup. Under Cache
 * Components a URL read in shared layout chrome is request data and blocks
 * prerendering for any route below it with a dynamic param, and a `<Suspense>`
 * fallback here would be shared by every route below the layout — baking one
 * navbar variant into all of them. Splitting the routes into sibling groups
 * makes the variant statically known instead.
 *
 * `<Navbar>` is deliberately a SIBLING of `template.tsx`, so route transitions
 * animate only the content region and never the fixed bar.
 */
export default function HeroPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="hero" />
      {children}
    </>
  );
}
