import {
  resolvePDFStudioNativeBuilderConfig,
  type PDFStudioNativeBuilderEnv,
} from "@asym/config/pdf-studio-native";
import { serverEnv } from "@asym/env";

import type {
  DocRaptorClient,
  DocRaptorClientConfig,
  DocRaptorFetch,
} from "@asym/docraptor-client";

export interface PdfStudioDocRaptorRuntime {
  configured: boolean;
  mode: "test" | "production";
  timeoutMs: number;
  renderBaseUrl?: string;
  assetUrlTtlSeconds: number;
  callbackConfigured: boolean;
  productionRenderingEnabled: boolean;
  missing: string[];
}

export interface GetPdfStudioDocRaptorClientOptions {
  env?: PDFStudioNativeBuilderEnv;
  fetch?: DocRaptorFetch;
}

let cachedClient:
  | {
      signature: string;
      client: DocRaptorClient;
    }
  | undefined;

export function resolvePdfStudioDocRaptorRuntime(
  env: PDFStudioNativeBuilderEnv = serverEnv,
): PdfStudioDocRaptorRuntime {
  const config = resolvePDFStudioNativeBuilderConfig(env);

  return {
    assetUrlTtlSeconds: config.docraptor.assetUrlTtlSeconds,
    callbackConfigured: config.docraptor.callbackConfigured,
    configured: config.docraptor.configured,
    missing: config.docraptor.missing,
    mode: config.docraptor.mode,
    productionRenderingEnabled: config.productionRenderingEnabled,
    renderBaseUrl: config.docraptor.renderBaseUrl,
    timeoutMs: config.docraptor.timeoutMs,
  };
}

export async function getPdfStudioDocRaptorClient(
  options: GetPdfStudioDocRaptorClientOptions = {},
): Promise<DocRaptorClient | undefined> {
  const clientConfig = resolveDocRaptorClientConfig(
    options.env ?? serverEnv,
    options.fetch,
  );

  if (clientConfig === undefined) {
    return undefined;
  }

  const signature = createClientCacheSignature(clientConfig);
  if (options.fetch === undefined && cachedClient?.signature === signature) {
    return cachedClient.client;
  }

  const { createDocRaptorClient } = await import("@asym/docraptor-client");
  const client = createDocRaptorClient(clientConfig);

  if (options.fetch === undefined) {
    cachedClient = {
      client,
      signature,
    };
  }

  return client;
}

export async function loadPdfStudioDocRaptorPreviewModule() {
  return import("@asym/pdf-renderer/docraptor-preview");
}

function resolveDocRaptorClientConfig(
  env: PDFStudioNativeBuilderEnv,
  fetch?: DocRaptorFetch,
): DocRaptorClientConfig | undefined {
  const apiKey = readSecret(env.DOCRAPTOR_API_KEY);
  if (apiKey === undefined) {
    return undefined;
  }

  const runtime = resolvePdfStudioDocRaptorRuntime(env);

  return {
    apiKey,
    defaultTimeoutMs: runtime.timeoutMs,
    fetch,
    mode: runtime.mode,
  };
}

function createClientCacheSignature(config: DocRaptorClientConfig) {
  return [
    config.mode ?? "test",
    config.defaultTimeoutMs ?? "",
    config.apiKey,
  ].join(":");
}

function readSecret(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
