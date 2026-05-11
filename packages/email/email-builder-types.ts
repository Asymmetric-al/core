export const EMAIL_BUILDER_KINDS = ["unlayer", "react_email"] as const;

export type EmailBuilderKind = (typeof EMAIL_BUILDER_KINDS)[number];

export type EmailStudioTemplateStatus = "draft" | "published" | "archived";

export interface EmailDesignEnvelope<TDesign = Record<string, unknown>> {
  builder: EmailBuilderKind;
  builderVersion: string;
  design: TDesign;
  html?: string | null;
  text?: string | null;
  exportedAt?: string | null;
  metadata?: {
    subject?: string;
    preheader?: string;
    schemaVersion?: number;
    migrationSource?: EmailBuilderKind;
    migratedAt?: string;
  };
}

export interface ReactEmailDesignJSON extends Record<string, unknown> {
  type: "doc";
  content?: unknown[];
}

export interface EmailStudioExportOptions {
  subject?: string;
  preheader?: string;
  mergeTagSamples?: Record<string, string>;
  minify?: boolean;
}

export interface EmailStudioExportResult {
  builder: EmailBuilderKind;
  builderVersion: string;
  design: Record<string, unknown>;
  html: string;
  text: string;
  subject?: string;
  preheader?: string;
}

export interface EmailStudioEditorHandle {
  getBuilderKind(): EmailBuilderKind;
  exportEmail(
    options?: EmailStudioExportOptions,
  ): Promise<EmailStudioExportResult>;
  exportDesign(): Promise<Record<string, unknown>>;
  saveDesign(
    options?: EmailStudioExportOptions,
  ): Promise<Record<string, unknown>>;
  loadDesign(design: Record<string, unknown> | string): void;
  undo(): void;
  redo(): void;
  focus?(): void;
  canUndo?(): boolean;
  canRedo?(): boolean;
  insertMergeTag?(key: string): void;
}

export const EMPTY_REACT_EMAIL_DESIGN: ReactEmailDesignJSON = {
  type: "doc",
  content: [],
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEmailBuilderKind(value: unknown): value is EmailBuilderKind {
  return (
    typeof value === "string" &&
    (EMAIL_BUILDER_KINDS as readonly string[]).includes(value)
  );
}

export function normalizeEmailBuilderKind(
  value: unknown,
  fallback: EmailBuilderKind = "react_email",
): EmailBuilderKind {
  return isEmailBuilderKind(value) ? value : fallback;
}

export function isReactEmailDesignJSON(
  value: unknown,
): value is ReactEmailDesignJSON {
  return isRecord(value) && value.type === "doc";
}

export function isEmailDesignEnvelope(
  value: unknown,
): value is EmailDesignEnvelope {
  return (
    isRecord(value) &&
    isEmailBuilderKind(value.builder) &&
    typeof value.builderVersion === "string" &&
    isRecord(value.design)
  );
}

export function createEmailDesignEnvelope<
  TDesign extends Record<string, unknown>,
>(
  input: Omit<EmailDesignEnvelope<TDesign>, "builderVersion"> & {
    builderVersion?: string | null;
  },
): EmailDesignEnvelope<TDesign> {
  return {
    ...input,
    builderVersion: input.builderVersion || "unknown",
  };
}
