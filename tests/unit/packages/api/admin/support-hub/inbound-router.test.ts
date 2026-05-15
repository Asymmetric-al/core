import { beforeEach, describe, expect, it, vi } from "vitest";

const routeInboundEmailToSupabaseSupportHubMock = vi.hoisted(() => vi.fn());

vi.mock(
  "../../../../../../packages/api/src/admin/support-hub/adapter/supabase",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../../packages/api/src/admin/support-hub/adapter/supabase")
      >();
    return {
      ...actual,
      routeInboundEmailToSupabaseSupportHub:
        routeInboundEmailToSupabaseSupportHubMock,
    };
  },
);

import {
  inboundEmailEnvelopeSchema,
  routeInboundToSupportHub,
} from "../../../../../../packages/api/src/admin/support-hub/inbound-router";

const VALID_ENVELOPE = {
  tenantId: "tenant-give-hope",
  resendEmailId: "rsd_123",
  inboxId: "inbox-1",
  fromAddress: "donor@example.com",
  toAddresses: ["support@givehope.org"],
  subject: "Receipt question",
  inReplyToHeader: null,
  referencesHeaders: [],
  bodyText: "Hi, can you resend my receipt?",
  bodyHtml: null,
  receivedAt: "2026-04-15T12:00:00.000Z",
};

describe("inboundEmailEnvelopeSchema", () => {
  it("accepts the documented envelope shape", () => {
    const result = inboundEmailEnvelopeSchema.safeParse(VALID_ENVELOPE);
    expect(result.success).toBe(true);
  });

  it("rejects envelopes missing the resend email id", () => {
    const result = inboundEmailEnvelopeSchema.safeParse({
      ...VALID_ENVELOPE,
      resendEmailId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("routeInboundToSupportHub", () => {
  beforeEach(() => {
    routeInboundEmailToSupabaseSupportHubMock.mockReset();
    routeInboundEmailToSupabaseSupportHubMock.mockResolvedValue({
      conversationId: "conv-inbound-1",
      messageId: "msg-inbound-1",
    });
  });

  it("routes a valid envelope into Support Hub persistence", async () => {
    const result = await routeInboundToSupportHub(VALID_ENVELOPE);
    expect(result.status).toBe("routed");
    expect(result.conversationId).toBe("conv-inbound-1");
    expect(result.messageId).toBe("msg-inbound-1");
    expect(routeInboundEmailToSupabaseSupportHubMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: VALID_ENVELOPE.tenantId,
        resendEmailId: VALID_ENVELOPE.resendEmailId,
        inboxId: VALID_ENVELOPE.inboxId,
      }),
    );
  });

  it("returns 'skipped' for a malformed envelope", async () => {
    const result = await routeInboundToSupportHub({
      // @ts-expect-error — intentionally malformed
      tenantId: 123,
      resendEmailId: "",
      inboxId: null,
      fromAddress: "",
      toAddresses: [],
      subject: null,
      inReplyToHeader: null,
      referencesHeaders: [],
      bodyText: "",
      bodyHtml: null,
      receivedAt: "",
    });
    expect(result.status).toBe("skipped");
  });
});
