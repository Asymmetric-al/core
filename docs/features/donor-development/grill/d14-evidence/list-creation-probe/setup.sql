-- D14 disposable mechanism experiment. Not Core schema, lifecycle or an API.
CREATE SCHEMA lab;
CREATE TABLE lab.tenant (id integer PRIMARY KEY);
INSERT INTO lab.tenant VALUES (1),(2);
CREATE TABLE lab.stage_list (
  tenant_id integer NOT NULL REFERENCES lab.tenant(id),
  id bigint GENERATED ALWAYS AS IDENTITY,
  label text NOT NULL,
  PRIMARY KEY(tenant_id,id)
);
CREATE TABLE lab.stage (
  tenant_id integer NOT NULL,
  list_id bigint NOT NULL,
  id bigint GENERATED ALWAYS AS IDENTITY,
  label text NOT NULL,
  display_order integer NOT NULL,
  PRIMARY KEY(tenant_id,list_id,id),
  UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id)
);
INSERT INTO lab.stage_list(tenant_id,label) VALUES(1,'Shared'),(1,'Additional'),(2,'Other tenant');
INSERT INTO lab.stage(tenant_id,list_id,label,display_order) VALUES
  (1,1,'Engaged',1),(1,2,'Engaged',1),(2,3,'Engaged',1);
CREATE TABLE lab.journey (
  tenant_id integer NOT NULL,
  id integer NOT NULL,
  list_id bigint NOT NULL,
  stage_id bigint,
  revision integer NOT NULL,
  PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id),
  FOREIGN KEY(tenant_id,list_id,stage_id) REFERENCES lab.stage(tenant_id,list_id,id)
);
INSERT INTO lab.journey VALUES(1,1,1,1,1),(1,2,2,2,1);
CREATE TABLE lab.journey_event (
  tenant_id integer NOT NULL,
  journey_id integer NOT NULL,
  description text NOT NULL,
  FOREIGN KEY(tenant_id,journey_id) REFERENCES lab.journey(tenant_id,id)
);
INSERT INTO lab.journey_event VALUES(1,1,'Existing source history'),(1,2,'Other source history');

-- Deliberately insufficient: each FK is valid, but they allow the wrong list.
CREATE TABLE lab.bad_journey (
  tenant_id integer NOT NULL,
  list_id bigint NOT NULL,
  stage_id bigint NOT NULL,
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id),
  FOREIGN KEY(tenant_id,stage_id) REFERENCES lab.stage(tenant_id,id)
);
-- Deliberately insufficient: a label is not a create-command identity.
CREATE TABLE lab.bad_name_key (
  tenant_id integer NOT NULL,
  label text NOT NULL,
  creation_intent text NOT NULL,
  PRIMARY KEY(tenant_id,label)
);
CREATE TABLE lab.creation_receipt (
  tenant_id integer NOT NULL REFERENCES lab.tenant(id),
  effect_key text NOT NULL,
  intent jsonb NOT NULL,
  outcome jsonb,
  PRIMARY KEY(tenant_id,effect_key)
);
CREATE TABLE lab.configuration_event (
  tenant_id integer NOT NULL,
  list_id bigint NOT NULL,
  effect_key text NOT NULL,
  snapshot jsonb NOT NULL,
  PRIMARY KEY(tenant_id,list_id),
  UNIQUE(tenant_id,effect_key),
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id)
);

-- Only creation is modeled, not drafts/apply/retirement/copy/switch/approval.
-- The receipt claim and all new records commit in one transaction.
CREATE FUNCTION lab.create_list(p_tenant integer,p_effect text,p_label text,p_stages text[])
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  intended jsonb;
  prior lab.creation_receipt%ROWTYPE;
  inserted integer;
  new_list bigint;
  stage_rows jsonb;
  result jsonb;
BEGIN
  IF p_tenant IS NULL OR p_effect IS NULL OR length(p_effect)=0 OR p_label IS NULL
     OR length(p_label)=0 OR coalesce(cardinality(p_stages),0)=0 THEN
    RAISE EXCEPTION 'Invalid bounded fixture intent' USING ERRCODE='22023';
  END IF;
  intended=jsonb_build_object('label',p_label,'stages',p_stages);
  INSERT INTO lab.creation_receipt(tenant_id,effect_key,intent) VALUES(p_tenant,p_effect,intended)
    ON CONFLICT(tenant_id,effect_key) DO NOTHING;
  GET DIAGNOSTICS inserted=ROW_COUNT;
  IF inserted=0 THEN
    SELECT * INTO STRICT prior FROM lab.creation_receipt
      WHERE tenant_id=p_tenant AND effect_key=p_effect FOR UPDATE;
    IF prior.intent IS DISTINCT FROM intended THEN
      RAISE EXCEPTION 'Different create intent under existing key' USING ERRCODE='22023';
    END IF;
    IF prior.outcome IS NULL THEN
      RAISE EXCEPTION 'Incomplete fixture receipt' USING ERRCODE='P0001';
    END IF;
    RETURN jsonb_build_object('receipt',prior.outcome,'replayed',true);
  END IF;
  INSERT INTO lab.stage_list(tenant_id,label) VALUES(p_tenant,p_label) RETURNING id INTO new_list;
  INSERT INTO lab.stage(tenant_id,list_id,label,display_order)
    SELECT p_tenant,new_list,label,ordinal::integer FROM unnest(p_stages) WITH ORDINALITY s(label,ordinal);
  SELECT jsonb_agg(jsonb_build_object('id',id,'label',label,'order',display_order) ORDER BY display_order)
    INTO stage_rows FROM lab.stage WHERE tenant_id=p_tenant AND list_id=new_list;
  result=jsonb_build_object('tenant_id',p_tenant,'list_id',new_list,'label',p_label,'stages',stage_rows);
  INSERT INTO lab.configuration_event VALUES(p_tenant,new_list,p_effect,result);
  UPDATE lab.creation_receipt SET outcome=result WHERE tenant_id=p_tenant AND effect_key=p_effect;
  RETURN jsonb_build_object('receipt',result,'replayed',false);
END;
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;

-- Deliberately separate metadata privilege example, not Core P12.
CREATE ROLE lab_config NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA lab TO lab_config;
GRANT SELECT,UPDATE ON lab.stage_list TO lab_config;
ALTER TABLE lab.stage_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY config_tenant ON lab.stage_list TO lab_config USING(tenant_id=1);
-- No journey, stage, receipt, history or function grants to lab_config.
