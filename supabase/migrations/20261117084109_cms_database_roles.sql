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
      -- Two databases of a cluster that has no such role yet can both get
      -- here. The second CREATE waits for the first transaction and then
      -- fails on the role's name (duplicate_object, or unique_violation from
      -- the catalog's index), by which time the role exists: treat it so.
      BEGIN
        EXECUTE format('CREATE ROLE %I LOGIN NOINHERIT', role_name);
      EXCEPTION WHEN duplicate_object OR unique_violation THEN
        NULL;
      END;
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

    -- Nor may another role be a member of it, which would give that role the
    -- CMS role's rights. The one member allowed is the migration runner, which
    -- acts as cms_owner below; on Postgres 16 and later a runner that holds
    -- CREATEROLE also receives an ADMIN membership in each role it creates.
    IF EXISTS (
      SELECT 1
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles r ON r.oid = m.roleid
      WHERE r.rolname = role_name
        AND m.member <> (
          SELECT oid FROM pg_catalog.pg_roles WHERE rolname = CURRENT_USER
        )
    ) THEN
      RAISE EXCEPTION 'role % has a member other than the migration runner %',
        role_name, CURRENT_USER;
    END IF;
  END LOOP;
END
$$;

-- Roles, their comments and their memberships live in catalogs that every
-- database of a cluster shares. Writing them again when nothing has changed
-- makes two databases that apply this file at the same moment collide
-- ("tuple concurrently updated"). CI's real-stack suites that build their own
-- database do exactly that. So each statement below runs only when it would
-- change something.
DO $$
BEGIN
  -- Payload 4.0.0-beta.9 migrates on one connection; the second is headroom.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'cms_owner'
      AND (NOT rolcanlogin OR rolinherit OR rolconnlimit <> 2)
  ) THEN
    ALTER ROLE cms_owner LOGIN NOINHERIT CONNECTION LIMIT 2;
  END IF;

  -- The total across every Payload instance (plan 9.3).
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'cms_runtime'
      AND (NOT rolcanlogin OR rolinherit OR rolconnlimit <> 10)
  ) THEN
    ALTER ROLE cms_runtime LOGIN NOINHERIT CONNECTION LIMIT 10;
  END IF;

  IF pg_catalog.shobj_description('cms_owner'::regrole, 'pg_authid')
     IS DISTINCT FROM
     'Owns schema cms; runs Payload migrations from the release job only.'
  THEN
    COMMENT ON ROLE cms_owner IS
      'Owns schema cms; runs Payload migrations from the release job only.';
  END IF;

  IF pg_catalog.shobj_description('cms_runtime'::regrole, 'pg_authid')
     IS DISTINCT FROM
     'Payload run-time login: rows in cms only, no schema changes.'
  THEN
    COMMENT ON ROLE cms_runtime IS
      'Payload run-time login: rows in cms only, no schema changes.';
  END IF;

  -- The migration runner acts as cms_owner to hand it the schema and to set
  -- its default privileges, which needs both its privileges (USAGE) and SET
  -- ROLE. Membership runs from cms_owner to the runner, never the other way,
  -- so cms_owner gains nothing from it. A superuser, or a runner already
  -- granted both, skips this. A runner that holds CREATEROLE but is not a
  -- superuser (hosted Supabase's postgres) gets an ADMIN-only membership in
  -- a role it creates on Postgres 16 and later, without INHERIT or SET, so a
  -- membership row alone is not enough: it is granted both here.
  IF NOT (
    pg_catalog.pg_has_role(CURRENT_USER, 'cms_owner', 'USAGE')
    AND pg_catalog.pg_has_role(CURRENT_USER, 'cms_owner', 'SET')
  ) THEN
    EXECUTE format(
      'GRANT cms_owner TO %I WITH INHERIT TRUE, SET TRUE',
      CURRENT_USER
    );
  END IF;
END
$$;

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

-- Payload's migration ledger is written only by its migrate commands, which
-- run as cms_owner, and by a development schema push. cms_runtime reads it
-- and cannot forge or remove a row. On a fresh database the table does not
-- exist yet; the Payload migration `*_cms_runtime_ledger_read_only` applies
-- the same revoke once Payload has created it.
DO $$
BEGIN
  IF to_regclass('cms.payload_migrations') IS NOT NULL THEN
    REVOKE INSERT, UPDATE, DELETE ON cms.payload_migrations FROM cms_runtime;
    IF pg_get_serial_sequence('cms.payload_migrations', 'id') IS NOT NULL THEN
      EXECUTE format(
        'REVOKE USAGE, UPDATE ON SEQUENCE %s FROM cms_runtime',
        pg_get_serial_sequence('cms.payload_migrations', 'id')
      );
    END IF;
  END IF;
END
$$;

-- Close cms to the Data API roles (plan 7.1: no schema usage for anon and
-- authenticated). 20260223100000_create_cms_schema.sql gave anon,
-- authenticated and service_role USAGE, gave service_role CREATE, and set
-- default privileges that grant service_role every table and sequence its
-- runner creates in cms. Nothing reaches cms through these roles: the Data
-- API exposes public and graphql_public only, and Payload has its own logins.
REVOKE ALL ON SCHEMA cms FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA cms
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA cms
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cms
  FROM PUBLIC, anon, authenticated, service_role;

-- Default privileges in cms that grant the API roles anything, whichever
-- role set them.
DO $$
DECLARE
  entry record;
BEGIN
  FOR entry IN
    SELECT DISTINCT d.defaclrole::regrole AS owner,
           CASE d.defaclobjtype
             WHEN 'r' THEN 'TABLES'
             WHEN 'S' THEN 'SEQUENCES'
             WHEN 'f' THEN 'FUNCTIONS'
             WHEN 'T' THEN 'TYPES'
           END AS kind
    FROM pg_catalog.pg_default_acl d
    CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
    WHERE d.defaclnamespace = 'cms'::regnamespace
      AND d.defaclobjtype IN ('r', 'S', 'f', 'T')
      AND a.grantee IN (
        'anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole
      )
  LOOP
    EXECUTE format(
      'ALTER DEFAULT PRIVILEGES FOR ROLE %s IN SCHEMA cms '
        'REVOKE ALL ON %s FROM anon, authenticated, service_role',
      entry.owner,
      entry.kind
    );
  END LOOP;
END
$$;

-- The API roles and PUBLIC hold nothing in cms, and no default privilege
-- in cms, or of cms_owner anywhere, would give them anything later.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_namespace n
    CROSS JOIN LATERAL pg_catalog.aclexplode(n.nspacl) a
    WHERE n.nspname = 'cms'
      AND (
        a.grantee = 0
        OR a.grantee IN (
          'anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole
        )
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
    WHERE c.relnamespace = 'cms'::regnamespace
      AND (
        a.grantee = 0
        OR a.grantee IN (
          'anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole
        )
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_default_acl d
    CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
    WHERE (d.defaclnamespace = 'cms'::regnamespace
           OR d.defaclrole = 'cms_owner'::regrole)
      AND (
        a.grantee = 0
        OR a.grantee IN (
          'anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole
        )
      )
  ) THEN
    RAISE EXCEPTION 'schema cms is still open to PUBLIC or a Data API role';
  END IF;

  IF to_regclass('cms.payload_migrations') IS NOT NULL
     AND (
       has_table_privilege('cms_runtime', 'cms.payload_migrations', 'INSERT')
       OR has_table_privilege('cms_runtime', 'cms.payload_migrations', 'UPDATE')
       OR has_table_privilege('cms_runtime', 'cms.payload_migrations', 'DELETE')
     ) THEN
    RAISE EXCEPTION 'cms_runtime can still write the Payload migration ledger';
  END IF;
END
$$;

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
