// Payload exports Link; App Router hooks are not re-exported by @payloadcms/ui.
export { Link } from "@payloadcms/ui";
// Web Studio is outside the tenant segment; its router and pathname are the
// tenant helpers, which act as the Next.js originals here and load a new
// document for an address in Mission Control (AL-2675; council round 1, A10).
export {
  useRoutePathname as usePathname,
  useTenantRouter as useRouter,
} from "@asym/auth/tenant-navigation";
export { useSearchParams } from "next/navigation";
