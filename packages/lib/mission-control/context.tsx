"use client";

import { signOutOnServer } from "@asym/auth/client-signout";
import { createBrowserClient } from "@asym/database/supabase";
import { runtimeEnvFlags } from "@asym/env";
import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";

import { type MCBootstrapState } from "./bootstrap";
import { ROLE_LABELS } from "./roles";

import type { Role, User, Tenant } from "./types";

interface MCContextValue {
  user: User | null;
  tenant: Tenant | null;
  role: Role;
  setRole: (role: Role) => void;
  isDevMode: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

type MCState = {
  user: User | null;
  tenant: Tenant | null;
  role: Role;
  sidebarCollapsed: boolean;
  loading: boolean;
};

const MCContext = createContext<MCContextValue | null>(null);

const DEFAULT_TENANT: Tenant = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "asymmetric.al",
  slug: "asymmetric-al",
};

const INITIAL_MC_STATE: MCState = {
  user: null,
  tenant: DEFAULT_TENANT,
  role: "admin",
  sidebarCollapsed: false,
  loading: false,
};

type MCAction =
  | { type: "setRole"; role: Role }
  | { type: "setSidebarCollapsed"; collapsed: boolean }
  | { type: "setSignedOut" }
  | { type: "setLoadingComplete" };

function createInitialMCState(initialState?: MCBootstrapState | null): MCState {
  if (!initialState) {
    return INITIAL_MC_STATE;
  }

  return {
    user: initialState.user,
    tenant: initialState.tenant ?? DEFAULT_TENANT,
    role: initialState.role,
    sidebarCollapsed: false,
    loading: false,
  };
}

function mcReducer(state: MCState, action: MCAction): MCState {
  switch (action.type) {
    case "setRole":
      return { ...state, role: action.role };
    case "setSidebarCollapsed":
      return { ...state, sidebarCollapsed: action.collapsed };
    case "setSignedOut":
      return {
        ...state,
        user: null,
        role: "admin",
        loading: false,
      };
    case "setLoadingComplete":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function MCProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: MCBootstrapState | null;
}) {
  const [state, dispatch] = useReducer(
    mcReducer,
    initialState,
    createInitialMCState,
  );
  const { user, tenant, role, sidebarCollapsed, loading } = state;
  const isDevMode = runtimeEnvFlags.NODE_ENV === "development";

  const setRole = useCallback((nextRole: Role) => {
    dispatch({ type: "setRole", role: nextRole });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: "setSidebarCollapsed", collapsed });
  }, []);

  const applySignedOutState = useCallback(() => {
    dispatch({ type: "setSignedOut" });
  }, []);

  const markLoadingComplete = useCallback(() => {
    dispatch({ type: "setLoadingComplete" });
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        applySignedOutState();
        return;
      }

      if (!user) {
        markLoadingComplete();
      }
    });

    return () => subscription.unsubscribe();
  }, [applySignedOutState, markLoadingComplete, user]);

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

  return (
    <MCContext.Provider
      value={{
        user,
        tenant,
        role,
        setRole,
        isDevMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        loading,
        signOut,
      }}
    >
      {children}
    </MCContext.Provider>
  );
}

export function useMC() {
  const ctx = useContext(MCContext);
  if (!ctx) throw new Error("useMC must be used within MCProvider");
  return ctx;
}

export function useRole() {
  const { role, setRole, isDevMode } = useMC();
  return { role, setRole, isDevMode, roleLabel: ROLE_LABELS[role] };
}
