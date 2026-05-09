"use client";

import { useCallback, useEffect, useState } from "react";

import {
  signOutClientSession,
  subscribeToClientAuthState,
  type ClientAuthState,
} from "./client-session";

export function useAuth() {
  const [state, setState] = useState<ClientAuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    return subscribeToClientAuthState(setState);
  }, []);

  const signOut = useCallback(async () => {
    await signOutClientSession();
  }, []);

  return { ...state, signOut };
}
