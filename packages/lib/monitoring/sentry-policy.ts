import type { init } from "@sentry/nextjs";

type SentryOptions = Parameters<typeof init>[0];

/** Preserve v10 collection and trace behavior while the SDK runs on v11. */
export function getSentryCompatibilityOptions() {
  const sensitiveKeys = ["forwarded", "-ip", "remote-", "via", "-user"];

  return {
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: [...sensitiveKeys] },
        response: { deny: [...sensitiveKeys] },
      },
      httpBodies: [],
      urlQueryParams: { deny: [...sensitiveKeys] },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      graphQL: { document: false, variables: false },
      frameContextLines: 7,
    },
    // Scope tags still apply to transactions in this supported compatibility mode.
    traceLifecycle: "static" as const,
    attachStacktrace: false,
    // No profiling integration was installed in v10. Keep profiling disabled.
    profileSessionSampleRate: 0,
    profileLifecycle: "trace" as const,
  } satisfies SentryOptions;
}
