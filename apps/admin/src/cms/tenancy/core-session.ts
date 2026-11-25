import { requestScopeHeaders } from "@asym/database/request-scope-headers";
import { createServerClient } from "@supabase/ssr";

import { readEditingActor } from "../access/tenant-context";

import type { PayloadRequest } from "payload";

type CoreSessionClient = Pick<
  ReturnType<typeof createServerClient>,
  "auth" | "from" | "rpc"
>;

export type CoreSession = {
  client: CoreSessionClient;
  tenantId: string;
};

type Dependencies = {
  createClient?: typeof createServerClient;
};

function parseCookieHeader(header: string | null | undefined) {
  if (!header) return [];
  return header
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...value] = cookie.split("=");
      return { name: name ?? "", value: value.join("=") };
    })
    .filter((cookie) => cookie.name.length > 0);
}

export async function openCoreSession(
  req: PayloadRequest,
  dependencies: Dependencies = {},
): Promise<CoreSession | null> {
  const actor = readEditingActor(req);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!actor || !url || !anonKey) return null;
  const cookies = parseCookieHeader(req.headers?.get("cookie"));
  if (cookies.length === 0) return null;
  const client = (dependencies.createClient ?? createServerClient)(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookies,
        setAll: () => undefined,
      },
      global: {
        headers: requestScopeHeaders({
          tenantId: actor.tenantId,
          assignmentId: actor.assignmentId,
        }),
      },
    },
  );
  const { data } = await client.auth.getSession();
  if (data.session?.user?.id !== actor.userId) return null;
  return { client, tenantId: actor.tenantId };
}

type MissionaryLabelRow = {
  id: string;
  profile_id: string | null;
  member_profile_id: string | null;
  display_name: string | null;
};

export async function readMissionary(
  session: CoreSession,
  missionaryId: string,
): Promise<{ id: string; name: string } | null> {
  const { data, error } = await session.client.rpc("crm_missionary_labels", {
    p_tenant_id: session.tenantId,
    p_ids: [missionaryId],
  });
  if (error) throw new Error("Core could not check the missionary.");
  const row = ((data ?? []) as MissionaryLabelRow[]).find(
    (candidate) => candidate.id === missionaryId,
  );
  if (!row) return null;
  const name = row.member_profile_id ? row.display_name?.trim() : "";
  return { id: row.id, name: name || "Missionary" };
}

export async function readFund(
  session: CoreSession,
  fundId: string,
): Promise<{
  id: string;
  name: string | null;
  description: string | null;
} | null> {
  const { data, error } = await session.client
    .from("funds")
    .select("id, name, description")
    .is("system_purpose", null)
    .eq("id", fundId)
    .eq("tenant_id", session.tenantId)
    .maybeSingle();
  if (error) throw new Error("Core could not check the fund.");
  const row = data as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
  } | null;
  if (!row || row.id !== fundId) return null;
  return {
    id: fundId,
    name: typeof row.name === "string" ? row.name : null,
    description: typeof row.description === "string" ? row.description : null,
  };
}
