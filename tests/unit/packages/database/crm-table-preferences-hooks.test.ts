import { describe, expect, it } from "vitest";

import { isCrmNamedViewsQueryEnabled } from "../../../../packages/database/hooks/admin-crm-named-views";
import { isCrmTablePreferencesQueryEnabled } from "../../../../packages/database/hooks/admin-crm-table-preferences";

describe("CRM table preference query guards", () => {
  it("disables table-scoped queries before tableId is known", () => {
    expect(isCrmTablePreferencesQueryEnabled("")).toBe(false);
    expect(isCrmNamedViewsQueryEnabled("")).toBe(false);
  });

  it("enables table-scoped queries once tableId is known", () => {
    expect(isCrmTablePreferencesQueryEnabled("crm-gift-history")).toBe(true);
    expect(isCrmNamedViewsQueryEnabled("crm-gift-history")).toBe(true);
  });
});
