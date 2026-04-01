import { describe, expect, it } from "vitest";

import {
  connectResendSchema,
  testResendEmailSchema,
  toResendConnectPayload,
} from "../../../../../../../../apps/admin/app/settings/integrations/resend/resend-form-schema";

describe("apps/admin/app/settings/integrations/resend/resend-form-schema", () => {
  it("accepts valid Resend connection values", () => {
    const parsed = connectResendSchema.parse({
      apiKey: "re_123456789",
      fromEmail: "hello@example.com",
      fromName: "Give Hope",
      replyToEmail: "support@example.com",
    });

    expect(parsed).toEqual({
      apiKey: "re_123456789",
      fromEmail: "hello@example.com",
      fromName: "Give Hope",
      replyToEmail: "support@example.com",
    });
  });

  it("rejects invalid api keys and invalid email fields", () => {
    const parsed = connectResendSchema.safeParse({
      apiKey: "bad-key",
      fromEmail: "not-an-email",
      fromName: "",
      replyToEmail: "also-bad",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.apiKey).toBeTruthy();
      expect(parsed.error.flatten().fieldErrors.fromEmail).toBeTruthy();
      expect(parsed.error.flatten().fieldErrors.fromName).toBeTruthy();
      expect(parsed.error.flatten().fieldErrors.replyToEmail).toBeTruthy();
    }
  });

  it("maps a blank reply-to email to undefined in the connect payload", () => {
    expect(
      toResendConnectPayload({
        apiKey: "re_123456789",
        fromEmail: "hello@example.com",
        fromName: "Give Hope",
        replyToEmail: "",
      }),
    ).toEqual({
      apiKey: "re_123456789",
      defaultFromEmail: "hello@example.com",
      defaultFromName: "Give Hope",
      replyToEmail: undefined,
    });
  });

  it("requires a valid recipient email for test sends", () => {
    expect(
      testResendEmailSchema.safeParse({
        testEmail: "not-an-email",
      }).success,
    ).toBe(false);

    expect(
      testResendEmailSchema.parse({
        testEmail: "recipient@example.com",
      }),
    ).toEqual({
      testEmail: "recipient@example.com",
    });
  });
});
