import { describe, expect, it } from "vitest";

import {
  createResendValidationSnapshot,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
} from "@asym/email/resend";

import {
  FIXED_RESEND_VALIDATED_AT,
  verifiedResendValidationResult,
} from "./resend-validation-fixtures";

describe("@asym/email Resend validation snapshot contract", () => {
  it("maps domain record evidence to snapshot flags used by api/email/connect", () => {
    const snapshot = createResendValidationSnapshot(
      verifiedResendValidationResult({ senderIdentities: [] }),
      FIXED_RESEND_VALIDATED_AT,
    );

    expect(snapshot).toEqual(
      expect.objectContaining({
        validatedAt: FIXED_RESEND_VALIDATED_AT,
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
      verifiedResendValidationResult({
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
      }),
      FIXED_RESEND_VALIDATED_AT,
    );

    const parsed = parseResendValidationSnapshot(snapshot);

    expect(parsed).not.toBeNull();
    expect(parsed).toEqual(
      expect.objectContaining({
        validatedAt: FIXED_RESEND_VALIDATED_AT,
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
      verifiedResendValidationResult({
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
      }),
      FIXED_RESEND_VALIDATED_AT,
    );

    expect(snapshot.domainAuthenticated).toBe(true);
    expect(isResendValidationSendReady(snapshot)).toBe(false);
  });
});
