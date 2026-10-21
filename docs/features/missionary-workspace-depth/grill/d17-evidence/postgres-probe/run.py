#!/usr/bin/env python3
"""Disposable D17 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d17-pg'
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


def row(number,source,payload=None,decision='eligible',target=None,target_revision=None,audit='ok'):
    return (number,source,payload or {'name':'Synthetic '+source,'email':'synthetic@example.invalid'},decision,target,target_revision,audit)


def new_run(ident,rows,namespace='source-A',mapping=1,digest='same-bytes'):
    q=["BEGIN;",f"INSERT INTO probe.sessions VALUES(1,{ident},10,'missionary_a',{ident},1,'preview');",f"INSERT INTO probe.plans SELECT 1,{ident},{ident},10,{lit(digest)},{mapping},{lit(namespace)},revision FROM probe.gates WHERE tenant=1 AND workspace=10 AND actor='missionary_a';"]
    for number,source,payload,decision,target,revision,audit in rows:
        q.append(f"INSERT INTO probe.rows VALUES(1,{ident},10,{number},{lit(source)},{lit(json.dumps(payload,sort_keys=True))}::jsonb,{lit(decision)},{lit(target)},{lit(revision)},{lit(audit)}); INSERT INTO probe.jobs(tenant,plan,row_number) VALUES(1,{ident},{number});")
    q.append('COMMIT;');fixture(' '.join(q))


def approve(ident):
    assert fixture(f'SELECT probe.approve({ident},{ident},1);','missionary_a')=='approved'


def claim(ident,number=1,role='worker_a'):
    value=fixture(f'SELECT probe.claim({ident},{number});',role)
    assert value.startswith('lease:'),value
    return int(value.split(':')[1])


def apply(ident,number=1,epoch=1):return f'SELECT probe.apply_row({ident},{number},{epoch});'


def counts():
    return h.admin("SELECT (SELECT count(*) FROM probe.preparation)||':'||(SELECT count(*) FROM probe.source_keys)||':'||(SELECT count(*) FROM probe.provenance)||':'||(SELECT count(*) FROM probe.outcomes)||':'||(SELECT count(*) FROM probe.dark_effects);")


def unchanged(before):
    after=counts();h.RESULTS[-1]['source_counts']=dict(before=before,after=after)
    if before!=after:h.RESULTS[-1]['passed']=False;raise AssertionError('Expected no source effect')


def gate(value):return f"UPDATE probe.gates SET allowed={str(value).lower()},revision=revision+1 WHERE tenant=1 AND workspace=10 AND actor='missionary_a';"


def concurrent(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def target():return int(h.admin("SELECT target FROM probe.source_keys WHERE source_namespace='source-A' AND source_id='A';"))


def revision():return int(h.admin(f'SELECT revision FROM probe.preparation WHERE id={target()};'))


def expiry_while_waiting():
    from concurrent.futures import ThreadPoolExecutor
    new_run(17,[row(1,'A',target=target(),target_revision=revision())]);approve(17);claim(17)
    first=h.Session('missionary_a','lease_expiry_target_editor')
    try:
        first.send(f"BEGIN; SELECT probe.touch_target({target()}); SELECT 'FIRST_READY';");first.until('FIRST_READY')
        fixture("UPDATE probe.jobs SET lease_until=clock_timestamp()+interval '2 seconds' WHERE plan=17;")
        before=counts()
        with ThreadPoolExecutor(max_workers=1) as pool:
            pending=pool.submit(h.subprocess.run,h.command('worker_a','lease_expiry_waiter'),env=h.ENV,input=apply(17),capture_output=True,text=True,timeout=20)
            observed=h.blocked('lease_expiry_waiter');time.sleep(2.1)
            first.send("COMMIT; SELECT 'FIRST_COMMITTED';");first.until('FIRST_COMMITTED')
            result=pending.result()
        after=counts();done=h.admin('SELECT done FROM probe.jobs WHERE plan=17;')
        ok=result.returncode!=0 and '40001:' in result.stderr and before==after and done=='f'
        h.RESULTS.append(dict(name='lease_expiry_during_target_wait_rolls_back_outcome',passed=ok,actual_lock_wait=observed,first_role='missionary_a',second_role='worker_a',first=first.transcript,second_sql=apply(17),expected_sqlstate='40001',exit_code=result.returncode,stdout=result.stdout.strip(),stderr=result.stderr.strip(),before=before,after=after,job_done=done))
        if not ok:raise AssertionError('Lease expiry race')
    finally:first.close()


def scenarios():
    new_run(1,[row(1,'A'),row(2,'review',decision='review'),row(3,'B')])
    check('preview_has_no_business_effects','SELECT probe.preview(1);','3');assert counts()=='0:0:0:0:0'
    check('ordinary_staff_cannot_read_private_preview','SELECT probe.preview(1);','unavailable',role='staff_a')
    check('ordinary_staff_has_no_raw_staging_select','SELECT * FROM probe.rows;',state='42501',role='staff_a')
    check('reviewed_plan_mapping_is_immutable','UPDATE probe.plans SET mapping_version=2 WHERE id=1;',state='55000',role='postgres')
    new_run(2,[row(1,'old-plan')])
    fixture("BEGIN; INSERT INTO probe.plans SELECT tenant,20,session,workspace,byte_digest,2,source_namespace,authority_revision FROM probe.plans WHERE id=2; UPDATE probe.sessions SET current_plan=20,revision=2 WHERE id=2; COMMIT;")
    check('superseded_preview_cannot_approve','SELECT probe.approve(2,2,1);','conflict')
    check('plan_workspace_FK_prevents_cross_scope_row',"INSERT INTO probe.rows VALUES(1,1,20,9,'cross','{}','eligible',NULL,NULL,'ok');",state='23503',role='postgres')
    approve(1);claim(1)
    check('accepted_row_co_commits_target_lineage_and_outcome',apply(1),'accepted',role='worker_a');assert counts()=='1:1:1:1:0'
    before=counts();check('same_row_retry_returns_recorded_outcome',apply(1),'accepted',role='worker_a');unchanged(before)
    new_run(3,[row(99,'A')],digest='reordered-bytes');approve(3);claim(3,99)
    check('reordered_reimport_uses_source_identity_not_row_number',apply(3,99),'already_imported',role='worker_a');assert counts()=='1:1:2:2:0'
    new_run(4,[row(1,'A',payload={'name':'Changed mapping','email':'synthetic@example.invalid'})],mapping=2);approve(4);claim(4)
    check('changed_mapping_payload_cannot_overwrite_existing',apply(4),'needs_review',role='worker_a');assert h.admin(f"SELECT payload->>'name' FROM probe.preparation WHERE id={target()};")=='Synthetic A'
    new_run(5,[row(1,'A',decision='review')],namespace='different-source');approve(5);claim(5)
    check('new_source_namespace_requires_review_not_email_merge',apply(5),'needs_review',role='worker_a');assert h.admin('SELECT count(*) FROM probe.preparation;')=='1'
    check('unclaimed_worker_cannot_accept_row',apply(1,3,0),'stale_lease',role='worker_a')
    claim(1,3)
    check('live_lease_cannot_be_stolen','SELECT probe.claim(1,3);','busy',role='worker_b')
    fixture("UPDATE probe.jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE plan=1 AND row_number=3;")
    epoch=claim(1,3,'worker_b');assert epoch==2
    before=counts();check('old_worker_epoch_cannot_advance_outcome',apply(1,3,1),'stale_lease',role='worker_a');unchanged(before)
    check('new_claim_accepts_once_after_expiry',apply(1,3,2),'accepted',role='worker_b')
    claim(1,2);check('review_row_does_not_rollback_other_accepted_rows',apply(1,2),'needs_review',role='worker_a');assert h.admin("SELECT string_agg(status,',' ORDER BY row_number) FROM probe.outcomes WHERE plan=1;")=='accepted,needs_review,accepted'
    new_run(6,[row(1,'audit-fail',audit='FAIL_FIXTURE_AUDIT'),row(2,'after-failure')]);approve(6);claim(6)
    before=counts();check('provenance_failure_rolls_back_only_current_row',apply(6),state='23514',role='worker_a');unchanged(before)
    claim(6,2);check('other_row_can_accept_after_one_row_failure',apply(6,2),'accepted',role='worker_a');assert h.admin("SELECT count(*) FROM probe.outcomes WHERE plan=6;")=='1'
    new_run(7,[row(1,'parallel')]);new_run(8,[row(42,'parallel')],digest='other-export');approve(7);approve(8);claim(7);claim(8,42);before=counts()
    concurrent('two_runs_same_source_one_target','worker_a',apply(7),'worker_a',apply(8,42),lambda a,b:(a.startswith('accepted\n') and b.startswith('already_imported\n') and h.admin("SELECT count(*) FROM probe.source_keys WHERE source_id='parallel';")=='1',dict(first=a,second=b,before=before,after=counts())))
    new_run(9,[row(1,'policy-off-first')]);approve(9);claim(9);before=counts()
    concurrent('policy_off_first_blocks_row_accept','policy_manager',gate(False),'worker_a',apply(9),lambda a,b:(b.startswith('unavailable\n') and before==counts(),dict(first=a,second=b,before=before,after=counts())))
    check('revoked_import_scope_blocks_preview_egress','SELECT probe.preview(1);','unavailable')
    fixture(gate(True),'policy_manager')
    check('re_enable_does_not_revive_old_approved_plan',apply(9),'unavailable',role='worker_a')
    new_run(10,[row(1,'accept-before-off')]);approve(10);claim(10)
    concurrent('row_accept_first_then_policy_off','worker_a',apply(10),'policy_manager',gate(False),lambda a,b:(a.startswith('accepted\n') and h.admin("SELECT status FROM probe.outcomes WHERE plan=10;")=='accepted',dict(first=a,second=b,after=counts())))
    fixture(gate(True),'policy_manager')
    new_run(11,[row(1,'A',target=target(),target_revision=revision())]);approve(11);claim(11)
    concurrent('target_edit_first_conflicts_reviewed_row','missionary_a',f'SELECT probe.touch_target({target()});','worker_a',apply(11),lambda a,b:(b.startswith('target_conflict\n'),dict(first=a,second=b,target_revision=revision())))
    new_run(12,[row(1,'A',target=target(),target_revision=revision())]);approve(12);claim(12)
    concurrent('row_verify_first_then_target_edit','worker_a',apply(12),'missionary_a',f'SELECT probe.touch_target({target()});',lambda a,b:(a.startswith('already_imported\n') and b.startswith('edited\n'),dict(first=a,second=b,target_revision=revision())))
    new_run(13,[row(1,'cancel-first')]);approve(13);claim(13);before=counts()
    concurrent('cancel_first_blocks_later_accept','missionary_a','SELECT probe.cancel(13);','worker_a',apply(13),lambda a,b:(b.startswith('unavailable\n') and before==counts(),dict(first=a,second=b,before=before,after=counts())))
    new_run(14,[row(1,'accepted-before-cancel'),row(2,'unprocessed-after-cancel')]);approve(14);claim(14);claim(14,2)
    concurrent('row_accept_first_then_cancel_preserves_it','worker_a',apply(14),'missionary_a','SELECT probe.cancel(14);',lambda a,b:(a.startswith('accepted\n') and b.startswith('cancelled\n') and h.admin('SELECT count(*) FROM probe.outcomes WHERE plan=14;')=='1',dict(first=a,second=b,after=counts())))
    before=counts();check('cancel_keeps_accepted_and_stops_unprocessed_row',apply(14,2),'unavailable',role='worker_a');unchanged(before)
    check('unsafe_file_row_keys_duplicate_and_rebind',"WITH x(file,n,source) AS(VALUES('a',1,'A'),('a',2,'B'),('b',1,'B'),('b',2,'A')) SELECT count(DISTINCT file||n)::text||':'||count(DISTINCT source)||':'||(SELECT count(*) FROM x a JOIN x b USING(n) WHERE a.file='a' AND b.file='b' AND a.source<>b.source) FROM x;",'4:2:2',counterexample=True)
    expiry_while_waiting()
    assert h.admin('SELECT count(*) FROM probe.dark_effects;')=='0'
    h.RESULTS[-1]['final_dark_effects']=0


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','missionary_a','staff_a','worker_a','worker_b','policy_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('missionary_a','staff_a','worker_a','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D17 stable-source-ID import staging, row acceptance, leases and current-authority mechanics only; not Core/P12/Supabase/Auth/PostgREST/API qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
