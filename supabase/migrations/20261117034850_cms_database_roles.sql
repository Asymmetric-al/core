-- Payload's own database roles (WP1, AL-2674; plan 7.1, 7.2, 7.3 and 9.3;
-- audit NA-04, NX-05 and C10).
--
-- cms_owner    Login. Owns schema cms and every object in it, and runs the
--              Payload migrations, from the release job only. It holds no
--              right outside cms.
-- cms_runtime  Login. Payload's run-time connection. It reads and writes rows
--              in cms, creates, alters and drops nothing, and holds nothing
--              outside cms. At most ten connections across every instance
--              (plan 9.3).
--
-- Neither role gets a password here, so neither can log in until one is set.
-- The release job sets both from its secrets after this migration (plan 7.5);
-- local and CI runs set their own. Applying this file again changes nothing.
--
-- Rights every role inherits from PUBLIC (CONNECT and TEMPORARY on the
-- database, USAGE on schema public, EXECUTE on functions that were not
-- revoked from PUBLIC) are not removed here: they are not per-role grants.

BEGIN;

DO $$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['cms_owner', 'cms_runtime'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = role_name
    ) THEN
      EXECUTE format('CREATE ROLE %I LOGIN NOINHERIT', role_name);
    END IF;

    -- A role of the same name that already exists must not hold more than
    -- this migration gives it. Fail rather than adopt it.
    IF EXISTS (
      SELECT 1
      FROM pg_catalog.pg_roles
      WHERE rolname = role_name
        AND (rolsuper OR rolcreaterole OR rolcreatedb OR rolreplication
             OR rolbypassrls)
    ) THEN
      RAISE EXCEPTION 'role % holds a privileged attribute', role_name;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles r ON r.oid = m.member
      WHERE r.rolname = role_name
    ) THEN
      RAISE EXCEPTION 'role % is a member of another role', role_name;
    END IF;
  END LOOP;
END
$$;

-- Payload 4.0.0-beta.9 migrates on one connection; the second is headroom.
ALTER ROLE cms_owner LOGIN NOINHERIT CONNECTION LIMIT 2;
-- The total across every Payload instance (plan 9.3).
ALTER ROLE cms_runtime LOGIN NOINHERIT CONNECTION LIMIT 10;

COMMENT ON ROLE cms_owner IS
  'Owns schema cms; runs Payload migrations from the release job only.';
COMMENT ON ROLE cms_runtime IS
  'Payload run-time login: rows in cms only, no schema changes.';

-- The migration runner acts as cms_owner to hand it the schema and to set its
-- default privileges. Membership runs from cms_owner to the runner, never the
-- other way, so cms_owner gains nothing from it.
GRANT cms_owner TO CURRENT_USER;

CREATE SCHEMA IF NOT EXISTS cms;

-- Changing a schema's owner requires the new owner to hold CREATE on the
-- database. It holds it only for that statement.
DO $$
BEGIN
  IF (
    SELECT nspowner FROM pg_catalog.pg_namespace WHERE nspname = 'cms'
  ) <> 'cms_owner'::regrole THEN
    EXECUTE format(
      'GRANT CREATE ON DATABASE %I TO cms_owner',
      current_database()
    );
    ALTER SCHEMA cms OWNER TO cms_owner;
  END IF;

  EXECUTE format(
    'REVOKE CREATE ON DATABASE %I FROM cms_owner, cms_runtime',
    current_database()
  );
END
$$;

-- Objects created in cms before this migration, by any role, pass to
-- cms_owner, so that later Payload migrations can change them. Indexes,
-- row types and the sequences behind a column move with their table.
-- Extension members are left alone.
DO $$
DECLARE
  obj record;
BEGIN
  FOR obj IN
    SELECT c.oid::regclass AS name, c.relkind
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
      AND c.relowner <> 'cms_owner'::regrole
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.classid = 'pg_catalog.pg_class'::regclass
          AND d.objid = c.oid
          AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format(
      'ALTER %s %s OWNER TO cms_owner',
      CASE obj.relkind
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
        WHEN 'f' THEN 'FOREIGN TABLE'
        ELSE 'TABLE'
      END,
      obj.name
    );
  END LOOP;

  FOR obj IN
    SELECT c.oid::regclass AS name
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relkind = 'S'
      AND c.relowner <> 'cms_owner'::regrole
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.classid = 'pg_catalog.pg_class'::regclass
          AND d.objid = c.oid
          AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format('ALTER SEQUENCE %s OWNER TO cms_owner', obj.name);
  END LOOP;

  FOR obj IN
    SELECT t.oid::regtype AS name, t.typtype
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'cms'
      AND t.typowner <> 'cms_owner'::regrole
      AND (
        t.typtype IN ('e', 'd', 'r')
        OR (
          t.typtype = 'c'
          AND EXISTS (
            SELECT 1 FROM pg_catalog.pg_class c
            WHERE c.oid = t.typrelid AND c.relkind = 'c'
          )
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.classid = 'pg_catalog.pg_type'::regclass
          AND d.objid = t.oid
          AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format(
      'ALTER %s %s OWNER TO cms_owner',
      CASE obj.typtype WHEN 'd' THEN 'DOMAIN' ELSE 'TYPE' END,
      obj.name
    );
  END LOOP;

  FOR obj IN
    SELECT p.oid::regprocedure AS name, p.prokind
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cms'
      AND p.proowner <> 'cms_owner'::regrole
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.classid = 'pg_catalog.pg_proc'::regclass
          AND d.objid = p.oid
          AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format(
      'ALTER %s %s OWNER TO cms_owner',
      CASE obj.prokind
        WHEN 'p' THEN 'PROCEDURE'
        WHEN 'a' THEN 'AGGREGATE'
        ELSE 'FUNCTION'
      END,
      obj.name
    );
  END LOOP;
END
$$;

-- cms_runtime: rows in cms, nothing more. No TRUNCATE, REFERENCES or TRIGGER,
-- and no CREATE on the schema.
REVOKE ALL ON SCHEMA cms FROM cms_runtime;
GRANT USAGE ON SCHEMA cms TO cms_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA cms
  TO cms_runtime;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA cms TO cms_runtime;

-- The same for every table and sequence that later Payload migrations create.
ALTER DEFAULT PRIVILEGES FOR ROLE cms_owner IN SCHEMA cms
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cms_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE cms_owner IN SCHEMA cms
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO cms_runtime;

-- Neither role may hold a grant on a table, sequence or schema outside cms.
-- Fail rather than leave one behind.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
    WHERE n.nspname <> 'cms'
      AND a.grantee IN ('cms_owner'::regrole, 'cms_runtime'::regrole)
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace n
    CROSS JOIN LATERAL pg_catalog.aclexplode(n.nspacl) a
    WHERE n.nspname <> 'cms'
      AND a.grantee IN ('cms_owner'::regrole, 'cms_runtime'::regrole)
  ) OR EXISTS (
    -- A cms table's TOAST table sits in pg_toast under the table's owner.
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname NOT IN ('cms', 'pg_toast')
      AND c.relowner IN ('cms_owner'::regrole, 'cms_runtime'::regrole)
  ) THEN
    RAISE EXCEPTION 'cms_owner or cms_runtime holds a right outside schema cms';
  END IF;
END
$$;

COMMIT;
