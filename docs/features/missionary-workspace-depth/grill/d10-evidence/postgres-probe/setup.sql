-- Synthetic D10 fixed history/profile mechanics. Not a Core schema or money producer.
BEGIN;
CREATE ROLE fixture_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE coach_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE missionary_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE source_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE SCHEMA probe AUTHORIZATION fixture_owner;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA probe TO command_executor,coach_a,missionary_a,source_manager;
CREATE FUNCTION probe.tenant() RETURNS int LANGUAGE sql STABLE SET search_path=pg_catalog AS $$ SELECT CASE WHEN session_user IN('coach_a','missionary_a','source_manager') THEN 1 ELSE -1 END $$;
SET ROLE fixture_owner;
CREATE TABLE probe.grants(tenant int, target int, module text CHECK(module='received'), coach text NOT NULL, active boolean NOT NULL, revision int NOT NULL, periods daterange NOT NULL CHECK(NOT isempty(periods) AND NOT lower_inf(periods) AND NOT upper_inf(periods) AND isfinite(lower(periods)) AND isfinite(upper(periods)) AND extract(day FROM lower(periods))=1 AND extract(day FROM upper(periods))=1), captured_before date NOT NULL CHECK(isfinite(captured_before) AND upper(periods)<=captured_before), PRIMARY KEY(tenant,target,module));
CREATE TABLE probe.heads(tenant int,target int,module text,revision int NOT NULL,PRIMARY KEY(tenant,target,module),FOREIGN KEY(tenant,target,module) REFERENCES probe.grants);
CREATE TABLE probe.previews(tenant int,id int,actor text NOT NULL,target int,module text,grant_revision int NOT NULL,source_revision int NOT NULL,new_periods daterange NOT NULL,PRIMARY KEY(tenant,id),FOREIGN KEY(tenant,target,module) REFERENCES probe.grants);
CREATE TABLE probe.coverage(tenant int,target int,module text,period_start date NOT NULL,revision int NOT NULL,complete boolean NOT NULL,PRIMARY KEY(tenant,target,module,period_start),FOREIGN KEY(tenant,target,module) REFERENCES probe.heads);
CREATE TABLE probe.facts(tenant int,target int,module text,source_id int,revision int,source_date date NOT NULL,created_at timestamptz NOT NULL,amount_minor bigint NOT NULL,PRIMARY KEY(tenant,target,module,source_id,revision),FOREIGN KEY(tenant,target,module) REFERENCES probe.heads);
CREATE TABLE probe.snapshots(tenant int,target int,module text,coach text,grant_revision int,source_revision int,periods daterange,payload jsonb NOT NULL,PRIMARY KEY(tenant,target,module,coach,grant_revision,source_revision,periods),FOREIGN KEY(tenant,target,module) REFERENCES probe.heads);
RESET ROLE;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['grants','heads','previews','coverage','facts','snapshots'] LOOP
 EXECUTE format('ALTER TABLE probe.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('ALTER TABLE probe.%I FORCE ROW LEVEL SECURITY',t);
 EXECUTE format('CREATE POLICY tenant_only ON probe.%I TO command_executor USING(tenant=probe.tenant())',t);
END LOOP; END $$;
GRANT SELECT ON ALL TABLES IN SCHEMA probe TO command_executor;
GRANT UPDATE(periods,revision) ON probe.grants TO command_executor;
GRANT UPDATE(revision) ON probe.heads,probe.coverage TO command_executor;
GRANT INSERT ON probe.snapshots TO command_executor;
GRANT SELECT,UPDATE ON probe.grants,probe.heads TO source_manager;
CREATE POLICY manager_grant ON probe.grants TO source_manager USING(tenant=probe.tenant());
CREATE POLICY manager_head ON probe.heads TO source_manager USING(tenant=probe.tenant());

CREATE FUNCTION probe.apply_preview(p_id int) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE p probe.previews%ROWTYPE; g probe.grants%ROWTYPE; h probe.heads%ROWTYPE;
BEGIN
 SELECT * INTO p FROM probe.previews WHERE tenant=probe.tenant() AND id=p_id AND actor=session_user;
 IF NOT FOUND THEN RETURN 'unavailable'; END IF;
 SELECT * INTO g FROM probe.grants WHERE (tenant,target,module)=(p.tenant,p.target,p.module) FOR UPDATE;
 IF NOT FOUND OR NOT g.active THEN RETURN 'unavailable'; END IF;
 IF g.revision<>p.grant_revision THEN RETURN 'conflict'; END IF;
 SELECT * INTO h FROM probe.heads WHERE (tenant,target,module)=(p.tenant,p.target,p.module) FOR SHARE;
 IF NOT FOUND OR h.revision<>p.source_revision THEN RETURN 'conflict'; END IF;
 IF isempty(p.new_periods) OR lower_inf(p.new_periods) OR upper_inf(p.new_periods) OR NOT isfinite(lower(p.new_periods)) OR NOT isfinite(upper(p.new_periods)) OR extract(day FROM lower(p.new_periods))<>1 OR extract(day FROM upper(p.new_periods))<>1 OR NOT p.new_periods @> g.periods OR upper(p.new_periods)>g.captured_before THEN RETURN 'conflict'; END IF;
 UPDATE probe.grants SET periods=p.new_periods,revision=revision+1 WHERE (tenant,target,module)=(p.tenant,p.target,p.module);
 RETURN 'accepted';
END $$;

CREATE FUNCTION probe.history(p_tenant int,p_target int,p_module text,p_periods daterange,p_generate boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$
DECLARE g probe.grants%ROWTYPE; h probe.heads%ROWTYPE; c probe.coverage%ROWTYPE; d date; total numeric; payload jsonb:='[]'::jsonb;
BEGIN
 IF p_tenant<>probe.tenant() THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO g FROM probe.grants WHERE (tenant,target,module)=(p_tenant,p_target,p_module) AND coach=session_user FOR SHARE;
 IF NOT FOUND OR NOT g.active THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 IF p_periods IS NULL OR isempty(p_periods) OR lower_inf(p_periods) OR upper_inf(p_periods) OR NOT isfinite(lower(p_periods)) OR NOT isfinite(upper(p_periods)) OR extract(day FROM lower(p_periods))<>1 OR extract(day FROM upper(p_periods))<>1 OR NOT p_periods <@ g.periods THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 SELECT * INTO h FROM probe.heads WHERE (tenant,target,module)=(p_tenant,p_target,p_module) FOR SHARE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 d:=lower(p_periods);
 WHILE d<upper(p_periods) LOOP
  SELECT * INTO c FROM probe.coverage WHERE (tenant,target,module,period_start)=(p_tenant,p_target,p_module,d) FOR SHARE;
  IF NOT FOUND OR NOT c.complete OR c.revision<>h.revision THEN RETURN jsonb_build_object('status','unavailable'); END IF;
  IF p_generate THEN
   SELECT COALESCE(sum(amount_minor),0) INTO total FROM probe.facts WHERE (tenant,target,module,revision)=(p_tenant,p_target,p_module,h.revision) AND source_date>=d AND source_date<(d+interval '1 month')::date;
   payload:=payload||jsonb_build_array(jsonb_build_object('start',d,'end_exclusive',(d+interval '1 month')::date,'amount_minor',total::text));
  END IF;
  d:=(d+interval '1 month')::date;
 END LOOP;
 IF p_generate THEN INSERT INTO probe.snapshots VALUES(p_tenant,p_target,p_module,session_user,g.revision,h.revision,p_periods,payload) ON CONFLICT DO NOTHING; END IF;
 SELECT s.payload INTO payload FROM probe.snapshots s WHERE (s.tenant,s.target,s.module,s.coach,s.grant_revision,s.source_revision,s.periods)=(p_tenant,p_target,p_module,session_user,g.revision,h.revision,p_periods);
 IF NOT FOUND THEN RETURN jsonb_build_object('status','unavailable'); END IF;
 RETURN jsonb_build_object('status','available','periods',p_periods::text,'currency','USD','basis','synthetic_current_effective_gift_date','source_revision',h.revision,'grant_revision',g.revision,'values',payload);
END $$;

-- Intentionally unsafe dating: creation time instead of effective gift date.
CREATE FUNCTION probe.unsafe_created_month() RETURNS numeric LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,probe,pg_temp AS $$ SELECT sum(amount_minor) FROM probe.facts WHERE tenant=1 AND target=10 AND module='received' AND revision=1 AND created_at>=timestamptz '2026-09-01Z' AND created_at<timestamptz '2026-10-01Z' $$;
ALTER FUNCTION probe.apply_preview(int) OWNER TO command_executor;
ALTER FUNCTION probe.history(int,int,text,daterange,boolean) OWNER TO command_executor;
ALTER FUNCTION probe.unsafe_created_month() OWNER TO command_executor;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA probe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.tenant() TO command_executor,coach_a,missionary_a,source_manager;
GRANT EXECUTE ON FUNCTION probe.apply_preview(int) TO missionary_a;
GRANT EXECUTE ON FUNCTION probe.history(int,int,text,daterange,boolean),probe.unsafe_created_month() TO coach_a;
INSERT INTO probe.grants VALUES(1,10,'received','coach_a',true,1,'[2026-09-01,2026-10-01)','2026-10-01');
INSERT INTO probe.heads VALUES(1,10,'received',1);
INSERT INTO probe.previews VALUES(1,1,'missionary_a',10,'received',1,1,'[2026-08-01,2026-10-01)');
INSERT INTO probe.coverage VALUES(1,10,'received','2026-08-01',1,true),(1,10,'received','2026-09-01',1,true);
INSERT INTO probe.facts VALUES
 (1,10,'received',1,1,'2026-09-01','2026-10-05Z',100),
 (1,10,'received',2,1,'2026-09-30','2026-10-06Z',200),
 (1,10,'received',3,1,'2026-10-01','2026-10-01Z',900),
 (1,10,'received',4,1,'2026-08-31','2026-09-05Z',40),
 (1,10,'received',5,1,'2026-08-01','2026-09-05Z',60);
COMMIT;
