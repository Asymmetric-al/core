import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import {
  archivePdfTemplate,
  createPdfTemplate,
  listPdfTemplates,
  PdfTemplateStorageUnavailableError,
  updatePdfTemplate,
  type PdfTemplateRow,
} from "../../../../packages/api/src/pdf-templates/store";

type QueryResponse = {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
};

type QueryRecord = {
  table: string;
  action?: string;
  payload?: unknown;
  filters: Array<[string, unknown]>;
  selected?: string;
};

class FakeQuery {
  readonly filters: Array<[string, unknown]> = [];
  action?: string;
  payload?: unknown;
  selected?: string;

  constructor(
    readonly table: string,
    private readonly responses: QueryResponse[],
    private readonly records: QueryRecord[],
  ) {
    this.records.push(this);
  }

  insert(payload: unknown) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.action = "update";
    this.payload = payload;
    return this;
  }

  select(columns: string) {
    this.selected = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push([`${column}:neq`, value]);
    return this;
  }

  order() {
    return this.resolve();
  }

  single() {
    return this.resolve();
  }

  maybeSingle() {
    return this.resolve();
  }

  private resolve() {
    const next = this.responses.shift();
    if (!next) {
      throw new Error(`No fake Supabase response for ${this.table}`);
    }
    return Promise.resolve({
      data: next.data ?? null,
      error: next.error ?? null,
    });
  }
}

function createFakeSupabase(responses: QueryResponse[]) {
  const records: QueryRecord[] = [];
  const client = {
    from(table: string) {
      return new FakeQuery(table, responses, records);
    },
  };
  return { client, records };
}

function templateRow(overrides: Partial<PdfTemplateRow> = {}): PdfTemplateRow {
  return {
    id: "6ff7cd0e-ad92-455f-9bfc-6da56ce7ff6d",
    tenant_id: "tenant_1",
    name: "Annual Statement",
    description: null,
    thumbnail: null,
    design: { body: { rows: [] } },
    html: "<p>Hello</p>",
    category: "annual_statement",
    page_size: "Letter",
    orientation: "portrait",
    margins: { top: 72, right: 72, bottom: 72, left: 72 },
    tags: [],
    status: "draft",
    is_default: false,
    engine: "unlayer",
    native_schema_version: null,
    native_template_current_draft_version_id: null,
    native_template_current_published_version_id: null,
    legacy_unlayer_project_id: null,
    migration_status: "not_started",
    migration_report: {},
    created_by: "profile_1",
    created_at: "2026-05-15T00:00:00.000Z",
    updated_at: "2026-05-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("pdf template store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists tenant templates while excluding archived rows by default", async () => {
    const row = templateRow();
    const { client, records } = createFakeSupabase([{ data: [row] }]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await listPdfTemplates("tenant_1");

    expect(result).toEqual([row]);
    expect(records[0]).toMatchObject({
      table: "pdf_templates",
      filters: [
        ["tenant_id", "tenant_1"],
        ["status:neq", "archived"],
      ],
    });
  });

  it("creates tenant-scoped templates with safe document defaults", async () => {
    const row = templateRow({ category: "tax_receipt" });
    const { client, records } = createFakeSupabase([{ data: row }]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await createPdfTemplate({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: {
        name: "Tax receipt",
        design: { body: { rows: [] } },
        category: "tax_receipt",
      },
    });

    expect(result).toEqual(row);
    expect(records[0]).toMatchObject({
      table: "pdf_templates",
      action: "insert",
      payload: expect.objectContaining({
        tenant_id: "tenant_1",
        name: "Tax receipt",
        design: { body: { rows: [] } },
        category: "tax_receipt",
        page_size: "Letter",
        orientation: "portrait",
        status: "draft",
        engine: "unlayer",
        migration_status: "not_started",
        created_by: "profile_1",
      }),
    });
  });

  it("creates native missionary report templates without generated HTML as source", async () => {
    const row = templateRow({
      category: "missionary_report",
      engine: "asym_pdf_document_builder",
      html: null,
      migration_status: "rebuilt",
      native_schema_version: 1,
    });
    const { client, records } = createFakeSupabase([{ data: row }]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await createPdfTemplate({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: {
        name: "Missionary report",
        design: { version: 1, content: { type: "doc", content: [] } },
        category: "missionary_report",
        engine: "asym_pdf_document_builder",
        html: null,
        migration_status: "rebuilt",
        migration_report: {
          unsupportedFeatures: [],
        },
        native_schema_version: 1,
      },
    });

    expect(result).toEqual(row);
    expect(records[0]).toMatchObject({
      table: "pdf_templates",
      action: "insert",
      payload: expect.objectContaining({
        category: "missionary_report",
        engine: "asym_pdf_document_builder",
        html: null,
        migration_report: {
          unsupportedFeatures: [],
        },
        migration_status: "rebuilt",
        native_schema_version: 1,
      }),
    });
  });

  it("requires the current tenant row before updating templates", async () => {
    const current = templateRow();
    const updated = templateRow({ name: "Updated" });
    const { client, records } = createFakeSupabase([
      { data: current },
      { data: updated },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await updatePdfTemplate({
      tenantId: "tenant_1",
      templateId: current.id,
      patch: { name: "Updated" },
    });

    expect(result.name).toBe("Updated");
    expect(records[0]).toMatchObject({
      table: "pdf_templates",
      filters: [
        ["tenant_id", "tenant_1"],
        ["id", current.id],
      ],
    });
    expect(records[1]).toMatchObject({
      table: "pdf_templates",
      action: "update",
      payload: expect.objectContaining({ name: "Updated" }),
    });
  });

  it("archives templates as the rollback-friendly delete path", async () => {
    const current = templateRow();
    const { client, records } = createFakeSupabase([
      { data: current },
      { data: null },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    await archivePdfTemplate("tenant_1", current.id);

    expect(records[1]).toMatchObject({
      table: "pdf_templates",
      action: "update",
      payload: expect.objectContaining({ status: "archived" }),
      filters: [
        ["tenant_id", "tenant_1"],
        ["id", current.id],
      ],
    });
  });

  it("normalizes missing storage into an operator-safe setup error", async () => {
    const { client } = createFakeSupabase([
      {
        error: {
          code: "PGRST205",
          message: "Could not find the table public.pdf_templates",
        },
      },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    await expect(listPdfTemplates("tenant_1")).rejects.toBeInstanceOf(
      PdfTemplateStorageUnavailableError,
    );
  });
});
