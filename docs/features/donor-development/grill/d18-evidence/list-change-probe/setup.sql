-- Synthetic D18 mechanics only. Scope IDs stand for already-qualified source
-- scope; this is not a proposed scope taxonomy, migration or authorization model.
CREATE SCHEMA lab;
CREATE TABLE lab.stage_list (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  label text NOT NULL, accepts_new boolean NOT NULL DEFAULT true,
  PRIMARY KEY (tenant_id,scope_id,id)
);
CREATE TABLE lab.stage (
  tenant_id int NOT NULL, scope_id int NOT NULL, list_id int NOT NULL,
  id int NOT NULL, label text NOT NULL,
  PRIMARY KEY (tenant_id,scope_id,list_id,id),
  FOREIGN KEY (tenant_id,scope_id,list_id)
    REFERENCES lab.stage_list(tenant_id,scope_id,id)
);
CREATE TABLE lab.journey (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  party_id int NOT NULL, ministry_id int NOT NULL, purpose text NOT NULL,
  list_id int NOT NULL, stage_id int, revision int NOT NULL CHECK (revision>0),
  PRIMARY KEY (tenant_id,scope_id,id),
  FOREIGN KEY (tenant_id,scope_id,list_id)
    REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY (tenant_id,scope_id,list_id,stage_id)
    REFERENCES lab.stage(tenant_id,scope_id,list_id,id)
);
CREATE TABLE lab.accepted_history (
  tenant_id int NOT NULL, scope_id int NOT NULL, journey_id int NOT NULL,
  revision int NOT NULL, operation text NOT NULL,
  before_snapshot jsonb NOT NULL, after_snapshot jsonb NOT NULL,
  from_list int NOT NULL, from_stage int, to_list int NOT NULL, to_stage int,
  from_label text NOT NULL, to_label text NOT NULL,
  PRIMARY KEY (tenant_id,scope_id,journey_id,revision),
  FOREIGN KEY (tenant_id,scope_id,journey_id)
    REFERENCES lab.journey(tenant_id,scope_id,id),
  FOREIGN KEY (tenant_id,scope_id,from_list)
    REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY (tenant_id,scope_id,to_list)
    REFERENCES lab.stage_list(tenant_id,scope_id,id),
  FOREIGN KEY (tenant_id,scope_id,from_list,from_stage)
    REFERENCES lab.stage(tenant_id,scope_id,list_id,id),
  FOREIGN KEY (tenant_id,scope_id,to_list,to_stage)
    REFERENCES lab.stage(tenant_id,scope_id,list_id,id)
);
CREATE TABLE lab.command_receipt (
  tenant_id int NOT NULL, scope_id int NOT NULL, journey_id int NOT NULL,
  command_key text NOT NULL CHECK (command_key <> 'fixture-deny-receipt'),
  payload jsonb NOT NULL, accepted_result jsonb NOT NULL,
  PRIMARY KEY (tenant_id,scope_id,journey_id,command_key),
  FOREIGN KEY (tenant_id,scope_id,journey_id)
    REFERENCES lab.journey(tenant_id,scope_id,id)
);

CREATE FUNCTION lab.change_binding(p_tenant int,p_scope int,p_journey int,
  p_key text,p_operation text,p_revision int,p_list int,p_stage int)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE
  oldrow lab.journey%ROWTYPE; newrow lab.journey%ROWTYPE;
  receipt lab.command_receipt%ROWTYPE; target lab.stage_list%ROWTYPE;
  payload jsonb; result jsonb; oldlabel text;
BEGIN
  -- This fixture is owner-executed. Real authorization/result disclosure is absent.
  SELECT * INTO STRICT oldrow FROM lab.journey
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_journey FOR UPDATE;
  payload:=jsonb_build_object('operation',p_operation,'observed_revision',p_revision,
    'target_list',p_list,'target_stage',p_stage);
  SELECT * INTO receipt FROM lab.command_receipt
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND journey_id=p_journey AND command_key=p_key;
  IF FOUND THEN
    IF receipt.payload IS DISTINCT FROM payload THEN
      RAISE EXCEPTION 'submitted meaning conflict' USING ERRCODE='23514';
    END IF;
    RETURN receipt.accepted_result; -- historical result, never reapply
  END IF;
  IF oldrow.revision IS DISTINCT FROM p_revision THEN
    RAISE EXCEPTION 'observed journey revision is stale' USING ERRCODE='40001';
  END IF;
  IF p_operation NOT IN ('switch','stage') OR p_operation IS NULL
    OR p_list IS NULL OR p_stage IS NULL THEN
    RAISE EXCEPTION 'fixture requires explicit valid concrete pair' USING ERRCODE='23514';
  END IF;
  -- A supplied concrete stage is ONLY a mechanics fixture choice. This does not
  -- adopt reassessment, mapping, preservation or clearing as D18 product policy.
  IF (p_operation='stage' AND p_list<>oldrow.list_id)
    OR (p_operation='switch' AND p_list=oldrow.list_id) THEN
    RAISE EXCEPTION 'operation does not match list intent' USING ERRCODE='23514';
  END IF;
  SELECT * INTO STRICT target FROM lab.stage_list
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_list FOR SHARE;
  IF p_operation='switch' AND NOT target.accepts_new THEN
    RAISE EXCEPTION 'new attachment target unavailable' USING ERRCODE='23514';
  END IF;
  PERFORM 1 FROM lab.stage WHERE tenant_id=p_tenant AND scope_id=p_scope
    AND list_id=p_list AND id=p_stage FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'stage is not in exact target list' USING ERRCODE='23514';
  END IF;
  SELECT label INTO STRICT oldlabel FROM lab.stage_list
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=oldrow.list_id FOR SHARE;
  UPDATE lab.journey SET list_id=p_list,stage_id=p_stage,revision=revision+1
    WHERE tenant_id=p_tenant AND scope_id=p_scope AND id=p_journey RETURNING * INTO newrow;
  INSERT INTO lab.accepted_history VALUES(p_tenant,p_scope,p_journey,newrow.revision,
    p_operation,to_jsonb(oldrow),to_jsonb(newrow),oldrow.list_id,oldrow.stage_id,
    p_list,p_stage,oldlabel,target.label);
  result:=to_jsonb(newrow);
  -- The test-only receipt CHECK above supplies a deterministic late-write fault.
  INSERT INTO lab.command_receipt VALUES(p_tenant,p_scope,p_journey,p_key,payload,result);
  RETURN result;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;

INSERT INTO lab.stage_list
  SELECT 1,s,l,CASE l WHEN 10 THEN 'Original' WHEN 20 THEN 'Alternative' ELSE 'Other' END,true
  FROM generate_series(1,7) s CROSS JOIN (VALUES(10),(20),(30)) lists(l);
INSERT INTO lab.stage
  SELECT 1,s,l,l*10+n,'Shared label' FROM generate_series(1,7) s
  CROSS JOIN (VALUES(10),(20),(30)) lists(l) CROSS JOIN (VALUES(1),(2)) stages(n);
INSERT INTO lab.journey
  SELECT 1,s,100,200,300,'same continuing purpose',10,101,1 FROM generate_series(1,7) s;
