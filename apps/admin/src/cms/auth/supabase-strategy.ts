import { createServerClient } from "@supabase/ssr";

import { CMS_USERS_SLUG } from "../constants";

import type { AuthStrategy } from "payload";

const STRATEGY_NAME = "supabase-session";
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const STAFF_SUBROLES = new Set([
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
]);
type CmsStaffRole = "staff" | "super_admin";
type CmsUserDoc = {
  id: number;
  email: string;
  role?: CmsStaffRole | null;
  supabaseUserId?: string | null;
  tenantId?: string | null;
  updatedAt: string;
  createdAt: string;
};
type CmsUserSyncData = Pick<
  CmsUserDoc,
  "email" | "role" | "supabaseUserId" | "tenantId"
>;

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

      const profileRole =
        typeof profile?.role === "string" ? profile.role : null;
      const tenantId =
        typeof profile?.tenant_id === "string"
          ? profile.tenant_id
          : profileRole === "super_admin"
            ? DEFAULT_TENANT_ID
            : null;

      const { data: staffMembership } = tenantId
        ? await supabase
            .schema("authz")
            .from("memberships")
            .select("staff_role")
            .eq("user_id", supabaseUser.id)
            .eq("tenant_id", tenantId)
            .eq("role", "staff")
            .eq("is_active", true)
            .limit(1)
            .maybeSingle()
        : { data: null };

      const role =
        profileRole === "super_admin"
          ? "super_admin"
          : typeof staffMembership?.staff_role === "string" &&
              STAFF_SUBROLES.has(staffMembership.staff_role)
            ? "staff"
            : null;

      if (!tenantId || !role) {
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

      const desiredData: CmsUserSyncData = {
        email: supabaseUser.email ?? `${supabaseUser.id}@asym.local`,
        role,
        supabaseUserId: supabaseUser.id,
        tenantId,
      };

      const existingUser = existingUsers.docs[0] as CmsUserDoc | undefined;
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
          : existingUser
        : await payload.create({
            collection: CMS_USERS_SLUG,
            data: desiredData,
            overrideAccess: true,
          });
      const userRecord = syncedUser as CmsUserDoc;

      return {
        user: {
          ...userRecord,
          _strategy: `${CMS_USERS_SLUG}-${STRATEGY_NAME}`,
          collection: CMS_USERS_SLUG,
        },
      };
    },
  };
}
