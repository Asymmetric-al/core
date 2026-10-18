#!/usr/bin/env python3
"""Disposable local PG mechanics; not an application implementation or migration."""
import hashlib
import json
import os
from pathlib import Path
import select
import subprocess
import time
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
NAME = 'phase28-d1-pg'
DOCKER = ['docker', '--host=unix:///var/run/docker.sock']
ENV = dict(os.environ)
for key in ['DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH']:
    ENV.pop(key, None)
RESULTS = []

def docker(args, **kwargs):
    return subprocess.run(DOCKER + args, env=ENV, capture_output=True, text=True, timeout=30, **kwargs)

def command(role='postgres', app='probe'):
    return DOCKER + ['exec', '-i', '-e', f'PGAPPNAME={app}', NAME, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-U', role, '-d', 'postgres']

def sql(query, role='postgres'):
    return subprocess.run(command(role), env=ENV, input=query, capture_output=True, text=True, timeout=20)

def check(name, query, expected=None, state=None, role='actor_a', counterexample=False):
    r = sql(query, role)
    ok = (r.returncode == 0 and r.stdout.strip() == expected) if state is None else (r.returncode != 0 and f'{state}:' in r.stderr)
    RESULTS.append(dict(name=name, role=role, counterexample=counterexample, sql=query, expected=expected, expected_sqlstate=state, exit_code=r.returncode, stdout=r.stdout.strip(), stderr=r.stderr.strip(), passed=ok))
    if not ok:
        raise AssertionError(f'{name}: {r.stdout!r} {r.stderr!r}')

def admin(query):
    r = sql(query)
    if r.returncode: raise RuntimeError(r.stderr)
    return r.stdout.strip()

class Session:
    def __init__(self, role, name):
        self.name = name
        self.p = subprocess.Popen(command(role, name), env=ENV, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        self.buffer = b''
        self.transcript = []
    def send(self, query):
        self.transcript.append({'sent':query})
        self.p.stdin.write((query+'\n').encode()); self.p.stdin.flush()
    def until(self, marker):
        end = time.monotonic()+10
        while marker.encode() not in self.buffer:
            remain=end-time.monotonic()
            if remain<=0: raise TimeoutError(self.name+': '+repr(self.buffer))
            if select.select([self.p.stdout], [], [], remain)[0]:
                chunk=os.read(self.p.stdout.fileno(),65536)
                if not chunk: raise RuntimeError(self.name+': '+repr(self.buffer))
                self.buffer+=chunk
        data=self.buffer.decode(); self.buffer=b''
        self.transcript.append({'received':data})
        return data
    def close(self):
        if self.p.poll() is None:
            self.send('ROLLBACK; \\q')
            self.p.communicate(timeout=10)

def blocked(name):
    end=time.monotonic()+10
    while time.monotonic()<end:
        evidence=admin("SELECT wait_event_type||':'||wait_event FROM pg_stat_activity WHERE application_name='"+name+"' AND wait_event_type='Lock';")
        if evidence: return evidence
        time.sleep(.05)
    raise AssertionError('No observed lock wait for '+name)

def concurrent(name, role1, q1, role2, q2, validate):
    first=Session(role1,name+'_first'); second=Session(role2,name+'_second')
    try:
        first.send('BEGIN; '+q1+" SELECT 'FIRST_READY';")
        first_output=first.until('FIRST_READY')
        second.send('BEGIN; '+q2+" SELECT 'SECOND_DONE'; COMMIT;")
        lock=blocked(second.name)
        first.send("COMMIT; SELECT 'FIRST_COMMITTED';")
        first.until('FIRST_COMMITTED')
        second_output=second.until('SECOND_DONE')
        # Confirm second COMMIT was actually processed before reading final state.
        second.send("SELECT 'SECOND_COMMITTED';")
        second.until('SECOND_COMMITTED')
        ok, outcome=validate(first_output,second_output)
        RESULTS.append(dict(name=name, passed=ok, actual_lock_wait=lock, first_role=role1, second_role=role2, first=first.transcript, second=second.transcript, outcome=outcome))
        if not ok: raise AssertionError(name+': '+repr(outcome))
    finally:
        first.close(); second.close()

def main():
    inspect=docker(['inspect', NAME, '--format', '{{json .HostConfig.NetworkMode}} {{json .NetworkSettings.Ports}} {{json .Mounts}}'])
    if inspect.returncode or not inspect.stdout.startswith('"none" {} '): raise RuntimeError('Expected isolated no-network/no-port container')
    (ROOT/'environment.json').write_text(json.dumps({'read_at':datetime.now(timezone.utc).isoformat(), 'container':NAME,'isolation':inspect.stdout.strip(),'server':admin('SELECT version();'),'image':docker(['image','inspect','postgres:17','--format','{{json .RepoDigests}}']).stdout.strip()},indent=2)+'\n')
    r=sql((ROOT/'setup.sql').read_text())
    if r.returncode: raise RuntimeError(r.stderr)
    (ROOT/'roles.json').write_text(admin("SELECT json_agg(t) FROM (SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolinherit FROM pg_roles WHERE rolname IN ('actor_a','actor_b','fixture_owner','bypass_actor','gate_executor','gate_manager') ORDER BY rolname)t;")+'\n')
    check('own_update_positive',"WITH changed AS (UPDATE probe.implicit_check SET value='edited' WHERE id=1 RETURNING id) SELECT count(*) FROM changed;",'1')
    check('implicit_with_check_denies_owner_transfer',"UPDATE probe.implicit_check SET owner_actor='actor_b' WHERE id=1;",state='42501')
    check('implicit_with_check_denies_tenant_transfer',"UPDATE probe.implicit_check SET tenant=2 WHERE id=1;",state='42501')
    check('implicit_policy_does_not_immutably_protect_unmentioned_classification',"UPDATE probe.implicit_check SET classification='shared' WHERE id=1; SELECT classification FROM probe.implicit_check WHERE id=1;",'shared',counterexample=True)
    check('overbroad_explicit_check_allows_owner_transfer',"UPDATE probe.broad_check SET owner_actor='actor_b' WHERE id=1; SELECT owner_actor FROM probe.broad_check WHERE id=1;",'actor_b',counterexample=True)
    check('permissive_policies_OR_widen_reads','SELECT count(*) FROM probe.or_policies;','3',counterexample=True)
    admin('CREATE POLICY strict_floor ON probe.or_policies AS RESTRICTIVE FOR SELECT TO actor_a USING(tenant=1 AND owner_actor=current_user);')
    check('restrictive_floor_intersects_permissive_union','SELECT count(*) FROM probe.or_policies;','1')
    check('table_owner_bypasses_enabled_RLS','SELECT count(*) FROM probe.owner_docs;','3',role='fixture_owner',counterexample=True)
    check('default_view_uses_bypassing_table_owner','SELECT count(*) FROM probe.owner_view;','3',counterexample=True)
    check('security_invoker_view_uses_actor_RLS','SELECT count(*) FROM probe.invoker_view;','1')
    admin('ALTER TABLE probe.owner_docs FORCE ROW LEVEL SECURITY;')
    check('FORCE_subjects_ordinary_owner_to_default_deny','SELECT count(*) FROM probe.owner_docs;','0',role='fixture_owner')
    check('FORCE_does_not_constrain_BYPASSRLS','SELECT count(*) FROM probe.owner_docs;','3',role='bypass_actor',counterexample=True)
    check('default_owner_view_now_subject_to_FORCED_RLS','SELECT count(*) FROM probe.owner_view;','0')
    check('superuser_owned_view_still_bypasses_FORCE','SELECT count(*) FROM probe.super_view;','3',counterexample=True)
    check('definer_function_owned_by_FORCED_table_owner_is_not_automatic_bypass','SELECT probe.owner_fn();','0')
    check('definer_function_owned_by_superuser_and_default_PUBLIC_execute_leaks','SELECT probe.super_fn();','3',counterexample=True)
    check('invoker_function_obeys_caller_RLS','SELECT probe.invoker_fn();','1')
    admin('REVOKE ALL ON FUNCTION probe.super_fn() FROM PUBLIC;')
    check('revoke_PUBLIC_execute_closes_ungranted_function','SELECT probe.super_fn();',state='42501')
    check('hidden_registry_read_is_empty','SELECT count(*) FROM probe.hidden_registry;','0')
    check('UNIQUE_reports_hidden_collision',"INSERT INTO probe.hidden_registry VALUES(42,1,'actor_a','synthetic-hidden@example.invalid');",state='23505',counterexample=True)
    check('noncolliding_registry_insert_succeeds',"INSERT INTO probe.hidden_registry VALUES(43,1,'actor_a','synthetic-new@example.invalid'); SELECT count(*) FROM probe.hidden_registry;",'1')
    check('single_column_FK_accepts_hidden_cross_tenant_parent','INSERT INTO probe.weak_child VALUES(1,1,41); SELECT count(*) FROM probe.weak_child;','1',counterexample=True)
    check('single_column_FK_distinguishes_missing_parent','INSERT INTO probe.weak_child VALUES(2,1,999);',state='23503',counterexample=True)
    check('composite_tenant_FK_rejects_cross_tenant_parent','INSERT INTO probe.strong_child VALUES(1,1,41);',state='23503')
    check('composite_tenant_FK_accepts_same_tenant_parent','INSERT INTO probe.strong_child VALUES(2,1,43); SELECT count(*) FROM probe.strong_child;','1')
    check('targeted_update_without_select_policy_returns_zero','WITH changed AS(UPDATE probe.no_select SET value=\'targeted\' WHERE id=1 RETURNING id) SELECT count(*) FROM changed;','0')
    check('blind_update_without_select_reference_can_still_update',"UPDATE probe.no_select SET value='blind';",'',counterexample=True)
    check('blind_update_effect_confirmed',"SELECT value FROM probe.no_select;",'blind',role='postgres',counterexample=True)
    concurrent('same_operation_once','actor_a',"SELECT probe.accept_once('same-op','alpha');",'actor_a',"SELECT probe.accept_once('same-op','alpha');",lambda a,b: (a.splitlines()[0]==b.splitlines()[0] and admin('SELECT count(*) FROM probe.effects;')=='1',{'first':a,'second':b,'effects':admin('SELECT count(*) FROM probe.effects;')}))
    check('same_operation_changed_payload_conflicts',"SELECT probe.accept_once('same-op','beta');",state='22023')
    concurrent('expected_revision_rechecks_after_lock','actor_a',"WITH c AS(UPDATE probe.revisions SET revision=revision+1,value='first' WHERE id=1 AND revision=1 RETURNING id) SELECT count(*) FROM c;",'actor_a',"WITH c AS(UPDATE probe.revisions SET revision=revision+1,value='second' WHERE id=1 AND revision=1 RETURNING id) SELECT count(*) FROM c;",lambda a,b:(a.startswith('1\n') and b.startswith('0\n'),{'first':a,'second':b,'final':admin('SELECT revision||\':\'||value FROM probe.revisions;')}))
    concurrent('revoke_first_fenced_write_denied','gate_manager',"UPDATE probe.write_gate SET allowed=false,revision=revision+1 WHERE actor='actor_a';",'actor_a',"SELECT probe.fenced_write('must not write');",lambda a,b:('denied' in b and admin('SELECT count(*) FROM probe.fenced_effects;')=='0',{'second':b,'effects':admin('SELECT count(*) FROM probe.fenced_effects;')}))
    admin("UPDATE probe.write_gate SET allowed=true,revision=revision+1 WHERE actor='actor_a';")
    concurrent('write_first_fences_later_revoke','actor_a',"SELECT probe.fenced_write('accepted before revoke');",'gate_manager',"UPDATE probe.write_gate SET allowed=false,revision=revision+1 WHERE actor='actor_a';",lambda a,b:('accepted' in a and admin('SELECT count(*) FROM probe.fenced_effects;')=='1',{'first':a,'effects':admin('SELECT count(*) FROM probe.fenced_effects;'),'gate':admin('SELECT allowed FROM probe.write_gate;')}))
    admin("UPDATE probe.write_gate SET allowed=true WHERE actor='actor_a';")
    stale=Session('actor_a','stale_check')
    try:
        stale.send("BEGIN; SELECT allowed FROM probe.write_gate; SELECT 'CHECKED';")
        before=stale.until('CHECKED')
        admin("UPDATE probe.write_gate SET allowed=false WHERE actor='actor_a';")
        stale.send("INSERT INTO probe.unsafe_effects VALUES(current_user,'write relying on earlier allowed result'); COMMIT; SELECT 'DONE';")
        after=stale.until('DONE')
        ok=before.startswith('t\n') and admin('SELECT count(*) FROM probe.unsafe_effects;')=='1' and admin('SELECT allowed FROM probe.write_gate;')=='f'
        RESULTS.append(dict(name='stale_precheck_without_fence_allows_write_after_revoke',counterexample=True,passed=ok,transcript=stale.transcript,final_effects=admin('SELECT count(*) FROM probe.unsafe_effects;'),final_allowed=admin('SELECT allowed FROM probe.write_gate;')))
        if not ok: raise AssertionError('stale-check counterexample failed')
    finally: stale.close()

if __name__=='__main__':
    failure=None
    try: main()
    except Exception as e: failure=repr(e)
    finally:
        (ROOT/'results.json').write_text(json.dumps({'recorded_at':datetime.now(timezone.utc).isoformat(),'scope':'synthetic PostgreSQL mechanics, not Core/Supabase/Auth/PostgREST/provider qualification','passed':sum(x['passed'] for x in RESULTS),'checks':len(RESULTS),'failure':failure,'source_sha256':{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py']},'results':RESULTS},indent=2)+'\n')
    print(json.dumps({'passed':sum(x['passed'] for x in RESULTS),'checks':len(RESULTS),'failure':failure}))
    if failure: raise SystemExit(1)
