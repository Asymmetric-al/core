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

  it("wires the Receipt control to the donation's receipt route as a real link", () => {
    // A downloadable anchor bound to the row's receiptUrl (not an inert button).
    expect(source).toMatch(/href=\{tx\.receiptUrl\}/);
    expect(source).toMatch(/download/);
    expect(source).toMatch(
      /aria-label=\{`Download receipt for \$\{tx\.recipient\}`\}/,
    );
  });

  it("wires Open Statement to the annual statement route for the gift's year", () => {
    expect(source).toMatch(
      /href=\{`\/api\/donor\/statements\/\$\{new Date\(tx\.date\)\.getFullYear\(\)\}`\}/,
    );
  });

  it("introduces no one-off hex colors (Maia/zinc tokens only)", () => {
    // The actions cell relies on token utility classes; no raw hex accents.
    expect(source).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
