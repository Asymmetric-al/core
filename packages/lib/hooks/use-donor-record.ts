"use client";

import { useDocumentScope } from "@asym/database/document-scope";
import { createBrowserClient } from "@asym/database/supabase";
import { useEffect, useMemo, useState, startTransition } from "react";

type DonorRecordClient = Pick<ReturnType<typeof createBrowserClient>, "from">;

export async function loadOwnDonorId(
  supabase: DonorRecordClient,
  scope: { userId: string; tenantId: string },
): Promise<string | null> {
  const { data: link, error: linkError } = await supabase
    .from("account_links")
    .select("party_id")
    .eq("tenant_id", scope.tenantId)
    .eq("user_id", scope.userId)
    .maybeSingle();
  const partyId = (link as { party_id?: string | null } | null)?.party_id;
  if (linkError || !partyId) return null;

  const { data: donors, error: donorsError } = await supabase
    .from("donors")
    .select("id")
    .eq("tenant_id", scope.tenantId)
    .eq("party_id", partyId)
    .limit(2);
  if (donorsError || !donors || donors.length !== 1) return null;
  return (donors[0] as { id: string }).id;
}

/** The signed-in person's donor id in the document's tenant, through their account link and its Party. */
export function useDonorRecord() {
  const scope = useDocumentScope();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [donorLoading, setDonorLoading] = useState(true);

  const userId = scope?.userId;
  const tenantId = scope?.tenantId;

  useEffect(() => {
    if (!userId || !tenantId) {
      startTransition(() => {
        setDonorId(null);
        setDonorLoading(false);
      });
      return;
    }

    let cancelled = false;
    startTransition(() => {
      setDonorLoading(true);
    });

    void loadOwnDonorId(supabase, { userId, tenantId }).then((id) => {
      if (cancelled) return;
      startTransition(() => {
        setDonorId(id);
        setDonorLoading(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, tenantId, supabase]);

  return {
    donorId,
    loading: donorLoading,
  };
}
