// @vitest-environment jsdom
import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderDocumentScope } from "./scope-fixture";

afterEach(cleanup);

/**
 * The browser query cache is keyed by the document scope (plan 5.2, "The
 * browser data layer is scoped to the person, the tenant and the selected
 * assignment": the collections and their cache keys take the tenant and the
 * assignment from the document scope; WP2b, AL-2675).
 *
 * A document's scope is fixed once; a change of organization or assignment
 * loads a new document. Keying the cache by the scope as well means a row
 * cached under any other scope, or before the scope was fixed, is never
 * served to a scoped page.
 */

const A = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};

const KEY = ["admin", "crm", "records", "infinite"] as const;

async function load() {
  vi.resetModules();
  const { getQueryClient } =
    await import("../../../../packages/database/providers/query-client");
  return { queryClient: getQueryClient() };
}

describe("the browser query cache", () => {
  it("keys every query by the document's person, tenant and assignment", async () => {
    const { queryClient } = await load();
    await renderDocumentScope(A);

    queryClient.setQueryData(KEY, [{ id: "donor-a" }]);

    const query = queryClient.getQueryCache().find({ queryKey: KEY });
    expect(query?.queryHash).toContain(A.userId);
    expect(query?.queryHash).toContain(A.tenantId);
    expect(query?.queryHash).toContain(A.assignmentId);
    expect(queryClient.getQueryData(KEY)).toEqual([{ id: "donor-a" }]);
  });

  it("never serves a scoped page a row cached before its scope was fixed", async () => {
    const { queryClient } = await load();
    queryClient.setQueryData(KEY, [{ id: "donor-cached-unscoped" }]);

    await renderDocumentScope(A);

    expect(queryClient.getQueryData(KEY)).toBeUndefined();
  });

  it("keeps prefix invalidation working across scoped keys", async () => {
    const { queryClient } = await load();
    await renderDocumentScope(A);
    queryClient.setQueryData(KEY, [{ id: "donor-a" }]);

    await queryClient.invalidateQueries({ queryKey: ["admin", "crm"] });

    expect(queryClient.getQueryState(KEY)?.isInvalidated).toBe(true);
  });
});
