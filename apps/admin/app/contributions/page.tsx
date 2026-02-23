import {
  getTenantContributions,
  type TenantContributionItem,
} from "@asym/api/reads/tenant-contributions";
import { getAuthContext } from "@asym/auth/context";

import { ContributionsClient } from "./contributions-client";

import type {
  Contribution,
  ContributionSource,
  ContributionStatus,
  ContributionType,
  PaymentMethod,
} from "./types";

import { hasAdminReadAccess } from "@/lib/admin-access";

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

function mapPaymentMethod(method: string | null | undefined): PaymentMethod {
  const normalized = (method || "").toLowerCase().replace(/[\s_-]/g, "");
  if (normalized === "card" || normalized === "creditcard") {
    return "Credit Card";
  }
  if (
    normalized === "banktransfer" ||
    normalized === "ach" ||
    normalized === "wire"
  ) {
    return "Bank Transfer";
  }
  if (normalized === "check" || normalized === "cheque") {
    return "Check";
  }
  if (normalized === "cash") {
    return "Cash";
  }
  if (normalized === "paypal") {
    return "PayPal";
  }
  return "Other";
}

function mapSource(source: string | null | undefined): ContributionSource {
  const normalized = (source || "").toLowerCase().replace(/_/g, "-");
  if (normalized.includes("import")) {
    return "Import";
  }
  if (normalized.includes("mobile")) {
    return "Mobile";
  }
  if (normalized.includes("phone")) {
    return "Phone";
  }
  if (normalized.includes("mail")) {
    return "Mail";
  }
  if (normalized.includes("in-person") || normalized.includes("inperson")) {
    return "In-person";
  }
  return "Online";
}

function toDateOnly(value: string): string {
  return value.split("T")[0] || value;
}

function mapTenantContributionItemToContribution(
  item: TenantContributionItem,
): Contribution {
  const status = mapStatus(item.status);

  return {
    id: item.id,
    donor: {
      id: item.donorId,
      name: item.donorName,
      email: item.donorEmail,
      avatar: item.donorAvatarUrl || undefined,
    },
    amount: item.amount,
    date: toDateOnly(item.createdAt),
    status,
    type: mapContributionType(item.donationType),
    paymentMethod: mapPaymentMethod(item.paymentMethod),
    source: mapSource(item.source),
    fundCode: item.fundCode,
    fundName: item.fundName,
    missionaryId: item.missionaryId || undefined,
    missionaryName: item.missionaryName || undefined,
    transactionId: item.transactionId,
    notes: item.notes || undefined,
    isAnonymous: false,
    receiptSent: status === "Succeeded",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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

  if (!hasAdminReadAccess(auth.role)) {
    return (
      <ContributionsClient
        initialData={[]}
        errorMessage="You do not have permission to view tenant contributions."
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const donorId = readSingleSearchValue(resolvedSearchParams.donorId);
  const filters = donorId ? { donorId } : undefined;

  const result = await getTenantContributions(
    auth.tenantId,
    { limit: 50, offset: 0 },
    filters,
  )
    .then((data) => ({ data, errorMessage: null as string | null }))
    .catch((error: unknown) => ({
      data: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Failed to load tenant contributions.",
    }));

  if (result.errorMessage || !result.data) {
    return (
      <ContributionsClient
        initialData={[]}
        errorMessage={result.errorMessage || "Failed to load contributions."}
      />
    );
  }

  const initialData = result.data.data.map(
    mapTenantContributionItemToContribution,
  );
  return <ContributionsClient initialData={initialData} />;
}
