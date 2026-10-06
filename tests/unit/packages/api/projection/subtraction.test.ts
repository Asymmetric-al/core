import { describe, expect, it } from "vitest";

import { fixture } from "./fixtures";
import {
  resolveProjection,
  type ProjectionPredicate,
  type RowScope,
} from "../../../../../packages/api/src/projection/index";

function scoped(patch: Partial<RowScope>) {
  const x = fixture();
  return { ...x, scope: { ...x.scope, ...patch } };
}

describe("required subtractive restrictions", () => {
  it("uses private identity intent before pruning without inferring anonymity from guest status", () => {
    const x = scoped({
      anonymity: {
        kind: "applicable",
        intent: "anonymous",
        audience: "identity_restricted",
        identityFields: ["display_name"],
        identityRequired: true,
        identityField: "owner_id",
      },
    });
    expect(resolveProjection(x)).toEqual({
      kind: "allowed",
      projection: { amount: 1250 },
    });
  });
  it("named known guest identity is preserved by its policy", () => {
    expect(
      resolveProjection(
        scoped({
          anonymity: {
            kind: "applicable",
            intent: "named",
            audience: "identity_restricted",
            identityFields: ["display_name"],
            identityRequired: true,
            identityField: "owner_id",
          },
        }),
      ),
    ).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada", amount: 1250 },
    });
  });
  it("refuses missing required private identity rather than inventing anonymous=false", () => {
    const x = scoped({
      ownership: { kind: "not_applicable" },
      anonymity: {
        kind: "applicable",
        intent: "named",
        audience: "identity_restricted",
        identityFields: ["display_name"],
        identityRequired: true,
        identityField: "donor_id",
      },
    });
    expect(
      resolveProjection({ ...x, row: { ...x.row, donor_id: null } }),
    ).toEqual({ kind: "refused" });
  });
  it("an explicit unknown offline disposition removes identity without fabricating a donor", () => {
    expect(
      resolveProjection(
        scoped({
          anonymity: {
            kind: "applicable",
            intent: "unknown_offline",
            audience: "identity_restricted",
            identityFields: ["display_name"],
            identityRequired: false,
            identityField: "offline_identity_id",
          },
        }),
      ),
    ).toEqual({ kind: "allowed", projection: { amount: 1250 } });
  });
  it.each(["open", "settled", "locked"] as const)(
    "%s is not a blanket read denial",
    (value) => {
      expect(
        resolveProjection(
          scoped({
            state: {
              kind: "applicable",
              value,
              refuse: false,
              removeFields: [],
            },
          }),
        ),
      ).toEqual({
        kind: "allowed",
        projection: { display_name: "Ada", amount: 1250 },
      });
    },
  );
  it("explicit state restriction refuses the row", () => {
    expect(
      resolveProjection(
        scoped({
          state: {
            kind: "applicable",
            value: "locked",
            refuse: true,
            removeFields: [],
          },
        }),
      ),
    ).toEqual({ kind: "refused" });
  });
  it("flags remove only specified fields", () => {
    expect(
      resolveProjection(
        scoped({
          flags: {
            kind: "applicable",
            refuse: false,
            removeFields: ["display_name"],
          },
        }),
      ),
    ).toEqual({ kind: "allowed", projection: { amount: 1250 } });
  });
  it.each([
    undefined,
    "allow",
    Promise.resolve({ kind: "retain" }),
    { kind: "remove" },
    { kind: "allow", fields: ["owner_id"] },
    { kind: "remove", fields: ["address.street"] },
  ])("refuses malformed extension result %j", (result) => {
    expect(
      resolveProjection(
        scoped({ predicates: [(() => result) as ProjectionPredicate] }),
      ),
    ).toEqual({ kind: "refused" });
  });
  it("a thrown/unavailable restriction refuses", () => {
    expect(
      resolveProjection(
        scoped({
          predicates: [
            () => {
              throw new Error("unavailable");
            },
          ],
        }),
      ),
    ).toEqual({ kind: "refused" });
  });
  it("extensions can read private facts and refuse before any output", () => {
    expect(
      resolveProjection(
        scoped({
          predicates: [
            ({ row }) =>
              row.owner_id === "person-a"
                ? {
                    kind: "remove",
                    fields: ["display_name", "private_not_classified"],
                  }
                : { kind: "refuse" },
          ],
        }),
      ),
    ).toEqual({ kind: "allowed", projection: { amount: 1250 } });
  });
  it("composed field removals commute and cannot restore a field/value", () => {
    const a: ProjectionPredicate = () => ({
      kind: "remove",
      fields: ["display_name"],
    });
    const b: ProjectionPredicate = () => ({
      kind: "remove",
      fields: ["amount", "absent"],
    });
    expect([
      resolveProjection(scoped({ predicates: [a, b] })),
      resolveProjection(scoped({ predicates: [b, a] })),
    ]).toEqual([
      { kind: "allowed", projection: {} },
      { kind: "allowed", projection: {} },
    ]);
  });
  it("isolates callback input so even attempted nested mutation cannot change supplied values", () => {
    const x = scoped({
      predicates: [
        ({ row }) => {
          (row.address as { secret: string }).secret = "changed";
          return { kind: "retain" };
        },
      ],
    });
    const row = { ...x.row, address: { secret: "original" } };
    expect([resolveProjection({ ...x, row }), row.address]).toEqual([
      { kind: "refused" },
      { secret: "original" },
    ]);
  });
});
