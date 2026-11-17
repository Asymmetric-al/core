import { z } from "zod";

/**
 * Reply payload the composer builds from the Tiptap editor
 * (`serializeReplyPayload`) and sends with `useSendSupportReply`. The server
 * validates it with `sendReplyPayloadSchema` in
 * `packages/api/src/admin/support-hub/schemas.ts`.
 */
export interface SupportAttachmentDraft {
  filename: string;
  contentType: string;
  sizeBytes: number;
  /**
   * A `local:` placeholder from `AttachmentChips`. There is no upload
   * pipeline yet; the server schema drops this field, so no file bytes or
   * references leave the browser.
   */
  blobRef: string;
}

export interface SupportReplyPayload {
  /** Tiptap document JSON. */
  json: unknown | null;
  /**
   * HTML body for the donor. Editor text is escaped; merge-variable values
   * are inserted unescaped (see `serializeReplyPayload`).
   */
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
