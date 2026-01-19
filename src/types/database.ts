/**
 * MULTI-TENANCY APPROACH
 *
 * asymmetric.al Platform uses Row Level Security (RLS) with tenant_id for data isolation.
 *
 * Architecture:
 * - All tenant-scoped tables include a `tenant_id` column (UUID)
 * - Supabase RLS policies enforce tenant isolation at the database level
 * - The user's tenant_id is stored in their JWT claims (via auth.users metadata)
 * - All queries are automatically filtered by tenant_id via RLS policies
 *
 * Example RLS Policy (to be created in Supabase):
 * ```sql
 * CREATE POLICY "Users can only view their tenant's data"
 * ON public.donations
 * FOR SELECT
 * USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
 * ```
 *
 * Benefits:
 * - Data isolation enforced at database layer (not application layer)
 * - Single database, single schema (simpler operations)
 * - Automatic filtering on all queries
 * - No risk of cross-tenant data leaks from application bugs
 */

export type UserRole = "donor" | "missionary" | "admin" | "super_admin";
export type DonationStatus = "pending" | "completed" | "failed" | "refunded";
export type GivingFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Profile {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type OrgPostVisibility = "all_donors" | "followers_only";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  org_post_visibility: OrgPostVisibility;
  org_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DonorFeedPreferences {
  id: string;
  donor_id: string;
  tenant_id: string;
  show_org_posts: boolean;
  show_missionary_posts: boolean;
  follow_org: boolean;
  email_org_posts: boolean;
  email_missionary_posts: boolean;
  push_org_posts: boolean;
  push_missionary_posts: boolean;
  created_at: string;
  updated_at: string;
}

export interface Missionary {
  id: string;
  tenant_id: string;
  profile_id: string;
  bio: string | null;
  mission_field: string | null;
  funding_goal: number;
  current_funding: number;
  phone: string | null;
  location: string | null;
  tagline: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MissionaryWithProfile extends Missionary {
  profile: Profile;
}

export interface Donor {
  id: string;
  tenant_id: string;
  profile_id: string;
  giving_preferences: Record<string, unknown>;
  total_given: number;
  created_at: string;
  updated_at: string;
}

export interface DonorWithProfile extends Donor {
  profile: Profile;
}

export interface Fund {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  missionary_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringGiving {
  id: string;
  tenant_id: string;
  donor_id: string;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  frequency: GivingFrequency;
  next_charge_date: string;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  tenant_id: string;
  donor_id: string;
  missionary_id: string;
  created_at: string;
}

export interface Donation {
  id: string;
  tenant_id: string;
  donor_id: string;
  missionary_id: string;
  fund_id: string | null;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  status: DonationStatus;
  created_at: string;
}

export interface DonationWithDetails extends Donation {
  donor: Profile;
  missionary: MissionaryWithProfile;
  fund: Fund | null;
}

export interface MediaItem {
  url: string;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export interface Post {
  id: string;
  tenant_id: string;
  missionary_id: string;
  content: string;
  media: MediaItem[];
  like_count: number;
  prayer_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostPrayer {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  user_liked?: boolean;
  user_prayed?: boolean;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
