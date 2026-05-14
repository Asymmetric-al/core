import {
  DEFAULT_MERGE_TAG_REGISTRY,
  getMergeTagDefinition,
  getMergeTagDefinitions,
  type MergeTagDefinition,
  type MergeTagRegistry,
} from "./merge-tags";

import type { EmailMessageType } from "./types";

const MERGE_TAG_PATTERN =
  /(?<!\{)\{\{\s*([a-zA-Z][a-zA-Z0-9_.-]*)\s*\}\}(?!\})/g;
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export interface MergeTagValidationOptions {
  registry?: MergeTagRegistry;
  values?: Record<string, unknown>;
  messageType?: EmailMessageType;
  requireValues?: boolean;
}

export interface MergeTagValidation {
  tags: string[];
  unknownTags: string[];
  missingRequiredTags: string[];
  missingValueTags: string[];
  unsafeUrlTags: string[];
  errors: string[];
  warnings: string[];
  valid: boolean;
}

export interface RenderMergeTagsOptions extends MergeTagValidationOptions {
  escapeHtml?: boolean;
  previewMode?: boolean;
}

export interface RenderedTemplate {
  html: string;
  text: string;
  validation: MergeTagValidation;
}

function uniqueInOrder(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function stringifyValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function escapeHtmlValue(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isSafeUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

function getRequiredTagsForMessageType(
  messageType: EmailMessageType | undefined,
  registry: MergeTagRegistry,
): MergeTagDefinition[] {
  const required = getMergeTagDefinitions(registry).filter(
    (tag) => tag.required,
  );
  if (messageType !== "marketing") {
    return required.filter((tag) => tag.key !== "unsubscribe_link");
  }
  return required;
}

export function parseMergeTags(input: string): string[] {
  const matches = Array.from(input.matchAll(MERGE_TAG_PATTERN));
  return uniqueInOrder(
    matches
      .map((match) => match[1])
      .filter((tag): tag is string => typeof tag === "string" && tag !== ""),
  );
}

export function validateMergeTags(
  input: string,
  options: MergeTagValidationOptions = {},
): MergeTagValidation {
  const registry = options.registry ?? DEFAULT_MERGE_TAG_REGISTRY;
  const tags = parseMergeTags(input);
  const unknownTags = tags.filter(
    (tag) => getMergeTagDefinition(tag, registry) === null,
  );
  const requiredTags = getRequiredTagsForMessageType(
    options.messageType,
    registry,
  );
  const missingRequiredTags = requiredTags
    .filter((tag) => !tags.includes(tag.key))
    .map((tag) => tag.key);
  const values = options.values ?? {};
  const missingValueTags = options.requireValues
    ? tags.filter((tag) => isBlank(values[tag]))
    : [];
  const unsafeUrlTags = tags.filter((tag) => {
    const definition = getMergeTagDefinition(tag, registry);
    const value = values[tag];
    return (
      definition?.type === "url" &&
      !isBlank(value) &&
      !isSafeUrl(stringifyValue(value))
    );
  });
  const errors = [
    ...unknownTags.map((tag) => `Unknown merge tag: ${tag}`),
    ...missingRequiredTags.map((tag) => `Missing required merge tag: ${tag}`),
    ...missingValueTags.map((tag) => `Missing value for merge tag: ${tag}`),
    ...unsafeUrlTags.map((tag) => `Unsafe URL value for merge tag: ${tag}`),
  ];

  return {
    tags,
    unknownTags,
    missingRequiredTags,
    missingValueTags,
    unsafeUrlTags,
    errors,
    warnings: [],
    valid: errors.length === 0,
  };
}

export function renderMergeTags(
  input: string,
  values: Record<string, unknown>,
  options: RenderMergeTagsOptions = {},
): string {
  const validation = validateMergeTags(input, {
    ...options,
    values,
    requireValues: !options.previewMode,
  });

  if (!options.previewMode && !validation.valid) {
    throw new Error(validation.errors.join("; "));
  }

  const escapeHtml = options.escapeHtml ?? true;

  return input.replace(MERGE_TAG_PATTERN, (token, key: string) => {
    const value = values[key];
    if (isBlank(value)) {
      return options.previewMode ? token : "";
    }

    const stringValue = stringifyValue(value);
    const definition = getMergeTagDefinition(
      key,
      options.registry ?? DEFAULT_MERGE_TAG_REGISTRY,
    );

    if (definition?.type === "url" && !isSafeUrl(stringValue)) {
      if (options.previewMode) {
        return token;
      }
      throw new Error(`Unsafe URL value for merge tag: ${key}`);
    }

    return escapeHtml ? escapeHtmlValue(stringValue) : stringValue;
  });
}

export function renderTemplateForRecipient(
  template: {
    html: string;
    text: string;
  },
  recipientValues: Record<string, unknown>,
  globalValues: Record<string, unknown> = {},
  options: RenderMergeTagsOptions = {},
): RenderedTemplate {
  const values = { ...globalValues, ...recipientValues };
  const combined = `${template.html}\n${template.text}`;
  const validation = validateMergeTags(combined, {
    ...options,
    values,
    requireValues: !options.previewMode,
  });

  if (!options.previewMode && !validation.valid) {
    throw new Error(validation.errors.join("; "));
  }

  return {
    html: renderMergeTags(template.html, values, options),
    text: renderMergeTags(template.text, values, {
      ...options,
      escapeHtml: false,
    }),
    validation,
  };
}
