-- Synthetic PostgreSQL mechanics only. Never run against Core or hosted data.
CREATE ROLE actor_a LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE actor_b LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE fixture_owner LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE bypass_actor LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT BYPASSRLS;
CREATE ROLE gate_executor NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE gate_manager LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE SCHEMA probe;
GRANT USAGE ON SCHEMA probe TO PUBLIC;

CREATE TABLE probe.implicit_check(id int PRIMARY KEY, tenant int, owner_actor text, classification text, value text);
INSERT INTO probe.implicit_check VALUES (1,1,'actor_a','restricted','original'),(2,1,'actor_b','restricted','hidden'),(3,2,'actor_b','restricted','other tenant');
ALTER TABLE probe.implicit_check ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON probe.implicit_check TO actor_a;
CREATE POLICY select_tenant ON probe.implicit_check FOR SELECT TO actor_a USING(tenant=1);
CREATE POLICY update_own ON probe.implicit_check FOR UPDATE TO actor_a USING(tenant=1 AND owner_actor=current_user);

CREATE TABLE probe.broad_check (LIKE probe.implicit_check INCLUDING ALL);
INSERT INTO probe.broad_check SELECT * FROM probe.implicit_check;
ALTER TABLE probe.broad_check ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON probe.broad_check TO actor_a;
CREATE POLICY select_tenant ON probe.broad_check FOR SELECT TO actor_a USING(tenant=1);
CREATE POLICY update_own ON probe.broad_check FOR UPDATE TO actor_a USING(tenant=1 AND owner_actor=current_user) WITH CHECK(true);

CREATE TABLE probe.or_policies (LIKE probe.implicit_check INCLUDING ALL);
INSERT INTO probe.or_policies SELECT * FROM probe.implicit_check;
ALTER TABLE probe.or_policies ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON probe.or_policies TO actor_a;
CREATE POLICY own_rows ON probe.or_policies FOR SELECT TO actor_a USING(tenant=1 AND owner_actor=current_user);
CREATE POLICY broad_reader ON probe.or_policies FOR SELECT TO actor_a USING(true);

CREATE TABLE probe.owner_docs (LIKE probe.implicit_check INCLUDING ALL);
INSERT INTO probe.owner_docs SELECT * FROM probe.implicit_check;
ALTER TABLE probe.owner_docs OWNER TO fixture_owner;
ALTER TABLE probe.owner_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY actual_actor ON probe.owner_docs FOR SELECT TO actor_a USING(tenant=1 AND owner_actor=current_user);
GRANT SELECT ON probe.owner_docs TO actor_a,bypass_actor;
CREATE VIEW probe.owner_view AS SELECT * FROM probe.owner_docs;
ALTER VIEW probe.owner_view OWNER TO fixture_owner;
CREATE VIEW probe.invoker_view WITH(security_invoker=true) AS SELECT * FROM probe.owner_docs;
CREATE VIEW probe.super_view AS SELECT * FROM probe.owner_docs;
GRANT SELECT ON probe.owner_view,probe.invoker_view,probe.super_view TO actor_a;
CREATE FUNCTION probe.owner_fn() RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT count(*) FROM probe.owner_docs $$;
ALTER FUNCTION probe.owner_fn() OWNER TO fixture_owner;
CREATE FUNCTION probe.super_fn() RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT count(*) FROM probe.owner_docs $$;
CREATE FUNCTION probe.invoker_fn() RETURNS bigint LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT count(*) FROM probe.owner_docs $$;

CREATE TABLE probe.hidden_registry(id int PRIMARY KEY, tenant int, owner_actor text, address text UNIQUE, UNIQUE(tenant,id));
INSERT INTO probe.hidden_registry VALUES(41,2,'actor_b','synthetic-hidden@example.invalid');
ALTER TABLE probe.hidden_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_registry ON probe.hidden_registry TO actor_a USING(tenant=1 AND owner_actor=current_user);
GRANT SELECT,INSERT,REFERENCES ON probe.hidden_registry TO actor_a;
CREATE TABLE probe.weak_child(id int PRIMARY KEY, tenant int, parent_id int REFERENCES probe.hidden_registry(id));
CREATE TABLE probe.strong_child(id int PRIMARY KEY, tenant int, parent_id int, FOREIGN KEY(tenant,parent_id) REFERENCES probe.hidden_registry(tenant,id));
GRANT INSERT, SELECT ON probe.weak_child,probe.strong_child TO actor_a;
ALTER TABLE probe.weak_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.strong_child ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_only ON probe.weak_child TO actor_a USING(tenant=1);
CREATE POLICY tenant_only ON probe.strong_child TO actor_a USING(tenant=1);

CREATE TABLE probe.no_select(id int PRIMARY KEY,value text);
INSERT INTO probe.no_select VALUES(1,'original');
ALTER TABLE probe.no_select ENABLE ROW LEVEL SECURITY;
GRANT SELECT,UPDATE ON probe.no_select TO actor_a;
CREATE POLICY write_only ON probe.no_select FOR UPDATE TO actor_a USING(true) WITH CHECK(true);

CREATE TABLE probe.operations(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,tenant int,actor text,op text,payload text,UNIQUE(tenant,actor,op));
CREATE TABLE probe.effects(operation_id bigint PRIMARY KEY REFERENCES probe.operations(id),payload text);
GRANT SELECT,INSERT ON probe.operations,probe.effects TO actor_a;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA probe TO actor_a;
ALTER TABLE probe.operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_op ON probe.operations TO actor_a USING(tenant=1 AND actor=current_user);
CREATE FUNCTION probe.accept_once(operation_key text, requested_payload text) RETURNS bigint
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE existing probe.operations%ROWTYPE;
BEGIN
 INSERT INTO probe.operations(tenant,actor,op,payload) VALUES(1,current_user,operation_key,requested_payload)
 ON CONFLICT(tenant,actor,op) DO NOTHING RETURNING * INTO existing;
 IF FOUND THEN
   INSERT INTO probe.effects VALUES(existing.id,requested_payload);
 ELSE
   SELECT * INTO STRICT existing FROM probe.operations WHERE tenant=1 AND actor=current_user AND op=operation_key;
   IF existing.payload IS DISTINCT FROM requested_payload THEN RAISE EXCEPTION 'semantic conflict' USING ERRCODE='22023'; END IF;
 END IF;
 RETURN existing.id;
END $$;

CREATE TABLE probe.revisions(id int PRIMARY KEY, revision int NOT NULL, value text);
INSERT INTO probe.revisions VALUES(1,1,'original');
GRANT SELECT,UPDATE ON probe.revisions TO actor_a;

CREATE TABLE probe.write_gate(actor text PRIMARY KEY,allowed bool NOT NULL,revision int NOT NULL);
INSERT INTO probe.write_gate VALUES('actor_a',true,1);
CREATE TABLE probe.fenced_effects(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor text,note text);
CREATE TABLE probe.unsafe_effects(actor text,note text);
GRANT SELECT ON probe.write_gate TO actor_a;
GRANT SELECT,UPDATE ON probe.write_gate TO gate_executor,gate_manager;
GRANT INSERT ON probe.fenced_effects TO gate_executor;
GRANT INSERT ON probe.unsafe_effects TO actor_a;
GRANT USAGE ON SEQUENCE probe.fenced_effects_id_seq TO gate_executor;
ALTER TABLE probe.write_gate ENABLE ROW LEVEL SECURITY;
CREATE POLICY actor_read ON probe.write_gate FOR SELECT TO actor_a USING(actor=current_user);
CREATE POLICY executor_gate ON probe.write_gate TO gate_executor USING(actor=session_user);
CREATE POLICY manager_gate ON probe.write_gate TO gate_manager USING(true);
CREATE FUNCTION probe.fenced_write(message text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE admitted bool;
BEGIN
 SELECT allowed INTO admitted FROM probe.write_gate WHERE actor=session_user FOR SHARE;
 IF admitted IS DISTINCT FROM true THEN RETURN 'denied'; END IF;
 INSERT INTO probe.fenced_effects(actor,note) VALUES(session_user,message);
 RETURN 'accepted';
END $$;
ALTER FUNCTION probe.fenced_write(text) OWNER TO gate_executor;
REVOKE ALL ON FUNCTION probe.fenced_write(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.fenced_write(text) TO actor_a;
