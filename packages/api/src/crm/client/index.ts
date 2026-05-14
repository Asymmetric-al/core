import { serverEnv } from "@asym/env";

import { loadTwentyClientConfig, type TwentyEnvInput } from "./config";
import { TwentyCoreClient } from "./core";
import { TwentyMetadataClient } from "./metadata";

export interface CreateTwentyClientsOptions {
  env?: TwentyEnvInput;
  fetchImpl?: typeof fetch;
}

export function createTwentyClients(options: CreateTwentyClientsOptions = {}) {
  const config = loadTwentyClientConfig(options.env ?? serverEnv);
  if (!config) {
    return null;
  }

  const core = new TwentyCoreClient({
    apiBaseUrl: config.apiBaseUrl,
    apiKey: config.apiKey,
    fetchImpl: options.fetchImpl,
    rateLimitRpm: config.rateLimitRpm,
  });

  return {
    core,
    metadata: new TwentyMetadataClient(core),
  };
}
