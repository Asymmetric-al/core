-- Deterministic demo seed for Supabase
-- - Idempotent by design (reset + deterministic inserts)
-- - Exactly one profile identity
-- - Relationally valid across all public app tables

BEGIN;
SET LOCAL timezone = 'UTC';

-- ---------------------------------------------------------------------------
-- 0) Reset public app tables in dependency order.
-- ---------------------------------------------------------------------------
DELETE FROM authz.memberships;
DELETE FROM public.notification_queue;
DELETE FROM public.pledge_charge_attempts;
DELETE FROM public.audit_logs;
DELETE FROM public.assets;
DELETE FROM public.pdf_templates;
DELETE FROM public.missionary_tasks;
DELETE FROM public.follower_requests;
DELETE FROM public.member_care_private_notes;
DELETE FROM public.member_care_requirements;
DELETE FROM public.member_care_goals;
DELETE FROM public.member_care_activities;
DELETE FROM public.donor_activities;
DELETE FROM public.donor_feed_preferences;
DELETE FROM public.follows;
DELETE FROM public.post_comments;
DELETE FROM public.post_fires;
DELETE FROM public.post_prayers;
DELETE FROM public.post_likes;
DELETE FROM public.donations;
DELETE FROM public.campaigns;
DELETE FROM public.posts;
DELETE FROM public.donor_pledges;
DELETE FROM public.funds;
DELETE FROM public.donors;
DELETE FROM public.missionaries;
DELETE FROM public.locations;
DELETE FROM public.profiles;
DELETE FROM public.tenants;

-- Remove prior demo auth users so the seed always lands on one profile row.
DELETE FROM auth.users
WHERE email LIKE '%@givehope.test'
   OR email LIKE '%@donors.test'
   OR email LIKE '%@partners.test';

-- ---------------------------------------------------------------------------
-- 1) Tenant + single auth/profile identity
-- ---------------------------------------------------------------------------
INSERT INTO public.tenants (
  id,
  name,
  slug,
  org_post_visibility,
  org_settings,
  billing_email,
  default_timezone,
  locale,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'GiveHope Demo Organization',
  'give-hope-demo',
  'all_donors',
  '{"demo":true,"theme":"zinc"}'::jsonb,
  'ops@givehope.test',
  'America/Chicago',
  'en-US',
  '2025-11-01T09:00:00Z'::timestamptz,
  '2026-02-16T09:00:00Z'::timestamptz
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  org_post_visibility = EXCLUDED.org_post_visibility,
  org_settings = EXCLUDED.org_settings,
  billing_email = EXCLUDED.billing_email,
  default_timezone = EXCLUDED.default_timezone,
  locale = EXCLUDED.locale,
  updated_at = EXCLUDED.updated_at;

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone_change,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  is_sso_user,
  is_anonymous
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo-owner@givehope.test',
  extensions.crypt('demo-password'::text, extensions.gen_salt('bf'::text)),
  '2025-11-01T09:00:00Z'::timestamptz,
  '',
  '',
  '',
  '',
  '2025-11-01T09:00:00Z'::timestamptz,
  '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
  '{"first_name":"Jordan","last_name":"Hale","full_name":"Jordan Hale","display_name":"Jordan Hale","role":"admin","avatar_url":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e"}'::jsonb,
  false,
  '2025-11-01T09:00:00Z'::timestamptz,
  '2026-02-16T09:00:00Z'::timestamptz,
  '',
  '',
  '',
  0,
  '',
  false,
  false
)
ON CONFLICT (id) DO UPDATE
SET
  instance_id = EXCLUDED.instance_id,
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  confirmation_token = EXCLUDED.confirmation_token,
  recovery_token = EXCLUDED.recovery_token,
  email_change_token_new = EXCLUDED.email_change_token_new,
  email_change = EXCLUDED.email_change,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  is_super_admin = EXCLUDED.is_super_admin,
  updated_at = EXCLUDED.updated_at,
  phone_change = EXCLUDED.phone_change,
  phone_change_token = EXCLUDED.phone_change_token,
  email_change_token_current = EXCLUDED.email_change_token_current,
  email_change_confirm_status = EXCLUDED.email_change_confirm_status,
  reauthentication_token = EXCLUDED.reauthentication_token,
  is_sso_user = EXCLUDED.is_sso_user,
  is_anonymous = EXCLUDED.is_anonymous;

INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo-owner@givehope.test","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  '2025-11-01T09:00:00Z'::timestamptz,
  '2025-11-01T09:00:00Z'::timestamptz,
  '2026-02-16T09:00:00Z'::timestamptz
)
ON CONFLICT (provider_id, provider) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  identity_data = EXCLUDED.identity_data,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  updated_at = EXCLUDED.updated_at;

-- Trigger-backed profile row (single identity for the whole demo dataset).
INSERT INTO public.profiles (
  id,
  user_id,
  email,
  first_name,
  last_name,
  full_name,
  display_name,
  phone,
  avatar_url,
  role,
  tenant_id,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'demo-owner@givehope.test',
  'Jordan',
  'Hale',
  'Jordan Hale',
  'Jordan Hale',
  '+1-555-0100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  '2025-11-01T09:00:00Z'::timestamptz,
  '2026-02-16T09:00:00Z'::timestamptz
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  tenant_id = EXCLUDED.tenant_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO authz.memberships (
  user_id,
  tenant_id,
  role,
  staff_role,
  is_active
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'staff',
    'member_care',
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'donor',
    NULL,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'missionary',
    NULL,
    true
  )
ON CONFLICT (user_id, tenant_id, role, staff_role)
DO UPDATE
SET
  is_active = true,
  updated_at = NOW();

-- ---------------------------------------------------------------------------
-- 2) Missionaries, donors, funds (projects)
-- ---------------------------------------------------------------------------
WITH missionary_seed AS (
  SELECT
    gs,
    ('20000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    (ARRAY[
      'East Africa Water',
      'Rural Literacy',
      'Community Health',
      'Refugee Support',
      'Church Planting',
      'Urban Youth'
    ])[gs] AS mission_field,
    (ARRAY[
      'Nairobi, Kenya',
      'Chiang Mai, Thailand',
      'Kampala, Uganda',
      'Amman, Jordan',
      'Lisbon, Portugal',
      'Sao Paulo, Brazil'
    ])[gs] AS location
  FROM generate_series(1, 6) AS gs
)
INSERT INTO public.missionaries (
  id,
  tenant_id,
  profile_id,
  bio,
  mission_field,
  funding_goal,
  current_funding,
  tagline,
  location,
  phone,
  timezone,
  region,
  health_status,
  last_check_in,
  manual_attention,
  health_signals,
  birth_date,
  cover_url,
  social_links,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  format('Mission team %s is building long-term partnerships and reporting monthly outcomes.', gs),
  mission_field,
  ((9000 + (gs * 1200)) * 100)::bigint,
  ((1800 + (gs * 450)) * 100)::bigint,
  format('Field Team %s', gs),
  location,
  format('+1-555-02%02s', gs),
  (ARRAY[
    'Africa/Nairobi',
    'Asia/Bangkok',
    'Africa/Kampala',
    'Asia/Amman',
    'Europe/Lisbon',
    'America/Sao_Paulo'
  ])[gs],
  (ARRAY[
    'Africa',
    'SE Asia',
    'Africa',
    'Middle East',
    'Europe',
    'Latin America'
  ])[gs],
  CASE
    WHEN gs IN (4, 6) THEN 'needs_attention'
    ELSE 'healthy'
  END,
  '2026-02-10T09:00:00Z'::timestamptz - ((gs - 1) * interval '18 hours'),
  gs IN (4, 6),
  jsonb_build_object(
    'emotional', 58 + gs,
    'spiritual', 64 + gs,
    'physical', 55 + gs,
    'financial', 50 + (gs * 2)
  ),
  ('1984-01-01'::date + (gs * interval '370 days'))::date,
  CASE WHEN gs = 6 THEN NULL ELSE format('https://images.unsplash.com/photo-%s', 1500000000000 + gs) END,
  CASE
    WHEN gs = 6 THEN '{}'::jsonb
    ELSE jsonb_build_object(
      'website', format('https://demo.givehope.test/missionaries/%s', gs),
      'instagram', format('https://instagram.com/givehope_team_%s', gs)
    )
  END,
  ('2025-11-05T10:00:00Z'::timestamptz + ((gs - 1) * interval '6 days')),
  ('2026-02-10T09:00:00Z'::timestamptz - ((gs - 1) * interval '9 hours'))
FROM missionary_seed;

-- Demo identity as missionary so metrics API finds a row when UI uses profile id (11111111-...)
INSERT INTO public.missionaries (
  id,
  tenant_id,
  profile_id,
  bio,
  mission_field,
  funding_goal,
  current_funding,
  tagline,
  location,
  phone,
  timezone,
  region,
  health_status,
  last_check_in,
  manual_attention,
  health_signals,
  birth_date,
  cover_url,
  social_links,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Demo missionary profile for read-only dashboard metrics.',
  'Demo Ministry',
  600000,
  156000,
  'Demo Team',
  'Chicago, IL',
  '+1-555-0100',
  'America/Chicago',
  'North America',
  'needs_attention',
  '2026-04-05T15:00:00Z'::timestamptz,
  TRUE,
  '{"emotional":42,"spiritual":67,"physical":58,"financial":35}'::jsonb,
  '1991-04-20'::date,
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  '{"website":"https://demo.givehope.test"}'::jsonb,
  '2025-11-01T09:00:00Z'::timestamptz,
  '2026-02-16T09:00:00Z'::timestamptz
)
ON CONFLICT (id) DO UPDATE
SET
  tenant_id = EXCLUDED.tenant_id,
  profile_id = EXCLUDED.profile_id,
  bio = EXCLUDED.bio,
  mission_field = EXCLUDED.mission_field,
  funding_goal = EXCLUDED.funding_goal,
  current_funding = EXCLUDED.current_funding,
  tagline = EXCLUDED.tagline,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone,
  timezone = EXCLUDED.timezone,
  region = EXCLUDED.region,
  health_status = EXCLUDED.health_status,
  last_check_in = EXCLUDED.last_check_in,
  manual_attention = EXCLUDED.manual_attention,
  health_signals = EXCLUDED.health_signals,
  birth_date = EXCLUDED.birth_date,
  cover_url = EXCLUDED.cover_url,
  social_links = EXCLUDED.social_links,
  updated_at = EXCLUDED.updated_at;

WITH donor_seed AS (
  SELECT
    gs,
    ('30000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    (ARRAY['Avery','Morgan','Taylor','Casey','Reese','Parker','Quinn','Rowan','Skyler','Hayden','Elliot','Riley','Cameron','Dakota','Logan'])[gs] AS first_name,
    (ARRAY['Lopez','Patel','Nguyen','Brooks','Carter','Diaz','Kim','Turner','Reed','Bennett','Shaw','Walker','Price','Coleman','Rivera'])[gs] AS last_name
  FROM generate_series(1, 15) AS gs
)
INSERT INTO public.donors (
  id,
  tenant_id,
  profile_id,
  missionary_id,
  name,
  email,
  phone,
  mobile,
  work_phone,
  preferred_contact,
  avatar_url,
  location,
  type,
  status,
  giving_preferences,
  total_given,
  first_gift_date,
  last_gift_date,
  last_gift_amount,
  gift_count,
  frequency,
  joined_date,
  tags,
  score,
  address,
  work_address,
  website,
  organization,
  title,
  birthday,
  anniversary,
  spouse,
  notes,
  do_not_contact,
  do_not_email,
  receipt_email_frequency,
  default_update_frequency,
  preferred_language,
  has_active_pledge,
  stripe_customer_id,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  CASE WHEN gs = 1 THEN '11111111-1111-1111-1111-111111111111'::uuid ELSE NULL END,
  '11111111-1111-1111-1111-111111111111',
  first_name || ' ' || last_name,
  lower(first_name || '.' || last_name) || '@partners.test',
  format('+1-555-03%02s', gs),
  format('+1-555-13%02s', gs),
  format('+1-555-23%02s', gs),
  (ARRAY['email','sms','phone'])[((gs - 1) % 3) + 1],
  format('https://images.unsplash.com/photo-%s', 1600000000000 + gs),
  (ARRAY['Austin, TX','Portland, OR','Denver, CO','Nashville, TN','Phoenix, AZ'])[((gs - 1) % 5) + 1],
  (ARRAY['individual','church','foundation'])[((gs - 1) % 3) + 1],
  (ARRAY['active','active','lapsed','at_risk','active'])[((gs - 1) % 5) + 1],
  jsonb_build_object(
    'causes', to_jsonb(ARRAY[(ARRAY['water','education','health','church_support'])[((gs - 1) % 4) + 1]]),
    'preferred_channel', (ARRAY['email','sms','phone'])[((gs - 1) % 3) + 1]
  ),
  0,
  NULL,
  NULL,
  0,
  0,
  (ARRAY['monthly','quarterly','one_time'])[((gs - 1) % 3) + 1],
  (date '2025-10-20' + ((gs - 1) * interval '5 days'))::date,
  ARRAY[(ARRAY['legacy','new','major-gift','newsletter'])[((gs - 1) % 4) + 1]],
  (45 + (gs * 2))::numeric,
  jsonb_build_object('city', split_part((ARRAY['Austin,TX','Portland,OR','Denver,CO','Nashville,TN','Phoenix,AZ'])[((gs - 1) % 5) + 1], ',', 1), 'state', split_part((ARRAY['Austin,TX','Portland,OR','Denver,CO','Nashville,TN','Phoenix,AZ'])[((gs - 1) % 5) + 1], ',', 2)),
  CASE WHEN gs % 3 = 0 THEN NULL ELSE jsonb_build_object('city', 'Remote', 'state', 'NA') END,
  CASE WHEN gs % 4 = 0 THEN NULL ELSE format('https://partner%s.example.org', gs) END,
  CASE WHEN gs % 3 = 0 THEN format('Community Org %s', gs) ELSE NULL END,
  CASE WHEN gs % 3 = 0 THEN 'Director' ELSE NULL END,
  CASE WHEN gs % 5 = 0 THEN (date '1980-01-01' + ((gs - 1) * interval '300 days'))::date ELSE NULL END,
  CASE WHEN gs % 6 = 0 THEN (date '2010-01-01' + ((gs - 1) * interval '120 days'))::date ELSE NULL END,
  CASE WHEN gs % 7 = 0 THEN 'Spouse Name' ELSE NULL END,
  CASE WHEN gs % 4 = 0 THEN NULL ELSE format('Partner note %s with detailed context for follow-up.', gs) END,
  (gs % 11 = 0),
  (gs % 9 = 0),
  (ARRAY['monthly','quarterly','immediate'])[((gs - 1) % 3) + 1],
  CASE WHEN gs % 2 = 0 THEN 'weekly' ELSE 'monthly' END,
  CASE WHEN gs % 5 = 0 THEN 'es' ELSE 'en' END,
  FALSE,
  format('cus_demo_%s', lpad(gs::text, 6, '0')),
  ('2025-11-01T11:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  ('2026-02-15T08:00:00Z'::timestamptz - ((gs - 1) * interval '2 hours'))
FROM donor_seed;

WITH fund_seed AS (
  SELECT
    gs,
    ('40000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    (ARRAY[
      'Nairobi Water Wells',
      'Literacy Kits',
      'Mobile Health Clinics',
      'Refugee Winter Relief',
      'Church Leadership Residency',
      'Youth Mentorship Labs',
      'Family Food Security',
      'Future Innovation Lab'
    ])[gs] AS name
  FROM generate_series(1, 8) AS gs
)
INSERT INTO public.funds (
  id,
  tenant_id,
  name,
  description,
  target_amount,
  goal_amount,
  current_amount,
  currency,
  missionary_id,
  is_active,
  start_date,
  end_date,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  name,
  CASE
    WHEN gs = 8 THEN 'Edge case: intentionally unfunded project to verify empty-state rendering.'
    WHEN gs % 2 = 0 THEN 'Long-form fund description with milestones, partner outcomes, and budget assumptions.'
    ELSE 'Short project summary.'
  END,
  ((18000 + (gs * 2500)) * 100)::bigint,
  ((18000 + (gs * 2500)) * 100)::bigint,
  CASE WHEN gs = 8 THEN 0 ELSE ((2200 + (gs * 750)) * 100)::bigint END,
  'usd',
  ('20000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))::uuid,
  (gs <> 2),
  (date '2025-11-01' + ((gs - 1) * interval '7 days'))::date,
  CASE WHEN gs IN (2, 8) THEN NULL ELSE (date '2026-07-01' + ((gs - 1) * interval '10 days'))::date END,
  ('2025-11-01T11:00:00Z'::timestamptz + ((gs - 1) * interval '1 day')),
  ('2026-02-14T18:00:00Z'::timestamptz - ((gs - 1) * interval '1 hour'))
FROM fund_seed;

-- ---------------------------------------------------------------------------
-- 3) Feed content + interactions
-- ---------------------------------------------------------------------------
WITH post_seed AS (
  SELECT
    gs,
    ('50000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    ('2025-11-20T10:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')) AS created_at
  FROM generate_series(1, 36) AS gs
)
INSERT INTO public.posts (
  id,
  tenant_id,
  missionary_id,
  title,
  content,
  media,
  image_url,
  post_type,
  type,
  visibility,
  status,
  like_count,
  prayer_count,
  comment_count,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  format('%s #%s', (ARRAY['Field Update','Prayer Request','Impact Story','Milestone'])[((gs - 1) % 4) + 1], gs),
  CASE
    WHEN gs % 9 = 0 THEN repeat('Detailed progress paragraph with partner outcomes and next-step plans. ', 5)
    WHEN gs % 4 = 0 THEN 'Brief update.'
    ELSE format('Weekly report %s from the field with concrete milestones.', gs)
  END,
  CASE
    WHEN gs % 4 = 0 THEN jsonb_build_array(jsonb_build_object('type', 'image', 'url', format('https://images.unsplash.com/photo-%s', 1700000000000 + gs)))
    ELSE '[]'::jsonb
  END,
  CASE WHEN gs % 3 = 0 THEN format('https://images.unsplash.com/photo-%s', 1710000000000 + gs) ELSE NULL END,
  (ARRAY['Update','Prayer Request','Story','Milestone'])[((gs - 1) % 4) + 1],
  CASE WHEN gs % 6 = 0 THEN 'org_update' ELSE 'missionary_update' END,
  CASE WHEN gs % 5 = 0 THEN 'partners_only' ELSE 'public' END,
  CASE WHEN gs % 7 = 0 THEN 'draft' ELSE 'published' END,
  0,
  0,
  0,
  created_at,
  created_at + interval '2 hours'
FROM post_seed;

INSERT INTO public.post_likes (id, post_id, user_id, created_at)
SELECT
  ('51000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('50000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('2025-12-10T10:00:00Z'::timestamptz + ((gs - 1) * interval '1 day'))
FROM generate_series(1, 18) AS gs;

INSERT INTO public.post_prayers (id, post_id, user_id, created_at)
SELECT
  ('51100000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('50000000-0000-0000-0000-' || lpad((gs + 4)::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('2025-12-12T08:30:00Z'::timestamptz + ((gs - 1) * interval '36 hours'))
FROM generate_series(1, 12) AS gs;

INSERT INTO public.post_fires (id, post_id, user_id, created_at)
SELECT
  ('51200000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('50000000-0000-0000-0000-' || lpad((gs + 9)::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('2026-01-05T14:00:00Z'::timestamptz + ((gs - 1) * interval '2 days'))
FROM generate_series(1, 9) AS gs;

INSERT INTO public.post_comments (
  id,
  post_id,
  user_id,
  parent_id,
  content,
  created_at,
  updated_at
)
SELECT
  ('52000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('50000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  NULL,
  format('Top-level comment %s with encouragement.', gs),
  ('2025-12-20T09:00:00Z'::timestamptz + ((gs - 1) * interval '20 hours')),
  ('2025-12-20T10:00:00Z'::timestamptz + ((gs - 1) * interval '20 hours'))
FROM generate_series(1, 14) AS gs;

INSERT INTO public.post_comments (
  id,
  post_id,
  user_id,
  parent_id,
  content,
  created_at,
  updated_at
)
SELECT
  ('52000000-0000-0000-0000-' || lpad((gs + 14)::text, 12, '0'))::uuid,
  ('50000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('52000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  format('Reply %s with additional context.', gs),
  ('2025-12-28T11:00:00Z'::timestamptz + ((gs - 1) * interval '15 hours')),
  ('2025-12-28T11:45:00Z'::timestamptz + ((gs - 1) * interval '15 hours'))
FROM generate_series(1, 6) AS gs;

-- ---------------------------------------------------------------------------
-- 4) Pledges, campaigns, donations
-- ---------------------------------------------------------------------------
WITH pledge_seed AS (
  SELECT
    gs,
    ('60000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    ('30000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS donor_id,
    ('20000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))::uuid AS missionary_id,
    ('40000000-0000-0000-0000-' || lpad((((gs - 1) % 7) + 1)::text, 12, '0'))::uuid AS fund_id
  FROM generate_series(1, 10) AS gs
)
INSERT INTO public.donor_pledges (
  id,
  tenant_id,
  donor_id,
  missionary_id,
  fund_id,
  amount,
  currency,
  frequency,
  status,
  start_date,
  end_date,
  next_payment_date,
  stripe_subscription_id,
  billing_day_of_month,
  billing_timezone,
  stripe_payment_method_id,
  retry_count,
  last_charge_at,
  last_charge_attempt,
  failed_charge_count,
  pause_reason,
  paused_at,
  next_charge_at,
  total_paid,
  total_expected,
  payments_completed,
  payments_remaining,
  payment_method,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  donor_id,
  missionary_id,
  fund_id,
  ((25 + (gs * 5)) * 100)::bigint,
  'usd',
  (ARRAY['monthly','monthly','quarterly'])[((gs - 1) % 3) + 1],
  CASE
    WHEN gs <= 6 THEN 'active'
    WHEN gs <= 8 THEN 'paused'
    ELSE 'cancelled'
  END,
  (date '2025-10-01' + ((gs - 1) * interval '8 days'))::date,
  CASE WHEN gs >= 9 THEN (date '2026-01-20' + ((gs - 9) * interval '10 days'))::date ELSE NULL END,
  CASE WHEN gs <= 8 THEN (date '2026-03-01' + ((gs - 1) * interval '5 days'))::date ELSE NULL END,
  CASE WHEN gs <= 8 THEN format('sub_demo_%s', lpad(gs::text, 5, '0')) ELSE NULL END,
  ((gs - 1) % 28) + 1,
  'America/Chicago',
  CASE WHEN gs <= 8 THEN format('pm_demo_%s', lpad(gs::text, 5, '0')) ELSE NULL END,
  CASE WHEN gs IN (2, 5) THEN 1 ELSE 0 END,
  CASE WHEN gs <= 8 THEN ('2026-02-05T12:00:00Z'::timestamptz - ((gs - 1) * interval '2 days')) ELSE NULL END,
  CASE WHEN gs <= 8 THEN ('2026-02-05T12:10:00Z'::timestamptz - ((gs - 1) * interval '2 days')) ELSE NULL END,
  CASE WHEN gs IN (2, 5, 8) THEN 1 ELSE 0 END,
  CASE WHEN gs IN (7, 8) THEN 'Supporter requested temporary hold' ELSE NULL END,
  CASE WHEN gs IN (7, 8) THEN '2026-01-15T12:00:00Z'::timestamptz ELSE NULL END,
  CASE WHEN gs <= 6 THEN ('2026-03-01T10:00:00Z'::timestamptz + ((gs - 1) * interval '3 days')) ELSE NULL END,
  ((gs * 3) * 100)::bigint,
  ((gs * 12) * 100)::bigint,
  gs,
  GREATEST(12 - gs, 0),
  (ARRAY['card','bank_transfer'])[((gs - 1) % 2) + 1],
  ('2025-10-01T10:00:00Z'::timestamptz + ((gs - 1) * interval '5 days')),
  ('2026-02-10T09:00:00Z'::timestamptz - ((gs - 1) * interval '3 hours'))
FROM pledge_seed;

WITH campaign_seed AS (
  SELECT
    gs,
    ('70000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    ('30000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS creator_donor_id,
    ('20000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS missionary_id,
    (ARRAY['spring-water-drive','literacy-90-day-push','clinic-equipment-match','winter-relief-sprint','leaders-residency','youth-mentor-week']) [gs] AS slug
  FROM generate_series(1, 6) AS gs
)
INSERT INTO public.campaigns (
  id,
  tenant_id,
  title,
  story,
  channel,
  status,
  audience_filter,
  metadata,
  goal_amount,
  current_amount,
  share_url,
  slug,
  creator_donor_id,
  missionary_id,
  start_date,
  end_date,
  scheduled_for,
  sent_at,
  created_by,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  (ARRAY[
    'Spring Water Drive',
    'Literacy 90-Day Push',
    'Clinic Equipment Match',
    'Winter Relief Sprint',
    'Leaders Residency Cohort',
    'Youth Mentor Week'
  ])[gs],
  'Campaign narrative with clear objective, timeline, and target impact.',
  (ARRAY['email','sms','email','social','email','email'])[gs],
  (ARRAY['active','scheduled','completed','draft','paused','active'])[gs],
  jsonb_build_object('segment', (ARRAY['all','lapsed','major-gifts','new','all','all'])[gs]),
  jsonb_build_object('theme', (ARRAY['water','education','health','relief','leadership','youth'])[gs]),
  ((12000 + gs * 3000) * 100)::bigint,
  ((1200 + gs * 650) * 100)::bigint,
  format('https://demo.givehope.test/c/%s', slug),
  slug,
  creator_donor_id,
  missionary_id,
  ('2025-12-01T08:00:00Z'::timestamptz + ((gs - 1) * interval '10 days')),
  CASE WHEN gs IN (3, 6) THEN ('2026-04-01T08:00:00Z'::timestamptz + ((gs - 1) * interval '10 days')) ELSE NULL END,
  CASE WHEN gs IN (2, 4) THEN ('2026-02-20T14:00:00Z'::timestamptz + ((gs - 1) * interval '1 day')) ELSE NULL END,
  CASE WHEN gs = 3 THEN '2026-01-25T14:00:00Z'::timestamptz ELSE NULL END,
  '11111111-1111-1111-1111-111111111111',
  ('2025-11-25T10:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  ('2026-02-14T10:00:00Z'::timestamptz - ((gs - 1) * interval '4 hours'))
FROM campaign_seed;

WITH donation_seed AS (
  SELECT
    gs,
    ('80000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid AS id,
    ((gs - 1) % 15) + 1 AS donor_idx,
    ((gs - 1) % 6) + 1 AS missionary_idx,
    ((gs - 1) % 7) + 1 AS fund_idx,
    ((gs - 1) % 6) + 1 AS campaign_idx,
    CASE
      WHEN gs % 9 = 0 THEN 'failed'
      WHEN gs % 7 = 0 THEN 'refunded'
      WHEN gs % 4 = 0 THEN 'pending'
      ELSE 'completed'
    END AS status,
    CASE WHEN gs % 3 = 0 THEN 'recurring' ELSE 'one_time' END AS donation_type,
    (gs % 3 = 0) AS is_recurring,
    (date '2025-11-18' + ((gs - 1) * interval '3 days'))::date AS gift_date,
    ((30 + (gs * 4)) * 100)::bigint AS amount_cents
  FROM generate_series(1, 28) AS gs
)
INSERT INTO public.donations (
  id,
  tenant_id,
  donor_id,
  missionary_id,
  fund_id,
  amount,
  currency,
  status,
  donation_type,
  payment_method,
  is_recurring,
  recurring_interval,
  notes,
  stripe_payment_intent_id,
  gift_date,
  campaign_id,
  pledge_id,
  processed_at,
  completed_at,
  failed_at,
  error_code,
  error_message,
  stripe_charge_id,
  refunded_at,
  refund_amount,
  source,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  ('30000000-0000-0000-0000-' || lpad(donor_idx::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 5 = 0 THEN NULL
    ELSE ('20000000-0000-0000-0000-' || lpad(missionary_idx::text, 12, '0'))::uuid
  END,
  ('40000000-0000-0000-0000-' || lpad(fund_idx::text, 12, '0'))::uuid,
  amount_cents,
  'usd',
  status,
  donation_type,
  (ARRAY['card','bank_transfer','ach'])[((gs - 1) % 3) + 1],
  is_recurring,
  CASE WHEN is_recurring THEN (ARRAY['monthly','quarterly'])[((gs - 1) % 2) + 1] ELSE NULL END,
  CASE
    WHEN status = 'failed' THEN 'Card decline on capture attempt.'
    WHEN status = 'pending' THEN 'Awaiting asynchronous confirmation.'
    ELSE NULL
  END,
  format('pi_demo_%s', lpad(gs::text, 6, '0')),
  gift_date,
  CASE WHEN gs <= 12 THEN ('70000000-0000-0000-0000-' || lpad(campaign_idx::text, 12, '0'))::uuid ELSE NULL END,
  CASE
    WHEN donor_idx <= 10 AND gs % 2 = 0 THEN ('60000000-0000-0000-0000-' || lpad(donor_idx::text, 12, '0'))::uuid
    ELSE NULL
  END,
  CASE WHEN status <> 'pending' THEN (gift_date::timestamp + interval '9 hours')::timestamptz ELSE NULL END,
  CASE WHEN status IN ('completed', 'refunded') THEN (gift_date::timestamp + interval '10 hours')::timestamptz ELSE NULL END,
  CASE WHEN status = 'failed' THEN (gift_date::timestamp + interval '10 hours')::timestamptz ELSE NULL END,
  CASE WHEN status = 'failed' THEN 'card_declined' ELSE NULL END,
  CASE WHEN status = 'failed' THEN 'Issuer returned a decline code.' ELSE NULL END,
  CASE WHEN status IN ('completed', 'refunded') THEN format('ch_demo_%s', lpad(gs::text, 6, '0')) ELSE NULL END,
  CASE WHEN status = 'refunded' THEN (gift_date::timestamp + interval '2 days')::timestamptz ELSE NULL END,
  CASE WHEN status = 'refunded' THEN amount_cents / 2 ELSE 0 END,
  (ARRAY['direct','campaign','api'])[((gs - 1) % 3) + 1],
  (gift_date::timestamp + interval '8 hours')::timestamptz,
  (gift_date::timestamp + interval '11 hours')::timestamptz
FROM donation_seed;

-- Donations for demo missionary (id = profile id) so metrics API returns chart data
WITH demo_donations AS (
  SELECT
    gs,
    ('80000000-0000-0000-0000-' || lpad((28 + gs)::text, 12, '0'))::uuid AS id,
    ((gs - 1) % 5) + 1 AS donor_idx,
    ((gs - 1) % 4) + 1 AS fund_idx,
    (date '2025-12-01' + ((gs - 1) * interval '12 days'))::date AS gift_date,
    ((50 + (gs * 10)) * 100)::bigint AS amount_cents
  FROM generate_series(1, 8) AS gs
)
INSERT INTO public.donations (
  id,
  tenant_id,
  donor_id,
  missionary_id,
  fund_id,
  amount,
  currency,
  status,
  donation_type,
  payment_method,
  is_recurring,
  recurring_interval,
  notes,
  stripe_payment_intent_id,
  gift_date,
  campaign_id,
  pledge_id,
  processed_at,
  completed_at,
  failed_at,
  error_code,
  error_message,
  stripe_charge_id,
  refunded_at,
  refund_amount,
  source,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  ('30000000-0000-0000-0000-' || lpad(donor_idx::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('40000000-0000-0000-0000-' || lpad(fund_idx::text, 12, '0'))::uuid,
  amount_cents,
  'usd',
  'completed',
  'one_time',
  'card',
  FALSE,
  NULL,
  NULL,
  format('pi_demo_dm_%s', lpad(gs::text, 3, '0')),
  gift_date,
  NULL,
  NULL,
  (gift_date::timestamp + interval '9 hours')::timestamptz,
  (gift_date::timestamp + interval '10 hours')::timestamptz,
  NULL,
  NULL,
  NULL,
  format('ch_demo_dm_%s', lpad(gs::text, 3, '0')),
  NULL,
  0,
  'direct',
  (gift_date::timestamp + interval '8 hours')::timestamptz,
  (gift_date::timestamp + interval '11 hours')::timestamptz
FROM demo_donations;

-- ---------------------------------------------------------------------------
-- 5) Relationship and activity surfaces
-- ---------------------------------------------------------------------------
INSERT INTO public.follows (
  id,
  tenant_id,
  donor_id,
  missionary_id,
  status,
  is_donor,
  approved_at,
  notification_frequency,
  muted,
  created_at
)
SELECT
  ('90000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000001',
  ('30000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  CASE WHEN gs % 5 = 0 THEN 'pending' ELSE 'approved' END,
  TRUE,
  CASE WHEN gs % 5 = 0 THEN NULL ELSE ('2025-12-01T08:00:00Z'::timestamptz + ((gs - 1) * interval '3 days')) END,
  (ARRAY['weekly','monthly','never'])[((gs - 1) % 3) + 1],
  (gs % 6 = 0),
  ('2025-11-20T08:00:00Z'::timestamptz + ((gs - 1) * interval '3 days'))
FROM generate_series(1, 12) AS gs;

INSERT INTO public.donor_feed_preferences (
  id,
  donor_id,
  tenant_id,
  show_org_posts,
  show_missionary_posts,
  follow_org,
  email_org_posts,
  email_missionary_posts,
  push_org_posts,
  push_missionary_posts,
  created_at,
  updated_at
)
SELECT
  ('91000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('30000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000001',
  (gs % 3 <> 0),
  TRUE,
  (gs % 4 <> 0),
  (gs % 2 = 0),
  (gs % 3 = 0),
  (gs % 5 = 0),
  (gs % 2 <> 0),
  ('2025-11-15T10:00:00Z'::timestamptz + ((gs - 1) * interval '1 day')),
  ('2026-02-12T10:00:00Z'::timestamptz - ((gs - 1) * interval '1 hour'))
FROM generate_series(1, 15) AS gs;

INSERT INTO public.donor_activities (
  id,
  donor_id,
  type,
  title,
  description,
  date,
  amount,
  status,
  gift_type,
  note,
  created_at,
  updated_at
)
SELECT
  ('92000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('30000000-0000-0000-0000-' || lpad((((gs - 1) % 15) + 1)::text, 12, '0'))::uuid,
  (ARRAY['gift','call','email','note','pledge_started','thank_you'])[((gs - 1) % 6) + 1],
  format('Activity %s', gs),
  CASE WHEN gs % 4 = 0 THEN NULL ELSE 'Documented activity for supporter engagement timeline.' END,
  ('2025-11-10T09:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  CASE
    WHEN ((gs - 1) % 6) + 1 IN (1, 5) THEN ((20 + gs) * 100)::bigint
    ELSE NULL
  END,
  (ARRAY['completed','completed','done','active'])[((gs - 1) % 4) + 1],
  CASE WHEN ((gs - 1) % 6) + 1 IN (1, 5) THEN 'recurring' ELSE NULL END,
  CASE WHEN gs % 3 = 0 THEN 'Left detailed call summary.' ELSE NULL END,
  ('2025-11-10T09:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  ('2025-11-10T10:00:00Z'::timestamptz + ((gs - 1) * interval '2 days'))
FROM generate_series(1, 32) AS gs;

-- ---------------------------------------------------------------------------
-- 5b) Member care domain
-- ---------------------------------------------------------------------------
UPDATE public.missionaries
SET
  timezone = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN 'Africa/Nairobi'
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN 'Asia/Bangkok'
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN 'Africa/Kampala'
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN 'Asia/Amman'
    WHEN '20000000-0000-0000-0000-000000000005'::uuid THEN 'Europe/Lisbon'
    WHEN '20000000-0000-0000-0000-000000000006'::uuid THEN 'America/Sao_Paulo'
    ELSE timezone
  END,
  region = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN 'Africa'
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN 'SE Asia'
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN 'Africa'
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN 'Middle East'
    WHEN '20000000-0000-0000-0000-000000000005'::uuid THEN 'Europe'
    WHEN '20000000-0000-0000-0000-000000000006'::uuid THEN 'Latin America'
    ELSE region
  END,
  health_status = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN 'at_risk'
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN 'healthy'
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN 'needs_attention'
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN 'crisis'
    WHEN '20000000-0000-0000-0000-000000000005'::uuid THEN 'healthy'
    WHEN '20000000-0000-0000-0000-000000000006'::uuid THEN 'needs_attention'
    ELSE health_status
  END,
  last_check_in = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN '2026-03-01T14:00:00Z'::timestamptz
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN '2026-04-07T09:00:00Z'::timestamptz
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN '2026-03-22T12:30:00Z'::timestamptz
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN '2026-04-02T07:15:00Z'::timestamptz
    WHEN '20000000-0000-0000-0000-000000000005'::uuid THEN '2026-04-10T10:00:00Z'::timestamptz
    WHEN '20000000-0000-0000-0000-000000000006'::uuid THEN '2026-03-18T16:45:00Z'::timestamptz
    ELSE last_check_in
  END,
  manual_attention = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN TRUE
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN TRUE
    ELSE FALSE
  END,
  health_signals = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN '{"emotional":42,"spiritual":67,"physical":58,"financial":35}'::jsonb
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN '{"emotional":82,"spiritual":88,"physical":79,"financial":73}'::jsonb
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN '{"emotional":63,"spiritual":74,"physical":61,"financial":48}'::jsonb
    WHEN '20000000-0000-0000-0000-000000000004'::uuid THEN '{"emotional":28,"spiritual":54,"physical":45,"financial":39}'::jsonb
    WHEN '20000000-0000-0000-0000-000000000005'::uuid THEN '{"emotional":88,"spiritual":90,"physical":81,"financial":76}'::jsonb
    WHEN '20000000-0000-0000-0000-000000000006'::uuid THEN '{"emotional":57,"spiritual":69,"physical":64,"financial":52}'::jsonb
    ELSE health_signals
  END,
  birth_date = CASE id
    WHEN '20000000-0000-0000-0000-000000000001'::uuid THEN '1991-04-20'::date
    WHEN '20000000-0000-0000-0000-000000000002'::uuid THEN '1992-05-10'::date
    WHEN '20000000-0000-0000-0000-000000000003'::uuid THEN '1987-04-18'::date
    ELSE birth_date
  END
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.member_care_activities (
  id,
  tenant_id,
  missionary_id,
  author_user_id,
  author_name_snapshot,
  type,
  title,
  description,
  occurred_at,
  created_at,
  updated_at
)
VALUES
  (
    '93000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Jordan Hale',
    'video_call',
    'Weekly wellness video call',
    'Discussed financial stress, rest rhythm, and next-step support needs.',
    '2026-04-05T14:00:00Z'::timestamptz,
    '2026-04-05T14:00:00Z'::timestamptz,
    '2026-04-05T14:00:00Z'::timestamptz
  ),
  (
    '93000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Jordan Hale',
    'check_in',
    'Routine check-in',
    'Healthy support rhythm and no urgent needs reported.',
    '2026-04-07T09:00:00Z'::timestamptz,
    '2026-04-07T09:00:00Z'::timestamptz,
    '2026-04-07T09:00:00Z'::timestamptz
  ),
  (
    '93000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Jordan Hale',
    'prayer_request',
    'Prayer request follow-up',
    'Followed up after a ministry setback and captured prayer needs.',
    '2026-03-22T12:30:00Z'::timestamptz,
    '2026-03-22T12:30:00Z'::timestamptz,
    '2026-03-22T12:30:00Z'::timestamptz
  )
ON CONFLICT (id) DO UPDATE
SET
  author_name_snapshot = EXCLUDED.author_name_snapshot,
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  occurred_at = EXCLUDED.occurred_at,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.member_care_goals (
  id,
  tenant_id,
  missionary_id,
  title,
  status,
  target_date,
  updated_by,
  created_at,
  updated_at
)
VALUES
  (
    '94000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Stabilize monthly support shortfall',
    'active',
    '2026-05-15'::date,
    '11111111-1111-1111-1111-111111111111',
    '2026-04-01T09:00:00Z'::timestamptz,
    '2026-04-10T09:00:00Z'::timestamptz
  ),
  (
    '94000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    'Schedule follow-up counseling session',
    'pending',
    '2026-04-20'::date,
    '11111111-1111-1111-1111-111111111111',
    '2026-04-03T09:00:00Z'::timestamptz,
    '2026-04-09T09:00:00Z'::timestamptz
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  target_date = EXCLUDED.target_date,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.member_care_requirements (
  id,
  tenant_id,
  missionary_id,
  activity_type,
  interval_days,
  notes,
  updated_by,
  created_at,
  updated_at
)
VALUES
  (
    '95000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'check_in',
    30,
    'Monthly wellness check-in cadence.',
    '11111111-1111-1111-1111-111111111111',
    '2026-03-20T09:00:00Z'::timestamptz,
    '2026-04-05T09:00:00Z'::timestamptz
  ),
  (
    '95000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    'video_call',
    14,
    'Biweekly video care rhythm.',
    '11111111-1111-1111-1111-111111111111',
    '2026-03-22T09:00:00Z'::timestamptz,
    '2026-04-04T09:00:00Z'::timestamptz
  )
ON CONFLICT (id) DO UPDATE
SET
  activity_type = EXCLUDED.activity_type,
  interval_days = EXCLUDED.interval_days,
  notes = EXCLUDED.notes,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.member_care_private_notes (
  id,
  tenant_id,
  missionary_id,
  author_user_id,
  author_name_snapshot,
  content,
  created_at,
  updated_at
)
VALUES
  (
    '96000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Jordan Hale',
    '<p>Confidential pastoral note for the demo author-only secure notes surface.</p>',
    '2026-04-05T15:00:00Z'::timestamptz,
    '2026-04-05T15:00:00Z'::timestamptz
  )
ON CONFLICT (id) DO UPDATE
SET
  author_name_snapshot = EXCLUDED.author_name_snapshot,
  content = EXCLUDED.content,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.follower_requests (
  id,
  donor_id,
  missionary_id,
  status,
  access_level,
  created_at,
  updated_at,
  resolved_at
)
SELECT
  ('93000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  ('30000000-0000-0000-0000-' || lpad((gs + 5)::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  (ARRAY['pending','approved','rejected'])[((gs - 1) % 3) + 1],
  (ARRAY['view','pray','comment'])[((gs - 1) % 3) + 1],
  ('2026-01-02T10:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  ('2026-01-02T12:00:00Z'::timestamptz + ((gs - 1) * interval '2 days')),
  CASE
    WHEN (ARRAY['pending','approved','rejected'])[((gs - 1) % 3) + 1] = 'pending' THEN NULL
    ELSE ('2026-01-03T12:00:00Z'::timestamptz + ((gs - 1) * interval '2 days'))
  END
FROM generate_series(1, 10) AS gs;

INSERT INTO public.missionary_tasks (
  id,
  missionary_id,
  donor_id,
  title,
  description,
  task_type,
  status,
  priority,
  sort_key,
  due_date,
  completed_at,
  created_at,
  updated_at
)
SELECT
  ('94000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  ('30000000-0000-0000-0000-' || lpad((((gs - 1) % 15) + 1)::text, 12, '0'))::uuid,
  format('Task %s', gs),
  CASE WHEN gs % 4 = 0 THEN NULL ELSE 'Follow up with supporter and capture next action.' END,
  (ARRAY['call','email','note','report'])[((gs - 1) % 4) + 1],
  (ARRAY['pending','in_progress','completed','cancelled'])[((gs - 1) % 4) + 1],
  (ARRAY['high','medium','low'])[((gs - 1) % 3) + 1],
  gs,
  ('2026-02-10T09:00:00Z'::timestamptz + ((gs - 1) * interval '1 day')),
  CASE
    WHEN (ARRAY['pending','in_progress','completed','cancelled'])[((gs - 1) % 4) + 1] = 'completed'
      THEN ('2026-02-05T10:00:00Z'::timestamptz + ((gs - 1) * interval '1 day'))
    ELSE NULL
  END,
  ('2026-01-20T08:00:00Z'::timestamptz + ((gs - 1) * interval '1 day')),
  ('2026-02-12T11:00:00Z'::timestamptz - ((gs - 1) * interval '30 minutes'))
FROM generate_series(1, 18) AS gs;

INSERT INTO public.locations (
  id,
  tenant_id,
  title,
  lat,
  lng,
  type,
  linked_id,
  summary,
  image_public_id,
  status,
  sort_key,
  created_at,
  updated_at
)
SELECT
  ('95000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000001',
  format('Location %s', gs),
  (-1.31 + (gs * 0.012))::double precision,
  (36.70 + (gs * 0.017))::double precision,
  (ARRAY['missionary','project','custom','partner'])[((gs - 1) % 4) + 1],
  CASE
    WHEN (ARRAY['missionary','project','custom','partner'])[((gs - 1) % 4) + 1] = 'missionary'
      THEN ('20000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))
    WHEN (ARRAY['missionary','project','custom','partner'])[((gs - 1) % 4) + 1] = 'project'
      THEN ('40000000-0000-0000-0000-' || lpad((((gs - 1) % 8) + 1)::text, 12, '0'))
    ELSE NULL
  END,
  CASE WHEN gs % 3 = 0 THEN NULL ELSE 'Pinned map location used by the demo UI.' END,
  CASE WHEN gs % 3 = 0 THEN NULL ELSE format('location/%s', gs) END,
  CASE WHEN gs IN (3, 7, 10) THEN 'draft' ELSE 'published' END,
  gs,
  ('2025-11-08T07:00:00Z'::timestamptz + ((gs - 1) * interval '6 days')),
  ('2026-02-09T13:00:00Z'::timestamptz - ((gs - 1) * interval '2 hours'))
FROM generate_series(1, 10) AS gs;

INSERT INTO public.pdf_templates (
  id,
  tenant_id,
  name,
  description,
  thumbnail,
  design,
  html,
  category,
  page_size,
  orientation,
  margins,
  tags,
  status,
  is_default,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    '96000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Receipt Draft',
    'Working draft for contribution receipts.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    '{"version":1,"blocks":[{"type":"header","text":"Receipt"}]}'::jsonb,
    NULL,
    'receipt',
    'Letter',
    'portrait',
    '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    ARRAY['receipt','draft'],
    'draft',
    FALSE,
    '11111111-1111-1111-1111-111111111111',
    '2025-12-10T10:00:00Z'::timestamptz,
    '2026-01-05T10:00:00Z'::timestamptz
  ),
  (
    '96000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Monthly Impact Newsletter',
    'Default newsletter used by demo campaigns.',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    '{"version":1,"blocks":[{"type":"header","text":"Impact Newsletter"}]}'::jsonb,
    '<h1>Impact Newsletter</h1>',
    'newsletter',
    'Letter',
    'portrait',
    '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    ARRAY['newsletter','default'],
    'published',
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    '2025-11-20T10:00:00Z'::timestamptz,
    '2026-02-10T10:00:00Z'::timestamptz
  ),
  (
    '96000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Partner Briefing Sheet',
    NULL,
    NULL,
    '{"version":1,"blocks":[{"type":"text","text":"Partner briefing"}]}'::jsonb,
    NULL,
    'briefing',
    'A4',
    'landscape',
    '{"top":48,"right":48,"bottom":48,"left":48}'::jsonb,
    ARRAY['briefing'],
    'published',
    FALSE,
    '11111111-1111-1111-1111-111111111111',
    '2025-12-01T10:00:00Z'::timestamptz,
    '2026-01-25T10:00:00Z'::timestamptz
  ),
  (
    '96000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Annual Summary Layout',
    'Long-form annual report template.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    '{"version":1,"blocks":[{"type":"chart","text":"Annual summary"}]}'::jsonb,
    NULL,
    'report',
    'Letter',
    'portrait',
    '{"top":60,"right":60,"bottom":60,"left":60}'::jsonb,
    ARRAY['annual','report'],
    'draft',
    FALSE,
    '11111111-1111-1111-1111-111111111111',
    '2025-12-15T10:00:00Z'::timestamptz,
    '2026-02-01T10:00:00Z'::timestamptz
  );

INSERT INTO public.assets (
  id,
  public_id,
  secure_url,
  width,
  height,
  format,
  resource_type,
  purpose,
  user_id,
  tenant_id,
  metadata,
  created_at,
  updated_at
)
SELECT
  ('97000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  format('demo/assets/%s', gs),
  format('https://images.unsplash.com/photo-%s', 1720000000000 + gs),
  1200 + (gs * 10),
  800 + (gs * 8),
  'jpg',
  'image',
  (ARRAY['missionary_cover','post_image','pdf_thumbnail'])[((gs - 1) % 3) + 1],
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  jsonb_build_object('alt', format('Demo asset %s', gs)),
  ('2025-11-12T08:00:00Z'::timestamptz + ((gs - 1) * interval '4 days')),
  ('2026-02-08T08:00:00Z'::timestamptz - ((gs - 1) * interval '2 hours'))
FROM generate_series(1, 12) AS gs;

INSERT INTO public.audit_logs (
  id,
  tenant_id,
  user_id,
  action,
  resource_type,
  resource_id,
  details,
  ip_address,
  user_agent,
  created_at
)
SELECT
  ('98000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  (ARRAY['donation_completed','post_created','campaign_sent','pledge_updated'])[((gs - 1) % 4) + 1],
  (ARRAY['donation','post','campaign','pledge'])[((gs - 1) % 4) + 1],
  CASE
    WHEN ((gs - 1) % 4) + 1 = 1 THEN ('80000000-0000-0000-0000-' || lpad((((gs - 1) % 28) + 1)::text, 12, '0'))
    WHEN ((gs - 1) % 4) + 1 = 2 THEN ('50000000-0000-0000-0000-' || lpad((((gs - 1) % 36) + 1)::text, 12, '0'))
    WHEN ((gs - 1) % 4) + 1 = 3 THEN ('70000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))
    ELSE ('60000000-0000-0000-0000-' || lpad((((gs - 1) % 10) + 1)::text, 12, '0'))
  END,
  jsonb_build_object('sequence', gs, 'source', 'seed'),
  '127.0.0.1',
  'seed-demo-script',
  ('2025-11-10T07:00:00Z'::timestamptz + ((gs - 1) * interval '3 days'))
FROM generate_series(1, 24) AS gs;

-- ---------------------------------------------------------------------------
-- 6) Queue-like tables added in Foundation 1
-- ---------------------------------------------------------------------------
WITH attempt_seed AS (
  SELECT
    gs,
    ((gs - 1) / 2) + 1 AS pledge_idx,
    CASE WHEN gs % 2 = 1 THEN 1 ELSE 2 END AS attempt_number
  FROM generate_series(1, 12) AS gs
),
attempt_enriched AS (
  SELECT
    ('98500000-0000-0000-0000-' || lpad(a.gs::text, 12, '0'))::uuid AS id,
    a.pledge_idx,
    a.attempt_number,
    p.id AS pledge_id,
    p.donor_id,
    p.amount,
    (date '2026-01-05' + ((a.pledge_idx - 1) * interval '7 days') + ((a.attempt_number - 1) * interval '2 days'))::date AS scheduled_for_date
  FROM attempt_seed a
  JOIN public.donor_pledges p
    ON p.id = ('60000000-0000-0000-0000-' || lpad(a.pledge_idx::text, 12, '0'))::uuid
)
INSERT INTO public.pledge_charge_attempts (
  id,
  tenant_id,
  pledge_id,
  donor_id,
  donation_id,
  attempt_number,
  status,
  amount,
  currency,
  scheduled_for_date,
  stripe_payment_intent_id,
  gateway_response,
  error_code,
  error_message,
  attempted_at,
  created_at,
  updated_at
)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  pledge_id,
  donor_id,
  NULL,
  attempt_number,
  CASE
    WHEN attempt_number = 1 AND pledge_idx IN (2, 5) THEN 'failed'
    WHEN attempt_number = 1 THEN 'succeeded'
    ELSE 'created'
  END,
  amount,
  'usd',
  scheduled_for_date,
  format('pi_charge_%s', lpad((pledge_idx * 10 + attempt_number)::text, 6, '0')),
  jsonb_build_object('attempt_number', attempt_number, 'seed', true),
  CASE
    WHEN attempt_number = 1 AND pledge_idx IN (2, 5) THEN 'insufficient_funds'
    ELSE NULL
  END,
  CASE
    WHEN attempt_number = 1 AND pledge_idx IN (2, 5) THEN 'Issuer returned insufficient funds.'
    ELSE NULL
  END,
  (scheduled_for_date::timestamp + interval '10 hours')::timestamptz,
  (scheduled_for_date::timestamp + interval '10 hours')::timestamptz,
  (scheduled_for_date::timestamp + interval '10 hours 5 minutes')::timestamptz
FROM attempt_enriched;

INSERT INTO public.notification_queue (
  id,
  tenant_id,
  campaign_id,
  donor_id,
  recipient_donor_id,
  profile_id,
  notification_type,
  channel,
  template_key,
  payload,
  dedupe_key,
  status,
  attempts,
  scheduled_for,
  available_at,
  processed_at,
  last_error,
  created_at,
  updated_at
)
SELECT
  ('99000000-0000-0000-0000-' || lpad(gs::text, 12, '0'))::uuid,
  '00000000-0000-0000-0000-000000000001',
  CASE WHEN gs % 4 = 0 THEN NULL ELSE ('70000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))::uuid END,
  ('30000000-0000-0000-0000-' || lpad((((gs - 1) % 6) + 1)::text, 12, '0'))::uuid,
  ('30000000-0000-0000-0000-' || lpad((((gs - 1) % 15) + 1)::text, 12, '0'))::uuid,
  '11111111-1111-1111-1111-111111111111',
  (ARRAY['campaign_update','donation_receipt','task_reminder'])[((gs - 1) % 3) + 1],
  (ARRAY['email','sms','in_app'])[((gs - 1) % 3) + 1],
  (ARRAY['campaign-default','receipt-default','task-reminder'])[((gs - 1) % 3) + 1],
  jsonb_build_object('sequence', gs, 'priority', CASE WHEN gs % 5 = 0 THEN 'high' ELSE 'normal' END),
  format('demo-nq-%s', lpad(gs::text, 4, '0')),
  CASE
    WHEN gs % 6 = 0 THEN 'failed'
    WHEN gs % 3 = 0 THEN 'sent'
    ELSE 'queued'
  END,
  CASE
    WHEN gs % 6 = 0 THEN 2
    WHEN gs % 3 = 0 THEN 1
    ELSE 0
  END,
  ('2026-02-16T06:00:00Z'::timestamptz + ((gs - 1) * interval '3 hours')),
  ('2026-02-16T05:45:00Z'::timestamptz + ((gs - 1) * interval '3 hours')),
  CASE
    WHEN gs % 6 = 0 OR gs % 3 = 0 THEN ('2026-02-16T06:20:00Z'::timestamptz + ((gs - 1) * interval '3 hours'))
    ELSE NULL
  END,
  CASE WHEN gs % 6 = 0 THEN 'Temporary downstream timeout.' ELSE NULL END,
  ('2026-02-16T05:30:00Z'::timestamptz + ((gs - 1) * interval '3 hours')),
  ('2026-02-16T05:40:00Z'::timestamptz + ((gs - 1) * interval '3 hours'))
FROM generate_series(1, 20) AS gs;

-- ---------------------------------------------------------------------------
-- 7) Derived metric alignment for realistic UI state
-- ---------------------------------------------------------------------------
UPDATE public.posts p
SET
  like_count = COALESCE(l.like_count, 0),
  prayer_count = COALESCE(pr.prayer_count, 0),
  comment_count = COALESCE(c.comment_count, 0),
  updated_at = GREATEST(
    p.updated_at,
    COALESCE(l.last_like_at, p.updated_at),
    COALESCE(pr.last_prayer_at, p.updated_at),
    COALESCE(c.last_comment_at, p.updated_at)
  )
FROM (
  SELECT post_id, COUNT(*)::int AS like_count, MAX(created_at) AS last_like_at
  FROM public.post_likes
  GROUP BY post_id
) l
FULL JOIN (
  SELECT post_id, COUNT(*)::int AS prayer_count, MAX(created_at) AS last_prayer_at
  FROM public.post_prayers
  GROUP BY post_id
) pr ON pr.post_id = l.post_id
FULL JOIN (
  SELECT post_id, COUNT(*)::int AS comment_count, MAX(created_at) AS last_comment_at
  FROM public.post_comments
  GROUP BY post_id
) c ON c.post_id = COALESCE(l.post_id, pr.post_id)
WHERE p.id = COALESCE(l.post_id, pr.post_id, c.post_id);

WITH donor_rollup AS (
  SELECT
    donor_id,
    MIN(gift_date) AS first_gift_date,
    MAX(gift_date)::timestamptz AS last_gift_date,
    COUNT(*)::int AS gift_count,
    COALESCE(SUM(amount - refund_amount), 0)::bigint AS total_given
  FROM public.donations
  WHERE donor_id IS NOT NULL
    AND status IN ('completed', 'refunded')
  GROUP BY donor_id
),
donor_latest AS (
  SELECT DISTINCT ON (donor_id)
    donor_id,
    amount AS last_gift_amount
  FROM public.donations
  WHERE donor_id IS NOT NULL
    AND status IN ('completed', 'refunded')
  ORDER BY donor_id, gift_date DESC, created_at DESC
)
UPDATE public.donors d
SET
  first_gift_date = r.first_gift_date,
  last_gift_date = r.last_gift_date,
  gift_count = r.gift_count,
  total_given = r.total_given,
  last_gift_amount = COALESCE(dl.last_gift_amount, 0),
  has_active_pledge = EXISTS (
    SELECT 1
    FROM public.donor_pledges dp
    WHERE dp.donor_id = d.id
      AND dp.status = 'active'
  ),
  updated_at = '2026-02-16T10:30:00Z'::timestamptz
FROM donor_rollup r
LEFT JOIN donor_latest dl ON dl.donor_id = r.donor_id
WHERE d.id = r.donor_id;

UPDATE public.funds f
SET current_amount = COALESCE(x.total_fund_amount, 0)
FROM (
  SELECT
    fund_id,
    SUM(amount - refund_amount)::bigint AS total_fund_amount
  FROM public.donations
  WHERE fund_id IS NOT NULL
    AND status IN ('completed', 'refunded')
  GROUP BY fund_id
) x
WHERE f.id = x.fund_id;

UPDATE public.funds
SET current_amount = 0
WHERE id = '40000000-0000-0000-0000-000000000008';

UPDATE public.missionaries m
SET current_funding = COALESCE(x.total_missionary_amount, 0)
FROM (
  SELECT
    missionary_id,
    SUM(amount - refund_amount)::bigint AS total_missionary_amount
  FROM public.donations
  WHERE missionary_id IS NOT NULL
    AND status IN ('completed', 'refunded')
  GROUP BY missionary_id
) x
WHERE m.id = x.missionary_id;

UPDATE public.campaigns c
SET current_amount = COALESCE(x.total_campaign_amount, 0)
FROM (
  SELECT
    campaign_id,
    SUM(amount - refund_amount)::bigint AS total_campaign_amount
  FROM public.donations
  WHERE campaign_id IS NOT NULL
    AND status IN ('completed', 'refunded')
  GROUP BY campaign_id
) x
WHERE c.id = x.campaign_id;

COMMIT;

-- ---------------------------------------------------------------------------
-- Sanity queries (run manually after seeding)
-- ---------------------------------------------------------------------------
-- SELECT COUNT(*) AS profiles FROM public.profiles;
-- SELECT COUNT(*) AS missionaries FROM public.missionaries;
-- SELECT COUNT(*) AS donors FROM public.donors;
-- SELECT COUNT(*) AS funds FROM public.funds;
-- SELECT COUNT(*) AS posts FROM public.posts;
-- SELECT COUNT(*) AS campaigns FROM public.campaigns;
-- SELECT COUNT(*) AS donations FROM public.donations;
-- SELECT COUNT(*) AS notification_queue FROM public.notification_queue;
-- SELECT COUNT(*) AS pledge_charge_attempts FROM public.pledge_charge_attempts;
