import {
  beginGiftIntake,
  type GiftIntakeRpcInvoker,
} from "@asym/api/donate/begin-gift-intake";

export type BeginGraphQLGiftIntakeInput = {
  rpc: GiftIntakeRpcInvoker;
  tenantId: string;
  profileId: string;
  actorUserId: string;
  missionaryId: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export async function beginGraphQLGiftIntake(
  input: BeginGraphQLGiftIntakeInput,
) {
  const result = await beginGiftIntake({
    rpc: input.rpc,
    tenantId: input.tenantId,
    profileId: input.profileId,
    actorUserId: input.actorUserId,
    missionaryId: input.missionaryId,
    fundId: null,
    amountCents: input.amountCents,
    currency: input.currency,
    idempotencyKey: input.idempotencyKey,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  if (result.ok) {
    return {
      donationId: result.donationId,
      outboxId: result.outboxId,
      replayed: result.replayed,
    };
  }

  switch (result.code) {
    case "not_found":
      throw new Error("Missionary not found");
    case "incomplete":
      throw new Error("Failed to create donation");
    case "invalid":
    case "failed":
      throw new Error(result.message);
    default: {
      const _exhaustive: never = result;
      throw new Error(String(_exhaustive));
    }
  }
}
