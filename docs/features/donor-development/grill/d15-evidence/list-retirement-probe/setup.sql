-- Synthetic D15 mechanics only. Not a Core migration or authorization service.
CREATE SCHEMA lab;
CREATE TABLE lab.stage_list (
  tenant_id int NOT NULL, id int NOT NULL, accepts_new boolean NOT NULL,
  revision int NOT NULL DEFAULT 1, PRIMARY KEY(tenant_id,id)
);
CREATE TABLE lab.stage (
  tenant_id int NOT NULL, list_id int NOT NULL, id int NOT NULL,
  available boolean NOT NULL DEFAULT true,
  PRIMARY KEY(tenant_id,list_id,id),
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id)
);
CREATE TABLE lab.journey (
  tenant_id int NOT NULL, id int NOT NULL, list_id int NOT NULL,
  stage_id int, revision int NOT NULL DEFAULT 1,
  PRIMARY KEY(tenant_id,id),
  FOREIGN KEY(tenant_id,list_id) REFERENCES lab.stage_list(tenant_id,id),
  FOREIGN KEY(tenant_id,list_id,stage_id) REFERENCES lab.stage(tenant_id,list_id,id)
);
CREATE TABLE lab.stage_event (
  tenant_id int NOT NULL, journey_id int NOT NULL, revision int NOT NULL,
  old_stage int, new_stage int NOT NULL,
  PRIMARY KEY(tenant_id,journey_id,revision)
);
INSERT INTO lab.stage_list(tenant_id,id,accepts_new)
  SELECT 1,n,n NOT IN (4,7,8) FROM generate_series(1,8) n;
INSERT INTO lab.stage SELECT 1,l,s,true
  FROM generate_series(1,7) l CROSS JOIN generate_series(1,2) s;
INSERT INTO lab.journey(tenant_id,id,list_id,stage_id) VALUES
  (1,40,4,1),(1,41,4,NULL),(1,50,5,1),(1,60,6,1);

-- Whole-list retirement changes admission, not stage availability or history.
-- Every list in this fixture is retained usable for existing work; availability
-- does NOT depend on enumerating current journeys or the viewer's usage count.
CREATE FUNCTION lab.set_admission(t int,l int,new_value boolean) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM lab.stage_list WHERE tenant_id=t AND id=l FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'list missing' USING ERRCODE='23503'; END IF;
  IF new_value AND NOT EXISTS(SELECT 1 FROM lab.stage
      WHERE tenant_id=t AND list_id=l AND available) THEN
    RAISE EXCEPTION 'no available stage' USING ERRCODE='23514';
  END IF;
  UPDATE lab.stage_list SET accepts_new=new_value,revision=revision+1
    WHERE tenant_id=t AND id=l;
  RETURN 'list-changed';
END $$;

CREATE FUNCTION lab.admit(t int,l int,j int) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE allowed boolean;
BEGIN
  SELECT accepts_new INTO allowed FROM lab.stage_list
    WHERE tenant_id=t AND id=l FOR SHARE;
  IF NOT FOUND OR NOT allowed THEN
    RAISE EXCEPTION 'not available for new work' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM lab.stage WHERE tenant_id=t AND list_id=l AND available) THEN
    RAISE EXCEPTION 'no available stage' USING ERRCODE='23514';
  END IF;
  INSERT INTO lab.journey(tenant_id,id,list_id,stage_id) VALUES(t,j,l,NULL);
  RETURN 'admitted';
END $$;

CREATE FUNCTION lab.move_existing(t int,l int,j int,s int) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE old_value int; next_revision int;
BEGIN
  -- A shared list fence coordinates eligibility changes; accepts_new is not a
  -- requirement for a stage choice on a journey already referencing this list.
  PERFORM 1 FROM lab.stage_list WHERE tenant_id=t AND id=l FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'list missing' USING ERRCODE='23503'; END IF;
  SELECT stage_id,revision+1 INTO old_value,next_revision FROM lab.journey
    WHERE tenant_id=t AND id=j AND list_id=l FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'journey mismatch' USING ERRCODE='23503'; END IF;
  IF NOT EXISTS(SELECT 1 FROM lab.stage
      WHERE tenant_id=t AND list_id=l AND id=s AND available) THEN
    RAISE EXCEPTION 'stage unavailable' USING ERRCODE='23514';
  END IF;
  UPDATE lab.journey SET stage_id=s,revision=next_revision WHERE tenant_id=t AND id=j;
  INSERT INTO lab.stage_event VALUES(t,j,next_revision,old_value,s);
  RETURN 'stage-changed';
END $$;

CREATE FUNCTION lab.retire_stage(t int,l int,s int) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM lab.stage_list WHERE tenant_id=t AND id=l FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'list missing' USING ERRCODE='23503'; END IF;
  UPDATE lab.stage SET available=false WHERE tenant_id=t AND list_id=l AND id=s;
  IF NOT EXISTS(SELECT 1 FROM lab.stage WHERE tenant_id=t AND list_id=l AND available) THEN
    RAISE EXCEPTION 'retained list requires an available stage' USING ERRCODE='23514';
  END IF;
  RETURN 'stage-retired';
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
