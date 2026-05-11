import { describe, expect, it } from "vitest";

import {
  buildCsvExport,
  buildJsonExport,
  toReportCsv,
  toReportJson,
} from "../../../../../../apps/admin/features/support-hub/lib/report-export";
import type { SupportReportSeries } from "../../../../../../apps/admin/features/support-hub/types";

const SAMPLE: SupportReportSeries = {
  slice: "volume",
  generatedAt: "2026-04-15T12:00:00.000Z",
  unit: "count",
  total: 3,
  buckets: [
    { key: "day-one", label: "Day one", value: 1, secondaryValue: null },
    {
      key: "day-two",
      label: "Day, two",
      value: 2,
      secondaryValue: null,
    },
    {
      key: "quoted",
      label: 'Weird "label"',
      value: 0,
      secondaryValue: null,
    },
  ],
};

describe("toReportCsv", () => {
  it("emits a CSV with a header row + one row per bucket", () => {
    const csv = toReportCsv(SAMPLE);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("key,label,value,secondary");
    expect(lines).toHaveLength(4);
  });

  it("escapes commas and quotes inside bucket labels", () => {
    const csv = toReportCsv(SAMPLE);
    expect(csv).toContain('"Day, two"');
    expect(csv).toContain('"Weird ""label"""');
  });
});

describe("toReportJson", () => {
  it("round-trips the series through JSON", () => {
    const json = toReportJson(SAMPLE);
    const parsed = JSON.parse(json);
    expect(parsed.slice).toBe("volume");
    expect(parsed.buckets).toHaveLength(3);
  });
});

describe("buildCsvExport / buildJsonExport", () => {
  it("returns sensible filenames", () => {
    const csv = buildCsvExport(SAMPLE);
    const json = buildJsonExport(SAMPLE);
    expect(csv.filename).toBe("volume-2026-04-15.csv");
    expect(json.filename).toBe("volume-2026-04-15.json");
    expect(csv.mimeType).toBe("text/csv");
    expect(json.mimeType).toBe("application/json");
  });
});
