"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@asym/database/supabase";
import type { Profile } from "@asym/database/types";
import { DEMO_PROFILE_ID } from "@asym/auth/constants";

interface AuthState {
  user: { id: string } | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadViewerProfile() {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", DEMO_PROFILE_ID)
        .single();

      if (error || !profile) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      setState({
        user: { id: profile.id },
        profile,
        loading: false,
      });
    }

    loadViewerProfile();
  }, []);

  const signOut = async () => {
    // No-op: read-only demo has no session to sign out
  };

  return { ...state, signOut };
}
