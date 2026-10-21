-- Research fixture: exact selected table declarations, not a migration replay.
-- auth.users is only a UUID-key stub; no Supabase auth, policies or JWT runtime.
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:14-24
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:27-41
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
    role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('admin', 'staff', 'super_admin', 'missionary', 'donor', 'finance', 'fundraising', 'mobilizers', 'member_care', 'events', 'delivery', 'ticketing', 'machinery')),
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:44-59
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:62-98
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:101-116
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:175-192
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:238-254
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

-- Verbatim: supabase/migrations/20250101000000_init_schema.sql:287-301
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

-- Verbatim: supabase/migrations/20260818000000_crm_notes.sql:5-27
CREATE TABLE IF NOT EXISTS public.crm_notes (
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  visibility text NOT NULL,
  linked_record_id text,
  linked_record_type text,
  linked_record_label text,
  author_profile_id uuid,
  author_name text NOT NULL DEFAULT 'Mission Control',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  CONSTRAINT crm_notes_title_not_blank CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT crm_notes_body_not_blank CHECK (char_length(btrim(body)) > 0),
  CONSTRAINT crm_notes_visibility_valid CHECK (visibility IN ('standard', 'restricted')),
  CONSTRAINT crm_notes_linked_type_when_id CHECK (
    linked_record_id IS NULL
    OR char_length(btrim(linked_record_id)) > 0
  )
);

-- Verbatim: supabase/migrations/20260507234343_crm_command_logs.sql:1-16
CREATE TABLE IF NOT EXISTS public.crm_command_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    request_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    idempotency_key TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'attempted', 'succeeded', 'failed', 'skipped')),
    command_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exact clause from supabase/migrations/20260214090000_foundation_1_schema.sql:342; terminal comma changed to semicolon.
ALTER TABLE public.donor_pledges
    ADD COLUMN IF NOT EXISTS missionary_id UUID REFERENCES public.missionaries(id) ON DELETE SET NULL;

-- Synthetic IDs/data only. Grant a SQL fixture role; this is not a production role model.
CREATE ROLE d3_deleter LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB;
GRANT USAGE ON SCHEMA auth, public TO d3_deleter;
GRANT SELECT ON ALL TABLES IN SCHEMA auth, public TO d3_deleter;
GRANT DELETE ON auth.users, public.profiles, public.missionaries TO d3_deleter;
INSERT INTO public.tenants (id,name,slug) VALUES ('00000000-0000-0000-0000-000000000001','Synthetic D3 tenant','synthetic-d3');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Synthetic case 1 task');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000002');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Synthetic case 2 task');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000003');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','Synthetic case 3 task');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000004');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000004','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000004');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000004','Synthetic case 4 task');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000005');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','Synthetic case 5 task');

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000006');
INSERT INTO public.profiles (id,user_id,role) VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000006','missionary');
INSERT INTO public.missionaries (id,profile_id) VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000006');
INSERT INTO public.missionary_tasks (id,missionary_id,title) VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000006','Synthetic case 6 task');

INSERT INTO public.donors (id,missionary_id,name) VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Synthetic donor');
INSERT INTO public.funds (id,missionary_id,name) VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','Synthetic fund');
INSERT INTO public.donations (id,missionary_id,amount) VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000004',1);
INSERT INTO public.donor_pledges (id,missionary_id) VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005');
INSERT INTO public.crm_notes (tenant_id,id,title,body,visibility,linked_record_id,linked_record_type,linked_record_label,author_profile_id,author_name) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000006','Synthetic note','Retained synthetic body','restricted','00000000-0000-0000-0000-000000000006','profile','Retained synthetic label','00000000-0000-0000-0000-000000000006','Retained synthetic author');
INSERT INTO public.crm_command_logs (tenant_id,id,actor_user_id,actor_profile_id,action,resource_type,status,command_payload) VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000006','synthetic','profile','succeeded','{"retained":"synthetic"}');
