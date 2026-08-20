import type {
  EmailMetadata,
  EmailTemplateListEntry,
} from "./email-studio-types";
import type { EmailStudioExportResult } from "@asym/email/email-builder-types";

type PersistTemplateResponse = {
  success?: boolean;
  template?: {
    id?: string;
    name?: string;
  };
  error?: string;
};

type ListTemplatesResponse = {
  success?: boolean;
  templates?: EmailTemplateListEntry[];
  error?: string;
};

type TestSendResponse = {
  success?: boolean;
  error?: string;
  messageId?: string | null;
};

async function readJsonBody<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchEmailTemplates(): Promise<EmailTemplateListEntry[]> {
  const response = await fetch("/api/email/templates", {
    method: "GET",
  });
  const body = await readJsonBody<ListTemplatesResponse>(response);

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to load templates");
  }

  return body.templates ?? [];
}

export async function persistEmailTemplate(
  metadata: EmailMetadata,
  exportResult: EmailStudioExportResult,
): Promise<{ id: string; name: string }> {
  const payload = {
    name: metadata.name.trim(),
    category: "campaign" as const,
    builder: exportResult.builder,
    builderVersion: exportResult.builderVersion,
    designJson: exportResult.design,
    htmlContent: exportResult.html,
    textContent: exportResult.text,
    defaultSubject: metadata.subject || null,
    defaultPreheader: metadata.preheader || null,
    editorMetadata: {
      source: "admin_email_studio",
      savedAt: new Date().toISOString(),
    },
  };

  const response = await fetch(
    metadata.id
      ? `/api/email/templates/${metadata.id}`
      : "/api/email/templates",
    {
      method: metadata.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const body = await readJsonBody<PersistTemplateResponse>(response);

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to save template");
  }

  const savedId = body.template?.id;
  if (typeof savedId !== "string") {
    throw new Error("Failed to save template");
  }

  return {
    id: savedId,
    name:
      typeof body.template?.name === "string"
        ? body.template.name
        : metadata.name,
  };
}

export async function sendTemplateTestEmail(
  toEmail: string,
  metadata: EmailMetadata,
  exportResult: EmailStudioExportResult,
): Promise<{ messageId?: string }> {
  const testSendPath = metadata.id
    ? `/api/email/templates/${metadata.id}/test-send`
    : "/api/email/templates/test-send";
  const response = await fetch(testSendPath, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      toEmail,
      subject: metadata.subject || metadata.name,
      preheader: metadata.preheader || undefined,
      builder: exportResult.builder,
      builderVersion: exportResult.builderVersion,
      designJson: exportResult.design,
      html: exportResult.html,
      text: exportResult.text,
    }),
  });
  const body = await readJsonBody<TestSendResponse>(response);

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to send test email");
  }

  return { messageId: body.messageId ?? undefined };
}
