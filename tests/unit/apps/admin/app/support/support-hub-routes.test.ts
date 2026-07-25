import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("support hub routes", () => {
  it("points primary support actions at implemented routes", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/support-hub.routes.ts",
    );

    for (const route of [
      'home: "/support"',
      'tickets: "/support/tickets"',
      'newTicket: "/support/tickets/new"',
      'contacts: "/support/contacts"',
      'macros: "/support/macros"',
      'knowledge: "/support/knowledge"',
    ]) {
      expect(source).toContain(route);
    }
  });

  it("builds canonical ticket detail URLs", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/support-hub.routes.ts",
    );

    expect(source).toContain(
      "ticket: (id: string) => `/support/tickets/${encodeURIComponent(id)}`",
    );
  });
});
