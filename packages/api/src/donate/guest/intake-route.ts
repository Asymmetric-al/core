import { lookUpVerifiedNameSurfaces } from "@asym/auth/verified-name";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import { serverEnv } from "@asym/env";

import { isGuestGivingOpen } from "./giving-open";
import {
  createGuestIntakeHandler,
  type GuestIntakeRpc,
} from "./intake-handler";
import {
  paymentClientSecret,
  sendFirstPayment,
} from "../../workflows/functions/money-schedule";

export const POST = createGuestIntakeHandler({
  enabled: () => isGuestGivingOpen(),
  challengeSecret: () => serverEnv.TURNSTILE_SECRET_KEY,
  rpc: () => {
    const { client, error } = getAdminClient();
    if (error || !client) return null;
    const intake: GuestIntakeRpc = async (fn, args) => {
      const { data, error: rpcError } = await (
        client as unknown as {
          rpc: (
            name: "take_intake_attempt" | "begin_line_gift",
            params: Record<string, unknown>,
          ) => Promise<{
            data: unknown;
            error: { code?: string; message: string } | null;
          }>;
        }
      ).rpc(fn, args);
      return { data, error: rpcError };
    };
    return intake;
  },
  isHomeHost: async (host) => {
    const lookup = await lookUpVerifiedNameSurfaces(host, ["donor_account"]);
    if (lookup.kind === "unavailable") throw new Error("home lookup failed");
    return lookup.decisions.donor_account.kind === "admitted";
  },
  resolveActor: async () => {
    const supabase = await createClient(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      user_id: user.id,
      email: user.email ?? null,
      email_confirmed: Boolean(user.email_confirmed_at),
    };
  },
  sendFirst: sendFirstPayment,
  clientSecret: paymentClientSecret,
});
