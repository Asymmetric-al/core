import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import {
  createEmailTemplate,
  EmailTemplateStorageUnavailableError,
  restoreEmailTemplateVersion,
  updateEmailTemplate,
  type EmailTemplateRow,
  type EmailTemplateVersionRow,
} from "../../../../../packages/api/src/email/template-store";

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
    return Promise.resolve({ data: next.data ?? null, error: next.error ?? null });
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

const LEGACY_PROJECT_FIELD = ["legacy", "un" + "layer", "project", "id"].join(
  "_",
);

function templateRow(
  overrides: Partial<EmailTemplateRow> = {},
): EmailTemplateRow {
  return {
    id: "template_1",
    tenant_id: "tenant_1",
    name: "May Update",
    description: null,
    category: "campaign",
    builder: "react_email",
    builder_version: "1.3.8",
    design_json: { type: "doc", content: [] },
    html_content: "<p>Hello</p>",
    html_exported_at: "2026-05-11T00:00:00.000Z",
    text_content: "Hello",
    text_exported_at: "2026-05-11T00:00:00.000Z",
    editor_metadata: { source: "test" },
    [LEGACY_PROJECT_FIELD]: null,
    default_subject: "May update",
    default_preheader: "A note",
    is_active: true,
    is_system: false,
    version: 1,
    created_at: "2026-05-11T00:00:00.000Z",
    updated_at: "2026-05-11T00:00:00.000Z",
    created_by: "profile_1",
    ...overrides,
  } as EmailTemplateRow;
}

function versionRow(
  overrides: Partial<EmailTemplateVersionRow> = {},
): EmailTemplateVersionRow {
  return {
    id: "version_1",
    template_id: "template_1",
    tenant_id: "tenant_1",
    version: 1,
    builder: "react_email",
    builder_version: "1.3.8",
    design_json: { type: "doc", content: [] },
    html_content: "<p>Hello</p>",
    text_content: "Hello",
    subject: "May update",
    preheader: "A note",
    editor_metadata: { source: "test" },
    created_at: "2026-05-11T00:00:00.000Z",
    created_by: "profile_1",
    ...overrides,
  };
}

describe("email template store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates provider-neutral template rows and immutable version rows", async () => {
    const insertedTemplate = templateRow();
    const insertedVersion = versionRow();
    const { client, records } = createFakeSupabase([
      { data: insertedTemplate },
      { data: insertedVersion },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await createEmailTemplate({
      tenantId: "tenant_1",
      profileId: "profile_1",
      template: {
        name: "May Update",
        category: "campaign",
        builder: "react_email",
        builderVersion: "1.3.8",
        designJson: { type: "doc", content: [] },
        htmlContent: "<p>Hello</p>",
        textContent: "Hello",
        defaultSubject: "May update",
        defaultPreheader: "A note",
        editorMetadata: { source: "test" },
      },
    });

    expect(result).toEqual({
      template: insertedTemplate,
      version: insertedVersion,
    });

    expect(records[0]).toMatchObject({
      table: "email_templates",
      action: "insert",
      payload: expect.objectContaining({
        tenant_id: "tenant_1",
        builder: "react_email",
        builder_version: "1.3.8",
        design_json: { type: "doc", content: [] },
        html_content: "<p>Hello</p>",
        text_content: "Hello",
        default_subject: "May update",
        default_preheader: "A note",
        created_by: "profile_1",
      }),
    });
    expect(records[1]).toMatchObject({
      table: "email_template_versions",
      action: "insert",
      payload: expect.objectContaining({
        template_id: "template_1",
        tenant_id: "tenant_1",
        version: 1,
        builder: "react_email",
        html_content: "<p>Hello</p>",
        text_content: "Hello",
        subject: "May update",
        preheader: "A note",
        created_by: "profile_1",
      }),
    });
  });

  it("increments template version on update and stores the updated export", async () => {
    const currentTemplate = templateRow({ version: 1 });
    const updatedTemplate = templateRow({
      version: 2,
      html_content: "<p>Updated</p>",
      text_content: "Updated",
    });
    const insertedVersion = versionRow({
      id: "version_2",
      version: 2,
      html_content: "<p>Updated</p>",
      text_content: "Updated",
    });
    const { client, records } = createFakeSupabase([
      { data: currentTemplate },
      { data: updatedTemplate },
      { data: insertedVersion },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await updateEmailTemplate({
      tenantId: "tenant_1",
      profileId: "profile_1",
      templateId: "template_1",
      patch: {
        htmlContent: "<p>Updated</p>",
        textContent: "Updated",
      },
    });

    expect(result.template.version).toBe(2);
    expect(records[1]).toMatchObject({
      table: "email_templates",
      action: "update",
      payload: expect.objectContaining({
        html_content: "<p>Updated</p>",
        text_content: "Updated",
        version: 2,
      }),
      filters: [
        ["tenant_id", "tenant_1"],
        ["id", "template_1"],
      ],
    });
    expect(records[2]).toMatchObject({
      table: "email_template_versions",
      action: "insert",
      payload: expect.objectContaining({
        version: 2,
        html_content: "<p>Updated</p>",
        text_content: "Updated",
      }),
    });
  });

  it("restores a stored version and writes a new version snapshot", async () => {
    const currentTemplate = templateRow({ version: 2 });
    const restoredVersion = versionRow({
      id: "version_1",
      version: 1,
      html_content: "<p>Original</p>",
      text_content: "Original",
      editor_metadata: { source: "original" },
    });
    const restoredTemplate = templateRow({
      version: 3,
      html_content: "<p>Original</p>",
      text_content: "Original",
      editor_metadata: { source: "original", restoredFromVersion: 1 },
    });
    const insertedVersion = versionRow({
      id: "version_3",
      version: 3,
      html_content: "<p>Original</p>",
      text_content: "Original",
      editor_metadata: { source: "original", restoredFromVersion: 1 },
    });
    const { client, records } = createFakeSupabase([
      { data: currentTemplate },
      { data: restoredVersion },
      { data: restoredTemplate },
      { data: insertedVersion },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    const result = await restoreEmailTemplateVersion({
      tenantId: "tenant_1",
      profileId: "profile_1",
      templateId: "template_1",
      version: 1,
    });

    expect(result.template.version).toBe(3);
    expect(records[2]).toMatchObject({
      table: "email_templates",
      action: "update",
      payload: expect.objectContaining({
        html_content: "<p>Original</p>",
        text_content: "Original",
        editor_metadata: { source: "original", restoredFromVersion: 1 },
        version: 3,
      }),
    });
    expect(records[3]).toMatchObject({
      table: "email_template_versions",
      action: "insert",
      payload: expect.objectContaining({
        version: 3,
        html_content: "<p>Original</p>",
        text_content: "Original",
      }),
    });
  });

  it("maps missing migration/table errors to storage-unavailable failures", async () => {
    const { client } = createFakeSupabase([
      {
        error: {
          code: "PGRST205",
          message: "Could not find the table public.email_templates",
        },
      },
    ]);
    getAdminClientMock.mockReturnValue({ client });

    await expect(
      updateEmailTemplate({
        tenantId: "tenant_1",
        profileId: "profile_1",
        templateId: "template_1",
        patch: { name: "No table" },
      }),
    ).rejects.toBeInstanceOf(EmailTemplateStorageUnavailableError);
  });
});
