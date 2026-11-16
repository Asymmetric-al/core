import { randomUUID } from "node:crypto";
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";

export function writeEvidenceJson(file, value) {
  const temporaryFile = `${file}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporaryFile, JSON.stringify(value, null, 2) + "\n", {
      flag: "wx",
      flush: true,
    });
    renameSync(temporaryFile, file);
  } finally {
    rmSync(temporaryFile, { force: true });
  }
}

export function savePageMetrics(file, results) {
  const previous = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8"))
    : {};
  const merged = { ...previous };
  for (const [state, viewports] of Object.entries(results)) {
    if (Object.keys(viewports).length > 0) {
      merged[state] = { ...previous[state], ...viewports };
    }
  }
  writeEvidenceJson(file, merged);
}
