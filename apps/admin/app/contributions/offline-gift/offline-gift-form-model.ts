import {
  resolveOfflineReceiptStatus,
  type ReceiptStatus,
} from "@asym/api/admin/contributions/offline-logic";
import { z } from "zod";

import type { OfflineContributionRequest } from "@asym/api/schemas/contributions-offline";

/**
 * Offline gift entry FORM model (Contributions Hub UI).
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §6 (offline), §9.3 (contract), §11.3 (receipts).
 *
 * Pure, no I/O, no React — the form component is a thin shell over this. Keeps
 * the flat form state and maps it to the server §9.3 discriminated-union
 * contract (`OfflineContributionRequest`), which the route re-validates with the
 * same `offlineContributionSchema` (single source of truth, defense in depth).
 * The receipt-status preview reuses the SAME pure function the server uses
 * (`resolveOfflineReceiptStatus`) so the tile the staff sees matches what lands.
 */

export type OfflineDonorMode = "known" | "unknown_offline";
export type OfflineDesignationType = "missionary" | "fund";
export type OfflineMethod =
  | "check"
  | "cash"
  | "manual_ach"
  | "wire"
  | "stock"
  | "other";

export interface OfflineGiftFormValues {
  donorMode: OfflineDonorMode;
  // Known-donor selection: either pick an existing donor, or create one inline.
  createNewDonor: boolean;
  donorId: string;
  firstName: string;
  lastName: string;
  email: string;
  // Gift facts (shared).
  amount: string;
  receivedDate: string;
  method: OfflineMethod;
  designationType: OfflineDesignationType;
  missionaryId: string;
  fundId: string;
  // Known-only flags.
  anonymousToRecipient: boolean;
  anonymousToPublic: boolean;
  receiptRequested: boolean;
  // Shared optional metadata.
  referenceNumber: string;
  internalNote: string;
}

export const INITIAL_OFFLINE_GIFT_FORM_VALUES: OfflineGiftFormValues = {
  donorMode: "known",
  createNewDonor: true,
  donorId: "",
  firstName: "",
  lastName: "",
  email: "",
  amount: "",
  receivedDate: "",
  method: "check",
  designationType: "fund",
  missionaryId: "",
  fundId: "",
  anonymousToRecipient: false,
  anonymousToPublic: false,
  receiptRequested: true,
  referenceNumber: "",
  internalNote: "",
};

export interface OfflineMethodOption {
  label: string;
  value: OfflineMethod;
}

/** Known gifts may carry payer-identifying instruments (check/wire/stock/ACH). */
export const OFFLINE_METHOD_OPTIONS_KNOWN: readonly OfflineMethodOption[] = [
  { label: "Check", value: "check" },
  { label: "Cash", value: "cash" },
  { label: "Manual ACH", value: "manual_ach" },
  { label: "Wire", value: "wire" },
  { label: "Stock", value: "stock" },
  { label: "Other", value: "other" },
];

/**
 * §6.2 — a truly-unknown gift can only be cash/other; a check/wire/ACH/stock
 * carries payer identity and must be entered as `known`.
 */
export const OFFLINE_METHOD_OPTIONS_UNKNOWN: readonly OfflineMethodOption[] = [
  { label: "Cash", value: "cash" },
  { label: "Other", value: "other" },
];

export interface OfflineReceiptStatusDisplay {
  label: string;
  description: string;
  /** Literal Tailwind palette classes (light + dark) — matches columns.tsx. */
  className: string;
}

/**
 * Receipt-status tile per the WP Contributions Hub spec ("enter offline gifts
 * like checks or stock"). Brand-token neutral palette classes with dark variants.
 */
export const OFFLINE_RECEIPT_STATUS_DISPLAY: Record<
  ReceiptStatus,
  OfflineReceiptStatusDisplay
> = {
  pending: {
    label: "Receipt pending",
    description: "A tax receipt will be issued to the donor.",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
  },
  no_receipt_requested: {
    label: "No receipt requested",
    description: "The donor did not request a receipt for this gift.",
    className:
      "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800",
  },
  not_receiptable: {
    label: "Not receiptable",
    description:
      "Anonymous offline gift — no donor identity to receipt (§11.3).",
    className:
      "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-400 dark:border-zinc-800",
  },
};

function trimmedOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildDesignation(values: OfflineGiftFormValues): {
  missionaryId?: string;
  fundId?: string;
} {
  return values.designationType === "missionary"
    ? { missionaryId: trimmedOrUndefined(values.missionaryId) }
    : { fundId: trimmedOrUndefined(values.fundId) };
}

/** Live receipt-status preview — reuses the exact server rule (§11.3). */
export function previewOfflineReceiptStatus(
  values: OfflineGiftFormValues,
): ReceiptStatus {
  if (values.donorMode === "unknown_offline") {
    return resolveOfflineReceiptStatus({ donorMode: "unknown_offline" });
  }
  return resolveOfflineReceiptStatus({
    donorMode: "known",
    receiptRequested: values.receiptRequested,
  });
}

/**
 * Map the flat form state onto the §9.3 contract. The unknown member never
 * carries donor identity or anonymity/receipt flags (§6.2); the known member
 * carries either an existing donorId or inline donorInput to create/match.
 */
export function toOfflineContributionRequest(
  values: OfflineGiftFormValues,
): OfflineContributionRequest {
  const shared = {
    amount: Number(values.amount),
    currency: "usd" as const,
    receivedDate: values.receivedDate.trim(),
    designation: buildDesignation(values),
    referenceNumber: trimmedOrUndefined(values.referenceNumber),
    internalNote: trimmedOrUndefined(values.internalNote),
  };

  if (values.donorMode === "unknown_offline") {
    return {
      donorMode: "unknown_offline",
      method: values.method === "other" ? "other" : "cash",
      ...shared,
    };
  }

  const donorInput = values.createNewDonor
    ? {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: trimmedOrUndefined(values.email),
      }
    : undefined;

  return {
    donorMode: "known",
    donorId: values.createNewDonor
      ? undefined
      : trimmedOrUndefined(values.donorId),
    donorInput,
    method: values.method,
    anonymousToRecipient: values.anonymousToRecipient,
    anonymousToPublic: values.anonymousToPublic,
    receiptRequested: values.receiptRequested,
    ...shared,
  };
}

const KNOWN_METHODS = OFFLINE_METHOD_OPTIONS_KNOWN.map(
  (option) => option.value,
);
const UNKNOWN_METHODS = OFFLINE_METHOD_OPTIONS_UNKNOWN.map(
  (option) => option.value,
);

/**
 * Form-values schema for inline (onChange) UX validation. This is the
 * field-level guard the operator sees; the server contract
 * (`offlineContributionSchema`) is the authoritative gate on submit.
 */
export const offlineGiftFormSchema = z
  .object({
    donorMode: z.enum(["known", "unknown_offline"]),
    createNewDonor: z.boolean(),
    donorId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    amount: z.string(),
    receivedDate: z.string(),
    method: z.enum(["check", "cash", "manual_ach", "wire", "stock", "other"]),
    designationType: z.enum(["missionary", "fund"]),
    missionaryId: z.string(),
    fundId: z.string(),
    anonymousToRecipient: z.boolean(),
    anonymousToPublic: z.boolean(),
    receiptRequested: z.boolean(),
    referenceNumber: z.string(),
    internalNote: z.string(),
  })
  .superRefine((values, ctx) => {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount must be greater than 0",
      });
    }

    if (values.receivedDate.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["receivedDate"],
        message: "Received date is required",
      });
    }

    const designationId =
      values.designationType === "missionary"
        ? values.missionaryId
        : values.fundId;
    if (designationId.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [
          values.designationType === "missionary" ? "missionaryId" : "fundId",
        ],
        message: "Select a designation for this gift",
      });
    }

    if (values.donorMode === "unknown_offline") {
      if (!UNKNOWN_METHODS.includes(values.method)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["method"],
          message:
            "Unknown offline gifts must be cash or other — a check/wire carries payer identity (enter as known)",
        });
      }
      return;
    }

    if (!KNOWN_METHODS.includes(values.method)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["method"],
        message: "Choose a payment method",
      });
    }

    if (values.createNewDonor) {
      if (values.firstName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["firstName"],
          message: "First name is required",
        });
      }
      if (values.lastName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastName"],
          message: "Last name is required",
        });
      }
    } else if (values.donorId.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donorId"],
        message: "Select an existing donor or create a new one",
      });
    }
  });
