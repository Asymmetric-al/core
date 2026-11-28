import { createAnonymousClient } from "@asym/database/supabase/server";
import { clientEnv } from "@asym/env";

import {
  createGivingConfigHandler,
  type GivingConfigRpc,
} from "./config-handler";
import { isGuestGivingOpen } from "./giving-open";

export const POST = createGivingConfigHandler({
  enabled: () => isGuestGivingOpen(),
  publishableKey: () => clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  rpc: () => {
    const client = createAnonymousClient();
    if (!client) return null;
    const rpc: GivingConfigRpc = async (fn, args) => {
      const { data, error } = await client.rpc(fn, args);
      return { data, error };
    };
    return rpc;
  },
});
