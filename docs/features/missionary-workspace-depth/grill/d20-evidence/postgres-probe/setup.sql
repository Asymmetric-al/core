-- D20 synthetic mechanism fixture. Not a migration or financial/P12 implementation.
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
CREATE FUNCTION probe.tenant() RETURNS integer LANGUAGE sql STABLE AS $$
 SELECT CASE WHEN session_user='other_tenant' THEN 2 WHEN session_user IN('missionary_a','missionary_b','source_worker','source_manager','policy_manager') THEN 1 ELSE -1 END
$$;
SET ROLE fixture_owner;
CREATE TABLE probe.scopes(tenant int NOT NULL,id int NOT NULL,assignee text NOT NULL,lock_version int NOT NULL DEFAULT 1,PRIMARY KEY(tenant,id));
CREATE TABLE probe.gates(tenant int NOT NULL,scope int NOT NULL,actor text NOT NULL,allowed bool NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,scope,actor),FOREIGN KEY(tenant,scope) REFERENCES probe.scopes);
CREATE TABLE probe.gift_versions(tenant int NOT NULL,gift int NOT NULL,scope int NOT NULL,revision int NOT NULL,eligible bool NOT NULL,origin text NOT NULL CHECK(origin IN('live','history')),PRIMARY KEY(tenant,gift,scope,revision),FOREIGN KEY(tenant,scope) REFERENCES probe.scopes);
CREATE TABLE probe.gift_heads(tenant int NOT NULL,gift int NOT NULL,scope int NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,gift,scope),FOREIGN KEY(tenant,gift,scope,revision) REFERENCES probe.gift_versions);
CREATE TABLE probe.groups(tenant int NOT NULL,id bigint GENERATED ALWAYS AS IDENTITY,scope int NOT NULL,assignee text NOT NULL,state text NOT NULL CHECK(state IN('open','done')),authority_revision int NOT NULL DEFAULT 1,revision int NOT NULL DEFAULT 1,PRIMARY KEY(tenant,id),UNIQUE(tenant,id,scope),FOREIGN KEY(tenant,scope) REFERENCES probe.scopes);
CREATE UNIQUE INDEX one_open_compatible_group ON probe.groups(tenant,scope) WHERE state='open';
CREATE TABLE probe.coverage(tenant int NOT NULL,gift int NOT NULL,scope int NOT NULL,purpose text NOT NULL DEFAULT 'special_followup' CHECK(purpose='special_followup'),group_id bigint NOT NULL,state text NOT NULL CHECK(state IN('open','done','not_needed')),PRIMARY KEY(tenant,gift,scope,purpose),FOREIGN KEY(tenant,gift,scope) REFERENCES probe.gift_heads,FOREIGN KEY(tenant,group_id,scope) REFERENCES probe.groups(tenant,id,scope));
CREATE TABLE probe.reviews(tenant int NOT NULL,id bigint GENERATED ALWAYS AS IDENTITY,group_id bigint NOT NULL,scope int NOT NULL,actor text NOT NULL,authority_revision int NOT NULL,request_key text NOT NULL,selection int[] NOT NULL CHECK(cardinality(selection)>0),PRIMARY KEY(tenant,id),UNIQUE(tenant,id,scope),UNIQUE(tenant,actor,request_key),FOREIGN KEY(tenant,group_id,scope) REFERENCES probe.groups(tenant,id,scope));
CREATE TABLE probe.review_items(tenant int NOT NULL,review_id bigint NOT NULL,scope int NOT NULL,gift int NOT NULL,gift_revision int NOT NULL,PRIMARY KEY(tenant,review_id,gift),FOREIGN KEY(tenant,review_id,scope) REFERENCES probe.reviews(tenant,id,scope),FOREIGN KEY(tenant,gift,scope,gift_revision) REFERENCES probe.gift_versions);
CREATE TABLE probe.receipts(tenant int NOT NULL,review_id bigint NOT NULL,kind text NOT NULL CHECK(kind IN('done','not_needed')),actor text NOT NULL,request_key text NOT NULL,PRIMARY KEY(tenant,review_id),UNIQUE(tenant,actor,request_key),FOREIGN KEY(tenant,review_id) REFERENCES probe.reviews);
CREATE TABLE probe.audit(tenant int NOT NULL,id bigint GENERATED ALWAYS AS IDENTITY,group_id bigint NOT NULL,kind text NOT NULL,note text NOT NULL CHECK(note<>'FAIL_AUDIT'),PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,group_id) REFERENCES probe.groups);
CREATE TABLE probe.effect_sentinel(tenant int NOT NULL,id int NOT NULL,kind text NOT NULL CHECK(kind IN('interaction','send','gift','enrollment')),PRIMARY KEY(tenant,id));
RESET ROLE;
DO $$DECLARE t record;BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='probe' LOOP EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t.tablename);EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t.tablename);EXECUTE format('CREATE POLICY tenant_backstop ON probe.%I TO command_executor USING(tenant=probe.tenant())',t.tablename);END LOOP;END$$;
CREATE POLICY policy_editor ON probe.gates TO policy_manager USING(tenant=probe.tenant());
GRANT SELECT,UPDATE ON probe.gates TO policy_manager;
GRANT SELECT ON probe.scopes,probe.gates,probe.gift_versions,probe.gift_heads,probe.groups,probe.coverage,probe.reviews,probe.review_items,probe.receipts,probe.audit TO command_executor;
GRANT INSERT ON probe.gift_versions,probe.groups,probe.coverage,probe.reviews,probe.review_items,probe.receipts,probe.audit TO command_executor;
GRANT UPDATE(lock_version) ON probe.scopes TO command_executor;
GRANT UPDATE(revision) ON probe.gates,probe.gift_heads TO command_executor;
GRANT UPDATE(state,assignee,authority_revision,revision) ON probe.groups TO command_executor;
GRANT UPDATE(state) ON probe.coverage TO command_executor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA probe TO command_executor;
CREATE FUNCTION probe.immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'immutable evidence' USING ERRCODE='55000';END$$;
CREATE TRIGGER immutable_versions BEFORE UPDATE OR DELETE ON probe.gift_versions FOR EACH ROW EXECUTE FUNCTION probe.immutable();
CREATE TRIGGER immutable_reviews BEFORE UPDATE OR DELETE ON probe.reviews FOR EACH ROW EXECUTE FUNCTION probe.immutable();
CREATE TRIGGER immutable_items BEFORE UPDATE OR DELETE ON probe.review_items FOR EACH ROW EXECUTE FUNCTION probe.immutable();
CREATE TRIGGER immutable_receipts BEFORE UPDATE OR DELETE ON probe.receipts FOR EACH ROW EXECUTE FUNCTION probe.immutable();
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON probe.audit FOR EACH ROW EXECUTE FUNCTION probe.immutable();
CREATE FUNCTION probe.identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF TG_TABLE_NAME='groups' THEN IF ROW(NEW.tenant,NEW.id,NEW.scope) IS DISTINCT FROM ROW(OLD.tenant,OLD.id,OLD.scope) THEN RAISE EXCEPTION 'immutable group identity' USING ERRCODE='55000';END IF; ELSE IF ROW(NEW.tenant,NEW.gift,NEW.scope,NEW.purpose,NEW.group_id) IS DISTINCT FROM ROW(OLD.tenant,OLD.gift,OLD.scope,OLD.purpose,OLD.group_id) THEN RAISE EXCEPTION 'immutable member identity' USING ERRCODE='55000';END IF;END IF;RETURN NEW;END$$;
CREATE TRIGGER immutable_group BEFORE UPDATE ON probe.groups FOR EACH ROW EXECUTE FUNCTION probe.identity_guard();
CREATE TRIGGER immutable_member BEFORE UPDATE ON probe.coverage FOR EACH ROW EXECUTE FUNCTION probe.identity_guard();

CREATE FUNCTION probe.admit(s int,g int,k text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();v probe.gift_versions%ROWTYPE;b probe.groups%ROWTYPE;dest text;prior bigint;
BEGIN
 IF session_user<>'source_worker' OR s IS NULL OR g IS NULL OR k IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=s AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT assignee INTO dest FROM probe.scopes WHERE tenant=t AND id=s FOR UPDATE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT v0.* INTO v FROM probe.gift_heads h JOIN probe.gift_versions v0 USING(tenant,gift,scope,revision) WHERE h.tenant=t AND h.scope=s AND h.gift=g;
 IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT group_id INTO prior FROM probe.coverage WHERE tenant=t AND scope=s AND gift=g AND purpose='special_followup';IF FOUND THEN RETURN 'covered:'||prior;END IF;
 IF v.origin<>'live' THEN RETURN 'history_only';END IF;IF NOT v.eligible THEN RETURN 'not_qualified';END IF;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND scope=s AND state='open';
 IF NOT FOUND THEN
  PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=s AND actor=dest AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'needs_assignment';END IF;
  INSERT INTO probe.groups(tenant,scope,assignee,state) VALUES(t,s,dest,'open') RETURNING * INTO b;
 END IF;
 INSERT INTO probe.coverage(tenant,gift,scope,group_id,state) VALUES(t,g,s,b.id,'open');
 INSERT INTO probe.audit(tenant,group_id,kind,note) VALUES(t,b.id,'admitted',CASE WHEN k='FAIL_AUDIT' THEN k ELSE 'identifier-only' END);
 RETURN 'admitted:'||b.id;
END$$;

CREATE FUNCTION probe.review_group(n bigint,ids int[],k text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();b probe.groups%ROWTYPE;normal int[];r probe.reviews%ROWTYPE;cnt int;
BEGIN
 IF n IS NULL OR ids IS NULL OR k IS NULL OR array_position(ids,NULL) IS NOT NULL THEN RETURN 'conflict';END IF;
 SELECT array_agg(DISTINCT x ORDER BY x) INTO normal FROM unnest(ids)x;IF cardinality(normal) IS NULL THEN RETURN 'conflict';END IF;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=b.scope AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.scopes WHERE tenant=t AND id=b.scope FOR UPDATE;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF b.assignee<>session_user THEN RETURN 'unavailable';END IF;
 SELECT * INTO r FROM probe.reviews WHERE tenant=t AND actor=session_user AND request_key=k;
 IF FOUND THEN IF r.group_id=n AND r.selection=normal THEN RETURN 'review:'||r.id;ELSE RETURN 'conflict';END IF;END IF;
 IF b.state<>'open' THEN RETURN 'conflict';END IF;
 SELECT count(*) INTO cnt FROM probe.coverage c JOIN probe.gift_heads h USING(tenant,gift,scope) JOIN probe.gift_versions v USING(tenant,gift,scope,revision) WHERE c.tenant=t AND c.group_id=n AND c.state='open' AND c.gift=ANY(normal) AND v.eligible AND v.origin='live';
 IF cnt<>cardinality(normal) THEN RETURN 'conflict';END IF;
 INSERT INTO probe.reviews(tenant,group_id,scope,actor,authority_revision,request_key,selection) VALUES(t,n,b.scope,session_user,b.authority_revision,k,normal) RETURNING * INTO r;
 INSERT INTO probe.review_items SELECT t,r.id,b.scope,h.gift,h.revision FROM probe.gift_heads h WHERE h.tenant=t AND h.scope=b.scope AND h.gift=ANY(normal);
 RETURN 'review:'||r.id;
END$$;

CREATE FUNCTION probe.finish(rid bigint,disposition text,k text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();r probe.reviews%ROWTYPE;b probe.groups%ROWTYPE;old probe.receipts%ROWTYPE;cnt int;
BEGIN
 IF rid IS NULL OR disposition IS NULL OR disposition NOT IN('done','not_needed') OR k IS NULL THEN RETURN 'conflict';END IF;
 SELECT * INTO r FROM probe.reviews WHERE tenant=t AND id=rid;IF NOT FOUND OR r.actor<>session_user THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=r.scope AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.scopes WHERE tenant=t AND id=r.scope FOR UPDATE;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=r.group_id;IF b.assignee<>session_user THEN RETURN 'unavailable';END IF;
 SELECT * INTO old FROM probe.receipts WHERE tenant=t AND actor=session_user AND request_key=k;
 IF FOUND AND old.review_id<>rid THEN RETURN 'conflict';END IF;
 SELECT * INTO old FROM probe.receipts WHERE tenant=t AND review_id=rid;
 IF FOUND THEN IF old.kind=disposition THEN RETURN 'receipt:'||old.kind;ELSE RETURN 'conflict';END IF;END IF;
 IF b.state<>'open' OR b.authority_revision<>r.authority_revision THEN RETURN 'conflict';END IF;
 SELECT count(*) INTO cnt FROM probe.review_items i JOIN probe.gift_heads h ON(h.tenant=i.tenant AND h.gift=i.gift AND h.scope=i.scope AND h.revision=i.gift_revision) JOIN probe.gift_versions v ON(v.tenant=h.tenant AND v.gift=h.gift AND v.scope=h.scope AND v.revision=h.revision) JOIN probe.coverage c ON(c.tenant=i.tenant AND c.gift=i.gift AND c.scope=i.scope AND c.group_id=r.group_id) WHERE i.tenant=t AND i.review_id=rid AND c.state='open' AND v.eligible AND v.origin='live';
 IF cnt<>cardinality(r.selection) THEN RETURN 'conflict';END IF;
 UPDATE probe.coverage SET state=disposition WHERE tenant=t AND group_id=r.group_id AND gift=ANY(r.selection);
 INSERT INTO probe.receipts VALUES(t,rid,disposition,session_user,k);
 INSERT INTO probe.audit(tenant,group_id,kind,note) VALUES(t,r.group_id,'finished',CASE WHEN k='FAIL_AUDIT' THEN k ELSE 'identifier-only' END);
 UPDATE probe.groups SET state=CASE WHEN EXISTS(SELECT 1 FROM probe.coverage WHERE tenant=t AND group_id=r.group_id AND state='open') THEN 'open' ELSE 'done' END,revision=revision+1 WHERE tenant=t AND id=r.group_id;
 RETURN disposition;
END$$;

CREATE FUNCTION probe.change_source(s int,g int,expected int,ok bool) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();v probe.gift_versions%ROWTYPE;
BEGIN
 IF session_user<>'source_manager' OR expected IS NULL OR ok IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.scopes WHERE tenant=t AND id=s FOR UPDATE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT v0.* INTO v FROM probe.gift_heads h JOIN probe.gift_versions v0 USING(tenant,gift,scope,revision) WHERE h.tenant=t AND h.scope=s AND h.gift=g;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 IF v.revision<>expected THEN RETURN 'stale';END IF;
 INSERT INTO probe.gift_versions VALUES(t,g,s,expected+1,ok,v.origin);
 UPDATE probe.gift_heads SET revision=expected+1 WHERE tenant=t AND scope=s AND gift=g;
 RETURN 'source:'||(expected+1);
END$$;

CREATE FUNCTION probe.read_group(n bigint) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();b probe.groups%ROWTYPE;cnt int;
BEGIN
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=b.scope AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.scopes WHERE tenant=t AND id=b.scope FOR SHARE;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF b.assignee<>session_user THEN RETURN 'unavailable';END IF;
 SELECT count(*) INTO cnt FROM probe.coverage WHERE tenant=t AND group_id=n AND state='open';
 RETURN b.state||':'||cnt;
END$$;

CREATE FUNCTION probe.handoff(n bigint,expected int,dest text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();b probe.groups%ROWTYPE;
BEGIN
 IF session_user<>'source_manager' OR expected IS NULL OR dest IS NULL THEN RETURN 'unavailable';END IF;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND scope=b.scope AND actor=dest AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.scopes WHERE tenant=t AND id=b.scope FOR UPDATE;
 SELECT * INTO b FROM probe.groups WHERE tenant=t AND id=n;IF b.state<>'open' OR b.authority_revision<>expected OR dest=b.assignee THEN RETURN 'conflict';END IF;
 UPDATE probe.groups SET assignee=dest,authority_revision=authority_revision+1,revision=revision+1 WHERE tenant=t AND id=n;
 INSERT INTO probe.audit(tenant,group_id,kind,note) VALUES(t,n,'handoff','identifier-only');
 RETURN 'reassigned';
END$$;
DO $$DECLARE f record;BEGIN FOR f IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace='probe'::regnamespace AND proname IN('admit','review_group','finish','change_source','read_group','handoff') LOOP EXECUTE format('ALTER FUNCTION %s OWNER TO command_executor',f.signature);END LOOP;END$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,policy_manager;
GRANT EXECUTE ON FUNCTION probe.admit(int,int,text) TO source_worker;
GRANT EXECUTE ON FUNCTION probe.review_group(bigint,int[],text),probe.finish(bigint,text,text),probe.read_group(bigint) TO missionary_a,missionary_b,other_tenant;
GRANT EXECUTE ON FUNCTION probe.change_source(int,int,int,bool),probe.handoff(bigint,int,text) TO source_manager;
COMMIT;
