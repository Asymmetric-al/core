import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * Boundary for the per-request recovery session read in `page.tsx`. The root
 * layout has no Suspense boundary, so without this file the read would block
 * the route instead of streaming behind a skeleton.
 */
export default function ResetPasswordLoading() {
  return <AuthScreenSkeleton label="Loading password reset" />;
}
