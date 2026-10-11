-- D23 review-round mechanics only; synthetic policy/actor flags are NOT P12.
CREATE SCHEMA lab;
CREATE TABLE lab.policy(scope_id int PRIMARY KEY,material_epoch int NOT NULL,
  requirement text CHECK(requirement IN('required','not_required','unknown')) NOT NULL,
  reviewer_allowed boolean NOT NULL,presenter_allowed boolean NOT NULL);
CREATE TABLE lab.proposal(scope_id int NOT NULL,id int NOT NULL,business_version int NOT NULL,
  metadata_revision int NOT NULL,current_round int NOT NULL,terms jsonb NOT NULL,
  PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id) REFERENCES lab.policy(scope_id));
CREATE TABLE lab.terms_version(scope_id int NOT NULL,proposal_id int NOT NULL,version int NOT NULL,terms jsonb NOT NULL,
  PRIMARY KEY(scope_id,proposal_id,version),FOREIGN KEY(scope_id,proposal_id) REFERENCES lab.proposal(scope_id,id));
CREATE TABLE lab.review_round(scope_id int NOT NULL,proposal_id int NOT NULL,id int NOT NULL,
  business_version int NOT NULL,material_policy_epoch int NOT NULL,
  PRIMARY KEY(scope_id,proposal_id,id),
  FOREIGN KEY(scope_id,proposal_id,business_version) REFERENCES lab.terms_version(scope_id,proposal_id,version));
CREATE TABLE lab.decision(scope_id int NOT NULL,proposal_id int NOT NULL,round_id int NOT NULL,
  outcome text NOT NULL CHECK(outcome IN('approved','rejected')),reviewer_id int NOT NULL,
  business_version int NOT NULL,policy_epoch int NOT NULL,
  PRIMARY KEY(scope_id,proposal_id,round_id),
  FOREIGN KEY(scope_id,proposal_id,round_id) REFERENCES lab.review_round(scope_id,proposal_id,id));
CREATE TABLE lab.receipt(scope_id int NOT NULL,proposal_id int NOT NULL,command_key text NOT NULL,
  payload jsonb NOT NULL,result jsonb NOT NULL,PRIMARY KEY(scope_id,proposal_id,command_key));
CREATE TABLE lab.internal_event(scope_id int NOT NULL,proposal_id int NOT NULL,round_id int NOT NULL,
  kind text NOT NULL CHECK(kind='review_decided'),command_key text NOT NULL CHECK(command_key<>'fixture-outbox-failure'),
  PRIMARY KEY(scope_id,proposal_id,round_id),
  FOREIGN KEY(scope_id,proposal_id,round_id) REFERENCES lab.decision(scope_id,proposal_id,round_id));
CREATE TABLE lab.started_action(scope_id int NOT NULL,proposal_id int NOT NULL,business_version int NOT NULL,
  policy_epoch int NOT NULL,PRIMARY KEY(scope_id,proposal_id,business_version));

CREATE FUNCTION lab.decide(s int,r int,k text,outcome text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE pol lab.policy%ROWTYPE;p lab.proposal%ROWTYPE;rr lab.review_round%ROWTYPE;
  prior lab.receipt%ROWTYPE;payload jsonb;result jsonb;
BEGIN
  SELECT * INTO STRICT pol FROM lab.policy WHERE scope_id=s FOR SHARE;
  SELECT * INTO STRICT p FROM lab.proposal WHERE scope_id=s AND id=1 FOR UPDATE;
  payload:=jsonb_build_object('round',r,'outcome',outcome,'reviewer',7);
  SELECT * INTO prior FROM lab.receipt WHERE scope_id=s AND proposal_id=1 AND command_key=k;
  IF FOUND THEN
    IF prior.payload IS DISTINCT FROM payload THEN
      RAISE EXCEPTION 'changed decision meaning' USING ERRCODE='23514';
    END IF;
    -- Product must authorize historical result disclosure separately.
    RETURN prior.result;
  END IF;
  IF NOT pol.reviewer_allowed THEN RAISE EXCEPTION 'reviewer unavailable' USING ERRCODE='42501'; END IF;
  IF pol.requirement<>'required' THEN RAISE EXCEPTION 'not a qualified required review' USING ERRCODE='23514'; END IF;
  SELECT * INTO STRICT rr FROM lab.review_round WHERE scope_id=s AND proposal_id=1 AND id=r;
  IF p.current_round<>r OR p.business_version<>rr.business_version OR pol.material_epoch<>rr.material_policy_epoch THEN
    RAISE EXCEPTION 'reviewed business terms or relevant policy are stale' USING ERRCODE='40001';
  END IF;
  IF EXISTS(SELECT 1 FROM lab.decision WHERE scope_id=s AND proposal_id=1 AND round_id=r) THEN
    RAISE EXCEPTION 'round already decided' USING ERRCODE='23514';
  END IF;
  INSERT INTO lab.decision VALUES(s,1,r,outcome,7,rr.business_version,pol.material_epoch);
  result:=jsonb_build_object('round',r,'outcome',outcome,'business_version',rr.business_version,'policy_epoch',pol.material_epoch);
  INSERT INTO lab.receipt VALUES(s,1,k,payload,result);
  -- This is internal decision evidence only, never a donor-send/charge instruction.
  INSERT INTO lab.internal_event VALUES(s,1,r,'review_decided',k);
  RETURN result;
END $$;

CREATE FUNCTION lab.revise(s int,expected int,new_terms jsonb) RETURNS int
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE pol lab.policy%ROWTYPE;p lab.proposal%ROWTYPE;
BEGIN
  SELECT * INTO STRICT pol FROM lab.policy WHERE scope_id=s FOR SHARE;
  SELECT * INTO STRICT p FROM lab.proposal WHERE scope_id=s AND id=1 FOR UPDATE;
  IF p.business_version<>expected THEN RAISE EXCEPTION 'stale terms' USING ERRCODE='40001'; END IF;
  UPDATE lab.proposal SET business_version=business_version+1,current_round=current_round+1,terms=new_terms
    WHERE scope_id=s AND id=1 RETURNING * INTO p;
  INSERT INTO lab.terms_version VALUES(s,1,p.business_version,new_terms);
  INSERT INTO lab.review_round VALUES(s,1,p.current_round,p.business_version,pol.material_epoch);
  RETURN p.business_version;
END $$;

CREATE FUNCTION lab.start_action(s int,expected int) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE pol lab.policy%ROWTYPE;p lab.proposal%ROWTYPE;
BEGIN
  SELECT * INTO STRICT pol FROM lab.policy WHERE scope_id=s FOR SHARE;
  SELECT * INTO STRICT p FROM lab.proposal WHERE scope_id=s AND id=1 FOR UPDATE;
  IF NOT pol.presenter_allowed THEN RAISE EXCEPTION 'presenter unavailable' USING ERRCODE='42501'; END IF;
  IF p.business_version<>expected THEN RAISE EXCEPTION 'stale action terms' USING ERRCODE='40001'; END IF;
  IF pol.requirement='unknown' THEN RAISE EXCEPTION 'applicability unresolved' USING ERRCODE='23514'; END IF;
  IF pol.requirement='required' AND NOT EXISTS(SELECT 1 FROM lab.decision d
    WHERE d.scope_id=s AND d.proposal_id=1 AND d.round_id=p.current_round
      AND d.business_version=p.business_version AND d.policy_epoch=pol.material_epoch AND d.outcome='approved') THEN
    RAISE EXCEPTION 'no currently compatible approval' USING ERRCODE='23514';
  END IF;
  -- Explicit caller-invoked local marker, not dispatch or approval-triggered action.
  INSERT INTO lab.started_action VALUES(s,1,p.business_version,pol.material_epoch);
  RETURN 'started';
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA lab FROM PUBLIC;
INSERT INTO lab.policy SELECT i,1,'required',true,true FROM generate_series(1,10)i;
INSERT INTO lab.proposal SELECT i,1,1,1,1,'{"requested_minor":10000,"currency":"USD"}' FROM generate_series(1,10)i;
INSERT INTO lab.terms_version SELECT scope_id,id,business_version,terms FROM lab.proposal;
INSERT INTO lab.review_round SELECT i,1,1,1,1 FROM generate_series(1,10)i;
