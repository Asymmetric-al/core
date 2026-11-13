import { describe, expect, it, vi } from "vitest";

import { listDonorWallet } from "../../../../../packages/api/src/donor-portal/wallet";

const card = (
  id: string,
  brand: string,
  last4: string,
  exp: [number, number],
) => ({
  id,
  type: "card",
  card: { brand, last4, exp_month: exp[0], exp_year: exp[1] },
});

const bank = (id: string, bankName: string, last4: string) => ({
  id,
  type: "us_bank_account",
  us_bank_account: { bank_name: bankName, last4 },
});

function fakeStripe(options: {
  methods?: Array<{ id: string; [key: string]: unknown }>;
  defaultId?: string | null;
  deleted?: boolean;
  missing?: boolean;
}) {
  const missingError = Object.assign(new Error("No such customer"), {
    type: "StripeInvalidRequestError",
    code: "resource_missing",
  });
  return {
    customers: {
      retrieve: vi.fn(async () => {
        if (options.missing) throw missingError;
        return options.deleted
          ? { id: "cus_1", deleted: true }
          : {
              id: "cus_1",
              invoice_settings: {
                default_payment_method: options.defaultId ?? null,
              },
            };
      }),
      listPaymentMethods: vi.fn(
        async (
          _customerId: string,
          params: { limit: number; starting_after?: string },
        ) => {
          const methods = options.methods ?? [];
          const start = params.starting_after
            ? methods.findIndex(
                (method) => method.id === params.starting_after,
              ) + 1
            : 0;
          return {
            data: methods.slice(start, start + params.limit),
            has_more: start + params.limit < methods.length,
          };
        },
      ),
    },
  } as never;
}

function fakeDb(
  pledges: Array<{ id: string; stripe_payment_method_id: string | null }>,
) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: async () => ({ data: pledges, error: null }),
  };
  return { from: vi.fn(() => chain) } as never;
}

const donor = { id: "donor-1", stripe_customer_id: "cus_1" };

describe("listDonorWallet", () => {
  it("lists saved cards and bank accounts with the default first", async () => {
    const wallet = await listDonorWallet({
      stripe: fakeStripe({
        methods: [
          card("pm_old", "mastercard", "5454", [3, 2027]),
          bank("pm_bank", "STRIPE TEST BANK", "6789"),
          card("pm_visa", "visa", "4242", [12, 2028]),
        ],
        defaultId: "pm_visa",
      }),
      supabaseAdmin: fakeDb([
        { id: "pledge-1", stripe_payment_method_id: "pm_visa" },
        { id: "pledge-2", stripe_payment_method_id: "pm_bank" },
      ]),
      donor,
      tenantId: "tenant-1",
    });

    expect(wallet).toEqual({
      status: "linked",
      methods: [
        {
          id: "pm_visa",
          kind: "card",
          brand: "Visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2028,
          isDefault: true,
          recurringGiftIds: ["pledge-1"],
        },
        {
          id: "pm_old",
          kind: "card",
          brand: "Mastercard",
          last4: "5454",
          expMonth: 3,
          expYear: 2027,
          isDefault: false,
          recurringGiftIds: [],
        },
        {
          id: "pm_bank",
          kind: "bank",
          brand: "Stripe Test Bank",
          last4: "6789",
          expMonth: null,
          expYear: null,
          isDefault: false,
          recurringGiftIds: ["pledge-2"],
        },
      ],
    });
  });

  it("includes methods beyond the first page and puts a later default first", async () => {
    const methods = Array.from({ length: 21 }, (_, index) =>
      card(`pm_${index + 1}`, "visa", "4242", [12, 2028]),
    );
    const wallet = await listDonorWallet({
      stripe: fakeStripe({ methods, defaultId: "pm_21" }),
      supabaseAdmin: fakeDb([]),
      donor,
      tenantId: "tenant-1",
    });
    expect(wallet.methods).toHaveLength(21);
    expect(wallet.methods[0]).toMatchObject({ id: "pm_21", isDefault: true });
    expect(new Set(wallet.methods.map((method) => method.id)).size).toBe(21);
  });

  it("does not infer that an unrecorded pledge uses the customer default", async () => {
    const wallet = await listDonorWallet({
      stripe: fakeStripe({
        methods: [card("pm_default", "visa", "4242", [12, 2028])],
        defaultId: "pm_default",
      }),
      supabaseAdmin: fakeDb([
        { id: "unrecorded-pledge", stripe_payment_method_id: null },
      ]),
      donor,
      tenantId: "tenant-1",
    });
    expect(wallet.methods[0].recurringGiftIds).toEqual([]);
  });

  it("says there is nothing to show when no Stripe customer is linked", async () => {
    const stripe = fakeStripe({});
    const wallet = await listDonorWallet({
      stripe,
      supabaseAdmin: fakeDb([]),
      donor: { id: "donor-1", stripe_customer_id: null },
      tenantId: "tenant-1",
    });
    expect(wallet).toEqual({ status: "not_linked", methods: [] });
  });

  it("treats a deleted or missing Stripe customer as not linked", async () => {
    for (const options of [{ deleted: true }, { missing: true }]) {
      const wallet = await listDonorWallet({
        stripe: fakeStripe(options),
        supabaseAdmin: fakeDb([]),
        donor,
        tenantId: "tenant-1",
      });
      expect(wallet).toEqual({ status: "not_linked", methods: [] });
    }
  });
});
