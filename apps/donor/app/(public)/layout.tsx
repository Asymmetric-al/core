import { Footer } from "@asym/ui/components/public/footer";

/**
 * Chrome shared by every public route.
 *
 * The `<Navbar>` lives in the `(hero)`/`(solid)` group layouts because its
 * transparent-vs-solid variant has to be a static prop — see those files. The
 * route view-transition wrapper lives in each group's `template.tsx` because a
 * template gets its remount key from the framework, which removes the last
 * `usePathname()` read from the prerendered public tree.
 *
 * Keep this layout free of request reads: everything here lands in the static
 * shell of every public route.
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
