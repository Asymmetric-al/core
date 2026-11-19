import { describe, expect, it } from "vitest";

import {
  PASSWORD_RECOVERY_WINDOW_SECONDS,
  passwordRecoveryRedirectUrl,
  passwordRecoverySecondsLeft,
} from "../../../packages/auth/password-recovery";

const NOW = 1_800_000_000;

// That the proxies serve every recovery step, and nothing wider, is tested
// through the proxies themselves: password-recovery-proxies.test.ts.
describe("password recovery addresses", () => {
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
      passwordRecoverySecondsLeft(
        [{ method: "recovery", timestamp: NOW - 60 }],
        NOW,
      ),
    ).toBe(PASSWORD_RECOVERY_WINDOW_SECONDS - 60);
    expect(
      passwordRecoverySecondsLeft(
        [
          { method: "password", timestamp: NOW - 7200 },
          {
            method: "recovery",
            timestamp: NOW - PASSWORD_RECOVERY_WINDOW_SECONDS,
          },
        ],
        NOW,
      ),
    ).toBe(0);
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
    expect(passwordRecoverySecondsLeft(amr, NOW)).toBeNull();
  });
});

describe("time left to choose the new password (council round 2, B2)", () => {
  it("counts from the latest recovery within the window", () => {
    expect(
      passwordRecoverySecondsLeft(
        [
          { method: "recovery", timestamp: NOW - 1800 },
          { method: "password", timestamp: NOW - 10 },
          { method: "recovery", timestamp: NOW - 60 },
        ],
        NOW,
      ),
    ).toBe(PASSWORD_RECOVERY_WINDOW_SECONDS - 60);
  });

  it("never gives more than the window, even for a timestamp a little ahead", () => {
    expect(
      passwordRecoverySecondsLeft(
        [{ method: "recovery", timestamp: NOW + 30 }],
        NOW,
      ),
    ).toBe(PASSWORD_RECOVERY_WINDOW_SECONDS);
  });

  it("gives nothing for a session that recovery did not create within the window", () => {
    expect(
      passwordRecoverySecondsLeft(
        [
          {
            method: "recovery",
            timestamp: NOW - PASSWORD_RECOVERY_WINDOW_SECONDS - 1,
          },
        ],
        NOW,
      ),
    ).toBeNull();
    expect(
      passwordRecoverySecondsLeft(
        [{ method: "password", timestamp: NOW }],
        NOW,
      ),
    ).toBeNull();
  });
});
