#!/usr/bin/env python3
"""Disposable D7 PostgreSQL mechanics; no Core/Supabase/provider qualification."""
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
h = importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
h.NAME = 'phase28-d7-pg'; h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'
FIXTURE_STEPS = []

def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')

def fixture(query, role='postgres'):
    result = h.sql(query, role)
    FIXTURE_STEPS.append(dict(role=role, sql=query, exit_code=result.returncode, stdout=result.stdout.strip(), stderr=result.stderr.strip()))
    if result.returncode: raise RuntimeError(result.stderr)
    return result.stdout.strip()

def check(name, query, expected=None, state=None, role='actor_a', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)

def authorize(issue, request=None, content=1, audience=1, tenant=1, actor='actor_a'):
    return f"SELECT probe.authorize({tenant},'{actor}',{issue},{content},{audience},'{request or 'issue-'+str(issue)}');"

def dispatch(issue, member=1):
    return f'SELECT probe.dispatch(1,{issue},{member});'

def cancel(issue):
    return f'SELECT probe.cancel(1,{issue});'

def snapshot(issue):
    return h.admin(f"SELECT (SELECT state FROM probe.issues WHERE tenant=1 AND id={issue})||'|'||(SELECT count(*) FROM probe.releases WHERE tenant=1 AND issue={issue})||'|'||(SELECT count(*) FROM probe.audit WHERE tenant=1 AND issue={issue})||'|'||COALESCE((SELECT string_agg(member||':'||state,',' ORDER BY member) FROM probe.effects WHERE tenant=1 AND issue={issue}),'none');")

def scenarios():
    check('one_authorization_commits_source_release_audit_effects', authorize(1), 'accepted:1')
    check('same_operation_doubleclick_recovers_same_release', authorize(1), 'accepted_history:1')
    check('different_request_key_same_issue_recovers_same_release', authorize(1,'different-key'), 'accepted_history:1')
    check('new_retry_key_cannot_be_rebound_to_another_issue', authorize(2,'different-key'), 'operation_conflict')
    check('one_source_issue_has_one_release_audit_two_recipient_effects', "SELECT (SELECT count(*) FROM probe.releases WHERE tenant=1 AND issue=1)||':'||(SELECT count(*) FROM probe.audit WHERE tenant=1 AND issue=1)||':'||(SELECT count(*) FROM probe.effects WHERE tenant=1 AND issue=1);", '1:1:2', role='postgres')
    check('approval_of_changed_already_released_meaning_conflicts', authorize(1,'changed',content=2), 'release_conflict')
    check('source_audit_and_effects_rollback_on_injected_effect_failure', authorize(90), state='23514')
    check('failed_release_has_no_partial_source_audit_operation_or_intent', "SELECT (SELECT state FROM probe.issues WHERE tenant=1 AND id=90)||':'||(SELECT count(*) FROM probe.releases WHERE issue=90)||':'||(SELECT count(*) FROM probe.audit WHERE issue=90)||':'||(SELECT count(*) FROM probe.effects WHERE issue=90)||':'||(SELECT count(*) FROM probe.operations WHERE issue=90);", 'draft:0:0:0:0', role='postgres')
    fixture('UPDATE probe.issues SET content_revision=2 WHERE tenant=1 AND id=3; INSERT INTO probe.revisions VALUES(1,3,2,1,\'content-two\',\'audience-one\');')
    check('stale_content_approval_is_rejected', authorize(3), 'stale_approval')
    fixture('UPDATE probe.issues SET audience_revision=2 WHERE tenant=1 AND id=4; INSERT INTO probe.revisions VALUES(1,4,1,2,\'content-one\',\'audience-two\');')
    check('stale_audience_approval_is_rejected', authorize(4), 'stale_approval')
    check('cross_tenant_argument_cannot_select_source', authorize(1,tenant=2), 'unavailable')
    check('forged_actor_argument_is_rejected', authorize(2,actor='actor_other'), 'unavailable')
    check('other_actor_cannot_authorize_owner_issue', authorize(2,actor='actor_other'), 'unavailable', role='actor_other')
    check('other_actor_can_authorize_their_own_issue', authorize(21,actor='actor_other'), 'accepted:21', role='actor_other')
    check('forged_GUC_does_not_override_fixture_session_binding', "SET app.tenant='2'; SET app.actor='actor_a'; "+authorize(1,tenant=2), 'unavailable')
    check('raw_table_select_not_granted_to_actor', 'SELECT * FROM probe.releases;', state='42501')
    check('raw_source_update_not_granted_to_actor', "UPDATE probe.issues SET actor='actor_other' WHERE tenant=1 AND id=2;", state='42501')
    check('actor_cannot_call_dispatch_function', dispatch(1), state='42501')
    check('raw_RLS_old_row_scope_hides_other_actor', "WITH changed AS(UPDATE probe.raw_mutation_probe SET value='bad' WHERE id=2 RETURNING id) SELECT count(*) FROM changed;", '0', role='mutation_probe')
    check('implicit_WITH_CHECK_rejects_new_tenant', 'UPDATE probe.raw_mutation_probe SET tenant=2 WHERE id=1;', state='42501', role='mutation_probe')
    check('implicit_WITH_CHECK_rejects_new_actor', "UPDATE probe.raw_mutation_probe SET actor='actor_other' WHERE id=1;", state='42501', role='mutation_probe')
    check('raw_RLS_positive_permitted_value_change', "UPDATE probe.raw_mutation_probe SET value='allowed' WHERE id=1; SELECT value FROM probe.raw_mutation_probe WHERE id=1;", 'allowed', role='mutation_probe')
    check('cross_tenant_release_FK_rejects_mismatched_revision', "INSERT INTO probe.releases VALUES(2,2,'actor_tenant_two',1,1,1);", state='23503', role='postgres')
    check('approved_release_content_cannot_be_mutated_by_app_role', 'UPDATE probe.releases SET content_revision=2 WHERE tenant=1 AND issue=1;', state='42501')
    h.concurrent('simultaneous_different_keys_one_source_release', 'actor_a', authorize(5,'race-a'), 'actor_a', authorize(5,'race-b'), lambda a,b: (a.startswith('accepted:5\n') and b.startswith('accepted_history:5\n') and snapshot(5)=='released|1|1|1:pending,2:pending', dict(first=a,second=b,final=snapshot(5))))
    fixture(authorize(6),'actor_a')
    h.concurrent('cancel_first_fences_waiting_dispatch', 'actor_a', cancel(6), 'dispatch_worker', dispatch(6), lambda a,b: (a.startswith('canceled_remaining:2;not_recalled:0\n') and b.startswith('canceled:1:newsletter:6:1\n') and snapshot(6)=='canceled|1|1|1:canceled,2:canceled',dict(first=a,second=b,final=snapshot(6))))
    fixture(authorize(7),'actor_a')
    h.concurrent('dispatch_first_cannot_recall_admitted_unknown', 'dispatch_worker', dispatch(7), 'actor_a', cancel(7), lambda a,b: (a.startswith('admitted_unknown:1:newsletter:7:1\n') and b.startswith('canceled_remaining:1;not_recalled:1\n') and snapshot(7)=='canceled|1|1|1:admitted_unknown,2:canceled',dict(first=a,second=b,final=snapshot(7))))
    check('unknown_retry_retains_exact_effect_without_replacement', dispatch(7), 'admitted_unknown:1:newsletter:7:1', role='dispatch_worker')
    check('changed_provider_effect_key_cannot_attach_evidence', "SELECT probe.provider_result(1,7,1,'invented-key');", 'unavailable', role='dispatch_worker')
    check('late_exact_provider_acceptance_preserves_canceled_remaining', "SELECT probe.provider_result(1,7,1,'1:newsletter:7:1');", 'accepted', role='dispatch_worker')
    check('accepted_effect_retry_does_not_create_new_pending_effect', dispatch(7), 'accepted:1:newsletter:7:1', role='dispatch_worker')
    check('old_authorization_retry_cannot_reopen_canceled_issue', authorize(7,'after-cancel'), 'accepted_history:7')
    check('canceled_release_history_and_accepted_effect_remain_truthful', "SELECT (SELECT state FROM probe.issues WHERE tenant=1 AND id=7)||':'||(SELECT count(*) FROM probe.effects WHERE tenant=1 AND issue=7)||':'||(SELECT state FROM probe.effects WHERE tenant=1 AND issue=7 AND member=2);", 'canceled:2:canceled', role='postgres')
    fixture(authorize(8),'actor_a')
    h.concurrent('authority_revocation_first_fences_dispatch', 'authority_manager', "UPDATE probe.authority SET active=false,revision=revision+1 WHERE tenant=1 AND actor='actor_a';", 'dispatch_worker', dispatch(8), lambda a,b:(b.startswith('blocked:1:newsletter:8:1\n') and snapshot(8)=='released|1|1|1:blocked,2:pending',dict(first=a,second=b,final=snapshot(8))))
    check('revoked_actor_cannot_authorize_new_issue', authorize(9), 'unavailable')
    fixture("UPDATE probe.authority SET active=true WHERE tenant=1 AND actor='actor_a';",'authority_manager')
    check('re_enable_does_not_revive_unprocessed_old_epoch_effect', dispatch(8,2), 'blocked:1:newsletter:8:2',role='dispatch_worker')
    fixture(authorize(9),'actor_a')
    h.concurrent('dispatch_first_then_revocation_preserves_unknown', 'dispatch_worker', dispatch(9), 'authority_manager', "UPDATE probe.authority SET active=false,revision=revision+1 WHERE tenant=1 AND actor='actor_a';",lambda a,b:(a.startswith('admitted_unknown:1:newsletter:9:1\n') and snapshot(9)=='released|1|1|1:admitted_unknown,2:pending',dict(first=a,second=b,final=snapshot(9))))
    fixture("UPDATE probe.authority SET active=true WHERE tenant=1 AND actor='actor_a';",'authority_manager')
    fixture(authorize(10),'actor_a')
    h.concurrent('recipient_withdrawal_first_fences_dispatch', 'authority_manager', 'UPDATE probe.recipients SET eligible=false,revision=revision+1 WHERE tenant=1 AND id=1;', 'dispatch_worker',dispatch(10),lambda a,b:(b.startswith('blocked:1:newsletter:10:1\n') and snapshot(10)=='released|1|1|1:blocked,2:pending',dict(first=a,second=b,final=snapshot(10))))
    fixture('UPDATE probe.recipients SET eligible=true WHERE tenant=1 AND id=1;','authority_manager')
    check('contact_revision_change_cannot_retarget_old_effect', dispatch(10), 'blocked:1:newsletter:10:1',role='dispatch_worker')
    check('unchanged_other_recipient_remains_independently_eligible', dispatch(10,2), 'admitted_unknown:1:newsletter:10:2',role='dispatch_worker')
    check('final_release_audit_and_recipient_effect_cardinality', "SELECT (SELECT count(*) FROM probe.releases)||':'||(SELECT count(*) FROM probe.audit)||':'||(SELECT count(*) FROM probe.effects);", '8:8:16',role='postgres')

def main():
    start=h.docker(['run','--name',h.NAME,'--rm','--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','-d',IMAGE])
    if start.returncode: raise RuntimeError(start.stderr)
    container_id=start.stdout.strip(); cleanup=dict(container=h.NAME,container_id=container_id,volume_names=[])
    try:
        details=json.loads(h.docker(['inspect',h.NAME]).stdout)[0]
        assert details['HostConfig']['NetworkMode']=='none' and not details['HostConfig']['PortBindings'] and not details['NetworkSettings']['Ports']
        cleanup['volume_names']=[m['Name'] for m in details['Mounts'] if m['Type']=='volume']
        deadline=time.monotonic()+30
        while True:
            logs=h.docker(['logs',h.NAME])
            if 'PostgreSQL init process complete; ready for start up.' in logs.stdout+logs.stderr and h.docker(['exec',h.NAME,'pg_isready','-U','postgres']).returncode==0: break
            if time.monotonic()>deadline: raise TimeoutError('Database initialization')
            time.sleep(.2)
        save('environment.json',dict(recorded_at=datetime.now(timezone.utc).isoformat(),container=h.NAME,container_id=container_id,image=IMAGE,actual_image_id=details['Image'],network=details['HostConfig']['NetworkMode'],published_ports=details['NetworkSettings']['Ports'],volume_names=cleanup['volume_names'],server=h.admin('SELECT version();')))
        h.admin((ROOT/'setup.sql').read_text())
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','actor_a','actor_other','actor_tenant_two','dispatch_worker','authority_manager','mutation_probe') ORDER BY rolname)r;")))
        scenarios()
    finally:
        cleanup['stop_exit_code']=h.docker(['stop',h.NAME]).returncode
        deadline=time.monotonic()+15
        while True:
            cleanup['container_absent']=h.docker(['inspect',container_id]).returncode!=0
            cleanup['volumes_absent']={v:h.docker(['volume','inspect',v]).returncode!=0 for v in cleanup['volume_names']}
            if cleanup['container_absent'] and all(cleanup['volumes_absent'].values()): break
            if time.monotonic()>deadline: raise RuntimeError('Cleanup not confirmed')
            time.sleep(.2)
        cleanup['verified_at']=datetime.now(timezone.utc).isoformat(); save('cleanup.json',cleanup)

if __name__=='__main__':
    failure=None
    try: main()
    except Exception as exc: failure=repr(exc)
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D7 authorization, release, RLS, atomicity and dispatch-admission mechanics only; no Core/Supabase/provider/human-intent qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result); print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure: raise SystemExit(1)
