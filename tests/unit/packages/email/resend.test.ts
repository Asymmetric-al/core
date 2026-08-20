import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  calculateResendRetryDelayMs,
  createResendValidationSnapshot,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
  parseResendWebhookEnvelope,
  getReceivedEmail,
  listReceivedEmailAttachments,
  sendEmail,
  sendTestEmail,
  validateResendApiKey,
  verifyResendWebhookSignature,
} from "../../../../packages/email/resend";
import {
  RESEND_LIMITS,
  RETRY_CONFIG,
} from "../../../../packages/email/constants";

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
      idempotencyKey: "tenant-1/invalid-recipient",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("validation_error");
  });

  it("requires an idempotency key before sending", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      // @ts-expect-error verifies runtime protection for JavaScript callers.
      idempotencyKey: undefined,
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.message).toContain("idempotencyKey is required");
  });

  it("blocks single-send requests above the Resend recipient limit", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await sendEmail("re_test_key", {
      to: Array.from({ length: 51 }, (_, index) => ({
        email: `recipient-${index}@example.com`,
      })),
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/too-many-recipients",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.message).toContain("at most 50 recipients");
  });

  it("honors retry-after headers and reports retry count", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            name: "rate_limit_exceeded",
            message: "Too many requests",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "0",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "msg_after_retry" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const result = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/retry-after",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg_after_retry");
    expect(result.retryCount).toBe(1);
  });

  it("caps retry backoff after jitter", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);

    expect(calculateResendRetryDelayMs(10)).toBe(RETRY_CONFIG.maxDelayMs);
  });

  it("builds the expected Resend send payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_payload" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await sendEmail("re_test_key", {
      to: [
        { email: "recipient@example.com", name: "Recipient Name" },
        { email: "second@example.com" },
      ],
      from: { email: "from@example.com", name: "From Name" },
      replyTo: { email: "reply@example.com", name: "Reply Team" },
      subject: "Payload check",
      html: "<p>Hello <strong>there</strong></p>",
      idempotencyKey: "tenant-1/payload-check",
      tags: [{ name: "email type", value: "payload check" }],
      customArgs: { tenant_id: "tenant-1" },
    });

    expect(result.success).toBe(true);
    const requestBody = JSON.parse(
      String((fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.body),
    ) as Record<string, unknown>;

    expect(requestBody).toMatchObject({
      from: "From Name <from@example.com>",
      to: ["Recipient Name <recipient@example.com>", "second@example.com"],
      subject: "Payload check",
      html: "<p>Hello <strong>there</strong></p>",
      text: "Hello there",
      reply_to: "Reply Team <reply@example.com>",
    });
    expect(requestBody.tags).toEqual(
      expect.arrayContaining([
        { name: "email_type", value: "payload_check" },
        { name: "tenant_id", value: "tenant-1" },
      ]),
    );
  });

  it("sendTestEmail always supplies a connection-test idempotency key and tags", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_test" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await sendTestEmail(
      "re_test_key",
      "recipient@example.com",
      "from@example.com",
      "From Team",
    );

    expect(result.success).toBe(true);
    const fetchOptions = fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = new Headers(fetchOptions?.headers);
    expect(headers.get("idempotency-key")).toMatch(/^test-connection\//);

    const requestBody = JSON.parse(String(fetchOptions?.body)) as {
      tags?: Array<{ name: string; value: string }>;
    };
    expect(requestBody.tags).toEqual([
      { name: "email_type", value: "connection_test" },
      { name: "source", value: "admin_integration" },
    ]);
  });

  it("validates key format before any API call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await validateResendApiKey("invalid_key");

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("invalid_api_key");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("creates a persisted validation snapshot from record-level evidence", () => {
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
      "2026-04-02T12:00:00.000Z",
    );

    expect(snapshot.domainAuthenticated).toBe(true);
    expect(snapshot.dkimVerified).toBe(true);
    expect(snapshot.spfVerified).toBe(true);
    expect(snapshot.validatedAt).toBe("2026-04-02T12:00:00.000Z");
    expect(isResendValidationSendReady(snapshot)).toBe(true);
  });

  it("detects DKIM and SPF from verified record hints even when labels are absent", () => {
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
                type: "TXT",
                name: "resend._domainkey",
                value: "p=abc123",
                status: "verified",
              },
              {
                type: "TXT",
                name: "send",
                value: "v=spf1 include:spf.resend.com ~all",
                status: "verified",
              },
            ],
          },
        ],
        deliverabilityScore: 100,
        warnings: [],
      },
      "2026-04-02T12:00:00.000Z",
    );

    expect(snapshot.dkimVerified).toBe(true);
    expect(snapshot.spfVerified).toBe(true);
  });

  it("parses only valid persisted validation snapshots", () => {
    expect(parseResendValidationSnapshot(null)).toBeNull();
    expect(
      parseResendValidationSnapshot({
        senderIdentities: [],
        domainAuthentication: [],
        warnings: [],
        deliverabilityScore: 88,
        validatedAt: "2026-04-02T12:00:00.000Z",
        domainAuthenticated: false,
        dkimVerified: false,
        spfVerified: false,
      }),
    ).toEqual(
      expect.objectContaining({
        deliverabilityScore: 88,
        validatedAt: "2026-04-02T12:00:00.000Z",
      }),
    );
  });

  it("defaults persisted sender verification to false when older snapshots omit the flag", () => {
    const snapshot = parseResendValidationSnapshot({
      senderIdentities: [
        {
          id: 1,
          nickname: "default",
          from_email: "from@example.com",
          from_name: "From Team",
          reply_to_email: null,
        },
      ],
      domainAuthentication: [],
      warnings: [],
      deliverabilityScore: 88,
      validatedAt: "2026-04-02T12:00:00.000Z",
      domainAuthenticated: false,
      dkimVerified: false,
      spfVerified: false,
    });

    expect(snapshot?.senderIdentities).toEqual([
      expect.objectContaining({
        from_email: "from@example.com",
        verified: false,
      }),
    ]);
  });

  it("surfaces a blocking warning when the default sender domain is not verified", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ name: "asymmetric.al", status: "verified" }],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "d_1",
            name: "asymmetric.al",
            status: "verified",
            records: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const result = await validateResendApiKey("re_test_key", {
      defaultFromEmail: "conrad@globalfellowship.org",
    });

    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
          severity: "error",
        }),
      ]),
    );
  });

  it("hydrates domain records and sender identities from Resend domain details", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [{ id: "d_1", name: "example.com", status: "verified" }],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "d_1",
            name: "example.com",
            status: "verified",
            records: [
              {
                type: "TXT",
                name: "send",
                value: "v=spf1 include:spf.resend.com ~all",
                status: "verified",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const result = await validateResendApiKey("re_test_key", {
      defaultFromEmail: "hello@example.com",
    });

    expect(result.valid).toBe(true);
    expect(result.domainAuthentication).toEqual([
      expect.objectContaining({
        domain: "example.com",
        valid: true,
        records: [
          expect.objectContaining({
            type: "TXT",
            status: "verified",
          }),
        ],
      }),
    ]);
    expect(result.senderIdentities).toEqual([
      expect.objectContaining({
        from_email: "noreply@example.com",
        verified: true,
      }),
    ]);
    expect(result.warnings).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("uses Resend inbound helper endpoints and maps attachment rows", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "email_1",
            text: "hello",
            html: "<p>hello</p>",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "att_1",
                filename: "receipt.pdf",
                content_type: "application/pdf",
                download_url: "https://example.com/receipt.pdf",
                expires_at: "2026-04-26T12:00:00.000Z",
              },
              {
                id: "",
                filename: "ignored.txt",
                download_url: "",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    const email = await getReceivedEmail("re_test_key", "email_1");
    const attachments = await listReceivedEmailAttachments(
      "re_test_key",
      "email_1",
    );

    expect(email).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: "email_1", text: "hello" }),
      }),
    );
    expect(attachments).toEqual({
      success: true,
      data: [
        {
          id: "att_1",
          filename: "receipt.pdf",
          content_type: "application/pdf",
          download_url: "https://example.com/receipt.pdf",
          expires_at: "2026-04-26T12:00:00.000Z",
        },
      ],
    });
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain(
      "/emails/receiving/email_1",
    );
    expect(String(fetchSpy.mock.calls[1]?.[0])).toContain(
      "/emails/receiving/email_1/attachments",
    );
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

  it("returns structured webhook verification failure for missing API key", () => {
    const previousApiKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    try {
      const result = verifyResendWebhookSignature({
        payload: '{"type":"email.delivered"}',
        secret: "whsec_test",
        headers: {
          "svix-id": "evt_1",
          "svix-timestamp": "1700000000",
          "svix-signature": "v1,test",
        },
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("invalid_api_key");
      expect(result.error).toContain("RESEND_API_KEY is required");
    } finally {
      if (previousApiKey) {
        process.env.RESEND_API_KEY = previousApiKey;
      }
    }
  });

  it("quotes From display names that contain special RFC 5322 characters", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_quoted" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com", name: "From, Name" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/quoted-from",
    });

    const requestBody = JSON.parse(
      String((fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.body),
    ) as { from?: string };

    expect(requestBody.from).toBe('"From, Name" <from@example.com>');
  });

  it("rejects display names that contain control characters before calling Resend", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com", name: "Tenant\nName" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/control-from",
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.code).toBe("validation_error");
    expect(result.errors?.[0]?.message).toMatch(/control character/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("trims idempotency keys before sending and rejects empty or oversized values", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_trimmed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const trimmed = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "  tenant-1/test-1  ",
    });

    expect(trimmed.success).toBe(true);
    const headers = new Headers(
      (fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.headers,
    );
    expect(
      headers.get("idempotency-key") ?? headers.get("Idempotency-Key"),
    ).toBe("tenant-1/test-1");

    const emptyAfterTrim = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "   ",
    });
    expect(emptyAfterTrim.success).toBe(false);
    expect(emptyAfterTrim.errors?.[0]?.message).toContain(
      "idempotencyKey is required",
    );

    const oversized = await sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: `  ${"a".repeat(257)}  `,
    });
    expect(oversized.success).toBe(false);
    expect(oversized.errors?.[0]?.message).toContain("256 characters or fewer");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("escapes HTML in sendTestEmail body values", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_escaped" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await sendTestEmail(
      "re_test_key",
      "qa@example.com",
      "from@example.com",
      "<script>alert(1)</script>",
    );

    const requestBody = JSON.parse(
      String((fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.body),
    ) as { html?: string };

    expect(requestBody.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(requestBody.html).not.toContain("<script>alert(1)</script>");
  });

  it("maps aborted send requests to a timeout after retries", async () => {
    vi.useFakeTimers();
    vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
      const controller = new AbortController();
      controller.abort();
      return controller.signal;
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (_input, init) => {
      const signal = (init as RequestInit | undefined)?.signal;
      if (signal?.aborted) {
        const error = new Error("The operation was aborted.");
        error.name = "AbortError";
        throw error;
      }
      return new Response(JSON.stringify({ id: "msg_unexpected" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const pending = sendEmail("re_test_key", {
      to: { email: "recipient@example.com" },
      from: { email: "from@example.com" },
      subject: "Hello",
      html: "<p>Hello</p>",
      idempotencyKey: "tenant-1/timeout",
    });
    const result = await Promise.all([pending, vi.runAllTimersAsync()]).then(
      ([value]) => value,
    );

    expect(result.success).toBe(false);
    expect(result.errors?.[0]?.message).toContain("timed out");
    expect(fetchSpy).toHaveBeenCalledTimes(RETRY_CONFIG.maxRetries + 1);
  });

  it("treats restricted_api_key domain list failures as a warning", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/domains?")) {
        return new Response(
          JSON.stringify({
            name: "restricted_api_key",
            message: "This API key is restricted to sending.",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/api-keys")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    });

    const result = await validateResendApiKey("re_test_key", {
      defaultFromEmail: "from@example.com",
    });

    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "RESTRICTED_API_KEY" }),
      ]),
    );
    expect(
      result.warnings?.some((warning) => warning.code === "NO_DOMAINS"),
    ).toBe(false);
    expect(
      result.warnings?.some(
        (warning) => warning.code === "DOMAIN_NOT_VERIFIED",
      ),
    ).toBe(false);
    expect(
      result.warnings?.some(
        (warning) => warning.code === "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
      ),
    ).toBe(false);
    expect(
      fetchSpy.mock.calls.some(([url]) => String(url).includes("/api-keys")),
    ).toBe(true);
    expect(
      isResendValidationSendReady(createResendValidationSnapshot(result)),
    ).toBe(true);
  });

  it("still invalidates when domain listing fails for a non-restricted error", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "application_error",
          message: "Internal server error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await validateResendApiKey("re_test_key");

    expect(result.valid).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("follows domain list pagination using has_more and after", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/domains?limit=100")) {
        return new Response(
          JSON.stringify({
            object: "list",
            data: [{ id: "d_1", name: "one.com", status: "verified" }],
            has_more: true,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/domains?limit=100&after=d_1")) {
        return new Response(
          JSON.stringify({
            object: "list",
            data: [{ id: "d_2", name: "two.com", status: "verified" }],
            has_more: false,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.endsWith("/domains/d_1") || url.endsWith("/domains/d_2")) {
        const id = url.endsWith("/domains/d_1") ? "d_1" : "d_2";
        const name = id === "d_1" ? "one.com" : "two.com";
        return new Response(
          JSON.stringify({
            id,
            name,
            status: "verified",
            records: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/api-keys")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    });

    const result = await validateResendApiKey("re_test_key");

    expect(result.valid).toBe(true);
    expect(result.domainAuthentication?.map((domain) => domain.domain)).toEqual(
      ["one.com", "two.com"],
    );
    expect(
      fetchSpy.mock.calls.some(([url]) =>
        String(url).includes("/domains?limit=100&after=d_1"),
      ),
    ).toBe(true);
  });

  it("paginates domain lists when Resend returns numeric ids", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/domains?limit=100")) {
        return new Response(
          JSON.stringify({
            object: "list",
            data: [{ id: 1, name: "one.com", status: "verified" }],
            has_more: true,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/domains?limit=100&after=1")) {
        return new Response(
          JSON.stringify({
            object: "list",
            data: [{ id: 2, name: "two.com", status: "verified" }],
            has_more: false,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.endsWith("/domains/1") || url.endsWith("/domains/2")) {
        const id = url.endsWith("/domains/1") ? "1" : "2";
        return new Response(
          JSON.stringify({
            id,
            name: id === "1" ? "one.com" : "two.com",
            status: "verified",
            records: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/api-keys")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    });

    const result = await validateResendApiKey("re_test_key");

    expect(result.valid).toBe(true);
    expect(result.domainAuthentication?.map((domain) => domain.domain)).toEqual(
      ["one.com", "two.com"],
    );
    expect(
      fetchSpy.mock.calls.some(([url]) =>
        String(url).includes("/domains?limit=100&after=1"),
      ),
    ).toBe(true);
  });

  it("warns when domain listing stops before Resend reports completion", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/domains?") && !url.includes("/domains/d_")) {
        const afterMatch = /[?&]after=d_(\d+)/.exec(url);
        const page = afterMatch ? Number(afterMatch[1]) + 1 : 0;
        return new Response(
          JSON.stringify({
            object: "list",
            data: [
              {
                id: `d_${page}`,
                name: `page${page}.com`,
                status: "not_started",
              },
            ],
            has_more: true,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (/\/domains\/d_\d+$/.test(url)) {
        return new Response(
          JSON.stringify({
            id: url.split("/").at(-1),
            name: "page.com",
            status: "not_started",
            records: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/api-keys")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    });

    const result = await validateResendApiKey("re_test_key", {
      defaultFromEmail: "from@example.com",
    });

    const domainListCalls = fetchSpy.mock.calls.filter(([url]) =>
      /\/domains\?/.test(String(url)),
    );
    expect(domainListCalls).toHaveLength(RESEND_LIMITS.maxDomainListPages);
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "DOMAIN_LIST_INCOMPLETE" }),
      ]),
    );
    expect(
      result.warnings?.some((warning) => warning.code === "NO_DOMAINS"),
    ).toBe(false);
    expect(
      result.warnings?.some(
        (warning) => warning.code === "DOMAIN_NOT_VERIFIED",
      ),
    ).toBe(false);
    expect(
      result.warnings?.some(
        (warning) => warning.code === "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
      ),
    ).toBe(false);
  });

  it("retries domain detail enrichment on 429 and warns when details stay incomplete", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    let d1Gets = 0;
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/domains?") && !url.includes("/domains/d_")) {
        return new Response(
          JSON.stringify({
            data: [
              { id: "d_ok", name: "ok.com", status: "verified" },
              { id: "d_fail", name: "fail.com", status: "verified" },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.endsWith("/domains/d_ok")) {
        d1Gets += 1;
        if (d1Gets === 1) {
          return new Response(
            JSON.stringify({
              name: "rate_limit_exceeded",
              message: "Too many requests",
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": "0",
              },
            },
          );
        }
        return new Response(
          JSON.stringify({
            id: "d_ok",
            name: "ok.com",
            status: "verified",
            records: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.endsWith("/domains/d_fail")) {
        return new Response(
          JSON.stringify({
            name: "application_error",
            message: "Domain lookup failed",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (url.includes("/api-keys")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch ${url}`);
    });

    const result = await validateResendApiKey("re_test_key");

    expect(result.valid).toBe(true);
    expect(d1Gets).toBeGreaterThan(1);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "DOMAIN_DETAILS_INCOMPLETE" }),
      ]),
    );
  });

  it("parses webhook envelopes including unknown event types", () => {
    expect(
      parseResendWebhookEnvelope({
        type: "email.delivered",
        created_at: "2026-04-02T12:00:00.000Z",
        data: { email_id: "msg_1" },
      }),
    ).toEqual({
      type: "email.delivered",
      created_at: "2026-04-02T12:00:00.000Z",
      data: { email_id: "msg_1" },
    });
    expect(
      parseResendWebhookEnvelope({
        type: "email.custom_future_event",
        created_at: "2026-04-02T12:00:00.000Z",
        data: {},
      })?.type,
    ).toBe("email.custom_future_event");
    expect(parseResendWebhookEnvelope({ type: "email.delivered" })).toBeNull();
  });
});
