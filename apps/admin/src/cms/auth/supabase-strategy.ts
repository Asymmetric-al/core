import { createServerClient } from "@supabase/ssr";

import { CMS_USERS_SLUG } from "../constants";

import type { UserRole } from "@asym/database/types";
import type { AuthStrategy } from "payload";

const STRATEGY_NAME = "supabase-session";
const STAFF_ROLES: UserRole[] = ["staff", "admin", "super_admin"];

type CmsUserSnapshot = {
  id: number | string;
  email?: string;
  role?: UserRole;
  supabaseUserId?: string;
  tenantId?: string;
};

type SupabaseStrategyDependencies = {
  createSupabaseClient?: typeof createServerClient;
};

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return [] as Array<{ name: string; value: string }>;
  }

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...valueParts] = cookie.split("=");
      return {
        name,
        value: valueParts.join("="),
      };
    })
    .filter(
      (cookie): cookie is { name: string; value: string } =>
        typeof cookie.name === "string" && cookie.name.length > 0,
    );
}

export function createSupabaseAuthStrategy(
  dependencies: SupabaseStrategyDependencies = {},
): AuthStrategy {
  const createSupabaseClient =
    dependencies.createSupabaseClient ?? createServerClient;

  return {
    name: STRATEGY_NAME,
    authenticate: async ({ headers, payload }) => {
      const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseURL || !supabaseAnonKey) {
        return { user: null };
      }

      const requestCookies = parseCookieHeader(headers.get("cookie"));
      const supabase = createSupabaseClient(supabaseURL, supabaseAnonKey, {
        cookies: {
          getAll() {
            return requestCookies;
          },
          setAll(
            _cookiesToSet: Array<{
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }>,
          ) {
            // This auth strategy only reads server-side sessions.
            // Session refresh is managed by our app middleware.
          },
        },
      });

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (!supabaseUser?.id) {
        return { user: null };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, role")
        .eq("user_id", supabaseUser.id)
        .single();

      const role = profile?.role as UserRole | null;

      if (!profile?.tenant_id || !role || !STAFF_ROLES.includes(role)) {
        return { user: null };
      }

      const existingUsers = await payload.find({
        collection: CMS_USERS_SLUG,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          supabaseUserId: {
            equals: supabaseUser.id,
          },
        },
      });

      const desiredData = {
        email: supabaseUser.email ?? `${supabaseUser.id}@asym.local`,
        role,
        supabaseUserId: supabaseUser.id,
        tenantId: profile.tenant_id,
      };

      const existingUser = existingUsers.docs[0] as CmsUserSnapshot | undefined;
      const userNeedsSync =
        !existingUser ||
        existingUser.email !== desiredData.email ||
        existingUser.role !== desiredData.role ||
        existingUser.supabaseUserId !== desiredData.supabaseUserId ||
        existingUser.tenantId !== desiredData.tenantId;

      const syncedUser = existingUser
        ? userNeedsSync
          ? await payload.update({
              id: existingUser.id,
              collection: CMS_USERS_SLUG,
              data: desiredData,
              overrideAccess: true,
            })
          : {
              ...existingUser,
              ...desiredData,
            }
        : await payload.create({
            collection: CMS_USERS_SLUG,
            data: desiredData,
            overrideAccess: true,
          });

      return {
        user: {
          ...syncedUser,
          _strategy: `${CMS_USERS_SLUG}-${STRATEGY_NAME}`,
          collection: CMS_USERS_SLUG,
        },
      };
    },
  };
}
