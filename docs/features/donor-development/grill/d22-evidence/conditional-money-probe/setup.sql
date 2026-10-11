-- D22 synthetic conditional money mechanics; not a proposed product schema.
CREATE SCHEMA lab;
CREATE TABLE lab.currency(code text PRIMARY KEY, exponent int NOT NULL);
INSERT INTO lab.currency VALUES('USD',2),('JPY',0),('BHD',3);
CREATE TABLE lab.journey(tenant_id int NOT NULL,entity_id int NOT NULL,id int NOT NULL,
  PRIMARY KEY(tenant_id,entity_id,id));
INSERT INTO lab.journey VALUES(1,10,100),(1,20,200);
CREATE TABLE lab.financial_target(tenant_id int NOT NULL,entity_id int NOT NULL,id int NOT NULL,
  PRIMARY KEY(tenant_id,entity_id,id));
INSERT INTO lab.financial_target VALUES(1,10,500),(1,20,600);
CREATE TABLE lab.naive_request(kind text NOT NULL,amount_minor bigint,
  CHECK(kind<>'monetary' OR amount_minor>0));
CREATE TABLE lab.request(
  tenant_id int NOT NULL,entity_id int NOT NULL,journey_id int NOT NULL,id int NOT NULL,
  kind text NOT NULL,currency text REFERENCES lab.currency(code),
  requested_minor bigint,expected_minor bigint,target_id int,revision int NOT NULL CHECK(revision>0),
  PRIMARY KEY(tenant_id,entity_id,id),
  FOREIGN KEY(tenant_id,entity_id,journey_id) REFERENCES lab.journey(tenant_id,entity_id,id),
  FOREIGN KEY(tenant_id,entity_id,target_id) REFERENCES lab.financial_target(tenant_id,entity_id,id),
  CHECK(CASE kind
    WHEN 'nonfinancial' THEN currency IS NULL AND requested_minor IS NULL
      AND expected_minor IS NULL AND target_id IS NULL
    WHEN 'monetary' THEN currency IS NOT NULL
      AND (requested_minor IS NULL OR requested_minor>=0)
      AND (expected_minor IS NULL OR expected_minor>=0)
    ELSE false END)
);
-- Zero and unknown are distinct in this illustrative local representation.
-- This does not select when an actual presented ask may omit/zero its amount.
CREATE TABLE lab.request_version(tenant_id int NOT NULL,entity_id int NOT NULL,request_id int NOT NULL,
  revision int NOT NULL,snapshot jsonb NOT NULL,
  PRIMARY KEY(tenant_id,entity_id,request_id,revision),
  FOREIGN KEY(tenant_id,entity_id,request_id) REFERENCES lab.request(tenant_id,entity_id,id));
CREATE TABLE lab.receipt(tenant_id int NOT NULL,entity_id int NOT NULL,request_id int NOT NULL,
  command_key text NOT NULL CHECK(command_key<>'fixture-late-failure'),
  intent jsonb NOT NULL,result jsonb NOT NULL,
  PRIMARY KEY(tenant_id,entity_id,request_id,command_key),
  FOREIGN KEY(tenant_id,entity_id,request_id) REFERENCES lab.request(tenant_id,entity_id,id));
CREATE FUNCTION lab.replace_terms(p_id int,p_key text,p_revision int,p_kind text,p_currency text,
  p_requested bigint,p_expected bigint,p_target int)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE oldrow lab.request%ROWTYPE;newrow lab.request%ROWTYPE;
  prior lab.receipt%ROWTYPE;intent jsonb;
BEGIN
  -- Fixed fixture source scope; no user authorization/capability is modeled.
  SELECT * INTO STRICT oldrow FROM lab.request WHERE tenant_id=1 AND entity_id=10 AND id=p_id FOR UPDATE;
  intent:=jsonb_build_object('revision',p_revision,'kind',p_kind,'currency',p_currency,
    'requested',p_requested,'expected',p_expected,'target',p_target);
  SELECT * INTO prior FROM lab.receipt WHERE tenant_id=1 AND entity_id=10
    AND request_id=p_id AND command_key=p_key;
  IF FOUND THEN
    IF prior.intent IS DISTINCT FROM intent THEN
      RAISE EXCEPTION 'changed business meaning' USING ERRCODE='23514';
    END IF;
    RETURN prior.result;
  END IF;
  IF oldrow.revision IS DISTINCT FROM p_revision THEN
    RAISE EXCEPTION 'stale request revision' USING ERRCODE='40001';
  END IF;
  UPDATE lab.request SET kind=p_kind,currency=p_currency,requested_minor=p_requested,
    expected_minor=p_expected,target_id=p_target,revision=revision+1
    WHERE tenant_id=1 AND entity_id=10 AND id=p_id RETURNING * INTO newrow;
  INSERT INTO lab.request_version VALUES(1,10,p_id,newrow.revision,to_jsonb(newrow));
  INSERT INTO lab.receipt VALUES(1,10,p_id,p_key,intent,to_jsonb(newrow));
  RETURN to_jsonb(newrow);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;
INSERT INTO lab.request VALUES
  (1,10,100,1,'monetary','USD',10000,8000,500,1),
  (1,10,100,2,'monetary','USD',NULL,NULL,NULL,1),
  (1,10,100,3,'nonfinancial',NULL,NULL,NULL,NULL,1),
  (1,10,100,4,'monetary','JPY',10000,NULL,NULL,1),
  (1,20,200,5,'monetary','USD',10000,NULL,600,1);
INSERT INTO lab.request_version SELECT tenant_id,entity_id,id,revision,to_jsonb(r) FROM lab.request r;
