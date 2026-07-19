import type { EveAdminMemoryExclusionCode } from "./types";

interface ExclusionRule {
  code: EveAdminMemoryExclusionCode;
  pattern: RegExp;
}

const EXCLUSION_RULES: ExclusionRule[] = [
  {
    code: "private_key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  },
  {
    code: "credential",
    pattern:
      /\b(?:api[_ -]?key|client[_ -]?secret|password|passwd|credential|access[_ -]?token|refresh[_ -]?token)\s*[:=]\s*\S+/i,
  },
  {
    code: "secret",
    pattern:
      /\b(?:bearer\s+[a-z0-9._~+\/-]{12,}|(?:sk|ghp|github_pat|sb_secret)_[a-z0-9_-]{12,}|eyJ[a-z0-9_-]{20,}\.[a-z0-9_-]{10,})/i,
  },
  {
    code: "one_time_code",
    pattern:
      /\b(?:otp|one[- ]time (?:code|password)|verification code|2fa code|mfa code)\s*(?::|is)?\s*\d{4,10}\b/i,
  },
  {
    code: "payment_data",
    pattern:
      /\b(?:cvv|cvc|routing number|bank account|card number)\s*(?::|is)?\s*[\d -]{3,24}\b/i,
  },
  {
    code: "customer_or_donor_pii",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    code: "customer_or_donor_pii",
    pattern: /\b(?:ssn|social security)\s*(?::|is)?\s*\d{3}-?\d{2}-?\d{4}\b/i,
  },
  {
    code: "customer_or_donor_pii",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/,
  },
  {
    code: "customer_or_donor_pii",
    pattern:
      /(?:^|[^A-Z0-9])(?:\+1[ .-]?|1[ .-])?(?:\([2-9]\d{2}\)|[2-9]\d{2})[ .-][2-9]\d{2}[ .-]\d{4}(?:$|[^A-Z0-9])/i,
  },
  {
    code: "customer_or_donor_pii",
    pattern:
      /\b\d{1,6}\s+(?:(?:[A-Z][A-Z.'-]*|\d+(?:ST|ND|RD|TH))\s+){1,5}(?:STREET|ST|AVENUE|AVE|ROAD|RD|BOULEVARD|BLVD|LANE|LN|DRIVE|DR|COURT|CT|CIRCLE|CIR|PARKWAY|PKWY|HIGHWAY|HWY|WAY|TERRACE|TER|PLACE|PL)\b(?:\s+(?:APT|APARTMENT|SUITE|UNIT|#)\s*[A-Z0-9-]+)?\b/i,
  },
  {
    code: "customer_or_donor_pii",
    pattern:
      /\b(?:phone|mobile|telephone|street address|mailing address)\s*(?::|is)?\s*(?:\+?\d|\d{1,6}\s+[A-Za-z])/i,
  },
  {
    code: "sensitive_tenant_fact",
    pattern:
      /\b(?:donor|customer|tenant)\s+(?:name|email|phone|address|account|balance|gift|giving|payment|identifier)\s*(?::|is)\s*\S+/i,
  },
];

function containsPaymentCardNumber(value: string): boolean {
  const candidates = value.match(/(?:\d[ -]?){13,19}/g) ?? [];
  return candidates.some((candidate) => {
    const digits = candidate.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0;
    let doubleDigit = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  });
}

export function classifyEveAdminMemoryExclusions(
  input: string,
): EveAdminMemoryExclusionCode[] {
  const exclusions = new Set<EveAdminMemoryExclusionCode>();
  for (const rule of EXCLUSION_RULES) {
    if (rule.pattern.test(input)) exclusions.add(rule.code);
  }
  if (containsPaymentCardNumber(input)) exclusions.add("payment_data");
  return [...exclusions].sort();
}
