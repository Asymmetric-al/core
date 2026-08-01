import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * `/register` had no loading file, so its blocking session read
 * (`requireAnonymousVisitor` in `page.tsx`) fell through to the root layout's
 * `<Suspense fallback={null}>` and the route committed blank -- unlike its
 * `/login` sibling, which has had a skeleton all along.
 */
export default function RegisterLoading() {
  return <AuthScreenSkeleton label="Loading registration" />;
}
