import { parseReceiptSnapshotContent } from "./receipt-delivery";
import {
  getPdfStudioDocRaptorClient,
  resolvePdfStudioDocRaptorRuntime,
} from "../../pdf-templates/docraptor";
import { ApiHttpError } from "../../shared/http-errors";
import { asString, isRecord } from "../../shared/json-coerce";

import type {
  ReceiptSnapshotContentV1,
  TenantReceiptDeliveryPolicy,
} from "./receipt-delivery";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { DocRaptorClient } from "@asym/docraptor-client";

type SupabaseAdmin = AdminSupabaseClient;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(cents / 100);
}

/** UTC-pinned so rendering is deterministic regardless of server timezone. */
function formatGiftDate(giftDate: string): string {
  const parsed = new Date(giftDate);
  if (Number.isNaN(parsed.getTime())) {
    return giftDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}

/**
 * Pure print-media HTML for an updated receipt (#263 / ADR-CD-029).
 *
 * Renders every designation line equally (ADR-CD-008) — fund, missionary,
 * memo, and amount — with explicit "Updated receipt" framing so donors can
 * tell this replaces the receipt originally sent.
 */
export function buildUpdatedReceiptHtml(content: ReceiptSnapshotContentV1): {
  html: string;
  title: string;
} {
  const title = `Updated receipt for ${content.donorName}`;
  const formattedAmount = formatMoney(
    content.effective.amountCents,
    content.currencyCode,
  );
  const formattedGiftDate = formatGiftDate(content.giftDate);

  const designationRows = content.designationLines
    .map((line) => {
      const cells = [
        escapeHtml(line.fundName),
        escapeHtml(line.missionaryName ?? "—"),
        escapeHtml(line.memo ?? "—"),
        escapeHtml(formatMoney(line.amountCents, content.currencyCode)),
      ];
      return `<tr><td>${cells[0]}</td><td>${cells[1]}</td><td>${cells[2]}</td><td class="amount">${cells[3]}</td></tr>`;
    })
    .join("\n        ");

  const affectedFieldsNote =
    content.affectedFields.length > 0
      ? `<p class="note">This update reflects a correction to: ${escapeHtml(
          content.affectedFields.join(", "),
        )}.</p>`
      : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: letter; margin: 1in; }
      body { font-family: Helvetica, Arial, sans-serif; color: #111111; font-size: 12pt; }
      h1 { font-size: 20pt; margin: 0 0 4pt; }
      .subtitle { color: #444444; margin: 0 0 16pt; }
      dl { margin: 0 0 16pt; }
      dt { font-weight: bold; }
      dd { margin: 0 0 8pt; }
      table { width: 100%; border-collapse: collapse; margin: 0 0 16pt; }
      th, td { border: 1pt solid #cccccc; padding: 6pt 8pt; text-align: left; vertical-align: top; }
      th { background: #f3f3f3; }
      td.amount, th.amount { text-align: right; }
      .note { color: #444444; }
      .meta { color: #666666; font-size: 9pt; }
    </style>
  </head>
  <body>
    <h1>Updated receipt</h1>
    <p class="subtitle">This receipt replaces the receipt previously sent for this gift.</p>
    <dl>
      <dt>Donor</dt>
      <dd>${escapeHtml(content.donorName)}</dd>
      <dt>Gift date</dt>
      <dd>${escapeHtml(formattedGiftDate)}</dd>
      <dt>Gift amount</dt>
      <dd>${escapeHtml(formattedAmount)}</dd>
    </dl>
    <table>
      <thead>
        <tr><th>Fund</th><th>Missionary</th><th>Memo</th><th class="amount">Amount</th></tr>
      </thead>
      <tbody>
        ${designationRows}
      </tbody>
    </table>
    ${affectedFieldsNote}
    <p class="meta">Donation ID: ${escapeHtml(content.donationId)} · Generated at: ${escapeHtml(content.generatedAt)}</p>
  </body>
</html>`;

  return { html, title };
}

/**
 * Server-side gate for downloading updated receipt PDFs. The tenant receipt
 * delivery policy names the capability (default
 * `contributions.manage_receipts`); the viewer's resolved capabilities must
 * include it (ADR-CD-024).
 */
export function assertReceiptSnapshotPdfCapability(input: {
  policy: TenantReceiptDeliveryPolicy;
  viewerCapabilities: string[];
}): void {
  if (!input.viewerCapabilities.includes(input.policy.pdfCapability)) {
    throw new ApiHttpError(
      403,
      `Forbidden: requires ${input.policy.pdfCapability}`,
    );
  }
}

export interface RenderedContributionReceiptSnapshotPdf {
  pdf: Uint8Array;
  contentType: "application/pdf";
  filename: string;
  /**
   * True when the vendor rendered in test mode (watermarked). Only reachable
   * with an injected client — the shared runtime is asserted production.
   */
  testRender: boolean;
  snapshot: {
    donationId: string;
    kind: string;
  };
}

/**
 * DocRaptor test mode watermarks documents and is never acceptable for a
 * donor-facing compliance receipt. Exported for direct unit coverage.
 */
export function assertProductionReceiptRenderMode(
  mode: string | null | undefined,
): void {
  if (mode !== "production") {
    throw new ApiHttpError(
      503,
      "Updated receipt PDF rendering requires DocRaptor production mode (set PDF_STUDIO_DOCRAPTOR_MODE=production).",
    );
  }
}

interface ReceiptPdfDocRaptorRuntime {
  configured: boolean;
  mode?: string | null;
}

/**
 * Renders the durable updated-receipt PDF for a stored snapshot (#263).
 *
 * Rendering is idempotent per snapshot: the DocRaptor idempotency metadata is
 * keyed by tenant + snapshot id so repeated downloads correlate to the same
 * app-layer render identity.
 */
export async function renderContributionReceiptSnapshotPdf(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  snapshotId: string;
  /** Injectable for tests; defaults to the shared PDF Studio DocRaptor client. */
  docraptorClient?: DocRaptorClient;
  /** Injectable for tests; defaults to the shared PDF Studio DocRaptor runtime. */
  docraptorRuntime?: ReceiptPdfDocRaptorRuntime;
  /** Injectable for tests; defaults to the shared PDF Studio DocRaptor client factory. */
  getDocRaptorClient?: () => Promise<DocRaptorClient | null | undefined>;
}): Promise<RenderedContributionReceiptSnapshotPdf> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_receipt_snapshots")
    .select("id, donation_id, kind, content")
    .eq("tenant_id", input.tenantId)
    .eq("id", input.snapshotId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!isRecord(data)) {
    throw new ApiHttpError(404, "Receipt snapshot not found.");
  }

  const content = parseReceiptSnapshotContent(data.content);
  if (!content) {
    throw new ApiHttpError(
      409,
      "This receipt snapshot predates PDF rendering and cannot be rendered. Re-run the correction's receipt action to generate a renderable snapshot.",
    );
  }

  // Intentionally NOT gated on `productionRenderingEnabled`: that rollout flag
  // controls the PDF Studio native template *builder*, not operational receipt
  // rendering. The vendor MODE is not inherited from the builder either:
  // DocRaptor test mode watermarks documents, so the shared runtime must be
  // explicitly in production mode before this compliance path renders.
  let docraptorClient = input.docraptorClient ?? null;
  if (!docraptorClient) {
    const runtime =
      input.docraptorRuntime ?? resolvePdfStudioDocRaptorRuntime();
    if (!runtime.configured) {
      throw new ApiHttpError(
        503,
        "PDF rendering is not configured for this environment.",
      );
    }
    assertProductionReceiptRenderMode(runtime.mode ?? null);
    const getClient = input.getDocRaptorClient ?? getPdfStudioDocRaptorClient;
    docraptorClient = (await getClient()) ?? null;
  }
  if (!docraptorClient) {
    throw new ApiHttpError(
      503,
      "PDF rendering is not configured for this environment.",
    );
  }

  const { html, title } = buildUpdatedReceiptHtml(content);
  const idempotencyKey = `contribution-receipt-snapshot/${input.tenantId}/${input.snapshotId}`;
  const result = await docraptorClient.renderSync({
    html,
    media: "print",
    name: title,
    tag: idempotencyKey,
    idempotency: {
      key: idempotencyKey,
      scope: "contribution-receipt-snapshot",
      recordId: input.snapshotId,
    },
  });

  return {
    pdf: result.pdf,
    contentType: "application/pdf",
    filename: `updated-receipt-${input.snapshotId}.pdf`,
    testRender: result.request?.test === true,
    snapshot: {
      donationId: asString(data.donation_id) ?? content.donationId,
      kind: asString(data.kind) ?? "pdf",
    },
  };
}
