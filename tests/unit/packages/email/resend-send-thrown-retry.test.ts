import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendEmail,
  verifyResendWebhookSignature,
} from "../../../../packages/email/resend";

const mockCreateResendClientInstance = vi.hoisted(() => vi.fn());

vi.mock("../../../../packages/email/resend/sdk", () => ({
  createResendClientInstance: mockCreateResendClientInstance,
}));

const BASE_SEND = {
  to: { email: "to@example.com" },
  from: { email: "from@example.com" },
  subject: "Hello",
  html: "<p>Hi</p>",
  idempotencyKey: "tenant-1/thrown-retry",
};

describe("Resend send thrown Retry-After", () => {
  beforeEach(() => {
    mockCreateResendClientInstance.mockReset();
  });

  it("retries when emails.send throws an error that carries Retry-After headers", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("rate limited"), {
          headers: { "retry-after": "0" },
        }),
      )
      .mockResolvedValueOnce({
        data: { id: "email_ok" },
        error: null,
      });

    mockCreateResendClientInstance.mockReturnValue({
      emails: { send },
    });

    const result = await sendEmail("re_test_key", BASE_SEND);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("email_ok");
    expect(result.retryCount).toBe(1);
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("Resend webhook verify envelope", () => {
  beforeEach(() => {
    mockCreateResendClientInstance.mockReset();
  });

  it("accepts an unknown event type string from webhooks.verify", () => {
    mockCreateResendClientInstance.mockReturnValue({
      webhooks: {
        verify: vi.fn().mockReturnValue({
          type: "email.suppressed",
          created_at: "2026-04-09T12:00:00.000Z",
          data: { email_id: "email_1" },
        }),
      },
    });

    const result = verifyResendWebhookSignature({
      payload: "{}",
      headers: {
        "svix-id": "msg_1",
        "svix-timestamp": "1710000000",
        "svix-signature": "v1,sig",
      },
      secret: "whsec_test",
      apiKey: "re_test_key",
    });

    expect(result.success).toBe(true);
    expect(result.event?.type).toBe("email.suppressed");
  });

  it("maps a verified payload missing created_at to a validation error", () => {
    mockCreateResendClientInstance.mockReturnValue({
      webhooks: {
        verify: vi.fn().mockReturnValue({
          type: "email.delivered",
          data: { email_id: "email_1" },
        }),
      },
    });

    const result = verifyResendWebhookSignature({
      payload: "{}",
      headers: {
        "svix-id": "msg_1",
        "svix-timestamp": "1710000000",
        "svix-signature": "v1,sig",
      },
      secret: "whsec_test",
      apiKey: "re_test_key",
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("validation_error");
  });
});
