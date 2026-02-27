"use client";

import { createBrowserClient } from "@asym/database/supabase";
import { useState, useEffect } from "react";

import { signOutOnServer } from "./client-signout";

import type { Profile } from "@asym/database/types";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
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

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setState({ user, profile, loading: false });
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        setState({ user: session.user, profile, loading: false });
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const serverSignOut = await signOutOnServer();
    if (!serverSignOut.ok) {
      window.alert(
        serverSignOut.message ?? "Unable to sign out. Please try again.",
      );
    }

    const supabase = createBrowserClient();
    void supabase.auth.signOut().catch((error) => {
      console.warn("[auth] browser signout cleanup failed", error);
    });
    window.location.href = "/login";
  };

  return { ...state, signOut };
}
