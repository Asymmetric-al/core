import { extractResendErrorDetails, mapResendErrorCode } from "./errors";
import { asString, extractRows, isJsonRecord } from "./json";
import { createResendClientInstance } from "./sdk";

import type { ResendReceivedAttachment, ResendReceivedEmail } from "../types";
import type { ResendInboundResult } from "./types";

export async function getReceivedEmail(
  apiKey: string,
  emailId: string,
): Promise<ResendInboundResult<ResendReceivedEmail>> {
  const resend = createResendClientInstance(apiKey);
  const response = await resend.emails.receiving.get(emailId);
  if (response.error) {
    const details = extractResendErrorDetails(response.error);
    return {
      success: false,
      error: details.message,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }

  return {
    success: true,
    data: (isJsonRecord(response.data)
      ? response.data
      : {}) as ResendReceivedEmail,
  };
}

export async function listReceivedEmailAttachments(
  apiKey: string,
  emailId: string,
): Promise<ResendInboundResult<ResendReceivedAttachment[]>> {
  const resend = createResendClientInstance(apiKey);
  const response = await resend.emails.receiving.attachments.list({ emailId });
  if (response.error) {
    const details = extractResendErrorDetails(response.error);
    return {
      success: false,
      error: details.message,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }

  const rows = extractRows(response.data).map(
    (row): ResendReceivedAttachment => ({
      id: asString(row.id) ?? "",
      filename: asString(row.filename) ?? "attachment",
      content_type: asString(row.content_type) ?? undefined,
      download_url: asString(row.download_url) ?? "",
      expires_at: asString(row.expires_at) ?? undefined,
    }),
  );

  return {
    success: true,
    data: rows.filter((attachment) => attachment.id && attachment.download_url),
  };
}
