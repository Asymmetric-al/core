"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Role, User, Tenant } from "./types";
import { ROLE_LABELS } from "./roles";
import { createBrowserClient } from "@asym/database/supabase";

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

const MCContext = createContext<MCContextValue | null>(null);

const DEFAULT_TENANT: Tenant = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "asymmetric.al",
  slug: "asymmetric-al",
};

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

export function MCProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(DEFAULT_TENANT);
  const [loading, setLoading] = useState(true);
  const isDevMode = process.env.NODE_ENV === "development";

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
          const mcRole = mapProfileRoleToMCRole(profile.role);
          setRole(mcRole);
          setUser({
            id: authUser.id,
            email: profile.email,
            name: `${profile.first_name} ${profile.last_name}`,
            role: mcRole,
            tenantId: profile.tenant_id,
            avatarUrl: profile.avatar_url,
          });

          if (profile.tenants) {
            setTenant({
              id: profile.tenants.id,
              name: profile.tenants.name,
              slug: profile.tenants.slug,
            });
          }
        }
      }
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, tenants(*)")
          .eq("user_id", session.user.id)
          .single();

        if (profile) {
          const mcRole = mapProfileRoleToMCRole(profile.role);
          setRole(mcRole);
          setUser({
            id: session.user.id,
            email: profile.email,
            name: `${profile.first_name} ${profile.last_name}`,
            role: mcRole,
            tenantId: profile.tenant_id,
            avatarUrl: profile.avatar_url,
          });

          if (profile.tenants) {
            setTenant({
              id: profile.tenants.id,
              name: profile.tenants.name,
              slug: profile.tenants.slug,
            });
          }
        }
      } else {
        setUser(null);
        setRole("admin");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
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
