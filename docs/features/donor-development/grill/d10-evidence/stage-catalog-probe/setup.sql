-- Disposable D10 mechanics fixture; NOT a Core schema or accepted vocabulary.
CREATE SCHEMA lab;
REVOKE ALL ON SCHEMA lab FROM PUBLIC;

CREATE TABLE lab.preset (
  tenant_id integer NOT NULL,
  id integer NOT NULL,
  revision bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, id)
);
CREATE TABLE lab.stage (
  tenant_id integer NOT NULL,
  preset_id integer NOT NULL,
  id integer NOT NULL,
  label text NOT NULL,
  selectable boolean NOT NULL DEFAULT true,
  position integer NOT NULL,
  PRIMARY KEY (tenant_id, preset_id, id),
  FOREIGN KEY (tenant_id, preset_id) REFERENCES lab.preset(tenant_id, id),
  CONSTRAINT stage_position_unique UNIQUE (tenant_id, preset_id, position)
    DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE lab.journey (
  id integer PRIMARY KEY,
  tenant_id integer NOT NULL,
  preset_id integer NOT NULL,
  stage_id integer NOT NULL,
  closed boolean NOT NULL DEFAULT false,
  FOREIGN KEY (tenant_id, preset_id, stage_id)
    REFERENCES lab.stage(tenant_id, preset_id, id)
);
CREATE TABLE lab.stage_history (
  journey_id integer NOT NULL REFERENCES lab.journey(id),
  tenant_id integer NOT NULL,
  preset_id integer NOT NULL,
  stage_id integer NOT NULL,
  recorded_at timestamptz NOT NULL,
  recorded_by text NOT NULL,
  FOREIGN KEY (tenant_id, preset_id, stage_id)
    REFERENCES lab.stage(tenant_id, preset_id, id)
);
CREATE TABLE lab.catalog_history (
  tenant_id integer NOT NULL,
  preset_id integer NOT NULL,
  revision bigint NOT NULL,
  ordered_ids integer[] NOT NULL,
  PRIMARY KEY (tenant_id, preset_id, revision)
);

INSERT INTO lab.preset(tenant_id,id) VALUES
 (1,10),(1,11),(1,12),(1,20),(1,21),(1,22),(2,10);
INSERT INTO lab.stage(tenant_id,preset_id,id,label,position) VALUES
 (1,10,101,'Alpha',1),(1,10,102,'Beta',2),(1,10,103,'Gamma',3),
 (1,11,111,'Other preset',1),(1,12,121,'Recorded stage',1),
 (1,20,201,'FK-only race',1),(1,21,211,'Retire first',1),
 (1,22,221,'Assign first',1),(2,10,901,'Other tenant',1);
INSERT INTO lab.journey VALUES (1,1,12,121,true),(901,2,10,901,false);
INSERT INTO lab.stage_history VALUES
 (1,1,12,121,'2026-01-01T12:00:00Z','fixture-original-recorder');

-- One sufficient mechanical protocol: both writers lock the same definition.
-- Does not claim all Core writers use it, or that these functions authorize users.
CREATE FUNCTION lab.assign_stage(j integer,t integer,p integer,s integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE eligible boolean;
BEGIN
  SELECT selectable INTO eligible FROM lab.stage
    WHERE tenant_id=t AND preset_id=p AND id=s FOR UPDATE;
  IF NOT FOUND OR NOT eligible THEN RETURN false; END IF;
  INSERT INTO lab.journey(id,tenant_id,preset_id,stage_id) VALUES(j,t,p,s);
  RETURN true;
END;
$$;
CREATE FUNCTION lab.retire_stage(t integer,p integer,s integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  PERFORM 1 FROM lab.stage WHERE tenant_id=t AND preset_id=p AND id=s FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE lab.stage SET selectable=false WHERE tenant_id=t AND preset_id=p AND id=s;
  RETURN true;
END;
$$;

-- Whole-list ordering is deliberate fixture policy, not a final P27 contract.
-- The test-only failure switch proves transactional rollback after all writes.
CREATE FUNCTION lab.reorder(t integer,p integer,expected bigint,ids integer[],
  fail_after_write boolean DEFAULT false)
RETURNS bigint LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE current_revision bigint; member_count integer;
BEGIN
  SELECT revision INTO current_revision FROM lab.preset
    WHERE tenant_id=t AND id=p FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'unknown fixture preset' USING ERRCODE='22023'; END IF;
  IF current_revision <> expected THEN
    RAISE EXCEPTION 'stale fixture revision' USING ERRCODE='P0001';
  END IF;
  SELECT count(*) INTO member_count FROM lab.stage WHERE tenant_id=t AND preset_id=p;
  IF ids IS NULL OR cardinality(ids)<>member_count
     OR (SELECT count(DISTINCT id) FROM unnest(ids) AS x(id))<>member_count
     OR EXISTS(SELECT 1 FROM unnest(ids) AS x(id) WHERE NOT EXISTS(
       SELECT 1 FROM lab.stage s WHERE s.tenant_id=t AND s.preset_id=p AND s.id=x.id)) THEN
    RAISE EXCEPTION 'invalid fixture manifest' USING ERRCODE='22023';
  END IF;
  SET CONSTRAINTS lab.stage_position_unique DEFERRED;
  UPDATE lab.stage AS s SET position=x.ordinal::integer
    FROM unnest(ids) WITH ORDINALITY AS x(id,ordinal)
    WHERE s.tenant_id=t AND s.preset_id=p AND s.id=x.id;
  SET CONSTRAINTS lab.stage_position_unique IMMEDIATE;
  UPDATE lab.preset SET revision=revision+1 WHERE tenant_id=t AND id=p
    RETURNING revision INTO current_revision;
  INSERT INTO lab.catalog_history VALUES(t,p,current_revision,ids);
  IF fail_after_write THEN RAISE EXCEPTION 'injected fixture failure' USING ERRCODE='P0001'; END IF;
  RETURN current_revision;
END;
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;

-- A real, nonowner, non-superuser test role; fixed tenant 1 avoids pretending
-- session variables or test JWT claims are an application authorization system.
CREATE ROLE lab_writer NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
GRANT USAGE ON SCHEMA lab TO lab_writer;
GRANT SELECT,INSERT,UPDATE ON lab.journey TO lab_writer;
ALTER TABLE lab.journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY fixture_tenant_scope ON lab.journey FOR ALL TO lab_writer
  USING (tenant_id=1) WITH CHECK (tenant_id=1);
