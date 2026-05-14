export function normalizeEmail(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

export function normalizeWhitespace(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || null;
}

export function normalizeNameForMatching(
  value: string | null | undefined,
): string | null {
  return normalizeWhitespace(value)?.toLowerCase() ?? null;
}

export function normalizePhone(
  value: string | null | undefined,
): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) {
    return null;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return digits.startsWith("1") && digits.length === 11
    ? `+${digits}`
    : `+${digits}`;
}

export function splitFullName(value: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const [firstName, ...lastNameParts] = normalized.split(" ");
  return {
    firstName: firstName ?? "",
    lastName: lastNameParts.join(" "),
  };
}

export function normalizeCurrency(value: string | null | undefined): string {
  return value?.trim().toUpperCase() || "USD";
}
