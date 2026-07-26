import { Footer } from "@asym/ui/components/public/footer";

/**
 * The navbar is deliberately NOT here. Its hero/solid variant used to come from
 * `usePathname()`, which is URL data: a layout's prefetched App Shell is shared
 * by every route beneath it, so a URL-derived value cannot live in it and the
 * whole navigation dropped out of the shell on every route.
 *
 * A `<Suspense>` boundary does not fix that either — the fallback is what lands
 * in the shell, so one static fallback bakes a single variant into all routes
 * (measured: the solid bar in the App Shell of all six hero routes, flashing to
 * transparent on arrival).
 *
 * Instead the sibling route groups `(hero)` and `(solid)` each render the
 * navbar with a statically known `variant`, so every route prerenders the
 * correct bar. Footer is shared because it reads nothing from the URL.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
