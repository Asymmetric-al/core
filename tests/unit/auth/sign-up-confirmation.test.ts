import { describe, expect, it } from "vitest";

import { safeNextParam } from "../../../packages/auth/demo-login";
import {
  SIGN_UP_CONFIRMATION_CALLBACK_PATH,
  signUpConfirmationRedirectUrl,
} from "../../../packages/auth/sign-up-confirmation";

describe("sign-up confirmation address", () => {
  it.each([
    ["http://localhost:3105", "http://localhost:3105/auth/callback"],
    ["http://127.0.0.1:3105", "http://127.0.0.1:3105/auth/callback"],
    ["https://give.example.org", "https://give.example.org/auth/callback"],
  ])(
    "returns the email link to the host it was asked from: %s",
    (origin, url) => {
      expect(signUpConfirmationRedirectUrl(origin)).toBe(url);
    },
  );

  it("lands on the public callback, which is never a post-sign-in destination", () => {
    // Each app's proxy lists /auth/callback as public, and `next` refuses it,
    // so the callback cannot be used to bounce a signed-in person.
    expect(SIGN_UP_CONFIRMATION_CALLBACK_PATH).toBe("/auth/callback");
    expect(safeNextParam(SIGN_UP_CONFIRMATION_CALLBACK_PATH)).toBeNull();
  });
});
