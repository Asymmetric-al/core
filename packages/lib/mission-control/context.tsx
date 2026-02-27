"use client";

import { signOutOnServer } from "@asym/auth/client-signout";
import { createBrowserClient } from "@asym/database/supabase";
import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";

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

type ProfileWithTenant = {
  role: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  tenant_id: string;
  avatar_url: string | null;
  tenants: {
    id: string;
    name: string;
    slug: string;
  } | null;
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
  loading: true,
};

type MCAction =
  | { type: "setRole"; role: Role }
  | { type: "setSidebarCollapsed"; collapsed: boolean }
  | { type: "setAuthenticated"; authUserId: string; profile: ProfileWithTenant }
  | { type: "setSignedOut" }
  | { type: "setLoadingComplete" };

function mapProfileRoleToMCRole(profileRole: string): Role {
  const roleMap: Record<string, Role> = {
    admin: "admin",
    staff: "staff",
    missionary: "fundraising",
    donor: "staff",
    finance: "finance",
    fundraising: "fundraising",
    mobilizers: "mobilizers",
    member_care: "member_care",
    events: "events",
  };
  return roleMap[profileRole] || "staff";
}

function toDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

function mcReducer(state: MCState, action: MCAction): MCState {
  switch (action.type) {
    case "setRole":
      return { ...state, role: action.role };
    case "setSidebarCollapsed":
      return { ...state, sidebarCollapsed: action.collapsed };
    case "setAuthenticated": {
      const mcRole = mapProfileRoleToMCRole(action.profile.role);
      return {
        ...state,
        role: mcRole,
        user: {
          id: action.authUserId,
          email: action.profile.email,
          name: toDisplayName(
            action.profile.first_name,
            action.profile.last_name,
          ),
          role: mcRole,
          tenantId: action.profile.tenant_id,
          avatarUrl: action.profile.avatar_url ?? undefined,
        },
        tenant: action.profile.tenants
          ? {
              id: action.profile.tenants.id,
              name: action.profile.tenants.name,
              slug: action.profile.tenants.slug,
            }
          : state.tenant,
        loading: false,
      };
    }
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

export function MCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mcReducer, INITIAL_MC_STATE);
  const { user, tenant, role, sidebarCollapsed, loading } = state;
  const isDevMode = process.env.NODE_ENV === "development";

  const setRole = useCallback((nextRole: Role) => {
    dispatch({ type: "setRole", role: nextRole });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: "setSidebarCollapsed", collapsed });
  }, []);

  const applyAuthenticatedState = useCallback(
    (authUserId: string, profile: ProfileWithTenant) => {
      dispatch({ type: "setAuthenticated", authUserId, profile });
    },
    [],
  );

  const applySignedOutState = useCallback(() => {
    dispatch({ type: "setSignedOut" });
  }, []);

  const markLoadingComplete = useCallback(() => {
    dispatch({ type: "setLoadingComplete" });
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, tenants(*)")
          .eq("user_id", authUser.id)
          .single();

        if (profile) {
          applyAuthenticatedState(authUser.id, profile);
          return;
        }
      }

      applySignedOutState();
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, tenants(*)")
          .eq("user_id", session.user.id)
          .single();

        if (profile) {
          applyAuthenticatedState(session.user.id, profile);
          return;
        }
      } else {
        applySignedOutState();
        return;
      }

      markLoadingComplete();
    });

    return () => subscription.unsubscribe();
  }, [applyAuthenticatedState, applySignedOutState, markLoadingComplete]);

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
