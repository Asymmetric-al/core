"""Synthetic R03 counterexamples and boundary tests. Never Core schema/provider proof."""
import json,pathlib,subprocess,time,uuid
OUT=pathlib.Path(__file__).resolve().parent
marker=str(uuid.uuid4()); name='codex-r03-review-'+marker[:8]; cid=None; sessions=[]; results={}; transcript=[]
def run(args,**kw): return subprocess.run(args,text=True,capture_output=True,check=True,**kw)
class Session:
 def __init__(self,app):
  self.p=subprocess.Popen(['docker','exec','-i',cid,'psql','-X','-qAt','-U','postgres','-v','ON_ERROR_STOP=1'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,bufsize=1)
  sessions.append(self); self.run("SET application_name='"+app+"'; SET statement_timeout='8s'; SET lock_timeout='6s';")
 def send(self,sql):
  token='END_'+uuid.uuid4().hex; transcript.append(sql)
  self.p.stdin.write(sql+'\n\\echo '+token+'\n');self.p.stdin.flush();return token
 def finish(self,token):
  lines=[]
  while True:
   line=self.p.stdout.readline()
   if not line: raise RuntimeError('Synthetic psql ended: '+' | '.join(lines))
   line=line.rstrip('\n')
   if line==token: return lines
   lines.append(line)
 def run(self,sql):return self.finish(self.send(sql))
 def scalar(self,sql):
  lines=self.run(sql)
  assert len(lines)==1,lines
  return lines[0]
def check(key,actual,expected):
 results[key]={'actual':actual,'expected':expected,'passed':actual==expected}
 assert actual==expected,(key,actual,expected)
def wait_lock(app,control):
 deadline=time.monotonic()+3
 while time.monotonic()<deadline:
  if control.scalar("SELECT EXISTS(SELECT FROM pg_stat_activity WHERE application_name='"+app+"' AND wait_event_type='Lock');")=='t':return True
  time.sleep(.03)
 return False
setup=r'''
CREATE TABLE fixture_methods(tenant text NOT NULL, entity text NOT NULL, id text NOT NULL, mask text NOT NULL, state text NOT NULL CHECK(state IN ('available','retiring','retired')), PRIMARY KEY(tenant,entity,id));
CREATE TABLE fixture_groups(tenant text NOT NULL,entity text NOT NULL,id text NOT NULL,subject text NOT NULL,method text NOT NULL,rev int NOT NULL CHECK(rev>0),amount bigint NOT NULL CHECK(amount>0),currency text NOT NULL, PRIMARY KEY(tenant,entity,id), FOREIGN KEY(tenant,entity,method) REFERENCES fixture_methods(tenant,entity,id) ON DELETE RESTRICT);
CREATE TABLE fixture_uses(tenant text NOT NULL,entity text NOT NULL,id text NOT NULL,method text NOT NULL,PRIMARY KEY(tenant,entity,id),FOREIGN KEY(tenant,entity,method) REFERENCES fixture_methods(tenant,entity,id) ON DELETE RESTRICT);
INSERT INTO fixture_methods VALUES ('a','e','old','1234','available'),('a','e','other','1234','available'),('b','e','old','1234','available'),('a','e','new1','5678','available'),('a','e','new2','9012','available');
INSERT INTO fixture_groups VALUES ('a','e','g1','donor','old',1,1000,'USD'),('a','e','g2','donor','other',1,2000,'USD'),('b','e','g3','donor','old',1,3000,'USD');
CREATE FUNCTION fixture_bind(t text,e text,m text,u text) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE s text;
BEGIN
 SELECT state INTO s FROM fixture_methods WHERE tenant=t AND entity=e AND id=m FOR UPDATE;
 IF s IS DISTINCT FROM 'available' THEN RETURN false; END IF;
 INSERT INTO fixture_uses VALUES(t,e,u,m); RETURN true;
END $$;
CREATE FUNCTION fixture_retire(t text,e text,m text) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE s text;
BEGIN
 SELECT state INTO s FROM fixture_methods WHERE tenant=t AND entity=e AND id=m FOR UPDATE;
 IF s IS DISTINCT FROM 'available' OR EXISTS(SELECT FROM fixture_uses WHERE tenant=t AND entity=e AND method=m) THEN RETURN false; END IF;
 UPDATE fixture_methods SET state='retired' WHERE tenant=t AND entity=e AND id=m; RETURN true;
END $$;
-- Synthetic provenance-only envelope, not a proposed Core migration or existing owner API.
CREATE TABLE fixture_requests(tenant text NOT NULL,entity text NOT NULL,id text NOT NULL,selection_hash text NOT NULL,PRIMARY KEY(tenant,entity,id));
CREATE TABLE fixture_children(tenant text NOT NULL,entity text NOT NULL,request text NOT NULL,group_id text NOT NULL,expected_rev int NOT NULL,status text NOT NULL CHECK(status IN ('accepted','confirmed','blocked')),PRIMARY KEY(tenant,entity,request,group_id),FOREIGN KEY(tenant,entity,request) REFERENCES fixture_requests(tenant,entity,id) ON DELETE RESTRICT,FOREIGN KEY(tenant,entity,group_id) REFERENCES fixture_groups(tenant,entity,id) ON DELETE RESTRICT);
CREATE TABLE fixture_effects(tenant text NOT NULL,entity text NOT NULL,request text NOT NULL,group_id text NOT NULL,effect text NOT NULL,PRIMARY KEY(tenant,entity,request,group_id,effect),FOREIGN KEY(tenant,entity,request,group_id) REFERENCES fixture_children(tenant,entity,request,group_id) ON DELETE RESTRICT);
CREATE FUNCTION fixture_reaccept(t text,e text,r text,h text) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE prior text;
BEGIN
 SELECT selection_hash INTO prior FROM fixture_requests WHERE tenant=t AND entity=e AND id=r FOR UPDATE;
 IF prior IS NULL THEN INSERT INTO fixture_requests VALUES(t,e,r,h); RETURN true; END IF;
 IF prior<>h THEN RAISE EXCEPTION 'same durable request identity has different selection'; END IF;
 RETURN false;
END $$;
CREATE FUNCTION fixture_immutable() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'immutable accepted selection';END$$;
CREATE TRIGGER fixture_request_immutable BEFORE UPDATE OR DELETE ON fixture_requests FOR EACH ROW EXECUTE FUNCTION fixture_immutable();
CREATE ROLE fixture_reader NOLOGIN;
GRANT USAGE ON SCHEMA public TO fixture_reader;
GRANT SELECT ON fixture_groups TO fixture_reader;
ALTER TABLE fixture_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_groups FORCE ROW LEVEL SECURITY;
CREATE POLICY fixture_read ON fixture_groups FOR SELECT TO fixture_reader USING (tenant='a' AND entity='e' AND subject='donor');
REVOKE ALL ON fixture_requests,fixture_children,fixture_effects FROM PUBLIC,fixture_reader;
'''
try:
 cid=run(['docker','run','--pull','never','--rm','-d','--network','none','--memory','256m','--name',name,'--label','codex.r03.review='+marker,'--tmpfs','/var/lib/postgresql/data:rw,size=128m','-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17-alpine']).stdout.strip()
 for _ in range(100):
  if subprocess.run(['docker','exec',cid,'pg_isready','-U','postgres'],capture_output=True).returncode==0:break
  time.sleep(.15)
 else:raise RuntimeError('Synthetic database startup failed')
 c=Session('r03_control');a=Session('r03_a');b=Session('r03_b');c.run(setup)
 check('mask_match_overselects_same_tenant',c.scalar("SELECT count(*) FROM fixture_groups g JOIN fixture_methods m ON(g.tenant,g.entity,g.method)=(m.tenant,m.entity,m.id) WHERE g.tenant='a' AND m.mask='1234';"),'2')
 check('exact_identity_selects_one_use',c.scalar("SELECT count(*) FROM fixture_groups WHERE tenant='a' AND entity='e' AND method='old';"),'1')
 check('cross_scope_fk_rejects',c.scalar("DO $$BEGIN BEGIN INSERT INTO fixture_uses VALUES('c','e','bad','old'); RAISE EXCEPTION 'unexpected FK success'; EXCEPTION WHEN foreign_key_violation THEN NULL;END;END$$; SELECT count(*) FROM fixture_uses WHERE id='bad';"),'0')
 c.run("INSERT INTO fixture_methods VALUES('a','e','naive','1111','available');")
 a.run('BEGIN;');check('naive_unused_check',a.scalar("SELECT count(*) FROM fixture_uses WHERE tenant='a' AND entity='e' AND method='naive';"),'0')
 b.run("INSERT INTO fixture_uses VALUES('a','e','arrived_late','naive');")
 a.run("UPDATE fixture_methods SET state='retired' WHERE tenant='a' AND entity='e' AND id='naive';COMMIT;")
 check('naive_check_then_retire_leaves_live_reference',c.scalar("SELECT count(*) FROM fixture_uses u JOIN fixture_methods m ON(u.tenant,u.entity,u.method)=(m.tenant,m.entity,m.id) WHERE m.id='naive' AND m.state='retired';"),'1')
 c.run("INSERT INTO fixture_methods VALUES('a','e','safe','2222','available');")
 a.run("BEGIN;SELECT state FROM fixture_methods WHERE tenant='a' AND entity='e' AND id='safe' FOR UPDATE;")
 token=b.send("SELECT fixture_bind('a','e','safe','blocked_use');")
 check('bind_waits_for_shared_retirement_fence',wait_lock('r03_b',c),True)
 check('retirement_admitted_without_uses',a.scalar("SELECT fixture_retire('a','e','safe');"),'t');a.run('COMMIT;')
 check('late_bind_rejected_after_retirement',b.finish(token),['f'])
 check('safe_retirement_has_zero_new_uses',c.scalar("SELECT count(*) FROM fixture_uses WHERE method='safe';"),'0')
 c.run("INSERT INTO fixture_methods VALUES('a','e','safe2','3333','available');")
 a.run('BEGIN;');check('new_use_admitted_first',a.scalar("SELECT fixture_bind('a','e','safe2','first_use');"),'t')
 token=b.send("SELECT fixture_retire('a','e','safe2');")
 check('retirement_waits_for_binding_fence',wait_lock('r03_b',c),True);a.run('COMMIT;')
 check('retirement_rejected_while_use_remains',b.finish(token),['f'])
 a.run('BEGIN;');check('first_replacement_cas',a.scalar("WITH x AS (UPDATE fixture_groups SET method='new1',rev=2 WHERE tenant='a' AND entity='e' AND id='g1' AND rev=1 RETURNING id) SELECT count(*) FROM x;"),'1')
 token=b.send("WITH x AS (UPDATE fixture_groups SET method='new2',rev=2 WHERE tenant='a' AND entity='e' AND id='g1' AND rev=1 RETURNING id) SELECT count(*) FROM x;")
 check('second_replacement_waits',wait_lock('r03_b',c),True);a.run('COMMIT;')
 check('stale_replacement_does_not_overwrite',b.finish(token),['0'])
 check('winning_binding_and_money_unchanged',c.scalar("SELECT method||':'||rev||':'||amount||':'||currency FROM fixture_groups WHERE tenant='a' AND entity='e' AND id='g1';"),'new1:2:1000:USD')
 c.run("DO $$BEGIN BEGIN INSERT INTO fixture_requests VALUES('a','e','broken','set1'); INSERT INTO fixture_children VALUES('a','e','broken','g1',2,'accepted'); RAISE EXCEPTION 'simulated crash during admission'; EXCEPTION WHEN raise_exception THEN NULL;END;END$$;")
 check('partial_admission_rolls_back',c.scalar("SELECT (SELECT count(*) FROM fixture_requests WHERE id='broken')+(SELECT count(*) FROM fixture_children WHERE request='broken');"),'0')
 c.run("BEGIN;INSERT INTO fixture_requests VALUES('a','e','accepted','g1+g2');INSERT INTO fixture_children VALUES('a','e','accepted','g1',2,'accepted'),('a','e','accepted','g2',1,'accepted');COMMIT;")
 c.run("INSERT INTO fixture_effects VALUES('a','e','accepted','g1','bind');UPDATE fixture_children SET status='confirmed' WHERE request='accepted' AND group_id='g1';")
 d=Session('r03_recovery')
 check('accepted_set_survives_partial_progress',d.scalar("SELECT string_agg(group_id||':'||status,',' ORDER BY group_id) FROM fixture_children WHERE tenant='a' AND entity='e' AND request='accepted';"),'g1:confirmed,g2:accepted')
 check('same_request_same_set_is_replay',d.scalar("SELECT fixture_reaccept('a','e','accepted','g1+g2');"),'f')
 check('same_request_changed_set_rejected',d.scalar("DO $$BEGIN BEGIN PERFORM fixture_reaccept('a','e','accepted','g1'); RAISE EXCEPTION 'unexpected changed-set success' USING ERRCODE='23514'; EXCEPTION WHEN raise_exception THEN NULL;END;END$$; SELECT selection_hash FROM fixture_requests WHERE id='accepted';"),'g1+g2')
 d.run("INSERT INTO fixture_effects VALUES('a','e','accepted','g1','bind') ON CONFLICT DO NOTHING;")
 check('durable_effect_not_duplicated',d.scalar("SELECT count(*) FROM fixture_effects WHERE request='accepted';"),'1')
 check('accepted_selection_immutable',d.scalar("DO $$BEGIN BEGIN UPDATE fixture_requests SET selection_hash='widened' WHERE id='accepted'; RAISE EXCEPTION 'unexpected mutation' USING ERRCODE='23514'; EXCEPTION WHEN raise_exception THEN NULL;END;END$$; SELECT selection_hash FROM fixture_requests WHERE id='accepted';"),'g1+g2')
 check('in_use_physical_delete_restricted',d.scalar("DO $$BEGIN BEGIN DELETE FROM fixture_methods WHERE tenant='a' AND entity='e' AND id='new1'; RAISE EXCEPTION 'unexpected deletion' USING ERRCODE='23514'; EXCEPTION WHEN foreign_key_violation THEN NULL;END;END$$;SELECT count(*) FROM fixture_methods WHERE tenant='a' AND entity='e' AND id='new1';"),'1')
 d.run('SET ROLE fixture_reader;')
 check('rls_hides_other_tenant',d.scalar("SELECT count(*) FROM fixture_groups WHERE tenant='b';"),'0')
 check('internal_journal_not_directly_readable',d.scalar("SELECT has_table_privilege(current_user,'fixture_requests','SELECT');"),'f')
 check('caller_cannot_mutate_binding',d.scalar("SELECT has_table_privilege(current_user,'fixture_groups','UPDATE');"),'f')
 version=c.scalar("SELECT current_setting('server_version');")
 payload={'scope':'synthetic isolated SQL only; not Core schema, authorization or provider acceptance proof','postgres_version':version,'assertions_passed':len(results),'results':results}
 (OUT/'postgres-results.json').write_text(json.dumps(payload,indent=2),encoding='utf-8')
 (OUT/'postgres-transcript.sql').write_text('-- Synthetic multi-session statements in send order. Transaction/session interleaving is implemented by the accompanying runner.\n\n'+'\n\n'.join(transcript),encoding='utf-8')
 print(json.dumps(payload))
finally:
 for s in sessions:
  if s.p.poll() is None:
   s.p.stdin.close()
   try:s.p.wait(timeout=2)
   except subprocess.TimeoutExpired:s.p.terminate()
 if cid:
  info=json.loads(run(['docker','inspect',cid]).stdout)[0]
  assert info['Config']['Labels'].get('codex.r03.review')==marker and info['Name']=='/'+name
  run(['docker','rm','-f',cid])
  print(json.dumps({'created_experiment_container_removed':True,'other_containers_untouched':True}))
