import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

it.each([
  ["care", "Member Care"],
  ["care/directory", "Care directory"],
  ["care/directory/[id]", "Member profile"],
  ["care/settings", "Care rules"],
  ["mobilize", "Mobilize"],
  ["mobilize/locations", "Locations"],
])(
  "gives %s its own title without changing its server wrapper",
  (route, title) => {
    const source = readFileSync(
      new URL(
        `../../../../../../apps/admin/app/(app)/${route}/page.tsx`,
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain(`title: "${title}"`);
    expect(source).toContain("export const metadata: Metadata");
    expect(source).toContain("return <PageClient />");
    expect(source).not.toContain('"use client"');
  },
);
