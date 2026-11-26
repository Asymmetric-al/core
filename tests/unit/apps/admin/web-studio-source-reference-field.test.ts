import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { Pages } from "../../../../apps/admin/src/cms/collections/pages";

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

describe("A giving or project page's source ID in the Studio editor (D-18: WP6 part 2b keeps both IDs on the one pages collection)", () => {
  it.each([
    ["missionaryId", "missionary"],
    ["fundId", "project"],
  ] as const)(
    "%s sits with the secondary fields, read-only, shown only for a %s page",
    (name, family) => {
      const source = field(Pages, name) as SourceField & {
        admin?: { condition?: (data: unknown) => boolean };
      };
      expect(source.admin?.position).toBe("sidebar");
      expect(source.admin?.readOnly).toBe(true);
      expect(source.admin?.condition?.({ family })).toBe(true);
      expect(source.admin?.condition?.({ family: "standard" })).toBe(false);
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
