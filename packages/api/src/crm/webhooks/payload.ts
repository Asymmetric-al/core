import { sha256Hex } from "./signature";
import { getCrmSyncDomainForTwentyObject } from "../sync/domains";

import type {
  ParsedTwentyWebhookEvent,
  TwentyWebhookEnvelope,
} from "../sync/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function parseEventParts(eventType: string): {
  objectName: string;
  action: string;
} {
  const [objectName, action] = eventType.split(".");
  return {
    objectName: objectName?.trim() || "unknown",
    action: action?.trim() || "unknown",
  };
}

export function parseTwentyWebhookPayload(
  rawBody: string,
  verifiedTimestamp: Date,
): ParsedTwentyWebhookEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid Twenty webhook JSON payload.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Twenty webhook payload must be a JSON object.");
  }

  const eventType = readString(parsed, ["event"]);
  const data = parsed.data;
  if (!eventType || !isRecord(data)) {
    throw new Error("Twenty webhook payload requires event and data fields.");
  }

  const payloadTimestamp =
    readString(parsed, ["timestamp"]) ?? verifiedTimestamp.toISOString();
  const { objectName, action } = parseEventParts(eventType);
  const payloadHash = sha256Hex(rawBody);
  const recordId = readString(data, ["id", "recordId", "record_id"]);
  const tenantId = readString(data, [
    "asymTenantId",
    "asym_tenant_id",
    "tenantId",
    "tenant_id",
  ]);

  const payload: TwentyWebhookEnvelope = {
    event: eventType,
    data,
    timestamp: payloadTimestamp,
  };

  return {
    action,
    domain: getCrmSyncDomainForTwentyObject(objectName),
    eventKey: [
      "twenty",
      eventType,
      recordId ?? "no-record",
      payloadTimestamp,
      payloadHash.slice(0, 16),
    ].join(":"),
    eventType,
    objectName,
    payload,
    payloadHash,
    recordId,
    tenantId,
    timestamp: verifiedTimestamp,
  };
}
