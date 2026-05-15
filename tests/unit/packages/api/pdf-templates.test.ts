import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthContextMock,
  requireRoleMock,
  archivePdfTemplateMock,
  createPdfTemplateMock,
  listPdfTemplatesMock,
  readPdfTemplateMock,
  updatePdfTemplateMock,
} = vi.hoisted(() => ({
  getAuthContextMock: vi.fn(),
  requireRoleMock: vi.fn(),
  archivePdfTemplateMock: vi.fn(),
  createPdfTemplateMock: vi.fn(),
  listPdfTemplatesMock: vi.fn(),
  readPdfTemplateMock: vi.fn(),
  updatePdfTemplateMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("../../../../packages/api/src/pdf-templates/store", () => ({
  archivePdfTemplate: archivePdfTemplateMock,
  createPdfTemplate: createPdfTemplateMock,
  listPdfTemplates: listPdfTemplatesMock,
  readPdfTemplate: readPdfTemplateMock,
  updatePdfTemplate: updatePdfTemplateMock,
}));

vi.mock("../../../../packages/api/src/pdf-templates/store.ts", () => ({
  archivePdfTemplate: archivePdfTemplateMock,
  createPdfTemplate: createPdfTemplateMock,
  listPdfTemplates: listPdfTemplatesMock,
  readPdfTemplate: readPdfTemplateMock,
  updatePdfTemplate: updatePdfTemplateMock,
}));

import {
  DELETE_TEMPLATE,
  GET,
  GET_TEMPLATE,
  POST,
  PUT_TEMPLATE,
} from "../../../../packages/api/src/pdf-templates/index";

const TEMPLATE_ID = "6ff7cd0e-ad92-455f-9bfc-6da56ce7ff6d";

function request(path: string, init?: RequestInit) {
  return new NextRequest(`https://admin.example.com${path}`, init);
}

function jsonRequest(path: string, body: unknown, method = "POST") {
  return request(path, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function templateContext(templateId = TEMPLATE_ID) {
  return {
    params: Promise.resolve({ templateId }),
  };
}

describe("api/pdf-templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockResolvedValue({
      tenantId: "tenant_1",
      profileId: "profile_1",
      role: "admin",
    });
    requireRoleMock.mockReturnValue(undefined);
  });

  it("lists active tenant PDF templates and preserves filters", async () => {
    listPdfTemplatesMock.mockResolvedValueOnce([
      {
        id: TEMPLATE_ID,
        tenant_id: "tenant_1",
        name: "Annual Statement",
        status: "draft",
      },
    ]);

    const response = await GET(
      request(
        "/api/pdf-templates?category=annual_statement&status=draft&includeArchived=true",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.templates).toHaveLength(1);
    expect(listPdfTemplatesMock).toHaveBeenCalledWith("tenant_1", {
      category: "annual_statement",
      status: "draft",
      includeArchived: true,
    });
  });

  it("creates tenant-scoped document templates without provider calls", async () => {
    createPdfTemplateMock.mockResolvedValueOnce({
      id: TEMPLATE_ID,
      tenant_id: "tenant_1",
      name: "Tax Receipt",
      status: "draft",
    });

    const response = await POST(
      jsonRequest("/api/pdf-templates", {
        name: "Tax Receipt",
        description: "Year-end donor receipt",
        design: { body: { rows: [] } },
        html: "<p>{{full_name}}</p>",
        category: "tax_receipt",
        page_size: "Letter",
        orientation: "portrait",
        status: "draft",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.template.id).toBe(TEMPLATE_ID);
    expect(createPdfTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: expect.objectContaining({
        name: "Tax Receipt",
        category: "tax_receipt",
        design: { body: { rows: [] } },
      }),
    });
  });

  it("accepts native missionary report templates while keeping DocRaptor server-only", async () => {
    createPdfTemplateMock.mockResolvedValueOnce({
      id: TEMPLATE_ID,
      tenant_id: "tenant_1",
      name: "Missionary report",
      category: "missionary_report",
      engine: "asym_pdf_document_builder",
      status: "draft",
    });

    const response = await POST(
      jsonRequest("/api/pdf-templates", {
        name: "Missionary report",
        design: {
          version: 1,
          content: { type: "doc", content: [] },
        },
        html: null,
        category: "missionary_report",
        engine: "asym_pdf_document_builder",
        native_schema_version: 1,
        migration_status: "manual_rebuild_required",
        migration_report: {
          unsupportedFeatures: ["legacy custom HTML block"],
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.template.engine).toBe("asym_pdf_document_builder");
    expect(createPdfTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: expect.objectContaining({
        category: "missionary_report",
        engine: "asym_pdf_document_builder",
        html: null,
        migration_status: "manual_rebuild_required",
        native_schema_version: 1,
      }),
    });
  });

  it("rejects invalid template ids before touching storage", async () => {
    const response = await GET_TEMPLATE(
      request("/api/pdf-templates/not-a-uuid"),
      templateContext("not-a-uuid"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Template id must be a UUID");
    expect(readPdfTemplateMock).not.toHaveBeenCalled();
  });

  it("hides archived templates from direct reads", async () => {
    readPdfTemplateMock.mockResolvedValueOnce({
      id: TEMPLATE_ID,
      tenant_id: "tenant_1",
      status: "archived",
    });

    const response = await GET_TEMPLATE(
      request(`/api/pdf-templates/${TEMPLATE_ID}`),
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("PDF template not found");
  });

  it("updates existing templates through the tenant-scoped store", async () => {
    updatePdfTemplateMock.mockResolvedValueOnce({
      id: TEMPLATE_ID,
      tenant_id: "tenant_1",
      name: "Updated receipt",
      status: "published",
    });

    const response = await PUT_TEMPLATE(
      jsonRequest(
        `/api/pdf-templates/${TEMPLATE_ID}`,
        {
          name: "Updated receipt",
          status: "published",
        },
        "PUT",
      ),
      templateContext(),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.template.status).toBe("published");
    expect(updatePdfTemplateMock).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      templateId: TEMPLATE_ID,
      patch: expect.objectContaining({
        name: "Updated receipt",
        status: "published",
      }),
    });
  });

  it("archives templates instead of hard-deleting operational history", async () => {
    archivePdfTemplateMock.mockResolvedValueOnce(undefined);

    const response = await DELETE_TEMPLATE(
      request(`/api/pdf-templates/${TEMPLATE_ID}`, { method: "DELETE" }),
      templateContext(),
    );

    expect(response.status).toBe(204);
    expect(archivePdfTemplateMock).toHaveBeenCalledWith(
      "tenant_1",
      TEMPLATE_ID,
    );
  });
});
