import {
  normalizeCurrency,
  normalizeEmail,
  normalizePhone,
  normalizeWhitespace,
  splitFullName,
} from "./normalize";

import type { TwentyRecordDraft } from "./types";
import type { Donor, DonorPledge } from "@asym/database/types";

function requireTenantId(
  value: string | null | undefined,
  source: string,
): string {
  if (!value) {
    throw new Error(`Cannot map ${source} without tenant_id.`);
  }

  return value;
}

function compactRecord(
  value: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, childValue]) => {
      if (childValue === null || childValue === undefined) {
        return false;
      }

      if (typeof childValue === "string") {
        return childValue.length > 0;
      }

      return true;
    }),
  );
}

export function mapDonorToTwentyPersonDraft(donor: Donor): TwentyRecordDraft {
  const tenantId = requireTenantId(donor.tenant_id, "donor");
  const name = splitFullName(donor.name);
  const primaryPhone =
    normalizePhone(donor.phone) ??
    normalizePhone(donor.mobile) ??
    normalizePhone(donor.work_phone);

  return {
    objectName: "people",
    source: {
      tenantId,
      entityType: "donor_profile",
      entityId: donor.id,
    },
    relatedLinks: [
      ...(donor.profile_id
        ? [
            {
              entityType: "asym_profile" as const,
              entityId: donor.profile_id,
              relationship: "profile_for_donor",
            },
          ]
        : []),
      ...(donor.stripe_customer_id
        ? [
            {
              entityType: "stripe_customer" as const,
              entityId: donor.stripe_customer_id,
              relationship: "billing_customer_for_donor",
            },
          ]
        : []),
    ],
    fields: compactRecord({
      asymTenantId: tenantId,
      asymPrimaryEntityType: "donor_profile",
      asymPrimaryEntityId: donor.id,
      name,
      primaryEmail: normalizeEmail(donor.email),
      primaryPhone,
      preferredContactMethod: normalizeWhitespace(donor.preferred_contact),
      organizationName: normalizeWhitespace(donor.organization),
      title: normalizeWhitespace(donor.title),
      location: normalizeWhitespace(donor.location),
      donorStatus: normalizeWhitespace(donor.status),
      donorType: normalizeWhitespace(donor.type),
      doNotContact: donor.do_not_contact,
      doNotEmail: donor.do_not_email,
      preferredLanguage: normalizeWhitespace(donor.preferred_language),
      defaultUpdateFrequency: normalizeWhitespace(
        donor.default_update_frequency,
      ),
      relationshipNotes: normalizeWhitespace(donor.notes),
    }),
  };
}

export function mapPledgeToTwentyRelationshipCommitmentDraft(
  pledge: DonorPledge,
): TwentyRecordDraft {
  const tenantId = requireTenantId(pledge.tenant_id, "pledge");

  return {
    objectName: "relationshipCommitments",
    source: {
      tenantId,
      entityType: "pledge_or_relationship_commitment",
      entityId: pledge.id,
    },
    relatedLinks: [
      ...(pledge.donor_id
        ? [
            {
              entityType: "donor_profile" as const,
              entityId: pledge.donor_id,
              relationship: "commitment_donor",
            },
          ]
        : []),
      ...(pledge.missionary_id
        ? [
            {
              entityType: "missionary_profile" as const,
              entityId: pledge.missionary_id,
              relationship: "commitment_missionary",
            },
          ]
        : []),
      ...(pledge.fund_id
        ? [
            {
              entityType: "fund_or_project" as const,
              entityId: pledge.fund_id,
              relationship: "commitment_designation",
            },
          ]
        : []),
    ],
    fields: compactRecord({
      asymTenantId: tenantId,
      asymPledgeId: pledge.id,
      commitmentAmountCents: pledge.amount,
      currency: normalizeCurrency(pledge.currency),
      frequency: normalizeWhitespace(pledge.frequency),
      commitmentStatus: normalizeWhitespace(pledge.status),
      startDate: pledge.start_date,
      endDate: pledge.end_date,
      nextExpectedDate: pledge.next_payment_date,
    }),
  };
}
