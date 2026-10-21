-- Synthetic Independent follow-up task mechanics, not Core or financial qualification.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_b LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE other_tenant LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_worker LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
GRANT USAGE ON SCHEMA probe TO command_executor,missionary_a,missionary_b,other_tenant,source_worker,source_manager,policy_manager;
CREATE FUNCTION probe.tenant() RETURNS integer LANGUAGE sql STABLE AS $$SELECT CASE WHEN session_user='other_tenant' THEN 2 WHEN session_user IN('missionary_a','missionary_b','source_worker','source_manager','policy_manager') THEN 1 ELSE -1 END$$;
SET ROLE fixture_owner;
CREATE TABLE probe.parties(tenant integer,id integer,PRIMARY KEY(tenant,id));
CREATE TABLE probe.aliases(tenant integer,observed integer,canonical integer NOT NULL,PRIMARY KEY(tenant,observed),FOREIGN KEY(tenant,observed) REFERENCES probe.parties(tenant,id),FOREIGN KEY(tenant,canonical) REFERENCES probe.parties(tenant,id));
CREATE TABLE probe.ministries(tenant integer,id integer,PRIMARY KEY(tenant,id));
CREATE TABLE probe.gates(tenant integer,actor text,ministry integer,allowed boolean NOT NULL,revision integer NOT NULL,PRIMARY KEY(tenant,actor,ministry),FOREIGN KEY(tenant,ministry) REFERENCES probe.ministries(tenant,id));
CREATE TABLE probe.responsibility(tenant integer,ministry integer,actor text NOT NULL,revision integer NOT NULL,PRIMARY KEY(tenant,ministry),FOREIGN KEY(tenant,ministry) REFERENCES probe.ministries(tenant,id));
CREATE TABLE probe.source_versions(tenant integer,party integer,ministry integer,purpose text CHECK(purpose='first_support'),revision integer,
 eligibility text NOT NULL CHECK(eligibility IN('eligible','unknown','ineligible')),history_complete boolean NOT NULL,origin text NOT NULL CHECK(origin IN('live','history')),source_ref text NOT NULL,
 PRIMARY KEY(tenant,party,ministry,purpose,revision),FOREIGN KEY(tenant,party) REFERENCES probe.parties(tenant,id),FOREIGN KEY(tenant,ministry) REFERENCES probe.ministries(tenant,id));
CREATE TABLE probe.source_heads(tenant integer,party integer,ministry integer,purpose text,revision integer NOT NULL,PRIMARY KEY(tenant,party,ministry,purpose),FOREIGN KEY(tenant,party,ministry,purpose,revision) REFERENCES probe.source_versions(tenant,party,ministry,purpose,revision));
CREATE TABLE probe.signals(tenant integer,id text,observed_party integer NOT NULL,ministry integer NOT NULL,observed_revision integer NOT NULL,origin text NOT NULL CHECK(origin IN('live','history')),PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,observed_party) REFERENCES probe.parties(tenant,id),FOREIGN KEY(tenant,ministry) REFERENCES probe.ministries(tenant,id));
CREATE TABLE probe.tasks(tenant integer,id bigint GENERATED ALWAYS AS IDENTITY,party integer NOT NULL,ministry integer NOT NULL,purpose text NOT NULL CHECK(purpose='first_support'),
 state text NOT NULL CHECK(state IN('pending','held','withdrawn','done','not_needed')),assignee text NOT NULL,revision integer NOT NULL,creation_source_revision integer NOT NULL,current_source_revision integer NOT NULL,
 PRIMARY KEY(tenant,id),UNIQUE(tenant,party,ministry,purpose),
 FOREIGN KEY(tenant,party,ministry,purpose,creation_source_revision) REFERENCES probe.source_versions(tenant,party,ministry,purpose,revision),
 FOREIGN KEY(tenant,party,ministry,purpose,current_source_revision) REFERENCES probe.source_versions(tenant,party,ministry,purpose,revision));
CREATE TABLE probe.outcomes(tenant integer,task bigint,kind text NOT NULL CHECK(kind IN('done','not_needed')),actor text NOT NULL,expected_revision integer NOT NULL,meaning text NOT NULL,PRIMARY KEY(tenant,task),FOREIGN KEY(tenant,task) REFERENCES probe.tasks(tenant,id));
CREATE TABLE probe.audit(tenant integer,id bigint GENERATED ALWAYS AS IDENTITY,task bigint NOT NULL,kind text NOT NULL,note text NOT NULL CHECK(note<>'FAIL_AUDIT'),PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,task) REFERENCES probe.tasks(tenant,id));
CREATE TABLE probe.event_receipts(tenant integer,event text,result text NOT NULL,task bigint,PRIMARY KEY(tenant,event),FOREIGN KEY(tenant,event) REFERENCES probe.signals(tenant,id),FOREIGN KEY(tenant,task) REFERENCES probe.tasks(tenant,id));
CREATE TABLE probe.effect_sentinel(tenant integer,id integer,kind text NOT NULL CHECK(kind IN('interaction','communication','gift','enrollment')),PRIMARY KEY(tenant,id));
RESET ROLE;
CREATE FUNCTION probe.immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'immutable fixture evidence' USING ERRCODE='55000';END$$;
CREATE FUNCTION probe.task_identity() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF (NEW.tenant,NEW.id,NEW.party,NEW.ministry,NEW.purpose,NEW.creation_source_revision) IS DISTINCT FROM (OLD.tenant,OLD.id,OLD.party,OLD.ministry,OLD.purpose,OLD.creation_source_revision) THEN RAISE EXCEPTION 'immutable fixture task scope' USING ERRCODE='55000';END IF;RETURN NEW;END$$;
CREATE TRIGGER identity BEFORE UPDATE ON probe.tasks FOR EACH ROW EXECUTE FUNCTION probe.task_identity();
DO $$DECLARE x text;BEGIN
 FOREACH x IN ARRAY ARRAY['source_versions','signals','outcomes','audit','event_receipts'] LOOP EXECUTE format('CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON probe.%I FOR EACH ROW EXECUTE FUNCTION probe.immutable()',x);END LOOP;
 FOREACH x IN ARRAY ARRAY['parties','aliases','ministries','gates','responsibility','source_versions','source_heads','signals','tasks','outcomes','audit','event_receipts','effect_sentinel'] LOOP
  EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',x);EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',x);
  EXECUTE format('CREATE POLICY tenant_scope ON probe.%I TO command_executor USING(tenant=probe.tenant()) WITH CHECK(tenant=probe.tenant())',x);
 END LOOP;
END$$;
GRANT SELECT ON ALL TABLES IN SCHEMA probe TO command_executor;
REVOKE ALL ON probe.effect_sentinel FROM command_executor;
GRANT INSERT ON probe.tasks,probe.outcomes,probe.audit,probe.event_receipts,probe.source_versions TO command_executor;
GRANT UPDATE(state,assignee,revision,current_source_revision) ON probe.tasks TO command_executor;
GRANT UPDATE(revision) ON probe.gates,probe.source_heads TO command_executor;
GRANT UPDATE(actor,revision) ON probe.responsibility TO command_executor;
GRANT UPDATE(canonical) ON probe.aliases TO command_executor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA probe TO command_executor;
GRANT SELECT,UPDATE ON probe.gates TO policy_manager;
CREATE POLICY manager_gates ON probe.gates TO policy_manager USING(tenant=probe.tenant()) WITH CHECK(tenant=probe.tenant());

CREATE FUNCTION probe.consume(event_key text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();sig probe.signals;g probe.gates;person integer;responsible probe.responsibility;h probe.source_heads;s probe.source_versions;taskrow probe.tasks;receipt probe.event_receipts;newid bigint;result text;
BEGIN
 IF session_user<>'source_worker' OR event_key IS NULL THEN RETURN 'unavailable';END IF;
 SELECT * INTO sig FROM probe.signals WHERE tenant=t AND id=event_key;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor='source_worker' AND ministry=sig.ministry FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN 'unavailable';END IF;
 SELECT canonical INTO person FROM probe.aliases WHERE tenant=t AND observed=sig.observed_party FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 -- This current owner head serializes sibling wakeups, correction and creation.
 SELECT * INTO h FROM probe.source_heads WHERE tenant=t AND party=person AND ministry=sig.ministry AND purpose='first_support' FOR UPDATE;
 IF NOT FOUND THEN RETURN 'source_unavailable';END IF;
 SELECT * INTO receipt FROM probe.event_receipts WHERE tenant=t AND event=event_key;
 IF FOUND THEN RETURN 'receipt:'||receipt.result||COALESCE(':'||receipt.task,'');END IF;
 SELECT * INTO s FROM probe.source_versions WHERE (tenant,party,ministry,purpose,revision)=(h.tenant,h.party,h.ministry,h.purpose,h.revision);
 SELECT * INTO taskrow FROM probe.tasks WHERE tenant=t AND party=person AND ministry=sig.ministry AND purpose='first_support' FOR UPDATE;
 IF sig.origin='history' OR s.origin='history' THEN result:='history_only';
 ELSIF sig.observed_revision>h.revision THEN RETURN 'source_pending';
 ELSIF taskrow.id IS NOT NULL THEN
  result:=CASE WHEN taskrow.state='withdrawn' THEN 'needs_source_resolution' ELSE 'existing' END;newid:=taskrow.id;
 ELSIF s.eligibility<>'eligible' OR NOT s.history_complete THEN result:='not_qualified';
 ELSE
  SELECT * INTO responsible FROM probe.responsibility WHERE tenant=t AND ministry=sig.ministry FOR SHARE;
  IF NOT FOUND THEN RETURN 'needs_assignment';END IF;
  SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=responsible.actor AND ministry=sig.ministry FOR SHARE;
  IF NOT FOUND OR NOT g.allowed THEN RETURN 'needs_assignment';END IF;
  INSERT INTO probe.tasks(tenant,party,ministry,purpose,state,assignee,revision,creation_source_revision,current_source_revision) VALUES(t,person,sig.ministry,'first_support','pending',responsible.actor,1,h.revision,h.revision) RETURNING id INTO newid;
  INSERT INTO probe.audit(tenant,task,kind,note) VALUES(t,newid,'created',CASE WHEN event_key='FAIL_CREATE_AUDIT' THEN 'FAIL_AUDIT' ELSE 'synthetic-source-receipt' END);
  result:='created';
 END IF;
 INSERT INTO probe.event_receipts VALUES(t,event_key,result,newid);
 RETURN result||COALESCE(':'||newid,'');
END$$;

CREATE FUNCTION probe.change_source(person integer,m integer,expected integer,eligibility_arg text,complete_arg boolean,origin_arg text DEFAULT 'live') RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();h probe.source_heads;x probe.tasks;newstate text;
BEGIN
 IF session_user<>'source_manager' OR person IS NULL OR m IS NULL OR expected IS NULL OR eligibility_arg IS NULL OR complete_arg IS NULL OR origin_arg IS NULL THEN RETURN 'unavailable';END IF;
 SELECT * INTO h FROM probe.source_heads WHERE tenant=t AND party=person AND ministry=m AND purpose='first_support' FOR UPDATE;
 IF NOT FOUND OR h.revision<>expected THEN RETURN 'stale';END IF;
 INSERT INTO probe.source_versions VALUES(t,person,m,'first_support',expected+1,eligibility_arg,complete_arg,origin_arg,'synthetic-current-source-'||(expected+1));
 UPDATE probe.source_heads SET revision=expected+1 WHERE tenant=t AND party=person AND ministry=m AND purpose='first_support';
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND party=person AND ministry=m AND purpose='first_support' FOR UPDATE;
 IF FOUND THEN
  newstate:=x.state;
  IF x.state IN('pending','held') THEN
   newstate:=CASE WHEN eligibility_arg='ineligible' THEN 'withdrawn' WHEN eligibility_arg='unknown' OR NOT complete_arg THEN 'held' ELSE 'pending' END;
  END IF;
  UPDATE probe.tasks SET state=newstate,current_source_revision=expected+1,revision=revision+1 WHERE tenant=t AND id=x.id;
  INSERT INTO probe.audit(tenant,task,kind,note) VALUES(t,x.id,'source_changed','synthetic-source-correction');
 END IF;
 RETURN 'source:'||(expected+1);
END$$;

CREATE FUNCTION probe.read_task(n bigint) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();x probe.tasks;g probe.gates;
BEGIN
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n AND assignee=session_user;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=session_user AND ministry=x.ministry FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN 'unavailable';END IF;
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n FOR SHARE;
 IF NOT FOUND OR x.assignee<>session_user THEN RETURN 'unavailable';END IF;
 RETURN x.state||':'||x.revision;
END$$;

CREATE FUNCTION probe.finish(n bigint,expected integer,kind_arg text,meaning_arg text,request_key text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();x probe.tasks;g probe.gates;h probe.source_heads;s probe.source_versions;o probe.outcomes;
BEGIN
 IF n IS NULL OR expected IS NULL OR kind_arg IS NULL OR meaning_arg IS NULL OR request_key IS NULL OR kind_arg NOT IN('done','not_needed') THEN RETURN 'conflict';END IF;
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=session_user AND ministry=x.ministry FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN 'unavailable';END IF;
 SELECT * INTO h FROM probe.source_heads WHERE tenant=t AND party=x.party AND ministry=x.ministry AND purpose=x.purpose FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n FOR UPDATE;
 IF x.assignee<>session_user THEN RETURN 'unavailable';END IF;
 SELECT * INTO o FROM probe.outcomes WHERE tenant=t AND task=n;
 IF FOUND THEN
  IF o.kind IS DISTINCT FROM kind_arg OR o.meaning IS DISTINCT FROM meaning_arg OR o.expected_revision IS DISTINCT FROM expected THEN RETURN 'conflict';END IF;
  RETURN 'receipt:'||o.kind;
 END IF;
 SELECT * INTO s FROM probe.source_versions WHERE (tenant,party,ministry,purpose,revision)=(h.tenant,h.party,h.ministry,h.purpose,h.revision);
 IF x.state NOT IN('pending','held') THEN RETURN 'not_applicable';END IF;
 IF s.eligibility<>'eligible' OR NOT s.history_complete OR s.origin<>'live' THEN RETURN 'not_qualified';END IF;
 IF x.revision<>expected THEN RETURN 'stale';END IF;
 UPDATE probe.tasks SET state=kind_arg,revision=revision+1 WHERE tenant=t AND id=n;
 INSERT INTO probe.outcomes VALUES(t,n,kind_arg,session_user,expected,meaning_arg);
 INSERT INTO probe.audit(tenant,task,kind,note) VALUES(t,n,kind_arg,CASE WHEN request_key='FAIL_FINISH_AUDIT' THEN 'FAIL_AUDIT' ELSE 'synthetic-human-disposition' END);
 RETURN kind_arg;
END$$;

CREATE FUNCTION probe.reassign(n bigint,expected integer,target text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();g probe.gates;x probe.tasks;
BEGIN
 IF session_user<>'source_manager' OR target IS NULL OR expected IS NULL OR n IS NULL THEN RETURN 'unavailable';END IF;
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=target AND ministry=x.ministry FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN 'unavailable';END IF;
 SELECT * INTO x FROM probe.tasks WHERE tenant=t AND id=n FOR UPDATE;
 IF x.state NOT IN('pending','held') THEN RETURN 'not_applicable';END IF;
 IF x.revision<>expected THEN RETURN 'stale';END IF;
 IF x.assignee=target THEN RETURN 'unchanged';END IF;
 UPDATE probe.tasks SET assignee=target,revision=revision+1 WHERE tenant=t AND id=x.id;
 INSERT INTO probe.audit(tenant,task,kind,note) VALUES(t,x.id,'reassigned','synthetic-authorized-handoff');
 RETURN 'reassigned';
END$$;

ALTER FUNCTION probe.consume(text) OWNER TO command_executor;
ALTER FUNCTION probe.change_source(integer,integer,integer,text,boolean,text) OWNER TO command_executor;
ALTER FUNCTION probe.read_task(bigint) OWNER TO command_executor;
ALTER FUNCTION probe.finish(bigint,integer,text,text,text) OWNER TO command_executor;
ALTER FUNCTION probe.reassign(bigint,integer,text) OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,missionary_a,missionary_b,other_tenant,source_worker,source_manager,policy_manager;
GRANT EXECUTE ON FUNCTION probe.consume(text) TO source_worker;
GRANT EXECUTE ON FUNCTION probe.change_source(integer,integer,integer,text,boolean,text),probe.reassign(bigint,integer,text) TO source_manager;
GRANT EXECUTE ON FUNCTION probe.read_task(bigint),probe.finish(bigint,integer,text,text,text) TO missionary_a,missionary_b,other_tenant;
COMMIT;
