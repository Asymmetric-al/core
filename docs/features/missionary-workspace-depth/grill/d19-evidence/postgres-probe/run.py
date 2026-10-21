#!/usr/bin/env python3
"""Disposable D19 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d19-pg'
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


def scope(m,eligibility='eligible',complete=True,origin='live',party=10):
    fixture(f"INSERT INTO probe.ministries VALUES(1,{m}); INSERT INTO probe.gates VALUES(1,'missionary_a',{m},true,1),(1,'missionary_b',{m},true,1),(1,'source_worker',{m},true,1); INSERT INTO probe.responsibility VALUES(1,{m},'missionary_a',1); INSERT INTO probe.source_versions VALUES(1,{party},{m},'first_support',1,{lit(eligibility)},{str(complete).lower()},{lit(origin)},'synthetic-owner-qualified-source'); INSERT INTO probe.source_heads VALUES(1,{party},{m},'first_support',1);")


def signal(key,m,rev=1,origin='live',party=10):
    fixture(f'INSERT INTO probe.signals VALUES(1,{lit(key)},{party},{m},{rev},{lit(origin)});')


def consume(key):return f'SELECT probe.consume({lit(key)});'


def current(m):return int(h.admin(f'SELECT id FROM probe.tasks WHERE tenant=1 AND ministry={m};'))


def prepared(m):
    scope(m);signal('event-'+str(m),m);assert fixture(consume('event-'+str(m)),'source_worker').startswith('created:');return current(m)


def finish(n,rev=1,kind='done',meaning='human task handled',key='request'):
    return f'SELECT probe.finish({n},{rev},{lit(kind)},{lit(meaning)},{lit(key)});'


def change(m,expected=1,status='ineligible',complete=True):
    return f"SELECT probe.change_source(10,{m},{expected},{lit(status)},{str(complete).lower()});"


def gate(m,value,actor='missionary_a'):
    return f"UPDATE probe.gates SET allowed={str(value).lower()},revision=revision+1 WHERE tenant=1 AND actor={lit(actor)} AND ministry={m};"


def counts():return h.admin("SELECT (SELECT count(*) FROM probe.tasks)||':'||(SELECT count(*) FROM probe.outcomes)||':'||(SELECT count(*) FROM probe.audit)||':'||(SELECT count(*) FROM probe.event_receipts)||':'||(SELECT count(*) FROM probe.effect_sentinel);")


def unchanged(before):
    after=counts();h.RESULTS[-1]['counts']=dict(before=before,after=after)
    if before!=after:h.RESULTS[-1]['passed']=False;raise AssertionError('Unexpected task/effect change')


def race(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def scenarios():
    fixture('INSERT INTO probe.parties VALUES(1,10),(1,20),(1,21),(2,10); INSERT INTO probe.aliases VALUES(1,10,10),(1,20,20),(1,21,20),(2,10,10);')
    scope(1,complete=False);signal('incomplete',1)
    check('incomplete_history_is_not_first_support',consume('incomplete'),'not_qualified',role='source_worker');assert h.admin('SELECT count(*) FROM probe.tasks;')=='0'
    scope(2,eligibility='ineligible');signal('not-money',2)
    check('unqualified_source_never_creates_task',consume('not-money'),'not_qualified',role='source_worker')
    scope(3);signal('import',3,origin='history')
    check('historical_event_has_no_task_effect',consume('import'),'history_only',role='source_worker')
    scope(4,origin='history');signal('old-live',4)
    check('history_only_current_source_does_not_backfill_task',consume('old-live'),'history_only',role='source_worker')
    scope(5);signal('ahead',5,rev=2);before=counts()
    check('event_ahead_of_owner_cursor_waits',consume('ahead'),'source_pending',role='source_worker');unchanged(before)
    scope(6);signal('FAIL_CREATE_AUDIT',6);before=counts()
    check('creation_audit_failure_rolls_back_task_and_receipt',consume('FAIL_CREATE_AUDIT'),state='23514',role='source_worker');unchanged(before)
    check('tenant_source_FK_rejects_foreign_version',"INSERT INTO probe.source_heads VALUES(2,10,1,'first_support',1);",state='23503',role='postgres')
    n=prepared(7)
    check('ordinary_actor_has_no_raw_task_read','SELECT * FROM probe.tasks;',state='42501')
    check('ordinary_actor_cannot_reassign_raw_task',f"UPDATE probe.tasks SET assignee='missionary_b' WHERE id={n};",state='42501')
    check('task_scope_is_immutable_even_with_privileged_update',f'UPDATE probe.tasks SET ministry=2 WHERE id={n};',state='55000',role='postgres')
    check('different_assignee_cannot_read_or_finish',f'SELECT probe.read_task({n}); '+finish(n),'unavailable\nunavailable',role='missionary_b')
    check('other_tenant_cannot_read_or_finish',f'SELECT probe.read_task({n}); '+finish(n),'unavailable\nunavailable',role='other_tenant')
    before=counts();check('null_meaning_or_revision_never_finishes',f"SELECT probe.finish({n},1,NULL,'meaning','key'); SELECT probe.finish({n},NULL,'done','meaning','key');",'conflict\nconflict');unchanged(before)
    before=counts();check('same_event_recovers_accepted_receipt',consume('event-7'),'receipt:created:'+str(n),role='source_worker');unchanged(before)
    fixture(change(7,status='eligible'),'source_manager');signal('late-reordered',7,rev=1)
    check('out_of_order_new_event_uses_current_head_same_task',consume('late-reordered'),'existing:'+str(n),role='source_worker');assert h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=7;')=='1'
    fixture(change(7,expected=2,status='unknown',complete=False),'source_manager')
    check('unknown_source_holds_same_task_without_completion',f'SELECT probe.read_task({n}); '+finish(n,rev=3),'held:3\nnot_qualified')
    fixture("SELECT probe.change_source(10,7,3,'eligible',true,'history');",'source_manager');assert fixture(f'SELECT probe.read_task({n});','missionary_a')=='held:4'
    fixture(change(7,expected=4,status='eligible'),'source_manager')
    check('live_resolution_not_history_repair_resumes_same_task',f'SELECT probe.read_task({n});','pending:5');assert current(7)==n
    before=counts();check('required_completion_audit_failure_rolls_back',finish(n,rev=5,key='FAIL_FINISH_AUDIT'),state='23514');unchanged(before)
    check('human_done_commits_one_outcome_and_no_interaction',finish(n,rev=5),'done');assert h.admin('SELECT count(*) FROM probe.effect_sentinel;')=='0'
    before=counts();check('different_retry_key_preserves_original_done',finish(n,rev=5,key='lost-response-retry'),'receipt:done');unchanged(before)
    check('changed_done_meaning_conflicts',finish(n,rev=5,kind='not_needed'),'conflict')
    n=prepared(8);fixture(finish(n,kind='not_needed',meaning='human decision'),'missionary_a');fixture(change(8),'source_manager');fixture(change(8,expected=2,status='eligible'),'source_manager');signal('later-gift-8',8,rev=3)
    check('human_not_needed_not_reopened_by_financial_change',consume('later-gift-8'),'existing:'+str(n),role='source_worker');assert fixture(f'SELECT probe.read_task({n});','missionary_a')=='not_needed:4'
    n=prepared(9);fixture(gate(9,False,'missionary_b'),'policy_manager');before=counts()
    check('assignment_does_not_grant_missing_authority',f"SELECT probe.reassign({n},1,'missionary_b');",'unavailable',role='source_manager');unchanged(before)
    scope(10);signal('worker-revoked',10);fixture(gate(10,False,'source_worker'),'policy_manager');before=counts()
    check('revoked_worker_cannot_admit_followup',consume('worker-revoked'),'unavailable',role='source_worker');unchanged(before)
    n=prepared(11);fixture('UPDATE probe.aliases SET canonical=10 WHERE tenant=1 AND observed IN(20,21);');signal('merged-alias',11,party=21)
    check('qualified_alias_replay_reuses_existing_coverage',consume('merged-alias'),'existing:'+str(n),role='source_worker');assert h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=11;')=='1'
    scope(12);signal('parallel-A',12);signal('parallel-B',12)
    race('parallel_events_one_first_support_task','source_worker',consume('parallel-A'),'source_worker',consume('parallel-B'),lambda a,b:(a.startswith('created:') and b.startswith('existing:') and h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=12;')=='1',dict(first=a,second=b,tasks=h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=12;'))))
    scope(13);signal('correct-before-create',13)
    race('correction_first_blocks_old_event_creation','source_manager',change(13),'source_worker',consume('correct-before-create'),lambda a,b:(b.startswith('not_qualified\n') and h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=13;')=='0',dict(first=a,second=b)))
    n=prepared(14)
    race('correction_first_withdraws_pending_completion','source_manager',change(14),'missionary_a',finish(n),lambda a,b:(b.startswith('not_applicable\n') and h.admin(f'SELECT state FROM probe.tasks WHERE id={n};')=='withdrawn',dict(first=a,second=b)))
    fixture(change(14,expected=2,status='eligible'),'source_manager');signal('repair-needs-owner',14,rev=3)
    check('terminal_withdrawal_needs_explicit_owner_repair',consume('repair-needs-owner'),'needs_source_resolution:'+str(n),role='source_worker')
    n=prepared(15)
    race('done_first_survives_later_source_correction','missionary_a',finish(n),'source_manager',change(15),lambda a,b:(a.startswith('done\n') and h.admin(f'SELECT state FROM probe.tasks WHERE id={n};')=='done' and h.admin(f'SELECT count(*) FROM probe.outcomes WHERE task={n};')=='1',dict(first=a,second=b,source_head=h.admin("SELECT revision FROM probe.source_heads WHERE ministry=15;"))))
    n=prepared(16)
    race('revocation_first_blocks_completion','policy_manager',gate(16,False),'missionary_a',finish(n),lambda a,b:(b.startswith('unavailable\n') and h.admin(f'SELECT state FROM probe.tasks WHERE id={n};')=='pending',dict(first=a,second=b)))
    n=prepared(17)
    race('done_first_preserved_after_revocation','missionary_a',finish(n),'policy_manager',gate(17,False),lambda a,b:(a.startswith('done\n') and h.admin(f'SELECT state FROM probe.tasks WHERE id={n};')=='done',dict(first=a,second=b)))
    check('revocation_blocks_task_read_and_prior_done_receipt',f'SELECT probe.read_task({n}); '+finish(n),'unavailable\nunavailable')
    n=prepared(18)
    race('handoff_fences_old_assignee_read_and_completion','source_manager',f"SELECT probe.reassign({n},1,'missionary_b');",'missionary_a',f'SELECT probe.read_task({n}); '+finish(n),lambda a,b:(a.startswith('reassigned\n') and b.startswith('unavailable\nunavailable\n') and h.admin(f"SELECT assignee||':'||state FROM probe.tasks WHERE id={n};")=='missionary_b:pending',dict(first=a,second=b)))
    fixture(finish(n,rev=2),'missionary_b');assert h.admin('SELECT count(*) FROM probe.tasks WHERE ministry=18;')=='1'
    n=prepared(19)
    race('two_completion_keys_one_human_outcome','missionary_a',finish(n,key='A'),'missionary_a',finish(n,key='B'),lambda a,b:(a.startswith('done\n') and b.startswith('receipt:done\n') and h.admin(f'SELECT count(*) FROM probe.outcomes WHERE task={n};')=='1',dict(first=a,second=b)))
    assert h.admin('SELECT count(*) FROM probe.effect_sentinel;')=='0'
    h.RESULTS[-1]['final_communication_interaction_gift_enrollment_effects']=0

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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','missionary_a','missionary_b','other_tenant','source_worker','source_manager','policy_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('missionary_a','missionary_b','source_worker','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D19 owner-qualified first-support signal, permanent coverage, independent follow-up task and current-authority mechanics only; not Core/financial/recognition/P12/Supabase/Auth/PostgREST qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
