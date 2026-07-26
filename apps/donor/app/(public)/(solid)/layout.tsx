import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Routes that open with ordinary content, so the navbar is opaque from the
 * first paint. See `(public)/layout.tsx` for why the variant is a static prop.
 */
export default function SolidPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="solid" />
      {children}
    </>
  );
}
