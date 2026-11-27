import { createAnonymousClient } from "@asym/database/supabase/server";
import { clientEnv, serverEnv } from "@asym/env";

import {
  createGivingConfigHandler,
  type GivingConfigRpc,
} from "./config-handler";

export const POST = createGivingConfigHandler({
  enabled: () => serverEnv.GUEST_GIVING_ENABLED === true,
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
