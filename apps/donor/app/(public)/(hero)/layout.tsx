import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Routes whose first screen is full-bleed artwork, so the navbar starts
 * transparent and turns solid on scroll. Passing the variant statically keeps
 * the navbar in each route's prefetched App Shell — see `(public)/layout.tsx`.
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
