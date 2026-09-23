import { parseDisplayDate } from "./donors-page-dates";

import type { Donor } from "./donor-types";

export type SortOption = "name" | "last_gift" | "total_given" | "joined_date";

export interface DonorListFilters {
  searchTerm: string;
  statusFilter: string;
  tagFilter: string[];
  pledgeFilter: string;
  sortBy: SortOption;
  sortAsc: boolean;
}

function matchesStatus(donor: Donor, statusFilter: string): boolean {
  if (statusFilter === "All") {
    return true;
  }

  if (statusFilter === "Needs Attention") {
    return donor.status === "At Risk" || donor.status === "Lapsed";
  }

  return donor.status === statusFilter;
}

function includesSearchTerm(
  value: string | null | undefined,
  searchTerm: string,
): boolean {
  return (value || "").toLowerCase().includes(searchTerm);
}

function matchesSearchTerm(
  donor: Donor,
  normalizedSearchTerm: string,
): boolean {
  return (
    includesSearchTerm(donor.name, normalizedSearchTerm) ||
    includesSearchTerm(donor.email, normalizedSearchTerm) ||
    includesSearchTerm(donor.location, normalizedSearchTerm) ||
    includesSearchTerm(donor.organization, normalizedSearchTerm)
  );
}

function matchesTags(donor: Donor, tagFilter: string[]): boolean {
  return (
    tagFilter.length === 0 || tagFilter.some((tag) => donor.tags.includes(tag))
  );
}

function matchesPledge(donor: Donor, pledgeFilter: string): boolean {
  if (pledgeFilter === "All") {
    return true;
  }

  if (pledgeFilter === "Active") {
    return donor.has_active_pledge;
  }

  return pledgeFilter === "Inactive" && !donor.has_active_pledge;
}

function compareDonors(a: Donor, b: Donor, sortBy: SortOption): number {
  switch (sortBy) {
    case "name":
      return (a.name || "").localeCompare(b.name || "");
    case "last_gift": {
      const dateA = a.last_gift_date
        ? parseDisplayDate(a.last_gift_date).getTime()
        : 0;
      const dateB = b.last_gift_date
        ? parseDisplayDate(b.last_gift_date).getTime()
        : 0;
      return dateA - dateB;
    }
    case "total_given":
      return (a.total_given || 0) - (b.total_given || 0);
    case "joined_date": {
      const joinA = a.joined_date
        ? parseDisplayDate(a.joined_date).getTime()
        : 0;
      const joinB = b.joined_date
        ? parseDisplayDate(b.joined_date).getTime()
        : 0;
      return joinA - joinB;
    }
    default: {
      const exhaustive: never = sortBy;
      throw new Error(`Unhandled donor sort: ${String(exhaustive)}`);
    }
  }
}

export function filterAndSortDonors(
  donors: Donor[],
  filters: DonorListFilters,
): Donor[] {
  const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase();

  return donors
    .filter((donor) => {
      const matchesSearch = matchesSearchTerm(donor, normalizedSearchTerm);
      const matchesDonorStatus = matchesStatus(donor, filters.statusFilter);

      return (
        matchesSearch &&
        matchesDonorStatus &&
        matchesTags(donor, filters.tagFilter) &&
        matchesPledge(donor, filters.pledgeFilter)
      );
    })
    .sort((a, b) => {
      const comparison = compareDonors(a, b, filters.sortBy);
      return filters.sortAsc ? comparison : -comparison;
    });
}
