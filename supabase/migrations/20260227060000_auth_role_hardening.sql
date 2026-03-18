-- Auth role hardening:
-- 1) enforce allowlisted roles at DB level
-- 2) force public self-registration users to donor role

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    UPDATE public.profiles
    SET role = 'donor'
    WHERE role IS NULL
       OR role NOT IN (
         'admin',
         'staff',
         'super_admin',
         'missionary',
         'donor',
         'finance',
         'fundraising',
         'mobilizers',
         'member_care',
         'events',
         'delivery',
         'ticketing',
         'machinery'
       );

    ALTER TABLE public.profiles
      ALTER COLUMN role SET DEFAULT 'donor',
      ALTER COLUMN role SET NOT NULL;

    ALTER TABLE public.profiles
      DROP CONSTRAINT IF EXISTS profiles_role_check;

    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (
        role IN (
          'admin',
          'staff',
          'super_admin',
          'missionary',
          'donor',
          'finance',
          'fundraising',
          'mobilizers',
          'member_care',
          'events',
          'delivery',
          'ticketing',
          'machinery'
        )
      );
  END IF;
END
$$;

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
    'donor',
    COALESCE((new.raw_app_meta_data->>'tenant_id')::uuid, '00000000-0000-0000-0000-000000000001'::uuid)
  );
  RETURN new;
END;
$function$;
