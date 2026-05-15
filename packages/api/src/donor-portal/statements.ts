import { NextResponse, type NextRequest } from "next/server";

import { buildDonorPortalSnapshot } from "./model";
import { runDonorPortalOperation } from "./route-helpers";
import {
  getOwnedStatementDonations,
  resolveDonorPortalContext,
} from "./service";
import { ApiHttpError } from "../shared/http-errors";

const MIN_STATEMENT_YEAR = 2000;
const MAX_STATEMENT_YEAR_OFFSET = 1;

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

function parseStatementYear(value: string): number {
  const year = Number(value);
  const maxYear = new Date().getUTCFullYear() + MAX_STATEMENT_YEAR_OFFSET;
  if (!Number.isInteger(year) || year < MIN_STATEMENT_YEAR || year > maxYear) {
    throw new ApiHttpError(400, "Invalid statement year");
  }
  return year;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year: yearParam } = await params;

  return runDonorPortalOperation(request, async ({ supabaseAdmin, auth }) => {
    const year = parseStatementYear(yearParam);
    const { profile, donor } = await resolveDonorPortalContext(
      supabaseAdmin,
      auth.profileId,
      auth.tenantId,
    );
    const rows = await getOwnedStatementDonations({
      supabaseAdmin,
      donorId: donor.id,
      tenantId: auth.tenantId,
      year,
    });
    const portal = buildDonorPortalSnapshot({
      profile,
      donor,
      donations: rows,
      pledges: [],
      feedPreferences: null,
    });
    const totalCents = portal.donations.reduce(
      (sum, donation) => sum + donation.amountCents,
      0,
    );
    const currency = portal.donations[0]?.currency ?? "USD";
    const giftLines = portal.donations.map((donation) =>
      [
        new Date(donation.date).toLocaleDateString("en-US"),
        donation.id,
        donation.designation.name,
        formatCurrency(donation.amountCents, donation.currency),
      ].join("\t"),
    );

    const text = [
      `${year} Giving Statement`,
      "",
      `Donor: ${portal.profile.displayName}`,
      portal.profile.email ? `Email: ${portal.profile.email}` : null,
      `Total: ${formatCurrency(totalCents, currency)}`,
      `Gift count: ${portal.donations.length}`,
      "",
      "Date\tReceipt ID\tDesignation\tAmount",
      ...giftLines,
      "",
      "This statement includes only settled gifts owned by the signed-in donor account.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    return new NextResponse(`${text}\n`, {
      headers: {
        "content-disposition": `attachment; filename="giving-statement-${year}.txt"`,
        "content-type": "text/plain; charset=utf-8",
      },
    });
  });
}
