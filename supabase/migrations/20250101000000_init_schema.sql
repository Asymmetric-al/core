-- Supabase Schema for Asymmetric.al
-- Baseline migration for the hosted Supabase project

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==========================================
-- TABLES
-- ==========================================

-- 1. Tenants (Organizations)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    org_post_visibility TEXT DEFAULT 'all_donors',
    org_settings JSONB DEFAULT '{}'::jsonb,
    stripe_secret_key TEXT,
    stripe_publishable_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Unified User Table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID UNIQUE, -- Redundant but used in some queries
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'donor', -- 'admin', 'missionary', 'donor'
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Missionaries
CREATE TABLE IF NOT EXISTS public.missionaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    mission_field TEXT,
    funding_goal NUMERIC DEFAULT 0,
    current_funding NUMERIC DEFAULT 0,
    tagline TEXT,
    location TEXT,
    phone TEXT,
    cover_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Donors
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    profile_id UUID REFERENCES public.profiles(id),
    missionary_id UUID REFERENCES public.profiles(id), -- The missionary this donor is primarily associated with
    name TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    work_phone TEXT,
    preferred_contact TEXT DEFAULT 'email',
    avatar_url TEXT,
    location TEXT,
    type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    giving_preferences JSONB DEFAULT '{}'::jsonb,
    total_given NUMERIC DEFAULT 0,
    last_gift_date TIMESTAMPTZ,
    last_gift_amount NUMERIC,
    frequency TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    tags TEXT[],
    score NUMERIC DEFAULT 0,
    address JSONB,
    work_address JSONB,
    website TEXT,
    organization TEXT,
    title TEXT,
    birthday DATE,
    anniversary DATE,
    spouse TEXT,
    notes TEXT,
    has_active_pledge BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Funds (Projects / Designated Funds)
CREATE TABLE IF NOT EXISTS public.funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC DEFAULT 0,
    goal_amount NUMERIC DEFAULT 0,
    current_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'usd',
    missionary_id UUID REFERENCES public.missionaries(id),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Posts (Updates from Missionaries or Org)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    missionary_id UUID REFERENCES public.profiles(id),
    title TEXT,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    post_type TEXT DEFAULT 'Update',
    type TEXT DEFAULT 'missionary_update', -- 'org_update', 'missionary_update'
    visibility TEXT DEFAULT 'public', -- 'public', 'partners_only'
    status TEXT DEFAULT 'published',
    like_count INTEGER DEFAULT 0,
    prayer_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Interactions
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_fires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES public.post_comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Donations
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.missionaries(id),
    fund_id UUID REFERENCES public.funds(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    donation_type TEXT DEFAULT 'one_time',
    payment_method TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT,
    notes TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Follows (Donors following missionaries)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, missionary_id)
);

-- 10. Donor Feed Preferences
CREATE TABLE IF NOT EXISTS public.donor_feed_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.donors(id),
    tenant_id UUID REFERENCES public.tenants(id),
    show_org_posts BOOLEAN DEFAULT TRUE,
    show_missionary_posts BOOLEAN DEFAULT TRUE,
    follow_org BOOLEAN DEFAULT TRUE,
    email_org_posts BOOLEAN DEFAULT FALSE,
    email_missionary_posts BOOLEAN DEFAULT FALSE,
    push_org_posts BOOLEAN DEFAULT FALSE,
    push_missionary_posts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(donor_id, tenant_id)
);

-- 11. Donor Activities
CREATE TABLE IF NOT EXISTS public.donor_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.donors(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ,
    amount NUMERIC,
    status TEXT,
    gift_type TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Donor Pledges
CREATE TABLE IF NOT EXISTS public.donor_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.donors(id),
    amount NUMERIC DEFAULT 0,
    frequency TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    next_payment_date DATE,
    total_paid NUMERIC DEFAULT 0,
    total_expected NUMERIC DEFAULT 0,
    payments_completed INTEGER DEFAULT 0,
    payments_remaining INTEGER DEFAULT 0,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Follower Requests
CREATE TABLE IF NOT EXISTS public.follower_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.donors(id),
    missionary_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    access_level TEXT DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    UNIQUE(donor_id, missionary_id)
);

-- 14. Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    title TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    type TEXT DEFAULT 'custom',
    linked_id TEXT,
    summary TEXT,
    image_public_id TEXT,
    status TEXT DEFAULT 'draft',
    sort_key INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Missionary Tasks
CREATE TABLE IF NOT EXISTS public.missionary_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missionary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.donors(id),
    title VARCHAR NOT NULL,
    description TEXT,
    task_type VARCHAR,
    status VARCHAR DEFAULT 'pending',
    priority VARCHAR DEFAULT 'medium',
    sort_key INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PDF Templates
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    design JSONB NOT NULL,
    html TEXT,
    category TEXT DEFAULT 'custom',
    page_size TEXT DEFAULT 'Letter',
    orientation TEXT DEFAULT 'portrait',
    margins JSONB DEFAULT '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'draft',
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    format TEXT,
    resource_type TEXT DEFAULT 'image',
    purpose TEXT,
    user_id UUID,
    tenant_id UUID REFERENCES public.tenants(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- RPC helpers for post counters
CREATE OR REPLACE FUNCTION public.increment_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_like_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = COALESCE(prayer_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_prayer_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET prayer_count = GREATEST(COALESCE(prayer_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.posts
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$function$;

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- Buckets used by the app (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profiles', 'profiles', true),
  ('document-uploads', 'document-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for uploaded media
DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
CREATE POLICY "Public read profiles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Public read document-uploads" ON storage.objects;
CREATE POLICY "Public read document-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-uploads');

-- Authenticated uploads (client-side)
DROP POLICY IF EXISTS "Authenticated upload profiles" ON storage.objects;
CREATE POLICY "Authenticated upload profiles"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated upload document-uploads" ON storage.objects;
CREATE POLICY "Authenticated upload document-uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'document-uploads' AND auth.role() = 'authenticated');

-- Owner update/delete for authenticated users
DROP POLICY IF EXISTS "Owner update profiles" ON storage.objects;
CREATE POLICY "Owner update profiles"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete profiles" ON storage.objects;
CREATE POLICY "Owner delete profiles"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profiles' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner update document-uploads" ON storage.objects;
CREATE POLICY "Owner update document-uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'document-uploads' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner delete document-uploads" ON storage.objects;
CREATE POLICY "Owner delete document-uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'document-uploads' AND auth.uid() = owner);

-- Trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, first_name, last_name, full_name, avatar_url, role, tenant_id)
  VALUES (
    new.id,
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name'))
    ),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'donor'),
    COALESCE((new.raw_app_meta_data->>'tenant_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
  );
  RETURN new;
END;
$function$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Create default tenant
INSERT INTO public.tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'GiveHope Organization', 'give-hope')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
-- For development/demo ease, we are keeping RLS disabled on most tables.
-- In production, you MUST enable RLS and define policies.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_prayers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_fires DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_feed_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_pledges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follower_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.missionary_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
