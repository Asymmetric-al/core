import { vi } from "vitest";

/** Active tenant document served by the collection-aware route fakes. */
export const TENANT_DOC = { id: "tenant_1", slug: "alpha", isActive: true };

/**
 * Collection-aware fake Payload client for public route tests: the
 * published-content reader reads `tenants` first (the policy-checked active
 * gate), then the content collection, so fakes must answer per collection.
 */
export function fakeFind(docsByCollection: Partial<Record<string, unknown[]>>) {
  return vi.fn(async (args: { collection: string }) => ({
    docs: docsByCollection[args.collection] ?? [],
  }));
}
