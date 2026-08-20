import { DELIVERABILITY_HELP_URLS, RESEND_ERROR_CODES } from "../constants";
import { getFirstBlockingDeliverabilityWarning } from "../deliverability-warnings";
import { extractResendErrorDetails, mapResendErrorCode } from "./errors";
import {
  asBoolean,
  asNumber,
  asString,
  extractRows,
  isJsonRecord,
  type JsonRecord,
} from "./json";
import { createResendClientInstance } from "./sdk";

import type {
  DeliverabilityWarning,
  DomainAuthentication,
  ResendValidationSnapshot,
  SenderIdentity,
} from "../types";
import type {
  DomainRecord,
  ResendValidationOptions,
  ResendValidationResult,
} from "./types";
import type { Resend } from "resend";

function mapDomainAuthentication(
  domain: JsonRecord,
  index: number,
): DomainAuthentication | null {
  const name = asString(domain.name) || asString(domain.domain);
  if (!name) {
    return null;
  }

  const explicitValid = asBoolean(domain.valid);
  const status =
    asString(domain.status) ??
    (explicitValid === true ? "verified" : "unknown");
  const records = extractRows(domain.records).map((record) => ({
    type: asString(record.type) ?? undefined,
    name: asString(record.name) ?? "",
    value: asString(record.value) ?? asString(record.record) ?? "",
    status: asString(record.status) ?? undefined,
    ttl: asString(record.ttl) ?? undefined,
    record: asString(record.record) ?? undefined,
    priority: asNumber(record.priority) ?? undefined,
  }));

  return {
    id: asNumber(domain.id) ?? index + 1,
    domain: name,
    subdomain: asString(domain.subdomain),
    valid: explicitValid ?? status === "verified",
    status,
    region: asString(domain.region),
    createdAt: asString(domain.created_at) ?? undefined,
    records: records.length > 0 ? records : undefined,
  };
}

function mapSenderIdentity(
  domain: JsonRecord,
  index: number,
): SenderIdentity | null {
  const domainName = asString(domain.name);
  const domainStatus = asString(domain.status);
  if (!domainName || domainStatus !== "verified") {
    return null;
  }

  const fromEmail =
    asString(domain.default_from_email) ??
    asString(domain.from_email) ??
    `noreply@${domainName}`;
  const fromName = asString(domain.default_from_name) ?? domainName;
  const replyTo = asString(domain.default_reply_to_email);

  return {
    id: asNumber(domain.id) ?? index + 1,
    nickname: `${domainName} sender`,
    from_email: fromEmail,
    from_name: fromName,
    reply_to_email: replyTo,
    verified: true,
  };
}

function mapPersistedSenderIdentity(
  value: unknown,
  index: number,
): SenderIdentity | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const fromEmail = asString(value.from_email);
  const fromName = asString(value.from_name);
  const nickname = asString(value.nickname);
  const verified = asBoolean(value.verified) ?? false;

  if (!fromEmail || !fromName || !nickname) {
    return null;
  }

  return {
    id: asNumber(value.id) ?? index + 1,
    nickname,
    from_email: fromEmail,
    from_name: fromName,
    reply_to_email: asString(value.reply_to_email) || null,
    verified,
  };
}

function parsePermissions(value: unknown): string[] | undefined {
  if (!isJsonRecord(value)) {
    return undefined;
  }

  const candidate =
    value.permissions ??
    value.access ??
    value.scopes ??
    value.scope ??
    value.capabilities;

  if (!Array.isArray(candidate)) {
    return undefined;
  }

  const permissions = candidate
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry));

  return permissions.length > 0 ? permissions : undefined;
}

function normalizeDomainToken(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return null;
  }

  return normalizeDomainToken(trimmed.slice(atIndex + 1));
}

function getVerifiedDomainNames(
  domains: DomainAuthentication[],
): readonly string[] {
  return [
    ...new Set(
      domains
        .filter((domain) => domain.valid)
        .map((domain) => normalizeDomainToken(domain.domain)),
    ),
  ];
}

function getSenderDomainMismatchWarning(
  defaultFromEmail: string | undefined,
  verifiedDomainNames: readonly string[],
): DeliverabilityWarning | null {
  if (!defaultFromEmail) {
    return null;
  }

  const senderDomain = getEmailDomain(defaultFromEmail);
  if (!senderDomain) {
    return null;
  }

  if (verifiedDomainNames.includes(senderDomain)) {
    return null;
  }

  const verifiedDomainHint =
    verifiedDomainNames.length > 0
      ? `Use an address on ${verifiedDomainNames.slice(0, 2).join(" or ")}.`
      : "Verify the sender domain in Resend before attempting to send email.";

  return {
    code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
    severity: "error",
    message: `${defaultFromEmail} does not use one of your exact verified Resend domains. ${verifiedDomainHint}`,
    helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_MISMATCH,
  };
}

function normalizeRecordField(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function isVerifiedDomainRecord(record: DomainRecord): boolean {
  return normalizeRecordField(record.status) === "verified";
}

function isTxtDomainRecord(record: DomainRecord): boolean {
  return normalizeRecordField(record.type) === "txt";
}

function isVerifiedDkimRecord(record: DomainRecord): boolean {
  const recordLabel = normalizeRecordField(record.record);
  const recordName = normalizeRecordField(record.name);
  const recordValue = normalizeRecordField(record.value);

  if (recordLabel === "dkim") {
    return true;
  }

  if (!isTxtDomainRecord(record)) {
    return false;
  }

  return recordName.includes("_domainkey") || recordValue.includes("v=dkim1");
}

function isVerifiedSpfRecord(record: DomainRecord): boolean {
  const recordLabel = normalizeRecordField(record.record);
  const recordValue = normalizeRecordField(record.value);

  if (recordLabel === "spf" && (!record.type || isTxtDomainRecord(record))) {
    return true;
  }

  return isTxtDomainRecord(record) && recordValue.includes("v=spf1");
}

function hasVerifiedDomainRecord(
  domains: DomainAuthentication[],
  predicate: (record: DomainRecord) => boolean,
): boolean {
  return domains.some((domain) =>
    (domain.records ?? []).some(
      (record) => isVerifiedDomainRecord(record) && predicate(record),
    ),
  );
}

export function createResendValidationSnapshot(
  validation: Pick<
    ResendValidationResult,
    | "senderIdentities"
    | "domainAuthentication"
    | "warnings"
    | "deliverabilityScore"
  >,
  validatedAt: string = new Date().toISOString(),
): ResendValidationSnapshot {
  const senderIdentities = validation.senderIdentities ?? [];
  const domainAuthentication = validation.domainAuthentication ?? [];
  const warnings = validation.warnings ?? [];
  const deliverabilityScore = validation.deliverabilityScore ?? 0;
  const domainAuthenticated = domainAuthentication.some(
    (domain) => domain.valid,
  );

  return {
    senderIdentities,
    domainAuthentication,
    warnings,
    deliverabilityScore,
    validatedAt,
    domainAuthenticated,
    dkimVerified: hasVerifiedDomainRecord(
      domainAuthentication,
      isVerifiedDkimRecord,
    ),
    spfVerified: hasVerifiedDomainRecord(
      domainAuthentication,
      isVerifiedSpfRecord,
    ),
  };
}

function mapDeliverabilityWarning(
  value: unknown,
): DeliverabilityWarning | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const code = asString(value.code);
  const message = asString(value.message);
  const severity = asString(value.severity);
  if (
    !code ||
    !message ||
    (severity !== "info" && severity !== "warning" && severity !== "error")
  ) {
    return null;
  }

  return {
    code,
    message,
    severity,
    helpUrl: asString(value.helpUrl) || undefined,
  };
}

export function parseResendValidationSnapshot(
  value: unknown,
): ResendValidationSnapshot | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const senderIdentities = extractRows(value.senderIdentities)
    .map((sender, index) => mapPersistedSenderIdentity(sender, index))
    .filter((sender): sender is SenderIdentity => Boolean(sender));
  const domainAuthentication = extractRows(value.domainAuthentication)
    .map((domain, index) => mapDomainAuthentication(domain, index))
    .filter((domain): domain is DomainAuthentication => Boolean(domain));
  const warnings = Array.isArray(value.warnings)
    ? value.warnings
        .map((warning) => mapDeliverabilityWarning(warning))
        .filter((warning): warning is DeliverabilityWarning => Boolean(warning))
    : [];
  const deliverabilityScore = asNumber(value.deliverabilityScore);
  const validatedAt = asString(value.validatedAt);
  const domainAuthenticated = asBoolean(value.domainAuthenticated);
  const dkimVerified = asBoolean(value.dkimVerified);
  const spfVerified = asBoolean(value.spfVerified);

  if (
    deliverabilityScore === null ||
    !validatedAt ||
    domainAuthenticated === null ||
    dkimVerified === null ||
    spfVerified === null
  ) {
    return null;
  }

  return {
    senderIdentities,
    domainAuthentication,
    warnings,
    deliverabilityScore,
    validatedAt,
    domainAuthenticated,
    dkimVerified,
    spfVerified,
  };
}

export function isResendValidationSendReady(
  snapshot: Pick<ResendValidationSnapshot, "domainAuthenticated" | "warnings">,
): boolean {
  return (
    snapshot.domainAuthenticated &&
    !getFirstBlockingDeliverabilityWarning(snapshot.warnings)
  );
}

async function enrichDomainRowsWithDetails(
  resend: Resend,
  domainRows: JsonRecord[],
): Promise<JsonRecord[]> {
  return Promise.all(
    domainRows.map(async (domainRow) => {
      const domainId = asString(domainRow.id);
      if (!domainId) {
        return domainRow;
      }

      try {
        const domainResponse = await resend.domains.get(domainId);
        if (domainResponse.error || !isJsonRecord(domainResponse.data)) {
          return domainRow;
        }

        return {
          ...domainRow,
          ...domainResponse.data,
        };
      } catch {
        return domainRow;
      }
    }),
  );
}

export async function validateResendApiKey(
  apiKey: string,
  options: ResendValidationOptions = {},
): Promise<ResendValidationResult> {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      valid: false,
      error: "API key is required",
      errorCode: RESEND_ERROR_CODES.INVALID_API_KEY,
    };
  }

  if (!apiKey.startsWith("re_")) {
    return {
      valid: false,
      error: 'Invalid API key format. Resend API keys start with "re_".',
      errorCode: RESEND_ERROR_CODES.INVALID_API_KEY,
    };
  }

  const resend = createResendClientInstance(apiKey);
  const warnings: DeliverabilityWarning[] = [];
  let permissions: string[] | undefined;

  try {
    const domainsResponse = await resend.domains.list({ limit: 100 });
    if (domainsResponse.error) {
      const details = extractResendErrorDetails(domainsResponse.error);
      const code = mapResendErrorCode(details.name, details.statusCode);
      return {
        valid: false,
        error: details.message,
        errorCode: code,
      };
    }

    const domainRows = await enrichDomainRowsWithDetails(
      resend,
      extractRows(domainsResponse.data),
    );
    const domainAuthentication = domainRows
      .map((domain, index) => mapDomainAuthentication(domain, index))
      .filter((domain): domain is DomainAuthentication => Boolean(domain));
    const senderIdentities = domainRows
      .map((domain, index) => mapSenderIdentity(domain, index))
      .filter((sender): sender is SenderIdentity => Boolean(sender));

    const verifiedDomains = domainAuthentication.filter(
      (domain) => domain.valid,
    );
    const verifiedDomainNames = getVerifiedDomainNames(domainAuthentication);

    if (domainAuthentication.length === 0) {
      warnings.push({
        code: "NO_DOMAINS",
        message:
          "No sending domains were found. Add and verify a Resend domain before production sends.",
        severity: "warning",
        helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_AUTHENTICATION,
      });
    } else if (verifiedDomains.length === 0) {
      warnings.push({
        code: "DOMAIN_NOT_VERIFIED",
        message:
          "Domains are configured but not verified yet. Complete domain verification for reliable delivery.",
        severity: "warning",
        helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_AUTHENTICATION,
      });
    }

    const senderDomainMismatchWarning = getSenderDomainMismatchWarning(
      options.defaultFromEmail,
      verifiedDomainNames,
    );
    if (senderDomainMismatchWarning) {
      warnings.push(senderDomainMismatchWarning);
    }

    // Metadata scope lookup is optional. We do not infer permissions when this fails.
    try {
      const keyResponse = await resend.apiKeys.list({ limit: 1 });
      if (!keyResponse.error) {
        const rows = extractRows(keyResponse.data);
        const firstKey = rows[0];
        permissions = firstKey ? parsePermissions(firstKey) : undefined;
      } else {
        warnings.push({
          code: "API_KEY_METADATA_UNAVAILABLE",
          message:
            "API key metadata could not be read with this key. Sending can still work if domain and sender are valid.",
          severity: "info",
          helpUrl: DELIVERABILITY_HELP_URLS.API_KEY,
        });
      }
    } catch {
      warnings.push({
        code: "API_KEY_METADATA_UNAVAILABLE",
        message:
          "API key metadata could not be read with this key. Sending can still work if domain and sender are valid.",
        severity: "info",
        helpUrl: DELIVERABILITY_HELP_URLS.API_KEY,
      });
    }

    const deliverabilityScore =
      verifiedDomains.length > 0
        ? 100
        : domainAuthentication.length > 0
          ? 70
          : 40;

    return {
      valid: true,
      permissions,
      senderIdentities,
      domainAuthentication,
      deliverabilityScore,
      warnings,
    };
  } catch (error) {
    const details = extractResendErrorDetails(error);
    return {
      valid: false,
      error: `Failed to validate API key: ${details.message}`,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }
}
