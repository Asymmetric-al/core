import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * Boundary for the per-request recovery session read in `page.tsx`. A person
 * arrives here by a client navigation from the request step, when the group's
 * `loading.tsx` is already revealed, so without this file the read would
 * block the navigation instead of streaming behind a skeleton.
 */
export default function ResetPasswordLoading() {
  return <AuthScreenSkeleton label="Loading password reset" />;
}
