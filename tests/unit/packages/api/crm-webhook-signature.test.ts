import { describe, expect, it } from "vitest";

import {
  signTwentyWebhookPayload,
  TWENTY_WEBHOOK_SIGNATURE_HEADER,
  TWENTY_WEBHOOK_TIMESTAMP_HEADER,
  verifyTwentyWebhookSignature,
} from "../../../../packages/api/src/crm/webhooks/signature";

describe("Twenty webhook signature verification", () => {
  const rawBody = JSON.stringify({
    event: "person.created",
    data: { id: "person-1" },
    timestamp: "2026-05-08T00:00:00.000Z",
  });
  const timestamp = "2026-05-08T00:00:00.000Z";
  const secret = "twenty-webhook-secret";

  it("accepts a valid HMAC SHA256 signature over timestamp and raw payload", () => {
    const headers = new Headers({
      [TWENTY_WEBHOOK_TIMESTAMP_HEADER]: timestamp,
      [TWENTY_WEBHOOK_SIGNATURE_HEADER]: signTwentyWebhookPayload(
        rawBody,
        timestamp,
        secret,
      ),
    });

    expect(
      verifyTwentyWebhookSignature({
        headers,
        now: new Date("2026-05-08T00:02:00.000Z"),
        rawBody,
        secret,
        toleranceSeconds: 300,
      }),
    ).toMatchObject({
      timestamp: new Date(timestamp),
    });
  });

  it("rejects missing, stale, or invalid signatures", () => {
    expect(() =>
      verifyTwentyWebhookSignature({
        headers: new Headers(),
        rawBody,
        secret,
        toleranceSeconds: 300,
      }),
    ).toThrow(/signature/i);

    const staleHeaders = new Headers({
      [TWENTY_WEBHOOK_TIMESTAMP_HEADER]: timestamp,
      [TWENTY_WEBHOOK_SIGNATURE_HEADER]: signTwentyWebhookPayload(
        rawBody,
        timestamp,
        secret,
      ),
    });
    expect(() =>
      verifyTwentyWebhookSignature({
        headers: staleHeaders,
        now: new Date("2026-05-08T00:20:00.000Z"),
        rawBody,
        secret,
        toleranceSeconds: 300,
      }),
    ).toThrow(/stale/i);

    const invalidHeaders = new Headers({
      [TWENTY_WEBHOOK_TIMESTAMP_HEADER]: timestamp,
      [TWENTY_WEBHOOK_SIGNATURE_HEADER]: "deadbeef",
    });
    expect(() =>
      verifyTwentyWebhookSignature({
        headers: invalidHeaders,
        now: new Date("2026-05-08T00:02:00.000Z"),
        rawBody,
        secret,
        toleranceSeconds: 300,
      }),
    ).toThrow(/invalid/i);
  });
});
