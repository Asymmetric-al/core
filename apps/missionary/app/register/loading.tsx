import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * `register/page.tsx` awaits `createClient()` + `getUser()`. With `children`
 * rendered outside the layout's role-gate boundary, this route needs a boundary
 * of its own or it cannot prerender under `cacheComponents`.
 */
export default function Loading() {
  return <AuthScreenSkeleton label="Loading registration" />;
}
