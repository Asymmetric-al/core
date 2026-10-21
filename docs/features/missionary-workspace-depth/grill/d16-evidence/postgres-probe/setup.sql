-- D16 synthetic mechanics only. No production goal schema, P12 engine or finance API.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE staff_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA probe TO command_executor,missionary_a,staff_a,policy_manager;
CREATE FUNCTION probe.tenant() RETURNS int LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT CASE WHEN session_user IN('missionary_a','staff_a','policy_manager') THEN 1 ELSE -1 END $$;
SET ROLE fixture_owner;
CREATE TABLE probe.subjects(tenant int,entity int,kind text CHECK(kind IN('missionary','project')),id int,PRIMARY KEY(tenant,entity,kind,id));
CREATE TABLE probe.authority(tenant int,entity int,kind text,subject int,actor text,can_view boolean NOT NULL,can_edit boolean NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,entity,kind,subject,actor),FOREIGN KEY(tenant,entity,kind,subject) REFERENCES probe.subjects);
CREATE TABLE probe.goal_versions(tenant int,entity int,kind text,subject int,version int,amount_minor bigint NOT NULL CHECK(amount_minor>0),currency text NOT NULL CHECK(currency IN('USD','JPY')),basis text NOT NULL CHECK(basis IN('monthly_equivalent','finite_period')),period_start date,period_end date,effective_from date NOT NULL,actor text NOT NULL,CHECK((basis='monthly_equivalent' AND period_start IS NULL AND period_end IS NULL) OR (basis='finite_period' AND period_start IS NOT NULL AND period_end IS NOT NULL AND period_start<period_end)),PRIMARY KEY(tenant,entity,kind,subject,version),FOREIGN KEY(tenant,entity,kind,subject) REFERENCES probe.subjects);
CREATE TABLE probe.heads(tenant int,entity int,kind text,subject int,revision int NOT NULL,version int,PRIMARY KEY(tenant,entity,kind,subject),FOREIGN KEY(tenant,entity,kind,subject) REFERENCES probe.subjects,FOREIGN KEY(tenant,entity,kind,subject,version) REFERENCES probe.goal_versions);
-- Immutable server-captured test intent. Numeric permits invalid input probes before validation/cast.
CREATE TABLE probe.intents(tenant int,id text,entity int,kind text,subject int,actor text NOT NULL,head_revision int NOT NULL,authority_revision int NOT NULL,amount_input numeric,currency text NOT NULL,basis text NOT NULL,period_start date,period_end date,effective_from date NOT NULL,audit_note text NOT NULL,PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,entity,kind,subject) REFERENCES probe.subjects);
CREATE TABLE probe.receipts(tenant int,intent text,entity int,kind text,subject int,version int,PRIMARY KEY(tenant,intent),FOREIGN KEY(tenant,intent) REFERENCES probe.intents,FOREIGN KEY(tenant,entity,kind,subject,version) REFERENCES probe.goal_versions);
CREATE TABLE probe.attempts(tenant int,actor text,request_key text,intent text NOT NULL,PRIMARY KEY(tenant,actor,request_key),FOREIGN KEY(tenant,intent) REFERENCES probe.intents);
CREATE TABLE probe.audit(tenant int,intent text,entity int,kind text,subject int,version int,actor text NOT NULL,note text NOT NULL CHECK(note<>'FAIL_FIXTURE_AUDIT'),PRIMARY KEY(tenant,intent),FOREIGN KEY(tenant,intent) REFERENCES probe.intents,FOREIGN KEY(tenant,entity,kind,subject,version) REFERENCES probe.goal_versions);
CREATE TABLE probe.public_pin(tenant int,page int,entity int,kind text,subject int,version int,PRIMARY KEY(tenant,page),FOREIGN KEY(tenant,entity,kind,subject,version) REFERENCES probe.goal_versions);
CREATE TABLE probe.finance(tenant int,id int,approved_plan_amount bigint NOT NULL,recorded_gifts bigint NOT NULL,commitments bigint NOT NULL,PRIMARY KEY(tenant,id));
RESET ROLE;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['subjects','authority','goal_versions','heads','intents','receipts','attempts','audit','public_pin','finance'] LOOP
 EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY coarse_tenant ON probe.%I TO command_executor USING(tenant=probe.tenant())',t);
END LOOP; END $$;
GRANT SELECT ON probe.subjects,probe.authority,probe.goal_versions,probe.heads,probe.intents,probe.receipts,probe.attempts TO command_executor;
GRANT INSERT ON probe.goal_versions,probe.receipts,probe.attempts,probe.audit TO command_executor;
GRANT UPDATE(revision,version) ON probe.heads TO command_executor;
GRANT UPDATE(revision) ON probe.authority TO command_executor;
GRANT SELECT,UPDATE ON probe.authority TO policy_manager;
CREATE POLICY policy_tenant ON probe.authority TO policy_manager USING(tenant=probe.tenant());
CREATE FUNCTION probe.immutable_history() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN RAISE EXCEPTION 'immutable fixture history' USING ERRCODE='55000'; END $$;
CREATE TRIGGER immutable_goal BEFORE UPDATE OR DELETE ON probe.goal_versions FOR EACH ROW EXECUTE FUNCTION probe.immutable_history();
CREATE TRIGGER immutable_intent BEFORE UPDATE OR DELETE ON probe.intents FOR EACH ROW EXECUTE FUNCTION probe.immutable_history();
CREATE TRIGGER immutable_receipt BEFORE UPDATE OR DELETE ON probe.receipts FOR EACH ROW EXECUTE FUNCTION probe.immutable_history();
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON probe.audit FOR EACH ROW EXECUTE FUNCTION probe.immutable_history();

CREATE FUNCTION probe.save_goal(p_intent text,p_request_key text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE i probe.intents%ROWTYPE; a probe.authority%ROWTYPE; h probe.heads%ROWTYPE; accepted int; prior_intent text; next_version int;
BEGIN
 SELECT * INTO i FROM probe.intents WHERE tenant=probe.tenant() AND id=p_intent AND actor=session_user;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO a FROM probe.authority WHERE (tenant,entity,kind,subject,actor)=(i.tenant,i.entity,i.kind,i.subject,session_user) FOR SHARE;
 IF NOT FOUND OR NOT a.can_edit THEN RETURN 'unavailable'; END IF;
 SELECT * INTO h FROM probe.heads WHERE (tenant,entity,kind,subject)=(i.tenant,i.entity,i.kind,i.subject) FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT intent INTO prior_intent FROM probe.attempts WHERE tenant=i.tenant AND actor=session_user AND request_key=p_request_key;
 IF FOUND AND prior_intent<>p_intent THEN RETURN 'conflict'; END IF;
 SELECT version INTO accepted FROM probe.receipts WHERE tenant=i.tenant AND intent=p_intent;
 IF FOUND THEN
  INSERT INTO probe.attempts VALUES(i.tenant,session_user,p_request_key,p_intent) ON CONFLICT DO NOTHING;
  RETURN 'accepted:'||accepted||CASE WHEN h.version=accepted THEN ':current' ELSE ':superseded' END;
 END IF;
 IF a.revision<>i.authority_revision OR h.revision<>i.head_revision THEN RETURN 'conflict'; END IF;
 IF i.amount_input IS NULL OR i.amount_input IN('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric) OR i.amount_input<=0 OR i.amount_input<>trunc(i.amount_input) OR i.amount_input>9223372036854775807::numeric THEN RETURN 'invalid_amount'; END IF;
 IF i.currency NOT IN('USD','JPY') OR i.basis NOT IN('monthly_equivalent','finite_period') OR (i.basis='monthly_equivalent' AND (i.period_start IS NOT NULL OR i.period_end IS NOT NULL)) OR (i.basis='finite_period' AND (i.period_start IS NULL OR i.period_end IS NULL OR i.period_start>=i.period_end)) THEN RETURN 'invalid_meaning'; END IF;
 next_version:=h.revision+1;
 INSERT INTO probe.goal_versions VALUES(i.tenant,i.entity,i.kind,i.subject,next_version,i.amount_input::bigint,i.currency,i.basis,i.period_start,i.period_end,i.effective_from,session_user);
 UPDATE probe.heads SET revision=next_version,version=next_version WHERE (tenant,entity,kind,subject)=(i.tenant,i.entity,i.kind,i.subject);
 INSERT INTO probe.receipts VALUES(i.tenant,p_intent,i.entity,i.kind,i.subject,next_version);
 INSERT INTO probe.attempts VALUES(i.tenant,session_user,p_request_key,p_intent);
 INSERT INTO probe.audit VALUES(i.tenant,p_intent,i.entity,i.kind,i.subject,next_version,session_user,i.audit_note);
 RETURN 'accepted:'||next_version||':current';
END $$;

CREATE FUNCTION probe.current_goal(p_kind text,p_subject int) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE h probe.heads%ROWTYPE; v probe.goal_versions%ROWTYPE;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM probe.authority WHERE tenant=probe.tenant() AND entity=10 AND kind=p_kind AND subject=p_subject AND actor=session_user AND can_view) THEN RETURN 'unavailable'; END IF;
 SELECT * INTO h FROM probe.heads WHERE tenant=probe.tenant() AND entity=10 AND kind=p_kind AND subject=p_subject;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 IF h.version IS NULL THEN RETURN 'unset'; END IF;
 SELECT * INTO v FROM probe.goal_versions WHERE (tenant,entity,kind,subject,version)=(h.tenant,h.entity,h.kind,h.subject,h.version);
 RETURN v.version||':'||v.amount_minor||':'||v.currency||':'||v.basis;
END $$;
ALTER FUNCTION probe.save_goal(text,text) OWNER TO command_executor;
ALTER FUNCTION probe.current_goal(text,int) OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,missionary_a,staff_a,policy_manager;
GRANT EXECUTE ON FUNCTION probe.save_goal(text,text),probe.current_goal(text,int) TO missionary_a,staff_a;
INSERT INTO probe.subjects VALUES(1,10,'missionary',1),(1,10,'project',1),(2,20,'missionary',1);
INSERT INTO probe.authority SELECT 1,10,kind,1,actor,true,true,1 FROM unnest(ARRAY['missionary','project'])kind CROSS JOIN unnest(ARRAY['missionary_a','staff_a'])actor;
INSERT INTO probe.goal_versions VALUES(1,10,'missionary',1,1,10000,'USD','monthly_equivalent',NULL,NULL,'2026-10-01','staff_a');
INSERT INTO probe.heads VALUES(1,10,'missionary',1,1,1),(1,10,'project',1,0,NULL);
INSERT INTO probe.public_pin VALUES(1,100,10,'missionary',1,1);
INSERT INTO probe.finance VALUES(1,1,12000,5000,3000);
COMMIT;
