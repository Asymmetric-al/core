-- SYNTHETIC HYPOTHESIS ONLY: not Core schema, migration or lifecycle producer.
CREATE SCHEMA probe;
CREATE ROLE owner_a LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE outsider LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE gate_manager LOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE command_executor NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA probe TO owner_a, outsider, gate_manager, command_executor;

CREATE TABLE probe.gates (
  tenant int NOT NULL,
  actor name NOT NULL,
  allowed boolean NOT NULL,
  PRIMARY KEY (tenant, actor)
);
CREATE TABLE probe.records (
  tenant int NOT NULL,
  id int NOT NULL,
  actor name NOT NULL,
  canonical_key text NOT NULL,
  work_state text NOT NULL CHECK (work_state IN ('active', 'archived')),
  revision int NOT NULL CHECK (revision > 0),
  last_operation text,
  PRIMARY KEY (tenant, id),
  UNIQUE (tenant, canonical_key)
);
CREATE TABLE probe.receipts (
  tenant int NOT NULL,
  actor name NOT NULL,
  operation text NOT NULL,
  record_id int NOT NULL,
  target text NOT NULL,
  expected_revision int NOT NULL,
  undo_of text,
  applied_revision int NOT NULL,
  PRIMARY KEY (tenant, actor, operation),
  FOREIGN KEY (tenant, record_id) REFERENCES probe.records (tenant, id)
);
ALTER TABLE probe.gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_gate ON probe.gates TO owner_a, outsider, command_executor
  USING (tenant=1 AND actor=session_user);
CREATE POLICY manage_gate ON probe.gates TO gate_manager USING (true);
CREATE POLICY authorized_record ON probe.records TO owner_a, outsider, command_executor
  USING (tenant=1 AND actor=session_user AND EXISTS (
    SELECT 1 FROM probe.gates g WHERE g.tenant=records.tenant AND g.actor=session_user AND g.allowed
  ));
CREATE POLICY own_receipt ON probe.receipts TO command_executor
  USING (tenant=1 AND actor=session_user);
GRANT SELECT ON probe.gates, probe.records TO owner_a, outsider;
GRANT SELECT, UPDATE ON probe.gates TO gate_manager, command_executor;
GRANT SELECT, UPDATE ON probe.records TO command_executor;
GRANT SELECT, INSERT ON probe.receipts TO command_executor;
-- Only to exercise same-owner duplicate insertion mechanics, not admission design.
GRANT INSERT ON probe.records TO owner_a;

CREATE FUNCTION probe.move(p_id int, p_target text, p_expected int, p_operation text, p_undo_of text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,probe AS $$
DECLARE allowed_now boolean; r probe.records%ROWTYPE; receipt probe.receipts%ROWTYPE;
BEGIN
  IF p_id IS NULL OR p_target IS NULL OR p_expected IS NULL OR p_operation IS NULL OR p_operation=''
    THEN RETURN 'conflict'; END IF;
  -- All cooperating mutations lock authority before source, in the same order.
  SELECT allowed INTO allowed_now FROM probe.gates
    WHERE tenant=1 AND actor=session_user FOR SHARE;
  IF NOT FOUND OR NOT allowed_now THEN RETURN 'unavailable'; END IF;
  SELECT * INTO r FROM probe.records WHERE tenant=1 AND id=p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'unavailable'; END IF;
  SELECT * INTO receipt FROM probe.receipts
    WHERE tenant=1 AND actor=session_user AND operation=p_operation;
  IF FOUND THEN
    IF (receipt.record_id,receipt.target,receipt.expected_revision,receipt.undo_of)
       IS DISTINCT FROM (p_id,p_target,p_expected,p_undo_of) THEN RETURN 'conflict'; END IF;
    -- A historical acceptance is not a command to apply the old effect again.
    RETURN 'replay';
  END IF;
  IF r.revision<>p_expected OR p_target NOT IN ('active','archived') THEN RETURN 'conflict'; END IF;
  IF p_undo_of IS NOT NULL AND
    (p_target<>'active' OR r.work_state<>'archived' OR r.last_operation IS DISTINCT FROM p_undo_of)
    THEN RETURN 'conflict'; END IF;
  IF r.work_state=p_target THEN RETURN 'unchanged'; END IF;
  UPDATE probe.records SET work_state=p_target,revision=revision+1,last_operation=p_operation
    WHERE tenant=1 AND id=p_id;
  INSERT INTO probe.receipts VALUES(1,session_user,p_operation,p_id,p_target,p_expected,p_undo_of,r.revision+1);
  RETURN 'applied';
END $$;
ALTER FUNCTION probe.move(int,text,int,text,text) OWNER TO command_executor;
REVOKE ALL ON FUNCTION probe.move(int,text,int,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION probe.move(int,text,int,text,text) TO owner_a, outsider;

INSERT INTO probe.gates VALUES(1,'owner_a',true),(1,'outsider',true);
INSERT INTO probe.records VALUES
  (1,1,'owner_a','synthetic-source-1','active',1,NULL),
  (1,2,'owner_a','synthetic-source-2','active',1,NULL),
  (1,3,'owner_a','synthetic-source-3','active',1,NULL);

-- Deliberately unsafe identity model used only for the counterexample.
CREATE TABLE probe.unsafe_active_only (
  id int PRIMARY KEY,
  tenant int NOT NULL,
  canonical_key text NOT NULL,
  work_state text NOT NULL CHECK(work_state IN ('active','archived'))
);
CREATE UNIQUE INDEX unsafe_identity_only_when_active
  ON probe.unsafe_active_only(tenant,canonical_key) WHERE work_state='active';
GRANT SELECT, INSERT, UPDATE ON probe.unsafe_active_only TO owner_a;
