import { createSchema, createYoga } from 'graphql-yoga'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, requireRole, type AuthContext, type AuthenticatedContext } from '@/lib/auth/context'
import { createAuditLogger } from '@/lib/audit/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GraphQLContext {
  auth: AuthContext
  request: Request
}

const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum UserRole {
    donor
    missionary
    admin
  }

  enum DonationStatus {
    pending
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
`

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated) return null
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', ctx.auth.profileId)
        .single()
      return mapProfile(data)
    },

    myProfile: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .single()
      return mapProfile(data)
    },

    missionaries: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext
      const limit = args.limit || 20
      const offset = args.offset || 0

      const { data } = await supabaseAdmin
        .from('missionaries')
        .select('*, profile:profiles!profile_id(*)')
        .eq('tenant_id', auth.tenantId)
        .range(offset, offset + limit - 1)

      return (data || []).map(mapMissionary)
    },

    missionary: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { data } = await supabaseAdmin
        .from('missionaries')
        .select('*, profile:profiles!profile_id(*)')
        .eq('id', args.id)
        .eq('tenant_id', auth.tenantId)
        .single()

      return data ? mapMissionary(data) : null
    },

    posts: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext
      const limit = args.limit || 20
      const offset = args.offset || 0

      const { data: posts } = await supabaseAdmin
        .from('posts')
        .select('*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .eq('tenant_id', auth.tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const postIds = (posts || []).map((p: { id: string }) => p.id)
      const { data: likes } = await supabaseAdmin
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', auth.userId)

      const { data: prayers } = await supabaseAdmin
        .from('post_prayers')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', auth.userId)

      const likedSet = new Set((likes || []).map((l: { post_id: string }) => l.post_id))
      const prayedSet = new Set((prayers || []).map((p: { post_id: string }) => p.post_id))

      return (posts || []).map((post: Record<string, unknown>) => ({
        ...mapPost(post),
        userLiked: likedSet.has(post.id as string),
        userPrayed: prayedSet.has(post.id as string),
      }))
    },

    post: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .eq('id', args.id)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!post) return null

      const { data: like } = await supabaseAdmin
        .from('post_likes')
        .select('id')
        .eq('post_id', args.id)
        .eq('user_id', auth.userId)
        .single()

      const { data: prayer } = await supabaseAdmin
        .from('post_prayers')
        .select('id')
        .eq('post_id', args.id)
        .eq('user_id', auth.userId)
        .single()

      return {
        ...mapPost(post),
        userLiked: !!like,
        userPrayed: !!prayer,
      }
    },

    myDonations: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['donor', 'admin'])
      const auth = ctx.auth as AuthenticatedContext
      const limit = args.limit || 20
      const offset = args.offset || 0

      const { data } = await supabaseAdmin
        .from('donations')
        .select('*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .eq('donor_id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return (data || []).map(mapDonation)
    },

    mySupporters: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['missionary', 'admin'])
      const auth = ctx.auth as AuthenticatedContext
      const limit = args.limit || 20
      const offset = args.offset || 0

      const { data: missionary } = await supabaseAdmin
        .from('missionaries')
        .select('id')
        .eq('profile_id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!missionary) return []

      const { data } = await supabaseAdmin
        .from('donations')
        .select('*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .eq('missionary_id', missionary.id)
        .eq('tenant_id', auth.tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return (data || []).map(mapDonation)
    },

    auditLogs: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['admin'])
      const auth = ctx.auth as AuthenticatedContext
      const limit = args.limit || 50
      const offset = args.offset || 0

      const { data } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', auth.tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return (data || []).map(mapAuditLog)
    },
  },

  Mutation: {
    updateMyProfile: async (_: unknown, args: { input: { firstName?: string; lastName?: string; avatarUrl?: string } }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (args.input.firstName) updates.first_name = args.input.firstName
      if (args.input.lastName) updates.last_name = args.input.lastName
      if (args.input.avatarUrl !== undefined) updates.avatar_url = args.input.avatarUrl

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      await audit.log('profile_updated', 'profile', auth.profileId, args.input)
      return mapProfile(data)
    },

    createPost: async (_: unknown, args: { input: { content: string; media?: Array<{ url: string; type: string; width?: number; height?: number }> } }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['missionary'])
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const { data: missionary } = await supabaseAdmin
        .from('missionaries')
        .select('id')
        .eq('profile_id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!missionary) throw new Error('Missionary profile not found')

      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .insert({
          tenant_id: auth.tenantId,
          missionary_id: missionary.id,
          content: args.input.content,
          media: args.input.media || [],
        })
        .select('*, missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .single()

      if (error) throw new Error(error.message)

      await audit.logPost(post.id, 'post_created')
      return { ...mapPost(post), userLiked: false, userPrayed: false }
    },

    deletePost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['missionary', 'admin'])
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('*, missionary:missionaries!missionary_id(profile_id)')
        .eq('id', args.id)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!post) throw new Error('Post not found')
      if (auth.role !== 'admin' && post.missionary?.profile_id !== auth.profileId) {
        throw new Error('Not authorized to delete this post')
      }

      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', args.id)
        .eq('tenant_id', auth.tenantId)

      if (error) throw new Error(error.message)

      await audit.logPost(args.id, 'post_deleted')
      return true
    },

    likePost: async (_: unknown, args: { postId: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('id', args.postId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!post) throw new Error('Post not found')

      await supabaseAdmin.from('post_likes').upsert({ post_id: args.postId, user_id: auth.userId }, { onConflict: 'post_id,user_id' })
      await supabaseAdmin.rpc('increment_post_like_count', { post_id: args.postId })
      return true
    },

    unlikePost: async (_: unknown, args: { postId: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { error } = await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', args.postId)
        .eq('user_id', auth.userId)

      if (!error) await supabaseAdmin.rpc('decrement_post_like_count', { post_id: args.postId })
      return true
    },

    prayForPost: async (_: unknown, args: { postId: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('id', args.postId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!post) throw new Error('Post not found')

      await supabaseAdmin.from('post_prayers').upsert({ post_id: args.postId, user_id: auth.userId }, { onConflict: 'post_id,user_id' })
      await supabaseAdmin.rpc('increment_post_prayer_count', { post_id: args.postId })
      return true
    },

    unprayForPost: async (_: unknown, args: { postId: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { error } = await supabaseAdmin
        .from('post_prayers')
        .delete()
        .eq('post_id', args.postId)
        .eq('user_id', auth.userId)

      if (!error) await supabaseAdmin.rpc('decrement_post_prayer_count', { post_id: args.postId })
      return true
    },

    addComment: async (_: unknown, args: { postId: string; content: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.auth)
      const auth = ctx.auth as AuthenticatedContext

      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('id', args.postId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!post) throw new Error('Post not found')

      const { data: comment, error } = await supabaseAdmin
        .from('post_comments')
        .insert({ post_id: args.postId, user_id: auth.userId, content: args.content })
        .select('*, author:profiles!user_id(*)')
        .single()

      if (error) throw new Error(error.message)

      await supabaseAdmin.rpc('increment_post_comment_count', { post_id: args.postId })
      return mapComment(comment)
    },

    createDonation: async (_: unknown, args: { input: { missionaryId: string; amount: number; currency?: string } }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['donor', 'admin'])
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const { data: missionary } = await supabaseAdmin
        .from('missionaries')
        .select('id')
        .eq('id', args.input.missionaryId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!missionary) throw new Error('Missionary not found')

      const { data: donation, error } = await supabaseAdmin
        .from('donations')
        .insert({
          tenant_id: auth.tenantId,
          donor_id: auth.profileId,
          missionary_id: args.input.missionaryId,
          amount: args.input.amount,
          currency: args.input.currency || 'usd',
          status: 'pending',
        })
        .select('*, donor:profiles!donor_id(*), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))')
        .single()

      if (error) throw new Error(error.message)

      await audit.logDonation(donation.id, 'donation_created', { amount: args.input.amount, missionaryId: args.input.missionaryId })
      return mapDonation(donation)
    },

    updateMissionaryProfile: async (_: unknown, args: { input: { bio?: string; missionField?: string; fundingGoal?: number } }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['missionary'])
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (args.input.bio !== undefined) updates.bio = args.input.bio
      if (args.input.missionField !== undefined) updates.mission_field = args.input.missionField
      if (args.input.fundingGoal !== undefined) updates.funding_goal = args.input.fundingGoal

      const { data, error } = await supabaseAdmin
        .from('missionaries')
        .update(updates)
        .eq('profile_id', auth.profileId)
        .eq('tenant_id', auth.tenantId)
        .select('*, profile:profiles!profile_id(*)')
        .single()

      if (error) throw new Error(error.message)

      await audit.log('update', 'missionary', data.id, args.input)
      return mapMissionary(data)
    },

    updateUserRole: async (_: unknown, args: { input: { userId: string; role: 'donor' | 'missionary' | 'admin' } }, ctx: GraphQLContext) => {
      requireRole(ctx.auth, ['admin'])
      const auth = ctx.auth as AuthenticatedContext
      const audit = createAuditLogger(auth, ctx.request)

      const { data: targetProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', args.input.userId)
        .eq('tenant_id', auth.tenantId)
        .single()

      if (!targetProfile) throw new Error('User not found')

      const oldRole = targetProfile.role

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ role: args.input.role, updated_at: new Date().toISOString() })
        .eq('id', args.input.userId)
        .eq('tenant_id', auth.tenantId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      await audit.logRoleChange(args.input.userId, oldRole, args.input.role)
      return mapProfile(data)
    },
  },
}

function mapProfile(data: Record<string, unknown> | null) {
  if (!data) return null
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
  }
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
  }
}

function mapPost(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    missionary: data.missionary ? mapMissionary(data.missionary as Record<string, unknown>) : null,
    content: data.content,
    media: data.media || [],
    likeCount: data.like_count,
    prayerCount: data.prayer_count,
    commentCount: data.comment_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapDonation(data: Record<string, unknown>) {
  return {
    id: data.id,
    tenantId: data.tenant_id,
    donor: mapProfile(data.donor as Record<string, unknown>),
    missionary: data.missionary ? mapMissionary(data.missionary as Record<string, unknown>) : null,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    createdAt: data.created_at,
  }
}

function mapComment(data: Record<string, unknown>) {
  return {
    id: data.id,
    postId: data.post_id,
    author: mapProfile(data.author as Record<string, unknown>),
    content: data.content,
    createdAt: data.created_at,
  }
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
  }
}

const yoga = createYoga<{ request: Request }>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  context: async ({ request }) => ({
    auth: await getAuthContext(),
    request,
  }),
})

export async function GET(request: Request) {
  return yoga.handle(request, { request })
}

export async function POST(request: Request) {
  return yoga.handle(request, { request })
}

export async function OPTIONS(request: Request) {
  return yoga.handle(request, { request })
}
