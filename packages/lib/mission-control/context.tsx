"use client";

import {
  signOutClientSession,
  subscribeToClientAuthState,
} from "@asym/auth/client-session";
import { runtimeEnvFlags } from "@asym/env";
import {
  createContext,
  use,
  useCallback,
  useReducer,
  useEffect,
  useRef,
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
  const currentUserRef = useRef(user);

  useEffect(() => {
    currentUserRef.current = user;
  }, [user]);

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
    return subscribeToClientAuthState(
      ({ user: sessionUser }) => {
        if (!sessionUser) {
          applySignedOutState();
          return;
        }

        if (!currentUserRef.current) {
          markLoadingComplete();
        }
      },
      { includeProfile: false },
    );
  }, [applySignedOutState, markLoadingComplete]);

  const signOut = useCallback(async () => {
    await signOutClientSession();
  }, []);

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
  const ctx = use(MCContext);
  if (!ctx) throw new Error("useMC must be used within MCProvider");
  return ctx;
}

export function useRole() {
  const { role, setRole, isDevMode } = useMC();
  return { role, setRole, isDevMode, roleLabel: ROLE_LABELS[role] };
}
