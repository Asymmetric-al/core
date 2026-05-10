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

function makeDisplayDate(value: string): Date {
  return new globalThis.Date(value);
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
        ? makeDisplayDate(a.last_gift_date).getTime()
        : 0;
      const dateB = b.last_gift_date
        ? makeDisplayDate(b.last_gift_date).getTime()
        : 0;
      return dateB - dateA;
    }
    case "total_given":
      return (b.total_given || 0) - (a.total_given || 0);
    case "joined_date": {
      const joinA = a.joined_date
        ? makeDisplayDate(a.joined_date).getTime()
        : 0;
      const joinB = b.joined_date
        ? makeDisplayDate(b.joined_date).getTime()
        : 0;
      return joinB - joinA;
    }
  }
}

export function filterAndSortDonors(
  donors: Donor[],
  filters: DonorListFilters,
): Donor[] {
  const normalizedSearchTerm = filters.searchTerm.toLowerCase();

  return donors
    .filter((donor) => {
      const matchesSearch = matchesSearchTerm(donor, normalizedSearchTerm);
      const matchesStatus =
        filters.statusFilter === "All" || donor.status === filters.statusFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTags(donor, filters.tagFilter) &&
        matchesPledge(donor, filters.pledgeFilter)
      );
    })
    .sort((a, b) => {
      const comparison = compareDonors(a, b, filters.sortBy);
      return filters.sortAsc ? -comparison : comparison;
    });
}
