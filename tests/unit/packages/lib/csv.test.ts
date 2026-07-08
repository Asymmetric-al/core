import { CSV_RECORD_SEPARATOR, CSV_UTF8_BOM, csvSafeCell } from "@asym/lib/csv";
import { describe, expect, it } from "vitest";

describe("csvSafeCell — formula injection neutralization", () => {
  it.each([
    ["=cmd", `"'=cmd"`],
    ["+cmd", `"'+cmd"`],
    ["-cmd", `"'-cmd"`],
    ["@cmd", `"'@cmd"`],
  ])(
    "prefixes the leading %s formula trigger with a single quote",
    (input, expected) => {
      expect(csvSafeCell(input)).toBe(expected);
    },
  );

  it("neutralizes a leading TAB before a formula", () => {
    // Excel strips leading whitespace, so `\t=cmd` still evaluates as a formula.
    expect(csvSafeCell("\t=cmd")).toBe(`"'\t=cmd"`);
  });

  it("neutralizes a formula after leading ordinary spaces", () => {
    expect(csvSafeCell(" =cmd")).toBe(`"' =cmd"`);
  });

  it("neutralizes a formula after a leading no-break space without removing it", () => {
    expect(csvSafeCell("\u00a0=cmd")).toBe(`"'\u00a0=cmd"`);
  });

  it("neutralizes leading CR and LF", () => {
    expect(csvSafeCell("\r=cmd")).toBe(`"'\r=cmd"`);
    expect(csvSafeCell("\n=cmd")).toBe(`"'\n=cmd"`);
  });

  it("neutralizes a real HYPERLINK payload and doubles its quotes", () => {
    const payload = '=HYPERLINK("http://evil.example","clickme")';
    expect(csvSafeCell(payload)).toBe(
      `"'=HYPERLINK(""http://evil.example"",""clickme"")"`,
    );
  });

  it("neutralizes a HYPERLINK payload after a leading ordinary space", () => {
    const payload = ' =HYPERLINK("http://evil.example","x")';
    expect(csvSafeCell(payload)).toBe(
      `"' =HYPERLINK(""http://evil.example"",""x"")"`,
    );
  });

  it("neutralizes a HYPERLINK payload after a leading no-break space and doubles its quotes", () => {
    const payload = '\u00a0=HYPERLINK("http://evil.example","x")';
    expect(csvSafeCell(payload)).toBe(
      `"'\u00a0=HYPERLINK(""http://evil.example"",""x"")"`,
    );
  });

  it("prefixes negative numbers per OWASP guidance but leaves positives intact", () => {
    expect(csvSafeCell(-5)).toBe(`"'-5"`);
    expect(csvSafeCell(12500)).toBe(`"12500"`);
  });
});

describe("csvSafeCell — RFC 4180 quoting", () => {
  it("always wraps benign values in double quotes without a prefix", () => {
    expect(csvSafeCell("Ada Lovelace")).toBe(`"Ada Lovelace"`);
  });

  it("preserves benign values after leading no-break spaces", () => {
    expect(csvSafeCell("\u00a0Ada Lovelace")).toBe(`"\u00a0Ada Lovelace"`);
  });

  it("doubles embedded double quotes", () => {
    expect(csvSafeCell('Weird "label"')).toBe(`"Weird ""label"""`);
  });

  it("keeps commas and newlines safe inside the quoted field", () => {
    expect(csvSafeCell("a,b")).toBe(`"a,b"`);
    expect(csvSafeCell("line1\nline2")).toBe(`"line1\nline2"`);
  });

  it("coerces null and undefined to an empty quoted field", () => {
    expect(csvSafeCell(null)).toBe(`""`);
    expect(csvSafeCell(undefined)).toBe(`""`);
  });

  it("JSON-serializes object cells such as report metadata", () => {
    expect(csvSafeCell({ source: "crm_outbound_jobs" })).toBe(
      `"{""source"":""crm_outbound_jobs""}"`,
    );
  });
});

describe("CSV constants", () => {
  it("exposes a single-character UTF-8 BOM", () => {
    expect(CSV_UTF8_BOM).toHaveLength(1);
    expect(CSV_UTF8_BOM.charCodeAt(0)).toBe(0xfeff);
  });

  it("exposes a CRLF record separator", () => {
    expect(CSV_RECORD_SEPARATOR).toBe("\r\n");
  });
});
