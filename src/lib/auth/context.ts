import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { UserRole } from "@/types/database";

export interface AuthContext {
  userId: string | null;
  tenantId: string | null;
  role: UserRole | null;
  profileId: string | null;
  isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  profileId: string;
  isAuthenticated: true;
}

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
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
  context: AuthContext,
): asserts context is AuthenticatedContext {
  if (
    !context.isAuthenticated ||
    !context.userId ||
    !context.tenantId ||
    !context.role
  ) {
    throw new Error("Unauthorized");
  }
}

export function requireRole(
  context: AuthContext,
  allowedRoles: UserRole[],
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (!allowedRoles.includes(context.role)) {
    throw new Error(
      `Forbidden: requires one of ${allowedRoles.join(", ")} role`,
    );
  }
}
