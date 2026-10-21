BEGIN;
-- Synthetic D8 mechanism fixture, not a Core migration, schema or P12 implementation.
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_b LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_inactive LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_tenant_two LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE gate_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA probe TO command_executor,missionary_a,coach_a,coach_b,coach_inactive,coach_tenant_two,gate_manager;
CREATE FUNCTION probe.session_tenant() RETURNS integer LANGUAGE sql STABLE
SET search_path=pg_catalog AS $$ SELECT CASE session_user WHEN 'coach_tenant_two' THEN 2 WHEN 'missionary_a' THEN 1 WHEN 'coach_a' THEN 1 WHEN 'coach_b' THEN 1 WHEN 'coach_inactive' THEN 1 WHEN 'gate_manager' THEN 1 ELSE -1 END $$;
REVOKE ALL ON FUNCTION probe.session_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.session_tenant() TO command_executor,missionary_a,coach_a,coach_b,coach_inactive,coach_tenant_two,gate_manager;
SET ROLE fixture_owner;
CREATE TABLE probe.gates(tenant int PRIMARY KEY,allowed boolean NOT NULL,revision int NOT NULL);
CREATE TABLE probe.memberships(tenant int NOT NULL,principal text NOT NULL,active boolean NOT NULL,PRIMARY KEY(tenant,principal));
CREATE TABLE probe.subjects(tenant int NOT NULL,id int NOT NULL,missionary text NOT NULL,source_revision int NOT NULL,PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,missionary) REFERENCES probe.memberships);
CREATE TABLE probe.invitations(tenant int NOT NULL,id int NOT NULL,subject int NOT NULL,coach text NOT NULL,inviter text NOT NULL,modules text[] NOT NULL CHECK(cardinality(modules)>0 AND modules<@ARRAY['goals','tasks']::text[]),state text NOT NULL CHECK(state IN('pending','accepted','revoked')),revision int NOT NULL,gate_revision int NOT NULL,expires_at timestamptz NOT NULL,PRIMARY KEY(tenant,id),UNIQUE(tenant,id,subject,coach),FOREIGN KEY(tenant,subject) REFERENCES probe.subjects,FOREIGN KEY(tenant,coach) REFERENCES probe.memberships,FOREIGN KEY(tenant,inviter) REFERENCES probe.memberships);
CREATE TABLE probe.grants(tenant int NOT NULL,invitation int NOT NULL,subject int NOT NULL,coach text NOT NULL,modules text[] NOT NULL,active boolean NOT NULL,PRIMARY KEY(tenant,invitation),FOREIGN KEY(tenant,invitation,subject,coach) REFERENCES probe.invitations(tenant,id,subject,coach));
CREATE TABLE probe.audit(tenant int NOT NULL,invitation int NOT NULL,event text NOT NULL CHECK(event IN('accepted','revoked')),actor text NOT NULL,PRIMARY KEY(tenant,invitation,event),FOREIGN KEY(tenant,invitation) REFERENCES probe.invitations,CHECK(invitation<>90));
-- Already minimized synthetic source projection, not raw donor/finance records.
CREATE TABLE probe.projection_rows(tenant int NOT NULL,subject int NOT NULL,module text NOT NULL,id int NOT NULL,value int NOT NULL,source_revision int NOT NULL,PRIMARY KEY(tenant,subject,module,id),FOREIGN KEY(tenant,subject) REFERENCES probe.subjects);
CREATE TABLE probe.private_records(tenant int NOT NULL,subject int NOT NULL,private_note text NOT NULL,PRIMARY KEY(tenant,subject),FOREIGN KEY(tenant,subject) REFERENCES probe.subjects);
CREATE VIEW probe.invoker_summary WITH(security_invoker=true) AS SELECT tenant,subject,module,count(*) AS n,sum(value) AS total FROM probe.projection_rows GROUP BY tenant,subject,module;
RESET ROLE;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['gates','memberships','subjects','invitations','grants','audit','projection_rows','private_records'] LOOP
 EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY coarse_tenant ON probe.%I TO command_executor USING(tenant=probe.session_tenant())',t);
END LOOP; END $$;
GRANT SELECT ON probe.gates,probe.memberships,probe.subjects,probe.invitations,probe.grants,probe.audit,probe.projection_rows TO command_executor;
GRANT INSERT ON probe.invitations,probe.grants,probe.audit TO command_executor;
GRANT UPDATE(state,revision) ON probe.invitations TO command_executor;
GRANT UPDATE(active) ON probe.grants TO command_executor;
-- Locking reads require UPDATE privilege on at least one column. No coach receives it.
GRANT UPDATE(allowed) ON probe.gates TO command_executor;
GRANT UPDATE(active) ON probe.memberships TO command_executor;
GRANT UPDATE(source_revision) ON probe.subjects TO command_executor;
GRANT SELECT,UPDATE ON probe.gates,probe.memberships,probe.subjects TO gate_manager;
CREATE POLICY manager_gate ON probe.gates TO gate_manager USING(tenant=probe.session_tenant());
CREATE POLICY manager_membership ON probe.memberships TO gate_manager USING(tenant=probe.session_tenant());
CREATE POLICY manager_subject ON probe.subjects TO gate_manager USING(tenant=probe.session_tenant());
GRANT SELECT ON probe.invoker_summary TO coach_a;

CREATE FUNCTION probe.invite(p_tenant int,p_id int,p_subject int,p_coach text,p_modules text[]) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE gate probe.gates%ROWTYPE; prior probe.invitations%ROWTYPE; normalized text[];
BEGIN
 IF p_tenant<>probe.session_tenant() OR session_user<>'missionary_a' THEN RETURN 'unavailable'; END IF;
 SELECT * INTO gate FROM probe.gates WHERE tenant=p_tenant FOR SHARE;
 IF NOT FOUND OR NOT gate.allowed THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.memberships WHERE tenant=p_tenant AND principal=session_user AND active FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.subjects WHERE tenant=p_tenant AND id=p_subject AND missionary=session_user FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.memberships WHERE tenant=p_tenant AND principal=p_coach AND active FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT array_agg(DISTINCT x ORDER BY x) INTO normalized FROM unnest(p_modules)x;
 SELECT * INTO prior FROM probe.invitations WHERE tenant=p_tenant AND id=p_id FOR UPDATE;
 IF FOUND THEN
  IF (prior.subject,prior.coach,prior.modules) IS DISTINCT FROM (p_subject,p_coach,normalized) THEN RETURN 'conflict'; END IF;
  RETURN 'existing:'||prior.state;
 END IF;
 INSERT INTO probe.invitations VALUES(p_tenant,p_id,p_subject,p_coach,session_user,normalized,'pending',1,gate.revision,'2100-01-01Z');
 RETURN 'pending:'||p_id;
END $$;

CREATE FUNCTION probe.accept(p_tenant int,p_id int) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE gate probe.gates%ROWTYPE; inv probe.invitations%ROWTYPE;
BEGIN
 IF p_tenant<>probe.session_tenant() OR session_user NOT IN('coach_a','coach_b','coach_inactive','coach_tenant_two') THEN RETURN 'unavailable'; END IF;
 SELECT * INTO gate FROM probe.gates WHERE tenant=p_tenant FOR SHARE;
 IF NOT FOUND OR NOT gate.allowed THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.memberships WHERE tenant=p_tenant AND principal=session_user AND active FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO inv FROM probe.invitations WHERE tenant=p_tenant AND id=p_id AND coach=session_user FOR UPDATE;
 IF NOT FOUND OR inv.state='revoked' THEN RETURN 'unavailable'; END IF;
 IF inv.state='accepted' THEN RETURN 'accepted_history:'||p_id; END IF;
 IF inv.gate_revision<>gate.revision OR inv.expires_at<=statement_timestamp() THEN RETURN 'unavailable'; END IF;
 UPDATE probe.invitations SET state='accepted',revision=revision+1 WHERE tenant=p_tenant AND id=p_id;
 INSERT INTO probe.grants VALUES(p_tenant,p_id,inv.subject,inv.coach,inv.modules,true);
 INSERT INTO probe.audit VALUES(p_tenant,p_id,'accepted',session_user);
 RETURN 'accepted:'||p_id;
END $$;

CREATE FUNCTION probe.revoke(p_tenant int,p_id int) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE inv probe.invitations%ROWTYPE;
BEGIN
 IF p_tenant<>probe.session_tenant() OR session_user<>'missionary_a' THEN RETURN 'unavailable'; END IF;
 -- Narrowing remains possible even when the widening gate is off.
 PERFORM 1 FROM probe.gates WHERE tenant=p_tenant FOR SHARE;
 PERFORM 1 FROM probe.memberships WHERE tenant=p_tenant AND principal=session_user AND active FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO inv FROM probe.invitations WHERE tenant=p_tenant AND id=p_id AND inviter=session_user FOR UPDATE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 IF inv.state='revoked' THEN RETURN 'revoked_history:'||p_id; END IF;
 UPDATE probe.invitations SET state='revoked',revision=revision+1 WHERE tenant=p_tenant AND id=p_id;
 UPDATE probe.grants SET active=false WHERE tenant=p_tenant AND invitation=p_id;
 INSERT INTO probe.audit VALUES(p_tenant,p_id,'revoked',session_user);
 RETURN 'revoked:'||p_id;
END $$;

CREATE FUNCTION probe.summary(p_tenant int,p_subject int,p_module text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE current_revision int; selected_invitation int; result text;
BEGIN
 IF p_tenant<>probe.session_tenant() THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=p_tenant AND allowed FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 PERFORM 1 FROM probe.memberships WHERE tenant=p_tenant AND principal=session_user AND active FOR SHARE;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT i.id INTO selected_invitation FROM probe.invitations i JOIN probe.grants g ON (g.tenant,g.invitation,g.subject,g.coach)=(i.tenant,i.id,i.subject,i.coach)
 WHERE i.tenant=p_tenant AND i.subject=p_subject AND i.coach=session_user AND i.state='accepted' AND g.active AND p_module=ANY(g.modules)
 ORDER BY i.id LIMIT 1 FOR SHARE OF i,g;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT source_revision INTO current_revision FROM probe.subjects WHERE tenant=p_tenant AND id=p_subject FOR SHARE;
 IF NOT FOUND OR EXISTS(SELECT 1 FROM probe.projection_rows WHERE tenant=p_tenant AND subject=p_subject AND module=p_module AND source_revision<>current_revision) THEN RETURN 'unavailable'; END IF;
 SELECT count(*)||':'||COALESCE(sum(value),0) INTO result FROM probe.projection_rows WHERE tenant=p_tenant AND subject=p_subject AND module=p_module AND source_revision=current_revision;
 RETURN result;
END $$;

-- Intentionally unsafe, only for falsification: tenant-wide aggregate before fine access.
CREATE FUNCTION probe.unsafe_aggregate(p_subject int,p_module text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE result text;
BEGIN
 SELECT count(*)||':'||COALESCE(sum(value),0) INTO result FROM probe.projection_rows WHERE tenant=probe.session_tenant() AND module=p_module;
 IF probe.summary(probe.session_tenant(),p_subject,p_module)='unavailable' THEN RETURN 'unavailable'; END IF;
 RETURN result;
END $$;
-- An unverified synthetic claim stands in for old cached entitlement, not a real JWT.
CREATE FUNCTION probe.unsafe_claim_summary(p_subject int,p_module text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
BEGIN
 IF current_setting('probe.old_claim',true)<>'true' THEN RETURN 'unavailable'; END IF;
 RETURN (SELECT count(*)||':'||COALESCE(sum(value),0) FROM probe.projection_rows WHERE tenant=probe.session_tenant() AND subject=p_subject AND module=p_module);
END $$;
ALTER FUNCTION probe.invite(int,int,int,text,text[]) OWNER TO command_executor;
ALTER FUNCTION probe.accept(int,int) OWNER TO command_executor;
ALTER FUNCTION probe.revoke(int,int) OWNER TO command_executor;
ALTER FUNCTION probe.summary(int,int,text) OWNER TO command_executor;
ALTER FUNCTION probe.unsafe_aggregate(int,text) OWNER TO command_executor;
ALTER FUNCTION probe.unsafe_claim_summary(int,text) OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.invite(int,int,int,text,text[]),probe.revoke(int,int) TO missionary_a;
GRANT EXECUTE ON FUNCTION probe.accept(int,int),probe.summary(int,int,text) TO coach_a,coach_b,coach_inactive,coach_tenant_two;
GRANT EXECUTE ON FUNCTION probe.unsafe_aggregate(int,text),probe.unsafe_claim_summary(int,text) TO coach_a;
-- Nested call performed as command_executor; function owner has its own EXECUTE rights.
INSERT INTO probe.gates VALUES(1,true,1),(2,true,1);
INSERT INTO probe.memberships VALUES(1,'missionary_a',true),(1,'coach_a',true),(1,'coach_b',true),(1,'coach_inactive',false),(2,'missionary_two',true),(2,'coach_tenant_two',true);
INSERT INTO probe.subjects VALUES(1,10,'missionary_a',1),(1,20,'missionary_a',1),(2,30,'missionary_two',1);
INSERT INTO probe.projection_rows VALUES(1,10,'goals',1,10,1),(1,10,'goals',2,20,1),(1,10,'tasks',1,7,1),(1,20,'goals',1,900,1),(2,30,'goals',1,9999,1);
INSERT INTO probe.private_records VALUES(1,10,'synthetic private care note'),(1,20,'synthetic private financial detail'),(2,30,'other tenant synthetic private note');
INSERT INTO probe.invitations SELECT 1,n,10,'coach_a','missionary_a',ARRAY['goals'],'pending',1,1,'2100-01-01Z' FROM unnest(ARRAY[1,4,5,6,9,90])n;
INSERT INTO probe.invitations VALUES(1,2,10,'coach_b','missionary_a',ARRAY['tasks'],'pending',1,1,'2100-01-01Z'),(1,3,20,'coach_a','missionary_a',ARRAY['goals'],'pending',1,1,'2100-01-01Z'),(1,10,10,'coach_inactive','missionary_a',ARRAY['goals'],'pending',1,1,'2100-01-01Z'),(2,1,30,'coach_tenant_two','missionary_two',ARRAY['goals'],'pending',1,1,'2100-01-01Z');
UPDATE probe.invitations SET expires_at='2000-01-01Z' WHERE tenant=1 AND id=9;

COMMIT;
