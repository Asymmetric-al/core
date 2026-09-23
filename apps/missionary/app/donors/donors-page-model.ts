import type { Address, Donor } from "./donor-types";

export type DonorsPageFilterState = {
  searchTerm: string;
  statusFilter: string;
  tagFilter: string[];
  pledgeFilter: string;
};

export type DonorsPageSummary = {
  activeCount: number;
  activePledgeCount: number;
  atRiskCount: number;
  lapsedCount: number;
  monthlyPledgeTotal: number;
  totalGiven: number;
};

export type DonorsStatFilterType =
  | "atRisk"
  | "needsAttention"
  | "activePledge"
  | "lapsed"
  | "new";

export type DonorsStatFilterState = DonorsPageFilterState & {
  selectedDonorId: null;
};

export function createDefaultDonorsFilters(): DonorsPageFilterState {
  return {
    searchTerm: "",
    statusFilter: "All",
    tagFilter: [],
    pledgeFilter: "All",
  };
}

export function hasDonorsActiveFilters(filters: DonorsPageFilterState) {
  return (
    filters.statusFilter !== "All" ||
    filters.tagFilter.length > 0 ||
    filters.pledgeFilter !== "All" ||
    filters.searchTerm.trim().length > 0
  );
}

export function applyDonorsStatFilter(
  filterType: DonorsStatFilterType,
): DonorsStatFilterState {
  const nextFilters = createDefaultDonorsFilters();

  switch (filterType) {
    case "atRisk":
      return {
        ...nextFilters,
        statusFilter: "At Risk",
        selectedDonorId: null,
      };
    case "activePledge":
      return {
        ...nextFilters,
        pledgeFilter: "Active",
        selectedDonorId: null,
      };
    case "lapsed":
      return {
        ...nextFilters,
        statusFilter: "Lapsed",
        selectedDonorId: null,
      };
    case "new":
      return {
        ...nextFilters,
        statusFilter: "New",
        selectedDonorId: null,
      };
    case "needsAttention":
      return {
        ...nextFilters,
        statusFilter: "Needs Attention",
        selectedDonorId: null,
      };
    default: {
      const exhaustive: never = filterType;
      throw new Error(`Unhandled donors stat filter: ${String(exhaustive)}`);
    }
  }
}

export function toggleTagSelection(tags: string[], tagId: string): string[] {
  if (tags.includes(tagId)) {
    return tags.filter((tag) => tag !== tagId);
  }

  return [...tags, tagId];
}

export function removeTagSelection(tags: string[], tagId: string): string[] {
  return tags.filter((tag) => tag !== tagId);
}

export function createTagEditorDraft(committedTags?: string[]): string[] {
  return [...(committedTags ?? [])];
}

export const ANONYMOUS_DONOR_LABEL = "Anonymous donor";

function anonymousDonorInitials(label: string) {
  return (
    label
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

export function toPartnerSafeDonor(donor: Donor): Donor {
  if (!donor.is_anonymous) {
    return donor;
  }

  return {
    ...donor,
    name: ANONYMOUS_DONOR_LABEL,
    initials: anonymousDonorInitials(ANONYMOUS_DONOR_LABEL),
    email: "",
    phone: "",
    mobile: undefined,
    work_phone: undefined,
    avatar_url: undefined,
    location: "",
    address: {},
    work_address: undefined,
    website: undefined,
    organization: undefined,
    title: undefined,
    birthday: undefined,
    anniversary: undefined,
    spouse: undefined,
    notes: undefined,
    tags: [],
    activities: [],
    is_anonymous: true,
  };
}

export function getDonorCallHref(
  donor: Pick<Donor, "phone" | "mobile" | "is_anonymous">,
): string | null {
  if (donor.is_anonymous) {
    return null;
  }

  const number = donor.phone?.trim() || donor.mobile?.trim();
  if (!number) {
    return null;
  }

  return `tel:${number}`;
}

export function getDonorEmailHref(
  email: string | null | undefined,
  isAnonymous = false,
): string | null {
  if (isAnonymous) {
    return null;
  }

  const value = email?.trim();
  if (!value) {
    return null;
  }

  return `mailto:${value}`;
}

export function createDonorsPageSummary(donors: Donor[]): DonorsPageSummary {
  return donors.reduce<DonorsPageSummary>(
    (summary, donor) => {
      if (donor.status === "Active") {
        summary.activeCount += 1;
      }

      if (donor.status === "At Risk") {
        summary.atRiskCount += 1;
      }

      if (donor.status === "Lapsed") {
        summary.lapsedCount += 1;
      }

      if (donor.has_active_pledge) {
        summary.activePledgeCount += 1;
      }

      summary.totalGiven += donor.total_given || 0;
      summary.monthlyPledgeTotal += getMonthlyPledgeAmount(donor);

      return summary;
    },
    {
      activeCount: 0,
      activePledgeCount: 0,
      atRiskCount: 0,
      lapsedCount: 0,
      monthlyPledgeTotal: 0,
      totalGiven: 0,
    },
  );
}

function getMonthlyPledgeAmount(donor: Donor): number {
  const activeRecurring = donor.recurring_donations.find(
    (pledge) => pledge.status === "active",
  );

  if (!activeRecurring) {
    return 0;
  }

  if (activeRecurring.frequency === "Monthly") {
    return activeRecurring.amount;
  }

  if (activeRecurring.frequency === "Quarterly") {
    return activeRecurring.amount / 3;
  }

  return activeRecurring.amount / 12;
}

export function formatDonorAddress(address: Address): string[] {
  const parts: string[] = [];

  if (address.street) {
    parts.push(address.street);
  }

  if (address.street2) {
    parts.push(address.street2);
  }

  const cityLine = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ");

  if (cityLine) {
    parts.push(cityLine);
  }

  if (
    address.country &&
    address.country !== "United States" &&
    address.country !== "USA"
  ) {
    parts.push(address.country);
  }

  return parts;
}

export function getGivingHistoryRows(donor: Donor | null) {
  return (donor?.activities ?? []).filter(
    (activity) => activity.type === "gift",
  );
}
