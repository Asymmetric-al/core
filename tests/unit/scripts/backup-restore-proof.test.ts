import { describe, expect, it } from "vitest";

import {
  buildBackupRestoreSummary,
  formatBackupRestoreSummary,
  parseRestoreCount,
} from "../../../scripts/verify/backup-restore-proof.mjs";

describe("backup restore proof helpers", () => {
  it("parses restored row-count proof from psql output", () => {
    expect(parseRestoreCount("3|phase11-alpha|phase11-gamma\n")).toEqual({
      rowCount: 3,
      minMarker: "phase11-alpha",
      maxMarker: "phase11-gamma",
    });
  });

  it("rejects a restore with the correct count but changed markers", () => {
    expect(
      buildBackupRestoreSummary({
        sourceContainer: "source",
        targetContainer: "target",
        rowCount: 3,
        minMarker: "corrupted",
        maxMarker: "phase11-gamma",
        dumpFile: "proof.dump",
      }).status,
    ).toBe("failed");
  });

  it("formats isolated restore evidence without production access", () => {
    const summary = buildBackupRestoreSummary({
      sourceContainer: "source",
      targetContainer: "target",
      rowCount: 3,
      minMarker: "phase11-alpha",
      maxMarker: "phase11-gamma",
      dumpFile: "/tmp/proof.dump",
    });

    const report = formatBackupRestoreSummary(summary);

    expect(summary.status).toBe("passed");
    expect(summary.productionTouched).toBe(false);
    expect(summary.scope).toBe("synthetic-transport-smoke");
    expect(report).toContain("does not qualify product migrations");
    expect(report).toContain("Status: PASSED");
    expect(report).toContain("Production touched: no");
  });
});
