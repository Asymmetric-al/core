import { describe, expect, it } from "vitest";

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
  it("returns the documented deferred shape today", async () => {
    const result = await routeInboundToSupportHub(VALID_ENVELOPE);
    expect(result.status).toBe("deferred");
    expect(result.conversationId).toBeNull();
    expect(result.messageId).toBeNull();
    expect(result.reason).toContain("Phase 7");
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
