BEGIN;

ALTER TABLE public.missionaries
    ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
    ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'North America',
    ADD COLUMN IF NOT EXISTS health_status TEXT NOT NULL DEFAULT 'healthy',
    ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS manual_attention BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS health_signals JSONB NOT NULL DEFAULT
      jsonb_build_object(
        'emotional', 50,
        'spiritual', 50,
        'physical', 50,
        'financial', 50
      ),
    ADD COLUMN IF NOT EXISTS birth_date DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_health_status_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_health_status_check
      CHECK (health_status IN ('healthy', 'needs_attention', 'at_risk', 'crisis'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_region_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_region_check
      CHECK (region IN (
        'Africa',
        'SE Asia',
        'Europe',
        'Latin America',
        'Middle East',
        'North America'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'missionaries_health_signals_object_check'
      AND conrelid = 'public.missionaries'::regclass
  ) THEN
    ALTER TABLE public.missionaries
      ADD CONSTRAINT missionaries_health_signals_object_check
      CHECK (jsonb_typeof(health_signals) = 'object');
  END IF;
END $$;

UPDATE public.missionaries AS m
SET timezone = COALESCE(t.default_timezone, 'UTC')
FROM public.tenants AS t
WHERE m.tenant_id = t.id
  AND m.timezone = 'UTC';

CREATE TABLE IF NOT EXISTS public.member_care_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    author_name_snapshot TEXT,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_activities_type_check CHECK (type IN (
      'video_call',
      'in_person_visit',
      'check_in',
      'pastoral_note',
      'care_plan_update',
      'crisis_intervention',
      'birthday',
      'prayer_request'
    ))
);

CREATE TABLE IF NOT EXISTS public.member_care_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    target_date DATE,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_goals_status_check CHECK (status IN ('pending', 'active', 'completed'))
);

CREATE TABLE IF NOT EXISTS public.member_care_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    interval_days INTEGER NOT NULL CHECK (interval_days > 0),
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT member_care_requirements_activity_type_check CHECK (activity_type IN (
      'video_call',
      'in_person_visit',
      'check_in',
      'pastoral_note',
      'care_plan_update',
      'crisis_intervention',
      'birthday',
      'prayer_request'
    ))
);

CREATE TABLE IF NOT EXISTS public.member_care_private_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    missionary_id UUID NOT NULL REFERENCES public.missionaries(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    author_name_snapshot TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_care_activities_tenant_missionary_occurred_at
    ON public.member_care_activities (tenant_id, missionary_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_care_activities_tenant_author_occurred_at
    ON public.member_care_activities (tenant_id, author_user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_care_goals_tenant_missionary_status
    ON public.member_care_goals (tenant_id, missionary_id, status);

CREATE INDEX IF NOT EXISTS idx_member_care_requirements_tenant_missionary
    ON public.member_care_requirements (tenant_id, missionary_id);

CREATE INDEX IF NOT EXISTS idx_member_care_private_notes_tenant_missionary_author_created_at
    ON public.member_care_private_notes (
      tenant_id,
      missionary_id,
      author_user_id,
      created_at DESC
    );

ALTER TABLE public.member_care_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_care_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_care_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_care_private_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.member_care_activities FROM anon;
REVOKE ALL ON TABLE public.member_care_goals FROM anon;
REVOKE ALL ON TABLE public.member_care_requirements FROM anon;
REVOKE ALL ON TABLE public.member_care_private_notes FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.member_care_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.member_care_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.member_care_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.member_care_private_notes TO authenticated;

GRANT ALL ON TABLE public.member_care_activities TO service_role;
GRANT ALL ON TABLE public.member_care_goals TO service_role;
GRANT ALL ON TABLE public.member_care_requirements TO service_role;
GRANT ALL ON TABLE public.member_care_private_notes TO service_role;

DROP POLICY IF EXISTS "member care activities select" ON public.member_care_activities;
CREATE POLICY "member care activities select"
  ON public.member_care_activities
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "member care activities insert" ON public.member_care_activities;
CREATE POLICY "member care activities insert"
  ON public.member_care_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL))
    AND auth.uid() IS NOT NULL
    AND auth.uid() = author_user_id
  );

DROP POLICY IF EXISTS "member care activities update" ON public.member_care_activities;
CREATE POLICY "member care activities update"
  ON public.member_care_activities
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() = author_user_id
    )
  )
  WITH CHECK (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() = author_user_id
    )
  );

DROP POLICY IF EXISTS "member care activities delete" ON public.member_care_activities;
CREATE POLICY "member care activities delete"
  ON public.member_care_activities
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() = author_user_id
    )
  );

DROP POLICY IF EXISTS "member care goals select" ON public.member_care_goals;
CREATE POLICY "member care goals select"
  ON public.member_care_goals
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "member care goals insert" ON public.member_care_goals;
CREATE POLICY "member care goals insert"
  ON public.member_care_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() IS NOT NULL
      AND updated_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "member care goals update" ON public.member_care_goals;
CREATE POLICY "member care goals update"
  ON public.member_care_goals
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() IS NOT NULL
      AND updated_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "member care goals delete" ON public.member_care_goals;
CREATE POLICY "member care goals delete"
  ON public.member_care_goals
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "member care requirements select" ON public.member_care_requirements;
CREATE POLICY "member care requirements select"
  ON public.member_care_requirements
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "member care requirements insert" ON public.member_care_requirements;
CREATE POLICY "member care requirements insert"
  ON public.member_care_requirements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() IS NOT NULL
      AND updated_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "member care requirements update" ON public.member_care_requirements;
CREATE POLICY "member care requirements update"
  ON public.member_care_requirements
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR (
      authz.has_staff_membership(tenant_id, NULL)
      AND auth.uid() IS NOT NULL
      AND updated_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "member care requirements delete" ON public.member_care_requirements;
CREATE POLICY "member care requirements delete"
  ON public.member_care_requirements
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "member care private notes select" ON public.member_care_private_notes;
CREATE POLICY "member care private notes select"
  ON public.member_care_private_notes
  FOR SELECT
  TO authenticated
  USING (
    authz.is_super_admin()
    OR auth.uid() = author_user_id
  );

DROP POLICY IF EXISTS "member care private notes insert" ON public.member_care_private_notes;
CREATE POLICY "member care private notes insert"
  ON public.member_care_private_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_user_id
    AND (
      authz.is_super_admin()
      OR authz.has_staff_membership(tenant_id, NULL)
    )
  );

DROP POLICY IF EXISTS "member care private notes update" ON public.member_care_private_notes;
CREATE POLICY "member care private notes update"
  ON public.member_care_private_notes
  FOR UPDATE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR auth.uid() = author_user_id
  )
  WITH CHECK (
    authz.is_super_admin()
    OR auth.uid() = author_user_id
  );

DROP POLICY IF EXISTS "member care private notes delete" ON public.member_care_private_notes;
CREATE POLICY "member care private notes delete"
  ON public.member_care_private_notes
  FOR DELETE
  TO authenticated
  USING (
    authz.is_super_admin()
    OR auth.uid() = author_user_id
  );

COMMIT;
