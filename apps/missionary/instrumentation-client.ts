import {
  captureAndStripInviteFragment,
  clearPendingInviteFragment,
  getInviteSafeReplayOptions,
  getSentryCompatibilityOptions,
  scrubInviteFragmentFromUrl,
} from "@asym/lib/monitoring/sentry-policy";
import * as Sentry from "@sentry/nextjs";

captureAndStripInviteFragment();

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    ...getSentryCompatibilityOptions(),
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      Sentry.replayIntegration(getInviteSafeReplayOptions()),
      Sentry.browserSessionIntegration({ lifecycle: "route" }),
    ],
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

export const onRouterTransitionStart: typeof Sentry.captureRouterTransitionStart =
  (href, navigationType) => {
    clearPendingInviteFragment(href);
    return Sentry.captureRouterTransitionStart(
      scrubInviteFragmentFromUrl(href),
      navigationType,
    );
  };
