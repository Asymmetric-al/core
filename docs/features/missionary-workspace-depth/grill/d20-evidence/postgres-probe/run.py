#!/usr/bin/env python3
"""Disposable D20 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d20-pg'
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



def scope(s):
    fixture(f"INSERT INTO probe.scopes(tenant,id,assignee) VALUES(1,{s},'missionary_a'); INSERT INTO probe.gates VALUES(1,{s},'missionary_a',true,1),(1,{s},'missionary_b',true,1),(1,{s},'source_worker',true,1);")


def gift(s,g,eligible=True,origin='live'):
    fixture(f"INSERT INTO probe.gift_versions VALUES(1,{g},{s},1,{str(eligible).lower()},{lit(origin)}); INSERT INTO probe.gift_heads VALUES(1,{g},{s},1);")


def admit(s,g,key='request'):
    return f'SELECT probe.admit({s},{g},{lit(key)});'


def review(n,ids,key):
    return f'SELECT probe.review_group({n},ARRAY[{",".join(map(str,ids))}]::int[],{lit(key)});'


def finish(r,kind='done',key=None):
    return f'SELECT probe.finish({r},{lit(kind)},{lit(key or "finish-"+str(r))});'


def change(s,g=1,expected=1,eligible=False):
    return f'SELECT probe.change_source({s},{g},{expected},{str(eligible).lower()});'


def gate(s,allowed,actor='missionary_a'):
    return f'UPDATE probe.gates SET allowed={str(allowed).lower()},revision=revision+1 WHERE tenant=1 AND scope={s} AND actor={lit(actor)};'


def prepared(s,ids=(1,2)):
    scope(s)
    for g in ids:
        gift(s,g);fixture(admit(s,g),'source_worker')
    n=int(h.admin(f"SELECT id FROM probe.groups WHERE tenant=1 AND scope={s} AND state='open';"))
    r=int(fixture(review(n,ids,'review-'+str(s)),'missionary_a').split(':')[1])
    return n,r


def counts():
    return h.admin("SELECT (SELECT count(*) FROM probe.groups)||':'||(SELECT count(*) FROM probe.coverage)||':'||(SELECT count(*) FROM probe.receipts)||':'||(SELECT count(*) FROM probe.audit)||':'||(SELECT count(*) FROM probe.effect_sentinel);")


def unchanged(before):
    after=counts();h.RESULTS[-1]['counts']=dict(before=before,after=after)
    if before!=after:h.RESULTS[-1]['passed']=False;raise AssertionError('Unexpected task/evidence change')


def members(s):return h.admin(f"SELECT string_agg(gift||':'||state,',' ORDER BY gift) FROM probe.coverage WHERE scope={s};")


def groupstate(n):return h.admin(f"SELECT state FROM probe.groups WHERE id={n};")


def race(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def scenarios():
    scope(1);gift(1,1,origin='history');before=counts()
    check('history_does_not_admit_group',admit(1,1),'history_only',role='source_worker');unchanged(before)
    gift(1,2,eligible=False);check('ineligible_does_not_admit_group',admit(1,2),'not_qualified',role='source_worker');unchanged(before)
    scope(2);gift(2,1);before=counts()
    check('required_admission_audit_rolls_back',admit(2,1,'FAIL_AUDIT'),state='23514',role='source_worker');unchanged(before)
    check('cross_tenant_member_foreign_key','INSERT INTO probe.gift_heads VALUES(2,1,2,1);',state='23503',role='postgres')
    n,r=prepared(3)
    check('raw_member_read_denied','SELECT * FROM probe.coverage;',state='42501')
    check('raw_task_mutation_denied',f"UPDATE probe.groups SET state='done' WHERE id={n};",state='42501')
    check('group_scope_cannot_be_relabelled',f'UPDATE probe.groups SET scope=2 WHERE id={n};',state='55000',role='postgres')
    check('member_identity_cannot_be_relabelled','UPDATE probe.coverage SET gift=99 WHERE scope=3 AND gift=1;',state='55000',role='postgres')
    check('one_open_compatible_group_constraint',"INSERT INTO probe.groups(tenant,scope,assignee,state) VALUES(1,3,'missionary_a','open');",state='23505',role='postgres')
    check('cross_tenant_review_and_finish_denied',review(n,[1],'alien')+' '+finish(r),'unavailable\nunavailable',role='other_tenant')
    check('different_assignee_no_read_or_finish',f'SELECT probe.read_group({n}); '+finish(r),'unavailable\nunavailable',role='missionary_b')
    check('trusted_actor_not_session_setting',f"SET request.jwt.claim.sub='missionary_a'; SELECT probe.finish({r},'done','spoof');",'unavailable',role='missionary_b')
    check('normalize_exact_review_retry',review(n,[2,1,1],'review-3'),'review:'+str(r))
    check('changed_review_key_meaning_conflicts',review(n,[1],'review-3'),'conflict')
    check('foreign_or_null_review_members_conflict',review(n,[1,999],'foreign')+f" SELECT probe.review_group({n},ARRAY[1,NULL],'null');",'conflict\nconflict')
    before=counts();check('null_disposition_rejected',f"SELECT probe.finish({r},NULL,'null');",'conflict');unchanged(before)
    check('exact_review_rows_immutable',f'UPDATE probe.review_items SET gift_revision=2 WHERE review_id={r};',state='55000',role='postgres')
    before=counts();check('required_completion_audit_rolls_back',finish(r,key='FAIL_AUDIT'),state='23514');unchanged(before);assert members(3)=='1:open,2:open'
    gift(3,3);fixture(admit(3,3),'source_worker')
    check('reviewed_subset_finishes_same_task_residual_open',finish(r),'done');assert members(3)=='1:done,2:done,3:open' and groupstate(n)=='open'
    before=counts();check('lost_receipt_new_key_never_consumes_residual',finish(r,key='retry-3'),'receipt:done');unchanged(before);assert members(3)=='1:done,2:done,3:open'
    check('changed_disposition_retry_conflicts',finish(r,kind='not_needed'),'conflict')
    r3=int(fixture(review(n,[3],'residual-3'),'missionary_a').split(':')[1])
    check('finish_key_cannot_rebind_another_review',finish(r3,key='finish-'+str(r)),'conflict')
    check('last_reviewed_members_close_same_task',finish(r3),'done');assert groupstate(n)=='done' and h.admin('SELECT count(*) FROM probe.groups WHERE scope=3;')=='1'
    gift(3,4);fixture(admit(3,4),'source_worker');new=int(h.admin("SELECT id FROM probe.groups WHERE scope=3 AND state='open';"));assert new!=n
    check('completed_gift_coverage_survives_new_group',admit(3,1,key='new-transport'),'covered:'+str(n),role='source_worker');assert h.admin('SELECT count(*) FROM probe.coverage WHERE scope=3 AND gift=1;')=='1'
    n,r=prepared(4);fixture(change(4,eligible=True),'source_manager');before=counts()
    check('material_revision_change_conflicts_whole_review',finish(r),'conflict');unchanged(before);assert members(4)=='1:open,2:open'
    n,r=prepared(5);fixture(finish(r,kind='not_needed'),'missionary_a');fixture(change(5),'source_manager');fixture(change(5,expected=2,eligible=True),'source_manager')
    check('not_needed_coverage_survives_requalification',admit(5,1),'covered:'+str(n),role='source_worker');assert members(5)=='1:not_needed,2:not_needed'
    n,r=prepared(6);fixture(gate(6,False,'missionary_b'),'policy_manager')
    check('handoff_does_not_grant_authority',f"SELECT probe.handoff({n},1,'missionary_b');",'unavailable',role='source_manager')
    # Nine independent controlled two-session races, using actual nonsuperuser logins.
    scope(7);gift(7,1);gift(7,2)
    race('parallel_admissions_one_compatible_task','source_worker',admit(7,1),'source_worker',admit(7,2),lambda a,b:(a.startswith('admitted:') and b.startswith('admitted:') and h.admin('SELECT count(*) FROM probe.groups WHERE scope=7;')=='1',dict(first=a,second=b,coverage=members(7))))
    n,r=prepared(8);gift(8,3)
    race('addition_first_review_finishes_residual','source_worker',admit(8,3),'missionary_a',finish(r),lambda a,b:(b.startswith('done\n') and members(8)=='1:done,2:done,3:open' and groupstate(n)=='open' and h.admin('SELECT count(*) FROM probe.groups WHERE scope=8;')=='1',dict(first=a,second=b,members=members(8),same_group=n)))
    n,r=prepared(9);gift(9,3)
    race('finish_first_new_gift_gets_next_task','missionary_a',finish(r),'source_worker',admit(9,3),lambda a,b:(a.startswith('done\n') and b.startswith('admitted:') and groupstate(n)=='done' and h.admin('SELECT count(*) FROM probe.groups WHERE scope=9;')=='2' and h.admin("SELECT count(*) FROM probe.groups WHERE scope=9 AND state='open';")=='1',dict(first=a,second=b,members=members(9))))
    n,r=prepared(10)
    race('two_finish_keys_one_review_receipt','missionary_a',finish(r,key='parallel-A'),'missionary_a',finish(r,key='parallel-B'),lambda a,b:(a.startswith('done\n') and b.startswith('receipt:done\n') and h.admin(f'SELECT count(*) FROM probe.receipts WHERE review_id={r};')=='1',dict(first=a,second=b)))
    n,r=prepared(11)
    race('correction_first_conflicts_entire_review','source_manager',change(11),'missionary_a',finish(r),lambda a,b:(b.startswith('conflict\n') and members(11)=='1:open,2:open' and h.admin(f'SELECT count(*) FROM probe.receipts WHERE review_id={r};')=='0',dict(first=a,second=b,members=members(11))))
    n,r=prepared(12)
    race('finish_first_retains_human_history','missionary_a',finish(r),'source_manager',change(12),lambda a,b:(a.startswith('done\n') and members(12)=='1:done,2:done' and groupstate(n)=='done',dict(first=a,second=b,source_revision=h.admin('SELECT revision FROM probe.gift_heads WHERE scope=12 AND gift=1;'))))
    n,r=prepared(13)
    race('revoke_first_denies_review_completion','policy_manager',gate(13,False),'missionary_a',finish(r),lambda a,b:(b.startswith('unavailable\n') and members(13)=='1:open,2:open',dict(first=a,second=b)))
    n,r=prepared(14)
    race('finish_first_precedes_revocation','missionary_a',finish(r),'policy_manager',gate(14,False),lambda a,b:(a.startswith('done\n') and groupstate(n)=='done',dict(first=a,second=b)))
    check('revoked_read_and_receipt_disclosure_denied',f'SELECT probe.read_group({n}); '+finish(r),'unavailable\nunavailable')
    n,r=prepared(15)
    race('handoff_fences_old_read_and_completion','source_manager',f"SELECT probe.handoff({n},1,'missionary_b');",'missionary_a',f'SELECT probe.read_group({n}); '+finish(r),lambda a,b:(b.startswith('unavailable\nunavailable\n') and members(15)=='1:open,2:open',dict(first=a,second=b)))
    fixture(f"SELECT probe.handoff({n},2,'missionary_a');",'source_manager')
    check('handoff_A_B_A_does_not_revalidate_old_review',finish(r),'conflict');assert members(15)=='1:open,2:open'
    assert h.admin('SELECT count(*) FROM probe.effect_sentinel;')=='0'
    h.RESULTS[-1]['final_interaction_send_gift_enrollment_effects']=0


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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D20 exact reviewed special-gift membership, durable purpose coverage, independent shared task and current-authority mechanics only; not Core/financial/recognition/P12/Supabase/Auth/PostgREST qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
