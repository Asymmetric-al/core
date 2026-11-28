import { z } from "zod";

export const SECURITY_LEVELS = [
  "standard",
  "sensitive",
  "restricted",
  "high_risk",
] as const;

export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

export const LEVEL_SOURCES = [
  "manual",
  "country_default",
  "unreviewed_default",
] as const;

export const NOT_PERMITTED_TEXT =
  "Only staff with the Restrict publication permission can change these settings.";

export const FAILURE_TEXT = "Something went wrong. Nothing was changed.";

export const OUTCOME_UNKNOWN_TEXT =
  "The change may have been saved. Reload this worker before trying again.";

export const workerSchema = z.strictObject({
  assignmentId: z.guid(),
  partyId: z.guid(),
  displayName: z.string(),
  publicAlias: z.string().nullable(),
  securityLevel: z.enum(SECURITY_LEVELS),
  securityLevelSource: z.enum(LEVEL_SOURCES),
  doNotPublish: z.boolean(),
  hasLegalIdentity: z.boolean().nullable(),
  hasLogin: z.boolean(),
  createdAt: z.string(),
});

export type Worker = z.infer<typeof workerSchema>;

export const workerListEnvelopeSchema = z.strictObject({
  workers: z.array(workerSchema),
});

export const workerEnvelopeSchema = z.strictObject({ worker: workerSchema });

export const revealEnvelopeSchema = z.strictObject({
  legalName: z.string(),
  realCountry: z.string().nullable(),
  preciseLocation: z.string().nullable(),
});

export type RevealedIdentity = z.infer<typeof revealEnvelopeSchema>;

export const inviteEnvelopeSchema = z.strictObject({
  invitation: z.strictObject({
    invitationId: z.guid(),
    email: z.string(),
    expiresAt: z.string(),
  }),
  invitePath: z.string().startsWith("/invite/"),
});

export type WorkerInvitation = z.infer<typeof inviteEnvelopeSchema>;

export const legalEntitySchema = z.strictObject({
  id: z.guid(),
  name: z.string(),
});

export const legalEntitiesEnvelopeSchema = z.strictObject({
  legalEntities: z.array(legalEntitySchema),
});

export type WorkerLegalEntity = z.infer<typeof legalEntitySchema>;
