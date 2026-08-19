import { beginGiftIntake } from "@asym/api/donate/begin-gift-intake";

type GraphQLGiftIntakeRpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
};

export type BeginGraphQLGiftIntakeInput = {
  supabaseAdmin: GraphQLGiftIntakeRpcClient;
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
    rpc: async (fn, rpcArgs) => {
      const response = await input.supabaseAdmin.rpc(fn, rpcArgs);
      return { data: response.data, error: response.error };
    },
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
