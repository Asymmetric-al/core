import { describe, expect, it } from "vitest";

import {
  GIFT_RECEIPT_SNAPSHOT_VERSION,
  NON_PRODUCTION_RECEIPT_NOTICE,
  buildGiftReceiptSnapshot,
  buildReceiptNumber,
  deriveGiftReceiptStatus,
  recordGiftReceipt,
  renderGiftReceiptText,
  receiptStatusLanguage,
} from "../../../../packages/api/src/giving/receipt-record";

const baseInput = {
  tenantId: "tenant-1",
  donationId: "11112222-3333-4444-5555-666677778888",
  donationStatus: "completed",
  paymentMethod: "card",
  amountCents: 2500,
  currency: "usd",
  designation: "Global Fund",
  giftDate: "2026-07-04",
  donorName: "Ada Lovelace",
  donorEmail: "ada@example.com",
  isTest: true,
} as const;

describe("deriveGiftReceiptStatus", () => {
  // Card follows real payment state; ACH/delayed uses honest pending/processing language (Conrad §2.9/§3).
  it("maps settled card payment to paid", () => {
    expect(deriveGiftReceiptStatus({ donationStatus: "completed" })).toBe(
      "paid",
    );
    expect(deriveGiftReceiptStatus({ donationStatus: "succeeded" })).toBe(
      "paid",
    );
    expect(deriveGiftReceiptStatus({ donationStatus: "success" })).toBe("paid");
  });

  it("keeps delayed/ACH rails as processing or pending, never paid", () => {
    expect(deriveGiftReceiptStatus({ donationStatus: "processing" })).toBe(
      "processing",
    );
    expect(deriveGiftReceiptStatus({ donationStatus: "pending" })).toBe(
      "pending",
    );
  });

  it("maps failure and refund states honestly", () => {
    expect(deriveGiftReceiptStatus({ donationStatus: "failed" })).toBe(
      "failed",
    );
    expect(deriveGiftReceiptStatus({ donationStatus: "canceled" })).toBe(
      "failed",
    );
    expect(deriveGiftReceiptStatus({ donationStatus: "refunded" })).toBe(
      "refunded",
    );
  });

  it("defaults unknown states to pending (never silently paid)", () => {
    expect(deriveGiftReceiptStatus({ donationStatus: "weird_new_state" })).toBe(
      "pending",
    );
  });
});

describe("receiptStatusLanguage", () => {
  it("uses honest provisional language for processing/pending (ACH not finalized)", () => {
    expect(receiptStatusLanguage("processing").toLowerCase()).toContain(
      "provisional",
    );
    expect(receiptStatusLanguage("pending").toLowerCase()).toContain(
      "not yet final",
    );
    expect(receiptStatusLanguage("paid").toLowerCase()).toContain("received");
  });
});

describe("buildReceiptNumber", () => {
  it("is deterministic for the same gift", () => {
    const a = buildReceiptNumber({
      giftDate: baseInput.giftDate,
      donationId: baseInput.donationId,
    });
    const b = buildReceiptNumber({
      giftDate: baseInput.giftDate,
      donationId: baseInput.donationId,
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^RCPT-20260704-/);
  });
});

describe("buildGiftReceiptSnapshot", () => {
  it("captures the identity + gift facts at time of giving", () => {
    const snap = buildGiftReceiptSnapshot(baseInput);
    expect(snap.snapshotVersion).toBe(GIFT_RECEIPT_SNAPSHOT_VERSION);
    expect(snap.status).toBe("paid");
    expect(snap.identity.donorName).toBe("Ada Lovelace");
    expect(snap.identity.donorEmail).toBe("ada@example.com");
    expect(snap.amountCents).toBe(2500);
    expect(snap.designation).toBe("Global Fund");
    expect(snap.receiptNumber).toMatch(/^RCPT-20260704-/);
    expect(snap.notice).toBe(NON_PRODUCTION_RECEIPT_NOTICE);
    expect(snap.isTest).toBe(true);
  });

  // §2.6: later donor-record merges/renames must NOT rewrite receipt truth.
  it("is frozen and independent of later mutation of the source identity", () => {
    const mutableSource = {
      ...baseInput,
      donorName: "Ada Lovelace",
      donorEmail: "ada@example.com",
    };
    const snap = buildGiftReceiptSnapshot(mutableSource);

    // Simulate a later donor merge that overwrites the live identity.
    mutableSource.donorName = "MERGED SURVIVING RECORD";
    mutableSource.donorEmail = "surviving@example.com";

    expect(snap.identity.donorName).toBe("Ada Lovelace");
    expect(snap.identity.donorEmail).toBe("ada@example.com");
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.identity)).toBe(true);
    // The frozen snapshot rejects in-place rewrites of receipt truth.
    expect(() => {
      (snap.identity as { donorName: string }).donorName = "hacked";
    }).toThrow();
  });

  it("normalizes a missing donor email to null without throwing", () => {
    const snap = buildGiftReceiptSnapshot({ ...baseInput, donorEmail: null });
    expect(snap.identity.donorEmail).toBeNull();
  });
});

describe("renderGiftReceiptText", () => {
  it("renders donor-facing text from the frozen snapshot and clearly marks it non-production", () => {
    const snap = buildGiftReceiptSnapshot(baseInput);
    const text = renderGiftReceiptText(snap);
    expect(text).toContain(NON_PRODUCTION_RECEIPT_NOTICE);
    expect(text).toContain("Ada Lovelace");
    expect(text).toContain("$25.00");
    expect(text).toContain("Global Fund");
    expect(text).toContain(snap.receiptNumber);
  });

  it("reflects the snapshot identity, not a later live-record rename", () => {
    const mutableSource = { ...baseInput };
    const snap = buildGiftReceiptSnapshot(mutableSource);
    mutableSource.donorName = "RENAMED LATER";
    expect(renderGiftReceiptText(snap)).not.toContain("RENAMED LATER");
    expect(renderGiftReceiptText(snap)).toContain("Ada Lovelace");
  });
});

// --- recordGiftReceipt writer (idempotent, server-only) -----------------------

interface InsertCall {
  table: string;
  values: Record<string, unknown>;
}

function createSupabaseMock(options: { insertError?: { code: string } }) {
  const inserts: InsertCall[] = [];
  let existingLookup = false;
  const client = {
    from(table: string) {
      return {
        insert(values: Record<string, unknown>) {
          inserts.push({ table, values });
          return {
            select() {
              return {
                async single() {
                  if (options.insertError) {
                    return { data: null, error: options.insertError };
                  }
                  return { data: { id: "receipt-row-1" }, error: null };
                },
              };
            },
          };
        },
        select() {
          return {
            eq() {
              return {
                eq() {
                  return {
                    async maybeSingle() {
                      existingLookup = true;
                      return {
                        data: {
                          id: "receipt-row-existing",
                          receipt_number: "RCPT-20260704-11112222",
                          status: "paid",
                        },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };
  return {
    client,
    inserts,
    didLookupExisting: () => existingLookup,
  };
}

describe("recordGiftReceipt", () => {
  it("inserts one immutable receipt row per successful gift with the frozen snapshot", async () => {
    const mock = createSupabaseMock({});
    const result = await recordGiftReceipt({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(receipt-statement): test-double Supabase client cast
      supabaseAdmin: mock.client as any,
      ...baseInput,
    });

    expect(result.created).toBe(true);
    expect(result.id).toBe("receipt-row-1");
    expect(result.status).toBe("paid");
    expect(mock.inserts).toHaveLength(1);
    const inserted = mock.inserts[0]!;
    expect(inserted.table).toBe("gift_receipt_records");
    expect(inserted.values.tenant_id).toBe("tenant-1");
    expect(inserted.values.donation_id).toBe(baseInput.donationId);
    expect(inserted.values.status).toBe("paid");
    expect(inserted.values.snapshot_version).toBe(
      GIFT_RECEIPT_SNAPSHOT_VERSION,
    );
    // The frozen identity snapshot is persisted in the row.
    const snapshot = inserted.values.snapshot as {
      identity: { donorName: string };
    };
    expect(snapshot.identity.donorName).toBe("Ada Lovelace");
  });

  it("is idempotent: a duplicate (23505) re-reads the existing receipt instead of failing", async () => {
    const mock = createSupabaseMock({ insertError: { code: "23505" } });
    const result = await recordGiftReceipt({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(receipt-statement): test-double Supabase client cast
      supabaseAdmin: mock.client as any,
      ...baseInput,
    });

    expect(result.created).toBe(false);
    expect(result.id).toBe("receipt-row-existing");
    expect(mock.didLookupExisting()).toBe(true);
  });

  it("throws on a non-idempotency insert error", async () => {
    const mock = createSupabaseMock({ insertError: { code: "23503" } });
    await expect(
      recordGiftReceipt({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(receipt-statement): test-double Supabase client cast
        supabaseAdmin: mock.client as any,
        ...baseInput,
      }),
    ).rejects.toThrow();
  });
});
