import { describe, expect, it } from "vitest";

import { fixture, policies } from "./fixtures";
import { resolveProjection } from "../../../../../packages/api/src/projection/index";

describe("qualified synthetic projection (not live authority proof)", () => {
  it("preserves exactly classified own values and omits private enforcement facts", () => {
    expect(resolveProjection(fixture())).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada", amount: 1250 },
    });
  });
});

describe("static ceiling and immutable floors", () => {
  it("omits whole containers, dotted and prototype keys unless safe whole fields are classified", () => {
    const x = fixture();
    expect(
      resolveProjection({
        ...x,
        row: {
          ...x.row,
          address: { secret: "private" },
          "address.secret": "private",
          constructor: "private",
          prototype: "private",
          derived_total: 1250,
        },
      }),
    ).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada", amount: 1250 },
    });
  });
  it("refuses mismatched policy set binding", () => {
    const x = fixture();
    expect(
      resolveProjection({
        ...x,
        policies: { ...x.policies, surface: "donor" },
      }),
    ).toEqual({ kind: "refused" });
  });
  it.each([
    { visible: false, editable: true },
    { tenantId: "tenant-a" },
    { recordType: "profiles" },
    { surface: "donor" },
    { fieldKey: "other" },
    { sensitivityCategory: "unknown" },
    { visible: "yes" },
    { exportable: 1 },
  ])("omits malformed or denying individual policy %j", (patch) => {
    const x = fixture();
    const baseline = x.policies.get("amount")!;
    expect(
      resolveProjection({
        ...x,
        policies: {
          ...x.policies,
          get: (key) =>
            key === "amount"
              ? ({ ...baseline, ...patch } as typeof baseline)
              : x.policies.get(key),
        },
      }),
    ).toEqual({ kind: "allowed", projection: { display_name: "Ada" } });
  });
  it("intersects read visibility with the selected current capability ceiling", () => {
    const x = fixture();
    expect(
      resolveProjection({
        ...x,
        auth: {
          ...x.auth,
          ceiling: { ...x.auth.ceiling, readableFields: ["amount"] },
        },
      }),
    ).toEqual({ kind: "allowed", projection: { amount: 1250 } });
  });
  it("uses exportable independently of visible for exact bulk export purpose", () => {
    const x = fixture("mission_control");
    const binding = {
      ...x.auth.binding,
      operation: "bulk_export" as const,
      purpose: "support_export",
    };
    expect(
      resolveProjection({
        ...x,
        auth: {
          ...x.auth,
          binding,
          ceiling: {
            ...x.auth.ceiling,
            purpose: "support_export",
            operation: "bulk_export",
          },
        },
        scope: { ...x.scope, binding },
        policies: policies(x.surface, x.recordType, [
          { fieldKey: "amount", visible: false, exportable: true },
        ]),
      }),
    ).toEqual({ kind: "allowed", projection: { amount: 1250 } });
  });
  for (const surface of [
    "donor",
    "missionary",
    "public",
    "export",
    "future_surface",
  ]) {
    it.each([
      "stripe_charge_id",
      "stripe_customer_id",
      "stripe_subscription_id",
      "stripe_payment_intent_id",
      "stripe_payment_method_id",
      "stripe_refund_ids",
    ])(`${surface} denies poisoned processor %s`, (key) => {
      const x = fixture(surface);
      expect(
        resolveProjection({
          ...x,
          row: { ...x.row, [key]: ["secret"] },
          auth: {
            ...x.auth,
            ceiling: { ...x.auth.ceiling, readableFields: [key] },
          },
          policies: policies(surface, x.recordType, [{ fieldKey: key }]),
        }),
      ).toEqual({ kind: "allowed", projection: {} });
    });
    it.each(["internal", "care", "security"])(
      `${surface} denies category %s despite positive flags`,
      (sensitivityCategory) => {
        const x = fixture(surface);
        expect(
          resolveProjection({
            ...x,
            policies: policies(surface, x.recordType, [
              {
                fieldKey: "amount",
                sensitivityCategory: sensitivityCategory as "internal",
              },
            ]),
          }),
        ).toEqual({ kind: "allowed", projection: {} });
      },
    );
  }
  it.each([
    "receipts",
    "gift_receipt_records",
    "contribution_receipt_snapshots",
  ])("refuses reserved family %s even in Mission Control", (recordType) => {
    expect(resolveProjection(fixture("mission_control", recordType))).toEqual({
      kind: "refused",
    });
  });
});

describe("value and authority preservation", () => {
  it("preserves null, false, zero, empty string, arrays and objects whole without defaults", () => {
    const x = fixture("future_surface");
    const values = {
      nullable: null,
      boolean: false,
      zero: 0,
      blank: "",
      address: { secret: "whole-column-classification" },
      items: ["a", "b"],
    };
    const keys = Object.keys(values);
    expect(
      resolveProjection({
        ...x,
        row: { ...x.row, ...values },
        auth: {
          ...x.auth,
          ceiling: { ...x.auth.ceiling, readableFields: keys },
        },
        policies: policies(
          x.surface,
          x.recordType,
          keys.map((fieldKey) => ({ fieldKey })),
        ),
      }),
    ).toEqual({ kind: "allowed", projection: values });
  });
  it("is deterministic with frozen inputs and never fabricates policy-only fields", () => {
    const x = fixture();
    Object.freeze(x.row);
    Object.freeze(x.auth);
    Object.freeze(x.scope);
    Object.freeze(x);
    expect([resolveProjection(x), resolveProjection(x), x.row]).toEqual([
      { kind: "allowed", projection: { display_name: "Ada", amount: 1250 } },
      { kind: "allowed", projection: { display_name: "Ada", amount: 1250 } },
      {
        id: "record-a",
        tenant_id: "tenant-a",
        legal_entity_id: "entity-a",
        owner_id: "person-a",
        display_name: "Ada",
        amount: 1250,
      },
    ]);
  });
  it("keeps unclassified derived fields absent even in Mission Control", () => {
    const x = fixture("mission_control");
    expect(
      resolveProjection({
        ...x,
        row: { ...x.row, derived_total: 1250, status: "active" },
      }),
    ).toEqual({
      kind: "allowed",
      projection: { display_name: "Ada", amount: 1250 },
    });
  });
  it("has an explicit allowed-empty result when policy has no admissions", () => {
    const x = fixture();
    expect(
      resolveProjection({
        ...x,
        policies: policies(x.surface, x.recordType, []),
      }),
    ).toEqual({ kind: "allowed", projection: {} });
  });
  it("never exposes inherited row or policy properties", () => {
    const x = fixture();
    const row = Object.assign(
      Object.create({ inherited_secret: "hidden" }),
      x.row,
    );
    const positive = x.policies.get("amount")!;
    expect(
      resolveProjection({
        ...x,
        row,
        policies: { ...x.policies, get: () => Object.create(positive) },
      }),
    ).toEqual({ kind: "allowed", projection: {} });
  });
  it("denies a nondeterministic static lookup rather than selecting its wider return", () => {
    const x = fixture();
    let call = 0;
    expect(
      resolveProjection({
        ...x,
        policies: {
          ...x.policies,
          get: (key) => (++call % 2 ? undefined : x.policies.get(key)),
        },
      }),
    ).toEqual({ kind: "allowed", projection: {} });
  });
  it.each([
    "stripe_charge_id",
    "stripe_customer_id",
    "stripe_subscription_id",
    "stripe_payment_intent_id",
    "stripe_payment_method_id",
    "stripe_refund_ids",
  ])("Mission Control needs bound finance authority for %s", (key) => {
    const x = fixture("mission_control");
    const row = {
      ...x.row,
      [key]: key === "stripe_refund_ids" ? ["re_a", "re_b"] : "processor-a",
    };
    const input = {
      ...x,
      row,
      policies: policies(x.surface, x.recordType, [{ fieldKey: key }]),
      auth: {
        ...x.auth,
        ceiling: {
          ...x.auth.ceiling,
          readableFields: [key],
          exportableFields: [key],
        },
      },
    };
    const finance = {
      kind: "processor_identifier_read" as const,
      contextRef: "context-a",
      contextRevision: "context-v1",
      purpose: "support_history",
    };
    const authorized = {
      ...input,
      auth: { ...input.auth, ceiling: { ...input.auth.ceiling, finance } },
    };
    expect([resolveProjection(input), resolveProjection(authorized)]).toEqual([
      { kind: "allowed", projection: {} },
      { kind: "allowed", projection: { [key]: row[key] } },
    ]);
    const binding = { ...x.auth.binding, operation: "bulk_export" as const };
    expect(
      resolveProjection({
        ...authorized,
        auth: {
          ...authorized.auth,
          binding,
          ceiling: {
            ...authorized.auth.ceiling,
            purpose: "support_history",
            operation: "bulk_export",
          },
        },
        scope: { ...x.scope, binding },
      }),
    ).toEqual({ kind: "allowed", projection: {} });
  });
  it("rejects stale or unrelated finance facts", () => {
    const x = fixture("mission_control");
    expect(
      resolveProjection({
        ...x,
        row: { ...x.row, stripe_customer_id: "secret" },
        auth: {
          ...x.auth,
          ceiling: {
            ...x.auth.ceiling,
            readableFields: ["stripe_customer_id"],
            finance: {
              kind: "processor_identifier_read",
              contextRef: "other-hat",
              contextRevision: "context-v1",
              purpose: "support_history",
            },
          },
        },
        policies: policies(x.surface, x.recordType, [
          { fieldKey: "stripe_customer_id" },
        ]),
      }),
    ).toEqual({ kind: "allowed", projection: {} });
  });
});

it("refuses inherited policy-set bindings rather than treating prototype metadata as a ceiling", () => {
  const x = fixture();
  const inherited = Object.assign(
    Object.create({ surface: x.surface, recordType: x.recordType }),
    { get: x.policies.get },
  );
  expect(resolveProjection({ ...x, policies: inherited })).toEqual({
    kind: "refused",
  });
});

it("refuses a non-data whole-container prototype instead of serializing inherited private content", () => {
  const x = fixture();
  const address = Object.assign(
    Object.create({ toJSON: () => ({ secret: "inherited" }) }),
    { city: "London" },
  );
  expect(
    resolveProjection({
      ...x,
      row: { ...x.row, address },
      auth: {
        ...x.auth,
        ceiling: { ...x.auth.ceiling, readableFields: ["address"] },
      },
      policies: policies(x.surface, x.recordType, [{ fieldKey: "address" }]),
    }),
  ).toEqual({ kind: "refused" });
});
