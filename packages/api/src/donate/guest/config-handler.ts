import { z } from "zod";

export type GivingConfigRpc = (
  fn: "checkout_giving_config",
  args: { p_host: string; p_targets: Array<Record<string, string>> },
) => Promise<{
  data: unknown;
  error: { code?: string; message: string } | null;
}>;

export type GivingConfigDeps = {
  enabled: () => boolean;
  publishableKey: () => string | undefined;
  rpc: () => GivingConfigRpc | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  targets: z
    .array(
      z
        .object({
          fundId: z.string().regex(UUID).optional(),
          missionaryId: z.string().regex(UUID).optional(),
        })
        .refine(
          (target) =>
            (target.fundId === undefined) !==
            (target.missionaryId === undefined),
        ),
    )
    .min(1)
    .max(99),
});

const rowsSchema = z
  .array(
    z.object({
      connected_account_id: z.string().regex(/^acct_[A-Za-z0-9]+$/),
    }),
  )
  .length(1);

const unavailable = () =>
  Response.json({ error: "giving_unavailable" }, { status: 503 });

export function createGivingConfigHandler(deps: GivingConfigDeps) {
  return async function POST(request: Request): Promise<Response> {
    if (!deps.enabled()) return unavailable();
    const publishableKey = deps.publishableKey()?.trim();
    if (!publishableKey || !/^pk_test_[A-Za-z0-9]+$/.test(publishableKey))
      return unavailable();
    const rpc = deps.rpc();
    if (!rpc) return unavailable();
    const host = request.headers.get("host")?.trim();
    if (!host) return unavailable();

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return unavailable();
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return unavailable();

    let answer: Awaited<ReturnType<GivingConfigRpc>>;
    try {
      answer = await rpc("checkout_giving_config", {
        p_host: host,
        p_targets: parsed.data.targets.map((target): Record<string, string> =>
          target.fundId
            ? { fund_id: target.fundId }
            : { missionary_id: target.missionaryId ?? "" },
        ),
      });
    } catch {
      return unavailable();
    }
    if (answer.error) return unavailable();
    const rows = rowsSchema.safeParse(answer.data);
    if (!rows.success) return unavailable();

    return Response.json({
      publishableKey,
      connectedAccountId: rows.data[0]!.connected_account_id,
    });
  };
}
