import { createClient } from "@asym/database/supabase/server";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { FRONT_HEADER_PREFIX } from "./front";
import { isOperationsAddress, operationsNamesFromEnv } from "./operator-area";
import { PAGE_SCOPE_HEADERS } from "./request-headers";

export interface OperatorAdmission {
  readonly admitted: boolean;
}

const REFUSED: OperatorAdmission = { admitted: false };
const ADMITTED: OperatorAdmission = { admitted: true };

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

function carriesScopeOrFrontHeader(requestHeaders: RequestHeaders): boolean {
  if (PAGE_SCOPE_HEADERS.some((name) => requestHeaders.has(name))) return true;
  for (const name of requestHeaders.keys()) {
    if (name.toLowerCase().startsWith(FRONT_HEADER_PREFIX)) return true;
  }
  return false;
}

export const readOperatorAdmission = cache(
  async (): Promise<OperatorAdmission> => {
    try {
      const requestHeaders = await headers();
      if (carriesScopeOrFrontHeader(requestHeaders)) return REFUSED;
      if (
        !isOperationsAddress(
          requestHeaders,
          operationsNamesFromEnv(process.env),
        )
      ) {
        return REFUSED;
      }
      const supabase = await createClient(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return REFUSED;
      const { data, error } = await supabase.rpc("caller_is_platform_operator");
      return !error && data === true ? ADMITTED : REFUSED;
    } catch (error) {
      unstable_rethrow(error);
      return REFUSED;
    }
  },
);
