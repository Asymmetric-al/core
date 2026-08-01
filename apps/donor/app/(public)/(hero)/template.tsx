import { RouteMainViewTransitionTemplate } from "@asym/ui/components/view-transitions";

/**
 * Do NOT hoist this to `(public)/template.tsx`: that sits above the group
 * layouts and would drag the fixed navbar into the transition layer.
 */
export default function HeroPublicTemplate({
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
