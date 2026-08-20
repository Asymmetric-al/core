import type {
  EmailMetadata,
  EmailTemplateListEntry,
} from "./email-studio-types";

type ExportResult = {
  html: string;
  text: string;
  design: Record<string, unknown>;
};

export async function fetchEmailTemplates(): Promise<EmailTemplateListEntry[]> {
  const response = await fetch("/api/email/templates");
  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }
  const payload = (await response.json()) as {
    templates?: EmailTemplateListEntry[];
  };
  return payload.templates ?? [];
}

export async function persistEmailTemplate(
  metadata: EmailMetadata,
  exportResult: ExportResult,
): Promise<{ id: string; name: string }> {
  const isUpdate = metadata.id !== null;
  const response = await fetch(
    isUpdate ? `/api/email/templates/${metadata.id}` : "/api/email/templates",
    {
      method: isUpdate ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: metadata.name,
        subject: metadata.subject,
        preheader: metadata.preheader,
        html: exportResult.html,
        text: exportResult.text,
        designJson: exportResult.design,
        ...(isUpdate
          ? {}
          : {
              builder: "react_email",
              category: "campaign",
            }),
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save");
  }

  const payload = (await response.json()) as {
    template?: { id?: string; name?: string };
  };
  const savedId = payload.template?.id;
  if (typeof savedId !== "string") {
    throw new Error("Failed to save");
  }

  return {
    id: savedId,
    name:
      typeof payload.template?.name === "string"
        ? payload.template.name
        : metadata.name,
  };
}

export async function sendTemplateTestEmail(
  toEmail: string,
  metadata: EmailMetadata,
  exportResult: Pick<ExportResult, "html" | "text">,
): Promise<{ messageId?: string }> {
  const testSendPath = metadata.id
    ? `/api/email/templates/${metadata.id}/test-send`
    : "/api/email/templates/test-send";
  const response = await fetch(testSendPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toEmail,
      subject: metadata.subject,
      html: exportResult.html,
      text: exportResult.text,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send test email");
  }

  const payload = (await response.json()) as { messageId?: string };
  return { messageId: payload.messageId };
}
