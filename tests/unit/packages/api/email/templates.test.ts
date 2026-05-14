import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  createEmailTemplateMock,
  listEmailTemplatesMock,
  readEmailTemplateMock,
  requireEmailTemplateMock,
  updateEmailTemplateMock,
  deleteEmailTemplateMock,
  duplicateEmailTemplateMock,
  listEmailTemplateVersionsMock,
  restoreEmailTemplateVersionMock,
} = vi.hoisted(() => ({
  getAuthContextMock: vi.fn(),
  requireRoleMock: vi.fn(),
  createEmailTemplateMock: vi.fn(),
  listEmailTemplatesMock: vi.fn(),
  readEmailTemplateMock: vi.fn(),
  requireEmailTemplateMock: vi.fn(),
  updateEmailTemplateMock: vi.fn(),
  deleteEmailTemplateMock: vi.fn(),
  duplicateEmailTemplateMock: vi.fn(),
  listEmailTemplateVersionsMock: vi.fn(),
  restoreEmailTemplateVersionMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("../../../../../packages/api/src/email/template-store", () => ({
  createEmailTemplate: createEmailTemplateMock,
  listEmailTemplates: listEmailTemplatesMock,
  readEmailTemplate: readEmailTemplateMock,
  requireEmailTemplate: requireEmailTemplateMock,
  updateEmailTemplate: updateEmailTemplateMock,
  deleteEmailTemplate: deleteEmailTemplateMock,
  duplicateEmailTemplate: duplicateEmailTemplateMock,
  listEmailTemplateVersions: listEmailTemplateVersionsMock,
  restoreEmailTemplateVersion: restoreEmailTemplateVersionMock,
}));

import {
  DELETE_TEMPLATE,
  GET,
  GET_TEMPLATE,
  GET_VERSIONS,
  PATCH_TEMPLATE,
  POST,
  POST_DUPLICATE,
  POST_EXPORT,
  POST_RESTORE,
} from "../../../../../packages/api/src/email/templates";

function createJsonRequest(body: unknown, method = "POST"): NextRequest {
  return new Request("https://example.com/api/email/templates", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

function templateContext(templateId = "template_1") {
  return {
    params: Promise.resolve({ templateId }),
  };
}

function restoreContext(templateId = "template_1", version = "2") {
  return {
    params: Promise.resolve({ templateId, version }),
  };
}

describe("api/email/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      profileId: "profile_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
  });

  it("creates provider-neutral React Email templates", async () => {
    createEmailTemplateMock.mockResolvedValueOnce({
      template: {
        id: "template_1",
        name: "May Update",
        builder: "react_email",
        version: 1,
      },
      version: { id: "version_1", version: 1 },
    });

    const response = await POST(
      createJsonRequest({
        name: "May Update",
        category: "campaign",
        builder: "react_email",
        builderVersion: "1.3.8",
        designJson: { type: "doc", content: [] },
        htmlContent: "<p>Hello {{first_name}}</p>",
        textContent: "Hello {{first_name}}",
        defaultSubject: "May update",
        defaultPreheader: "A short note",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(createEmailTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: expect.objectContaining({
        builder: "react_email",
        designJson: { type: "doc", content: [] },
        htmlContent: "<p>Hello {{first_name}}</p>",
        textContent: "Hello {{first_name}}",
      }),
    });
  });

  it("lists tenant-scoped templates", async () => {
    listEmailTemplatesMock.mockResolvedValueOnce([
      { id: "template_1", tenant_id: "tenant_1", builder: "react_email" },
    ]);

    const response = await GET(
      new Request("https://example.com/api/email/templates") as NextRequest,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.templates).toHaveLength(1);
    expect(listEmailTemplatesMock).toHaveBeenCalledWith("tenant_1");
  });

  it("rejects unknown merge tags before creating templates", async () => {
    const response = await POST(
      createJsonRequest({
        name: "Broken",
        builder: "react_email",
        designJson: { type: "doc", content: [] },
        htmlContent: "<p>{{made_up_tag}}</p>",
        textContent: "{{made_up_tag}}",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Unknown merge tag: made_up_tag");
    expect(createEmailTemplateMock).not.toHaveBeenCalled();
  });

  it("reads one tenant-scoped template", async () => {
    readEmailTemplateMock.mockResolvedValueOnce({
      id: "template_1",
      tenant_id: "tenant_1",
      builder: "react_email",
    });

    const response = await GET_TEMPLATE(
      new Request(
        "https://example.com/api/email/templates/template_1",
      ) as NextRequest,
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.template.id).toBe("template_1");
    expect(readEmailTemplateMock).toHaveBeenCalledWith(
      "tenant_1",
      "template_1",
    );
  });

  it("returns 404 when a template does not exist", async () => {
    readEmailTemplateMock.mockResolvedValueOnce(null);

    const response = await GET_TEMPLATE(
      new Request(
        "https://example.com/api/email/templates/template_404",
      ) as NextRequest,
      templateContext("template_404"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Email template not found");
  });

  it("patches templates and creates a new version through the store", async () => {
    updateEmailTemplateMock.mockResolvedValueOnce({
      template: {
        id: "template_1",
        name: "Updated",
        version: 2,
      },
      version: { id: "version_2", version: 2 },
    });

    const response = await PATCH_TEMPLATE(
      createJsonRequest(
        {
          name: "Updated",
          htmlContent: "<p>Hello {{first_name}}</p>",
          textContent: "Hello {{first_name}}",
        },
        "PATCH",
      ),
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.template.version).toBe(2);
    expect(updateEmailTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      templateId: "template_1",
      patch: expect.objectContaining({ name: "Updated" }),
    });
  });

  it("deletes templates through the tenant-scoped store", async () => {
    deleteEmailTemplateMock.mockResolvedValueOnce(undefined);

    const response = await DELETE_TEMPLATE(
      new Request("https://example.com/api/email/templates/template_1", {
        method: "DELETE",
      }) as NextRequest,
      templateContext(),
    );

    expect(response.status).toBe(204);
    expect(deleteEmailTemplateMock).toHaveBeenCalledWith(
      "tenant_1",
      "template_1",
    );
  });

  it("duplicates templates into a new versioned template", async () => {
    duplicateEmailTemplateMock.mockResolvedValueOnce({
      template: { id: "template_copy", name: "May Update Copy", version: 1 },
      version: { id: "version_copy", version: 1 },
    });

    const response = await POST_DUPLICATE(
      new Request(
        "https://example.com/api/email/templates/template_1/duplicate",
        {
          method: "POST",
        },
      ) as NextRequest,
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.template.id).toBe("template_copy");
    expect(duplicateEmailTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      templateId: "template_1",
    });
  });

  it("exports stored HTML and text content", async () => {
    requireEmailTemplateMock.mockResolvedValueOnce({
      id: "template_1",
      builder: "react_email",
      builder_version: "1.3.8",
      design_json: { type: "doc", content: [] },
      html_content: "<p>Hello</p>",
      text_content: "Hello",
      default_subject: "May update",
      default_preheader: "A note",
      version: 3,
    });

    const response = await POST_EXPORT(
      new Request("https://example.com/api/email/templates/template_1/export", {
        method: "POST",
      }) as NextRequest,
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.export).toMatchObject({
      builder: "react_email",
      html: "<p>Hello</p>",
      text: "Hello",
      version: 3,
    });
  });

  it("rejects export when a template has no current exported content", async () => {
    requireEmailTemplateMock.mockResolvedValueOnce({
      id: "template_1",
      html_content: null,
      text_content: null,
    });

    const response = await POST_EXPORT(
      new Request("https://example.com/api/email/templates/template_1/export", {
        method: "POST",
      }) as NextRequest,
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("Template must be exported");
  });

  it("lists template versions after confirming the template belongs to tenant", async () => {
    requireEmailTemplateMock.mockResolvedValueOnce({ id: "template_1" });
    listEmailTemplateVersionsMock.mockResolvedValueOnce([
      { id: "version_2", template_id: "template_1", version: 2 },
    ]);

    const response = await GET_VERSIONS(
      new Request(
        "https://example.com/api/email/templates/template_1/versions",
      ) as NextRequest,
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.versions).toHaveLength(1);
    expect(requireEmailTemplateMock).toHaveBeenCalledWith(
      "tenant_1",
      "template_1",
    );
    expect(listEmailTemplateVersionsMock).toHaveBeenCalledWith(
      "tenant_1",
      "template_1",
    );
  });

  it("restores a numbered template version", async () => {
    restoreEmailTemplateVersionMock.mockResolvedValueOnce({
      template: { id: "template_1", version: 3 },
      version: { id: "version_3", version: 3 },
    });

    const response = await POST_RESTORE(
      new Request(
        "https://example.com/api/email/templates/template_1/versions/2/restore",
        { method: "POST" },
      ) as NextRequest,
      restoreContext("template_1", "2"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.template.version).toBe(3);
    expect(restoreEmailTemplateVersionMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      templateId: "template_1",
      version: 2,
    });
  });

  it("rejects invalid restore versions", async () => {
    const response = await POST_RESTORE(
      new Request(
        "https://example.com/api/email/templates/template_1/versions/nope/restore",
        { method: "POST" },
      ) as NextRequest,
      restoreContext("template_1", "nope"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Template version must be a positive integer");
    expect(restoreEmailTemplateVersionMock).not.toHaveBeenCalled();
  });
});
