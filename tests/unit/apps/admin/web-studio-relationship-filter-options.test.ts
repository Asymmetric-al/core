import { describe, expect, it, vi } from "vitest";

import {
  filterableRelationships,
  loadRelationshipFilterOptions,
  relationshipLabel,
} from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/relationship-filter-options";

/**
 * Web Studio list filters offer relationship fields (Tenant, authors…) by the
 * related document, as Payload's own filter did: the options are the related
 * collection's documents, named by its title field.
 */

function json(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

describe("filterableRelationships", () => {
  it("keeps single-collection relationships a viewer may filter on", () => {
    expect(
      filterableRelationships([
        { name: "title", type: "text" },
        { name: "tenant", type: "relationship", relationTo: "tenants" },
        { name: "related", type: "relationship", relationTo: ["a", "b"] },
        {
          name: "secret",
          type: "relationship",
          relationTo: "users",
          admin: { hidden: true },
        },
      ]),
    ).toEqual([{ name: "tenant", relationTo: "tenants" }]);
  });
});

describe("loadRelationshipFilterOptions", () => {
  it("names each related document by its collection's title field", async () => {
    const fetcher = vi.fn(async () =>
      json({
        docs: [
          { id: 1, name: "E2E Tenant" },
          { id: 2, name: "" },
        ],
      }),
    );
    const options = await loadRelationshipFilterOptions({
      relationships: [{ name: "tenant", relationTo: "tenants" }],
      apiURL: "/api",
      titleFieldOf: () => "name",
      fetcher: fetcher as unknown as typeof fetch,
    });
    expect(options).toEqual({
      tenant: [
        { label: "E2E Tenant", value: "1" },
        { label: "#2", value: "2" },
      ],
    });
    const url = String(fetcher.mock.calls[0]?.[0]);
    expect(url.startsWith("/api/tenants?")).toBe(true);
    expect(url).toContain("depth=0");
    expect(url).toContain("sort=name");
  });

  it("offers no options for a collection that fails to load", async () => {
    const options = await loadRelationshipFilterOptions({
      relationships: [{ name: "tenant", relationTo: "tenants" }],
      apiURL: "/api",
      titleFieldOf: () => "name",
      fetcher: (async () => json({}, false)) as unknown as typeof fetch,
    });
    expect(options).toEqual({ tenant: [] });
  });
});

describe("relationshipLabel", () => {
  const options = [
    { label: "Give Hope", value: "1" },
    { label: "Global Fellowship", value: "2" },
  ];

  it("names a related document from its id, so cards never show a placeholder", () => {
    expect(relationshipLabel(2, options)).toBe("Global Fellowship");
    expect(relationshipLabel("1", options)).toBe("Give Hope");
  });

  it("reads the id of a populated relationship", () => {
    expect(relationshipLabel({ id: 1, name: "Give Hope" }, options)).toBe(
      "Give Hope",
    );
  });

  it("returns null when the option is not loaded", () => {
    expect(relationshipLabel(9, options)).toBeNull();
    expect(relationshipLabel(null, options)).toBeNull();
    expect(relationshipLabel(1, undefined)).toBeNull();
  });
});
