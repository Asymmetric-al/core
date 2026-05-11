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
      missing: Array<"TWENTY_API_URL" | "TWENTY_API_KEY">;
      rateLimitRpm: number;
    }
  | {
      configured: true;
      apiBaseUrl: string;
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

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
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

  if (!apiBaseUrl || !apiKey) {
    return {
      configured: false,
      missing,
      rateLimitRpm,
    };
  }

  const workspaceId = toOptionalString(envInput.TWENTY_WORKSPACE_ID);
  const webhookSecret = toOptionalString(envInput.TWENTY_WEBHOOK_SECRET);

  return {
    configured: true,
    apiBaseUrl: normalizeApiBaseUrl(apiBaseUrl),
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
