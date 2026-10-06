import { describe, expect, it } from "vitest";

import { fixture } from "./fixtures";
import {
  resolveProjection,
  type ProjectionInput,
} from "../../../../../packages/api/src/projection/index";

function poison(input: ProjectionInput, patch: unknown): ProjectionInput {
  return { ...input, ...(patch as object) };
}

describe("exact qualified context and scope", () => {
  it.each([
    ["missing scope", (x: ProjectionInput) => poison(x, { scope: undefined })],
    [
      "wrong tenant with same row ID",
      (x: ProjectionInput) => ({
        ...x,
        row: { ...x.row, tenant_id: "tenant-b" },
      }),
    ],
    [
      "wrong entity",
      (x: ProjectionInput) => ({
        ...x,
        row: { ...x.row, legal_entity_id: "entity-b" },
      }),
    ],
    [
      "missing entity",
      (x: ProjectionInput) => ({
        ...x,
        row: { ...x.row, legal_entity_id: null },
      }),
    ],
    [
      "stale current context",
      (x: ProjectionInput) =>
        poison(x, {
          auth: {
            ...x.auth,
            current: {
              contextRevision: "context-v2",
              sourceRevision: "source-v1",
            },
          },
        }),
    ],
    [
      "foreign source",
      (x: ProjectionInput) => ({
        ...x,
        scope: {
          ...x.scope!,
          binding: { ...x.scope!.binding, sourceRef: "source-b" },
        },
      }),
    ],
    [
      "wrong owner",
      (x: ProjectionInput) => ({
        ...x,
        row: { ...x.row, owner_id: "person-b" },
      }),
    ],
    [
      "missing required relationship",
      (x: ProjectionInput) =>
        poison(x, { scope: { ...x.scope, relationship: undefined } }),
    ],
    [
      "old auth context",
      (x: ProjectionInput) =>
        poison(x, {
          auth: { userId: "person-a", tenantId: "tenant-a", role: "finance" },
        }),
    ],
  ])("refuses %s", (_name, mutate) => {
    expect(resolveProjection(mutate(fixture()))).toEqual({ kind: "refused" });
  });
  it("permits explicitly qualified not-applicable restrictions for a non-entity record", () => {
    const x = fixture("donor", "profiles");
    expect(
      resolveProjection({
        ...x,
        row: { id: "record-a", tenant_id: "tenant-a", display_name: "Ada" },
        scope: {
          ...x.scope!,
          legalEntity: { kind: "not_applicable" },
          ownership: { kind: "not_applicable" },
        },
      }),
    ).toEqual({ kind: "allowed", projection: { display_name: "Ada" } });
  });
  it.each(["public", "nhi", "operator", "unknown"])(
    "refuses unavailable %s variants without converting them to humans",
    (kind) => {
      const x = fixture();
      expect(
        resolveProjection(poison(x, { auth: { ...x.auth, kind } })),
      ).toEqual({ kind: "refused" });
    },
  );
});

it("unrelated hats, roles, mutable defaults and dormant overrides cannot widen the chosen assignment", () => {
  const x = fixture();
  const added = poison(x, {
    auth: {
      ...x.auth,
      memberships: [{ role: "finance", tenantId: "tenant-b" }],
      roles: ["super_admin"],
      tenantOverrides: { visible: true },
      tenantDefaultEntity: "entity-b",
    },
  });
  expect(resolveProjection(added)).toEqual({
    kind: "allowed",
    projection: { display_name: "Ada", amount: 1250 },
  });
});
it("supports an explicit current two-entity set but still checks exact row entity", () => {
  const x = fixture();
  expect(
    resolveProjection({
      ...x,
      row: { ...x.row, legal_entity_id: "entity-b" },
      auth: {
        ...x.auth,
        legalEntities: {
          ...x.auth.legalEntities,
          ids: ["entity-a", "entity-b"],
        },
      },
      scope: {
        ...x.scope,
        legalEntity: {
          kind: "applicable",
          entityId: "entity-b",
          scopeRevision: "entities-v1",
        },
      },
    }),
  ).toEqual({
    kind: "allowed",
    projection: { display_name: "Ada", amount: 1250 },
  });
});
it.each([
  "contextRef",
  "principalId",
  "tenantId",
  "purpose",
  "recordType",
  "recordId",
  "sourceRef",
  "sourceRevision",
  "operation",
])("a substituted %s scope binding refuses", (key) => {
  const x = fixture();
  expect(
    resolveProjection(
      poison(x, {
        scope: {
          ...x.scope,
          binding: { ...x.scope.binding, [key]: "foreign" },
        },
      }),
    ),
  ).toEqual({ kind: "refused" });
});
it("a stale Legal Entity revision refuses even when record ID and entity match", () => {
  const x = fixture();
  expect(
    resolveProjection({
      ...x,
      auth: {
        ...x.auth,
        legalEntities: {
          ...x.auth.legalEntities,
          currentRevision: "entities-v2",
        },
      },
    }),
  ).toEqual({ kind: "refused" });
});
