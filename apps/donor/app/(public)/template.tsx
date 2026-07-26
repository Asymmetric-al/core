import { RouteMainViewTransitionTemplate } from "@asym/ui/components/view-transitions";

/**
 * The route view-transition wrapper lives here rather than in `layout.tsx` so
 * that it does not read `usePathname()` above `{children}`. See
 * `RouteMainViewTransitionTemplate` for why that read kept every dynamic route
 * in this group out of the static shell.
 */
export default function PublicTemplate({
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
