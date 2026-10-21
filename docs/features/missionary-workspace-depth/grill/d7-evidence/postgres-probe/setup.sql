-- Synthetic mechanics only. Not a Core migration or selected production schema.
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE actor_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE actor_other LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE actor_tenant_two LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE dispatch_worker LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE authority_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE mutation_probe LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA probe TO command_executor,actor_a,actor_other,actor_tenant_two,dispatch_worker,authority_manager,mutation_probe;
CREATE FUNCTION probe.session_tenant() RETURNS integer LANGUAGE sql STABLE
SET search_path=pg_catalog AS $$ SELECT CASE session_user WHEN 'actor_tenant_two' THEN 2 WHEN 'actor_a' THEN 1 WHEN 'actor_other' THEN 1 WHEN 'dispatch_worker' THEN 1 WHEN 'authority_manager' THEN 1 WHEN 'mutation_probe' THEN 1 ELSE -1 END $$;
REVOKE ALL ON FUNCTION probe.session_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.session_tenant() TO command_executor,actor_a,actor_other,actor_tenant_two,dispatch_worker,authority_manager,mutation_probe;
SET ROLE fixture_owner;
CREATE TABLE probe.authority(tenant int NOT NULL,actor text NOT NULL,active boolean NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,actor));
CREATE TABLE probe.issues(tenant int NOT NULL,id int NOT NULL,actor text NOT NULL,content_revision int NOT NULL,audience_revision int NOT NULL,state text NOT NULL CHECK(state IN('draft','released','canceled')),PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,actor) REFERENCES probe.authority);
CREATE TABLE probe.revisions(tenant int NOT NULL,issue int NOT NULL,content_revision int NOT NULL,audience_revision int NOT NULL,content_digest text NOT NULL,audience_digest text NOT NULL,PRIMARY KEY(tenant,issue,content_revision,audience_revision),FOREIGN KEY(tenant,issue) REFERENCES probe.issues);
CREATE TABLE probe.recipients(tenant int NOT NULL,id int NOT NULL,revision int NOT NULL,eligible boolean NOT NULL,PRIMARY KEY(tenant,id));
CREATE TABLE probe.audience(tenant int NOT NULL,issue int NOT NULL,audience_revision int NOT NULL,member int NOT NULL,contact_revision int NOT NULL,PRIMARY KEY(tenant,issue,audience_revision,member),FOREIGN KEY(tenant,issue) REFERENCES probe.issues,FOREIGN KEY(tenant,member) REFERENCES probe.recipients);
CREATE TABLE probe.releases(tenant int NOT NULL,issue int NOT NULL,actor text NOT NULL,content_revision int NOT NULL,audience_revision int NOT NULL,authority_epoch int NOT NULL,PRIMARY KEY(tenant,issue),FOREIGN KEY(tenant,issue,content_revision,audience_revision) REFERENCES probe.revisions,FOREIGN KEY(tenant,actor) REFERENCES probe.authority);
CREATE TABLE probe.audit(tenant int NOT NULL,issue int NOT NULL,kind text NOT NULL,PRIMARY KEY(tenant,issue,kind),FOREIGN KEY(tenant,issue) REFERENCES probe.releases);
CREATE TABLE probe.effects(tenant int NOT NULL,issue int NOT NULL,member int NOT NULL,contact_revision int NOT NULL,effect_key text NOT NULL,state text NOT NULL CHECK(state IN('pending','admitted_unknown','accepted','canceled','blocked')),PRIMARY KEY(tenant,issue,member),UNIQUE(tenant,effect_key),FOREIGN KEY(tenant,issue) REFERENCES probe.releases,FOREIGN KEY(tenant,member) REFERENCES probe.recipients,CHECK(issue<>90));
CREATE TABLE probe.operations(tenant int NOT NULL,actor text NOT NULL,request_key text NOT NULL,issue int NOT NULL,content_revision int NOT NULL,audience_revision int NOT NULL,PRIMARY KEY(tenant,actor,request_key),FOREIGN KEY(tenant,issue) REFERENCES probe.releases);
CREATE TABLE probe.raw_mutation_probe(tenant int NOT NULL,id int NOT NULL,actor text NOT NULL,value text NOT NULL,PRIMARY KEY(tenant,id));
RESET ROLE;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['authority','issues','revisions','recipients','audience','releases','audit','effects','operations'] LOOP EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('CREATE POLICY tenant_scope ON probe.%I TO command_executor USING(tenant=probe.session_tenant()) WITH CHECK(tenant=probe.session_tenant())',t); END LOOP; END $$;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA probe TO command_executor;
-- Immutable approved records cannot be rewritten by the command executor.
REVOKE UPDATE ON probe.releases,probe.revisions,probe.audit,probe.operations,probe.audience FROM command_executor;
GRANT SELECT,UPDATE ON probe.authority,probe.recipients TO authority_manager;
CREATE POLICY manager_authority ON probe.authority TO authority_manager USING(tenant=probe.session_tenant()) WITH CHECK(tenant=probe.session_tenant());
CREATE POLICY manager_recipient ON probe.recipients TO authority_manager USING(tenant=probe.session_tenant()) WITH CHECK(tenant=probe.session_tenant());
ALTER TABLE probe.raw_mutation_probe ENABLE ROW LEVEL SECURITY;
GRANT SELECT,UPDATE ON probe.raw_mutation_probe TO mutation_probe;
-- Deliberately omitted WITH CHECK: PostgreSQL reuses USING for new rows.
CREATE POLICY implicit_new_row_check ON probe.raw_mutation_probe TO mutation_probe USING(tenant=probe.session_tenant() AND actor=session_user);

CREATE FUNCTION probe.authorize(p_tenant int,p_actor text,p_issue int,p_content int,p_audience int,p_request text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE a probe.authority%ROWTYPE; i probe.issues%ROWTYPE; r probe.releases%ROWTYPE; op probe.operations%ROWTYPE;
BEGIN
 IF p_tenant<>probe.session_tenant() OR p_actor<>session_user OR session_user NOT IN('actor_a','actor_other','actor_tenant_two') THEN RETURN 'unavailable'; END IF;
 SELECT * INTO a FROM probe.authority WHERE tenant=p_tenant AND actor=p_actor FOR UPDATE;
 IF NOT FOUND OR NOT a.active THEN RETURN 'unavailable'; END IF;
 SELECT * INTO i FROM probe.issues WHERE tenant=p_tenant AND id=p_issue AND actor=p_actor FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO op FROM probe.operations WHERE tenant=p_tenant AND actor=p_actor AND request_key=p_request;
 IF FOUND AND (op.issue,op.content_revision,op.audience_revision) IS DISTINCT FROM (p_issue,p_content,p_audience) THEN RETURN 'operation_conflict'; END IF;
 SELECT * INTO r FROM probe.releases WHERE tenant=p_tenant AND issue=p_issue;
 IF FOUND THEN
   IF (r.actor,r.content_revision,r.audience_revision) IS DISTINCT FROM (p_actor,p_content,p_audience) THEN RETURN 'release_conflict'; END IF;
   INSERT INTO probe.operations VALUES(p_tenant,p_actor,p_request,p_issue,p_content,p_audience) ON CONFLICT DO NOTHING;
   RETURN 'accepted_history:'||p_issue;
 END IF;
 IF i.state<>'draft' OR i.content_revision<>p_content OR i.audience_revision<>p_audience THEN RETURN 'stale_approval'; END IF;
 INSERT INTO probe.releases VALUES(p_tenant,p_issue,p_actor,p_content,p_audience,a.revision);
 UPDATE probe.issues SET state='released' WHERE tenant=p_tenant AND id=p_issue;
 INSERT INTO probe.audit VALUES(p_tenant,p_issue,'authorized');
 INSERT INTO probe.effects SELECT tenant,issue,member,contact_revision,tenant||':newsletter:'||issue||':'||member,'pending' FROM probe.audience WHERE tenant=p_tenant AND issue=p_issue AND audience_revision=p_audience;
 INSERT INTO probe.operations VALUES(p_tenant,p_actor,p_request,p_issue,p_content,p_audience);
 RETURN 'accepted:'||p_issue;
END $$;
CREATE FUNCTION probe.cancel(p_tenant int,p_issue int) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE i probe.issues%ROWTYPE; n int; admitted int;
BEGIN
 IF p_tenant<>probe.session_tenant() OR session_user NOT IN('actor_a','actor_other','actor_tenant_two') THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.authority WHERE tenant=p_tenant AND actor=session_user AND active FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO i FROM probe.issues WHERE tenant=p_tenant AND id=p_issue AND actor=session_user FOR UPDATE;
 IF NOT FOUND OR i.state='draft' THEN RETURN 'unavailable'; END IF;
 UPDATE probe.issues SET state='canceled' WHERE tenant=p_tenant AND id=p_issue;
 UPDATE probe.effects SET state='canceled' WHERE tenant=p_tenant AND issue=p_issue AND state='pending'; GET DIAGNOSTICS n=ROW_COUNT;
 SELECT count(*) INTO admitted FROM probe.effects WHERE tenant=p_tenant AND issue=p_issue AND state IN('admitted_unknown','accepted');
 RETURN 'canceled_remaining:'||n||';not_recalled:'||admitted;
END $$;
CREATE FUNCTION probe.dispatch(p_tenant int,p_issue int,p_member int) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE i probe.issues%ROWTYPE; a probe.authority%ROWTYPE; r probe.releases%ROWTYPE; m probe.recipients%ROWTYPE; e probe.effects%ROWTYPE;
BEGIN
 IF session_user<>'dispatch_worker' OR p_tenant<>probe.session_tenant() THEN RETURN 'unavailable'; END IF;
 SELECT * INTO i FROM probe.issues WHERE tenant=p_tenant AND id=p_issue;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO a FROM probe.authority WHERE tenant=p_tenant AND actor=i.actor FOR UPDATE;
 SELECT * INTO i FROM probe.issues WHERE tenant=p_tenant AND id=p_issue FOR UPDATE;
 SELECT * INTO r FROM probe.releases WHERE tenant=p_tenant AND issue=p_issue;
 SELECT * INTO m FROM probe.recipients WHERE tenant=p_tenant AND id=p_member FOR UPDATE;
 SELECT * INTO e FROM probe.effects WHERE tenant=p_tenant AND issue=p_issue AND member=p_member FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 IF e.state<>'pending' THEN RETURN e.state||':'||e.effect_key; END IF;
 IF i.state<>'released' OR NOT a.active OR a.revision<>r.authority_epoch OR NOT m.eligible OR m.revision<>e.contact_revision THEN
   UPDATE probe.effects SET state='blocked' WHERE tenant=p_tenant AND issue=p_issue AND member=p_member;
   RETURN 'blocked:'||e.effect_key;
 END IF;
 UPDATE probe.effects SET state='admitted_unknown' WHERE tenant=p_tenant AND issue=p_issue AND member=p_member;
 RETURN 'admitted_unknown:'||e.effect_key;
END $$;
CREATE FUNCTION probe.provider_result(p_tenant int,p_issue int,p_member int,p_key text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE e probe.effects%ROWTYPE;
BEGIN
 IF session_user<>'dispatch_worker' OR p_tenant<>probe.session_tenant() THEN RETURN 'unavailable'; END IF;
 SELECT * INTO e FROM probe.effects WHERE tenant=p_tenant AND issue=p_issue AND member=p_member FOR UPDATE;
 IF NOT FOUND OR e.effect_key<>p_key THEN RETURN 'unavailable'; END IF;
 IF e.state='admitted_unknown' THEN UPDATE probe.effects SET state='accepted' WHERE tenant=p_tenant AND issue=p_issue AND member=p_member; RETURN 'accepted'; END IF;
 RETURN e.state;
END $$;
ALTER FUNCTION probe.authorize(int,text,int,int,int,text) OWNER TO command_executor;
ALTER FUNCTION probe.cancel(int,int) OWNER TO command_executor;
ALTER FUNCTION probe.dispatch(int,int,int) OWNER TO command_executor;
ALTER FUNCTION probe.provider_result(int,int,int,text) OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.authorize(int,text,int,int,int,text),probe.cancel(int,int) TO actor_a,actor_other,actor_tenant_two;
GRANT EXECUTE ON FUNCTION probe.dispatch(int,int,int),probe.provider_result(int,int,int,text) TO dispatch_worker;
INSERT INTO probe.authority VALUES(1,'actor_a',true,1),(1,'actor_other',true,1),(2,'actor_tenant_two',true,1);
INSERT INTO probe.issues SELECT 1,n,'actor_a',1,1,'draft' FROM generate_series(1,20)n;
INSERT INTO probe.issues VALUES(1,90,'actor_a',1,1,'draft'),(1,21,'actor_other',1,1,'draft'),(2,1,'actor_tenant_two',1,1,'draft');
INSERT INTO probe.revisions SELECT tenant,id,1,1,'content-one','audience-one' FROM probe.issues;
INSERT INTO probe.recipients VALUES(1,1,1,true),(1,2,1,true),(2,1,1,true);
INSERT INTO probe.audience SELECT tenant,id,1,1,1 FROM probe.issues;
INSERT INTO probe.audience SELECT tenant,id,1,2,1 FROM probe.issues WHERE tenant=1;
INSERT INTO probe.raw_mutation_probe VALUES(1,1,'mutation_probe','original'),(1,2,'actor_other','hidden'),(2,3,'mutation_probe','other-tenant');
