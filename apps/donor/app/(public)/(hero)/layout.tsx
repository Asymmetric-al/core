import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Public routes whose first screen is full-bleed artwork: the navbar starts
 * transparent and solidifies on scroll. These are the routes that used to match
 * the navbar's `HERO_PAGES` list; see {@link NavbarVariant} for why the variant
 * is a static prop rather than a `usePathname()` lookup.
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
