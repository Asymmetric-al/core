import { expect, it, vi } from "vitest";

import { fixture } from "./fixtures";
import { loadFieldPolicies } from "../../../../../packages/api/src/field-policies/index";
import { resolveProjection } from "../../../../../packages/api/src/projection/index";

const duplicateRows = vi.hoisted(() => {
  const row = {
    record_type: "donations",
    field_key: "amount",
    surface: "missionary",
    tenant_id: null,
    visible: true,
    editable: false,
    exportable: true,
    sensitivity_category: "public",
  };
  return [row, { ...row }];
});
// Synthetic reader boundary only; this does not prove live database uniqueness/RLS.
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        is: () => query,
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve(resolve({ data: duplicateRows, error: null })),
      };
      return query;
    },
  }),
}));

it("a reader-denied duplicate ceiling cannot be restored by the projection core", async () => {
  const x = fixture();
  const policies = await loadFieldPolicies({
    surface: x.surface,
    recordType: x.recordType,
  });
  expect(resolveProjection({ ...x, policies })).toEqual({
    kind: "allowed",
    projection: {},
  });
});
