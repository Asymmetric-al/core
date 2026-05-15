import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { starterPdfTemplateFixtureByCategory } from "@asym/pdf-template-schema";

const { getAuthContextMock, readPdfTemplateMock, requireRoleMock } = vi.hoisted(
  () => ({
    getAuthContextMock: vi.fn(),
    readPdfTemplateMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }),
);

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("../../../../packages/api/src/pdf-templates/store", () => ({
  createPdfTemplate: vi.fn(),
  readPdfTemplate: readPdfTemplateMock,
  updatePdfTemplate: vi.fn(),
}));

vi.mock("../../../../packages/api/src/pdf-templates/store.ts", () => ({
  createPdfTemplate: vi.fn(),
  readPdfTemplate: readPdfTemplateMock,
  updatePdfTemplate: vi.fn(),
}));

import {
  POST_NATIVE_MIGRATION_REPORT,
  POST_NATIVE_PREVIEW,
  POST_NATIVE_RENDER,
} from "../../../../packages/api/src/pdf-templates/native";

const TEMPLATE_ID = "6ff7cd0e-ad92-455f-9bfc-6da56ce7ff6d";

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`https://admin.example.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("native PDF Studio routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      profileId: "profile_1",
      role: "admin",
      tenantId: "tenant_1",
      userId: "user_1",
    });
    requireRoleMock.mockReturnValue(undefined);
  });

  it("returns browser preview feedback without requiring DocRaptor credentials", async () => {
    const fixture = starterPdfTemplateFixtureByCategory.donation_receipt;
    const response = await POST_NATIVE_PREVIEW(
      jsonRequest("/api/pdf-templates/native/preview", {
        dataContext: fixture.sampleData,
        previewId: "route_preview",
        template: fixture.template,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.preview.status).toBe("success");
    expect(body.preview.metadata.finalPdfFidelity).toBe(false);
    expect(body.preflight.ok).toBe(true);
  });

  it("reports official render unavailability without leaking provider secrets", async () => {
    const fixture = starterPdfTemplateFixtureByCategory.donation_receipt;
    const response = await POST_NATIVE_RENDER(
      jsonRequest("/api/pdf-templates/native/render", {
        dataContext: fixture.sampleData,
        renderId: "route_render",
        template: fixture.template,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.render.status).toBe("error");
    expect(body.render.errors[0].code).toBe("native_render_disabled");
    expect(JSON.stringify(body)).not.toContain("DOCRAPTOR_API_KEY");
  });

  it("creates unsupported-feature reports for manual Unlayer rebuilds", async () => {
    readPdfTemplateMock.mockResolvedValueOnce({
      category: "letter",
      design: { body: { rows: [] } },
      engine: "unlayer",
      html: "<div>Legacy</div>",
      id: TEMPLATE_ID,
      name: "Legacy donor letter",
      tenant_id: "tenant_1",
    });

    const response = await POST_NATIVE_MIGRATION_REPORT(
      jsonRequest("/api/pdf-templates/native/migration-report", {
        templateId: TEMPLATE_ID,
        unsupportedFeatures: [
          {
            code: "raw_html_block",
            message: "Raw HTML must be rebuilt manually.",
            severity: "warning",
          },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.report.strategy).toBe("manual_rebuild_with_report");
    expect(body.report.status).toBe("needs_manual_rebuild");
    expect(body.report.legacyTemplate.category).toBe("donor_letter");
    expect(readPdfTemplateMock).toHaveBeenCalledWith("tenant_1", TEMPLATE_ID);
  });
});
