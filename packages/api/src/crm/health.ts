import {
  loadTwentyClientConfig,
  resolveTwentyRuntimeConfig,
  type TwentyEnvInput,
  type TwentyRuntimeConfig,
} from "./client/config";
import { TwentyCoreClient } from "./client/core";
import { TwentyMetadataClient } from "./client/metadata";
import {
  getTwentyObjectDefinition,
  TWENTY_OBJECT_MODEL,
} from "./schema/twenty-object-model";

type MetadataObject = {
  namePlural?: string;
  nameSingular?: string;
  fields?: Array<{
    name?: string;
  }>;
};

type MissingTwentyRuntimeConfig = Extract<
  TwentyRuntimeConfig,
  { configured: false }
>;

export type TwentyCrmHealthResult =
  | {
      apiBaseUrlKind: "twenty_cloud_rest" | "custom_rest";
      configured: true;
      giftSummaries: {
        exists: boolean;
        missingFields: string[];
      };
      hasWebhookSecret: boolean;
      metadataRead: {
        attempted: true;
        ok: boolean;
        status?: number;
      };
      objectInventory: {
        count: number;
        names: string[];
      };
      ok: boolean;
      repoExpectedObjects: string[];
      status: "ready" | "provider_error";
      workspaceConfigured: boolean;
    }
  | {
      configured: false;
      invalid: MissingTwentyRuntimeConfig["invalid"];
      metadataRead: {
        attempted: false;
        ok: false;
      };
      missing: string[];
      ok: false;
      status: "missing" | "invalid";
    };

export interface GetTwentyCrmHealthOptions {
  env?: TwentyEnvInput;
  fetchImpl?: typeof fetch;
}

function asMetadataObjects(value: unknown): MetadataObject[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is MetadataObject => {
      return typeof item === "object" && item !== null;
    });
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return asMetadataObjects(
    record.data ?? record.objects ?? record.metadataObjects ?? [],
  );
}

function objectName(object: MetadataObject): string | null {
  return object.namePlural ?? object.nameSingular ?? null;
}

function providerStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const status = Number((error as { status: unknown }).status);
  return Number.isFinite(status) ? status : undefined;
}

async function readMetadataObjects(input: {
  config: NonNullable<ReturnType<typeof loadTwentyClientConfig>>;
  fetchImpl?: typeof fetch;
}): Promise<MetadataObject[]> {
  const core = new TwentyCoreClient({
    apiBaseUrl: input.config.apiBaseUrl,
    apiKey: input.config.apiKey,
    fetchImpl: input.fetchImpl,
    rateLimitRpm: input.config.rateLimitRpm,
  });
  const metadata = new TwentyMetadataClient(core);

  return asMetadataObjects(await metadata.listObjects());
}

export async function getTwentyCrmHealth(
  options: GetTwentyCrmHealthOptions = {},
): Promise<TwentyCrmHealthResult> {
  const env = options.env ?? {};
  const runtimeConfig = resolveTwentyRuntimeConfig(env);

  if (!runtimeConfig.configured) {
    return {
      configured: false,
      invalid: runtimeConfig.invalid,
      metadataRead: {
        attempted: false,
        ok: false,
      },
      missing: runtimeConfig.missing,
      ok: false,
      status: runtimeConfig.status,
    };
  }

  const clientConfig = loadTwentyClientConfig(env);
  if (!clientConfig) {
    return {
      configured: false,
      invalid: [],
      metadataRead: {
        attempted: false,
        ok: false,
      },
      missing: ["TWENTY_API_KEY"],
      ok: false,
      status: "missing",
    };
  }

  try {
    const objects = await readMetadataObjects({
      config: clientConfig,
      fetchImpl: options.fetchImpl,
    });
    const expectedGiftFields = getTwentyObjectDefinition(
      "giftSummaries",
    ).fields.map((field) => field.name);
    const giftSummaries = objects.find(
      (object) => objectName(object) === "giftSummaries",
    );
    const actualGiftFields = new Set(
      (giftSummaries?.fields ?? []).flatMap((field) =>
        field.name ? [field.name] : [],
      ),
    );
    const missingGiftFields = expectedGiftFields.filter(
      (field) => !actualGiftFields.has(field),
    );

    return {
      apiBaseUrlKind: runtimeConfig.apiBaseUrlKind,
      configured: true,
      giftSummaries: {
        exists: Boolean(giftSummaries),
        missingFields: missingGiftFields,
      },
      hasWebhookSecret: runtimeConfig.hasWebhookSecret,
      metadataRead: {
        attempted: true,
        ok: true,
      },
      objectInventory: {
        count: objects.length,
        names: objects
          .flatMap((object) => {
            const name = objectName(object);
            return name ? [name] : [];
          })
          .sort(),
      },
      ok: Boolean(giftSummaries) && missingGiftFields.length === 0,
      repoExpectedObjects: TWENTY_OBJECT_MODEL.map(
        (object) => object.namePlural,
      ),
      status: "ready",
      workspaceConfigured: Boolean(runtimeConfig.workspaceId),
    };
  } catch (error) {
    const status = providerStatus(error);

    return {
      apiBaseUrlKind: runtimeConfig.apiBaseUrlKind,
      configured: true,
      giftSummaries: {
        exists: false,
        missingFields: getTwentyObjectDefinition("giftSummaries").fields.map(
          (field) => field.name,
        ),
      },
      hasWebhookSecret: runtimeConfig.hasWebhookSecret,
      metadataRead: {
        attempted: true,
        ok: false,
        ...(status ? { status } : {}),
      },
      objectInventory: {
        count: 0,
        names: [],
      },
      ok: false,
      repoExpectedObjects: TWENTY_OBJECT_MODEL.map(
        (object) => object.namePlural,
      ),
      status: "provider_error",
      workspaceConfigured: Boolean(runtimeConfig.workspaceId),
    };
  }
}
