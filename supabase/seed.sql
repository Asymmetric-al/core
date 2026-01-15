-- Deterministic seed data for cloud development and demos.
-- Covers all tables used by routes/hooks and common app flows.

-- =========================
-- TENANT
-- =========================
INSERT INTO public.tenants (id, name, slug, org_post_visibility)
VALUES ('00000000-0000-0000-0000-000000000001', 'GiveHope Organization', 'give-hope', 'all_donors')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AUTH USERS (TRIGGER -> PROFILES)
-- =========================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'admin@givehope.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Grace","last_name":"Admin","full_name":"Grace Admin","avatar_url":"https://example.com/avatars/admin.png","role":"admin"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'jordan.rivera@givehope.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Jordan","last_name":"Rivera","full_name":"Jordan Rivera","avatar_url":"https://example.com/avatars/jordan.png","role":"missionary"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'ava.chen@givehope.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Ava","last_name":"Chen","full_name":"Ava Chen","avatar_url":"https://example.com/avatars/ava.png","role":"missionary"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'pat.lopez@donors.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Pat","last_name":"Lopez","full_name":"Pat Lopez","avatar_url":"https://example.com/avatars/pat.png","role":"donor"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'sam.carter@donors.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Sam","last_name":"Carter","full_name":"Sam Carter","avatar_url":"https://example.com/avatars/sam.png","role":"donor"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    (SELECT id FROM auth.instances LIMIT 1),
    'authenticated',
    'authenticated',
    'riley.singh@donors.test',
    extensions.crypt('password'::text, extensions.gen_salt('bf'::text)),
    NOW(),
    '{"provider":"email","providers":["email"],"tenant_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    '{"first_name":"Riley","last_name":"Singh","full_name":"Riley Singh","avatar_url":"https://example.com/avatars/riley.png","role":"donor"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Ensure display_name/phone are populated beyond the trigger defaults.
WITH profile_updates (id, display_name, phone) AS (
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Grace Admin', '555-0100'),
    ('b378164f-8a6a-42c8-883f-59815d01e48c'::uuid, 'Jordan Rivera', '555-0101'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Ava Chen', '555-0102'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Pat Lopez', '555-0103'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'Sam Carter', '555-0104'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'Riley Singh', '555-0105')
)
UPDATE public.profiles p
SET display_name = u.display_name,
    phone = u.phone,
    updated_at = NOW()
FROM profile_updates u
WHERE p.id = u.id;

-- =========================
-- MISSIONARIES
-- =========================
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
  cover_url,
  social_links
)
VALUES
  (
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    '00000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Serving families in Nairobi through clean water initiatives.',
    'East Africa',
    6000,
    4560,
    'Building sustainable wells',
    'Nairobi, Kenya',
    '555-0101',
    'https://example.com/covers/jordan.jpg',
    '{"instagram":"https://instagram.com/jordanrivera","website":"https://givehope.test/jordan"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Supporting literacy programs in rural communities.',
    'SE Asia',
    5000,
    1250,
    'Every child reading',
    'Chiang Mai, Thailand',
    '555-0102',
    'https://example.com/covers/ava.jpg',
    '{"facebook":"https://facebook.com/avachen","website":"https://givehope.test/ava"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- DONORS
-- =========================
INSERT INTO public.donors (
  id,
  tenant_id,
  profile_id,
  missionary_id,
  name,
  email,
  phone,
  preferred_contact,
  avatar_url,
  location,
  type,
  status,
  giving_preferences,
  total_given,
  last_gift_date,
  last_gift_amount,
  frequency,
  tags,
  score,
  address,
  notes,
  has_active_pledge
)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Pat Lopez',
    'pat.lopez@donors.test',
    '555-0103',
    'email',
    'https://example.com/avatars/pat.png',
    'Austin, TX',
    'individual',
    'Active',
    '{"causes":["water","health"]}'::jsonb,
    1250,
    NOW() - INTERVAL '14 days',
    50,
    'Monthly',
    ARRAY['church', 'monthly'],
    82,
    '{"city":"Austin","state":"TX"}'::jsonb,
    'Loves impact reports.',
    TRUE
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Sam Carter',
    'sam.carter@donors.test',
    '555-0104',
    'phone',
    'https://example.com/avatars/sam.png',
    'Portland, OR',
    'individual',
    'Lapsed',
    '{"causes":["education"]}'::jsonb,
    400,
    NOW() - INTERVAL '120 days',
    40,
    'Quarterly',
    ARRAY['at-risk'],
    44,
    '{"city":"Portland","state":"OR"}'::jsonb,
    'Prefers phone check-ins.',
    FALSE
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Riley Singh',
    'riley.singh@donors.test',
    '555-0105',
    'email',
    'https://example.com/avatars/riley.png',
    'Denver, CO',
    'individual',
    'At Risk',
    '{"causes":["literacy"]}'::jsonb,
    200,
    NOW() - INTERVAL '45 days',
    25,
    'Monthly',
    ARRAY['new'],
    60,
    '{"city":"Denver","state":"CO"}'::jsonb,
    'Interested in project updates.',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- FUNDS
-- =========================
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
  end_date
)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Nairobi Water Initiative',
    'Building sustainable wells in Nairobi.',
    10000,
    10000,
    4200,
    'usd',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    TRUE,
    CURRENT_DATE - 30,
    CURRENT_DATE + 180
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Education & Literacy',
    'Books and teacher training materials.',
    5000,
    5000,
    5000,
    'usd',
    '22222222-2222-2222-2222-222222222222',
    FALSE,
    CURRENT_DATE - 365,
    CURRENT_DATE - 10
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- POSTS
-- =========================
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
VALUES
  (
    '80000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Well Drilling Update',
    'We reached 75% of our monthly goal. Thank you partners.',
    '[]'::jsonb,
    'https://example.com/posts/well.jpg',
    'Update',
    'missionary_update',
    'public',
    'published',
    2,
    1,
    2,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Prayer Request Draft',
    'Draft post for partners only.',
    '[]'::jsonb,
    NULL,
    'Prayer Request',
    'missionary_update',
    'partners_only',
    'draft',
    0,
    0,
    0,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '80000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'New Reading Center',
    'We opened a new reading center this week.',
    '[]'::jsonb,
    NULL,
    'Story',
    'missionary_update',
    'public',
    'published',
    0,
    0,
    0,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- POST INTERACTIONS
-- =========================
INSERT INTO public.post_likes (id, post_id, user_id, created_at)
VALUES
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days'),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.post_prayers (id, post_id, user_id, created_at)
VALUES
  ('81000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.post_fires (id, post_id, user_id, created_at)
VALUES
  ('81000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.post_comments (id, post_id, user_id, parent_id, content, created_at, updated_at)
VALUES
  ('82000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', NULL, 'Praying for you!', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('82000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'b378164f-8a6a-42c8-883f-59815d01e48c', '82000000-0000-0000-0000-000000000001', 'Thank you!', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- DONATIONS (PENDING / COMPLETED / FAILED)
-- =========================
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
  created_at,
  updated_at
)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    NULL,
    50,
    'usd',
    'pending',
    'one_time',
    'card',
    FALSE,
    NULL,
    'Processing payment intent.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000002',
    NULL,
    '70000000-0000-0000-0000-000000000001',
    100,
    'usd',
    'completed',
    'recurring',
    'bank_transfer',
    TRUE,
    'monthly',
    'Monthly recurring fund support.',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    75,
    'usd',
    'failed',
    'one_time',
    'card',
    FALSE,
    NULL,
    'Card declined.',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- FOLLOWS
-- =========================
INSERT INTO public.follows (id, tenant_id, donor_id, missionary_id, created_at)
VALUES
  ('93000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'b378164f-8a6a-42c8-883f-59815d01e48c', NOW() - INTERVAL '20 days'),
  ('93000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'b378164f-8a6a-42c8-883f-59815d01e48c', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- DONOR FEED PREFERENCES
-- =========================
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
VALUES
  (
    '95000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '95000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '95000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- DONOR ACTIVITIES
-- =========================
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
VALUES
  (
    '92000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    'gift',
    'December Gift',
    'Online gift via card.',
    NOW() - INTERVAL '12 days',
    50,
    'completed',
    'one_time',
    NULL,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ),
  (
    '92000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000002',
    'call',
    'Check-in Call',
    'Discussed upcoming projects.',
    NOW() - INTERVAL '60 days',
    NULL,
    'done',
    NULL,
    'Left voicemail.',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
  ),
  (
    '92000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000003',
    'pledge_started',
    'New Pledge Started',
    'First pledge for literacy fund.',
    NOW() - INTERVAL '40 days',
    25,
    'active',
    'pledge',
    NULL,
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '40 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- DONOR PLEDGES (ACTIVE / PAUSED / CANCELLED)
-- =========================
INSERT INTO public.donor_pledges (
  id,
  donor_id,
  amount,
  frequency,
  status,
  start_date,
  end_date,
  next_payment_date,
  total_paid,
  total_expected,
  payments_completed,
  payments_remaining,
  payment_method,
  created_at,
  updated_at
)
VALUES
  (
    '91000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    50,
    'monthly',
    'active',
    CURRENT_DATE - 180,
    NULL,
    CURRENT_DATE + 5,
    300,
    600,
    6,
    6,
    'card',
    NOW() - INTERVAL '180 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '91000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000002',
    40,
    'monthly',
    'paused',
    CURRENT_DATE - 365,
    NULL,
    NULL,
    200,
    480,
    5,
    7,
    'bank_transfer',
    NOW() - INTERVAL '365 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    '91000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000003',
    30,
    'monthly',
    'cancelled',
    CURRENT_DATE - 120,
    CURRENT_DATE - 30,
    NULL,
    60,
    120,
    2,
    2,
    'card',
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- FOLLOWER REQUESTS (PENDING / APPROVED / REJECTED)
-- =========================
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
VALUES
  (
    '94000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000003',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'pending',
    'view',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NULL
  ),
  (
    '94000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000002',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'approved',
    'view',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),
  (
    '94000000-0000-0000-0000-000000000003',
    '60000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'rejected',
    'view',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- MISSIONARY TASKS (VARIED STATUS + PRIORITY)
-- =========================
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
VALUES
  (
    '96000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    '60000000-0000-0000-0000-000000000001',
    'Call Pat',
    'Thank them for the latest gift.',
    'call',
    'pending',
    'high',
    1,
    NOW() + INTERVAL '2 days',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '96000000-0000-0000-0000-000000000002',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    '60000000-0000-0000-0000-000000000002',
    'Send update',
    'Share monthly update email.',
    'email',
    'in_progress',
    'medium',
    2,
    NOW() + INTERVAL '5 days',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '96000000-0000-0000-0000-000000000003',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    '60000000-0000-0000-0000-000000000002',
    'Thank Sam',
    'Send handwritten note.',
    'note',
    'completed',
    'low',
    3,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    '96000000-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222',
    '60000000-0000-0000-0000-000000000003',
    'Follow up with Riley',
    'Schedule a call next week.',
    'call',
    'cancelled',
    'high',
    4,
    NOW() + INTERVAL '7 days',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- LOCATIONS (DRAFT + PUBLISHED)
-- =========================
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
VALUES
  (
    '97000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Nairobi Ministry Base',
    -1.286389,
    36.817223,
    'missionary',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'Primary base for water initiatives.',
    'missionary/m1-base',
    'published',
    1,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '97000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Water Project Site',
    -1.292066,
    36.821945,
    'project',
    '70000000-0000-0000-0000-000000000001',
    'Well drilling site near Nairobi.',
    'projects/water-site',
    'published',
    2,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '97000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Future Outreach Hub',
    -1.300000,
    36.800000,
    'custom',
    NULL,
    'Proposed outreach location.',
    NULL,
    'draft',
    3,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- PDF TEMPLATES
-- =========================
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
    '98000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Donor Receipt Draft',
    'Draft receipt template.',
    'https://example.com/assets/receipt-thumb.png',
    '{"version":1,"blocks":[]}'::jsonb,
    NULL,
    'custom',
    'Letter',
    'portrait',
    '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    ARRAY['receipt','draft'],
    'draft',
    FALSE,
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '98000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Monthly Newsletter',
    'Default newsletter layout.',
    'https://example.com/assets/newsletter-thumb.png',
    '{"version":1,"blocks":[]}'::jsonb,
    NULL,
    'newsletter',
    'Letter',
    'portrait',
    '{"top":72,"right":72,"bottom":72,"left":72}'::jsonb,
    ARRAY['newsletter','default'],
    'published',
    TRUE,
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AUDIT LOGS
-- =========================
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
VALUES
  (
    '99000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'donation_completed',
    'donation',
    '90000000-0000-0000-0000-000000000002',
    '{"amount":100,"currency":"usd"}'::jsonb,
    '127.0.0.1',
    'seed-script',
    NOW() - INTERVAL '10 days'
  ),
  (
    '99000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    'post_created',
    'post',
    '80000000-0000-0000-0000-000000000001',
    '{}'::jsonb,
    '127.0.0.1',
    'seed-script',
    NOW() - INTERVAL '2 days'
  ),
  (
    '99000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'pdf_template_created',
    'pdf_template',
    '98000000-0000-0000-0000-000000000002',
    '{}'::jsonb,
    '127.0.0.1',
    'seed-script',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- ASSETS
-- =========================
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
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'missionary/m1-cover',
    'https://example.com/assets/m1-cover.jpg',
    1600,
    900,
    'jpg',
    'image',
    'missionary_cover',
    'b378164f-8a6a-42c8-883f-59815d01e48c',
    '00000000-0000-0000-0000-000000000001',
    '{"alt":"Jordan Rivera cover"}'::jsonb,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'pdf/newsletter-thumb',
    'https://example.com/assets/newsletter-thumb.jpg',
    800,
    600,
    'jpg',
    'image',
    'pdf_thumbnail',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    '{"alt":"Newsletter thumbnail"}'::jsonb,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================
-- VALIDATION CHECKLIST (RUN MANUALLY)
-- =========================
-- SELECT 'tenants', COUNT(*) FROM public.tenants;
-- SELECT 'profiles', COUNT(*) FROM public.profiles;
-- SELECT 'missionaries', COUNT(*) FROM public.missionaries;
-- SELECT 'donors', COUNT(*) FROM public.donors;
-- SELECT 'funds', COUNT(*) FROM public.funds;
-- SELECT 'posts', COUNT(*) FROM public.posts;
-- SELECT 'post_likes', COUNT(*) FROM public.post_likes;
-- SELECT 'post_prayers', COUNT(*) FROM public.post_prayers;
-- SELECT 'post_fires', COUNT(*) FROM public.post_fires;
-- SELECT 'post_comments', COUNT(*) FROM public.post_comments;
-- SELECT 'donations', COUNT(*) FROM public.donations;
-- SELECT 'follows', COUNT(*) FROM public.follows;
-- SELECT 'donor_feed_preferences', COUNT(*) FROM public.donor_feed_preferences;
-- SELECT 'donor_activities', COUNT(*) FROM public.donor_activities;
-- SELECT 'donor_pledges', COUNT(*) FROM public.donor_pledges;
-- SELECT 'follower_requests', COUNT(*) FROM public.follower_requests;
-- SELECT 'missionary_tasks', COUNT(*) FROM public.missionary_tasks;
-- SELECT 'locations', COUNT(*) FROM public.locations;
-- SELECT 'pdf_templates', COUNT(*) FROM public.pdf_templates;
-- SELECT 'audit_logs', COUNT(*) FROM public.audit_logs;
-- SELECT 'assets', COUNT(*) FROM public.assets;
-- SELECT 'posts_with_authors', COUNT(*) FROM public.posts p
--   JOIN public.missionaries m ON p.missionary_id = m.id
--   JOIN public.profiles pr ON m.profile_id = pr.id;
-- SELECT 'donations_with_donors', COUNT(*) FROM public.donations d
--   JOIN public.donors dn ON d.donor_id = dn.id;
-- SELECT 'donations_with_missionaries', COUNT(*) FROM public.donations d
--   LEFT JOIN public.missionaries m ON d.missionary_id = m.id;
-- SELECT 'follows_to_posts', COUNT(*) FROM public.follows f
--   JOIN public.posts p ON p.missionary_id = f.missionary_id;
