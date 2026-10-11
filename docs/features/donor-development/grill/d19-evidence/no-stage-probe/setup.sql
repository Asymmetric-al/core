-- D19 synthetic no-stage intent mechanics. Not a Core migration or scope model.
CREATE SCHEMA lab;
CREATE TABLE lab.stage_list (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  accepts_new boolean NOT NULL DEFAULT true,
  PRIMARY KEY(tenant_id,scope_id,id)
);
CREATE TABLE lab.stage (
  tenant_id int NOT NULL, scope_id int NOT NULL, list_id int NOT NULL, id int NOT NULL,
  PRIMARY KEY(tenant_id,scope_id,list_id,id),
  FOREIGN KEY(tenant_id,scope_id,list_id) REFERENCES lab.stage_list(tenant_id,scope_id,id)
);
-- Deliberately insufficient: NULL stage bypasses this only composite FK.
CREATE TABLE lab.naive_binding (
  tenant_id int NOT NULL, scope_id int NOT NULL, list_id int NOT NULL, stage_id int,
  FOREIGN KEY(tenant_id,scope_id,list_id,stage_id) REFERENCES lab.stage(tenant_id,scope_id,list_id,id)
);
CREATE TABLE lab.journey (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  party_id int NOT NULL, ministry_id int NOT NULL, purpose text NOT NULL,
  list_id int NOT NULL, stage_id int, revision int NOT NULL CHECK(revision>0),
  PRIMARY KEY(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,list_id) REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,list_id,stage_id) REFERENCES lab.stage(tenant_id,scope_id,list_id,id)
);
CREATE TABLE lab.history (
  tenant_id int NOT NULL, scope_id int NOT NULL, journey_id int NOT NULL, revision int NOT NULL,
  from_list int NOT NULL, from_stage int, to_list int NOT NULL, to_stage int,
  PRIMARY KEY(tenant_id,scope_id,journey_id,revision),
  FOREIGN KEY(tenant_id,scope_id,journey_id) REFERENCES lab.journey(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,from_list) REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,to_list) REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,from_list,from_stage) REFERENCES lab.stage(tenant_id,scope_id,list_id,id),
  FOREIGN KEY(tenant_id,scope_id,to_list,to_stage) REFERENCES lab.stage(tenant_id,scope_id,list_id,id)
);
CREATE TABLE lab.receipt (
  tenant_id int NOT NULL, scope_id int NOT NULL, journey_id int NOT NULL,
  command_key text NOT NULL CHECK(command_key<>'fixture-deny-receipt'),
  intent jsonb NOT NULL, accepted_result jsonb NOT NULL,
  PRIMARY KEY(tenant_id,scope_id,journey_id,command_key),
  FOREIGN KEY(tenant_id,scope_id,journey_id) REFERENCES lab.journey(tenant_id,scope_id,id)
);
CREATE FUNCTION lab.switch_list(p_tenant int,p_scope int,p_id int,p_key text,p_intent jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE
  oldrow lab.journey%ROWTYPE; newrow lab.journey%ROWTYPE; oldreceipt lab.receipt%ROWTYPE;
  target lab.stage_list%ROWTYPE; chosen_list int; chosen_stage int; expected_revision int;
BEGIN
  -- Owner fixture only: no production authorization or disclosure is modeled.
  SELECT * INTO STRICT oldrow FROM lab.journey
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id FOR UPDATE;
  SELECT * INTO oldreceipt FROM lab.receipt WHERE tenant_id=p_tenant AND scope_id=p_scope
    AND journey_id=p_id AND command_key=p_key;
  IF FOUND THEN
    IF oldreceipt.intent IS DISTINCT FROM p_intent THEN
      RAISE EXCEPTION 'same intent identity with different meaning' USING ERRCODE='23514';
    END IF;
    RETURN oldreceipt.accepted_result;
  END IF;
  -- Exact JSON envelope is ONLY a probe seam. Product may use a qualified typed
  -- disposition; omission, invalid data and explicit no-stage must stay distinct.
  IF p_intent IS NULL OR jsonb_typeof(p_intent)<>'object'
    OR NOT (p_intent ?& ARRAY['target_list','target_stage','expected_revision'])
    OR (p_intent-ARRAY['target_list','target_stage','expected_revision'])<>'{}'::jsonb
    OR jsonb_typeof(p_intent->'target_list')<>'number'
    OR jsonb_typeof(p_intent->'expected_revision')<>'number'
    OR jsonb_typeof(p_intent->'target_stage') NOT IN ('number','null') THEN
    RAISE EXCEPTION 'explicit complete switch disposition required' USING ERRCODE='22023';
  END IF;
  chosen_list:=(p_intent->>'target_list')::int;
  chosen_stage:=(p_intent->>'target_stage')::int;
  expected_revision:=(p_intent->>'expected_revision')::int;
  IF oldrow.revision IS DISTINCT FROM expected_revision THEN
    RAISE EXCEPTION 'stale current source revision' USING ERRCODE='40001';
  END IF;
  IF chosen_list=oldrow.list_id THEN
    RAISE EXCEPTION 'this command cannot clear on the current list' USING ERRCODE='23514';
  END IF;
  SELECT * INTO STRICT target FROM lab.stage_list
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=chosen_list FOR SHARE;
  IF NOT target.accepts_new THEN
    RAISE EXCEPTION 'target unavailable even when stage absent' USING ERRCODE='23514';
  END IF;
  -- Composite FK validates concrete stage membership; the independent list FK
  -- continues to validate the required parent when chosen_stage is SQL NULL.
  UPDATE lab.journey SET list_id=chosen_list,stage_id=chosen_stage,revision=revision+1
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_id RETURNING * INTO newrow;
  INSERT INTO lab.history VALUES(p_tenant,p_scope,p_id,newrow.revision,
    oldrow.list_id,oldrow.stage_id,chosen_list,chosen_stage);
  -- Deterministic late failure seam: the receipt CHECK only rejects the test key.
  INSERT INTO lab.receipt VALUES(p_tenant,p_scope,p_id,p_key,p_intent,to_jsonb(newrow));
  RETURN to_jsonb(newrow);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;
INSERT INTO lab.stage_list SELECT 1,s,l,true FROM generate_series(1,5)s CROSS JOIN(VALUES(10),(20))v(l);
INSERT INTO lab.stage SELECT 1,s,l,l*10+1 FROM generate_series(1,5)s CROSS JOIN(VALUES(10),(20))v(l);
INSERT INTO lab.journey SELECT 1,s,100,200,300,'continuing purpose',10,101,1 FROM generate_series(1,5)s;
