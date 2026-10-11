-- D17 synthetic mechanics only. Not a Core migration, scope taxonomy or API.
CREATE SCHEMA lab;
CREATE TABLE lab.catalog_scope (
  tenant_id int NOT NULL, scope_id int NOT NULL,
  default_list_id int, revision int NOT NULL DEFAULT 1,
  PRIMARY KEY(tenant_id,scope_id)
);
CREATE TABLE lab.stage_list (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  accepts_new boolean NOT NULL DEFAULT true,
  PRIMARY KEY(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id) REFERENCES lab.catalog_scope(tenant_id,scope_id)
);
ALTER TABLE lab.catalog_scope ADD FOREIGN KEY(tenant_id,scope_id,default_list_id)
  REFERENCES lab.stage_list(tenant_id,scope_id,id);
CREATE TABLE lab.config_event (
  tenant_id int NOT NULL, scope_id int NOT NULL, revision int NOT NULL,
  intent_key text NOT NULL, payload jsonb NOT NULL, result jsonb NOT NULL,
  PRIMARY KEY(tenant_id,scope_id,revision)
);
CREATE TABLE lab.command_receipt (
  tenant_id int NOT NULL, scope_id int NOT NULL, intent_key text NOT NULL,
  payload jsonb NOT NULL, result jsonb NOT NULL,
  PRIMARY KEY(tenant_id,scope_id,intent_key)
);
CREATE TABLE lab.accepted_work (
  tenant_id int NOT NULL, scope_id int NOT NULL, id int NOT NULL,
  selected_list_id int NOT NULL,
  PRIMARY KEY(tenant_id,scope_id,id),
  FOREIGN KEY(tenant_id,scope_id,selected_list_id)
    REFERENCES lab.stage_list(tenant_id,scope_id,id)
);
INSERT INTO lab.catalog_scope(tenant_id,scope_id) SELECT 1,s FROM generate_series(1,6) s;
INSERT INTO lab.stage_list SELECT 1,s,s*10+n,true
  FROM generate_series(1,6) s CROSS JOIN generate_series(1,3) n;
UPDATE lab.catalog_scope SET default_list_id=11 WHERE scope_id=1;
UPDATE lab.catalog_scope SET default_list_id=41 WHERE scope_id=4;
UPDATE lab.catalog_scope SET default_list_id=51 WHERE scope_id=5;

-- A single fixture source boundary serializes optional default configuration and
-- list availability. Payload includes explicit matching-default removal intent.
-- No P12/tenant-principal authority is modeled; only isolated owner calls execute.
CREATE FUNCTION lab.configure(t int,s int,k text,op text,target int,
  expected_revision int,clear_matching_default boolean DEFAULT false) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE current_revision int; old_default int; accepted_payload jsonb;
  old_receipt lab.command_receipt; outcome jsonb; available boolean;
BEGIN
  accepted_payload=jsonb_build_object('operation',op,'target',target,
    'expected_revision',expected_revision,'clear_matching_default',clear_matching_default);
  SELECT revision,default_list_id INTO current_revision,old_default FROM lab.catalog_scope
    WHERE tenant_id=t AND scope_id=s FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'scope missing' USING ERRCODE='23503'; END IF;
  SELECT * INTO old_receipt FROM lab.command_receipt
    WHERE tenant_id=t AND scope_id=s AND intent_key=k;
  IF FOUND THEN
    IF old_receipt.payload<>accepted_payload THEN
      RAISE EXCEPTION 'intent payload conflict' USING ERRCODE='22023';
    END IF;
    RETURN old_receipt.result;
  END IF;
  IF current_revision<>expected_revision THEN
    RAISE EXCEPTION 'stale configuration' USING ERRCODE='40001';
  END IF;
  IF op='set_default' THEN
    IF target IS NOT NULL THEN
      SELECT accepts_new INTO available FROM lab.stage_list
        WHERE tenant_id=t AND scope_id=s AND id=target FOR SHARE;
      IF NOT FOUND OR NOT available THEN
        RAISE EXCEPTION 'default is not eligible' USING ERRCODE='23514';
      END IF;
    END IF;
    UPDATE lab.catalog_scope SET default_list_id=target WHERE tenant_id=t AND scope_id=s;
  ELSIF op='withdraw' THEN
    PERFORM 1 FROM lab.stage_list WHERE tenant_id=t AND scope_id=s AND id=target FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'list missing' USING ERRCODE='23503'; END IF;
    IF old_default=target AND NOT clear_matching_default THEN
      RAISE EXCEPTION 'matching default disposition required' USING ERRCODE='23514';
    END IF;
    UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=t AND scope_id=s AND id=target;
    IF old_default=target THEN
      UPDATE lab.catalog_scope SET default_list_id=NULL WHERE tenant_id=t AND scope_id=s;
    END IF;
  ELSIF op='restore' THEN
    UPDATE lab.stage_list SET accepts_new=true WHERE tenant_id=t AND scope_id=s AND id=target;
    IF NOT FOUND THEN RAISE EXCEPTION 'list missing' USING ERRCODE='23503'; END IF;
    -- Restoring eligibility never reinstates a former default.
  ELSE RAISE EXCEPTION 'operation unsupported' USING ERRCODE='22023';
  END IF;
  UPDATE lab.catalog_scope SET revision=revision+1 WHERE tenant_id=t AND scope_id=s;
  SELECT jsonb_build_object('revision',revision,'default_list_id',default_list_id)
    INTO outcome FROM lab.catalog_scope WHERE tenant_id=t AND scope_id=s;
  INSERT INTO lab.config_event VALUES(t,s,current_revision+1,k,accepted_payload,outcome);
  INSERT INTO lab.command_receipt VALUES(t,s,k,accepted_payload,outcome);
  RETURN outcome;
END $$;

-- Existing reviewed intent supplies an explicit ID. No default is resolved here.
CREATE FUNCTION lab.accept_selected(t int,s int,j int,selected int) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE allowed boolean;
BEGIN
  PERFORM 1 FROM lab.catalog_scope WHERE tenant_id=t AND scope_id=s FOR SHARE;
  SELECT accepts_new INTO allowed FROM lab.stage_list
    WHERE tenant_id=t AND scope_id=s AND id=selected FOR SHARE;
  IF NOT FOUND OR NOT allowed THEN
    RAISE EXCEPTION 'selected list unavailable' USING ERRCODE='23514';
  END IF;
  INSERT INTO lab.accepted_work VALUES(t,s,j,selected);
  RETURN 'accepted-selected';
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
