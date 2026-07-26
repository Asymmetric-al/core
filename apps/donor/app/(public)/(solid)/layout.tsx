import { Navbar } from "@asym/ui/components/public/navbar";

/**
 * Public routes that open on ordinary content rather than full-bleed artwork:
 * the navbar is opaque from first paint, so the scroll listener never attaches.
 *
 * The variant is a static prop for the same reason as the sibling `(hero)`
 * group — see `../(hero)/layout.tsx`. This group holds every public route with
 * a dynamic param (`[...cmsSlug]`, `sign/[token]`, `workers/[id]`), which is
 * exactly the set that a `usePathname()` read in shared chrome would stop from
 * prerendering a static shell.
 *
 * `<Navbar>` is deliberately a SIBLING of `template.tsx`, so route transitions
 * animate only the content region and never the fixed bar.
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
