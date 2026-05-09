import { describe, expect, it } from "vitest";

import {
  buildSignatureLine,
  serializeReplyPayload,
} from "../../../../../../apps/admin/features/support-hub/components/detail/composer/serialize-payload";
import { supportReplyPayloadSchema } from "../../../../../../apps/admin/features/support-hub/models/editor-payload";
import type { SupportAssignee } from "../../../../../../apps/admin/features/support-hub/types";

const AGENT: SupportAssignee = {
  id: "agent-emily-thompson",
  name: "Emily Thompson",
  email: "admin@givehope.org",
  avatarUrl: null,
  title: "Director of Operations",
};

function makeJsonDoc(text: string): string {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
}

describe("serializeReplyPayload", () => {
  it("turns a simple Tiptap paragraph into html + text + json", () => {
    const payload = serializeReplyPayload({
      rawJson: makeJsonDoc("Thanks for the gift!"),
      attachments: [],
      signatureAgent: null,
      appendSignature: false,
    });

    expect(payload.text).toBe("Thanks for the gift!");
    expect(payload.html).toContain("<p>Thanks for the gift!</p>");
    expect(payload.json).toMatchObject({ type: "doc" });

    const parsed = supportReplyPayloadSchema.parse(payload);
    expect(parsed.text).toBe("Thanks for the gift!");
  });

  it("appends the signature to text and html only, never to the JSON doc", () => {
    const payload = serializeReplyPayload({
      rawJson: makeJsonDoc("Receipt is on its way."),
      attachments: [],
      signatureAgent: AGENT,
      appendSignature: true,
    });

    expect(payload.text).toContain("Emily Thompson");
    expect(payload.text).toContain("admin@givehope.org");
    expect(payload.html).toContain("support-signature");

    expect(JSON.stringify(payload.json)).not.toContain("Emily Thompson");
  });

  it("passes attachments through unchanged", () => {
    const payload = serializeReplyPayload({
      rawJson: makeJsonDoc("See attached."),
      attachments: [
        {
          filename: "receipt.pdf",
          contentType: "application/pdf",
          sizeBytes: 1024,
          blobRef: "local:receipt.pdf",
        },
      ],
      signatureAgent: null,
      appendSignature: false,
    });

    expect(payload.attachments).toHaveLength(1);
    expect(payload.attachments[0]?.filename).toBe("receipt.pdf");
  });

  it("escapes html so user-typed angle brackets cannot inject markup", () => {
    const payload = serializeReplyPayload({
      rawJson: makeJsonDoc("<script>alert('x')</script>"),
      attachments: [],
      signatureAgent: null,
      appendSignature: false,
    });

    expect(payload.html).not.toContain("<script>");
    expect(payload.html).toContain("&lt;script&gt;");
  });
});

describe("buildSignatureLine", () => {
  it("includes the agent name, title, and email when present", () => {
    const sig = buildSignatureLine(AGENT);
    expect(sig.text).toContain("Emily Thompson");
    expect(sig.text).toContain("Director of Operations");
    expect(sig.text).toContain("admin@givehope.org");
    expect(sig.html).toContain("Emily Thompson");
    expect(sig.html).toContain("<br/>");
  });

  it("omits the title line when the agent has no title", () => {
    const sig = buildSignatureLine({ ...AGENT, title: null });
    expect(sig.text).not.toContain("Director of Operations");
    expect(sig.text).toContain("Emily Thompson");
  });
});
