import type { UserRole } from "@asym/database/types";
import { serverEnv } from "@asym/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface AuthContext {
  isAuthenticated: boolean;
  profileId: string | null;
  role: UserRole | null;
  tenantId: string | null;
  userId: string | null;
}

export interface AuthenticatedContext extends AuthContext {
  isAuthenticated: true;
  profileId: string;
  role: UserRole;
  tenantId: string;
  userId: string;
}

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      userId: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return {
      userId: user.id,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
    };
  }

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    role: profile.role as UserRole,
    profileId: profile.id,
    isAuthenticated: true,
  };
}

export function requireAuth(
  context: AuthContext
): asserts context is AuthenticatedContext {
  if (
    !(
      context.isAuthenticated &&
      context.userId &&
      context.tenantId &&
      context.role
    )
  ) {
    throw new Error("Unauthorized");
  }
}

export function requireRole(
  context: AuthContext,
  allowedRoles: UserRole[]
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (!allowedRoles.includes(context.role)) {
    throw new Error(
      `Forbidden: requires one of ${allowedRoles.join(", ")} role`
    );
  }
}
