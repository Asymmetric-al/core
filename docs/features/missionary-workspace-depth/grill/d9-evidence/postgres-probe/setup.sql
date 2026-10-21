-- Synthetic D9 source-summary mechanics, not Core financial schema or P12.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_b LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_tenant_two LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA probe TO command_executor,coach_a,coach_b,coach_tenant_two,source_manager;
CREATE FUNCTION probe.session_tenant() RETURNS int LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT CASE session_user WHEN 'coach_tenant_two' THEN 2 WHEN 'coach_a' THEN 1 WHEN 'coach_b' THEN 1 WHEN 'source_manager' THEN 1 ELSE -1 END $$;
REVOKE ALL ON FUNCTION probe.session_tenant() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.session_tenant() TO command_executor,coach_a,coach_b,coach_tenant_two,source_manager;
SET ROLE fixture_owner;
CREATE TABLE probe.profiles(tenant int NOT NULL,id int NOT NULL,target int NOT NULL,currency text NOT NULL CHECK(currency IN('USD','JPY')),period_start date NOT NULL,period_end date NOT NULL CHECK(period_start<period_end),giving_timezone text NOT NULL,cohort text NOT NULL,PRIMARY KEY(tenant,id));
CREATE TABLE probe.grants(tenant int NOT NULL,principal text NOT NULL,profile int NOT NULL,module text NOT NULL CHECK(module IN('expected','received')),allowed boolean NOT NULL,revision int NOT NULL,PRIMARY KEY(tenant,principal,profile,module),FOREIGN KEY(tenant,profile) REFERENCES probe.profiles);
CREATE TABLE probe.source_heads(tenant int NOT NULL,profile int NOT NULL,module text NOT NULL CHECK(module IN('expected','received')),revision int NOT NULL,as_of timestamptz NOT NULL,PRIMARY KEY(tenant,profile,module),FOREIGN KEY(tenant,profile) REFERENCES probe.profiles);
CREATE TABLE probe.coverage(tenant int NOT NULL,profile int NOT NULL,module text NOT NULL,revision int NOT NULL,complete boolean NOT NULL,PRIMARY KEY(tenant,profile,module),FOREIGN KEY(tenant,profile,module) REFERENCES probe.source_heads);
-- Exact finite whole minor units. No two-decimal scale or floating arithmetic.
CREATE TABLE probe.facts(tenant int NOT NULL,profile int NOT NULL,module text NOT NULL,source_id int NOT NULL,revision int NOT NULL,amount_minor numeric NOT NULL CHECK(amount_minor=trunc(amount_minor) AND amount_minor NOT IN('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)),PRIMARY KEY(tenant,profile,module,source_id,revision),FOREIGN KEY(tenant,profile,module) REFERENCES probe.source_heads);
CREATE TABLE probe.allocations(tenant int NOT NULL,profile int NOT NULL,module text NOT NULL,source_id int NOT NULL,revision int NOT NULL,label text NOT NULL,PRIMARY KEY(tenant,profile,module,source_id,revision,label),FOREIGN KEY(tenant,profile,module,source_id,revision) REFERENCES probe.facts);
CREATE TABLE probe.summaries(tenant int NOT NULL,principal text NOT NULL,profile int NOT NULL,module text NOT NULL,grant_revision int NOT NULL,source_revision int NOT NULL,amount_minor numeric NOT NULL,PRIMARY KEY(tenant,principal,profile,module,grant_revision,source_revision),FOREIGN KEY(tenant,profile,module) REFERENCES probe.source_heads);
RESET ROLE;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['profiles','grants','source_heads','coverage','facts','allocations','summaries'] LOOP
 EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY coarse_tenant ON probe.%I TO command_executor USING(tenant=probe.session_tenant())',t);
END LOOP; END $$;
GRANT SELECT ON ALL TABLES IN SCHEMA probe TO command_executor;
GRANT INSERT ON probe.summaries TO command_executor;
GRANT UPDATE(allowed) ON probe.grants TO command_executor;
GRANT UPDATE(revision) ON probe.source_heads,probe.coverage TO command_executor;
GRANT SELECT,UPDATE ON probe.grants,probe.source_heads,probe.coverage TO source_manager;
CREATE POLICY manager_grants ON probe.grants TO source_manager USING(tenant=probe.session_tenant());
CREATE POLICY manager_heads ON probe.source_heads TO source_manager USING(tenant=probe.session_tenant());
CREATE POLICY manager_coverage ON probe.coverage TO source_manager USING(tenant=probe.session_tenant());

CREATE FUNCTION probe.summary(p_tenant int,p_target int,p_profile int,p_module text,p_generate boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE g probe.grants%ROWTYPE; p probe.profiles%ROWTYPE; h probe.source_heads%ROWTYPE; c probe.coverage%ROWTYPE; total numeric;
BEGIN
 IF p_tenant<>probe.session_tenant() THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO g FROM probe.grants WHERE tenant=p_tenant AND principal=session_user AND profile=p_profile AND module=p_module FOR SHARE;
 IF NOT FOUND OR NOT g.allowed THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO p FROM probe.profiles WHERE tenant=p_tenant AND id=p_profile AND target=p_target;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO h FROM probe.source_heads WHERE tenant=p_tenant AND profile=p_profile AND module=p_module FOR SHARE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO c FROM probe.coverage WHERE tenant=p_tenant AND profile=p_profile AND module=p_module FOR SHARE;
 IF NOT FOUND OR NOT c.complete OR c.revision<>h.revision THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 IF p_generate THEN
  SELECT COALESCE(sum(amount_minor),0) INTO total FROM probe.facts WHERE tenant=p_tenant AND profile=p_profile AND module=p_module AND revision=h.revision;
  INSERT INTO probe.summaries VALUES(p_tenant,session_user,p_profile,p_module,g.revision,h.revision,total) ON CONFLICT DO NOTHING;
 END IF;
 SELECT amount_minor INTO total FROM probe.summaries WHERE tenant=p_tenant AND principal=session_user AND profile=p_profile AND module=p_module AND grant_revision=g.revision AND source_revision=h.revision;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 RETURN jsonb_build_object('status','available','module',p_module,'basis',CASE p_module WHEN 'expected' THEN 'synthetic_expected_occurrence_minor' ELSE 'synthetic_received_line_minor' END,'amount_minor',total::text,'currency',p.currency,'period_start',p.period_start,'period_end_exclusive',p.period_end,'giving_timezone',p.giving_timezone,'cohort',p.cohort,'as_of',h.as_of,'source_revision',h.revision);
END $$;
-- Deliberately unsafe: fanout joins and SUM(DISTINCT amount) both destroy source grain.
CREATE FUNCTION probe.unsafe_join_totals() RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
 SELECT (SELECT sum(f.amount_minor) FROM probe.facts f JOIN probe.allocations a USING(tenant,profile,module,source_id,revision) WHERE f.tenant=1 AND f.profile=1 AND f.module='expected' AND f.revision=1)||':'||
 (SELECT sum(f.amount_minor) FROM probe.facts f JOIN probe.allocations a USING(tenant,profile,module,source_id,revision) WHERE f.tenant=1 AND f.profile=1 AND f.module='received' AND f.revision=1)||':'||
 (SELECT sum(DISTINCT amount_minor) FROM probe.facts WHERE tenant=1 AND profile=1 AND module='expected' AND revision=1)
$$;
-- Deliberately unsafe: permission to expected does not grant the received numerator.
-- This arithmetic is not claimed to be a financially meaningful coverage ratio.
CREATE FUNCTION probe.unsafe_ratio() RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
BEGIN
 IF probe.summary(1,10,1,'expected',true)->>'status'<>'available' THEN RETURN NULL; END IF;
 RETURN (SELECT sum(amount_minor) FROM probe.facts WHERE tenant=1 AND profile=1 AND module='received' AND revision=1)/(SELECT sum(amount_minor) FROM probe.facts WHERE tenant=1 AND profile=1 AND module='expected' AND revision=1);
END $$;
ALTER FUNCTION probe.summary(int,int,int,text,boolean) OWNER TO command_executor;
ALTER FUNCTION probe.unsafe_join_totals() OWNER TO command_executor;
ALTER FUNCTION probe.unsafe_ratio() OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.summary(int,int,int,text,boolean) TO coach_a,coach_b,coach_tenant_two;
GRANT EXECUTE ON FUNCTION probe.unsafe_join_totals() TO coach_a;
GRANT EXECUTE ON FUNCTION probe.unsafe_ratio() TO coach_b;
INSERT INTO probe.profiles VALUES
 (1,1,10,'USD','2026-10-01','2026-11-01','Etc/UTC','admitted-A'),
 (1,2,10,'JPY','2026-10-01','2026-11-01','Etc/UTC','admitted-A'),
 (1,3,10,'USD','2026-11-01','2026-12-01','Etc/UTC','admitted-A'),
 (1,4,10,'USD','2026-12-01','2027-01-01','Etc/UTC','admitted-A'),
 (1,5,10,'USD','2026-10-01','2026-11-01','Etc/UTC','incomplete'),
 (1,6,10,'USD','2026-10-01','2026-11-01','Etc/UTC','coverage-missing'),
 (1,7,10,'JPY','2026-10-01','2026-11-01','Etc/UTC','large-exact'),
 (1,8,10,'USD','2026-10-01','2026-11-01','Etc/UTC','not-admitted'),
 (2,21,20,'USD','2026-10-01','2026-11-01','Etc/UTC','other-tenant');
INSERT INTO probe.source_heads SELECT tenant,id,'expected',1,'2026-10-16T08:00:00Z' FROM probe.profiles;
INSERT INTO probe.source_heads VALUES(1,1,'received',1,'2026-10-16T08:00:00Z');
INSERT INTO probe.coverage SELECT tenant,profile,module,1,profile<>5 FROM probe.source_heads WHERE profile<>6;
INSERT INTO probe.facts VALUES(1,1,'expected',1,1,100),(1,1,'expected',2,1,100),(1,1,'received',1,1,80),(1,1,'received',2,1,70),(1,2,'expected',1,1,300),(1,7,'expected',1,1,9007199254740993),(1,7,'expected',2,1,7),(1,8,'expected',1,1,999),(2,21,'expected',1,1,9999);
INSERT INTO probe.allocations SELECT tenant,profile,module,source_id,revision,'first' FROM probe.facts WHERE profile=1;
INSERT INTO probe.allocations SELECT tenant,profile,module,source_id,revision,'second' FROM probe.facts WHERE profile=1 AND source_id=1;
INSERT INTO probe.grants SELECT 1,'coach_a',n,'expected',true,1 FROM unnest(ARRAY[1,2,3,5,6,7])n;
INSERT INTO probe.grants VALUES(1,'coach_a',1,'received',true,1),(1,'coach_b',1,'expected',true,1),(2,'coach_tenant_two',21,'expected',true,1);
COMMIT;
