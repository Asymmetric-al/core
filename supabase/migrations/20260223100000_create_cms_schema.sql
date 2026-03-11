-- Dedicated schema for Payload CMS managed tables.
-- This keeps CMS content isolated from the existing public application tables.

CREATE SCHEMA IF NOT EXISTS cms;

COMMENT ON SCHEMA cms IS 'Payload CMS schema';

GRANT USAGE ON SCHEMA cms TO postgres, anon, authenticated, service_role;
GRANT CREATE ON SCHEMA cms TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA cms
  GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER, REFERENCES
  ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA cms
  GRANT USAGE, SELECT, UPDATE
  ON SEQUENCES TO service_role;
