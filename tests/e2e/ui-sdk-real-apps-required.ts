import { test } from "@playwright/test";

/**
 * In CI, or with `UI_SDK_REAL_APPS_REQUIRED=1`, the UI SDK real-app specs
 * need their servers: a server that is not running, or a demo role that is
 * not configured, fails the block instead of skipping it, so a gate never
 * passes by testing nothing. Locally, without either, the block is skipped
 * with the reason.
 */
export const REAL_APP_SERVERS_REQUIRED =
  Boolean(process.env.CI) || process.env.UI_SDK_REAL_APPS_REQUIRED === "1";

export function skipUnlessRequired(condition: boolean, reason: string) {
  if (!condition) return;
  if (REAL_APP_SERVERS_REQUIRED) {
    throw new Error(
      `${reason} The UI SDK real-app specs require their servers here (CI or UI_SDK_REAL_APPS_REQUIRED=1).`,
    );
  }
  test.skip(true, reason);
}
