import {
  getDonorHistory,
  resolveDonorId,
  type DonorHistoryItem,
} from "@asym/api/reads/donor-history";
import { getAuthContext } from "@asym/auth/context";

import { ContributionsClient } from "./contributions-client";

import type {
  Contribution,
  ContributionStatus,
  ContributionType,
} from "./types";

type ContributionsPageProps = {
  searchParams: Promise<{ donorId?: string | string[] }>;
};

function readSingleSearchValue(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
}

function mapStatus(status: string): ContributionStatus {
  const normalized = status.toLowerCase();
  if (
    normalized === "succeeded" ||
    normalized === "success" ||
    normalized === "completed"
  ) {
    return "Succeeded";
  }
  if (normalized === "failed") {
    return "Failed";
  }
  if (normalized === "refunded") {
    return "Refunded";
  }
  if (normalized === "disputed") {
    return "Disputed";
  }
  return "Pending";
}

function mapContributionType(donationType: string): ContributionType {
  const normalized = donationType.toLowerCase();
  if (normalized.includes("recurring")) {
    return "Recurring";
  }
  if (normalized.includes("pledge")) {
    return "Pledge";
  }
  if (normalized.includes("in-kind") || normalized.includes("in_kind")) {
    return "In-kind";
  }
  return "One-time";
}

function mapDonorHistoryItemToContribution(
  item: DonorHistoryItem,
  donorId: string,
): Contribution {
  const status = mapStatus(item.status);
  return {
    id: item.id,
    donor: {
      id: donorId,
      name: "Donor",
      email: "",
    },
    amount: item.amount,
    date: item.createdAt.split("T")[0] || item.createdAt,
    status,
    type: mapContributionType(item.donationType),
    paymentMethod: "Other",
    source: "Online",
    fundCode: "N/A",
    fundName: "General Fund",
    missionaryId: item.missionaryId || undefined,
    transactionId: item.id,
    isAnonymous: false,
    receiptSent: status === "Succeeded",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  };
}

export default async function ContributionsPage({
  searchParams,
}: ContributionsPageProps) {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.tenantId) {
    return <ContributionsClient initialData={[]} />;
  }

  const resolvedSearchParams = await searchParams;
  const donorId = await resolveDonorId(
    readSingleSearchValue(resolvedSearchParams.donorId),
    auth.tenantId,
    auth.profileId,
  );

  if (!donorId) {
    return <ContributionsClient initialData={[]} />;
  }

  const donorHistory = await getDonorHistory(donorId, auth.tenantId, {
    limit: 20,
    offset: 0,
  }).catch(() => null);

  const initialData = donorHistory
    ? donorHistory.data.map((item) =>
        mapDonorHistoryItemToContribution(item, donorId),
      )
    : [];

  return <ContributionsClient initialData={initialData} />;
}
