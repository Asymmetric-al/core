import { z } from "zod";

import {
  EVE_SHARED_CONTEXT_CATEGORIES,
  EVE_SHARED_CONTEXT_PROVENANCE_KINDS,
  EVE_SHARED_CONTEXT_RISKS,
  type EveSharedContextValue,
  type EveSharedContextWriteInput,
} from "./types";

function isJsonValue(value: unknown): value is EveSharedContextValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJsonValue);
}

export const eveSharedContextEvidenceSchema = z
  .object({
    digest: z.string().trim().min(8).max(200).optional(),
    kind: z.enum(EVE_SHARED_CONTEXT_PROVENANCE_KINDS),
    reference: z.string().trim().min(1).max(500),
  })
  .strict();

export const eveSharedContextWriteSchema = z
  .object({
    schemaVersion: z.literal(1),
    category: z.enum(EVE_SHARED_CONTEXT_CATEGORIES),
    fieldPath: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z][a-z0-9_.-]*$/u),
    value: z.unknown().refine(isJsonValue, "The value must be JSON-safe."),
    provenance: z
      .object({
        kind: z.enum(EVE_SHARED_CONTEXT_PROVENANCE_KINDS),
        reference: z.string().trim().min(1).max(500),
      })
      .strict(),
    confidenceBps: z.number().int().min(0).max(10_000),
    risk: z.enum(EVE_SHARED_CONTEXT_RISKS),
    evidence: z.array(eveSharedContextEvidenceSchema).min(1).max(20),
    relationship: z.enum([
      "independent",
      "supports",
      "contradicts",
      "supersedes",
    ]),
    relatedClaimIds: z.array(z.string().uuid()).max(20),
  })
  .strict()
  .superRefine((value, context) => {
    const hasRelationship = value.relationship !== "independent";
    if (hasRelationship && value.relatedClaimIds.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Related claims are required for this relationship.",
        path: ["relatedClaimIds"],
      });
    }
    if (!hasRelationship && value.relatedClaimIds.length > 0) {
      context.addIssue({
        code: "custom",
        message: "Independent claims cannot name related claims.",
        path: ["relatedClaimIds"],
      });
    }
  }) satisfies z.ZodType<EveSharedContextWriteInput>;

export const eveSharedContextResolutionSchema = z
  .object({
    conflictId: z.string().uuid(),
    evidence: z.array(eveSharedContextEvidenceSchema).min(1).max(20),
    outcome: z.string().trim().min(1).max(2_000),
    policyId: z.string().trim().min(1).max(200),
    selectedClaimIds: z.array(z.string().uuid()).min(1).max(20),
  })
  .strict();
