BEGIN;

CREATE FUNCTION platform.guard_recorded_heads() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  RAISE EXCEPTION 'platform: recorded migration heads cannot be removed' USING ERRCODE = '42501';
END;
$$;

REVOKE ALL ON FUNCTION platform.guard_recorded_heads() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER migration_heads_no_delete BEFORE DELETE ON platform.migration_heads
  FOR EACH STATEMENT EXECUTE FUNCTION platform.guard_recorded_heads();
CREATE TRIGGER migration_heads_no_truncate BEFORE TRUNCATE ON platform.migration_heads
  FOR EACH STATEMENT EXECUTE FUNCTION platform.guard_recorded_heads();

ALTER TABLE platform.migration_heads ENABLE ALWAYS TRIGGER migration_heads_no_delete;
ALTER TABLE platform.migration_heads ENABLE ALWAYS TRIGGER migration_heads_no_truncate;

COMMIT;
