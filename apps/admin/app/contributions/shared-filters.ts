import {
  matchesSharedContributionFilter,
  SHARED_CONTRIBUTION_FILTERS,
  SHARED_CORRECTION_STATE_LABELS,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_PAYMENT_STATUS_LABELS,
  SHARED_REFUND_STATE_LABELS,
  type SharedContributionFilter,
  type SharedContributionFilterDefinition,
  type SharedContributionFilterId,
} from "@asym/api/admin/contribution-shared";

import type { Contribution } from "./types";
import type { DataTableFilterOption } from "@asym/ui/components/shadcn/data-table";

/**
 * Hub adoption of the shared CRM/Hub contribution filters (issue #274,
 * ADR-CD-032). Every chip built here evaluates through
 * `matchesSharedContributionFilter`, so a shared filter id means exactly the
 * same thing on the Contributions Hub as it does in CRM gift history.
 *
 * Two shared filter ids intentionally do not become chips of their own:
 *
 * - `payment_status` is adopted through the Hub's existing Status chip via
 *   {@link matchesHubPaymentStatusSelection} so the Hub can keep its
 *   grid-status extensions (e.g. "processing") next to the shared vocabulary.
 * - `designation_issue` is deferred: `ContributionGridRow` does not carry
 *   designation-set issues, so the chip could never match a row. A filter
 *   that cannot match must not render.
 */

type SharedRecurringLinkState = Contribution["shared"]["recurringLinkState"];

/**
 * Hub display labels for the shared recurring link state (ADR-CD-007). No
 * shared label record exists for this state yet; these are labels only —
 * matching still goes through the shared evaluator.
 */
export const HUB_RECURRING_LINK_STATE_LABELS: Record<
  SharedRecurringLinkState,
  string
> = {
  agreement_linked: "Agreement linked",
  provider_only: "Provider only",
  none: "Not recurring",
};

const HUB_SHARED_CHIP_EXCLUDED_IDS: ReadonlySet<SharedContributionFilterId> =
  new Set(["payment_status", "designation_issue"]);

function isKeyOf<TRecord extends Record<string, string>>(
  record: TRecord,
  value: string,
): value is Extract<keyof TRecord, string> {
  return Object.hasOwn(record, value);
}

function enumValueLabels(
  filterId: SharedContributionFilterId,
): Record<string, string> {
  switch (filterId) {
    case "approval_state":
      return SHARED_CORRECTION_STATE_LABELS;
    case "refund_state":
      return SHARED_REFUND_STATE_LABELS;
    case "crm_post_state":
      return SHARED_CRM_POST_STATUS_LABELS;
    case "recurring_link":
      return HUB_RECURRING_LINK_STATE_LABELS;
    default:
      // payment_status renders through the Status chip; flag filters and the
      // deferred designation_issue have no enum values.
      return {};
  }
}

function buildChipOptions(
  definition: SharedContributionFilterDefinition,
): DataTableFilterOption[] {
  if (definition.kind === "flag") {
    return [{ label: definition.label, value: definition.id }];
  }
  return Object.entries(enumValueLabels(definition.id)).map(
    ([value, label]) => ({ label, value }),
  );
}

export interface HubSharedFilterChip {
  /** Shared filter id; doubles as the hidden filter-only column id. */
  id: SharedContributionFilterId;
  label: string;
  options: DataTableFilterOption[];
}

/** Chips the Hub renders for the shared filters, in registry order. */
export const hubSharedContributionFilterChips: HubSharedFilterChip[] =
  SHARED_CONTRIBUTION_FILTERS.filter(
    (definition) => !HUB_SHARED_CHIP_EXCLUDED_IDS.has(definition.id),
  ).map((definition) => ({
    id: definition.id,
    label: definition.label,
    options: buildChipOptions(definition),
  }));

/**
 * The shared filter chips evaluate through hidden, filter-only table columns.
 * Spread this into the table's initial column visibility so those columns
 * never render as data columns.
 */
export const hubSharedFilterColumnVisibility: Record<string, boolean> =
  Object.fromEntries(
    hubSharedContributionFilterChips.map((chip) => [chip.id, false]),
  );

/**
 * Faceted-count accessor for a shared filter column. Values mirror the chip
 * option values (and the shared evaluator's null handling) so the counts in
 * the chip popover agree with what selecting the option would match.
 */
export function getHubSharedFilterFacetValue(
  contribution: Contribution,
  filterId: SharedContributionFilterId,
): string | null {
  const shared = contribution.shared;
  switch (filterId) {
    case "receipt_affected":
    case "pending_correction":
      return matchesSharedContributionFilter({ shared }, { id: filterId })
        ? filterId
        : null;
    case "approval_state":
      return shared.correctionState;
    case "refund_state":
      return shared.refundState;
    case "crm_post_state":
      // Mirrors the shared evaluator: null means not_required on both surfaces.
      return shared.crmPostStatus ?? "not_required";
    case "recurring_link":
      return shared.recurringLinkState;
    case "payment_status":
      return shared.paymentStatus;
    case "designation_issue":
      return null;
  }
}

function toSelectedValues(filterValue: unknown): string[] {
  if (Array.isArray(filterValue)) {
    return filterValue.filter(
      (value): value is string => typeof value === "string",
    );
  }
  return typeof filterValue === "string" ? [filterValue] : [];
}

function toSharedContributionFilter(
  filterId: SharedContributionFilterId,
  value: string,
): SharedContributionFilter | null {
  switch (filterId) {
    case "receipt_affected":
      return { id: "receipt_affected" };
    case "pending_correction":
      return { id: "pending_correction" };
    case "approval_state":
      return isKeyOf(SHARED_CORRECTION_STATE_LABELS, value)
        ? { id: "approval_state", value }
        : null;
    case "refund_state":
      return isKeyOf(SHARED_REFUND_STATE_LABELS, value)
        ? { id: "refund_state", value }
        : null;
    case "crm_post_state":
      return isKeyOf(SHARED_CRM_POST_STATUS_LABELS, value)
        ? { id: "crm_post_state", value }
        : null;
    case "recurring_link":
      return isKeyOf(HUB_RECURRING_LINK_STATE_LABELS, value)
        ? { id: "recurring_link", value }
        : null;
    case "payment_status":
      return isKeyOf(SHARED_PAYMENT_STATUS_LABELS, value)
        ? { id: "payment_status", value }
        : null;
    case "designation_issue":
      // Deferred on the Hub: grid rows do not carry designation issues yet.
      return null;
  }
}

/**
 * Evaluates one shared-filter chip selection against a Hub row. Values within
 * a chip OR together (a gift has exactly one state per filter); separate chips
 * AND together through stacked TanStack column filters, matching how
 * `filterSharedContributions` stacks filters on either surface.
 */
export function matchesHubSharedFilterSelection(
  contribution: Contribution,
  filterId: SharedContributionFilterId,
  filterValue: unknown,
): boolean {
  const selectedValues = toSelectedValues(filterValue);
  if (selectedValues.length === 0) {
    return true;
  }
  return selectedValues.some((value) => {
    const filter = toSharedContributionFilter(filterId, value);
    if (!filter) {
      return false;
    }
    return matchesSharedContributionFilter(
      { shared: contribution.shared },
      filter,
    );
  });
}

/**
 * Status-chip evaluator (issue #274 payment-status meaning split).
 *
 * Selections in the shared payment vocabulary (completed / pending / failed /
 * refunded) evaluate through the shared evaluator against
 * `row.shared.paymentStatus`, so a fully refunded gift whose
 * `donations.status` stayed "completed" matches "Refunded" exactly like it
 * does in CRM. Hub-only grid statuses (e.g. "processing") stay extension
 * selections matched against the grid status, as before.
 */
export function matchesHubPaymentStatusSelection(
  contribution: Contribution,
  filterValue: unknown,
): boolean {
  const selectedValues = toSelectedValues(filterValue);
  if (selectedValues.length === 0) {
    return true;
  }
  return selectedValues.some((value) => {
    if (isKeyOf(SHARED_PAYMENT_STATUS_LABELS, value)) {
      return matchesSharedContributionFilter(
        { shared: contribution.shared },
        { id: "payment_status", value },
      );
    }
    return contribution.status === value;
  });
}

/**
 * Faceted-count values for the Status chip. The Status column keeps its grid
 * status accessor for cell rendering and sorting, but its filter matches
 * through {@link matchesHubPaymentStatusSelection}: shared-vocabulary options
 * match `shared.paymentStatus`, and Hub-only grid statuses (e.g. "processing")
 * match the grid status. This helper mirrors that exactly so the chip popover
 * counts agree with what selecting an option returns — a row counts under its
 * shared payment status, plus its grid status when that grid status is a
 * Hub-only extension rather than a shared-vocabulary value.
 */
export function getHubPaymentStatusFacetValues(
  contribution: Contribution,
): string[] {
  const values = [contribution.shared.paymentStatus as string];
  if (!isKeyOf(SHARED_PAYMENT_STATUS_LABELS, contribution.status)) {
    values.push(contribution.status);
  }
  return values;
}
