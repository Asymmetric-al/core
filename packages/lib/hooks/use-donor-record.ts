"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useEffect, useMemo, useState, startTransition } from "react";

import { useAuth } from "./use-auth";

/** Resolves the `donors.id` row for the signed-in user via `profiles.id` → `donors.profile_id`. */
export function useDonorRecord() {
  const { profile, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [donorId, setDonorId] = useState<string | null>(null);
  const [donorLoading, setDonorLoading] = useState(true);

  const profileId = profile?.id;

  useEffect(() => {
    if (authLoading) return;

    if (!profileId) {
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

    void supabase
      .from("donors")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        startTransition(() => {
          if (error) {
            setDonorId(null);
          } else {
            setDonorId(data?.id ?? null);
          }
          setDonorLoading(false);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, profileId, supabase]);

  return {
    donorId,
    loading: authLoading || donorLoading,
  };
}
