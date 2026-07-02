import { describe, expect, it } from "vitest";

import {
  buildReceiptSnapshotContent,
  resolveTenantReceiptDeliveryPolicy,
  type ReceiptSnapshotContentV1,
  type ReceiptSnapshotSourceDetail,
} from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";
import {
  assertProductionReceiptRenderMode,
  assertReceiptSnapshotPdfCapability,
  buildUpdatedReceiptHtml,
  renderContributionReceiptSnapshotPdf,
} from "../../../../../packages/api/src/admin/contribution-operations/receipt-pdf";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  DocRaptorClient,
  DocRaptorRenderRequest,
} from "@asym/docraptor-client";

const TENANT_ID = "tenant-1";
const SNAPSHOT_ID = "snap-1";

function snapshotSourceDetail(): ReceiptSnapshotSourceDetail {
  return {
    shared: {
      donationId: "donation-1",
      donorName: 'Jordan <script>alert("x")</script> & Co',
      giftDate: "2026-05-01",
      currencyCode: "USD",
    },
    effective: {
      amountCents: 20_000,
      fundId: "fund-1",
      missionaryId: "missionary-1",
      paymentStatus: "completed",
    },
    designations: {
      lines: [
        {
          id: "line-1",
          amountCents: 12_000,
          fundId: "fund-1",
          fundName: "Clean <Water> Initiative",
          missionaryId: "missionary-1",
          missionaryName: "Riley Worker",
          memo: 'Well "repair"',
        },
        {
          id: "line-2",
          amountCents: 8_000,
          fundId: null,
          fundName: "General Fund",
          missionaryId: null,
          missionaryName: null,
          memo: null,
        },
      ],
    },
  };
}

function snapshotContent(): ReceiptSnapshotContentV1 {
  return buildReceiptSnapshotContent({
    detail: snapshotSourceDetail(),
    affectedFields: ["amount", "designation"],
    adjustmentId: "adj-1",
    now: new Date("2026-06-01T12:00:00.000Z"),
  });
}

function createSnapshotStub(
  row: Record<string, unknown> | null,
): AdminSupabaseClient {
  return {
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: () =>
          Promise.resolve(
            table === "contribution_receipt_snapshots"
              ? { data: row, error: null }
              : { data: null, error: null },
          ),
      };
      return builder;
    },
  } as unknown as AdminSupabaseClient;
}

function createFakeDocRaptorClient(): {
  client: DocRaptorClient;
  calls: DocRaptorRenderRequest[];
} {
  const calls: DocRaptorRenderRequest[] = [];
  const client: DocRaptorClient = {
    async renderSync(input) {
      calls.push(input);
      return {
        kind: "sync",
        pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
        contentType: "application/pdf",
        request: {
          url: "https://docraptor.example/docs",
          method: "POST",
          mode: "test",
          test: true,
          media: input.media ?? "print",
          tag: input.tag,
          idempotency: input.idempotency,
        },
        idempotency: input.idempotency,
      };
    },
    async createAsyncRender(): Promise<never> {
      throw new Error("not used in this test");
    },
    async getAsyncRenderStatus(): Promise<never> {
      throw new Error("not used in this test");
    },
    async pollAsyncRenderStatus(): Promise<never> {
      throw new Error("not used in this test");
    },
  };

  return { client, calls };
}

describe("buildUpdatedReceiptHtml", () => {
  it("frames the document as an updated receipt with donor, date, and amount", () => {
    const { html, title } = buildUpdatedReceiptHtml(snapshotContent());

    expect(title).toContain("Updated receipt");
    expect(html).toContain("<h1>Updated receipt</h1>");
    expect(html).toContain(
      "replaces the receipt previously sent for this gift",
    );
    expect(html).toContain("May 1, 2026");
    expect(html).toContain("$200.00");
    expect(html).toContain("Donation ID: donation-1");
  });

  it("renders every designation line equally with fund, missionary, memo, and amount", () => {
    const { html } = buildUpdatedReceiptHtml(snapshotContent());

    expect(html).toContain("Clean &lt;Water&gt; Initiative");
    expect(html).toContain("Riley Worker");
    expect(html).toContain("Well &quot;repair&quot;");
    expect(html).toContain("$120.00");
    expect(html).toContain("General Fund");
    expect(html).toContain("$80.00");
    expect(html.match(/<tr><td>/g)).toHaveLength(2);
  });

  it("escapes donor-controlled values so markup never executes", () => {
    const { html } = buildUpdatedReceiptHtml(snapshotContent());

    expect(html).not.toContain("<script>");
    expect(html).toContain(
      "Jordan &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; Co",
    );
  });
});

describe("assertReceiptSnapshotPdfCapability", () => {
  it("enforces the tenant-configured PDF capability", () => {
    const policy = resolveTenantReceiptDeliveryPolicy(null);

    expect(() =>
      assertReceiptSnapshotPdfCapability({
        policy,
        viewerCapabilities: ["contributions.manage_receipts"],
      }),
    ).not.toThrow();

    expect(() =>
      assertReceiptSnapshotPdfCapability({
        policy,
        viewerCapabilities: ["contributions.view_detail"],
      }),
    ).toThrowError(/manage_receipts/);
  });
});

describe("renderContributionReceiptSnapshotPdf", () => {
  it("renders print-media PDFs with app-layer idempotency metadata", async () => {
    const { client, calls } = createFakeDocRaptorClient();

    const rendered = await renderContributionReceiptSnapshotPdf({
      supabaseAdmin: createSnapshotStub({
        id: SNAPSHOT_ID,
        donation_id: "donation-1",
        kind: "pdf",
        content: JSON.parse(JSON.stringify(snapshotContent())),
      }),
      tenantId: TENANT_ID,
      snapshotId: SNAPSHOT_ID,
      docraptorClient: client,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      media: "print",
      tag: `contribution-receipt-snapshot/${TENANT_ID}/${SNAPSHOT_ID}`,
      idempotency: {
        key: `contribution-receipt-snapshot/${TENANT_ID}/${SNAPSHOT_ID}`,
        scope: "contribution-receipt-snapshot",
        recordId: SNAPSHOT_ID,
      },
    });
    expect(calls[0].html).toContain("<h1>Updated receipt</h1>");

    expect(rendered).toMatchObject({
      contentType: "application/pdf",
      filename: `updated-receipt-${SNAPSHOT_ID}.pdf`,
      snapshot: { donationId: "donation-1", kind: "pdf" },
    });
    expect(rendered.pdf).toBeInstanceOf(Uint8Array);
  });

  it("returns 404 for unknown or cross-tenant snapshots", async () => {
    const { client } = createFakeDocRaptorClient();

    await expect(
      renderContributionReceiptSnapshotPdf({
        supabaseAdmin: createSnapshotStub(null),
        tenantId: TENANT_ID,
        snapshotId: SNAPSHOT_ID,
        docraptorClient: client,
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: expect.stringMatching(/snapshot not found/i),
    });
  });

  it("returns 409 for legacy snapshots that predate PDF rendering", async () => {
    const { client, calls } = createFakeDocRaptorClient();

    await expect(
      renderContributionReceiptSnapshotPdf({
        supabaseAdmin: createSnapshotStub({
          id: SNAPSHOT_ID,
          donation_id: "donation-1",
          kind: "pdf",
          content: {
            effective: { amountCents: 20_000 },
            designationLines: [],
          },
        }),
        tenantId: TENANT_ID,
        snapshotId: SNAPSHOT_ID,
        docraptorClient: client,
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/predates pdf rendering/i),
    });

    expect(calls).toHaveLength(0);
  });

  it("returns 503 when DocRaptor is not configured", async () => {
    await expect(
      renderContributionReceiptSnapshotPdf({
        supabaseAdmin: createSnapshotStub({
          id: SNAPSHOT_ID,
          donation_id: "donation-1",
          kind: "pdf",
          content: JSON.parse(JSON.stringify(snapshotContent())),
        }),
        tenantId: TENANT_ID,
        snapshotId: SNAPSHOT_ID,
      }),
    ).rejects.toMatchObject({
      status: 503,
      message: expect.stringMatching(/not configured/i),
    });
  });
});

describe("assertProductionReceiptRenderMode", () => {
  it("refuses vendor test mode for compliance receipts", () => {
    expect(() => assertProductionReceiptRenderMode("test")).toThrowError(
      /production mode/i,
    );
    expect(() => assertProductionReceiptRenderMode(null)).toThrowError(
      /production mode/i,
    );
    expect(() => assertProductionReceiptRenderMode("production")).not.toThrow();
  });
});
