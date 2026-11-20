import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

// Source-contract test (repo convention, see ui-route-cleanup-contracts.test.ts):
// the donor giving-history receipt/statement controls must be wired to the real
// donor-portal routes so receipt/statement records are accessible in the portal
// flow (Conrad §3), and must stay on shared tokens (no one-off colors).
describe("donor history receipt/statement links", () => {
  const source = readRepoFile(
    "apps/donor/app/(dashboard)/donor-dashboard/history/columns.tsx",
  );

  // WP2b, AL-2675 (plan 5.2): both routes are the app's own API, so the
  // controls download them through the own-API wrapper, which sends the
  // document's tenant and assignment; a link would be a page load with no
  // header. Each assertion still pins the control to its route.
  it("wires the Receipt control to the donation's receipt route as a real download", () => {
    // A download of the row's receiptUrl (not an inert button).
    expect(source).toMatch(/useOwnApiDownload\(\)/);
    expect(source).toMatch(/download\(tx\.receiptUrl\)/);
    expect(source).toMatch(/aria-label=\{receiptLabel\(tx\)\}/);
  });

  it("wires the year summary to the annual statement route for the selected year", () => {
    const page = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx",
    );
    expect(page).toContain("download(`/api/donor/statements/${year}`)");
  });

  it("introduces no one-off hex colors (Maia/zinc tokens only)", () => {
    // The actions cell relies on token utility classes; no raw hex accents.
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
