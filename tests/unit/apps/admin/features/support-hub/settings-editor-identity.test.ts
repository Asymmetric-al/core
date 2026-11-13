import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Every settings list renders one editor for "new" or for the record being
// edited. Without a key tied to that record, React keeps the previous
// editor's draft state when staff switch from editing one record to another,
// and saving writes the first record's draft onto the second.
const SETTINGS_DIR = join(
  process.cwd(),
  "apps/admin/features/support-hub/components/settings",
);

const LISTS = [
  ["automations/AutomationRuleList.tsx", "AutomationRuleForm"],
  ["business-hours/BusinessHoursList.tsx", "BusinessHoursForm"],
  ["canned-responses/CannedResponseList.tsx", "CannedResponseForm"],
  ["collaborators/TeamList.tsx", "TeamForm"],
  ["labels/LabelsSettingsPanel.tsx", "LabelForm"],
  ["macros/MacroList.tsx", "MacroForm"],
  ["signatures/SignatureList.tsx", "SignatureForm"],
  ["sla/SlaPolicyList.tsx", "SlaPolicyForm"],
] as const;

function editorOpeningTag(source: string, form: string): string {
  const start = source.indexOf(`<${form}\n`);
  expect(start, `${form} is rendered`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("/>", start);
  return source.slice(start, end);
}

describe("support settings editors", () => {
  it.each(LISTS)(
    "%s remounts its editor when the edited record changes",
    (file, form) => {
      const tag = editorOpeningTag(
        readFileSync(join(SETTINGS_DIR, file), "utf8"),
        form,
      );
      expect(tag).toMatch(/key=\{[^}]*\.id\s*\?\?\s*"new[^"]*"\}/);
    },
  );
});
