/**
 * Canonical CSV serialization helpers, shared by every server and client export
 * path. Import these instead of writing ad-hoc `csvCell` / `escapeCSVValue`
 * helpers so formula-injection neutralization and RFC 4180 quoting stay
 * consistent everywhere a CSV cell is produced.
 */

/** UTF-8 byte order mark. Prefix CSV payloads so Excel renders non-ASCII text. */
export const CSV_UTF8_BOM = String.fromCharCode(0xfeff);

/** RFC 4180 record separator (CRLF). */
export const CSV_RECORD_SEPARATOR = "\r\n";

/**
 * Characters that make a spreadsheet interpret a cell as a formula when they
 * appear at the start of the cell. `=`, `+`, `-`, and `@` are the classic
 * formula lead-ins; TAB, CR, and LF are treated as leading whitespace that
 * Excel strips before re-evaluating the next character as a formula.
 */
const FORMULA_TRIGGER_CHARS = new Set<string>([
  "=",
  "+",
  "-",
  "@",
  "\t", // 0x09 horizontal tab
  "\r", // 0x0d carriage return
  "\n", // 0x0a line feed
]);

function coerceToCellString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Serialize a single value into a safe, RFC 4180 CSV field.
 *
 * Donor- and organization-controlled text (names, source codes, error strings)
 * reaches CSV exports that staff open in Excel / Google Sheets / LibreOffice. A
 * value such as `=HYPERLINK(...)`, `+WEBSERVICE(...)`, or `@SUM(...)` would run
 * as a formula on open, so this is CSV / formula injection (OWASP CSV Injection,
 * CWE-1236) on live data — not a hypothetical.
 *
 * Neutralization: if the first non-space character is a formula trigger (`=`,
 * `+`, `-`, `@`, TAB, CR, or LF) the value is prefixed with a single quote so
 * the spreadsheet renders the literal text instead of evaluating it. The field
 * is then always wrapped in double quotes with internal quotes doubled, so
 * callers never have to reason about when quoting is required.
 *
 * @example
 * csvSafeCell("=cmd|'/c calc'!A1") // "\"'=cmd|''/c calc''!A1\""
 * csvSafeCell("Ada Lovelace")      // "\"Ada Lovelace\""
 */
export function csvSafeCell(value: unknown): string {
  const raw = coerceToCellString(value);
  let formulaProbeIndex = 0;
  while (raw.charAt(formulaProbeIndex) === " ") {
    formulaProbeIndex += 1;
  }

  const neutralized = FORMULA_TRIGGER_CHARS.has(raw.charAt(formulaProbeIndex))
    ? `'${raw}`
    : raw;
  return `"${neutralized.replace(/"/g, '""')}"`;
}
