-- SYNTHETIC HYPOTHESIS ONLY. No Core schema, P12 evaluator or application API.
CREATE SCHEMA probe;
CREATE ROLE missionary LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE staff LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE policy_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA probe TO missionary,staff,policy_manager,command_executor;

-- Represents a previously evaluated effective authority result, not individual grants.
-- revision tracks this contact-field/active-hat scope, not unrelated role changes.
CREATE TABLE probe.effective_authority (
  tenant int NOT NULL, actor name NOT NULL, active_hat text NOT NULL,
  revision int NOT NULL CHECK(revision>0), can_read boolean NOT NULL,
  allowed_fields text[] NOT NULL, PRIMARY KEY(tenant,actor)
);
CREATE TABLE probe.contacts (
  tenant int NOT NULL, id int NOT NULL, source_author name NOT NULL,
  name text NOT NULL CHECK(length(btrim(name))>0),
  phone text CHECK(length(phone)<=32), email text,
  revision int NOT NULL CHECK(revision>0), PRIMARY KEY(tenant,id)
);
CREATE TABLE probe.change_audit (
  tenant int NOT NULL, contact_id int NOT NULL, new_revision int NOT NULL,
  actor name NOT NULL, active_hat text NOT NULL, operation text NOT NULL,
  changed_fields text[] NOT NULL CHECK(cardinality(changed_fields)>0),
  PRIMARY KEY(tenant,contact_id,new_revision),
  UNIQUE(tenant,contact_id,new_revision,actor,operation),
  FOREIGN KEY(tenant,contact_id) REFERENCES probe.contacts(tenant,id)
);
CREATE TABLE probe.receipts (
  tenant int NOT NULL, actor name NOT NULL, active_hat text NOT NULL,
  operation text NOT NULL, contact_id int NOT NULL,
  expected_source int NOT NULL, expected_authority int NOT NULL,
  patch_digest text NOT NULL, applied_revision int NOT NULL,
  PRIMARY KEY(tenant,actor,operation),
  FOREIGN KEY(tenant,contact_id,applied_revision,actor,operation)
    REFERENCES probe.change_audit(tenant,contact_id,new_revision,actor,operation)
);
ALTER TABLE probe.effective_authority ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.change_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_authority ON probe.effective_authority TO missionary,staff,command_executor
  USING(tenant=1 AND actor=session_user);
CREATE POLICY manage_authority ON probe.effective_authority TO policy_manager USING(true);
CREATE POLICY readable_contact ON probe.contacts TO missionary,staff,command_executor
  USING(tenant=1 AND EXISTS(SELECT 1 FROM probe.effective_authority a
    WHERE a.tenant=contacts.tenant AND a.actor=session_user AND a.can_read));
CREATE POLICY own_audit ON probe.change_audit TO command_executor
  USING(tenant=1 AND actor=session_user);
CREATE POLICY own_receipt ON probe.receipts TO command_executor
  USING(tenant=1 AND actor=session_user);
GRANT SELECT ON probe.effective_authority,probe.contacts TO missionary,staff;
GRANT SELECT,UPDATE ON probe.effective_authority TO policy_manager,command_executor;
GRANT SELECT,UPDATE ON probe.contacts TO command_executor;
GRANT SELECT,INSERT ON probe.change_audit,probe.receipts TO command_executor;

CREATE FUNCTION probe.correct(p_id int,p_hat text,p_source int,p_authority int,p_operation text,p_patch jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE a probe.effective_authority%ROWTYPE; r probe.contacts%ROWTYPE;
  receipt probe.receipts%ROWTYPE; fingerprint text; fields_changed text[];
BEGIN
  IF p_id IS NULL OR p_hat IS NULL OR p_source IS NULL OR p_authority IS NULL
     OR p_operation IS NULL OR p_operation='' OR p_patch IS NULL
    THEN RETURN 'invalid'; END IF;
  IF jsonb_typeof(p_patch)<>'object' OR p_patch='{}'::jsonb THEN RETURN 'invalid'; END IF;
  SELECT * INTO a FROM probe.effective_authority
    WHERE tenant=1 AND actor=session_user FOR SHARE;
  IF NOT FOUND OR NOT a.can_read OR a.active_hat<>p_hat THEN RETURN 'unavailable'; END IF;
  -- Validate every submitted key before computing differences, including no-op fields.
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(p_patch) k
     WHERE k NOT IN('name','phone','email') OR NOT k=ANY(a.allowed_fields))
    THEN RETURN 'forbidden_fields'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_each(p_patch) e
     WHERE jsonb_typeof(e.value) NOT IN('string','null')) THEN RETURN 'invalid'; END IF;
  SELECT * INTO r FROM probe.contacts WHERE tenant=1 AND id=p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'unavailable'; END IF;
  fingerprint=encode(sha256(convert_to(p_patch::text,'UTF8')),'hex');
  SELECT * INTO receipt FROM probe.receipts
    WHERE tenant=1 AND actor=session_user AND operation=p_operation;
  IF FOUND THEN
    IF (receipt.active_hat,receipt.contact_id,receipt.expected_source,receipt.expected_authority,receipt.patch_digest)
       IS DISTINCT FROM(p_hat,p_id,p_source,p_authority,fingerprint)
      THEN RETURN 'operation_conflict'; END IF;
    RETURN 'accepted-history:'||receipt.applied_revision;
  END IF;
  IF a.revision<>p_authority THEN RETURN 'authority_conflict'; END IF;
  IF r.revision<>p_source THEN RETURN 'source_conflict'; END IF;
  SELECT array_agg(k ORDER BY k) INTO fields_changed FROM jsonb_object_keys(p_patch) k
    WHERE p_patch->k IS DISTINCT FROM to_jsonb(r)->k;
  IF fields_changed IS NULL THEN RETURN 'unchanged'; END IF;
  UPDATE probe.contacts SET
    name=CASE WHEN p_patch?'name' THEN p_patch->>'name' ELSE name END,
    phone=CASE WHEN p_patch?'phone' THEN p_patch->>'phone' ELSE phone END,
    email=CASE WHEN p_patch?'email' THEN p_patch->>'email' ELSE email END,
    revision=revision+1 WHERE tenant=1 AND id=p_id;
  INSERT INTO probe.change_audit VALUES(1,p_id,r.revision+1,session_user,p_hat,p_operation,fields_changed);
  INSERT INTO probe.receipts VALUES(1,session_user,p_hat,p_operation,p_id,p_source,p_authority,fingerprint,r.revision+1);
  RETURN 'accepted:'||(r.revision+1);
END $$;
ALTER FUNCTION probe.correct(int,text,int,int,text,jsonb) OWNER TO command_executor;
REVOKE ALL ON FUNCTION probe.correct(int,text,int,int,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.correct(int,text,int,int,text,jsonb) TO missionary,staff;

-- Fixture-only fault injection after source UPDATE; not an application facility.
CREATE FUNCTION probe.inject_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.operation='audit-fault' THEN
    RAISE EXCEPTION 'injected required audit failure' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER required_audit_fault BEFORE INSERT ON probe.change_audit
  FOR EACH ROW EXECUTE FUNCTION probe.inject_audit_failure();

INSERT INTO probe.effective_authority VALUES
  (1,'missionary','missionary',1,true,ARRAY['name','phone']),
  (1,'staff','staff',1,true,ARRAY['name','phone','email']);
INSERT INTO probe.contacts VALUES
  (1,1,'missionary','Synthetic One','phone-original','original@example.invalid',1),
  (1,2,'missionary','Synthetic Two','phone-original','original@example.invalid',1),
  (1,3,'missionary','Synthetic Three','phone-original','original@example.invalid',1);

-- Unsafe counterexample: row authorization is satisfied but column revoke cannot
-- subtract from a whole-table UPDATE grant. No application table is involved.
CREATE TABLE probe.unsafe_fields (
  tenant int NOT NULL,id int PRIMARY KEY,actor name NOT NULL,
  phone text,protected_classification text
);
ALTER TABLE probe.unsafe_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY same_row ON probe.unsafe_fields TO missionary
  USING(tenant=1 AND actor=session_user);
GRANT SELECT,UPDATE ON probe.unsafe_fields TO missionary;
REVOKE UPDATE(protected_classification) ON probe.unsafe_fields FROM missionary;
INSERT INTO probe.unsafe_fields VALUES(1,1,'missionary','unchanged','protected-original');
