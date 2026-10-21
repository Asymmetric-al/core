-- Synthetic D22 policy/source binding mechanics; not a Core migration or criterion engine.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_editor LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_worker LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_owner LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE other_tenant LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_revoker LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
GRANT USAGE ON SCHEMA probe TO command_executor,policy_editor,source_worker,source_owner,other_tenant,policy_revoker;
CREATE FUNCTION probe.tenant() RETURNS int LANGUAGE sql STABLE AS $$SELECT CASE WHEN session_user='other_tenant' THEN 2 WHEN session_user IN('policy_editor','source_worker','source_owner','policy_revoker') THEN 1 ELSE -1 END$$;
SET ROLE fixture_owner;
CREATE DOMAIN probe.minor_units AS numeric CHECK(VALUE NOT IN('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric) AND VALUE=trunc(VALUE) AND VALUE>=0);
CREATE TABLE probe.gates(tenant int NOT NULL,actor text NOT NULL,allowed bool NOT NULL,PRIMARY KEY(tenant,actor));
CREATE TABLE probe.policy_versions(tenant int NOT NULL,currency text NOT NULL CHECK(currency IN('USD','JPY','KWD')),revision int NOT NULL,generation int NOT NULL,enabled bool NOT NULL,threshold probe.minor_units,CHECK(threshold IS NULL OR threshold>0),CHECK(NOT enabled OR threshold IS NOT NULL),PRIMARY KEY(tenant,currency,revision));
CREATE TABLE probe.policy_heads(tenant int NOT NULL,currency text NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,currency),FOREIGN KEY(tenant,currency,revision) REFERENCES probe.policy_versions);
CREATE TABLE probe.occurrences(tenant int NOT NULL,gift int NOT NULL,currency text NOT NULL,subject int NOT NULL,original_policy int NOT NULL,origin text NOT NULL CHECK(origin IN('live','history')),PRIMARY KEY(tenant,gift),UNIQUE(tenant,gift,currency),FOREIGN KEY(tenant,currency,original_policy) REFERENCES probe.policy_versions);
CREATE TABLE probe.source_versions(tenant int NOT NULL,gift int NOT NULL,currency text NOT NULL,revision int NOT NULL,amount probe.minor_units,ready bool NOT NULL,basis text NOT NULL CHECK(basis='prequalified_subject_amount'),CHECK(NOT ready OR amount IS NOT NULL),PRIMARY KEY(tenant,gift,revision),FOREIGN KEY(tenant,gift,currency) REFERENCES probe.occurrences(tenant,gift,currency));
CREATE TABLE probe.source_heads(tenant int NOT NULL,gift int NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,gift),FOREIGN KEY(tenant,gift,revision) REFERENCES probe.source_versions);
CREATE TABLE probe.intents(tenant int NOT NULL,gift int NOT NULL,currency text NOT NULL,policy_revision int NOT NULL,source_revision int NOT NULL,purpose text NOT NULL CHECK(purpose='amount_followup'),actor text NOT NULL,PRIMARY KEY(tenant,gift,purpose),UNIQUE(tenant,gift),FOREIGN KEY(tenant,gift,currency) REFERENCES probe.occurrences(tenant,gift,currency),FOREIGN KEY(tenant,currency,policy_revision) REFERENCES probe.policy_versions,FOREIGN KEY(tenant,gift,source_revision) REFERENCES probe.source_versions);
CREATE TABLE probe.materialized(tenant int NOT NULL,gift int NOT NULL,PRIMARY KEY(tenant,gift),FOREIGN KEY(tenant,gift) REFERENCES probe.intents(tenant,gift));
CREATE TABLE probe.audit(tenant int NOT NULL,id bigint GENERATED ALWAYS AS IDENTITY,kind text NOT NULL,reference text NOT NULL,CHECK(reference<>'FAIL_AUDIT'),PRIMARY KEY(tenant,id));
RESET ROLE;
DO $$DECLARE t record;BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='probe' LOOP EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t.tablename);EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t.tablename);EXECUTE format('CREATE POLICY tenant_backstop ON probe.%I TO command_executor USING(tenant=probe.tenant())',t.tablename);END LOOP;END$$;
CREATE POLICY gate_editor ON probe.gates TO policy_revoker USING(tenant=probe.tenant());
GRANT SELECT,UPDATE ON probe.gates TO policy_revoker;
GRANT SELECT ON ALL TABLES IN SCHEMA probe TO command_executor;
GRANT INSERT ON probe.policy_versions,probe.occurrences,probe.source_versions,probe.source_heads,probe.intents,probe.materialized,probe.audit TO command_executor;
GRANT UPDATE(revision) ON probe.policy_heads,probe.source_heads TO command_executor;
GRANT UPDATE(allowed) ON probe.gates TO command_executor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA probe TO command_executor;
CREATE FUNCTION probe.immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'immutable source evidence' USING ERRCODE='55000';END$$;
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['policy_versions','occurrences','source_versions','intents','materialized','audit'] LOOP EXECUTE format('CREATE TRIGGER immutable_evidence BEFORE UPDATE OR DELETE ON probe.%I FOR EACH ROW EXECUTE FUNCTION probe.immutable()',t);END LOOP;END$$;
CREATE FUNCTION probe.save_policy(c text,expected int,onoff bool,amount numeric,note text DEFAULT 'policy') RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();p probe.policy_versions%ROWTYPE;head int;gen int;
BEGIN
 IF session_user NOT IN('policy_editor','other_tenant') OR expected IS NULL OR onoff IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT revision INTO head FROM probe.policy_heads WHERE tenant=t AND currency=c FOR UPDATE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 IF head<>expected THEN RETURN 'stale';END IF;
 SELECT * INTO p FROM probe.policy_versions WHERE tenant=t AND currency=c AND revision=head;
 IF p.enabled=onoff AND p.threshold IS NOT DISTINCT FROM amount THEN RETURN 'unchanged';END IF;
 gen:=p.generation+CASE WHEN p.enabled<>onoff THEN 1 ELSE 0 END;
 INSERT INTO probe.policy_versions VALUES(t,c,head+1,gen,onoff,amount);
 UPDATE probe.policy_heads SET revision=head+1 WHERE tenant=t AND currency=c;
 INSERT INTO probe.audit(tenant,kind,reference) VALUES(t,'policy',note);
 RETURN 'policy:'||(head+1);
END$$;
CREATE FUNCTION probe.capture(c text,g int,amount numeric,ready bool DEFAULT true,origin text DEFAULT 'live') RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();head int;
BEGIN
 IF session_user<>'source_owner' OR g IS NULL OR ready IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT revision INTO head FROM probe.policy_heads WHERE tenant=t AND currency=c FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 IF EXISTS(SELECT 1 FROM probe.occurrences WHERE tenant=t AND gift=g) THEN RETURN 'exists';END IF;
 INSERT INTO probe.occurrences VALUES(t,g,c,10,head,origin);
 INSERT INTO probe.source_versions VALUES(t,g,c,1,amount,ready,'prequalified_subject_amount');
 INSERT INTO probe.source_heads VALUES(t,g,1);
 RETURN 'captured:'||head;
END$$;
CREATE FUNCTION probe.change_source(g int,expected int,amount numeric,ready bool DEFAULT true) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();head int;c text;
BEGIN
 IF session_user<>'source_owner' OR expected IS NULL OR ready IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT revision INTO head FROM probe.source_heads WHERE tenant=t AND gift=g FOR UPDATE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 IF expected<>head THEN RETURN 'stale';END IF;
 SELECT currency INTO c FROM probe.occurrences WHERE tenant=t AND gift=g;
 INSERT INTO probe.source_versions VALUES(t,g,c,head+1,amount,ready,'prequalified_subject_amount');
 UPDATE probe.source_heads SET revision=head+1 WHERE tenant=t AND gift=g;
 RETURN 'source:'||(head+1);
END$$;
CREATE FUNCTION probe.admit(g int,note text DEFAULT 'admission') RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();o probe.occurrences%ROWTYPE;p probe.policy_versions%ROWTYPE;nowp probe.policy_versions%ROWTYPE;s probe.source_versions%ROWTYPE;head int;sr int;
BEGIN
 IF session_user<>'source_worker' OR g IS NULL THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO o FROM probe.occurrences WHERE tenant=t AND gift=g;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT revision INTO head FROM probe.policy_heads WHERE tenant=t AND currency=o.currency FOR SHARE;
 SELECT revision INTO sr FROM probe.source_heads WHERE tenant=t AND gift=g FOR UPDATE;
 IF EXISTS(SELECT 1 FROM probe.intents WHERE tenant=t AND gift=g) THEN RETURN 'receipt:accepted';END IF;
 SELECT * INTO p FROM probe.policy_versions WHERE tenant=t AND currency=o.currency AND revision=o.original_policy;
 SELECT * INTO nowp FROM probe.policy_versions WHERE tenant=t AND currency=o.currency AND revision=head;
 IF o.origin<>'live' THEN RETURN 'history_only';END IF;
 IF NOT p.enabled OR NOT nowp.enabled OR p.generation<>nowp.generation THEN RETURN 'inactive_generation';END IF;
 SELECT * INTO s FROM probe.source_versions WHERE tenant=t AND gift=g AND revision=sr;
 IF NOT s.ready THEN RETURN 'source_pending';END IF;
 IF s.amount<p.threshold THEN RETURN 'below';END IF;
 INSERT INTO probe.intents VALUES(t,g,o.currency,p.revision,s.revision,'amount_followup',session_user);
 INSERT INTO probe.audit(tenant,kind,reference) VALUES(t,'admission',note);
 RETURN 'accepted';
END$$;
CREATE FUNCTION probe.materialize(g int) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE t int:=probe.tenant();i probe.intents%ROWTYPE;sr int;
BEGIN
 IF session_user<>'source_worker' THEN RETURN 'unavailable';END IF;
 PERFORM 1 FROM probe.gates WHERE tenant=t AND actor=session_user AND allowed FOR SHARE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT revision INTO sr FROM probe.source_heads WHERE tenant=t AND gift=g FOR UPDATE;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 SELECT * INTO i FROM probe.intents WHERE tenant=t AND gift=g;IF NOT FOUND THEN RETURN 'unavailable';END IF;
 IF EXISTS(SELECT 1 FROM probe.materialized WHERE tenant=t AND gift=g) THEN RETURN 'receipt:materialized';END IF;
 IF sr<>i.source_revision THEN RETURN 'source_changed';END IF;
 INSERT INTO probe.materialized VALUES(t,g);
 RETURN 'materialized';
END$$;
DO $$DECLARE f record;BEGIN FOR f IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace='probe'::regnamespace AND proname IN('save_policy','capture','change_source','admit','materialize') LOOP EXECUTE format('ALTER FUNCTION %s OWNER TO command_executor',f.signature);END LOOP;END$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,policy_revoker;
GRANT EXECUTE ON FUNCTION probe.save_policy(text,int,bool,numeric,text) TO policy_editor,other_tenant;
GRANT EXECUTE ON FUNCTION probe.capture(text,int,numeric,bool,text),probe.change_source(int,int,numeric,bool) TO source_owner;
GRANT EXECUTE ON FUNCTION probe.admit(int,text),probe.materialize(int) TO source_worker;
COMMIT;
