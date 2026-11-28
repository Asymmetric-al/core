import { isProductionDeployment } from "@asym/env/target-env";
import { Inngest } from "inngest";

/**
 * One Inngest app for the whole platform. Tenants are product boundaries and
 * are identified inside event envelopes, never by separate Inngest apps,
 * environments, or billing accounts.
 *
 * Runtime configuration comes from environment variables read by the SDK:
 * INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, INNGEST_SIGNING_KEY_FALLBACK,
 * INNGEST_DEV (local development only), and INNGEST_BASE_URL. A production
 * deployment is always in cloud mode, whatever INNGEST_DEV says.
 */
export const inngest = new Inngest({
  id: "asym-core-workflows",
  ...(isProductionDeployment({
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
  })
    ? { isDev: false }
    : {}),
});
