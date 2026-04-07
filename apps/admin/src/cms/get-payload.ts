import config from "@payload-config";
import { getPayload } from "payload";

let payloadPromise: ReturnType<typeof getPayload> | null = null;

const DIRECT_SUPABASE_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;

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

function getCmsDatabaseConnectionString() {
  return (
    process.env.PAYLOAD_DATABASE_URI ?? process.env.SUPABASE_DB_URL ?? null
  );
}

function getConnectionHost(connectionString: string | null) {
  if (!connectionString) {
    return null;
  }

  try {
    return new URL(connectionString).hostname;
  } catch {
    return null;
  }
}

function isDirectSupabaseDatabaseHost(hostname: string | null) {
  return Boolean(hostname && DIRECT_SUPABASE_HOST_RE.test(hostname));
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

  const host = getConnectionHost(getCmsDatabaseConnectionString());

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
    payloadPromise = getPayload({ config }).catch((error: unknown) => {
      payloadPromise = null;
      throw normalizePayloadInitializationError(error);
    });
  }

  return payloadPromise;
}
