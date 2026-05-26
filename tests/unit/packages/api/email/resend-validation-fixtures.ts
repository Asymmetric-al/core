import type { ResendValidationResult } from "@asym/email";

export const FIXED_RESEND_VALIDATED_AT = "2026-04-02T12:00:00.000Z";

export function verifiedResendValidationResult(
  overrides: Partial<ResendValidationResult> = {},
): ResendValidationResult {
  return {
    valid: true,
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
    ...overrides,
  };
}
