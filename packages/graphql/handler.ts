import { parseRequiredIdempotencyKey } from "@asym/api/donate/idempotency";
import {
  callerGiftMismatches,
  DONATION_WITH_PARTIES_SELECT,
  SUPPORTER_DONATION_SELECT,
} from "@asym/api/donations/select";
import { isAnonymousToRecipient } from "@asym/api/missionary-portal/redaction";
import { CACHE_TAGS, revalidateTags } from "@asym/api/shared/cache-tags";
import { findOwnDonor, type OwnDonorLookup } from "@asym/api/shared/queries";
import { createRequestSessionClient } from "@asym/api/shared/request-session-client";
import {
  getAuthContext,
  hasContextRoleClass,
  requestScopeOf,
  requireAuth,
  requireCapability,
  requireRoleClass,
  type AuthContext,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import {
  fetchUserPostInteractions,
  toUserPostInteractionSets,
} from "@asym/database/supabase/post-interactions";
import { createGraphQLError, createSchema, createYoga } from "graphql-yoga";

import { beginGraphQLGiftIntake } from "./gift-intake";
import {
  addGraphQLMinistryUpdateComment,
  applyGraphQLMinistryUpdateReaction,
} from "./ministry-update-engagement";

import type { SupabaseClient } from "@supabase/supabase-js";

interface GraphQLContext {
  auth: AuthContext;
  request: Request;
  supabaseAdmin: SupabaseClient;
}

function revalidatePostTags(postId: string) {
  revalidateTags([CACHE_TAGS.post(postId)]);
}

const POST_MISSIONARY_SELECT =
  "id, missionary:missionaries!missionary_id(id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url))";

const POST_COLUMNS =
  "id, tenant_id, content, media, like_count, prayer_count, comment_count, created_at, updated_at, worker_withheld";

async function postsReadByCaller(
  ctx: GraphQLContext,
  auth: AuthenticatedContext,
) {
  return createRequestSessionClient(ctx.request, requestScopeOf(auth));
}

async function requireReadablePost(
  ctx: GraphQLContext,
  auth: AuthenticatedContext,
  postId: string,
) {
  const session = await postsReadByCaller(ctx, auth);
  const { data, error } = await session
    .from("posts")
    .select("id")
    .eq("id", postId)
    .eq("tenant_id", auth.tenantId)
    .maybeSingle();
  if (error || !data)
    throw createGraphQLError("Post not found", {
      extensions: { code: "POST_NOT_FOUND" },
    });
}

async function withPostMissionaries(
  supabaseAdmin: SupabaseClient,
  posts: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  if (posts.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select(POST_MISSIONARY_SELECT)
    .in(
      "id",
      posts.map((post) => post.id as string),
    );
  if (error) throw new Error(error.message);
  const missionaries = new Map(
    ((data ?? []) as { id: string; missionary?: unknown }[]).map((row) => [
      row.id,
      row.missionary ?? null,
    ]),
  );
  return posts.map((post) => ({
    ...post,
    missionary:
      post.worker_withheld === true
        ? null
        : (missionaries.get(post.id as string) ?? null),
  }));
}

function yogaRpc(supabaseAdmin: SupabaseClient) {
  // Generated Supabase RPC overloads are not assignable to the structural
  // command client; narrow the wrap here instead of leaking `any` into adapters.
  return async (fn: string, rpcArgs: Record<string, unknown>) => {
    const response = await supabaseAdmin.rpc(fn as never, rpcArgs as never);
    return { data: response.data, error: response.error };
  };
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

  type WorkerProfile {
    id: ID!
    avatarUrl: String
  }

  type Missionary {
    id: ID!
    tenantId: ID!
    publicName: String
    profile: WorkerProfile
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
    donor: Profile
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
    missionary: Missionary
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

  """
  There is no role mutation (AL-2675, WP2c). A member's class never changes:
  the command lane's public.change_membership_role changes only a staff row's
  sub-role and tenant-administrator flag, a membership of another class is
  given by an invitation, and public.revoke_membership ends a membership
  (plan 5.4).
  """
  type Mutation {
    updateMyProfile(input: UpdateProfileInput!): Profile!
    deletePost(id: ID!): Boolean!
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!
    prayForPost(postId: ID!): Boolean!
    unprayForPost(postId: ID!): Boolean!
    addComment(postId: ID!, content: String!): Comment!
    createDonation(input: CreateDonationInput!): Donation!
    updateMissionaryProfile(input: UpdateMissionaryInput!): Missionary!
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
      return mapProfile(data, ctx.auth);
    },

    myProfile: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      // The caller's own profile; the tenant is the resolved assignment's
      // (AL-2675, NR-68).
      const { data } = await ctx.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", auth.profileId)
        .single();
      return mapProfile(data, auth);
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
        .select(
          "id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url)",
        )
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
        .select(
          "id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url)",
        )
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

      const session = await postsReadByCaller(ctx, auth);
      const { data: rows, error } = await session
        .from("posts")
        .select(POST_COLUMNS)
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(error.message);
      const posts = await withPostMissionaries(
        ctx.supabaseAdmin,
        (rows ?? []) as Record<string, unknown>[],
      );

      const postIds = posts.map((p) => p.id as string);
      const interactionRows = await fetchUserPostInteractions(
        session,
        auth.userId,
        postIds,
      );
      const { likedPostIds, prayedPostIds } =
        toUserPostInteractionSets(interactionRows);

      return posts.map((post) => ({
        ...mapPost(post),
        userLiked: likedPostIds.has(post.id as string),
        userPrayed: prayedPostIds.has(post.id as string),
      }));
    },

    post: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;

      const session = await postsReadByCaller(ctx, auth);
      const { data: row } = await session
        .from("posts")
        .select(POST_COLUMNS)
        .eq("id", args.id)
        .eq("tenant_id", auth.tenantId)
        .maybeSingle();

      if (!row) return null;
      const [post] = await withPostMissionaries(ctx.supabaseAdmin, [
        row as Record<string, unknown>,
      ]);
      if (!post) return null;

      const interactionRows = await fetchUserPostInteractions(
        session,
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
      requireRoleClass(ctx.auth, ["donor", "staff"]);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      let lookup: OwnDonorLookup<{ id: string }>;
      try {
        lookup = await findOwnDonor(ctx.supabaseAdmin, {
          userId: auth.userId,
          tenantId: auth.tenantId,
        });
      } catch (donorError) {
        throw donationsQueryFailed("Donor lookup", donorError);
      }
      if (lookup.status === "multiple") {
        throw createGraphQLError("Multiple donor records for this account", {
          extensions: { code: "MULTIPLE_DONORS" },
        });
      }
      if (lookup.status === "none") return [];
      const donor = lookup.donor;

      const { data, error } = await ctx.supabaseAdmin
        .from("donations")
        .select(DONATION_WITH_PARTIES_SELECT)
        .eq("donor_id", donor.id)
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw donationsQueryFailed("Donations query", error);

      return data.map(mapDonation);
    },

    mySupporters: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireRoleClass(ctx.auth, ["missionary", "staff"]);
      const auth = ctx.auth as AuthenticatedContext;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      // More than one missionary row for this profile is an error, not a guess.
      const { data: missionary, error: missionaryError } =
        await ctx.supabaseAdmin
          .from("missionaries")
          .select("id")
          .eq("profile_id", auth.profileId)
          .eq("tenant_id", auth.tenantId)
          .maybeSingle();
      if (missionaryError) {
        throw donationsQueryFailed("Missionary lookup", missionaryError);
      }
      if (!missionary) return [];

      const { data, error } = await ctx.supabaseAdmin
        .from("donations")
        .select(SUPPORTER_DONATION_SELECT)
        .eq("missionary_id", missionary.id)
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw donationsQueryFailed("Donations query", error);

      return (data as unknown as Record<string, unknown>[]).map(
        mapSupporterDonation,
      );
    },

    auditLogs: async (
      _: unknown,
      args: { limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireCapability(ctx.auth, "admin.dashboard.access");
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

      // The caller's own profile (AL-2675, NR-68).
      const { data, error } = await ctx.supabaseAdmin
        .from("profiles")
        .select()
        .eq("id", auth.profileId)
        .single();
      if (error || !data)
        throw new Error(error?.message ?? "Profile not found");

      return mapProfile(data, auth);
    },

    deletePost: async (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      requireRoleClass(ctx.auth, ["missionary", "staff"]);
      const auth = ctx.auth as AuthenticatedContext;

      const { data: post } = await ctx.supabaseAdmin
        .from("posts")
        .select("*, missionary:missionaries!missionary_id(profile_id)")
        .eq("id", args.id)
        .eq("tenant_id", auth.tenantId)
        .single();

      if (!post) throw new Error("Post not found");
      if (
        !hasContextRoleClass(auth, "staff") &&
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

      revalidatePostTags(args.id);
      return true;
    },

    likePost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      await requireReadablePost(ctx, auth, args.postId);

      return applyGraphQLMinistryUpdateReaction({
        rpc: yogaRpc(ctx.supabaseAdmin),
        kind: "like",
        postId: args.postId,
        userId: auth.userId,
        tenantId: auth.tenantId,
      });
    },

    unlikePost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      await requireReadablePost(ctx, auth, args.postId);

      return applyGraphQLMinistryUpdateReaction({
        rpc: yogaRpc(ctx.supabaseAdmin),
        kind: "unlike",
        postId: args.postId,
        userId: auth.userId,
        tenantId: auth.tenantId,
      });
    },

    prayForPost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      await requireReadablePost(ctx, auth, args.postId);

      return applyGraphQLMinistryUpdateReaction({
        rpc: yogaRpc(ctx.supabaseAdmin),
        kind: "pray",
        postId: args.postId,
        userId: auth.userId,
        tenantId: auth.tenantId,
      });
    },

    unprayForPost: async (
      _: unknown,
      args: { postId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      await requireReadablePost(ctx, auth, args.postId);

      return applyGraphQLMinistryUpdateReaction({
        rpc: yogaRpc(ctx.supabaseAdmin),
        kind: "unpray",
        postId: args.postId,
        userId: auth.userId,
        tenantId: auth.tenantId,
      });
    },

    addComment: async (
      _: unknown,
      args: { postId: string; content: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx.auth);
      const auth = ctx.auth as AuthenticatedContext;
      await requireReadablePost(ctx, auth, args.postId);

      const commentId = await addGraphQLMinistryUpdateComment({
        rpc: yogaRpc(ctx.supabaseAdmin),
        postId: args.postId,
        userId: auth.userId,
        tenantId: auth.tenantId,
        content: args.content,
      });

      const { data: comment, error } = await ctx.supabaseAdmin
        .from("post_comments")
        .select("id, post_id, user_id, content, created_at")
        .eq("id", commentId)
        .single();

      if (error || !comment)
        throw new Error(error?.message ?? "Comment not found");

      const { data: author, error: authorError } = await ctx.supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", auth.profileId)
        .single();

      if (authorError || !author)
        throw createGraphQLError("Comment author not found", {
          extensions: { code: "COMMENT_AUTHOR_NOT_FOUND" },
        });

      revalidatePostTags(args.postId);
      return mapComment(comment, author, auth);
    },

    createDonation: async (
      _: unknown,
      args: {
        input: { missionaryId: string; amount: number; currency?: string };
      },
      ctx: GraphQLContext,
    ) => {
      requireRoleClass(ctx.auth, ["donor", "staff"]);
      const auth = ctx.auth as AuthenticatedContext;
      const idempotencyKey = parseRequiredIdempotencyKey(ctx.request.headers);
      if (!idempotencyKey) {
        throw new Error("Missing required idempotency-key header");
      }

      const currency = (args.input.currency || "usd").toLowerCase();
      const begin = await beginGraphQLGiftIntake({
        rpc: yogaRpc(ctx.supabaseAdmin),
        tenantId: auth.tenantId,
        profileId: auth.profileId,
        actorUserId: auth.userId,
        missionaryId: args.input.missionaryId,
        amountCents: args.input.amount,
        currency,
        idempotencyKey,
        ipAddress: ctx.request.headers.get("x-forwarded-for"),
        userAgent: ctx.request.headers.get("user-agent"),
      });

      const { data: donation, error } = await ctx.supabaseAdmin
        .from("donations")
        .select(DONATION_WITH_PARTIES_SELECT)
        .eq("id", begin.donationId)
        .eq("tenant_id", auth.tenantId)
        .single();
      // The gift already exists, so tell the client it was created rather than
      // masking this as a failure that invites a retry under a new key. On a
      // replay the id may be another donor's gift, so it is not returned.
      if (error || !donation) {
        console.error("[graphql] Donation read-back failed", {
          donationId: begin.donationId,
          replayed: begin.replayed,
          error,
        });
        throw createGraphQLError(
          "Donation was created but could not be read back",
          {
            extensions: {
              code: "DONATION_READBACK_FAILED",
              ...(begin.replayed ? {} : { donationId: begin.donationId }),
            },
          },
        );
      }
      // A replayed idempotency key can resolve to another donor's gift or a
      // different payload. Return none of its data.
      const mismatched = await callerGiftMismatches(
        ctx.supabaseAdmin,
        donation,
        {
          profileId: auth.profileId,
          amountCents: args.input.amount,
          currency,
          missionaryId: args.input.missionaryId,
          fundId: null,
        },
        { userId: auth.userId, tenantId: auth.tenantId },
      );
      if (mismatched.length > 0) {
        console.error(
          "[graphql] Idempotency key replay does not match request",
          {
            donationId: begin.donationId,
            callerProfileId: auth.profileId,
            mismatched,
          },
        );
        throw createGraphQLError("Idempotency key already used", {
          extensions: { code: "IDEMPOTENCY_KEY_REUSED" },
        });
      }

      return mapDonation(donation);
    },

    updateMissionaryProfile: async (
      _: unknown,
      args: {
        input: { bio?: string; missionField?: string; fundingGoal?: number };
      },
      ctx: GraphQLContext,
    ) => {
      requireRoleClass(ctx.auth, ["missionary"]);
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
        .select(
          "id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url)",
        )
        .eq("profile_id", auth.profileId)
        .eq("tenant_id", auth.tenantId)
        .single();
      if (error || !data)
        throw new Error(error?.message ?? "Missionary not found");

      return mapMissionary(data);
    },
  },
};

/**
 * A profile. Given a scope (the caller's own profile, or a member found by
 * membership), the tenant and role are that membership's, never the
 * profile's own columns, which are no authority since AL-2675. Nested
 * display profiles keep the columns.
 */
function mapProfile(
  data: Record<string, unknown> | null,
  scope?: { tenantId: string | null; role: string | null },
) {
  if (!data) return null;
  return {
    id: data.id,
    tenantId: scope ? scope.tenantId : data.tenant_id,
    userId: data.user_id,
    role: scope ? scope.role : data.role,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapWorkerProfile(data: Record<string, unknown> | null) {
  if (!data) return null;
  return { id: data.id, avatarUrl: data.avatar_url };
}

function mapMissionary(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    publicName: data.worker_public_name ?? null,
    profile: mapWorkerProfile(
      (data.profile as Record<string, unknown> | null) ?? null,
    ),
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

/** Logs the PostgREST error and returns a generic, unmasked GraphQL error. */
function donationsQueryFailed(step: string, error: unknown) {
  console.error(`[graphql] ${step} failed`, error);
  return createGraphQLError("Failed to load donations", {
    extensions: { code: "DONATIONS_QUERY_FAILED" },
  });
}

/** `donor` is the donor's profile, or null for a guest donor without one. */
function mapDonation(data: Record<string, unknown>) {
  const donor = data.donor as { profile?: Record<string, unknown> } | null;
  return {
    id: data.id,
    tenantId: data.tenant_id,
    donor: mapProfile(donor?.profile ?? null),
    missionary: data.missionary
      ? mapMissionary(data.missionary as Record<string, unknown>)
      : null,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    createdAt: data.created_at,
  };
}

function mapSupporterDonation(data: Record<string, unknown>) {
  const donor = ((Array.isArray(data.donor) ? data.donor[0] : data.donor) ??
    null) as {
    giving_preferences?: unknown;
    donor_is_restricted_party?: unknown;
    profile?: Record<string, unknown> | null;
  } | null;
  const hidden =
    !donor ||
    isAnonymousToRecipient({
      givingPreferences: donor.giving_preferences,
      restrictedParty: donor.donor_is_restricted_party,
    });
  return {
    ...mapDonation(data),
    donor: hidden ? null : mapProfile(donor.profile ?? null),
  };
}

function mapComment(
  data: Record<string, unknown>,
  author: Record<string, unknown>,
  scope: { tenantId: string | null; role: string | null },
) {
  return {
    id: data.id,
    postId: data.post_id,
    author: mapProfile(author, scope),
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
