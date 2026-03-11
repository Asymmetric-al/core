import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendEmail,
  validateResendApiKey,
  verifyResendWebhookSignature,
} from "../../../../packages/email/resend";

describe("@asym/email resend service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("forwards idempotency key in send request options", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com", name: "From Name" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/test-1",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg_123");
    const fetchOptions = fetchSpy.mock.calls[0]?.[1];
    const headers = new Headers(
      (fetchOptions as RequestInit | undefined)?.headers,
    );
    expect(
      headers.get("idempotency-key") ?? headers.get("Idempotency-Key"),
    ).toBe("tenant-1/test-1");
  });

  it("maps validation responses without retrying", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "validation_error",
          message: "Invalid recipient address",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await sendEmail("re_test_key", {
      to: { email: "invalid" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("validation_error");
  });

  it("validates key format before any API call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await validateResendApiKey("invalid_key");

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("invalid_api_key");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns structured webhook verification failure for missing secret", () => {
    const result = verifyResendWebhookSignature({
      payload: '{"type":"email.delivered"}',
      secret: "",
      apiKey: "re_test_key",
      headers: {
        "svix-id": "evt_1",
        "svix-timestamp": "1700000000",
        "svix-signature": "v1,test",
      },
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("webhook_signature_invalid");
  });
});
