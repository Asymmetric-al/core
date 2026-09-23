import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("support new ticket page", () => {
  it("renders real labeled controls for ticket intake", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/tickets/new/new-ticket-form.tsx",
    );

    for (const label of [
      "Contact",
      "Subject",
      "Support track",
      "Priority",
      "Summary",
    ]) {
      expect(source).toMatch(
        new RegExp(`>\\s*${label}\\s*</(?:Label|SelectControlLabel)>`),
      );
    }
    expect(source).toContain("Create ticket");
  });
});
