import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createResendValidationSnapshot,
  getFirstBlockingDeliverabilityWarning,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
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

  it("returns the first blocking deliverability warning", () => {
    expect(
      getFirstBlockingDeliverabilityWarning([
        {
          code: "INFO_WARNING",
          message: "Informational warning",
          severity: "info",
        },
        {
          code: "BLOCKING_WARNING",
          message: "Blocking warning",
          severity: "error",
        },
        {
          code: "SECOND_BLOCKING_WARNING",
          message: "Second blocking warning",
          severity: "error",
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        code: "BLOCKING_WARNING",
      }),
    );
  });
});
