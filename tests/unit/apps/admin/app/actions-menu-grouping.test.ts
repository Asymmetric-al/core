import { readFileSync } from "node:fs";
import { URL as NodeURL, fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = new NodeURL("../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(fileURLToPath(new NodeURL(path, root)), "utf8");
}

function actionsGroupSource(source: string) {
  const groupStart = source.indexOf("<DropdownMenuGroup>");
  const groupEnd = source.indexOf("</DropdownMenuGroup>", groupStart);
  return source.slice(groupStart, groupEnd);
}

describe("admin table action menu grouping", () => {
  it("keeps the CRM details action inside the labeled Actions group", () => {
    const source = readRepoFile("apps/admin/app/(app)/crm/columns.tsx");

    expect(actionsGroupSource(source)).toContain("Open details");
  });

  it("keeps the contribution details action inside the labeled Actions group", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/contributions/columns.tsx",
    );

    expect(actionsGroupSource(source)).toContain("View Details");
  });
});
