#!/usr/bin/env python3
"""Disposable D16 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d16-pg'
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



def intent(ident,amount='15000',currency='USD',basis='monthly_equivalent',kind='missionary',actor='missionary_a',audit='ok',period_start=None,period_end=None):
    lo='NULL' if period_start is None else "date '"+period_start+"'"
    hi='NULL' if period_end is None else "date '"+period_end+"'"
    fixture(f"INSERT INTO probe.intents SELECT h.tenant,'{ident}',h.entity,h.kind,h.subject,'{actor}',h.revision,a.revision,{amount},'{currency}','{basis}',{lo},{hi},date '2026-10-16','{audit}' FROM probe.heads h JOIN probe.authority a ON (h.tenant,h.entity,h.kind,h.subject)=(a.tenant,a.entity,a.kind,a.subject) WHERE h.tenant=1 AND h.entity=10 AND h.kind='{kind}' AND h.subject=1 AND a.actor='{actor}';")


def save_sql(ident,key=None):
    return f"SELECT probe.save_goal('{ident}','{key or ident}');"


def state():
    return h.admin("SELECT h.revision||':'||(SELECT count(*) FROM probe.goal_versions)||':'||(SELECT count(*) FROM probe.receipts)||':'||(SELECT count(*) FROM probe.audit)||':'||(SELECT count(*) FROM probe.attempts) FROM probe.heads h WHERE h.kind='missionary';")


def check_unchanged(before):
    after=state();h.RESULTS[-1]['source_atomicity']=dict(before=before,after=after)
    if after!=before:
        h.RESULTS[-1]['passed']=False
        raise AssertionError('Expected unchanged source state')


def head():
    return int(h.admin("SELECT revision FROM probe.heads WHERE kind='missionary';"))


def policy(allowed):
    return f"UPDATE probe.authority SET can_edit={str(allowed).lower()},revision=revision+1 WHERE tenant=1 AND kind='missionary' AND actor='missionary_a';"


def policy_state():
    return h.admin("SELECT can_edit::text||':'||revision FROM probe.authority WHERE tenant=1 AND kind='missionary' AND actor='missionary_a';")


def concurrent(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def scenarios():
    check('unset_goal_is_not_zero',"SELECT probe.current_goal('project',1);",'unset')
    intent('first')
    check('save_appends_goal_and_advances_head',save_sql('first')+"SELECT probe.current_goal('missionary',1);",'accepted:2:current\n2:15000:USD:monthly_equivalent')
    assert state()=='2:2:1:1:1'
    check('immutable_version_rejects_in_place_mutation',"UPDATE probe.goal_versions SET amount_minor=999 WHERE kind='missionary' AND version=1;",state='55000',role='postgres')
    check('direct_goal_write_denied',"UPDATE probe.goal_versions SET amount_minor=1 WHERE tenant=1;",state='42501')
    check('cross_tenant_entity_subject_FK_rejected',"INSERT INTO probe.goal_versions VALUES(1,20,'missionary',1,99,100,'USD','monthly_equivalent',NULL,NULL,'2026-10-16','staff_a');",state='23503',role='postgres')
    intent('project',amount='200000',currency='JPY',basis='finite_period',kind='project',period_start='2026-10-01',period_end='2026-12-01')
    check('typed_project_goal_is_separate_source',save_sql('project')+"SELECT probe.current_goal('project',1); SELECT probe.current_goal('missionary',1);",'accepted:1:current\n1:200000:JPY:finite_period\n2:15000:USD:monthly_equivalent')
    before=state();check('duplicate_save_same_request_is_one_effect',save_sql('first'),'accepted:2:current');check_unchanged(before)
    before=state();check('same_intent_new_request_key_has_no_new_version',save_sql('first','first-retry'),'accepted:2:current')
    after=state();h.RESULTS[-1]['semantic_effect_counts']=dict(before=before,after=after)
    assert before.rsplit(':',1)[0]==after.rsplit(':',1)[0] and int(after.rsplit(':',1)[1])==int(before.rsplit(':',1)[1])+1
    intent('changed-payload',amount='16000')
    check('same_request_key_cannot_change_semantic_intent',save_sql('changed-payload','first'),'conflict')
    # Earlier source revision on a distinct captured intent remains a stale editor, not a retry.
    fixture("INSERT INTO probe.intents SELECT tenant,'stale-editor',entity,kind,subject,actor,1,authority_revision,amount_input,currency,basis,period_start,period_end,effective_from,audit_note FROM probe.intents WHERE id='changed-payload';")
    check('stale_editor_cannot_overwrite_head',save_sql('stale-editor'),'conflict')
    for label,value in [('zero','0'),('null','NULL'),('fraction','1.5'),('nan',"'NaN'::numeric"),('overflow','9223372036854775808')]:intent(label,amount=value)
    before=state();check('invalid_minor_unit_inputs_do_not_create_goals',''.join(save_sql(k) for k in ['zero','null','fraction','nan','overflow']),'invalid_amount\ninvalid_amount\ninvalid_amount\ninvalid_amount\ninvalid_amount');check_unchanged(before)
    check('unsafe_integer_cast_rounds_fractional_input','SELECT (1.5::numeric)::bigint;','2',counterexample=True)
    intent('currency-change',amount='30000',currency='JPY')
    check('currency_change_is_new_explicit_goal_not_FX',save_sql('currency-change')+"SELECT probe.current_goal('missionary',1);",'accepted:3:current\n3:30000:JPY:monthly_equivalent')
    intent('bad-basis',period_start='2026-10-01',period_end='2026-12-01')
    check('incompatible_period_basis_rejected',save_sql('bad-basis'),'invalid_meaning')
    intent('audit-failure',amount='99999',audit='FAIL_FIXTURE_AUDIT')
    before=state();check('audit_failure_rolls_back_version_head_receipt',save_sql('audit-failure'),state='23514');check_unchanged(before)
    check('public_pin_and_finance_are_not_goal_write_effects',"SELECT p.version||':'||v.amount_minor||':'||v.currency||':'||f.approved_plan_amount||':'||f.recorded_gifts||':'||f.commitments FROM probe.public_pin p JOIN probe.goal_versions v USING(tenant,entity,kind,subject,version) JOIN probe.finance f USING(tenant);",'1:10000:USD:12000:5000:3000',role='postgres')
    intent('parallel-duplicate',amount='31000',currency='JPY');n=head()+1;before=state()
    concurrent('same_intent_different_keys_one_version','missionary_a',save_sql('parallel-duplicate','duplicate-a'),'missionary_a',save_sql('parallel-duplicate','duplicate-b'),lambda a,b:(a.startswith(f'accepted:{n}:current\n') and b.startswith(f'accepted:{n}:current\n') and head()==n,dict(first=a,second=b,before=before,after=state())))
    intent('missionary-editor',amount='32000',currency='JPY');intent('staff-editor',amount='33000',currency='JPY',actor='staff_a');n=head()+1
    concurrent('missionary_staff_edit_same_head_CAS','missionary_a',save_sql('missionary-editor'),'staff_a',save_sql('staff-editor'),lambda a,b:(a.startswith(f'accepted:{n}:current\n') and b.startswith('conflict\n') and head()==n,dict(first=a,second=b,current=state())))
    intent('off-first',amount='34000',currency='JPY');before=state()
    concurrent('permission_off_first_blocks_save','policy_manager',policy(False),'missionary_a',save_sql('off-first'),lambda a,b:(b.startswith('unavailable\n') and state()==before,dict(first=a,second=b,current=state(),policy=policy_state())))
    fixture(policy(True),'policy_manager');intent('save-first',amount='35000',currency='JPY');n=head()+1
    concurrent('save_first_then_permission_off','missionary_a',save_sql('save-first'),'policy_manager',policy(False),lambda a,b:(a.startswith(f'accepted:{n}:current\n') and head()==n and policy_state().startswith('false:'),dict(first=a,second=b,current=state(),policy=policy_state())))
    check('edit_permission_off_preserves_visible_goal',"SELECT probe.current_goal('missionary',1);",f'{n}:35000:JPY:monthly_equivalent')
    check('old_accepted_receipt_does_not_bypass_current_edit_gate',save_sql('save-first','off-retry'),'unavailable')
    # Capturing this pending intent while off is only a fixture for the A-B-A evidence test.
    intent('old-policy-evidence',amount='36000',currency='JPY')
    fixture(policy(True),'policy_manager')
    check('permission_restore_does_not_accept_stale_evidence',save_sql('old-policy-evidence'),'conflict')
    intent('restored-fresh',amount='37000',currency='JPY');n=head()+1
    check('fresh_authorized_intent_after_restore_succeeds',save_sql('restored-fresh'),f'accepted:{n}:current')
    check('accepted_receipt_is_not_current_goal',save_sql('first','late-first-retry'),'accepted:2:superseded')
    final=h.admin("SELECT p.version||':'||v.amount_minor||':'||v.currency||':'||f.approved_plan_amount||':'||f.recorded_gifts||':'||f.commitments FROM probe.public_pin p JOIN probe.goal_versions v USING(tenant,entity,kind,subject,version) JOIN probe.finance f USING(tenant);")
    assert final=='1:10000:USD:12000:5000:3000'
    h.RESULTS[-1]['final_independent_sources']=final


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','missionary_a','staff_a','policy_manager') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('missionary_a','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D16 immutable goal, exact intent, authority/CAS and source-separation mechanics only; not Core/P12/Supabase/Auth/PostgREST/API qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
