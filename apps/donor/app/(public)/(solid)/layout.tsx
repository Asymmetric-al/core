import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Public routes that open on ordinary content rather than full-bleed artwork:
 * the navbar is opaque from first paint, so the scroll listener never attaches.
 * See `../(hero)/layout.tsx` for why the variant is a static prop.
 */
export default function SolidPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="solid" />
      {/* Target of the navbar's "Skip to main content" link on every public
          route; pages keep their own <main> landmark inside. */}
      <div id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </div>
    </>
  );
}
