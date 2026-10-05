import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadFieldPolicies } from "../../../../../packages/api/src/field-policies/index";

type DatabaseRow = {
  record_type: string;
  field_key: string;
  surface: string;
  tenant_id: string | null;
  visible: boolean;
  editable: boolean;
  exportable: boolean;
  sensitivity_category: string;
};

const database = vi.hoisted(() => ({
  rows: [] as DatabaseRow[],
  error: null as { message: string; code: string } | null,
}));

// The database boundary is the only fake. It honors Supabase query filters
// and deliberately retains malformed policy rows for the reader to reject.
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const predicates: Array<(row: DatabaseRow) => boolean> = [];
      const query = {
        select: () => query,
        eq: (key: keyof DatabaseRow, value: unknown) => {
          predicates.push((row) => row[key] === value);
          return query;
        },
        is: (key: keyof DatabaseRow, value: null) => {
          predicates.push((row) => row[key] === value);
          return query;
        },
        order: () => query,
        then: (
          resolve: (result: {
            data: DatabaseRow[] | null;
            error: typeof database.error;
          }) => unknown,
        ) =>
          Promise.resolve(
            resolve({
              data: database.error
                ? null
                : database.rows.filter((row) =>
                    predicates.every((predicate) => predicate(row)),
                  ),
              error: database.error,
            }),
          ),
      };
      return query;
    },
  }),
}));

function row(overrides: Partial<DatabaseRow> = {}): DatabaseRow {
  return {
    record_type: "donors",
    field_key: "email",
    surface: "donor",
    tenant_id: null,
    visible: true,
    editable: true,
    exportable: false,
    sensitivity_category: "contact",
    ...overrides,
  };
}

function operations(
  policy: ReturnType<Awaited<ReturnType<typeof loadFieldPolicies>>["get"]>,
) {
  return {
    visible: policy?.visible ?? false,
    editable: policy?.editable ?? false,
    exportable: policy?.exportable ?? false,
  };
}

const denied = { visible: false, editable: false, exportable: false };

beforeEach(() => {
  database.rows = [];
  database.error = null;
});

describe("loadFieldPolicies static ceiling", () => {
  it("returns a typed policy for a classified whole column", async () => {
    database.rows = [row()];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect(policies.get("email")).toEqual({
      recordType: "donors",
      fieldKey: "email",
      surface: "donor",
      tenantId: null,
      visible: true,
      editable: true,
      exportable: false,
      sensitivityCategory: "contact",
    });
  });

  it("retains the requested surface and record type", async () => {
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect({
      surface: policies.surface,
      recordType: policies.recordType,
    }).toEqual({
      surface: "donor",
      recordType: "donors",
    });
  });

  it.each(["donor", "missionary", "public", "export"])(
    "does not synthesize permission for an unclassified key on %s",
    async (surface) => {
      const policies = await loadFieldPolicies({
        surface,
        recordType: "donors",
      });
      expect(operations(policies.get("future_private_column"))).toEqual(denied);
    },
  );

  it("leaves dotted keys inert even when an explicit positive row exists", async () => {
    database.rows = [row({ field_key: "address.street" })];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect(operations(policies.get("address.street"))).toEqual(denied);
  });

  it("reads a whole JSONB column without evaluating child keys", async () => {
    database.rows = [row({ field_key: "address" })];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect(policies.get("address")?.sensitivityCategory).toBe("contact");
  });

  it("does not infer child access from a positive whole-column policy", async () => {
    database.rows = [row({ field_key: "address" })];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect(operations(policies.get("address.street"))).toEqual(denied);
  });

  it("does not reuse policies from another record type", async () => {
    database.rows = [row()];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "profiles",
    });
    expect(operations(policies.get("email"))).toEqual(denied);
  });

  it("does not reuse policies from another surface", async () => {
    database.rows = [row()];
    const policies = await loadFieldPolicies({
      surface: "missionary",
      recordType: "donors",
    });
    expect(operations(policies.get("email"))).toEqual(denied);
  });

  it("admits a benign classified baseline row on a future text surface with its exact flags", async () => {
    database.rows = [
      row({
        field_key: "display_name",
        surface: "future_surface_491",
        editable: false,
        exportable: true,
        sensitivity_category: "public",
      }),
    ];
    const policies = await loadFieldPolicies({
      surface: "future_surface_491",
      recordType: "donors",
    });
    expect(policies.get("display_name")).toEqual({
      recordType: "donors",
      fieldKey: "display_name",
      surface: "future_surface_491",
      tenantId: null,
      visible: true,
      editable: false,
      exportable: true,
      sensitivityCategory: "public",
    });
  });

  it("keeps a future surface blind when no exact baseline row admits its field", async () => {
    database.rows = [
      row({ field_key: "display_name", sensitivity_category: "public" }),
    ];
    const policies = await loadFieldPolicies({
      surface: "future_surface_491",
      recordType: "donors",
    });
    expect(operations(policies.get("display_name"))).toEqual(denied);
  });

  it("does not activate reserved tenant overrides", async () => {
    database.rows = [
      row({ visible: false, editable: false }),
      row({ tenant_id: "tenant-491", exportable: true }),
    ];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
      tenantId: "tenant-491",
    });
    expect(operations(policies.get("email"))).toEqual(denied);
  });

  it("fails closed when a stored category is unrecognized", async () => {
    database.rows = [
      row({ sensitivity_category: "future_sensitive_category" }),
    ];
    const policies = await loadFieldPolicies({
      surface: "donor",
      recordType: "donors",
    });
    expect(operations(policies.get("email"))).toEqual(denied);
  });

  for (const fieldKey of [
    "stripe_charge_id",
    "stripe_customer_id",
    "stripe_subscription_id",
    "stripe_payment_intent_id",
    "stripe_payment_method_id",
    "stripe_refund_ids",
  ]) {
    it.each(["donor", "missionary", "public", "export", "future_surface_491"])(
      `${fieldKey} cannot disclose through an erroneously permissive row on %s`,
      async (surface) => {
        database.rows = [
          row({
            field_key: fieldKey,
            surface,
            exportable: true,
            sensitivity_category: "public",
          }),
        ];
        const policies = await loadFieldPolicies({
          surface,
          recordType: "donors",
        });
        expect(operations(policies.get(fieldKey))).toEqual(denied);
      },
    );
  }

  it.each([
    "stripe_charge_id",
    "stripe_customer_id",
    "stripe_subscription_id",
    "stripe_payment_intent_id",
    "stripe_payment_method_id",
    "stripe_refund_ids",
  ])(
    "%s remains non-exportable in Mission Control despite a permissive policy row",
    async (fieldKey) => {
      database.rows = [
        row({
          record_type: "donations",
          field_key: fieldKey,
          surface: "mission_control",
          exportable: true,
          sensitivity_category: "financial",
        }),
      ];
      const policies = await loadFieldPolicies({
        surface: "mission_control",
        recordType: "donations",
      });
      expect(policies.get(fieldKey)?.exportable ?? false).toBe(false);
    },
  );

  it("the refund identifier array remains non-editable in Mission Control despite a permissive policy row", async () => {
    database.rows = [
      row({
        record_type: "donations",
        field_key: "stripe_refund_ids",
        surface: "mission_control",
        exportable: true,
        sensitivity_category: "financial",
      }),
    ];
    const policies = await loadFieldPolicies({
      surface: "mission_control",
      recordType: "donations",
    });
    expect(policies.get("stripe_refund_ids")?.editable ?? false).toBe(false);
  });

  for (const recordType of [
    "receipts",
    "gift_receipt_records",
    "contribution_receipt_snapshots",
  ]) {
    it.each([
      "mission_control",
      "donor",
      "missionary",
      "public",
      "export",
      "future_surface_491",
    ])(
      `${recordType} cannot gain access from a row or fallback on %s`,
      async (surface) => {
        database.rows = [
          row({
            record_type: recordType,
            field_key: "amount",
            surface,
            exportable: true,
            sensitivity_category: "public",
          }),
          row({
            record_type: "donations",
            field_key: "amount",
            surface,
            exportable: true,
            sensitivity_category: "financial",
          }),
        ];
        const policies = await loadFieldPolicies({ surface, recordType });
        expect(operations(policies.get("amount"))).toEqual(denied);
      },
    );
  }
});
