import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * `page.tsx` reads the recovery session per request. With `children`
 * rendered outside the layout's role-gate boundary, this route needs a
 * boundary of its own or it cannot prerender under `cacheComponents`.
 */
export default function Loading() {
  return <AuthScreenSkeleton label="Loading password reset" />;
}
