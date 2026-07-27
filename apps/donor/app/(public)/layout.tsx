import { Footer } from "@asym/ui/components/public/footer";

/**
 * The navbar lives in the `(hero)` and `(solid)` sibling groups, not here: its
 * variant used to come from `usePathname()`, and URL data cannot live in a
 * layout's shared App Shell. A `<Suspense>` fallback does not help — the
 * fallback is what lands in the shell, so it bakes one variant into every route.
 * Footer stays because it reads nothing from the URL.
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
