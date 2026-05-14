import { TWENTY_RATE_LIMIT_RPM } from "./core";

type TwentyEnvKey =
  | "TWENTY_API_URL"
  | "TWENTY_API_KEY"
  | "TWENTY_WEBHOOK_SECRET"
  | "TWENTY_WORKSPACE_ID"
  | "TWENTY_RATE_LIMIT_RPM";

export type TwentyEnvInput = Partial<Record<TwentyEnvKey, string | number>>;

export type TwentyRuntimeConfig =
  | {
      configured: false;
      status: "missing" | "invalid";
      missing: Array<"TWENTY_API_URL" | "TWENTY_API_KEY">;
      invalid: Array<{
        key: "TWENTY_API_URL";
        reason: "invalid_url" | "unsupported_protocol" | "missing_rest_path";
      }>;
      rateLimitRpm: number;
    }
  | {
      configured: true;
      apiBaseUrl: string;
      apiBaseUrlKind: "twenty_cloud_rest" | "custom_rest";
      workspaceId?: string;
      rateLimitRpm: number;
      hasWebhookSecret: boolean;
    };

export type TwentyClientConfig = Extract<
  TwentyRuntimeConfig,
  { configured: true }
> & {
  apiKey: string;
  webhookSecret?: string;
};

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseApiBaseUrl(value: string):
  | {
      ok: true;
      normalized: string;
      kind: "twenty_cloud_rest" | "custom_rest";
    }
  | {
      ok: false;
      reason: "invalid_url" | "unsupported_protocol" | "missing_rest_path";
    } {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      ok: false,
      reason: "invalid_url",
    };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return {
      ok: false,
      reason: "unsupported_protocol",
    };
  }

  const normalizedPath = url.pathname.replace(/\/+$/, "");
  if (normalizedPath !== "/rest" && !normalizedPath.endsWith("/rest")) {
    return {
      ok: false,
      reason: "missing_rest_path",
    };
  }

  url.pathname = normalizedPath;
  url.search = "";
  url.hash = "";

  const normalized = url.toString().replace(/\/+$/, "");
  return {
    ok: true,
    normalized,
    kind:
      url.hostname === "api.twenty.com" && normalizedPath === "/rest"
        ? "twenty_cloud_rest"
        : "custom_rest",
  };
}

function normalizeRateLimit(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
  }

  return TWENTY_RATE_LIMIT_RPM;
}

export function resolveTwentyRuntimeConfig(
  envInput: TwentyEnvInput = {},
): TwentyRuntimeConfig {
  const apiBaseUrl = toOptionalString(envInput.TWENTY_API_URL);
  const apiKey = toOptionalString(envInput.TWENTY_API_KEY);
  const missing: Array<"TWENTY_API_URL" | "TWENTY_API_KEY"> = [];

  if (!apiBaseUrl) missing.push("TWENTY_API_URL");
  if (!apiKey) missing.push("TWENTY_API_KEY");

  const rateLimitRpm = normalizeRateLimit(envInput.TWENTY_RATE_LIMIT_RPM);
  const parsedApiBaseUrl = apiBaseUrl ? parseApiBaseUrl(apiBaseUrl) : null;
  const invalid =
    parsedApiBaseUrl && !parsedApiBaseUrl.ok
      ? [
          {
            key: "TWENTY_API_URL" as const,
            reason: parsedApiBaseUrl.reason,
          },
        ]
      : [];

  if (!apiBaseUrl || !apiKey || invalid.length > 0) {
    return {
      configured: false,
      status: missing.length > 0 ? "missing" : "invalid",
      missing,
      invalid,
      rateLimitRpm,
    };
  }
  if (!parsedApiBaseUrl || !parsedApiBaseUrl.ok) {
    return {
      configured: false,
      status: "invalid",
      missing,
      invalid: [
        {
          key: "TWENTY_API_URL",
          reason: "invalid_url",
        },
      ],
      rateLimitRpm,
    };
  }

  const workspaceId = toOptionalString(envInput.TWENTY_WORKSPACE_ID);
  const webhookSecret = toOptionalString(envInput.TWENTY_WEBHOOK_SECRET);

  return {
    configured: true,
    apiBaseUrl: parsedApiBaseUrl.normalized,
    apiBaseUrlKind: parsedApiBaseUrl.kind,
    ...(workspaceId ? { workspaceId } : {}),
    rateLimitRpm,
    hasWebhookSecret: Boolean(webhookSecret),
  };
}

export function loadTwentyClientConfig(
  envInput: TwentyEnvInput = {},
): TwentyClientConfig | null {
  const runtimeConfig = resolveTwentyRuntimeConfig(envInput);
  if (!runtimeConfig.configured) {
    return null;
  }

  const apiKey = toOptionalString(envInput.TWENTY_API_KEY);
  if (!apiKey) {
    return null;
  }

  const webhookSecret = toOptionalString(envInput.TWENTY_WEBHOOK_SECRET);

  return {
    ...runtimeConfig,
    apiKey,
    ...(webhookSecret ? { webhookSecret } : {}),
  };
}
