import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { MissionaryGivingPages } from "../../../../apps/admin/src/cms/collections/missionary-giving-pages";
import { ProjectPages } from "../../../../apps/admin/src/cms/collections/project-pages";

import type { CollectionConfig } from "payload";

type SourceField = {
  name?: string;
  admin?: { position?: string; readOnly?: boolean };
};

function field(collection: CollectionConfig, name: string): SourceField {
  const found = (collection.fields as SourceField[]).find(
    (entry) => entry.name === name,
  );
  expect(found, `${collection.slug}.${name}`).toBeDefined();
  return found as SourceField;
}

/** CSS with each whitespace run as one space, so wrapped selectors match. */
const payloadStyles = readFileSync(
  path.join(process.cwd(), "apps/admin/src/styles/payloadStyles.css"),
  "utf8",
).replace(/\s+/g, " ");

describe("A giving or project page's source ID in the Studio editor", () => {
  it.each([
    [MissionaryGivingPages, "missionaryId"],
    [ProjectPages, "fundId"],
  ] as const)(
    "%#: sits with the secondary fields, read-only, after the page's own fields",
    (collection, name) => {
      const source = field(collection, name);
      // The header already names the missionary or fund; the raw ID is a
      // detail, so Payload renders it among the sidebar fields.
      expect(source.admin?.position).toBe("sidebar");
      expect(source.admin?.readOnly).toBe(true);
    },
  );

  it("stacks Payload's sidebar fields under the main fields in the Studio editor", () => {
    expect(payloadStyles).toContain(
      ".payload-native-edit .document-fields { display: block;",
    );
    expect(payloadStyles).toMatch(
      /\.payload-native-edit \.document-fields__sidebar-wrap \{[^}]*position: static;[^}]*width: 100%;/,
    );
  });
});
