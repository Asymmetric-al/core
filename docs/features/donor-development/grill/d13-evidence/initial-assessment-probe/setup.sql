-- Disposable D13 counterexamples and one sufficient mechanism, not Core schema.
-- No app role, P12 policy, ownership model, purpose key or public RPC is proposed.
CREATE SCHEMA lab;
CREATE TABLE lab.tenant (id integer PRIMARY KEY);
CREATE TABLE lab.entity (
  tenant_id integer NOT NULL REFERENCES lab.tenant(id),
  id integer NOT NULL,
  PRIMARY KEY (tenant_id,id)
);
CREATE TABLE lab.preset (
  tenant_id integer NOT NULL REFERENCES lab.tenant(id),
  code text NOT NULL,
  PRIMARY KEY (tenant_id,code)
);
CREATE TABLE lab.stage (
  tenant_id integer NOT NULL,
  preset_code text NOT NULL,
  code text NOT NULL,
  selectable boolean NOT NULL,
  PRIMARY KEY (tenant_id,preset_code,code),
  FOREIGN KEY (tenant_id,preset_code) REFERENCES lab.preset(tenant_id,code)
);
INSERT INTO lab.tenant VALUES (1),(2);
INSERT INTO lab.entity VALUES (1,10),(2,20);
INSERT INTO lab.preset VALUES (1,'p'),(2,'q');
INSERT INTO lab.stage VALUES (1,'p','A',true),(1,'p','B',true),
  (1,'p','R',false),(1,'p','H',true),(2,'q','Z',true);

-- MATCH SIMPLE alone cannot protect the parent scope when the stage is null.
CREATE TABLE lab.bad_simple (
  tenant_id integer NOT NULL,
  preset_code text NOT NULL,
  stage_code text,
  FOREIGN KEY (tenant_id,preset_code,stage_code)
    REFERENCES lab.stage(tenant_id,preset_code,code)
);
-- Nor is blanket MATCH FULL a fix for a legitimately optional stage.
CREATE TABLE lab.bad_full (
  tenant_id integer NOT NULL,
  preset_code text NOT NULL,
  stage_code text,
  FOREIGN KEY (tenant_id,preset_code,stage_code)
    REFERENCES lab.stage(tenant_id,preset_code,code) MATCH FULL
);
CREATE TABLE lab.journey (
  tenant_id integer NOT NULL,
  id integer NOT NULL,
  entity_id integer NOT NULL,
  preset_code text NOT NULL,
  stage_code text,
  revision integer NOT NULL DEFAULT 0,
  assessed_at timestamptz,
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,entity_id) REFERENCES lab.entity(tenant_id,id),
  FOREIGN KEY (tenant_id,preset_code) REFERENCES lab.preset(tenant_id,code),
  FOREIGN KEY (tenant_id,preset_code,stage_code)
    REFERENCES lab.stage(tenant_id,preset_code,code),
  CHECK ((stage_code IS NULL) = (assessed_at IS NULL))
);
INSERT INTO lab.journey(tenant_id,id,entity_id,preset_code,stage_code,assessed_at) VALUES
  (1,1,10,'p',NULL,NULL),
  (1,2,10,'p','A','2000-01-01T00:00:00Z'),
  (1,3,10,'p','R','2000-01-01T00:00:00Z'),
  (1,4,10,'p','H','2000-01-01T00:00:00Z'),
  (2,5,20,'q',NULL,NULL),
  (1,6,10,'p',NULL,NULL),
  (1,7,10,'p',NULL,NULL),
  (1,8,10,'p',NULL,NULL);
CREATE TABLE lab.transition (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id integer NOT NULL,
  journey_id integer NOT NULL,
  from_code text,
  to_code text NOT NULL,
  accepted_revision integer NOT NULL,
  accepted_at timestamptz NOT NULL,
  effect_key text NOT NULL,
  FOREIGN KEY (tenant_id,journey_id) REFERENCES lab.journey(tenant_id,id),
  UNIQUE (tenant_id,journey_id,effect_key),
  UNIQUE (tenant_id,journey_id,accepted_revision)
);
CREATE TABLE lab.receipt (
  tenant_id integer NOT NULL,
  journey_id integer NOT NULL,
  effect_key text NOT NULL,
  expected_revision integer,
  target_code text,
  outcome jsonb NOT NULL,
  PRIMARY KEY (tenant_id,journey_id,effect_key),
  FOREIGN KEY (tenant_id,journey_id) REFERENCES lab.journey(tenant_id,id)
);
-- A historical admission receipt, not a phantom stage-entered event.
INSERT INTO lab.receipt VALUES (1,1,'start-1',NULL,NULL,
  '{"kind":"started","stage":null,"revision":0}');

-- Intentionally small mutation fixture. Calls below run as isolated owner;
-- direct nonowner RLS checks are separate and do not qualify this as an API.
CREATE FUNCTION lab.assign_stage(
  p_journey integer, p_expected integer, p_target text, p_effect text
) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  j lab.journey%ROWTYPE;
  prior lab.receipt%ROWTYPE;
  outcome jsonb;
  previous_code text;
  accepted_time timestamptz;
  transition_id bigint;
  available boolean;
BEGIN
  IF p_expected IS NULL OR p_target IS NULL OR p_effect IS NULL OR length(p_effect)=0 THEN
    RAISE EXCEPTION 'Invalid synthetic assignment intent' USING ERRCODE='22023';
  END IF;
  SELECT * INTO STRICT j FROM lab.journey WHERE tenant_id=1 AND id=p_journey FOR UPDATE;
  SELECT * INTO prior FROM lab.receipt
    WHERE tenant_id=1 AND journey_id=p_journey AND effect_key=p_effect;
  IF FOUND THEN
    IF prior.expected_revision IS DISTINCT FROM p_expected OR prior.target_code IS DISTINCT FROM p_target THEN
      RAISE EXCEPTION 'Different intent under existing key' USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('receipt',prior.outcome,'current',to_jsonb(j),'replayed',true);
  END IF;
  IF j.revision<>p_expected THEN
    RAISE EXCEPTION 'Stale expected revision' USING ERRCODE='P0001';
  END IF;
  SELECT selectable INTO available FROM lab.stage
    WHERE tenant_id=j.tenant_id AND preset_code=j.preset_code AND code=p_target FOR UPDATE;
  IF NOT FOUND OR NOT available THEN
    RAISE EXCEPTION 'Unavailable synthetic target' USING ERRCODE='22023';
  END IF;
  IF j.stage_code IS NOT DISTINCT FROM p_target THEN
    RAISE EXCEPTION 'Outside bounded first-assignment experiment' USING ERRCODE='22023';
  END IF;
  previous_code=j.stage_code;
  accepted_time=clock_timestamp();
  UPDATE lab.journey SET stage_code=p_target,revision=revision+1,assessed_at=accepted_time
    WHERE tenant_id=1 AND id=p_journey RETURNING * INTO j;
  INSERT INTO lab.transition(tenant_id,journey_id,from_code,to_code,accepted_revision,accepted_at,effect_key)
    VALUES(1,p_journey,previous_code,p_target,j.revision,accepted_time,p_effect) RETURNING id INTO transition_id;
  outcome=jsonb_build_object('kind','assigned','from',previous_code,'stage',p_target,
    'revision',j.revision,'transition_id',transition_id,'accepted_at',accepted_time);
  INSERT INTO lab.receipt VALUES(1,p_journey,p_effect,p_expected,p_target,outcome);
  RETURN jsonb_build_object('receipt',outcome,'current',to_jsonb(j),'replayed',false);
END;
$$;
CREATE FUNCTION lab.replay_start(p_journey integer,p_effect text)
RETURNS jsonb LANGUAGE sql AS $$
  SELECT jsonb_build_object('receipt',r.outcome,'current',to_jsonb(j),'replayed',true)
  FROM lab.receipt r JOIN lab.journey j ON (j.tenant_id,j.id)=(r.tenant_id,r.journey_id)
  WHERE r.tenant_id=1 AND r.journey_id=p_journey AND r.effect_key=p_effect
    AND r.outcome->>'kind'='started';
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;

-- Simple fixed-tenant nonowner policy, not Supabase Auth or Core P12.
CREATE ROLE lab_member NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA lab TO lab_member;
GRANT SELECT,UPDATE ON lab.journey TO lab_member;
GRANT SELECT ON lab.stage TO lab_member;
ALTER TABLE lab.journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY fixed_tenant ON lab.journey FOR ALL TO lab_member USING (tenant_id=1);
ALTER TABLE lab.stage ENABLE ROW LEVEL SECURITY;
CREATE POLICY visible_stage ON lab.stage FOR SELECT TO lab_member USING (tenant_id=1 AND code<>'H');

-- An explicit failing-design counterexample: OR-null exposes tenant 2.
CREATE TABLE lab.bad_policy (tenant_id integer NOT NULL,id integer PRIMARY KEY,stage_code text);
INSERT INTO lab.bad_policy VALUES (1,1,NULL),(2,2,NULL),(2,3,'Z');
GRANT SELECT ON lab.bad_policy TO lab_member;
ALTER TABLE lab.bad_policy ENABLE ROW LEVEL SECURITY;
CREATE POLICY wrong_or ON lab.bad_policy TO lab_member USING (tenant_id=1 OR stage_code IS NULL);
