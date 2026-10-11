-- Synthetic relational experiment, not Core/P27 schema or an authorized API.
-- All calls run as the isolated owner. No application authorization is modeled.
CREATE SCHEMA lab;
CREATE TABLE lab.stage (
  code text PRIMARY KEY,
  display_order integer NOT NULL UNIQUE,
  selectable boolean NOT NULL DEFAULT true
);
INSERT INTO lab.stage VALUES ('A',1,true),('B',2,true),('C',3,true),('D',4,true);
CREATE TABLE lab.journey (
  id integer PRIMARY KEY,
  stage_code text NOT NULL REFERENCES lab.stage(code),
  revision integer NOT NULL DEFAULT 0,
  entered_at timestamptz NOT NULL DEFAULT '2000-01-01T00:00:00Z'
);
INSERT INTO lab.journey(id,stage_code) SELECT n,'A' FROM generate_series(1,8) n;
CREATE TABLE lab.transition (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  journey_id integer NOT NULL REFERENCES lab.journey(id),
  from_code text NOT NULL REFERENCES lab.stage(code),
  to_code text NOT NULL REFERENCES lab.stage(code),
  accepted_revision integer NOT NULL,
  accepted_at timestamptz NOT NULL,
  effect_key text NOT NULL,
  UNIQUE (journey_id, effect_key),
  UNIQUE (journey_id, accepted_revision)
);
CREATE TABLE lab.receipt (
  journey_id integer NOT NULL REFERENCES lab.journey(id),
  effect_key text NOT NULL,
  expected_revision integer NOT NULL,
  target_code text NOT NULL,
  outcome jsonb NOT NULL,
  PRIMARY KEY(journey_id,effect_key)
);

-- One deliberately bounded sufficient mechanism: row lock, expected revision,
-- occurrence-key receipt, atomic history. API shape/error codes are not proposals.
CREATE FUNCTION lab.change_stage(
  p_journey integer, p_expected integer, p_target text, p_effect text
) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  current_row lab.journey%ROWTYPE;
  prior lab.receipt%ROWTYPE;
  result jsonb;
  transition_id bigint;
  accepted_time timestamptz;
  available boolean;
  previous_code text;
BEGIN
  IF p_effect IS NULL OR length(p_effect)=0 OR p_expected IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION 'Invalid synthetic intent' USING ERRCODE='22023';
  END IF;
  SELECT j.* INTO STRICT current_row FROM lab.journey j WHERE j.id=p_journey FOR UPDATE;
  SELECT r.* INTO prior FROM lab.receipt r WHERE r.journey_id=p_journey AND r.effect_key=p_effect;
  IF FOUND THEN
    IF prior.expected_revision<>p_expected OR prior.target_code<>p_target THEN
      RAISE EXCEPTION 'Effect key reused with different intent' USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('receipt',prior.outcome,'current',to_jsonb(current_row),'replayed',true);
  END IF;
  IF current_row.revision<>p_expected THEN
    RAISE EXCEPTION 'Stale expected revision' USING ERRCODE='P0001';
  END IF;
  -- Same-value retention is not a fresh entry; no transition or clock reset.
  IF current_row.stage_code=p_target THEN
    result=jsonb_build_object('kind','no_op','stage',p_target,'revision',current_row.revision);
  ELSE
    SELECT s.selectable INTO available FROM lab.stage s WHERE s.code=p_target FOR UPDATE;
    IF NOT FOUND OR NOT available THEN
      RAISE EXCEPTION 'Unavailable synthetic target' USING ERRCODE='22023';
    END IF;
    accepted_time=clock_timestamp();
    previous_code=current_row.stage_code;
    UPDATE lab.journey SET stage_code=p_target,revision=revision+1,entered_at=accepted_time
      WHERE id=p_journey RETURNING * INTO current_row;
    INSERT INTO lab.transition(journey_id,from_code,to_code,accepted_revision,accepted_at,effect_key)
      VALUES(p_journey,previous_code,p_target,current_row.revision,accepted_time,p_effect)
      RETURNING id INTO transition_id;
    result=jsonb_build_object('kind','changed','from',previous_code,'stage',p_target,
      'revision',current_row.revision,'transition_id',transition_id,'accepted_at',accepted_time);
  END IF;
  INSERT INTO lab.receipt VALUES(p_journey,p_effect,p_expected,p_target,result);
  RETURN jsonb_build_object('receipt',result,'current',to_jsonb(current_row),'replayed',false);
END;
$$;

-- Intentionally inadequate lifetime dedupe key: the experiment demonstrates
-- loss of a real second B visit, rather than endorsing this table.
CREATE TABLE lab.bad_history (
  journey_id integer NOT NULL,
  target_code text NOT NULL,
  effect_key text NOT NULL,
  UNIQUE(journey_id,target_code)
);
