import { describe, expect, it } from "vitest";

import {
  PASSWORD_RECOVERY_PATHS,
  PASSWORD_RECOVERY_WINDOW_SECONDS,
  isRecentPasswordRecovery,
  passwordRecoveryRedirectUrl,
} from "../../../packages/auth/password-recovery";

const NOW = 1_800_000_000;

describe("password recovery addresses", () => {
  it("keeps every recovery step under the public forgot-password route", () => {
    // Each app's proxy and the missionary role gate already treat
    // /forgot-password and its descendants as public.
    for (const path of Object.values(PASSWORD_RECOVERY_PATHS)) {
      expect(
        path === "/forgot-password" || path.startsWith("/forgot-password/"),
      ).toBe(true);
    }
  });

  it.each([
    ["http://localhost:3130", "http://localhost:3130/forgot-password/callback"],
    ["http://127.0.0.1:3105", "http://127.0.0.1:3105/forgot-password/callback"],
    [
      "https://give.example.org",
      "https://give.example.org/forgot-password/callback",
    ],
  ])(
    "returns the email link to the host it was asked from: %s",
    (origin, url) => {
      expect(passwordRecoveryRedirectUrl(origin)).toBe(url);
    },
  );
});

describe("recovery session check", () => {
  it("accepts a session the recovery link created within the window", () => {
    expect(
      isRecentPasswordRecovery(
        [{ method: "recovery", timestamp: NOW - 60 }],
        NOW,
      ),
    ).toBe(true);
    expect(
      isRecentPasswordRecovery(
        [
          { method: "password", timestamp: NOW - 7200 },
          {
            method: "recovery",
            timestamp: NOW - PASSWORD_RECOVERY_WINDOW_SECONDS,
          },
        ],
        NOW,
      ),
    ).toBe(true);
  });

  it.each([
    ["a password sign-in", [{ method: "password", timestamp: NOW - 10 }]],
    [
      "a recovery older than the window",
      [
        {
          method: "recovery",
          timestamp: NOW - PASSWORD_RECOVERY_WINDOW_SECONDS - 1,
        },
      ],
    ],
    [
      "a timestamp in the future",
      [{ method: "recovery", timestamp: NOW + 600 }],
    ],
    ["methods without timestamps", ["recovery"]],
    ["no methods", []],
    ["a missing claim", undefined],
    ["a malformed entry", [null, { method: "recovery" }]],
  ])("refuses %s", (_label, amr) => {
    expect(isRecentPasswordRecovery(amr, NOW)).toBe(false);
  });
});
