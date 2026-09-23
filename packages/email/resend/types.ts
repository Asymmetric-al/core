import type {
  DeliverabilityWarning,
  DomainAuthentication,
  EmailRecipient,
  EmailSendResult,
  ResendReceivedAttachment,
  ResendReceivedEmail,
  ResendWebhookEnvelope,
  ResendWebhookHeaders,
  SenderIdentity,
} from "../types";

export type DomainRecord = NonNullable<DomainAuthentication["records"]>[number];

export interface ResendErrorDetails {
  name?: string;
  message: string;
  statusCode?: number;
  retryAfter?: number;
}

export interface ResendInboundResult<TData> {
  success: boolean;
  data?: TData;
  error?: string;
  errorCode?: string;
}

export interface VerifyWebhookOptions {
  payload: string;
  headers: ResendWebhookHeaders;
  secret: string;
  apiKey?: string;
}

export interface ResendValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
  permissions?: string[];
  senderIdentities?: SenderIdentity[];
  domainAuthentication?: DomainAuthentication[];
  deliverabilityScore?: number;
  warnings?: DeliverabilityWarning[];
}

export interface ResendValidationOptions {
  defaultFromEmail?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
  idempotencyKey: string;
  tags?: Array<{ name: string; value: string }>;
  customArgs?: Record<string, string>;
}

export interface SendTestEmailOptions {
  idempotencyKey?: string;
}

export interface ResendClient {
  validateKey: (
    options?: ResendValidationOptions,
  ) => Promise<ResendValidationResult>;
  sendEmail: (options: SendEmailOptions) => Promise<EmailSendResult>;
  sendTestEmail: (
    toEmail: string,
    fromEmail: string,
    fromName: string,
    options?: SendTestEmailOptions,
  ) => Promise<EmailSendResult>;
  verifyWebhookSignature: (options: Omit<VerifyWebhookOptions, "apiKey">) => {
    success: boolean;
    event?: ResendWebhookEnvelope;
    error?: string;
    errorCode?: string;
  };
  getReceivedEmail: (
    emailId: string,
  ) => Promise<ResendInboundResult<ResendReceivedEmail>>;
  listReceivedEmailAttachments: (
    emailId: string,
  ) => Promise<ResendInboundResult<ResendReceivedAttachment[]>>;
}
