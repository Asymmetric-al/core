import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("Sentry DSN not configured");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: 0.1,
    debug: process.env.NODE_ENV === "development",
    beforeSend(event, hint) {
      if (event.exception) {
        console.error("Sentry captured exception:", hint.originalException);
      }
      return event;
    },
  });
}

export function setUserContext(userId: string, tenantId: string, role: string) {
  Sentry.setUser({
    id: userId,
  });
  Sentry.setTag("tenant_id", tenantId);
  Sentry.setTag("user_role", role);
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
) {
  Sentry.captureMessage(message, level);
}

export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({ name, op });
}
