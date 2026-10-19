-- D25 consumer-recovery fixture, not P15 posting integration or a Core migration.
CREATE SCHEMA lab;
CREATE TABLE lab.handoff(scope_id int NOT NULL,id int NOT NULL,revision int NOT NULL CHECK(revision>0),
  last_resolution_revision int,PRIMARY KEY(scope_id,id));
CREATE TABLE lab.finance_posted(scope_id int NOT NULL,id int NOT NULL,amount_minor bigint NOT NULL,
  PRIMARY KEY(scope_id,id));
CREATE TABLE lab.finance_adjustment(scope_id int NOT NULL,id int NOT NULL,posted_id int NOT NULL,
  delta_minor bigint NOT NULL,PRIMARY KEY(scope_id,id),
  FOREIGN KEY(scope_id,posted_id) REFERENCES lab.finance_posted ON DELETE RESTRICT);
CREATE TABLE lab.confirmation(scope_id int NOT NULL,id int NOT NULL,handoff_id int NOT NULL,
  handoff_revision int NOT NULL,revision int NOT NULL,confirmed boolean NOT NULL,
  PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,handoff_id) REFERENCES lab.handoff ON DELETE RESTRICT);
CREATE TABLE lab.confirmation_item(scope_id int NOT NULL,confirmation_id int NOT NULL,posted_id int NOT NULL,
  PRIMARY KEY(scope_id,confirmation_id,posted_id),
  FOREIGN KEY(scope_id,confirmation_id) REFERENCES lab.confirmation ON DELETE RESTRICT,
  FOREIGN KEY(scope_id,posted_id) REFERENCES lab.finance_posted ON DELETE RESTRICT);
CREATE TABLE lab.resolution(scope_id int NOT NULL,handoff_id int NOT NULL,handoff_revision int NOT NULL,
  confirmation_id int NOT NULL,confirmation_revision int NOT NULL,posted_refs jsonb NOT NULL,
  PRIMARY KEY(scope_id,handoff_id,handoff_revision),
  FOREIGN KEY(scope_id,handoff_id) REFERENCES lab.handoff ON DELETE RESTRICT,
  FOREIGN KEY(scope_id,confirmation_id) REFERENCES lab.confirmation ON DELETE RESTRICT);
CREATE TABLE lab.history(scope_id int NOT NULL,handoff_id int NOT NULL,event_id bigint GENERATED ALWAYS AS IDENTITY,
  revision int NOT NULL,kind text NOT NULL,detail jsonb NOT NULL,
  PRIMARY KEY(event_id),FOREIGN KEY(scope_id,handoff_id) REFERENCES lab.handoff ON DELETE RESTRICT);
CREATE TABLE lab.receipt(scope_id int NOT NULL,handoff_id int NOT NULL,command_key text NOT NULL,
  payload jsonb NOT NULL,result jsonb NOT NULL,PRIMARY KEY(scope_id,handoff_id,command_key),
  FOREIGN KEY(scope_id,handoff_id) REFERENCES lab.handoff ON DELETE RESTRICT);

CREATE FUNCTION lab.resolve_handoff(s int,h int,k text,expected_head int,cid int,expected_confirmation int,refs jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE head lab.handoff; proof lab.confirmation; old lab.receipt;
  normalized jsonb; source_refs jsonb; payload jsonb; result jsonb;
BEGIN
  IF s IS NULL OR h IS NULL OR cid IS NULL OR expected_head IS NULL OR expected_confirmation IS NULL
    OR expected_head<1 OR expected_confirmation<1 OR k IS NULL OR k=''
    OR jsonb_typeof(refs) IS DISTINCT FROM 'array'
    THEN RAISE EXCEPTION 'exact identity required' USING ERRCODE='22023'; END IF;
  IF jsonb_array_length(refs)=0 OR jsonb_array_length(refs)>10
    OR EXISTS(SELECT 1 FROM jsonb_array_elements(refs) x WHERE jsonb_typeof(x)<>'number' OR x::text !~ '^[1-9][0-9]*$')
    THEN RAISE EXCEPTION 'nonempty exact references required' USING ERRCODE='22023'; END IF;
  SELECT jsonb_agg(id ORDER BY id) INTO normalized FROM
    (SELECT DISTINCT value::text::int AS id FROM jsonb_array_elements(refs)) ids;
  payload=jsonb_build_object('head_revision',expected_head,'confirmation',cid,
    'confirmation_revision',expected_confirmation,'posted_refs',normalized);
  -- Source fence before consumer fence; not a chosen production lock grain.
  SELECT * INTO proof FROM lab.confirmation WHERE scope_id=s AND id=cid FOR SHARE;
  SELECT * INTO head FROM lab.handoff WHERE scope_id=s AND id=h FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'handoff unavailable' USING ERRCODE='23503'; END IF;
  SELECT * INTO old FROM lab.receipt WHERE scope_id=s AND handoff_id=h AND command_key=k;
  IF FOUND THEN
    IF old.payload IS DISTINCT FROM payload THEN RAISE EXCEPTION 'same key changed intent' USING ERRCODE='23514'; END IF;
    RETURN old.result;
  END IF;
  IF head.revision<>expected_head THEN RAISE EXCEPTION 'material handoff superseded' USING ERRCODE='40001'; END IF;
  IF proof.id IS NULL OR proof.handoff_id<>h OR proof.handoff_revision<>expected_head
    OR proof.revision<>expected_confirmation OR NOT proof.confirmed
    THEN RAISE EXCEPTION 'owner confirmation unavailable or incompatible' USING ERRCODE='23514'; END IF;
  SELECT COALESCE(jsonb_agg(posted_id ORDER BY posted_id),'[]') INTO source_refs
    FROM lab.confirmation_item WHERE scope_id=s AND confirmation_id=cid;
  IF normalized IS DISTINCT FROM source_refs OR source_refs='[]'
    THEN RAISE EXCEPTION 'exact owner reference set differs' USING ERRCODE='23514'; END IF;
  INSERT INTO lab.resolution VALUES(s,h,head.revision,cid,proof.revision,source_refs);
  UPDATE lab.handoff SET last_resolution_revision=revision WHERE scope_id=s AND id=h;
  result=jsonb_build_object('handoff',h,'resolved_revision',head.revision,'confirmation',cid,
    'confirmation_revision',proof.revision,'posted_refs',source_refs);
  INSERT INTO lab.history(scope_id,handoff_id,revision,kind,detail)
    VALUES(s,h,head.revision,'source_resolution_attached',result);
  INSERT INTO lab.receipt VALUES(s,h,k,payload,result);
  IF current_setting('lab.fail_completion',true)='on'
    THEN RAISE EXCEPTION 'fixture late consumer failure' USING ERRCODE='23514'; END IF;
  RETURN result;
END $$;

CREATE FUNCTION lab.supersede_handoff(s int,h int,expected int) RETURNS int
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE head lab.handoff;
BEGIN
  SELECT * INTO head FROM lab.handoff WHERE scope_id=s AND id=h FOR UPDATE;
  IF NOT FOUND OR expected IS NULL OR head.revision<>expected
    THEN RAISE EXCEPTION 'stale report revision' USING ERRCODE='40001'; END IF;
  UPDATE lab.handoff SET revision=revision+1 WHERE scope_id=s AND id=h;
  INSERT INTO lab.history(scope_id,handoff_id,revision,kind,detail)
    VALUES(s,h,expected+1,'material_report_revision',jsonb_build_object('prior_revision',expected));
  RETURN expected+1;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
INSERT INTO lab.handoff SELECT n,h,1,NULL FROM generate_series(1,7) n CROSS JOIN generate_series(1,2) h;
-- Financial truth is deliberately seeded independently, before the consumer runs.
INSERT INTO lab.finance_posted SELECT n,p,10000 FROM generate_series(1,7) n CROSS JOIN unnest(ARRAY[11,12,99]) p;
INSERT INTO lab.confirmation SELECT n,1,1,1,1,true FROM generate_series(1,7) n;
INSERT INTO lab.confirmation SELECT n,2,1,1,1,false FROM generate_series(1,7) n;
INSERT INTO lab.confirmation SELECT n,3,2,1,1,true FROM generate_series(1,7) n;
INSERT INTO lab.confirmation SELECT n,4,1,1,1,true FROM generate_series(1,7) n;
INSERT INTO lab.confirmation_item SELECT n,1,p FROM generate_series(1,7) n CROSS JOIN unnest(ARRAY[11,12]) p;
INSERT INTO lab.confirmation_item SELECT n,2,11 FROM generate_series(1,7) n;
INSERT INTO lab.confirmation_item SELECT n,3,99 FROM generate_series(1,7) n;
