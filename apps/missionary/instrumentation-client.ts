import { getSentryCompatibilityOptions } from "@asym/lib/monitoring/sentry-policy";
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    ...getSentryCompatibilityOptions(),
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserSessionIntegration({ lifecycle: "route" }),
    ],
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
