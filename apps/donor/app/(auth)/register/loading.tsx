import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * Boundary for the blocking session read (`requireAnonymousVisitor` in
 * `page.tsx`). The root layout has no Suspense boundary, so without this file
 * the read has nothing to stream behind and the route cannot show a skeleton.
 */
export default function RegisterLoading() {
  return <AuthScreenSkeleton label="Loading registration" />;
}
