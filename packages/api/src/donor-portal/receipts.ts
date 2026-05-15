import { NextResponse, type NextRequest } from "next/server";

import { buildDonorPortalSnapshot } from "./model";
import { runDonorPortalOperation } from "./route-helpers";
import { getOwnedDonation, resolveDonorPortalContext } from "./service";
import { ApiHttpError } from "../shared/http-errors";

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

function receiptText(input: {
  donorName: string;
  donorEmail: string | null;
  donation: NonNullable<
    ReturnType<typeof buildDonorPortalSnapshot>["donations"][number]
  >;
}) {
  const lines = [
    "Donation Receipt",
    "",
    `Receipt ID: ${input.donation.id}`,
    `Date: ${new Date(input.donation.date).toLocaleDateString("en-US")}`,
    `Donor: ${input.donorName}`,
    input.donorEmail ? `Email: ${input.donorEmail}` : null,
    `Designation: ${input.donation.designation.name}`,
    `Amount: ${formatCurrency(input.donation.amountCents, input.donation.currency)}`,
    `Status: ${input.donation.status}`,
    "",
    "This receipt is generated from the donor portal for the signed-in donor account.",
  ].filter((line): line is string => line !== null);

  return `${lines.join("\n")}\n`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ donationId: string }> },
) {
  const { donationId } = await params;

  return runDonorPortalOperation(request, async ({ supabaseAdmin, auth }) => {
    const { profile, donor } = await resolveDonorPortalContext(
      supabaseAdmin,
      auth.profileId,
      auth.tenantId,
    );
    const row = await getOwnedDonation({
      supabaseAdmin,
      donationId,
      donorId: donor.id,
      tenantId: auth.tenantId,
    });
    const portal = buildDonorPortalSnapshot({
      profile,
      donor,
      donations: [row],
      pledges: [],
      feedPreferences: null,
    });
    const donation = portal.donations[0];
    if (!donation) {
      throw new ApiHttpError(404, "Donation not found");
    }

    return new NextResponse(
      receiptText({
        donorName: portal.profile.displayName,
        donorEmail: portal.profile.email,
        donation,
      }),
      {
        headers: {
          "content-disposition": `attachment; filename="donation-receipt-${donation.id}.txt"`,
          "content-type": "text/plain; charset=utf-8",
        },
      },
    );
  });
}
