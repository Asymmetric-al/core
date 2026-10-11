-- Synthetic D24 mechanics, not Core schema, permissions or a migration.
CREATE SCHEMA lab;
CREATE TABLE lab.appeal(scope_id int NOT NULL,id int NOT NULL,PRIMARY KEY(scope_id,id));
CREATE TABLE lab.party(scope_id int NOT NULL,id int NOT NULL,eligible boolean NOT NULL DEFAULT true,
  matches_filter boolean NOT NULL DEFAULT true,PRIMARY KEY(scope_id,id));
CREATE TABLE lab.member(scope_id int NOT NULL,appeal_id int NOT NULL,party_id int NOT NULL,
  state text NOT NULL CHECK(state IN ('included','excluded','removed')), revision int NOT NULL CHECK(revision>0),
  PRIMARY KEY(scope_id,appeal_id,party_id),
  FOREIGN KEY(scope_id,appeal_id) REFERENCES lab.appeal ON DELETE RESTRICT,
  FOREIGN KEY(scope_id,party_id) REFERENCES lab.party ON DELETE RESTRICT);
CREATE TABLE lab.history(scope_id int NOT NULL,appeal_id int NOT NULL,party_id int NOT NULL,
  revision int NOT NULL,state text NOT NULL,command_key text NOT NULL,
  PRIMARY KEY(scope_id,appeal_id,party_id,revision),
  FOREIGN KEY(scope_id,appeal_id,party_id) REFERENCES lab.member ON DELETE RESTRICT);
CREATE TABLE lab.batch(scope_id int NOT NULL,appeal_id int NOT NULL,command_key text NOT NULL,
  intent jsonb NOT NULL,PRIMARY KEY(scope_id,appeal_id,command_key),
  FOREIGN KEY(scope_id,appeal_id) REFERENCES lab.appeal ON DELETE RESTRICT);
CREATE TABLE lab.receipt(scope_id int NOT NULL,appeal_id int NOT NULL,command_key text NOT NULL,
  intent jsonb NOT NULL,result jsonb NOT NULL,
  PRIMARY KEY(scope_id,appeal_id,command_key),
  FOREIGN KEY(scope_id,appeal_id) REFERENCES lab.appeal ON DELETE RESTRICT,
  CONSTRAINT late_fixture_failure CHECK(command_key<>'fixture-late-failure'));

CREATE FUNCTION lab.capture(s int,a int,k text,items jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE normalized jsonb; old lab.batch;
BEGIN
  IF jsonb_typeof(items) IS DISTINCT FROM 'array' OR jsonb_array_length(items) NOT BETWEEN 1 AND 25
    THEN RAISE EXCEPTION 'bounded array required' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_to_recordset(items) AS x(party_id int,expected_revision int)
    WHERE party_id IS NULL OR party_id<1 OR expected_revision IS NULL OR expected_revision<0)
    OR EXISTS(SELECT 1 FROM jsonb_to_recordset(items) AS x(party_id int,expected_revision int)
    GROUP BY party_id HAVING count(DISTINCT expected_revision)>1)
    THEN RAISE EXCEPTION 'invalid or conflicting capture' USING ERRCODE='22023'; END IF;
  SELECT jsonb_agg(jsonb_build_object('party_id',party_id,'expected_revision',expected_revision) ORDER BY party_id)
    INTO normalized FROM (SELECT DISTINCT party_id,expected_revision
    FROM jsonb_to_recordset(items) AS x(party_id int,expected_revision int)) d;
  PERFORM 1 FROM lab.appeal WHERE scope_id=s AND id=a FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'appeal missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO old FROM lab.batch WHERE scope_id=s AND appeal_id=a AND command_key=k;
  IF FOUND THEN
    IF old.intent IS DISTINCT FROM normalized THEN RAISE EXCEPTION 'same key different intent' USING ERRCODE='23514'; END IF;
    RETURN old.intent;
  END IF;
  IF EXISTS(SELECT 1 FROM lab.receipt WHERE scope_id=s AND appeal_id=a AND command_key=k)
    THEN RAISE EXCEPTION 'command key already used' USING ERRCODE='23514'; END IF;
  INSERT INTO lab.batch VALUES(s,a,k,normalized);
  RETURN normalized;
END $$;

CREATE FUNCTION lab.apply_batch(s int,a int,k text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE b lab.batch; old lab.receipt; item record; m lab.member; p lab.party;
  outcome text; results jsonb='[]'; next_revision int;
BEGIN
  -- Deliberately coarse parent fence includes absent members. Not a production lock-grain choice.
  PERFORM 1 FROM lab.appeal WHERE scope_id=s AND id=a FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'appeal missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO b FROM lab.batch WHERE scope_id=s AND appeal_id=a AND command_key=k FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'batch missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO old FROM lab.receipt WHERE scope_id=s AND appeal_id=a AND command_key=k;
  IF FOUND THEN RETURN old.result; END IF;
  FOR item IN SELECT * FROM jsonb_to_recordset(b.intent) AS x(party_id int,expected_revision int) ORDER BY party_id LOOP
    SELECT * INTO p FROM lab.party WHERE scope_id=s AND id=item.party_id FOR SHARE;
    SELECT * INTO m FROM lab.member WHERE scope_id=s AND appeal_id=a AND party_id=item.party_id;
    IF p.id IS NULL OR NOT p.eligible THEN outcome='unavailable';
    ELSIF COALESCE(m.revision,0)<>item.expected_revision THEN outcome='conflict';
    ELSIF m.state IN ('excluded','removed') THEN outcome='not_included';
    ELSIF m.state='included' THEN outcome='already_included';
    ELSE
      next_revision=COALESCE(m.revision,0)+1;
      INSERT INTO lab.member VALUES(s,a,item.party_id,'included',next_revision);
      INSERT INTO lab.history VALUES(s,a,item.party_id,next_revision,'included',k);
      outcome='included';
    END IF;
    results=results||jsonb_build_array(jsonb_build_object('party_id',item.party_id,'outcome',outcome));
  END LOOP;
  -- A fault here must not leave accepted membership without history/result.
  INSERT INTO lab.receipt VALUES(s,a,k,b.intent,results);
  RETURN results;
END $$;

CREATE FUNCTION lab.set_member(s int,a int,pid int,k text,expected int,new_state text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE m lab.member; p lab.party; old lab.receipt; payload jsonb; result jsonb; v int;
BEGIN
  IF new_state NOT IN ('included','excluded','removed') OR new_state IS NULL OR expected IS NULL OR expected<0
    THEN RAISE EXCEPTION 'explicit state and revision required' USING ERRCODE='22023'; END IF;
  payload=jsonb_build_object('party_id',pid,'expected_revision',expected,'new_state',new_state);
  PERFORM 1 FROM lab.appeal WHERE scope_id=s AND id=a FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'appeal missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO old FROM lab.receipt WHERE scope_id=s AND appeal_id=a AND command_key=k;
  IF FOUND THEN
    IF old.intent IS DISTINCT FROM payload THEN RAISE EXCEPTION 'same key different intent' USING ERRCODE='23514'; END IF;
    RETURN old.result;
  END IF;
  IF EXISTS(SELECT 1 FROM lab.batch WHERE scope_id=s AND appeal_id=a AND command_key=k)
    THEN RAISE EXCEPTION 'command key already used' USING ERRCODE='23514'; END IF;
  SELECT * INTO p FROM lab.party WHERE scope_id=s AND id=pid FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'party missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO m FROM lab.member WHERE scope_id=s AND appeal_id=a AND party_id=pid;
  IF COALESCE(m.revision,0)<>expected THEN RAISE EXCEPTION 'stale membership' USING ERRCODE='40001'; END IF;
  IF new_state='included' AND (NOT p.eligible OR m.state IS NULL OR m.state='included')
    THEN RAISE EXCEPTION 'explicit return requires existing excluded/removed eligible member' USING ERRCODE='23514'; END IF;
  v=COALESCE(m.revision,0)+1;
  INSERT INTO lab.member VALUES(s,a,pid,new_state,v)
    ON CONFLICT(scope_id,appeal_id,party_id) DO UPDATE SET state=EXCLUDED.state,revision=EXCLUDED.revision;
  INSERT INTO lab.history VALUES(s,a,pid,v,new_state,k);
  result=jsonb_build_object('party_id',pid,'state',new_state,'revision',v);
  INSERT INTO lab.receipt VALUES(s,a,k,payload,result);
  RETURN result;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
INSERT INTO lab.appeal SELECT n,1 FROM generate_series(1,8) n;
INSERT INTO lab.party SELECT n,p,true,p<3 FROM generate_series(1,8) n CROSS JOIN generate_series(1,4) p;
