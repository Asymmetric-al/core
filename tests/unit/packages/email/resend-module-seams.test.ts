import { describe, expect, it } from "vitest";
import {
  calculateResendRetryDelayMs,
  createResendClient,
  createResendValidationSnapshot,
  getReceivedEmail,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
  parseResendWebhookEnvelope,
  sendEmail,
  sendTestEmail,
  validateResendApiKey,
  verifyResendWebhookSignature,
} from "../../../../packages/email/resend";
import { createResendClient as createResendClientFromModule } from "../../../../packages/email/resend/client";
import { calculateResendRetryDelayMs as calculateResendRetryDelayMsFromModule } from "../../../../packages/email/resend/errors";
import { getReceivedEmail as getReceivedEmailFromModule } from "../../../../packages/email/resend/inbound";
import {
  sendEmail as sendEmailFromModule,
  sendTestEmail as sendTestEmailFromModule,
} from "../../../../packages/email/resend/send";
import {
  createResendValidationSnapshot as createResendValidationSnapshotFromModule,
  isResendValidationSendReady as isResendValidationSendReadyFromModule,
  parseResendValidationSnapshot as parseResendValidationSnapshotFromModule,
  validateResendApiKey as validateResendApiKeyFromModule,
} from "../../../../packages/email/resend/validate";
import {
  parseResendWebhookEnvelope as parseResendWebhookEnvelopeFromModule,
  verifyResendWebhookSignature as verifyResendWebhookSignatureFromModule,
} from "../../../../packages/email/resend/webhook";

describe("Resend adapter module seams", () => {
  it("keeps sendEmail on the send module", () => {
    expect(sendEmailFromModule).toBe(sendEmail);
  });

  it("keeps sendTestEmail on the send module", () => {
    expect(sendTestEmailFromModule).toBe(sendTestEmail);
  });

  it("keeps Resend webhook authority verification on the webhook module", () => {
    expect(verifyResendWebhookSignatureFromModule).toBe(
      verifyResendWebhookSignature,
    );
    expect(parseResendWebhookEnvelopeFromModule).toBe(
      parseResendWebhookEnvelope,
    );
  });

  it("keeps inbound receiving on the inbound module", () => {
    expect(getReceivedEmailFromModule).toBe(getReceivedEmail);
  });

  it("keeps Tenant-owned Resend connection validation on the validation module", () => {
    expect(validateResendApiKeyFromModule).toBe(validateResendApiKey);
    expect(createResendValidationSnapshotFromModule).toBe(
      createResendValidationSnapshot,
    );
    expect(parseResendValidationSnapshotFromModule).toBe(
      parseResendValidationSnapshot,
    );
    expect(isResendValidationSendReadyFromModule).toBe(
      isResendValidationSendReady,
    );
  });

  it("keeps retry delay mapping on the error adapter", () => {
    expect(calculateResendRetryDelayMsFromModule).toBe(
      calculateResendRetryDelayMs,
    );
  });

  it("keeps the tenant-owned Resend adapter facade on the client module", () => {
    expect(createResendClientFromModule).toBe(createResendClient);
  });
});
