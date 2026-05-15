import { serverEnv } from "@asym/env";

export const PDF_STUDIO_NATIVE_BUILDER_FLAG_NAME = "pdf_studio.native_builder";

export const PDF_STUDIO_NATIVE_ROLLOUT_MODES = [
  "legacy_only",
  "native_preview",
  "native_render_test",
  "native_publish",
  "native_batch",
  "native_default",
] as const;

export type PDFStudioNativeRolloutMode =
  (typeof PDF_STUDIO_NATIVE_ROLLOUT_MODES)[number];

export type PDFStudioPackageRolloutMode =
  | "legacy_only"
  | "native_preview"
  | "native_new_templates"
  | "native_publish"
  | "native_batch";

export const PDF_STUDIO_NATIVE_TEMPLATE_CATEGORIES = [
  "donation_receipt",
  "tax_receipt",
  "annual_statement",
  "annual_giving_statement",
  "letter",
  "donor_letter",
  "missionary_report",
  "report",
  "financial_report",
  "invoice",
  "certificate",
  "custom",
] as const;

export type PDFStudioNativeTemplateCategory =
  (typeof PDF_STUDIO_NATIVE_TEMPLATE_CATEGORIES)[number];

export interface PDFStudioNativeBuilderEnv {
  PDF_STUDIO_NATIVE_BUILDER_ENABLED?: boolean | string;
  PDF_STUDIO_NATIVE_BUILDER_ROLLOUT?: PDFStudioNativeRolloutMode | string;
  PDF_STUDIO_NATIVE_BUILDER_TENANTS?: string;
  PDF_STUDIO_NATIVE_BUILDER_CATEGORIES?: string;
  PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED?: boolean | string;
  PDF_STUDIO_DOCRAPTOR_MODE?: "test" | "production" | string;
  PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS?: number | string;
  PDF_STUDIO_RENDER_BASE_URL?: string;
  PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS?: number | string;
  PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET?: string;
  PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL?: string;
  DOCRAPTOR_API_KEY?: string;
}

export interface PDFStudioDocRaptorConfig {
  provider: "docraptor";
  configured: boolean;
  mode: "test" | "production";
  timeoutMs: number;
  renderBaseUrl?: string;
  assetUrlTtlSeconds: number;
  callbackConfigured: boolean;
  missing: string[];
}

export interface PDFStudioNativeBuilderConfig {
  enabled: boolean;
  rolloutMode: PDFStudioNativeRolloutMode;
  packageRolloutMode: PDFStudioPackageRolloutMode;
  tenantAllowlist: string[];
  categoryAllowlist: PDFStudioNativeTemplateCategory[];
  legacyFallbackEnabled: boolean;
  browserPreviewIsAuthoringFeedbackOnly: true;
  productionRenderingEnabled: boolean;
  nativeNewTemplatesEnabled: boolean;
  nativeDefaultEnabled: boolean;
  docraptor: PDFStudioDocRaptorConfig;
}

export interface PDFStudioNativeFeatureFlagContract {
  flagName: typeof PDF_STUDIO_NATIVE_BUILDER_FLAG_NAME;
  enabled: boolean;
  tenantId?: string;
  rolloutMode: PDFStudioPackageRolloutMode;
  fallbackEngine: "unlayer";
  metadata: Record<string, string | number | boolean | string[]>;
}

export interface ResolvePDFStudioNativeFeatureFlagInput {
  env?: PDFStudioNativeBuilderEnv;
  tenantId?: string;
  category?: string;
}

const defaultDocRaptorTimeoutMs = 30_000;
const defaultAssetUrlTtlSeconds = 900;

const productionRenderingModes = new Set<PDFStudioNativeRolloutMode>([
  "native_render_test",
  "native_publish",
  "native_batch",
  "native_default",
]);

const nativeNewTemplateModes = new Set<PDFStudioNativeRolloutMode>([
  "native_preview",
  "native_render_test",
  "native_publish",
  "native_batch",
  "native_default",
]);

const nativeTemplateCategorySet = new Set<string>(
  PDF_STUDIO_NATIVE_TEMPLATE_CATEGORIES,
);

export function resolvePDFStudioNativeBuilderConfig(
  env: PDFStudioNativeBuilderEnv = serverEnv,
): PDFStudioNativeBuilderConfig {
  const enabled = readBoolean(env.PDF_STUDIO_NATIVE_BUILDER_ENABLED, false);
  const rolloutMode = readRolloutMode(env.PDF_STUDIO_NATIVE_BUILDER_ROLLOUT);
  const productionRenderingEnabled =
    enabled && productionRenderingModes.has(rolloutMode);
  const docraptor = resolveDocRaptorConfig(env, productionRenderingEnabled);

  return {
    browserPreviewIsAuthoringFeedbackOnly: true,
    categoryAllowlist: readCategoryAllowlist(
      env.PDF_STUDIO_NATIVE_BUILDER_CATEGORIES,
    ),
    docraptor,
    enabled,
    legacyFallbackEnabled: readBoolean(
      env.PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED,
      true,
    ),
    nativeDefaultEnabled: enabled && rolloutMode === "native_default",
    nativeNewTemplatesEnabled:
      enabled && nativeNewTemplateModes.has(rolloutMode),
    packageRolloutMode: toPackageRolloutMode(rolloutMode),
    productionRenderingEnabled,
    rolloutMode,
    tenantAllowlist: readCsv(env.PDF_STUDIO_NATIVE_BUILDER_TENANTS),
  };
}

export function resolvePDFStudioNativeFeatureFlagContract(
  input: ResolvePDFStudioNativeFeatureFlagInput = {},
): PDFStudioNativeFeatureFlagContract {
  const config = resolvePDFStudioNativeBuilderConfig(input.env);
  const tenantAllowed = isAllowlisted(config.tenantAllowlist, input.tenantId);
  const categoryAllowed = isCategoryAllowlisted(
    config.categoryAllowlist,
    input.category,
  );
  const enabled = config.enabled && tenantAllowed && categoryAllowed;

  return {
    enabled,
    fallbackEngine: "unlayer",
    flagName: PDF_STUDIO_NATIVE_BUILDER_FLAG_NAME,
    metadata: {
      browserPreviewIsAuthoringFeedbackOnly:
        config.browserPreviewIsAuthoringFeedbackOnly,
      categoryAllowlist: config.categoryAllowlist,
      coreRolloutMode: config.rolloutMode,
      docraptorConfigured: config.docraptor.configured,
      legacyFallbackEnabled: config.legacyFallbackEnabled,
      productionRenderingEnabled: config.productionRenderingEnabled,
      tenantAllowlist: config.tenantAllowlist,
    },
    rolloutMode: config.packageRolloutMode,
    tenantId: input.tenantId,
  };
}

export function isPDFStudioNativeCategory(
  category: string | undefined,
): category is PDFStudioNativeTemplateCategory {
  return (
    typeof category === "string" && nativeTemplateCategorySet.has(category)
  );
}

function resolveDocRaptorConfig(
  env: PDFStudioNativeBuilderEnv,
  productionRenderingEnabled: boolean,
): PDFStudioDocRaptorConfig {
  const apiKey = readTrimmed(env.DOCRAPTOR_API_KEY);
  const mode =
    env.PDF_STUDIO_DOCRAPTOR_MODE === "production" ? "production" : "test";
  const callbackSecret = readTrimmed(
    env.PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET,
  );
  const callbackUrl = readTrimmed(env.PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL);
  const missing = collectDocRaptorMissingConfig({
    apiKey,
    callbackSecret,
    callbackUrl,
    productionRenderingEnabled,
  });

  return {
    assetUrlTtlSeconds: readPositiveInteger(
      env.PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS,
      defaultAssetUrlTtlSeconds,
    ),
    callbackConfigured:
      callbackSecret !== undefined && callbackUrl !== undefined,
    configured: apiKey !== undefined && missing.length === 0,
    missing,
    mode,
    provider: "docraptor",
    renderBaseUrl: readTrimmed(env.PDF_STUDIO_RENDER_BASE_URL),
    timeoutMs: readPositiveInteger(
      env.PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS,
      defaultDocRaptorTimeoutMs,
    ),
  };
}

function collectDocRaptorMissingConfig(input: {
  apiKey?: string;
  callbackSecret?: string;
  callbackUrl?: string;
  productionRenderingEnabled: boolean;
}): string[] {
  if (!input.productionRenderingEnabled) {
    return [];
  }

  const missing: string[] = [];

  if (input.apiKey === undefined) {
    missing.push("DOCRAPTOR_API_KEY");
  }
  if (input.callbackSecret === undefined) {
    missing.push("PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET");
  }
  if (input.callbackUrl === undefined) {
    missing.push("PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL");
  }

  return missing;
}

function readRolloutMode(value: unknown): PDFStudioNativeRolloutMode {
  if (
    typeof value === "string" &&
    PDF_STUDIO_NATIVE_ROLLOUT_MODES.includes(
      value as PDFStudioNativeRolloutMode,
    )
  ) {
    return value as PDFStudioNativeRolloutMode;
  }

  return "legacy_only";
}

function toPackageRolloutMode(
  rolloutMode: PDFStudioNativeRolloutMode,
): PDFStudioPackageRolloutMode {
  if (rolloutMode === "native_default") {
    return "native_new_templates";
  }

  if (rolloutMode === "native_render_test") {
    return "native_preview";
  }

  return rolloutMode;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
}

function readPositiveInteger(value: unknown, fallback: number): number {
  const numberValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (Number.isInteger(numberValue) && numberValue > 0) {
    return numberValue;
  }

  return fallback;
}

function readCsv(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readCategoryAllowlist(
  value: unknown,
): PDFStudioNativeTemplateCategory[] {
  return readCsv(value).filter(isPDFStudioNativeCategory);
}

function readTrimmed(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isAllowlisted(
  allowlist: readonly string[],
  value: string | undefined,
) {
  return (
    allowlist.length === 0 || (value !== undefined && allowlist.includes(value))
  );
}

function isCategoryAllowlisted(
  allowlist: readonly PDFStudioNativeTemplateCategory[],
  value: string | undefined,
) {
  return (
    allowlist.length === 0 ||
    (isPDFStudioNativeCategory(value) && allowlist.includes(value))
  );
}
