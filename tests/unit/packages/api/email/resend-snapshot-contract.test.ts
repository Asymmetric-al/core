import { describe, expect, it } from "vitest";

import {
  createResendValidationSnapshot,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
} from "@asym/email/resend";

const FIXED_VALIDATED_AT = "2026-04-02T12:00:00.000Z";

describe("@asym/email Resend validation snapshot contract", () => {
  it("maps domain record evidence to snapshot flags used by api/email/connect", () => {
    const snapshot = createResendValidationSnapshot(
      {
        senderIdentities: [],
        domainAuthentication: [
          {
            id: 1,
            domain: "example.com",
            subdomain: null,
            valid: true,
            records: [
              {
                record: "SPF",
                type: "TXT",
                name: "send",
                value: '"v=spf1 include:amazonses.com ~all"',
                status: "verified",
              },
              {
                record: "DKIM",
                type: "TXT",
                name: "resend._domainkey",
                value: "p=abc123",
                status: "verified",
              },
            ],
          },
        ],
        deliverabilityScore: 100,
        warnings: [],
      },
      FIXED_VALIDATED_AT,
    );

    expect(snapshot).toEqual(
      expect.objectContaining({
        validatedAt: FIXED_VALIDATED_AT,
        domainAuthenticated: true,
        dkimVerified: true,
        spfVerified: true,
        deliverabilityScore: 100,
      }),
    );
    expect(isResendValidationSendReady(snapshot)).toBe(true);
  });

  it("round-trips snapshots through parseResendValidationSnapshot", () => {
    const snapshot = createResendValidationSnapshot(
      {
        senderIdentities: [
          {
            id: 1,
            nickname: "default",
            from_email: "from@example.com",
            from_name: "From Team",
            reply_to_email: null,
            verified: true,
          },
        ],
        domainAuthentication: [
          {
            id: 1,
            domain: "example.com",
            subdomain: null,
            valid: true,
            records: [
              {
                record: "SPF",
                type: "TXT",
                name: "send",
                value: '"v=spf1 include:amazonses.com ~all"',
                status: "verified",
              },
            ],
          },
        ],
        deliverabilityScore: 91,
        warnings: [],
      },
      FIXED_VALIDATED_AT,
    );

    const parsed = parseResendValidationSnapshot(snapshot);

    expect(parsed).not.toBeNull();
    expect(parsed).toEqual(
      expect.objectContaining({
        validatedAt: FIXED_VALIDATED_AT,
        domainAuthenticated: true,
        deliverabilityScore: 91,
        senderIdentities: [
          expect.objectContaining({
            from_email: "from@example.com",
            verified: true,
          }),
        ],
      }),
    );
    expect(isResendValidationSendReady(snapshot)).toBe(true);
    expect(isResendValidationSendReady(parsed)).toBe(true);
  });

  it("marks send as blocked when deliverability warnings include errors", () => {
    const snapshot = createResendValidationSnapshot(
      {
        senderIdentities: [],
        domainAuthentication: [
          { id: 1, domain: "example.com", subdomain: null, valid: true },
        ],
        deliverabilityScore: 100,
        warnings: [
          {
            code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
            severity: "error",
            message: "Sender domain is not verified.",
          },
        ],
      },
      FIXED_VALIDATED_AT,
    );

    expect(snapshot.domainAuthenticated).toBe(true);
    expect(isResendValidationSendReady(snapshot)).toBe(false);
  });
});
