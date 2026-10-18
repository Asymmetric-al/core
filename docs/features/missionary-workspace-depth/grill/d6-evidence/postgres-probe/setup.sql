-- PROVISIONAL SYNTHETIC LIFECYCLE HYPOTHESIS, NOT CORE/P6/P12 SCHEMA OR POLICY.
CREATE SCHEMA probe;
CREATE ROLE public_submit LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE public_lookup LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE withdrawal_authority LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE intent_writer LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA probe TO public_submit,public_lookup,policy_manager,withdrawal_authority,intent_writer,command_executor;
CREATE TABLE probe.purposes(tenant int,purpose text,intake_on boolean NOT NULL,purpose_allowed boolean NOT NULL,purpose_revision int NOT NULL,PRIMARY KEY(tenant,purpose));
CREATE TABLE probe.addresses(tenant int,address_key text,address_revision int NOT NULL,suppressed boolean NOT NULL,PRIMARY KEY(tenant,address_key));
CREATE TABLE probe.subscriptions(
 tenant int,purpose text,address_key text,address_revision int NOT NULL,generation int NOT NULL,
 state text NOT NULL CHECK(state IN('pending','confirmed','withdrawn')),consent_revision int NOT NULL,
 PRIMARY KEY(tenant,purpose,address_key),
 FOREIGN KEY(tenant,purpose) REFERENCES probe.purposes,
 FOREIGN KEY(tenant,address_key) REFERENCES probe.addresses
);
CREATE TABLE probe.attempts(
 tenant int,attempt text,purpose text NOT NULL,address_key text NOT NULL,address_revision int NOT NULL,
 generation int NOT NULL,accepted_revision int NOT NULL,purpose_revision int NOT NULL,token_hash bytea NOT NULL,expires_at timestamptz NOT NULL,
 PRIMARY KEY(tenant,attempt),UNIQUE(tenant,purpose,address_key,generation),UNIQUE(tenant,purpose,token_hash),
 UNIQUE(tenant,attempt,purpose,address_key,address_revision,generation),
 FOREIGN KEY(tenant,purpose,address_key) REFERENCES probe.subscriptions
);
CREATE TABLE probe.evidence(
 tenant int,purpose text,address_key text,generation int,
 kind text CHECK(kind IN('pending','confirmed','withdrawn')),
 PRIMARY KEY(tenant,purpose,address_key,generation,kind),
 FOREIGN KEY(tenant,purpose,address_key) REFERENCES probe.subscriptions
);
CREATE TABLE probe.confirmation_intents(
 tenant int,attempt text,purpose text NOT NULL,address_key text NOT NULL,address_revision int NOT NULL,
 generation int NOT NULL,fixture_token text NOT NULL,
 PRIMARY KEY(tenant,attempt),
 FOREIGN KEY(tenant,attempt,purpose,address_key,address_revision,generation)
 REFERENCES probe.attempts(tenant,attempt,purpose,address_key,address_revision,generation)
);
ALTER TABLE probe.purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.confirmation_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY scoped_command ON probe.purposes TO command_executor USING(tenant=1);
CREATE POLICY scoped_command ON probe.addresses TO command_executor USING(tenant=1);
CREATE POLICY scoped_command ON probe.subscriptions TO command_executor USING(tenant=1);
CREATE POLICY scoped_command ON probe.attempts TO command_executor USING(tenant=1);
CREATE POLICY scoped_command ON probe.evidence TO command_executor USING(tenant=1);
CREATE POLICY scoped_command ON probe.confirmation_intents TO command_executor USING(tenant=1);
CREATE POLICY scoped_manager ON probe.purposes TO policy_manager USING(tenant=1);
CREATE POLICY scoped_manager ON probe.addresses TO policy_manager USING(tenant=1);
CREATE POLICY scoped_intent_writer ON probe.confirmation_intents TO intent_writer USING(tenant=1);
GRANT SELECT,UPDATE ON probe.purposes,probe.addresses TO policy_manager,command_executor;
GRANT SELECT,INSERT,UPDATE ON probe.subscriptions TO command_executor;
GRANT SELECT,INSERT ON probe.attempts,probe.evidence,probe.confirmation_intents TO command_executor;
GRANT SELECT,INSERT ON probe.confirmation_intents TO intent_writer;
-- Narrow privileged test writer solely to exercise the composite FK on mutation.
GRANT UPDATE(purpose) ON probe.confirmation_intents TO intent_writer;

CREATE FUNCTION probe.intake(p_tenant int,p_purpose text,p_address text,p_address_revision int,p_attempt text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE gate probe.purposes%ROWTYPE; addr probe.addresses%ROWTYPE; s probe.subscriptions%ROWTYPE;
  next_gen int; next_revision int; secret text;
BEGIN
 IF p_tenant IS DISTINCT FROM 1 OR p_attempt IS NULL OR p_attempt='' THEN RETURN 'processed'; END IF;
 SELECT * INTO gate FROM probe.purposes WHERE tenant=p_tenant AND purpose=p_purpose FOR SHARE;
 IF NOT FOUND OR NOT gate.intake_on OR NOT gate.purpose_allowed THEN RETURN 'processed'; END IF;
 SELECT * INTO addr FROM probe.addresses WHERE tenant=p_tenant AND address_key=p_address FOR UPDATE;
 IF NOT FOUND OR addr.suppressed OR addr.address_revision IS DISTINCT FROM p_address_revision THEN RETURN 'processed'; END IF;
 -- The immutable accepted attempt is historical evidence, not renewed consent.
 PERFORM 1 FROM probe.attempts WHERE tenant=p_tenant AND attempt=p_attempt;
 IF FOUND THEN RETURN 'processed'; END IF;
 SELECT * INTO s FROM probe.subscriptions WHERE tenant=p_tenant AND purpose=p_purpose AND address_key=p_address FOR UPDATE;
 IF FOUND AND s.address_revision=p_address_revision AND s.state IN('pending','confirmed') AND EXISTS(
 SELECT 1 FROM probe.attempts a WHERE a.tenant=p_tenant AND a.purpose=p_purpose AND a.address_key=p_address
 AND a.generation=s.generation AND a.purpose_revision=gate.purpose_revision) THEN RETURN 'processed'; END IF;
 next_gen=COALESCE(s.generation,0)+1; next_revision=COALESCE(s.consent_revision,0)+1;
 INSERT INTO probe.subscriptions VALUES(p_tenant,p_purpose,p_address,p_address_revision,next_gen,'pending',next_revision)
 ON CONFLICT(tenant,purpose,address_key) DO UPDATE SET address_revision=EXCLUDED.address_revision,
 generation=EXCLUDED.generation,state='pending',consent_revision=EXCLUDED.consent_revision;
 -- Random UUID is only a fixture token; no production entropy/delivery contract.
 secret=gen_random_uuid()::text;
 INSERT INTO probe.attempts VALUES(p_tenant,p_attempt,p_purpose,p_address,p_address_revision,next_gen,next_revision,gate.purpose_revision,
 sha256(convert_to(secret,'UTF8')),clock_timestamp()+interval '1 hour');
 INSERT INTO probe.evidence VALUES(p_tenant,p_purpose,p_address,next_gen,'pending');
 INSERT INTO probe.confirmation_intents VALUES(p_tenant,p_attempt,p_purpose,p_address,p_address_revision,next_gen,secret);
 RETURN 'processed';
END $$;

-- This STABLE function is the read-only lookup analogy, not an HTTP router.
CREATE FUNCTION probe.lookup_get(p_tenant int,p_purpose text,p_token text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
BEGIN
 PERFORM 1 FROM probe.attempts WHERE tenant=p_tenant AND purpose=p_purpose AND token_hash=sha256(convert_to(p_token,'UTF8'));
 RETURN 'confirmation page';
END $$;

CREATE FUNCTION probe.confirm_post(p_tenant int,p_purpose text,p_token text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE gate probe.purposes%ROWTYPE; a probe.attempts%ROWTYPE; addr probe.addresses%ROWTYPE; s probe.subscriptions%ROWTYPE;
BEGIN
 IF p_tenant IS DISTINCT FROM 1 THEN RETURN 'processed'; END IF;
 SELECT * INTO gate FROM probe.purposes WHERE tenant=p_tenant AND purpose=p_purpose FOR SHARE;
 -- Public display/intake off deliberately is not purpose withdrawal in this hypothesis.
 IF NOT FOUND OR NOT gate.purpose_allowed THEN RETURN 'processed'; END IF;
 SELECT * INTO a FROM probe.attempts WHERE tenant=p_tenant AND purpose=p_purpose AND token_hash=sha256(convert_to(p_token,'UTF8'));
 IF NOT FOUND OR a.purpose_revision<>gate.purpose_revision THEN RETURN 'processed'; END IF;
 SELECT * INTO addr FROM probe.addresses WHERE tenant=a.tenant AND address_key=a.address_key FOR UPDATE;
 IF NOT FOUND OR addr.suppressed OR addr.address_revision<>a.address_revision THEN RETURN 'processed'; END IF;
 SELECT * INTO s FROM probe.subscriptions WHERE tenant=a.tenant AND purpose=a.purpose AND address_key=a.address_key FOR UPDATE;
 IF NOT FOUND OR s.state<>'pending' OR s.generation<>a.generation OR s.address_revision<>a.address_revision
 OR s.consent_revision<>a.accepted_revision OR a.expires_at<=clock_timestamp() THEN RETURN 'processed'; END IF;
 UPDATE probe.subscriptions SET state='confirmed',consent_revision=consent_revision+1
 WHERE tenant=a.tenant AND purpose=a.purpose AND address_key=a.address_key;
 INSERT INTO probe.evidence VALUES(a.tenant,a.purpose,a.address_key,a.generation,'confirmed');
 RETURN 'processed';
END $$;

-- Trusted source-withdrawal actor is a fixture assumption, not an unsubscribe token design.
CREATE FUNCTION probe.withdraw(p_tenant int,p_purpose text,p_address text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE s probe.subscriptions%ROWTYPE;
BEGIN
 IF p_tenant IS DISTINCT FROM 1 THEN RETURN 'processed'; END IF;
 PERFORM 1 FROM probe.purposes WHERE tenant=p_tenant AND purpose=p_purpose FOR SHARE;
 PERFORM 1 FROM probe.addresses WHERE tenant=p_tenant AND address_key=p_address FOR UPDATE;
 SELECT * INTO s FROM probe.subscriptions WHERE tenant=p_tenant AND purpose=p_purpose AND address_key=p_address FOR UPDATE;
 IF NOT FOUND OR s.state='withdrawn' THEN RETURN 'processed'; END IF;
 UPDATE probe.subscriptions SET state='withdrawn',consent_revision=consent_revision+1
 WHERE tenant=p_tenant AND purpose=p_purpose AND address_key=p_address;
 INSERT INTO probe.evidence VALUES(p_tenant,p_purpose,p_address,s.generation,'withdrawn');
 RETURN 'processed';
END $$;
ALTER FUNCTION probe.intake(int,text,text,int,text) OWNER TO command_executor;
ALTER FUNCTION probe.lookup_get(int,text,text) OWNER TO command_executor;
ALTER FUNCTION probe.confirm_post(int,text,text) OWNER TO command_executor;
ALTER FUNCTION probe.withdraw(int,text,text) OWNER TO command_executor;
REVOKE ALL ON FUNCTION probe.intake(int,text,text,int,text),probe.lookup_get(int,text,text),probe.confirm_post(int,text,text),probe.withdraw(int,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.intake(int,text,text,int,text),probe.confirm_post(int,text,text) TO public_submit;
GRANT EXECUTE ON FUNCTION probe.lookup_get(int,text,text) TO public_lookup;
GRANT EXECUTE ON FUNCTION probe.withdraw(int,text,text) TO withdrawal_authority;

CREATE FUNCTION probe.intent_fault() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.attempt='fault' THEN RAISE EXCEPTION 'synthetic confirmation intent failure' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER fixture_intent_fault BEFORE INSERT ON probe.confirmation_intents FOR EACH ROW EXECUTE FUNCTION probe.intent_fault();
INSERT INTO probe.purposes VALUES(1,'newsletter',true,true,1),(1,'other-purpose',true,true,1),(2,'newsletter',true,true,1);
INSERT INTO probe.addresses SELECT 1,'address-'||i,1,false FROM generate_series(1,12)i;
INSERT INTO probe.addresses VALUES(2,'tenant-two',1,false);
INSERT INTO probe.subscriptions VALUES(2,'newsletter','tenant-two',1,1,'pending',1);
INSERT INTO probe.attempts VALUES(2,'tenant-two-attempt','newsletter','tenant-two',1,1,1,1,sha256(convert_to('synthetic-tenant-two','UTF8')),now()+interval '1 hour');
INSERT INTO probe.confirmation_intents VALUES(2,'tenant-two-attempt','newsletter','tenant-two',1,1,'synthetic-tenant-two');
