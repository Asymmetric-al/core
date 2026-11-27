import { createClient } from "@asym/database/supabase/server";
import { clientEnv, serverEnv } from "@asym/env";

import {
  createGivingConfigHandler,
  type GivingConfigRpc,
} from "./config-handler";

const rpc: GivingConfigRpc = async (fn, args) => {
  const supabase = (await createClient(null)) as unknown as {
    rpc: GivingConfigRpc;
  };
  return supabase.rpc(fn, args);
};

export const POST = createGivingConfigHandler({
  enabled: () => serverEnv.GUEST_GIVING_ENABLED === true,
  publishableKey: () => clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  rpc: () => rpc,
});
