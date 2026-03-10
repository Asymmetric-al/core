import {
  getDonorHistory,
  resolveDonorId,
  type DonorHistoryItem,
} from "@asym/api/reads/donor-history";
import { getAuthContext } from "@asym/auth/context";
import * as React from "react";

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
    return (
      <ContributionsClient
        initialData={[]}
        errorMessage="Sign in to view contributions."
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const donorId = await resolveDonorId(
    readSingleSearchValue(resolvedSearchParams.donorId),
    auth.tenantId,
    auth.profileId,
  );

  if (!donorId) {
    return (
      <ContributionsClient
        initialData={[]}
        errorMessage="You do not have permission to view these contributions."
      />
    );
  }

  const donorHistoryResult = await getDonorHistory(donorId, auth.tenantId, {
    limit: 20,
    offset: 0,
  })
    .then((data) => ({ data, errorMessage: null as string | null }))
    .catch((error: unknown) => ({
      data: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Failed to load contributions.",
    }));

  if (donorHistoryResult.errorMessage || !donorHistoryResult.data) {
    return (
      <ContributionsClient
        initialData={[]}
        errorMessage={
          donorHistoryResult.errorMessage || "Failed to load contributions."
        }
      />
    );
  }

  const initialData = donorHistoryResult.data.data.map((item) =>
    mapDonorHistoryItemToContribution(item, donorId),
  );

  return <ContributionsClient initialData={initialData} />;
}
