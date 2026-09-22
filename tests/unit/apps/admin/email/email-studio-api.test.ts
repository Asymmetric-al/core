import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchEmailTemplates,
  persistEmailTemplate,
  sendTemplateTestEmail,
} from "../../../../../apps/admin/app/(app)/email/email-studio-api";

const exportResult = {
  builder: "react_email" as const,
  builderVersion: "1.5.3",
  design: { blocks: [] },
  html: "<p>Hi</p>",
  text: "Hi",
};

describe("fetchEmailTemplates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats a 200 with success false as an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: "Tenant email is down" }),
      }),
    );

    await expect(fetchEmailTemplates()).rejects.toThrow("Tenant email is down");
  });
});

describe("persistEmailTemplate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts schema field names, trimmed name, and React Email design JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        template: {
          id: "tmpl_1",
          name: "Welcome",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const saved = await persistEmailTemplate(
      {
        id: null,
        name: "  Welcome  ",
        subject: "Hello",
        preheader: "Preview",
      },
      exportResult,
    );

    expect(saved).toEqual({ id: "tmpl_1", name: "Welcome" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email/templates");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.name).toBe("Welcome");
    expect(body.builder).toBe("react_email");
    expect(body.builderVersion).toBe("1.5.3");
    expect(body.category).toBe("campaign");
    expect(body.designJson).toEqual({ blocks: [] });
    expect(body.htmlContent).toBe("<p>Hi</p>");
    expect(body.textContent).toBe("Hi");
    expect(body.defaultSubject).toBe("Hello");
    expect(body.defaultPreheader).toBe("Preview");
    expect(body).not.toHaveProperty("html");
    expect(body.editorMetadata).toEqual(
      expect.objectContaining({ source: "admin_email_studio" }),
    );
  });

  it("patches an existing template id with the same schema field names", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        template: { id: "tmpl_9", name: "Updated" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await persistEmailTemplate(
      {
        id: "tmpl_9",
        name: "Updated",
        subject: "",
        preheader: "",
      },
      exportResult,
    );

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email/templates/tmpl_9");
    expect(init.method).toBe("PATCH");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.htmlContent).toBe("<p>Hi</p>");
    expect(body.defaultSubject).toBeNull();
    expect(body.defaultPreheader).toBeNull();
  });

  it("throws when the mutation succeeds without a template id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, template: { name: "Welcome" } }),
      }),
    );

    await expect(
      persistEmailTemplate(
        {
          id: null,
          name: "Welcome",
          subject: "Hello",
          preheader: "Preview",
        },
        exportResult,
      ),
    ).rejects.toThrow("Failed to save template");
  });
});

describe("sendTemplateTestEmail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts html, builder, and optional preheader for a saved template", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, messageId: "msg_1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendTemplateTestEmail(
      "qa@example.com",
      {
        id: "tmpl_1",
        name: "Welcome",
        subject: "Hello",
        preheader: "Preview",
      },
      exportResult,
    );

    expect(result.messageId).toBe("msg_1");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/email/templates/tmpl_1/test-send");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.toEmail).toBe("qa@example.com");
    expect(body.subject).toBe("Hello");
    expect(body.preheader).toBe("Preview");
    expect(body.builder).toBe("react_email");
    expect(body.builderVersion).toBe("1.5.3");
    expect(body.designJson).toEqual({ blocks: [] });
    expect(body.html).toBe("<p>Hi</p>");
    expect(body.text).toBe("Hi");
  });
});
