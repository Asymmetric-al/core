import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESEND_ERROR_CODES } from "../../../../packages/email/constants";
import {
  getReceivedEmail,
  listReceivedEmailAttachments,
  verifyResendWebhookSignature,
} from "../../../../packages/email/resend";

const signingKey = Buffer.from("local-resend-signing-fixture-no-provider");
const secret = `whsec_${signingKey.toString("base64")}`;
const payload = JSON.stringify({
  type: "email.received",
  created_at: "2026-10-22T12:00:00.000Z",
  data: { email_id: "email_local_fixture" },
});

function signedHeaders(timestamp = Math.floor(Date.now() / 1_000)) {
  const id = "msg_local_fixture";
  const signature = createHmac("sha256", signingKey)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");
  return {
    "svix-id": id,
    "svix-timestamp": String(timestamp),
    "svix-signature": `v1,${signature}`,
  };
}

describe("real Resend SDK security boundaries", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the Resend security fixture"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("verifies a locally signed webhook without an API call", () => {
    expect(
      verifyResendWebhookSignature({
        apiKey: "re_local_fixture",
        secret,
        payload,
        headers: signedHeaders(),
      }),
    ).toEqual({
      success: true,
      event: JSON.parse(payload),
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["payload", "timestamp", "signature"] as const)(
    "rejects a webhook with a tampered %s",
    (field) => {
      const headers = signedHeaders();
      const result = verifyResendWebhookSignature({
        apiKey: "re_local_fixture",
        secret,
        payload:
          field === "payload"
            ? payload.replace("email_local_fixture", "email_other")
            : payload,
        headers: {
          ...headers,
          ...(field === "timestamp"
            ? {
                "svix-timestamp": String(Number(headers["svix-timestamp"]) + 1),
              }
            : {}),
          ...(field === "signature"
            ? { "svix-signature": "v1,aW52YWxpZA==" }
            : {}),
        },
      });
      expect(result).toMatchObject({
        success: false,
        errorCode: RESEND_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("rejects a correctly signed stale webhook", () => {
    const result = verifyResendWebhookSignature({
      apiKey: "re_local_fixture",
      secret,
      payload,
      headers: signedHeaders(Math.floor(Date.now() / 1_000) - 600),
    });
    expect(result).toMatchObject({
      success: false,
      errorCode: RESEND_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([".", "..", "../domains", "email/../domains"])(
    "rejects dot-segment inbound ID %s before fetch",
    async (emailId) => {
      const email = await getReceivedEmail("re_local_fixture", emailId);
      const attachments = await listReceivedEmailAttachments(
        "re_local_fixture",
        emailId,
      );
      expect(email).toMatchObject({
        success: false,
        errorCode: RESEND_ERROR_CODES.VALIDATION_ERROR,
      });
      expect(attachments).toMatchObject({
        success: false,
        errorCode: RESEND_ERROR_CODES.VALIDATION_ERROR,
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
