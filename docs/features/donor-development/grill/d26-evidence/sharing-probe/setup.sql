-- D26 laboratory only. No Core roles, policies, identity claims or migration.
CREATE SCHEMA lab;
CREATE ROLE d26_fixture_editor NOLOGIN;
CREATE TABLE lab.weak_context(id int PRIMARY KEY);
CREATE TABLE lab.weak_acl(context_id int NOT NULL REFERENCES lab.weak_context,role_name name NOT NULL,
  PRIMARY KEY(context_id,role_name));
CREATE TABLE lab.weak_note(id int PRIMARY KEY,context_id int NOT NULL REFERENCES lab.weak_context,body text NOT NULL);
ALTER TABLE lab.weak_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.weak_note FORCE ROW LEVEL SECURITY;
CREATE POLICY weak_read ON lab.weak_note FOR SELECT TO d26_fixture_editor
  USING(EXISTS(SELECT 1 FROM lab.weak_acl a WHERE a.context_id=weak_note.context_id AND a.role_name=current_user));
CREATE POLICY weak_write ON lab.weak_note FOR UPDATE TO d26_fixture_editor
  USING(EXISTS(SELECT 1 FROM lab.weak_acl a WHERE a.context_id=weak_note.context_id AND a.role_name=current_user))
  WITH CHECK(EXISTS(SELECT 1 FROM lab.weak_acl a WHERE a.context_id=weak_note.context_id AND a.role_name=current_user));
GRANT USAGE ON SCHEMA lab TO d26_fixture_editor;
GRANT SELECT ON lab.weak_acl,lab.weak_context,lab.weak_note TO d26_fixture_editor;
GRANT UPDATE ON lab.weak_note TO d26_fixture_editor;
INSERT INTO lab.weak_context VALUES(1),(2);
INSERT INTO lab.weak_acl VALUES(1,'d26_fixture_editor'),(2,'d26_fixture_editor');
INSERT INTO lab.weak_note VALUES(1,1,'existing source A');

CREATE TABLE lab.context(scope_id int NOT NULL,id int NOT NULL,qualified boolean NOT NULL,
  shared_admission boolean NOT NULL,audience_generation int NOT NULL,
  PRIMARY KEY(scope_id,id));
CREATE TABLE lab.access(scope_id int NOT NULL,context_id int NOT NULL,actor_id int NOT NULL,
  can_read boolean NOT NULL,can_write boolean NOT NULL,
  PRIMARY KEY(scope_id,context_id,actor_id),
  FOREIGN KEY(scope_id,context_id) REFERENCES lab.context ON DELETE RESTRICT);
CREATE TABLE lab.encounter(scope_id int NOT NULL,context_id int NOT NULL,id int NOT NULL,share_eligible boolean NOT NULL,
  PRIMARY KEY(scope_id,context_id,id),
  FOREIGN KEY(scope_id,context_id) REFERENCES lab.context ON DELETE RESTRICT);
CREATE TABLE lab.note(scope_id int NOT NULL,id int NOT NULL,context_id int NOT NULL,encounter_id int NOT NULL,
  revision int NOT NULL,body text NOT NULL,
  PRIMARY KEY(scope_id,id),
  FOREIGN KEY(scope_id,context_id,encounter_id) REFERENCES lab.encounter ON DELETE RESTRICT);
CREATE TABLE lab.history(scope_id int NOT NULL,note_id int NOT NULL,revision int NOT NULL,
  context_id int NOT NULL,encounter_id int NOT NULL,audience_generation int NOT NULL,
  PRIMARY KEY(scope_id,note_id,revision),
  FOREIGN KEY(scope_id,note_id) REFERENCES lab.note ON DELETE RESTRICT);
CREATE TABLE lab.receipt(scope_id int NOT NULL,actor_id int NOT NULL,command_key text NOT NULL,
  intent jsonb NOT NULL,note_id int NOT NULL,result jsonb NOT NULL,
  PRIMARY KEY(scope_id,actor_id,command_key),
  FOREIGN KEY(scope_id,note_id) REFERENCES lab.note ON DELETE RESTRICT);

CREATE FUNCTION lab.save_shared(s int,c int,e int,n int,expected int,audience int,k text,body_text text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE ctx lab.context; permission lab.access; source lab.encounter; old_note lab.note;
  old_receipt lab.receipt; payload jsonb; result jsonb; next_revision int;
BEGIN
  IF s IS NULL OR c IS NULL OR e IS NULL OR n IS NULL OR expected IS NULL OR audience IS NULL
    OR expected<0 OR audience<1 OR k IS NULL OR k='' OR body_text IS NULL OR btrim(body_text)=''
    THEN RAISE EXCEPTION 'explicit source context and intent required' USING ERRCODE='22023'; END IF;
  -- Actor 1 is a fixed fixture actor, not client-controlled production identity.
  payload=jsonb_build_object('context',c,'encounter',e,'note',n,'expected_revision',expected,
    'audience_generation',audience,'body_sha256',encode(sha256(convert_to(body_text,'UTF8')),'hex'));
  SELECT * INTO ctx FROM lab.context WHERE scope_id=s AND id=c FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'context unavailable' USING ERRCODE='42501'; END IF;
  SELECT * INTO permission FROM lab.access WHERE scope_id=s AND context_id=c AND actor_id=1;
  SELECT * INTO source FROM lab.encounter WHERE scope_id=s AND context_id=c AND id=e;
  SELECT * INTO old_note FROM lab.note WHERE scope_id=s AND id=n FOR UPDATE;
  -- Fixed-origin old-row guard, not just a check on the proposed destination.
  IF old_note.id IS NOT NULL AND (old_note.context_id<>c OR old_note.encounter_id<>e)
    THEN RAISE EXCEPTION 'source scope is fixed' USING ERRCODE='23514'; END IF;
  IF permission.actor_id IS NULL OR NOT permission.can_read OR source.id IS NULL OR NOT source.share_eligible
    THEN RAISE EXCEPTION 'current source disclosure unavailable' USING ERRCODE='42501'; END IF;
  SELECT * INTO old_receipt FROM lab.receipt WHERE scope_id=s AND actor_id=1 AND command_key=k;
  IF FOUND THEN
    IF old_receipt.intent IS DISTINCT FROM payload THEN RAISE EXCEPTION 'same key changed intent' USING ERRCODE='23514'; END IF;
    -- The result holds identities/version only; even those require current disclosure.
    RETURN old_receipt.result;
  END IF;
  IF NOT permission.can_write OR NOT ctx.qualified OR NOT ctx.shared_admission
    THEN RAISE EXCEPTION 'shared admission unavailable' USING ERRCODE='42501'; END IF;
  IF audience<>ctx.audience_generation OR expected<>COALESCE(old_note.revision,0)
    THEN RAISE EXCEPTION 'source or audience changed' USING ERRCODE='40001'; END IF;
  next_revision=expected+1;
  INSERT INTO lab.note VALUES(s,n,c,e,next_revision,body_text)
    ON CONFLICT(scope_id,id) DO UPDATE SET revision=EXCLUDED.revision,body=EXCLUDED.body;
  INSERT INTO lab.history VALUES(s,n,next_revision,c,e,ctx.audience_generation);
  result=jsonb_build_object('note_id',n,'accepted_revision',next_revision,'context',c,'audience_generation',audience);
  INSERT INTO lab.receipt VALUES(s,1,k,payload,n,result);
  IF current_setting('lab.fail_evidence',true)='on'
    THEN RAISE EXCEPTION 'fixture late required-evidence failure' USING ERRCODE='23514'; END IF;
  RETURN result;
END $$;

CREATE FUNCTION lab.read_shared(s int,c int,n int) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE ctx lab.context; permission lab.access; current_note lab.note; source lab.encounter;
BEGIN
  SELECT * INTO ctx FROM lab.context WHERE scope_id=s AND id=c FOR SHARE;
  SELECT * INTO permission FROM lab.access WHERE scope_id=s AND context_id=c AND actor_id=1;
  SELECT * INTO current_note FROM lab.note WHERE scope_id=s AND id=n AND context_id=c;
  SELECT * INTO source FROM lab.encounter WHERE scope_id=s AND context_id=c AND id=current_note.encounter_id;
  IF ctx.id IS NULL OR permission.actor_id IS NULL OR NOT permission.can_read OR current_note.id IS NULL
    OR source.id IS NULL OR NOT source.share_eligible
    THEN RAISE EXCEPTION 'current disclosure unavailable' USING ERRCODE='42501'; END IF;
  RETURN current_note.body;
END $$;

CREATE FUNCTION lab.narrow_context(s int,c int) RETURNS int
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE next_generation int;
BEGIN
  -- All invalidation facts participate in the same fixture context fence.
  UPDATE lab.context SET audience_generation=audience_generation+1,shared_admission=false
    WHERE scope_id=s AND id=c RETURNING audience_generation INTO next_generation;
  UPDATE lab.access SET can_read=false,can_write=false WHERE scope_id=s AND context_id=c AND actor_id=1;
  RETURN next_generation;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA lab FROM PUBLIC;
REVOKE ALL ON lab.context,lab.access,lab.encounter,lab.note,lab.history,lab.receipt FROM PUBLIC,d26_fixture_editor;
INSERT INTO lab.context SELECT n,c,c<>3,true,1 FROM generate_series(1,6) n CROSS JOIN generate_series(1,3) c;
INSERT INTO lab.access SELECT n,c,1,true,true FROM generate_series(1,6) n CROSS JOIN generate_series(1,3) c;
INSERT INTO lab.encounter SELECT n,c,e,e<>2 FROM generate_series(1,6) n CROSS JOIN generate_series(1,3) c CROSS JOIN generate_series(1,2) e;
INSERT INTO lab.note SELECT n,1,1,1,1,'original lawful source content' FROM generate_series(1,6) n;
