import config from "@payload-config";
import { getPayload } from "payload";

import {
  assertPayloadDatabaseConfiguration,
  isDirectSupabaseDatabaseHost,
  PayloadDatabaseConfigurationError,
  resolvePayloadDatabaseConfig,
} from "./payload-database-config";

let payloadPromise: ReturnType<typeof getPayload> | null = null;

export class PayloadClientInitializationError extends Error {
  readonly statusCode: number;

  constructor(
    message: string,
    options?: { cause?: unknown; statusCode?: number },
  ) {
    super(message, { cause: options?.cause });
    this.name = "PayloadClientInitializationError";
    this.statusCode = options?.statusCode ?? 503;
  }
}

function isDnsLookupFailure(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code =
    "code" in error && typeof error.code === "string" ? error.code : null;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  return code === "ENOTFOUND" || message.includes("ENOTFOUND");
}

function normalizePayloadInitializationError(error: unknown) {
  if (error instanceof PayloadClientInitializationError) {
    return error;
  }

  if (error instanceof PayloadDatabaseConfigurationError) {
    return new PayloadClientInitializationError(error.message, {
      cause: error,
      statusCode: error.statusCode,
    });
  }

  const { host } = resolvePayloadDatabaseConfig();

  if (isDnsLookupFailure(error) && isDirectSupabaseDatabaseHost(host)) {
    return new PayloadClientInitializationError(
      "Payload CMS could not initialize because this environment cannot resolve the Supabase direct database host. Supabase direct connections are IPv6-only; configure PAYLOAD_DATABASE_URI with the Supavisor session pooler connection string for IPv4-only environments.",
      { cause: error },
    );
  }

  return new PayloadClientInitializationError(
    "Payload CMS could not initialize its database client.",
    { cause: error },
  );
}

export function isPayloadClientInitializationError(
  error: unknown,
): error is PayloadClientInitializationError {
  return error instanceof PayloadClientInitializationError;
}

export function getPayloadClient() {
  if (!payloadPromise) {
    try {
      assertPayloadDatabaseConfiguration();
    } catch (error) {
      return Promise.reject(normalizePayloadInitializationError(error));
    }

    payloadPromise = getPayload({ config }).catch((error: unknown) => {
      payloadPromise = null;
      throw normalizePayloadInitializationError(error);
    });
  }

  return payloadPromise;
}
