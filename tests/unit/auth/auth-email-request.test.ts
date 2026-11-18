import { AuthApiError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { answerReadsAsSent } from "../../../packages/auth/auth-email-request";

/**
 * Council round 2, B1 (plan 5.4): a screen that asks Supabase Auth to email
 * an address reads every answer that only an address with an account can get
 * as "sent", so two requests in a minute no longer show who has an account.
 */
describe("reading Supabase Auth's answer to an email request", () => {
  it("reads success as sent", () => {
    expect(answerReadsAsSent(null)).toBe(true);
    expect(answerReadsAsSent(undefined)).toBe(true);
  });

  it.each([
    [
      "the per-address email frequency",
      new AuthApiError(
        "For security purposes, you can only request this after 52 seconds.",
        429,
        "over_email_send_rate_limit",
      ),
    ],
    [
      "the project's hourly email limit",
      new AuthApiError(
        "email rate limit exceeded",
        429,
        "over_email_send_rate_limit",
      ),
    ],
    [
      "a rate limit without a code",
      new AuthApiError("Too many requests", 429, undefined),
    ],
    [
      "an address the built-in mailer may not send to",
      new AuthApiError(
        "Email address not authorized",
        400,
        "email_address_not_authorized",
      ),
    ],
    [
      "an address that already has an account",
      new AuthApiError("User already registered", 422, "user_already_exists"),
    ],
    [
      "an email that already has an account",
      new AuthApiError("Email exists", 422, "email_exists"),
    ],
  ])("reads %s as sent", (_label, error) => {
    expect(answerReadsAsSent(error)).toBe(true);
  });

  it.each([
    [
      "a server error",
      new AuthApiError(
        "Database error querying schema",
        500,
        "unexpected_failure",
      ),
    ],
    [
      "a weak password",
      new AuthApiError("Password is too weak", 422, "weak_password"),
    ],
    ["a network failure", new TypeError("Failed to fetch")],
    ["a thrown string", "boom"],
  ])("does not read %s as sent", (_label, error) => {
    expect(answerReadsAsSent(error)).toBe(false);
  });
});
