#!/usr/bin/env python3
"""Disposable D8 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d8-pg'
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


def check(name, query, expected=None, state=None, role='coach_a', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)


def accept(i, tenant=1):
    return f'SELECT probe.accept({tenant},{i});'


def revoke(i):
    return f'SELECT probe.revoke(1,{i});'


def read(subject=10, module='goals', tenant=1):
    return f"SELECT probe.summary({tenant},{subject},'{module}');"


def invite(i):
    return f"SELECT probe.invite(1,{i},10,'coach_a',ARRAY['goals']);"


def status(i):
    return h.admin(f"SELECT COALESCE((SELECT state FROM probe.invitations WHERE tenant=1 AND id={i}),'absent')||':'||(SELECT count(*) FROM probe.grants WHERE tenant=1 AND invitation={i} AND active)||':'||(SELECT count(*) FROM probe.audit WHERE tenant=1 AND invitation={i} AND event='accepted');")


def concurrent(name, *args):
    assert len((name+'_second').encode()) <= 63, 'Application name would be truncated'
    return h.concurrent(name, *args)


def scenarios():
    check('pending_invitation_grants_no_projection', read(), 'unavailable')
    check('wrong_human_cannot_accept_other_coach_invitation', accept(1), 'unavailable', role='coach_b')
    check('cross_tenant_argument_is_denied', accept(1,2), 'unavailable')
    check('inactive_current_membership_cannot_accept', accept(10), 'unavailable', role='coach_inactive')
    check('expired_pending_invitation_cannot_accept', accept(9), 'unavailable')
    check('other_tenant_coach_accepts_only_its_own_target', accept(1,2)+read(30,tenant=2), 'accepted:1\n1:9999', role='coach_tenant_two')
    check('exact_human_accepts_one_invitation', accept(1), 'accepted:1')
    check('authorized_projection_before_aggregation', read(), '2:30')
    check('one_module_does_not_grant_other_module', read(module='tasks'), 'unavailable')
    check('one_missionary_target_does_not_grant_another', read(20), 'unavailable')
    check('second_coach_has_independent_resource_scope', accept(2)+read(module='tasks'), 'accepted:2\n1:7', role='coach_b')
    check('one_coach_can_hold_two_exact_resource_grants', accept(3)+read(20), 'accepted:3\n1:900')
    check('second_coach_does_not_inherit_first_coach_resources', read(20), 'unavailable', role='coach_b')
    check('coach_cannot_read_private_source_rows', 'SELECT * FROM probe.private_records;', state='42501')
    check('coach_cannot_read_projection_base_rows', 'SELECT * FROM probe.projection_rows;', state='42501')
    check('invoker_summary_view_still_needs_base_permissions', 'SELECT * FROM probe.invoker_summary;', state='42501')
    check('coach_raw_accept_or_target_rewrite_denied', "UPDATE probe.invitations SET state='accepted',subject=20 WHERE tenant=1 AND id=9;", state='42501')
    check('forged_client_claim_does_not_widen_current_reader', "SET probe.old_claim='true'; SET app.tenant='2'; SET app.subject='20'; "+read(module='tasks'), 'unavailable')
    check('unsafe_aggregate_then_authorize_leaks_other_target_total', "SELECT probe.unsafe_aggregate(10,'goals');", '3:930', counterexample=True)
    fixture('UPDATE probe.subjects SET source_revision=2 WHERE tenant=1 AND id=10;', 'gate_manager')
    check('stale_materialized_projection_is_unavailable_not_zero', read(), 'unavailable')
    fixture('UPDATE probe.subjects SET source_revision=1 WHERE tenant=1 AND id=10;', 'gate_manager')
    check('composite_source_fk_rejects_grant_target_substitution', "UPDATE probe.grants SET subject=20 WHERE tenant=1 AND invitation=1;", state='23503', role='postgres')
    check('composite_tenant_fk_rejects_cross_tenant_subject', "INSERT INTO probe.invitations VALUES(1,12,30,'coach_a','missionary_a',ARRAY['goals'],'pending',1,1,'2100-01-01Z');", state='23503', role='postgres')
    check('audit_failure_rolls_back_acceptance_and_grant', accept(90), state='23514')
    check('failed_acceptance_has_no_partial_state', "SELECT (SELECT state FROM probe.invitations WHERE tenant=1 AND id=90)||':'||(SELECT count(*) FROM probe.grants WHERE tenant=1 AND invitation=90)||':'||(SELECT count(*) FROM probe.audit WHERE tenant=1 AND invitation=90);", 'pending:0:0', role='postgres')
    concurrent('duplicate_accept_creates_one_grant_and_one_acceptance', 'coach_a', accept(4), 'coach_a', accept(4), lambda a,b:(a.startswith('accepted:4\n') and b.startswith('accepted_history:4\n') and status(4)=='accepted:1:1',dict(first=a,second=b,final=status(4))))
    fixture(revoke(4), 'missionary_a')
    concurrent('revoke_first_blocks_waiting_accept', 'missionary_a', revoke(5), 'coach_a', accept(5), lambda a,b:(b.startswith('unavailable\n') and status(5)=='revoked:0:0',dict(first=a,second=b,final=status(5))))
    concurrent('accept_first_then_revoke_retains_history_without_access', 'coach_a', accept(6), 'missionary_a', revoke(6), lambda a,b:(a.startswith('accepted:6\n') and b.startswith('revoked:6\n') and status(6)=='revoked:0:1',dict(first=a,second=b,final=status(6))))
    off='UPDATE probe.gates SET allowed=false,revision=revision+1 WHERE tenant=1;'
    concurrent('organization_disable_first_blocks_invitation', 'gate_manager', off, 'missionary_a', invite(7), lambda a,b:(b.startswith('unavailable\n') and status(7)=='absent:0:0',dict(first=a,second=b,final=status(7))))
    fixture('UPDATE probe.gates SET allowed=true,revision=revision+1 WHERE tenant=1;', 'gate_manager')
    concurrent('invite_first_then_org_off_keeps_pending', 'missionary_a', invite(8), 'gate_manager', off, lambda a,b:(a.startswith('pending:8\n') and status(8)=='pending:0:0',dict(first=a,second=b,final=status(8))))
    fixture('UPDATE probe.gates SET allowed=true,revision=revision+1 WHERE tenant=1;', 'gate_manager')
    check('gate_A_B_A_cannot_replay_stale_invitation_evidence', accept(8), 'unavailable')
    concurrent('revoke_first_fences_waiting_summary_read', 'missionary_a', revoke(1), 'coach_a', read(), lambda a,b:(b.startswith('unavailable\n') and status(1)=='revoked:0:1',dict(first=a,second=b,final=status(1))))
    concurrent('read_first_completes_before_waiting_revocation', 'coach_a', read(20), 'missionary_a', revoke(3), lambda a,b:(a.startswith('1:900\n') and b.startswith('revoked:3\n') and status(3)=='revoked:0:1',dict(first=a,second=b,final=status(3))))
    check('stale_claim_counterexample_contrasts_with_current_grant', "SET probe.old_claim='true'; SELECT probe.unsafe_claim_summary(10,'goals')||'|'||probe.summary(1,10,'goals');", '2:30|unavailable', counterexample=True)
    fixture("UPDATE probe.memberships SET active=false WHERE tenant=1 AND principal='coach_b';", 'gate_manager')
    check('current_membership_deactivation_fences_existing_grant', read(module='tasks'), 'unavailable', role='coach_b')
    check('old_acceptance_retry_cannot_revive_revoked_grant', accept(1), 'unavailable')


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','missionary_a','coach_a','coach_b','coach_inactive','coach_tenant_two','gate_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('coach_a','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D8 lifecycle, current authorization and projection mechanics only; not Core/P12/Supabase/Auth/PostgREST/API qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
