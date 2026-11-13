import { describe, expect, it } from "vitest";

import {
  canEditWhere,
  filterStateToWhere,
  payloadFilterFields,
  payloadGroupByFields,
  whereToFilterState,
} from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/payload-where-filters";

import type { AdvancedFilterState } from "@asym/ui/components/shadcn/data-table";

const FIELDS = [
  { name: "title", type: "text", label: "Title" },
  { name: "summary", type: "textarea" },
  { name: "contactEmail", type: "email", label: { en: "Contact email" } },
  { name: "order", type: "number", label: "Order" },
  { name: "publishedAt", type: "date", label: "Published at" },
  {
    name: "kind",
    type: "select",
    label: "Kind",
    options: [
      { label: "Standard", value: "standard" },
      { label: { en: "Landing" }, value: "landing" },
      "legacy",
    ],
  },
  {
    name: "tags",
    type: "select",
    hasMany: true,
    options: [{ label: "News", value: "news" }],
  },
  { name: "featured", type: "checkbox", label: "Featured" },
  {
    type: "row",
    fields: [{ name: "slug", type: "text", label: "Slug" }],
  },
  {
    type: "collapsible",
    label: "Meta",
    fields: [{ name: "theme", type: "radio", options: ["light", "dark"] }],
  },
  { name: "tenant", type: "relationship", relationTo: "tenants" },
  { name: "hero", type: "upload", relationTo: "media" },
  { name: "body", type: "richText" },
  { name: "blocks", type: "blocks", blocks: [] },
  { name: "seo", type: "group", fields: [] },
  { name: "secret", type: "text", admin: { hidden: true } },
  { name: "internal", type: "text", admin: { disabled: { filter: true } } },
  { name: "_status", type: "select", options: ["draft", "published"] },
];

function condition(
  field: string,
  operator: AdvancedFilterState["conditions"][number]["operator"],
  value: AdvancedFilterState["conditions"][number]["value"],
) {
  return { id: `${field}-${operator}`, field, operator, value };
}

function state(
  logic: "and" | "or",
  conditions: AdvancedFilterState["conditions"],
): AdvancedFilterState {
  return { logic, conditions, groups: [] };
}

describe("payloadFilterFields", () => {
  const definitions = payloadFilterFields(FIELDS, { hasDrafts: true });
  const byId = new Map(definitions.map((field) => [field.id, field]));

  it("offers every filterable top-level field, flattening layout fields", () => {
    expect(definitions.map((field) => field.id)).toEqual([
      "title",
      "summary",
      "contactEmail",
      "order",
      "publishedAt",
      "kind",
      "tags",
      "featured",
      "slug",
      "theme",
      // A relationship to one collection filters by the related document.
      "tenant",
      "_status",
    ]);
  });

  it("names fields from their label, a translated label, or the field name", () => {
    expect(byId.get("title")?.label).toBe("Title");
    expect(byId.get("contactEmail")?.label).toBe("Contact email");
    expect(byId.get("summary")?.label).toBe("Summary");
    expect(byId.get("publishedAt")?.label).toBe("Published at");
    expect(byId.get("_status")?.label).toBe("Status");
  });

  it("maps Payload field types onto the shared filter types", () => {
    expect(byId.get("title")?.type).toBe("text");
    expect(byId.get("order")?.type).toBe("number");
    expect(byId.get("publishedAt")?.type).toBe("date");
    expect(byId.get("kind")?.type).toBe("select");
    expect(byId.get("tags")?.type).toBe("multi-select");
    expect(byId.get("featured")?.type).toBe("boolean");
    expect(byId.get("theme")?.type).toBe("select");
  });

  it("lists select options with readable labels", () => {
    expect(byId.get("kind")?.options).toEqual([
      { label: "Standard", value: "standard" },
      { label: "Landing", value: "landing" },
      { label: "Legacy", value: "legacy" },
    ]);
    expect(byId.get("_status")?.options).toEqual([
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ]);
  });

  it("offers only operators the Payload query API supports", () => {
    expect(byId.get("title")?.operators).not.toContain("starts_with");
    expect(byId.get("title")?.operators).not.toContain("ends_with");
    expect(byId.get("publishedAt")?.operators).not.toContain("equals");
  });

  it("adds no status field to a collection without drafts", () => {
    const plain = payloadFilterFields([{ name: "title", type: "text" }], {
      hasDrafts: false,
    });
    expect(plain.map((field) => field.id)).toEqual(["title"]);
  });
});

describe("filterStateToWhere", () => {
  const definitions = payloadFilterFields(FIELDS, { hasDrafts: true });

  it("returns an empty query when nothing is filtered", () => {
    expect(filterStateToWhere(state("and", []), definitions)).toEqual({});
  });

  it("joins AND conditions in one Payload and-group", () => {
    expect(
      filterStateToWhere(
        state("and", [
          condition("title", "contains", "Kenya"),
          condition("_status", "equals", "draft"),
        ]),
        definitions,
      ),
    ).toEqual({
      or: [
        {
          and: [{ title: { like: "Kenya" } }, { _status: { equals: "draft" } }],
        },
      ],
    });
  });

  it("gives each OR condition its own and-group", () => {
    expect(
      filterStateToWhere(
        state("or", [
          condition("title", "not_contains", "draft"),
          condition("featured", "is_true", null),
        ]),
        definitions,
      ),
    ).toEqual({
      or: [
        { and: [{ title: { not_like: "draft" } }] },
        { and: [{ featured: { equals: true } }] },
      ],
    });
  });

  it("writes each group of an OR of AND groups as its own and-group", () => {
    expect(
      filterStateToWhere(
        {
          logic: "or",
          conditions: [],
          groups: [
            {
              id: "g1",
              logic: "and",
              conditions: [
                condition("title", "contains", "Kenya"),
                condition("featured", "is_true", null),
              ],
            },
            {
              id: "g2",
              logic: "and",
              conditions: [
                condition("slug", "equals", "home"),
                condition("order", "gt", null),
              ],
            },
            {
              id: "g3",
              logic: "and",
              conditions: [condition("order", "gt", null)],
            },
          ],
        },
        definitions,
      ),
    ).toEqual({
      or: [
        {
          and: [{ title: { like: "Kenya" } }, { featured: { equals: true } }],
        },
        { and: [{ slug: { equals: "home" } }] },
      ],
    });
  });

  it("skips conditions that are still missing a value", () => {
    expect(
      filterStateToWhere(
        state("and", [
          condition("title", "contains", "  "),
          condition("order", "gt", null),
          condition("tags", "in", []),
          condition("slug", "is_empty", null),
        ]),
        definitions,
      ),
    ).toEqual({ or: [{ and: [{ slug: { exists: false } }] }] });
  });

  it("maps number comparisons and ranges", () => {
    expect(
      filterStateToWhere(
        state("and", [
          condition("order", "gte", 2),
          condition("order", "between", { min: 1, max: 5 }),
        ]),
        definitions,
      ),
    ).toEqual({
      or: [
        {
          and: [
            { order: { greater_than_equal: 2 } },
            { order: { greater_than_equal: 1, less_than_equal: 5 } },
          ],
        },
      ],
    });
  });

  it("compares dates against whole local days", () => {
    const day = new Date(2026, 10, 7, 15, 30);
    const start = new Date(2026, 10, 7, 0, 0, 0, 0).toISOString();
    const end = new Date(2026, 10, 7, 23, 59, 59, 999).toISOString();
    expect(
      filterStateToWhere(
        state("and", [
          condition("publishedAt", "before", day),
          condition("publishedAt", "after", day),
          condition("publishedAt", "on_or_before", day),
          condition("publishedAt", "on_or_after", day),
          condition("publishedAt", "between", { from: day, to: day }),
        ]),
        definitions,
      ),
    ).toEqual({
      or: [
        {
          and: [
            { publishedAt: { less_than: start } },
            { publishedAt: { greater_than: end } },
            { publishedAt: { less_than_equal: end } },
            { publishedAt: { greater_than_equal: start } },
            {
              publishedAt: { greater_than_equal: start, less_than_equal: end },
            },
          ],
        },
      ],
    });
  });

  it("maps set membership for multi-value fields", () => {
    expect(
      filterStateToWhere(
        state("and", [
          condition("tags", "in", ["news"]),
          condition("kind", "not_in", ["legacy", "landing"]),
        ]),
        definitions,
      ),
    ).toEqual({
      or: [
        {
          and: [
            { tags: { in: ["news"] } },
            { kind: { not_in: ["legacy", "landing"] } },
          ],
        },
      ],
    });
  });

  it("ignores conditions on fields that are not filterable", () => {
    expect(
      filterStateToWhere(
        state("and", [condition("secret", "equals", "x")]),
        definitions,
      ),
    ).toEqual({});
  });
});

describe("whereToFilterState", () => {
  const definitions = payloadFilterFields(FIELDS, { hasDrafts: true });
  const strip = (filter: AdvancedFilterState) => ({
    logic: filter.logic,
    conditions: filter.conditions.map(({ field, operator, value }) => ({
      field,
      operator,
      value,
    })),
  });

  it("reads an empty or missing query as no filters", () => {
    expect(strip(whereToFilterState(undefined, definitions))).toEqual({
      logic: "and",
      conditions: [],
    });
    expect(strip(whereToFilterState({}, definitions))).toEqual({
      logic: "and",
      conditions: [],
    });
  });

  it("round-trips what filterStateToWhere writes", () => {
    const original = state("and", [
      condition("title", "contains", "Kenya"),
      condition("_status", "equals", "draft"),
      condition("order", "between", { min: 1, max: 5 }),
      condition("featured", "is_false", null),
      condition("slug", "is_not_empty", null),
      condition("tags", "in", ["news"]),
    ]);
    const where = filterStateToWhere(original, definitions);
    expect(strip(whereToFilterState(where, definitions))).toEqual(
      strip(original),
    );

    const either = state("or", [
      condition("title", "equals", "Home"),
      condition("kind", "not_equals", "legacy"),
    ]);
    expect(
      strip(
        whereToFilterState(
          filterStateToWhere(either, definitions),
          definitions,
        ),
      ),
    ).toEqual(strip(either));
  });

  it("round-trips an OR of AND groups exactly", () => {
    const where = {
      or: [
        {
          and: [{ title: { like: "Kenya" } }, { _status: { equals: "draft" } }],
        },
        { and: [{ kind: { equals: "landing" } }] },
      ],
    };
    const read = whereToFilterState(where, definitions);
    expect(read.logic).toBe("or");
    expect(read.conditions).toEqual([]);
    expect(
      read.groups.map((group) =>
        group.conditions.map(({ field, operator, value }) => ({
          field,
          operator,
          value,
        })),
      ),
    ).toEqual([
      [
        { field: "title", operator: "contains", value: "Kenya" },
        { field: "_status", operator: "equals", value: "draft" },
      ],
      [{ field: "kind", operator: "equals", value: "landing" }],
    ]);
    expect(filterStateToWhere(read, definitions)).toEqual(where);
  });

  it("reads date bounds back as the day they fall on", () => {
    const day = new Date(2026, 10, 7);
    const where = filterStateToWhere(
      state("and", [condition("publishedAt", "on_or_after", day)]),
      definitions,
    );
    const [read] = whereToFilterState(where, definitions).conditions;
    expect(read?.operator).toBe("on_or_after");
    expect((read?.value as Date).toDateString()).toBe(day.toDateString());
  });

  it("reads a plain field query, as a URL may carry", () => {
    expect(
      strip(whereToFilterState({ slug: { equals: "home" } }, definitions)),
    ).toEqual({
      logic: "and",
      conditions: [{ field: "slug", operator: "equals", value: "home" }],
    });
  });

  it("drops clauses it cannot show instead of misreading them", () => {
    expect(
      strip(
        whereToFilterState(
          {
            or: [
              {
                and: [
                  { secret: { equals: "x" } },
                  { title: { near: "1,2" } },
                  { title: { like: "Kenya" } },
                ],
              },
            ],
          },
          definitions,
        ),
      ),
    ).toEqual({
      logic: "and",
      conditions: [{ field: "title", operator: "contains", value: "Kenya" }],
    });
  });
});

describe("canEditWhere", () => {
  const definitions = payloadFilterFields(FIELDS, { hasDrafts: true });

  it("accepts no filter and every shape the builder writes", () => {
    expect(canEditWhere(undefined, definitions)).toBe(true);
    expect(canEditWhere({}, definitions)).toBe(true);
    expect(
      canEditWhere(
        {
          or: [
            {
              and: [
                { title: { like: "Kenya" } },
                { _status: { equals: "draft" } },
              ],
            },
          ],
        },
        definitions,
      ),
    ).toBe(true);
    expect(
      canEditWhere(
        {
          or: [
            { and: [{ title: { like: "a" } }] },
            { and: [{ slug: { equals: "b" } }] },
          ],
        },
        definitions,
      ),
    ).toBe(true);
    expect(canEditWhere({ slug: { equals: "home" } }, definitions)).toBe(true);
  });

  it("accepts a compound OR of AND groups, which the grouped builder shows", () => {
    expect(
      canEditWhere(
        {
          or: [
            {
              and: [{ title: { like: "a" } }, { slug: { equals: "a" } }],
            },
            {
              and: [{ title: { like: "b" } }, { slug: { equals: "b" } }],
            },
          ],
        },
        definitions,
      ),
    ).toBe(true);
    expect(
      canEditWhere(
        {
          or: [
            { title: { like: "a" }, slug: { equals: "a" } },
            { title: { like: "b" } },
          ],
        },
        definitions,
      ),
    ).toBe(true);
  });

  it("refuses an OR with an empty group, which matches every document", () => {
    expect(
      canEditWhere(
        { or: [{ and: [] }, { and: [{ title: { like: "a" } }] }] },
        definitions,
      ),
    ).toBe(false);
  });

  it("refuses a where whose clauses sit beside its OR or AND list", () => {
    // The builder shows the OR groups; a clause beside them (a root
    // `_status`, or a key beside a group's `and`) has no row, so editing
    // would drop that restriction without saying so.
    const groups = [
      { and: [{ title: { like: "Kenya" } }, { slug: { equals: "kenya" } }] },
      { and: [{ title: { like: "Uganda" } }, { slug: { equals: "uganda" } }] },
    ];
    expect(
      canEditWhere({ _status: { equals: "draft" }, or: groups }, definitions),
    ).toBe(false);
    expect(
      canEditWhere(
        {
          or: [{ ...groups[0], _status: { equals: "draft" } }, groups[1]],
        },
        definitions,
      ),
    ).toBe(false);
    expect(
      canEditWhere(
        {
          _status: { equals: "draft" },
          and: [{ title: { like: "a" } }],
        },
        definitions,
      ),
    ).toBe(false);
    expect(
      canEditWhere(
        { or: groups, and: [{ title: { like: "a" } }] },
        definitions,
      ),
    ).toBe(false);
  });

  it("refuses a where with clauses the builder would drop", () => {
    expect(canEditWhere({ secret: { equals: "x" } }, definitions)).toBe(false);
    expect(canEditWhere({ title: { near: "1,2" } }, definitions)).toBe(false);
    expect(
      canEditWhere({ and: [{ or: [{ title: { like: "a" } }] }] }, definitions),
    ).toBe(false);
  });
});

describe("relationship filters", () => {
  const RELATIONSHIP_FIELDS = [
    { name: "title", type: "text", label: "Title" },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      label: "Tenant",
    },
    {
      name: "authors",
      type: "relationship",
      relationTo: "cms-users",
      hasMany: true,
      label: "Authors",
    },
    // Polymorphic relationships have no single option list to offer.
    { name: "related", type: "relationship", relationTo: ["pages", "media"] },
  ];
  const options = {
    tenant: [
      { label: "E2E Tenant", value: "1" },
      { label: "Second Tenant", value: "2" },
    ],
    authors: [{ label: "Avery Lopez", value: "7" }],
  };
  const fields = payloadFilterFields(RELATIONSHIP_FIELDS, {
    hasDrafts: false,
    relationshipOptions: options,
  });

  it("offers single-collection relationships with their documents as options", () => {
    const tenant = fields.find((field) => field.id === "tenant");
    expect(tenant).toMatchObject({ label: "Tenant", type: "select" });
    expect(tenant?.options).toEqual(options.tenant);
    const authors = fields.find((field) => field.id === "authors");
    expect(authors).toMatchObject({ type: "multi-select" });
    expect(fields.some((field) => field.id === "related")).toBe(false);
  });

  it("filters by the related document's id and reads Payload's numeric ids back", () => {
    const where = filterStateToWhere(
      state("and", [condition("tenant", "equals", "2")]),
      fields,
    );
    expect(where).toEqual({ or: [{ and: [{ tenant: { equals: "2" } }] }] });
    // A link or saved preference may carry the id as a number.
    const read = whereToFilterState(
      { or: [{ and: [{ tenant: { equals: 2 } }] }] },
      fields,
    );
    expect(read.conditions).toMatchObject([
      { field: "tenant", operator: "equals", value: "2" },
    ]);
    expect(
      canEditWhere({ or: [{ and: [{ authors: { in: [7] } }] }] }, fields),
    ).toBe(true);
  });
});

describe("payloadGroupByFields", () => {
  it("offers fields that form groups, flattening layout fields", () => {
    const fields = payloadGroupByFields(FIELDS, { hasDrafts: true });
    // Free text (title, summary, email, slug) would give nearly every
    // document its own group, so it is not offered.
    expect(fields.map((field) => field.id)).toEqual([
      "order",
      "publishedAt",
      "kind",
      "tags",
      "featured",
      "theme",
      "tenant",
      "hero",
      "_status",
    ]);
    expect(fields.find((field) => field.id === "tenant")?.label).toBe("Tenant");
    expect(fields.find((field) => field.id === "_status")?.label).toBe(
      "Status",
    );
  });

  it("leaves out fields that opt out of grouping", () => {
    const fields = payloadGroupByFields(
      [
        { name: "kind", type: "select", options: ["a"] },
        {
          name: "private",
          type: "select",
          admin: { disabled: { groupBy: true } },
        },
      ],
      { hasDrafts: false },
    );
    expect(fields.map((field) => field.id)).toEqual(["kind"]);
  });

  it("labels fields in sentence case, as the grid's columns do", () => {
    const fields = payloadGroupByFields(
      [{ name: "pageType", type: "select", label: "Page Type", options: [] }],
      { hasDrafts: false },
    );
    expect(fields[0]?.label).toBe("Page type");
    const filters = payloadFilterFields(
      [{ name: "pageType", type: "select", label: "Page Type", options: [] }],
      { hasDrafts: false },
    );
    expect(filters[0]?.label).toBe("Page type");
  });
});

describe("Payload 4 admin.disabled", () => {
  const fields = [
    { name: "title", type: "text" },
    {
      name: "legacyContentFallback",
      type: "checkbox",
      admin: { disabled: { column: true, filter: true, groupBy: true } },
    },
    { name: "archived", type: "checkbox", admin: { disabled: true } },
    {
      name: "featured",
      type: "checkbox",
      admin: { disabled: { column: true } },
    },
  ];

  it("leaves fields disabled for filtering out of the filter builder", () => {
    const names = payloadFilterFields(fields, { hasDrafts: false }).map(
      (definition) => definition.id,
    );
    expect(names).toContain("title");
    expect(names).toContain("featured");
    expect(names).not.toContain("legacyContentFallback");
    expect(names).not.toContain("archived");
  });

  it("leaves fields disabled for grouping out of the Group menu", () => {
    const names = payloadGroupByFields(fields, { hasDrafts: false }).map(
      (option) => option.id,
    );
    expect(names).toContain("featured");
    expect(names).not.toContain("legacyContentFallback");
    expect(names).not.toContain("archived");
  });
});
