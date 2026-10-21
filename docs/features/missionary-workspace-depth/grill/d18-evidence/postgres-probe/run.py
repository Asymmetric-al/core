#!/usr/bin/env python3
"""Disposable D18 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
import hashlib
import importlib.util
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
HELPER = ROOT.parents[1] / 'd1-evidence/postgres-probe/run.py'
spec = importlib.util.spec_from_file_location('d1_harness', HELPER)
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
h.NAME = 'phase28-d18-pg'
h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'
FIXTURE_STEPS = []


def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')


def fixture(query, role='postgres'):
    result = h.sql(query, role)
    FIXTURE_STEPS.append(dict(role=role, sql=query, exit_code=result.returncode, stdout=result.stdout.strip(), stderr=result.stderr.strip()))
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def check(name, query, expected=None, state=None, role='missionary_a', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)



def lit(value):
    if value is None:return 'NULL'
    if isinstance(value,int):return str(value)
    return "'"+str(value).replace("'","''")+"'"


def draft(ident,actor='missionary_a',purpose='newsletter',tenant=1):
    fixture(f"BEGIN; INSERT INTO probe.drafts VALUES({tenant},{ident},{lit(actor)},{lit(purpose)},1); INSERT INTO probe.versions VALUES({tenant},{ident},1,'Synthetic original text'); COMMIT;")


def request(ident,key,voice='neutral',binding=1,rev=1):
    return f'SELECT probe.request_ai({ident},{rev},{lit(key)},{lit(voice)},{binding});'


def reserve(ident,key,role='missionary_a',binding=1):
    value=fixture(request(ident,key,binding=binding),role)
    assert value.startswith('reserved:'),value
    return int(value.split(':')[1])


def ready(ident,ttl=3600):
    assert fixture(f"SELECT probe.observe_result({ident},'dispatch');",'provider_worker')=='dispatched'
    assert fixture(f"SELECT probe.observe_result({ident},'ready',{ttl});",'provider_worker')=='ready'


def prepared(ident,ttl=3600):
    draft(ident);n=reserve(ident,'intent-'+str(ident));ready(n,ttl);return n


def apply(n,key='use',rev=1,digest=None):
    return f'SELECT probe.apply_suggestion({n},{rev},{lit(digest or "synthetic-digest-"+str(n))},{lit(key)});'


def counts():
    return h.admin("SELECT (SELECT count(*) FROM probe.invocations)||':'||(SELECT coalesce(sum(held),0) FROM probe.tenant_budget)||':'||(SELECT count(*) FROM probe.versions)||':'||(SELECT count(*) FROM probe.applications)||':'||(SELECT count(*) FROM probe.bodies)||':'||(SELECT count(*) FROM probe.evidence)||':'||(SELECT count(*) FROM probe.send_sentinel);")


def unchanged(before):
    after=counts();h.RESULTS[-1]['counts']=dict(before=before,after=after)
    if before!=after:h.RESULTS[-1]['passed']=False;raise AssertionError('Unexpected durable change')


def gate(value):
    return f"UPDATE probe.gates SET allowed={str(value).lower()},revision=revision+1 WHERE tenant=1 AND actor='missionary_a' AND purpose='newsletter';"


def race(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def expired_while_waiting():
    from concurrent.futures import ThreadPoolExecutor
    n=prepared(30,ttl=2)
    first=h.Session('missionary_a','expiry_target_holder')
    try:
        first.send("BEGIN; SELECT probe.manual_edit(30,1); SELECT 'FIRST_READY';");first.until('FIRST_READY')
        with ThreadPoolExecutor(max_workers=1) as pool:
            pending=pool.submit(h.subprocess.run,h.command('missionary_a','expiry_apply_waiter'),env=h.ENV,input=apply(n),capture_output=True,text=True,timeout=20)
            observed=h.blocked('expiry_apply_waiter');time.sleep(2.1)
            first.send("COMMIT; SELECT 'FIRST_COMMITTED';");first.until('FIRST_COMMITTED')
            result=pending.result()
        applications=h.admin(f'SELECT count(*) FROM probe.applications WHERE invocation={n};')
        head=h.admin('SELECT head FROM probe.drafts WHERE id=30;')
        ok=result.returncode==0 and result.stdout.strip()=='expired' and applications=='0' and head=='2'
        h.RESULTS.append(dict(name='expiry_during_target_wait_prevents_application',passed=ok,actual_lock_wait=observed,first_role='missionary_a',second_role='missionary_a',first=first.transcript,second_sql=apply(n),exit_code=result.returncode,stdout=result.stdout.strip(),stderr=result.stderr.strip(),application_count=applications,head=head))
        if not ok:raise AssertionError('Expiry race')
    finally:first.close()


def scenarios():
    draft(1)
    check('request_pins_source_binding_and_reserves_atomically',request(1,'first'),'reserved:1')
    assert h.admin("SELECT i.actor||':'||i.purpose||':'||i.source_revision||':'||b.credential_revision||':'||i.reserved||':'||tb.held||':'||pb.held FROM probe.invocations i JOIN probe.bindings b ON(b.tenant,b.id)=(i.tenant,i.binding) JOIN probe.tenant_budget tb ON tb.tenant=i.tenant JOIN probe.purpose_budget pb ON(pb.tenant,pb.purpose)=(i.tenant,i.purpose);")=='missionary_a:newsletter:1:101:60:60:60'
    before=counts();check('same_intent_retry_does_not_reserve_twice',request(1,'first'),'receipt:1');unchanged(before)
    check('same_intent_changed_voice_conflicts',request(1,'first','warm'),'conflict')
    check('other_actor_cannot_retrieve_request_receipt',request(1,'first'),'unavailable',role='missionary_b')
    check('wrong_purpose_binding_not_substituted',request(1,'wrong-purpose',binding=2),'unavailable')
    check('tenant_binding_FK_rejects_cross_tenant_route',"INSERT INTO probe.routes VALUES(2,'profile',2,true,1);",state='23503',role='postgres')
    check('immutable_binding_cannot_replace_credential',"UPDATE probe.bindings SET credential_revision=999 WHERE tenant=1 AND id=1;",state='55000',role='postgres')
    check('ordinary_actor_has_no_raw_suggestion_body_read','SELECT * FROM probe.bodies;',state='42501')
    check('ordinary_actor_cannot_relabel_invocation',"UPDATE probe.invocations SET actor='missionary_b' WHERE id=1;",state='42501')
    fixture("SELECT probe.observe_result(1,'dispatch');",'provider_worker')
    check('ready_result_keeps_original_draft_unchanged',"SELECT probe.observe_result(1,'ready');",'ready',role='provider_worker')
    assert h.admin("SELECT head||':'||(SELECT count(*) FROM probe.applications)||':'||(SELECT count(*) FROM probe.send_sentinel) FROM probe.drafts WHERE id=1;")=='1:0:0'
    check('owner_can_compare_private_live_suggestion','SELECT probe.read_suggestion(1);','body:Synthetic suggested text 1')
    check('other_actor_cannot_read_private_suggestion','SELECT probe.read_suggestion(1);','unavailable',role='missionary_b')
    check('other_tenant_cannot_read_or_apply_suggestion','SELECT probe.read_suggestion(1); '+apply(1),'unavailable\nunavailable',role='other_tenant')
    before=counts();check('missing_meaning_cannot_bypass_request_or_apply_checks',"SELECT probe.request_ai(1,1,'first',NULL,1); SELECT probe.apply_suggestion(1,1,NULL,'retry'); SELECT probe.apply_suggestion(1,NULL,'synthetic-digest-1','retry');",'conflict\nconflict\nconflict');unchanged(before)
    check('use_creates_one_successor_audit_and_erases_body',apply(1),'applied:2')
    assert h.admin("SELECT (SELECT head FROM probe.drafts WHERE id=1)||':'||(SELECT count(*) FROM probe.applications WHERE invocation=1)||':'||(SELECT count(*) FROM probe.evidence WHERE invocation=1 AND kind='applied')||':'||(SELECT count(*) FROM probe.bodies WHERE invocation=1);")=='2:1:1:0'
    assert fixture('SELECT probe.manual_edit(1,2);','missionary_a')=='edited'
    before=counts();check('different_retry_key_returns_same_acceptance_receipt',apply(1,'new-transport-key'),'receipt:2');unchanged(before)
    h.RESULTS[-1]['newer_head']=h.admin('SELECT head FROM probe.drafts WHERE id=1;');assert h.RESULTS[-1]['newer_head']=='3'
    check('changed_digest_on_accepted_retry_conflicts',apply(1,'other-key',digest='different-output'),'conflict')
    n=prepared(2,ttl=-1)
    check('expired_body_cannot_be_read',f'SELECT probe.read_suggestion({n});','unavailable')
    before=counts();check('expired_body_cannot_be_applied',apply(n),'expired');unchanged(before)
    n=prepared(3);before=counts();check('required_apply_audit_failure_rolls_back_body_and_source',apply(n,'FAIL_AUDIT'),state='23514');unchanged(before)
    draft(4);before=counts();check('reservation_audit_failure_rolls_back_budget',request(4,'FAIL_AUDIT'),state='23514');unchanged(before)
    draft(5);draft(6,'missionary_b')
    fixture("UPDATE probe.purpose_budget SET ceiling=held+60 WHERE tenant=1 AND purpose='newsletter';")
    race('concurrent_purpose_budget_one_reservation','missionary_a',request(5,'purpose-A'),'missionary_b',request(6,'purpose-B'),lambda a,b:(a.startswith('reserved:') and b.startswith('budget_purpose\n') and h.admin("SELECT held=ceiling FROM probe.purpose_budget WHERE tenant=1 AND purpose='newsletter';")=='t',dict(first=a,second=b,purpose_budget=h.admin("SELECT held||':'||ceiling FROM probe.purpose_budget WHERE tenant=1 AND purpose='newsletter';"))))
    fixture("UPDATE probe.purpose_budget SET ceiling=10000 WHERE tenant=1;")
    draft(7);draft(8,purpose='profile')
    fixture('UPDATE probe.tenant_budget SET ceiling=held+60 WHERE tenant=1;')
    race('concurrent_tenant_budget_across_purposes','missionary_a',request(7,'tenant-A'),'missionary_a',request(8,'tenant-B',binding=2),lambda a,b:(a.startswith('reserved:') and b.startswith('budget_tenant\n') and h.admin('SELECT held=ceiling FROM probe.tenant_budget WHERE tenant=1;')=='t',dict(first=a,second=b,tenant_budget=h.admin('SELECT held||\':\'||ceiling FROM probe.tenant_budget WHERE tenant=1;'))))
    fixture('UPDATE probe.tenant_budget SET ceiling=10000 WHERE tenant=1;')
    draft(9);n=reserve(9,'unknown');fixture(f"SELECT probe.observe_result({n},'dispatch');",'provider_worker');fixture(f"SELECT probe.observe_result({n},'unknown');",'provider_worker')
    before=counts();check('unknown_outcome_cannot_be_blindly_redispatched',f"SELECT probe.observe_result({n},'dispatch');",'inspect',role='provider_worker')
    unchanged(before)
    check('unknown_receipt_retains_reservation',request(9,'unknown'),'inspect:'+str(n))
    fixture('UPDATE probe.tenant_budget SET ceiling=held WHERE tenant=1;')
    before=counts();check('unknown_hold_cannot_fund_new_blind_retry',request(9,'unsafe-new-intent'),'budget_tenant');unchanged(before)
    fixture('UPDATE probe.tenant_budget SET ceiling=10000 WHERE tenant=1;')
    n=prepared(10);before=counts()
    race('revoke_first_blocks_application','policy_manager',gate(False),'missionary_a',apply(n),lambda a,b:(b.startswith('unavailable\n') and before==counts(),dict(first=a,second=b,before=before,after=counts())))
    check('revocation_blocks_body_and_prior_receipt','SELECT probe.read_suggestion(1); '+apply(1),'unavailable\nunavailable')
    fixture(gate(True),'policy_manager')
    check('reenable_does_not_revive_old_suggestion',f'SELECT probe.read_suggestion({n}); '+apply(n),'unavailable\nunavailable')
    n=prepared(11)
    race('application_first_preserved_after_revoke','missionary_a',apply(n),'policy_manager',gate(False),lambda a,b:(a.startswith('applied:2\n') and h.admin(f'SELECT count(*) FROM probe.applications WHERE invocation={n};')=='1',dict(first=a,second=b,applications=h.admin(f'SELECT count(*) FROM probe.applications WHERE invocation={n};'))))
    fixture(gate(True),'policy_manager')
    n=prepared(12)
    race('manual_edit_first_stales_suggestion_use','missionary_a','SELECT probe.manual_edit(12,1);','missionary_a',apply(n),lambda a,b:(b.startswith('stale\n') and h.admin(f'SELECT count(*) FROM probe.applications WHERE invocation={n};')=='0',dict(first=a,second=b)))
    n=prepared(13)
    race('use_first_conflicts_stale_manual_save','missionary_a',apply(n),'missionary_a','SELECT probe.manual_edit(13,1);',lambda a,b:(a.startswith('applied:2\n') and b.startswith('stale\n'),dict(first=a,second=b)))
    n=prepared(14)
    race('two_use_keys_one_successor','missionary_a',apply(n,'first-click'),'missionary_a',apply(n,'second-click'),lambda a,b:(a.startswith('applied:2\n') and b.startswith('receipt:2\n') and h.admin('SELECT count(*) FROM probe.versions WHERE draft=14;')=='2',dict(first=a,second=b,versions=h.admin('SELECT count(*) FROM probe.versions WHERE draft=14;'))))
    expired_while_waiting()
    n=prepared(31)
    fixture("UPDATE probe.routes SET binding=4,revision=revision+1 WHERE tenant=1 AND purpose='newsletter';",'policy_manager')
    before=counts();check('new_binding_never_retargets_prior_suggestion',f'SELECT probe.read_suggestion({n}); '+apply(n),'unavailable\nunavailable');unchanged(before)
    assert h.admin(f'SELECT binding FROM probe.invocations WHERE id={n};')=='1'
    assert h.admin('SELECT count(*) FROM probe.send_sentinel;')=='0'
    assert h.admin('SELECT (SELECT sum(held) FROM probe.tenant_budget)=(SELECT sum(reserved) FROM probe.invocations) AND (SELECT sum(held) FROM probe.purpose_budget)=(SELECT sum(reserved) FROM probe.invocations);')=='t'
    h.RESULTS[-1]['final_send_count']=0
    h.RESULTS[-1]['reservation_totals_equal_invocation_holds']=True

def main():
    start = h.docker(['run','--name',h.NAME,'--rm','--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','-d',IMAGE])
    if start.returncode:
        raise RuntimeError(start.stderr)
    container_id = start.stdout.strip()
    cleanup = dict(container=h.NAME,container_id=container_id,volume_names=[])
    try:
        details = json.loads(h.docker(['inspect',h.NAME]).stdout)[0]
        assert details['HostConfig']['NetworkMode']=='none' and not details['HostConfig']['PortBindings'] and not details['NetworkSettings']['Ports']
        cleanup['volume_names']=[m['Name'] for m in details['Mounts'] if m['Type']=='volume']
        deadline=time.monotonic()+30
        while True:
            logs=h.docker(['logs',h.NAME])
            if 'PostgreSQL init process complete; ready for start up.' in logs.stdout+logs.stderr and h.docker(['exec',h.NAME,'pg_isready','-U','postgres']).returncode==0:
                break
            if time.monotonic()>deadline:
                raise TimeoutError('Database initialization')
            time.sleep(.2)
        save('environment.json',dict(recorded_at=datetime.now(timezone.utc).isoformat(),container=h.NAME,container_id=container_id,image=IMAGE,actual_image_id=details['Image'],network=details['HostConfig']['NetworkMode'],published_ports=details['NetworkSettings']['Ports'],volume_names=cleanup['volume_names'],server=h.admin('SELECT version();')))
        h.admin((ROOT/'setup.sql').read_text())
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','missionary_a','missionary_b','other_tenant','provider_worker','policy_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('missionary_a','missionary_b','provider_worker','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
        scenarios()
    finally:
        cleanup['stop_exit_code']=h.docker(['stop',h.NAME]).returncode
        deadline=time.monotonic()+15
        while True:
            cleanup['container_absent']=h.docker(['inspect',container_id]).returncode!=0
            cleanup['volumes_absent']={v:h.docker(['volume','inspect',v]).returncode!=0 for v in cleanup['volume_names']}
            if cleanup['container_absent'] and all(cleanup['volumes_absent'].values()):
                break
            if time.monotonic()>deadline:
                raise RuntimeError('Cleanup not confirmed')
            time.sleep(.2)
        cleanup['verified_at']=datetime.now(timezone.utc).isoformat()
        save('cleanup.json',cleanup)


if __name__=='__main__':
    failure=None
    try:
        main()
    except Exception as exc:
        failure=repr(exc)
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D18 purpose binding, private suggestions, atomic budget reservation and deliberate source application mechanics only; not Core/P12/Supabase/Auth/PostgREST/provider qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
