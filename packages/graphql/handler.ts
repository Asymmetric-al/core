import {
  getAuthContext,
  requireAuth,
  requireRole,
  type AuthContext,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import {
  fetchUserPostInteractions,
  toUserPostInteractionSets,
} from "@asym/database/supabase/post-interactions";
import { createSchema, createYoga } from "graphql-yoga";
import { revalidateTag } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

interface GraphQLContext {
  auth: AuthContext;
  request: Request;
  supabaseAdmin: SupabaseClient;
}

function revalidatePostTags(postId: string, tenantId: string) {
  revalidateTag(`posts:tenant:${tenantId}`, "max");
  revalidateTag(`post:${postId}`, "max");
}

function resolveRequiredIdempotencyKeyFromHeaders(headers: Headers): string {
  const headerValue =
    headers.get("idempotency-key") ?? headers.get("x-idempotency-key");
  const idempotencyKey = headerValue?.trim() ?? "";
  if (idempotencyKey.length > 0) {
    return idempotencyKey;
  }

  throw new Error("Missing required idempotency-key header");
}

const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum UserRole {
    donor
    missionary
    admin
    staff
    super_admin
  }

  enum DonationStatus {
    pending
    processing
    completed
    failed
    refunded
  }

  type Profile {
    id: ID!
    tenantId: ID!
    userId: ID!
    role: UserRole!
    firstName: String!
    lastName: String!
    email: String!
    avatarUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Missionary {
    id: ID!
    tenantId: ID!
    profile: Profile!
    bio: String
    missionField: String
    fundingGoal: Int!
    currentFunding: Int!
    posts: [Post!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Donor {
    id: ID!
    tenantId: ID!
    profile: Profile!
    donations: [Donation!]!
    totalGiven: Int!
  }

  type Donation {
    id: ID!
    tenantId: ID!
    donor: Profile!
    missionary: Missionary!
    amount: Int!
    currency: String!
    status: DonationStatus!
    createdAt: DateTime!
  }

  type MediaItem {
    url: String!
    type: String!
    width: Int
    height: Int
  }

  type Post {
    id: ID!
    tenantId: ID!
    missionary: Missionary!
    content: String!
    media: [MediaItem!]!
    likeCount: Int!
    prayerCount: Int!
    commentCount: Int!
    userLiked: Boolean!
    userPrayed: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: ID!
    postId: ID!
    author: Profile!
    content: String!
    createdAt: DateTime!
  }

  type AuditLog {
    id: ID!
    tenantId: ID!
    userId: ID!
    action: String!
    resourceType: String!
    resourceId: ID
    details: String
    createdAt: DateTime!
  }

  type Query {
    me: Profile
    myProfile: Profile
    missionaries(limit: Int, offset: Int): [Missionary!]!
    missionary(id: ID!): Missionary
    posts(limit: Int, offset: Int): [Post!]!
    post(id: ID!): Post
    myDonations(limit: Int, offset: Int): [Donation!]!
    mySupporters(limit: Int, offset: Int): [Donation!]!
    auditLogs(limit: Int, offset: Int): [AuditLog!]!
  }

  input CreatePostInput {
    content: String!
    media: [MediaItemInput!]
  }

  input MediaItemInput {
    url: String!
    type: String!
    width: Int
    height: Int
  }

  input CreateDonationInput {
    missionaryId: ID!
    amount: Int!
    currency: String
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    avatarUrl: String
  }

  input UpdateMissionaryInput {
    bio: String
    missionField: String
    fundingGoal: Int
  }

  input UpdateUserRoleInput {
    userId: ID!
    role: UserRole!
  }

  type Mutation {
    updateMyProfile(input: UpdateProfileInput!): Profile!
    createPost(input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!
    prayForPost(postId: ID!): Boolean!
    unprayForPost(postId: ID!): Boolean!
    addComment(postId: ID!, content: String!): Comment!
    createDonation(input: CreateDonationInput!): Donation!
    updateMissionaryProfile(input: UpdateMissionaryInput!): Missionary!
    updateUserRole(input: UpdateUserRoleInput!): Profile!
  }
`;

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated) return null;
      const { data } = await ctx.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", ctx.auth.profileId)
        .single();
      return mapProfile(data);
    },

    myProfile: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      const { data } = await ctx.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();
      return mapProfile(data);
    },

    missionaries: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const { data } = await ctx.supabaseAdmin
        .from("missionaries")
        .select("*, profile:profiles!profile_id(*)")
        .eq("tenant_id", auth.tenantId)
        .range(offset, offset + limit - 1);

      return (data || []).map(mapMissionary);
    },

    missionary: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data } = await ctx.supabaseAdmin
        .from("missionaries")
        .select("*, profile:profiles!profile_id(*)")
        .eq("id", args.id)
        .eq("tenant_id", auth.tenantId)
        .single();

      return data ? mapMissionary(data) : null;
    },

    posts: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const { data: posts } = await ctx.supabaseAdmin
        .from("posts")
        .select(
          "*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const postIds = (posts || []).map((p: { id: string }) => p.id);
      const interactionRows = await fetchUserPostInteractions(
        ctx.supabaseAdmin,
        auth.userId,
        postIds,
      );
      const { likedPostIds, prayedPostIds } =
        toUserPostInteractionSets(interactionRows);

      return (posts || []).map((post: Record<string, unknown>) => ({
        ...mapPost(post),
        userLiked: likedPostIds.has(post.id as string),
        userPrayed: prayedPostIds.has(post.id as string),
      }));
    },

    post: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data: post } = await ctx.supabaseAdmin
        .from("posts")
        .select(
          "*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("id", args.id)
        .eq("tenant_id", auth.tenantId)
        .single();

      if (!post) return null;

      const interactionRows = await fetchUserPostInteractions(
        ctx.supabaseAdmin,
        auth.userId,
        [args.id],
      );
      const { likedPostIds, prayedPostIds } =
        toUserPostInteractionSets(interactionRows);

      return {
        ...mapPost(post),
        userLiked: likedPostIds.has(args.id),
        userPrayed: prayedPostIds.has(args.id),
      };
    },

    myDonations: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["donor", "admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const { data: donor } = await ctx.supabaseAdmin
        .from("donors")
        .select("id")
        .eq("profile_id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();
      if (!donor?.id) return [];

      const { data } = await ctx.supabaseAdmin
        .from("donations")
        .select(
          "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("donor_id", donor.id)
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return (data || []).map(mapDonation);
    },

    mySupporters: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["missionary", "admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const { data: missionary } = await ctx.supabaseAdmin
        .from("missionaries")
        .select("id")
        .eq("profile_id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();

      if (!missionary) return [];

      const { data } = await ctx.supabaseAdmin
        .from("donations")
        .select(
          "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("missionary_id", missionary.id)
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return (data || []).map(mapDonation);
    },

    auditLogs: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 50;
      const offset = args.offset || 0;

      const { data } = await ctx.supabaseAdmin
        .from("audit_logs")
        .select("*")
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return (data || []).map(mapAuditLog);
    },
  },

  Mutation: {
    updateMyProfile: async (
      _: unknown,
      args: {
        input: { firstName?: string; lastName?: string; avatarUrl?: string };
      },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (args.input.firstName) updates.first_name = args.input.firstName;
      if (args.input.lastName) updates.last_name = args.input.lastName;
      if (args.input.avatarUrl !== undefined)
        updates.avatar_url = args.input.avatarUrl;

      const { error: rpcError } = await ctx.supabaseAdmin.rpc(
        "atomic_update_profile_with_audit",
        {
          p_profile_id: auth.profileId,
          p_tenant_id: auth.tenantId,
          p_actor_user_id: auth.userId,
          p_updates: updates,
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (rpcError) {
        if (rpcError.code === "P0002") throw new Error("Profile not found");
        throw new Error(rpcError.message);
      }

      const { data, error } = await ctx.supabaseAdmin
        .from("profiles")
        .select()
        .eq("id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();
      if (error || !data)
        throw new Error(error?.message ?? "Profile not found");

      return mapProfile(data);
    },

    createPost: async (
      _: unknown,
      args: {
        input: {
          content: string;
          media?: Array<{
            url: string;
            type: string;
            width?: number;
            height?: number;
          }>;
        };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["missionary"]);
      const auth = ctx.auth as AuthenticatedContext;

      const { data: missionary } = await ctx.supabaseAdmin
        .from("missionaries")
        .select("id")
        .eq("profile_id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();

      if (!missionary) throw new Error("Missionary profile not found");

      const { data: rpcData, error: rpcError } = await ctx.supabaseAdmin.rpc(
        "atomic_create_post_with_audit",
        {
          p_tenant_id: auth.tenantId,
          p_missionary_id: missionary.id,
          p_content: args.input.content,
          p_media: args.input.media || [],
          p_actor_user_id: auth.userId,
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (rpcError) throw new Error(rpcError.message);

      const rpcResult = (rpcData ?? null) as { post_id?: string } | null;
      if (!rpcResult?.post_id) throw new Error("Failed to create post");

      const { data: post, error } = await ctx.supabaseAdmin
        .from("posts")
        .select(
          "*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("id", rpcResult.post_id)
        .single();

      if (error || !post) throw new Error(error?.message ?? "Post not found");

      revalidatePostTags(post.id, auth.tenantId);
      return { ...mapPost(post), userLiked: false, userPrayed: false };
    },

    deletePost: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["missionary", "admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;

      const { data: post } = await ctx.supabaseAdmin
        .from("posts")
        .select("*, missionary:missionaries!missionary_id(profile_id)")
        .eq("id", args.id)
        .eq("tenant_id", auth.tenantId)
        .single();

      if (!post) throw new Error("Post not found");
      if (
        auth.role !== "admin" &&
        auth.role !== "staff" &&
        auth.role !== "super_admin" &&
        (post.missionary as { profile_id?: string })?.profile_id !==
          auth.profileId
      ) {
        throw new Error("Not authorized to delete this post");
      }

      const { error } = await ctx.supabaseAdmin.rpc(
        "atomic_delete_post_with_audit",
        {
          p_post_id: args.id,
          p_tenant_id: auth.tenantId,
          p_actor_user_id: auth.userId,
          p_audit_action: "post_deleted",
          p_details: {},
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (error) throw new Error(error.message);

      revalidatePostTags(args.id, auth.tenantId);
      return true;
    },

    likePost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data, error } = await ctx.supabaseAdmin.rpc("atomic_like_post", {
        p_post_id: args.postId,
        p_user_id: auth.userId,
        p_tenant_id: auth.tenantId,
      });

      if (error) {
        if (error.code === "P0002") throw new Error("Post not found");
        throw new Error(error.message);
      }

      const result = (data ?? null) as { applied?: boolean } | null;
      if (result?.applied) {
        revalidatePostTags(args.postId, auth.tenantId);
      }

      return true;
    },

    unlikePost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data, error } = await ctx.supabaseAdmin.rpc(
        "atomic_unlike_post",
        {
          p_post_id: args.postId,
          p_user_id: auth.userId,
          p_tenant_id: auth.tenantId,
        },
      );

      if (error) {
        if (error.code === "P0002") throw new Error("Post not found");
        throw new Error(error.message);
      }

      const result = (data ?? null) as { applied?: boolean } | null;
      if (result?.applied) {
        revalidatePostTags(args.postId, auth.tenantId);
      }

      return true;
    },

    prayForPost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data, error } = await ctx.supabaseAdmin.rpc(
        "atomic_pray_for_post",
        {
          p_post_id: args.postId,
          p_user_id: auth.userId,
          p_tenant_id: auth.tenantId,
        },
      );

      if (error) {
        if (error.code === "P0002") throw new Error("Post not found");
        throw new Error(error.message);
      }

      const result = (data ?? null) as { applied?: boolean } | null;
      if (result?.applied) {
        revalidatePostTags(args.postId, auth.tenantId);
      }

      return true;
    },

    unprayForPost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data, error } = await ctx.supabaseAdmin.rpc(
        "atomic_unpray_for_post",
        {
          p_post_id: args.postId,
          p_user_id: auth.userId,
          p_tenant_id: auth.tenantId,
        },
      );

      if (error) {
        if (error.code === "P0002") throw new Error("Post not found");
        throw new Error(error.message);
      }

      const result = (data ?? null) as { applied?: boolean } | null;
      if (result?.applied) {
        revalidatePostTags(args.postId, auth.tenantId);
      }

      return true;
    },

    addComment: async (
      _: unknown,
      args: { postId: string; content: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const { data: rpcData, error: rpcError } = await ctx.supabaseAdmin.rpc(
        "atomic_add_post_comment",
        {
          p_post_id: args.postId,
          p_user_id: auth.userId,
          p_tenant_id: auth.tenantId,
          p_content: args.content,
        },
      );

      if (rpcError) {
        if (rpcError.code === "P0002") throw new Error("Post not found");
        throw new Error(rpcError.message);
      }

      const rpcResult = (rpcData ?? null) as { comment_id?: string } | null;
      if (!rpcResult?.comment_id) {
        throw new Error("Failed to create comment");
      }

      const { data: comment, error } = await ctx.supabaseAdmin
        .from("post_comments")
        .select("*, author:profiles!user_id(*)")
        .eq("id", rpcResult.comment_id)
        .single();

      if (error || !comment)
        throw new Error(error?.message ?? "Comment not found");

      revalidatePostTags(args.postId, auth.tenantId);
      return mapComment(comment);
    },

    createDonation: async (
      _: unknown,
      args: {
        input: { missionaryId: string; amount: number; currency?: string };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["donor", "admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;
      const idempotencyKey = resolveRequiredIdempotencyKeyFromHeaders(
        ctx.request.headers,
      );

      const { data: beginRaw, error: beginError } = await ctx.supabaseAdmin.rpc(
        "begin_donation_saga",
        {
          p_tenant_id: auth.tenantId,
          p_profile_id: auth.profileId,
          p_actor_user_id: auth.userId,
          p_missionary_id: args.input.missionaryId,
          p_amount: args.input.amount,
          p_currency: (args.input.currency || "usd").toLowerCase(),
          p_fund_id: null,
          p_idempotency_key: idempotencyKey,
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (beginError) {
        if (beginError.code === "P0002")
          throw new Error("Missionary not found");
        throw new Error(beginError.message);
      }

      const beginResult = (beginRaw ?? null) as { donation_id?: string } | null;
      if (!beginResult?.donation_id) {
        throw new Error("Failed to create donation");
      }

      const { data: donation, error } = await ctx.supabaseAdmin
        .from("donations")
        .select(
          "*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))",
        )
        .eq("id", beginResult.donation_id)
        .single();
      if (error || !donation)
        throw new Error(error?.message ?? "Donation not found");

      return mapDonation(donation);
    },

    updateMissionaryProfile: async (
      _: unknown,
      args: {
        input: { bio?: string; missionField?: string; fundingGoal?: number };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["missionary"]);
      const auth = ctx.auth as AuthenticatedContext;

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (args.input.bio !== undefined) updates.bio = args.input.bio;
      if (args.input.missionField !== undefined)
        updates.mission_field = args.input.missionField;
      if (args.input.fundingGoal !== undefined)
        updates.funding_goal = args.input.fundingGoal;

      const { error: rpcError } = await ctx.supabaseAdmin.rpc(
        "atomic_update_missionary_with_audit",
        {
          p_profile_id: auth.profileId,
          p_tenant_id: auth.tenantId,
          p_actor_user_id: auth.userId,
          p_updates: updates,
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (rpcError) {
        if (rpcError.code === "P0002") throw new Error("Missionary not found");
        throw new Error(rpcError.message);
      }

      const { data, error } = await ctx.supabaseAdmin
        .from("missionaries")
        .select("*, profile:profiles!profile_id(*)")
        .eq("profile_id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();
      if (error || !data)
        throw new Error(error?.message ?? "Missionary not found");

      return mapMissionary(data);
    },

    updateUserRole: async (
      _: unknown,
      args: {
        input: {
          userId: string;
          role: "donor" | "missionary" | "admin" | "staff" | "super_admin";
        };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx.auth, ["admin", "staff", "super_admin"]);
      const auth = ctx.auth as AuthenticatedContext;

      const { error: rpcError } = await ctx.supabaseAdmin.rpc(
        "atomic_update_user_role_with_audit",
        {
          p_profile_id: args.input.userId,
          p_tenant_id: auth.tenantId,
          p_actor_user_id: auth.userId,
          p_new_role: args.input.role,
          p_ip_address: ctx.request.headers.get("x-forwarded-for"),
          p_user_agent: ctx.request.headers.get("user-agent"),
        },
      );
      if (rpcError) {
        if (rpcError.code === "P0002") throw new Error("User not found");
        throw new Error(rpcError.message);
      }

      const { data, error } = await ctx.supabaseAdmin
        .from("profiles")
        .select()
        .eq("id", args.input.userId)
        .eq("tenant_id", auth.tenantId)
        .single();
      if (error || !data) throw new Error(error?.message ?? "User not found");

      return mapProfile(data);
    },
  },
};

function mapProfile(data: Record<string, unknown> | null) {
  if (!data) return null;
  return {
    id: data.id,
    tenantId: data.tenant_id,
    userId: data.user_id,
    role: data.role,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapMissionary(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    profile: mapProfile(data.profile as Record<string, unknown>),
    bio: data.bio,
    missionField: data.mission_field,
    fundingGoal: data.funding_goal,
    currentFunding: data.current_funding,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    posts: [],
  };
}

function mapPost(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    missionary: data.missionary
      ? mapMissionary(data.missionary as Record<string, unknown>)
      : null,
    content: data.content,
    media: data.media || [],
    likeCount: data.like_count,
    prayerCount: data.prayer_count,
    commentCount: data.comment_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapDonation(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    donor: mapProfile(data.donor as Record<string, unknown>),
    missionary: data.missionary
      ? mapMissionary(data.missionary as Record<string, unknown>)
      : null,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    createdAt: data.created_at,
  };
}

function mapComment(data: Record<string, unknown>) {
  return {
    id: data.id,
    postId: data.post_id,
    author: mapProfile(data.author as Record<string, unknown>),
    content: data.content,
    createdAt: data.created_at,
  };
}

function mapAuditLog(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    userId: data.user_id,
    action: data.action,
    resourceType: data.resource_type,
    resourceId: data.resource_id,
    details: data.details ? JSON.stringify(data.details) : null,
    createdAt: data.created_at,
  };
}

export function createGraphQLHandler() {
  const yoga = createYoga<{ request: Request }>({
    schema: createSchema({ typeDefs, resolvers }),
    graphqlEndpoint: "/api/graphql",
    fetchAPI: { Response },
    context: async ({ request }) => {
      const auth = await getAuthContext(request);
      const { client: supabaseAdmin, error } = getAdminClient();
      if (!supabaseAdmin) {
        throw new Error(error);
      }
      return { auth, request, supabaseAdmin };
    },
  });

  function adminUnavailableResponse() {
    const { client, error } = getAdminClient();
    if (client) return null;
    return new Response(JSON.stringify({ error }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  return {
    async GET(request: Request) {
      const unavailable = adminUnavailableResponse();
      if (unavailable) return unavailable;
      return yoga.handle(request, { request });
    },
    async POST(request: Request) {
      const unavailable = adminUnavailableResponse();
      if (unavailable) return unavailable;
      return yoga.handle(request, { request });
    },
    async OPTIONS(request: Request) {
      const unavailable = adminUnavailableResponse();
      if (unavailable) return unavailable;
      return yoga.handle(request, { request });
    },
  };
}
