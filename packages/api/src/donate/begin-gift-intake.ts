import { parseRpcObject } from "../shared/parse-rpc-object"

export type GiftIntakeRpcInvoker = (
  fn: "begin_donation_saga",
  args: {
    p_tenant_id: string
    p_profile_id: string
    p_actor_user_id: string
    p_missionary_id: string | null
    p_fund_id: string | null
    p_amount: number
    p_currency: string
    p_idempotency_key: string
    p_ip_address: string | null
    p_user_agent: string | null
  },
) => Promise<{
  data: unknown
  error: { code?: string; message: string } | null
}>

export type BeginGiftIntakeInput = {
  rpc: GiftIntakeRpcInvoker
  tenantId: string
  profileId: string
  actorUserId: string
  missionaryId: string | null
  fundId: string | null
  amountCents: number
  currency: string
  idempotencyKey: string
  ipAddress: string | null
  userAgent: string | null
}

export type BeginGiftIntakeResult =
  | { ok: true; donationId: string; outboxId: string; replayed: boolean }
  | { ok: false; code: "not_found" }
  | { ok: false; code: "incomplete" }
  | { ok: false; code: "invalid"; message: string }
  | { ok: false; code: "failed"; message: string }

type BeginDonationSagaPayload = {
  donation_id?: unknown
  outbox_id?: unknown
  replayed?: unknown
}

function readRequiredId(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null
  }
  return value
}

export async function beginGiftIntake(
  input: BeginGiftIntakeInput,
): Promise<BeginGiftIntakeResult> {
  const { data, error } = await input.rpc("begin_donation_saga", {
    p_tenant_id: input.tenantId,
    p_profile_id: input.profileId,
    p_actor_user_id: input.actorUserId,
    p_missionary_id: input.missionaryId,
    p_fund_id: input.fundId,
    p_amount: input.amountCents,
    p_currency: input.currency.toLowerCase(),
    p_idempotency_key: input.idempotencyKey,
    p_ip_address: input.ipAddress,
    p_user_agent: input.userAgent,
  })

  if (error) {
    if (error.code === "P0002") {
      return { ok: false, code: "not_found" }
    }
    if (error.code === "22023") {
      return { ok: false, code: "invalid", message: error.message }
    }
    return { ok: false, code: "failed", message: error.message }
  }

  const parsed = parseRpcObject<BeginDonationSagaPayload>(data)
  const donationId = readRequiredId(parsed?.donation_id)
  const outboxId = readRequiredId(parsed?.outbox_id)
  if (!donationId || !outboxId) {
    return { ok: false, code: "incomplete" }
  }

  return {
    ok: true,
    donationId,
    outboxId,
    replayed: parsed?.replayed === true,
  }
}
