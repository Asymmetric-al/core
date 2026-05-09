import { z } from "zod";

/**
 * Reply payload contract for the future Tiptap composer. The composer reads
 * its state out of Tiptap and serializes into this shape before calling
 * `useSendSupportReply`. Keeping the contract here lets later phases swap in
 * the real editor without changing the mutation surface.
 */
export interface SupportAttachmentDraft {
  filename: string;
  contentType: string;
  sizeBytes: number;
  /** Browser File or upload-token reference, depending on phase. */
  blobRef: string;
}

export interface SupportReplyPayload {
  /** Tiptap document JSON. Null until the composer is wired. */
  json: unknown | null;
  /** Sanitized HTML body sent to the donor. */
  html: string;
  /** Plaintext fallback for clients without HTML rendering. */
  text: string;
  attachments: SupportAttachmentDraft[];
}

export const supportAttachmentDraftSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  blobRef: z.string().min(1),
});

export const supportReplyPayloadSchema = z.object({
  json: z.unknown(),
  html: z.string(),
  text: z.string(),
  attachments: z.array(supportAttachmentDraftSchema),
});

export const EMPTY_SUPPORT_REPLY_PAYLOAD: SupportReplyPayload = {
  json: null,
  html: "",
  text: "",
  attachments: [],
};
