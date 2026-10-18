-- Synthetic mechanics only. Not an application schema, P12 resolver or provider adapter.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_b LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE other_tenant LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE provider_worker LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
GRANT USAGE ON SCHEMA probe TO command_executor,missionary_a,missionary_b,other_tenant,provider_worker,policy_manager;
CREATE FUNCTION probe.tenant() RETURNS integer LANGUAGE sql STABLE AS $$
 SELECT CASE WHEN session_user='other_tenant' THEN 2 WHEN session_user IN('missionary_a','missionary_b','provider_worker','policy_manager') THEN 1 ELSE -1 END
$$;
SET ROLE fixture_owner;
CREATE TABLE probe.gates(tenant integer,actor text,purpose text,allowed boolean NOT NULL,revision integer NOT NULL,PRIMARY KEY(tenant,actor,purpose));
CREATE TABLE probe.bindings(tenant integer,id integer,purpose text,credential_revision integer NOT NULL,model text NOT NULL,region text NOT NULL,prompt_version integer NOT NULL,PRIMARY KEY(tenant,id),UNIQUE(tenant,id,purpose));
CREATE TABLE probe.routes(tenant integer,purpose text,binding integer NOT NULL,active boolean NOT NULL,revision integer NOT NULL,PRIMARY KEY(tenant,purpose),FOREIGN KEY(tenant,binding,purpose) REFERENCES probe.bindings(tenant,id,purpose));
CREATE TABLE probe.tenant_budget(tenant integer PRIMARY KEY,ceiling bigint NOT NULL CHECK(ceiling>=0),held bigint NOT NULL DEFAULT 0 CHECK(held>=0 AND held<=ceiling));
CREATE TABLE probe.purpose_budget(tenant integer,purpose text,ceiling bigint NOT NULL CHECK(ceiling>=0),held bigint NOT NULL DEFAULT 0 CHECK(held>=0 AND held<=ceiling),PRIMARY KEY(tenant,purpose),FOREIGN KEY(tenant) REFERENCES probe.tenant_budget(tenant));
CREATE TABLE probe.drafts(tenant integer,id integer,actor text NOT NULL,purpose text NOT NULL,head integer NOT NULL,PRIMARY KEY(tenant,id),UNIQUE(tenant,id,actor,purpose));
CREATE TABLE probe.versions(tenant integer,draft integer,revision integer,body text NOT NULL,PRIMARY KEY(tenant,draft,revision),FOREIGN KEY(tenant,draft) REFERENCES probe.drafts(tenant,id));
ALTER TABLE probe.drafts ADD FOREIGN KEY(tenant,id,head) REFERENCES probe.versions(tenant,draft,revision) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE probe.invocations(
 tenant integer,id bigint GENERATED ALWAYS AS IDENTITY,intent text NOT NULL,actor text NOT NULL,purpose text NOT NULL,
 draft integer NOT NULL,source_revision integer NOT NULL,binding integer NOT NULL,gate_revision integer NOT NULL,route_revision integer NOT NULL,
 voice text NOT NULL CHECK(voice IN('neutral','warm')),reserved bigint NOT NULL CHECK(reserved=60),
 PRIMARY KEY(tenant,id),UNIQUE(tenant,actor,purpose,intent),UNIQUE(tenant,id,actor,purpose),UNIQUE(tenant,id,draft,source_revision),
 FOREIGN KEY(tenant,draft,actor,purpose) REFERENCES probe.drafts(tenant,id,actor,purpose),
 FOREIGN KEY(tenant,draft,source_revision) REFERENCES probe.versions(tenant,draft,revision),
 FOREIGN KEY(tenant,binding,purpose) REFERENCES probe.bindings(tenant,id,purpose));
CREATE TABLE probe.execution(tenant integer,invocation bigint,state text NOT NULL CHECK(state IN('reserved','dispatched','unknown','ready')),PRIMARY KEY(tenant,invocation),FOREIGN KEY(tenant,invocation) REFERENCES probe.invocations(tenant,id));
CREATE TABLE probe.evidence(tenant integer,invocation bigint,kind text CHECK(kind IN('reserved','dispatched','unknown','ready','applied')),safe_note text NOT NULL CHECK(safe_note<>'FAIL_AUDIT'),PRIMARY KEY(tenant,invocation,kind),FOREIGN KEY(tenant,invocation) REFERENCES probe.invocations(tenant,id));
CREATE TABLE probe.suggestions(tenant integer,invocation bigint,actor text NOT NULL,purpose text NOT NULL,output_digest text NOT NULL,expires_at timestamptz NOT NULL,PRIMARY KEY(tenant,invocation),FOREIGN KEY(tenant,invocation,actor,purpose) REFERENCES probe.invocations(tenant,id,actor,purpose));
CREATE TABLE probe.bodies(tenant integer,invocation bigint,body text NOT NULL,PRIMARY KEY(tenant,invocation),FOREIGN KEY(tenant,invocation) REFERENCES probe.suggestions(tenant,invocation));
CREATE TABLE probe.applications(tenant integer,invocation bigint,draft integer NOT NULL,successor integer NOT NULL,source_revision integer NOT NULL,output_digest text NOT NULL,PRIMARY KEY(tenant,invocation),FOREIGN KEY(tenant,invocation) REFERENCES probe.suggestions(tenant,invocation),FOREIGN KEY(tenant,invocation,draft,source_revision) REFERENCES probe.invocations(tenant,id,draft,source_revision),FOREIGN KEY(tenant,draft,successor) REFERENCES probe.versions(tenant,draft,revision));
CREATE TABLE probe.send_sentinel(tenant integer,id integer,PRIMARY KEY(tenant,id));
RESET ROLE;
CREATE FUNCTION probe.immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'fixture immutable evidence' USING ERRCODE='55000'; END$$;
DO $$DECLARE x text;BEGIN
 FOREACH x IN ARRAY ARRAY['bindings','invocations','versions','evidence','suggestions','applications'] LOOP
  EXECUTE format('CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON probe.%I FOR EACH ROW EXECUTE FUNCTION probe.immutable()',x);
 END LOOP;
 FOREACH x IN ARRAY ARRAY['gates','bindings','routes','tenant_budget','purpose_budget','drafts','versions','invocations','execution','evidence','suggestions','bodies','applications','send_sentinel'] LOOP
  EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',x);
  EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',x);
  EXECUTE format('CREATE POLICY tenant_scope ON probe.%I TO command_executor USING(tenant=probe.tenant()) WITH CHECK(tenant=probe.tenant())',x);
 END LOOP;
END$$;
GRANT SELECT ON ALL TABLES IN SCHEMA probe TO command_executor;
REVOKE ALL ON probe.send_sentinel FROM command_executor;
GRANT INSERT ON probe.invocations,probe.execution,probe.evidence,probe.suggestions,probe.bodies,probe.versions,probe.applications TO command_executor;
GRANT UPDATE(held) ON probe.tenant_budget,probe.purpose_budget TO command_executor;
GRANT UPDATE(head) ON probe.drafts TO command_executor;
GRANT UPDATE(state) ON probe.execution TO command_executor;
GRANT DELETE ON probe.bodies TO command_executor;
-- PostgreSQL row-lock clauses require UPDATE privilege on at least one column.
GRANT UPDATE(revision) ON probe.gates,probe.routes TO command_executor;
GRANT UPDATE(body) ON probe.bodies TO command_executor;
GRANT UPDATE(output_digest) ON probe.suggestions TO command_executor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA probe TO command_executor;
GRANT SELECT,UPDATE ON probe.gates,probe.routes TO policy_manager;
CREATE POLICY manager_gates ON probe.gates TO policy_manager USING(tenant=probe.tenant()) WITH CHECK(tenant=probe.tenant());
CREATE POLICY manager_routes ON probe.routes TO policy_manager USING(tenant=probe.tenant()) WITH CHECK(tenant=probe.tenant());

CREATE FUNCTION probe.request_ai(d integer,rev integer,key text,voice_arg text,binding_arg integer) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();doc probe.drafts;g probe.gates;r probe.routes;i probe.invocations;tb probe.tenant_budget;pb probe.purpose_budget;newid bigint;s text;
BEGIN
 SELECT * INTO doc FROM probe.drafts WHERE tenant=t AND id=d AND actor=session_user;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=session_user AND purpose=doc.purpose FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN 'unavailable'; END IF;
 SELECT * INTO r FROM probe.routes WHERE tenant=t AND purpose=doc.purpose FOR SHARE;
 IF NOT FOUND OR NOT r.active OR r.binding<>binding_arg THEN RETURN 'unavailable'; END IF;
 SELECT * INTO doc FROM probe.drafts WHERE tenant=t AND id=d AND actor=session_user FOR SHARE;
 -- Lock common budget first, then the narrower purpose, in one consistent order.
 SELECT * INTO tb FROM probe.tenant_budget WHERE tenant=t FOR UPDATE;
 SELECT * INTO pb FROM probe.purpose_budget WHERE tenant=t AND purpose=doc.purpose FOR UPDATE;
 IF tb.tenant IS NULL OR pb.tenant IS NULL THEN RETURN 'unavailable'; END IF;
 SELECT * INTO i FROM probe.invocations WHERE tenant=t AND actor=session_user AND purpose=doc.purpose AND intent=key;
 IF FOUND THEN
  IF i.draft<>d OR i.source_revision<>rev OR i.voice<>voice_arg OR i.binding<>binding_arg THEN RETURN 'conflict'; END IF;
  SELECT state INTO s FROM probe.execution WHERE tenant=t AND invocation=i.id;
  RETURN CASE WHEN s='unknown' THEN 'inspect:' ELSE 'receipt:' END||i.id;
 END IF;
 IF doc.head<>rev THEN RETURN 'stale'; END IF;
 IF tb.held+60>tb.ceiling THEN RETURN 'budget_tenant'; END IF;
 IF pb.held+60>pb.ceiling THEN RETURN 'budget_purpose'; END IF;
 INSERT INTO probe.invocations(tenant,intent,actor,purpose,draft,source_revision,binding,gate_revision,route_revision,voice,reserved) VALUES(t,key,session_user,doc.purpose,d,rev,binding_arg,g.revision,r.revision,voice_arg,60) RETURNING id INTO newid;
 UPDATE probe.tenant_budget SET held=held+60 WHERE tenant=t;
 UPDATE probe.purpose_budget SET held=held+60 WHERE tenant=t AND purpose=doc.purpose;
 INSERT INTO probe.execution VALUES(t,newid,'reserved');
 INSERT INTO probe.evidence VALUES(t,newid,'reserved',CASE WHEN key='FAIL_AUDIT' THEN 'FAIL_AUDIT' ELSE 'safe-fixture-correlation' END);
 RETURN 'reserved:'||newid;
END$$;

-- Synthetic trusted worker observations. There is no provider/network call here.
CREATE FUNCTION probe.observe_result(n bigint,result text,ttl integer DEFAULT 3600) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();i probe.invocations;g probe.gates;r probe.routes;e probe.execution;
BEGIN
 IF session_user<>'provider_worker' THEN RETURN 'unavailable'; END IF;
 SELECT * INTO i FROM probe.invocations WHERE tenant=t AND id=n;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=i.actor AND purpose=i.purpose FOR SHARE;
 SELECT * INTO r FROM probe.routes WHERE tenant=t AND purpose=i.purpose FOR SHARE;
 IF g.tenant IS NULL OR r.tenant IS NULL OR NOT g.allowed OR g.revision<>i.gate_revision OR NOT r.active OR r.revision<>i.route_revision OR r.binding<>i.binding THEN RETURN 'unavailable'; END IF;
 SELECT * INTO e FROM probe.execution WHERE tenant=t AND invocation=n FOR UPDATE;
 IF result='dispatch' AND e.state='reserved' THEN
  UPDATE probe.execution SET state='dispatched' WHERE tenant=t AND invocation=n;
  INSERT INTO probe.evidence VALUES(t,n,'dispatched','safe-fixture-correlation');RETURN 'dispatched';
 ELSIF result='unknown' AND e.state='dispatched' THEN
  UPDATE probe.execution SET state='unknown' WHERE tenant=t AND invocation=n;
  INSERT INTO probe.evidence VALUES(t,n,'unknown','safe-fixture-correlation');RETURN 'unknown';
 ELSIF result='ready' AND e.state='dispatched' THEN
  INSERT INTO probe.suggestions VALUES(t,n,i.actor,i.purpose,'synthetic-digest-'||n,clock_timestamp()+ttl*interval '1 second');
  INSERT INTO probe.bodies VALUES(t,n,'Synthetic suggested text '||n);
  UPDATE probe.execution SET state='ready' WHERE tenant=t AND invocation=n;
  INSERT INTO probe.evidence VALUES(t,n,'ready','safe-fixture-correlation');RETURN 'ready';
 END IF;
 RETURN 'inspect';
END$$;

CREATE FUNCTION probe.read_suggestion(n bigint) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();i probe.invocations;g probe.gates;r probe.routes;s probe.suggestions;b text;headrev integer;
BEGIN
 SELECT * INTO i FROM probe.invocations WHERE tenant=t AND id=n AND actor=session_user;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=session_user AND purpose=i.purpose FOR SHARE;
 SELECT * INTO r FROM probe.routes WHERE tenant=t AND purpose=i.purpose FOR SHARE;
 IF g.tenant IS NULL OR r.tenant IS NULL OR NOT g.allowed OR g.revision<>i.gate_revision OR NOT r.active OR r.revision<>i.route_revision OR r.binding<>i.binding THEN RETURN 'unavailable'; END IF;
 SELECT head INTO headrev FROM probe.drafts WHERE tenant=t AND id=i.draft FOR SHARE;
 SELECT * INTO s FROM probe.suggestions WHERE tenant=t AND invocation=n;
 IF NOT FOUND OR headrev<>i.source_revision OR s.expires_at<=clock_timestamp() THEN RETURN 'unavailable'; END IF;
 SELECT body INTO b FROM probe.bodies WHERE tenant=t AND invocation=n;
 IF s.expires_at<=clock_timestamp() THEN RETURN 'unavailable'; END IF;
 RETURN COALESCE('body:'||b,'unavailable');
END$$;

CREATE FUNCTION probe.apply_suggestion(n bigint,rev integer,digest text,transport_key text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();i probe.invocations;g probe.gates;r probe.routes;s probe.suggestions;doc probe.drafts;a probe.applications;b text;
BEGIN
 SELECT * INTO i FROM probe.invocations WHERE tenant=t AND id=n AND actor=session_user;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO g FROM probe.gates WHERE tenant=t AND actor=session_user AND purpose=i.purpose FOR SHARE;
 SELECT * INTO r FROM probe.routes WHERE tenant=t AND purpose=i.purpose FOR SHARE;
 IF g.tenant IS NULL OR r.tenant IS NULL OR NOT g.allowed OR g.revision<>i.gate_revision OR NOT r.active OR r.revision<>i.route_revision OR r.binding<>i.binding THEN RETURN 'unavailable'; END IF;
 SELECT * INTO doc FROM probe.drafts WHERE tenant=t AND id=i.draft FOR UPDATE;
 SELECT * INTO a FROM probe.applications WHERE tenant=t AND invocation=n;
 IF FOUND THEN
  IF a.source_revision<>rev OR a.output_digest<>digest THEN RETURN 'conflict'; END IF;
  RETURN 'receipt:'||a.successor;
 END IF;
 SELECT * INTO s FROM probe.suggestions WHERE tenant=t AND invocation=n;
 IF NOT FOUND OR s.expires_at<=clock_timestamp() THEN RETURN 'expired'; END IF;
 IF doc.head<>rev OR i.source_revision<>rev THEN RETURN 'stale'; END IF;
 IF s.output_digest<>digest THEN RETURN 'conflict'; END IF;
 SELECT body INTO b FROM probe.bodies WHERE tenant=t AND invocation=n FOR UPDATE;
 IF NOT FOUND THEN RETURN 'expired'; END IF;
 INSERT INTO probe.versions VALUES(t,doc.id,rev+1,b);
 UPDATE probe.drafts SET head=rev+1 WHERE tenant=t AND id=doc.id;
 INSERT INTO probe.applications VALUES(t,n,doc.id,rev+1,rev,digest);
 INSERT INTO probe.evidence VALUES(t,n,'applied',CASE WHEN transport_key='FAIL_AUDIT' THEN 'FAIL_AUDIT' ELSE 'safe-fixture-correlation' END);
 DELETE FROM probe.bodies WHERE tenant=t AND invocation=n;
 IF s.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'fixture body expired before application' USING ERRCODE='40001'; END IF;
 RETURN 'applied:'||(rev+1);
END$$;

CREATE FUNCTION probe.manual_edit(d integer,rev integer) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t integer:=probe.tenant();doc probe.drafts;
BEGIN
 SELECT * INTO doc FROM probe.drafts WHERE tenant=t AND id=d AND actor=session_user FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 IF doc.head<>rev THEN RETURN 'stale'; END IF;
 INSERT INTO probe.versions VALUES(t,d,rev+1,'Synthetic manual successor');
 UPDATE probe.drafts SET head=rev+1 WHERE tenant=t AND id=d;
 RETURN 'edited';
END$$;

ALTER FUNCTION probe.request_ai(integer,integer,text,text,integer) OWNER TO command_executor;
ALTER FUNCTION probe.observe_result(bigint,text,integer) OWNER TO command_executor;
ALTER FUNCTION probe.read_suggestion(bigint) OWNER TO command_executor;
ALTER FUNCTION probe.apply_suggestion(bigint,integer,text,text) OWNER TO command_executor;
ALTER FUNCTION probe.manual_edit(integer,integer) OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,missionary_a,missionary_b,other_tenant,provider_worker,policy_manager;
GRANT EXECUTE ON FUNCTION probe.request_ai(integer,integer,text,text,integer),probe.read_suggestion(bigint),probe.apply_suggestion(bigint,integer,text,text),probe.manual_edit(integer,integer) TO missionary_a,missionary_b,other_tenant;
GRANT EXECUTE ON FUNCTION probe.observe_result(bigint,text,integer) TO provider_worker;

INSERT INTO probe.gates VALUES(1,'missionary_a','newsletter',true,1),(1,'missionary_b','newsletter',true,1),(1,'missionary_a','profile',true,1),(2,'other_tenant','newsletter',true,1);
INSERT INTO probe.bindings VALUES(1,1,'newsletter',101,'certified-fixture-model','fixture-region',1),(1,2,'profile',201,'other-fixture-model','fixture-region',1),(2,3,'newsletter',301,'certified-fixture-model','fixture-region',1),(1,4,'newsletter',102,'replacement-fixture-model','fixture-region',2);
INSERT INTO probe.routes VALUES(1,'newsletter',1,true,1),(1,'profile',2,true,1),(2,'newsletter',3,true,1);
INSERT INTO probe.tenant_budget VALUES(1,10000,0),(2,10000,0);
INSERT INTO probe.purpose_budget VALUES(1,'newsletter',10000,0),(1,'profile',10000,0),(2,'newsletter',10000,0);
COMMIT;
