-- Disposable D2 mechanics. Not a Core schema, migration or product command.
CREATE ROLE sharer LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE projector LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE SCHEMA probe;
GRANT USAGE ON SCHEMA probe TO sharer,projector;
CREATE TABLE probe.sources(tenant int NOT NULL,id int NOT NULL,revision int NOT NULL,shared bool NOT NULL DEFAULT false,PRIMARY KEY(tenant,id));
INSERT INTO probe.sources(tenant,id,revision) SELECT 1,n,1 FROM generate_series(1,12)n;
CREATE TABLE probe.shares(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,tenant int NOT NULL,source_id int NOT NULL,source_revision int NOT NULL,
 notify_requested bool NOT NULL,chosen_recipients text[] NOT NULL,UNIQUE(tenant,source_id,source_revision),UNIQUE(tenant,id),
 FOREIGN KEY(tenant,source_id) REFERENCES probe.sources(tenant,id) ON DELETE RESTRICT);
CREATE TABLE probe.receipts(
 tenant int NOT NULL,actor text NOT NULL,command_key text NOT NULL,source_id int NOT NULL,source_revision int NOT NULL,
 notify_requested bool NOT NULL,chosen_recipients text[] NOT NULL,share_id bigint NOT NULL,PRIMARY KEY(tenant,actor,command_key),
 FOREIGN KEY(tenant,share_id) REFERENCES probe.shares(tenant,id) ON DELETE RESTRICT);
CREATE TABLE probe.intents(
 tenant int NOT NULL,share_id bigint NOT NULL,purpose text NOT NULL CHECK(purpose='staff-availability'),
 chosen_recipients text[] NOT NULL,phase text NOT NULL DEFAULT 'pending' CHECK(phase IN('pending','claimed','failed','materialized','stopped')),
 claim_token text,available_for text,
 PRIMARY KEY(tenant,share_id,purpose),FOREIGN KEY(tenant,share_id) REFERENCES probe.shares(tenant,id) ON DELETE RESTRICT,
 CHECK((phase='claimed')=(claim_token IS NOT NULL)),CHECK((phase='materialized')=(available_for IS NOT NULL)),
 CHECK(phase<>'materialized' OR (cardinality(chosen_recipients)=1 AND available_for=chosen_recipients[1])));
CREATE TABLE probe.source_audit(tenant int NOT NULL,share_id bigint NOT NULL,action text NOT NULL CHECK(action='share-accepted'),PRIMARY KEY(tenant,share_id),FOREIGN KEY(tenant,share_id) REFERENCES probe.shares(tenant,id) ON DELETE RESTRICT);
CREATE TABLE probe.local_items(
 tenant int NOT NULL,share_id bigint NOT NULL,purpose text NOT NULL,recipient text NOT NULL,
 read_at timestamptz,archived_at timestamptz,
 PRIMARY KEY(tenant,share_id,purpose,recipient),
 FOREIGN KEY(tenant,share_id,purpose) REFERENCES probe.intents(tenant,share_id,purpose) ON DELETE RESTRICT);
ALTER TABLE probe.intents ADD FOREIGN KEY(tenant,share_id,purpose,available_for) REFERENCES probe.local_items(tenant,share_id,purpose,recipient) ON DELETE RESTRICT;
CREATE TABLE probe.recipient_gate(tenant int NOT NULL,recipient text NOT NULL,allowed bool NOT NULL,PRIMARY KEY(tenant,recipient));
INSERT INTO probe.recipient_gate VALUES(1,'synthetic-staff',true);
GRANT SELECT,UPDATE ON probe.sources TO sharer;
GRANT SELECT,INSERT ON probe.shares,probe.receipts,probe.intents,probe.source_audit TO sharer;
GRANT USAGE ON SEQUENCE probe.shares_id_seq TO sharer;
GRANT SELECT,UPDATE ON probe.intents TO projector;
GRANT SELECT,INSERT ON probe.local_items TO projector;
GRANT SELECT ON probe.recipient_gate TO projector;

CREATE FUNCTION probe.share(p_source int,p_revision int,p_notify bool,p_key text,p_fault text DEFAULT NULL,p_recipients text[] DEFAULT NULL) RETURNS bigint
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE src probe.sources%ROWTYPE; previous probe.receipts%ROWTYPE; accepted probe.shares%ROWTYPE; chosen text[];
BEGIN
 SELECT COALESCE(array_agg(recipient ORDER BY recipient),ARRAY[]::text[]) INTO chosen FROM(SELECT DISTINCT unnest(p_recipients) AS recipient)r;
 IF NOT p_notify THEN chosen=ARRAY[]::text[]; END IF;
 IF p_notify AND (cardinality(chosen)=0 OR array_position(chosen,NULL) IS NOT NULL) THEN RAISE EXCEPTION 'explicit recipients required' USING ERRCODE='22023'; END IF;
 SELECT * INTO STRICT src FROM probe.sources WHERE tenant=1 AND id=p_source FOR UPDATE;
 SELECT * INTO previous FROM probe.receipts WHERE tenant=1 AND actor=current_user AND command_key=p_key;
 IF FOUND THEN
   IF (previous.source_id,previous.source_revision,previous.notify_requested,previous.chosen_recipients) IS DISTINCT FROM (p_source,p_revision,p_notify,chosen) THEN
     RAISE EXCEPTION 'changed command meaning' USING ERRCODE='22023';
   END IF;
   RETURN previous.share_id;
 END IF;
 SELECT * INTO accepted FROM probe.shares WHERE tenant=1 AND source_id=p_source AND source_revision=p_revision;
 IF FOUND THEN
   IF (accepted.notify_requested,accepted.chosen_recipients) IS DISTINCT FROM (p_notify,chosen) THEN RAISE EXCEPTION 'changed existing transition meaning' USING ERRCODE='22023'; END IF;
 ELSE
   IF src.revision<>p_revision THEN RAISE EXCEPTION 'stale reviewed revision' USING ERRCODE='40001'; END IF;
   UPDATE probe.sources SET shared=true WHERE tenant=1 AND id=p_source;
   INSERT INTO probe.shares(tenant,source_id,source_revision,notify_requested,chosen_recipients) VALUES(1,p_source,p_revision,p_notify,chosen) RETURNING * INTO accepted;
   IF p_fault='audit' THEN RAISE EXCEPTION 'injected required audit failure' USING ERRCODE='P0001'; END IF;
   INSERT INTO probe.source_audit VALUES(1,accepted.id,'share-accepted');
   IF p_fault='before_intent' THEN RAISE EXCEPTION 'injected before intent' USING ERRCODE='P0001'; END IF;
   IF p_notify THEN INSERT INTO probe.intents(tenant,share_id,purpose,chosen_recipients) VALUES(1,accepted.id,'staff-availability',chosen); END IF;
 END IF;
 INSERT INTO probe.receipts VALUES(1,current_user,p_key,p_source,p_revision,p_notify,chosen,accepted.id);
 IF p_fault='after_intent' THEN RAISE EXCEPTION 'injected after intent and receipt' USING ERRCODE='P0001'; END IF;
 RETURN accepted.id;
END $$;
REVOKE ALL ON FUNCTION probe.share(int,int,bool,text,text,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.share(int,int,bool,text,text,text[]) TO sharer;

CREATE FUNCTION probe.claim(p_share bigint,p_token text) RETURNS int
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE n int;
BEGIN
 UPDATE probe.intents SET phase='claimed',claim_token=p_token WHERE tenant=1 AND share_id=p_share AND purpose='staff-availability' AND phase IN('pending','failed');
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END $$;
CREATE FUNCTION probe.materialize(p_share bigint,p_token text,p_fail bool DEFAULT false) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE item probe.intents%ROWTYPE; eligible bool;
BEGIN
 SELECT * INTO STRICT item FROM probe.intents WHERE tenant=1 AND share_id=p_share AND purpose='staff-availability' FOR UPDATE;
 IF item.phase<>'claimed' OR item.claim_token IS DISTINCT FROM p_token THEN RAISE EXCEPTION 'stale or absent claim' USING ERRCODE='22023'; END IF;
 IF cardinality(item.chosen_recipients)<>1 THEN RAISE EXCEPTION 'multi-recipient materialization outside this focused probe' USING ERRCODE='22023'; END IF;
 SELECT allowed INTO eligible FROM probe.recipient_gate WHERE tenant=1 AND recipient=item.chosen_recipients[1];
 IF eligible IS DISTINCT FROM true THEN
   UPDATE probe.intents SET phase='stopped',claim_token=NULL WHERE tenant=1 AND share_id=p_share;
   RETURN 'no-longer-eligible';
 END IF;
 INSERT INTO probe.local_items VALUES(1,p_share,'staff-availability',item.chosen_recipients[1],NULL,NULL) ON CONFLICT DO NOTHING;
 IF p_fail THEN RAISE EXCEPTION 'injected projector failure' USING ERRCODE='P0001'; END IF;
 UPDATE probe.intents SET phase='materialized',claim_token=NULL,available_for=item.chosen_recipients[1] WHERE tenant=1 AND share_id=p_share;
 RETURN 'available';
END $$;
REVOKE ALL ON FUNCTION probe.claim(bigint,text),probe.materialize(bigint,text,bool) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.claim(bigint,text),probe.materialize(bigint,text,bool) TO projector;

-- Deliberately unsafe counterexamples, isolated from the positive fixture.
CREATE TABLE probe.unsafe_source(id int PRIMARY KEY,shared bool NOT NULL);
INSERT INTO probe.unsafe_source VALUES(1,false);
CREATE TABLE probe.unsafe_notices(command_key text PRIMARY KEY,source_id int NOT NULL);
GRANT SELECT,UPDATE ON probe.unsafe_source TO sharer;
GRANT SELECT,INSERT ON probe.unsafe_notices TO sharer;
