#!/usr/bin/env python3
"""Disposable D22 falsification: synthetic PostgreSQL, never Core or hosted Supabase."""
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
h.NAME = 'phase28-d22-pg'
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


def check(name, query, expected=None, state=None, role='policy_editor', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)



def lit(value):
    if value is None:return 'NULL'
    if isinstance(value,int):return str(value)
    return "'"+str(value).replace("'","''")+"'"




def setpolicy(rev,threshold=100,enabled=True,c='USD',note='policy'):
    return f'SELECT probe.save_policy({lit(c)},{rev},{str(enabled).lower()},{lit(threshold)},{lit(note)});'


def capture(g,amount=100,c='USD',ready=True,origin='live'):
    return f'SELECT probe.capture({lit(c)},{g},{lit(amount)},{str(ready).lower()},{lit(origin)});'


def admit(g,note='admission'):return f'SELECT probe.admit({g},{lit(note)});'


def materialize(g):return f'SELECT probe.materialize({g});'


def change(g,amount,expected=1):return f'SELECT probe.change_source({g},{expected},{lit(amount)},true);'


def rev(c='USD'):return int(h.admin(f'SELECT revision FROM probe.policy_heads WHERE tenant=1 AND currency={lit(c)};'))


def reset(threshold=100,enabled=True,c='USD'):
    return fixture(setpolicy(rev(c),threshold,enabled,c),'policy_editor')


def counts():return h.admin("SELECT (SELECT count(*) FROM probe.policy_versions)||':'||(SELECT count(*) FROM probe.intents)||':'||(SELECT count(*) FROM probe.materialized)||':'||(SELECT count(*) FROM probe.audit);")


def unchanged(before):
    after=counts();h.RESULTS[-1]['counts']=dict(before=before,after=after)
    if before!=after:h.RESULTS[-1]['passed']=False;raise AssertionError('Unexpected accepted state/evidence change')


def race(name,*args):
    assert len((name+'_second').encode())<=63
    return h.concurrent(name,*args)


def scenarios():
    fixture("INSERT INTO probe.gates VALUES(1,'policy_editor',true),(1,'source_worker',true),(1,'source_owner',true),(2,'other_tenant',true); INSERT INTO probe.policy_versions VALUES(1,'USD',1,1,true,100),(1,'JPY',1,1,true,100),(1,'KWD',1,1,true,100); INSERT INTO probe.policy_heads VALUES(1,'USD',1),(1,'JPY',1),(1,'KWD',1);")
    check('unsafe_numeric_typmod_rounds_fractional_minor_unit',"SELECT 99.5::numeric(20,0)=100 AND 99.5::numeric(20,0)>=100;",'t',counterexample=True)
    check('fractional_minor_unit_threshold_rejected',setpolicy(1,'99.5'),state='23514')
    check('nonfinite_threshold_rejected',setpolicy(1,'NaN'),state='23514')
    check('zero_is_not_off',setpolicy(1,0),state='23514')
    check('enabled_requires_amount',setpolicy(1,None),state='23514')
    check('cross_currency_source_reference_rejected',"INSERT INTO probe.occurrences VALUES(1,999,'EUR',10,1,'live');",state='23503',role='postgres')
    check('raw_policy_update_denied',"UPDATE probe.policy_heads SET revision=1 WHERE tenant=1;",state='42501')
    check('policy_evidence_is_immutable',"UPDATE probe.policy_versions SET threshold=1 WHERE tenant=1;",state='55000',role='postgres')
    check('other_tenant_cannot_edit_policy',setpolicy(1,1),'unavailable',role='other_tenant')
    check('stale_settings_editor_rejected',setpolicy(0,200),'stale')
    before=counts();check('unchanged_settings_create_no_version_or_audit',setpolicy(1,100),'unchanged');unchanged(before)
    before=counts();check('policy_audit_failure_rolls_back_head',setpolicy(1,200,note='FAIL_AUDIT'),state='23514');unchanged(before);assert rev()==1
    fixture(capture(1,80),'source_owner');reset(50)
    before=counts();check('lowered_threshold_does_not_reclassify_old_live_gift',admit(1),'below',role='source_worker');unchanged(before)
    reset(100);captured=rev();fixture(capture(2,None,ready=False),'source_owner');assert fixture(admit(2),'source_worker')=='source_pending';reset(200);fixture(change(2,100),'source_owner')
    check('held_same_generation_uses_original_rule_at_equality',admit(2),'accepted',role='source_worker');assert h.admin('SELECT policy_revision FROM probe.intents WHERE gift=2;')==str(captured)
    fixture(capture(3,999,origin='history'),'source_owner');check('history_import_is_effect_dark',admit(3),'history_only',role='source_worker')
    reset(100);fixture(capture(4,100),'source_owner');fixture(admit(4),'source_worker');fixture(capture(5,100),'source_owner');reset(100,False)
    check('off_blocks_unadmitted_candidate',admit(5),'inactive_generation',role='source_worker')
    check('accepted_receipt_and_intent_survive_off',admit(4)+' '+materialize(4),'receipt:accepted\nmaterialized',role='source_worker')
    reset(100,True)
    check('reenable_does_not_revive_unadmitted_old_generation',admit(5),'inactive_generation',role='source_worker')
    fixture(capture(6,100),'source_owner');fixture(admit(6),'source_worker');fixture(change(6,0),'source_owner')
    check('old_receipt_is_not_current_materialization_permission',admit(6)+' '+materialize(6),'receipt:accepted\nsource_changed',role='source_worker')
    fixture("UPDATE probe.gates SET allowed=false WHERE tenant=1 AND actor='source_worker';",'policy_revoker')
    check('revoked_worker_cannot_disclose_receipt_or_materialize',admit(4)+' '+materialize(4),'unavailable\nunavailable',role='source_worker')
    fixture("UPDATE probe.gates SET allowed=true WHERE tenant=1 AND actor='source_worker';",'policy_revoker')
    # Seven real independent-session races; no timestamps/sleeps substituted for observing waits.
    current=rev()
    race('two_setting_editors_one_expected_head','policy_editor',setpolicy(current,150),'policy_editor',setpolicy(current,250),lambda a,b:(a.startswith('policy:') and b.startswith('stale\n') and rev()==current+1,dict(first=a,second=b)))
    reset(100);fixture(capture(7,100),'source_owner');current=rev()
    race('off_first_prevents_new_admission','policy_editor',setpolicy(current,100,False),'source_worker',admit(7),lambda a,b:(b.startswith('inactive_generation\n') and h.admin('SELECT count(*) FROM probe.intents WHERE gift=7;')=='0',dict(first=a,second=b)))
    reset(100);fixture(capture(8,100),'source_owner');current=rev()
    race('admission_first_survives_off_as_existing_work','source_worker',admit(8),'policy_editor',setpolicy(current,100,False),lambda a,b:(a.startswith('accepted\n') and h.admin('SELECT count(*) FROM probe.intents WHERE gift=8;')=='1',dict(first=a,second=b)))
    assert fixture(materialize(8),'source_worker')=='materialized'
    reset(100);current=rev()
    race('threshold_edit_first_binds_new_rule_at_capture','policy_editor',setpolicy(current,200),'source_owner',capture(9,150),lambda a,b:(b.startswith('captured:'+str(current+1)+'\n') and h.admin('SELECT original_policy FROM probe.occurrences WHERE gift=9;')==str(current+1),dict(first=a,second=b)))
    assert fixture(admit(9),'source_worker')=='below'
    reset(100);current=rev()
    race('live_capture_first_retains_prior_rule','source_owner',capture(10,150),'policy_editor',setpolicy(current,200),lambda a,b:(a.startswith('captured:'+str(current)+'\n') and h.admin('SELECT original_policy FROM probe.occurrences WHERE gift=10;')==str(current),dict(first=a,second=b)))
    assert fixture(admit(10),'source_worker')=='accepted'
    reset(100);fixture(capture(11,100),'source_owner')
    race('source_correction_first_blocks_admission','source_owner',change(11,0),'source_worker',admit(11),lambda a,b:(b.startswith('below\n') and h.admin('SELECT count(*) FROM probe.intents WHERE gift=11;')=='0',dict(first=a,second=b)))
    fixture(capture(12,100),'source_owner')
    race('admission_first_retains_receipt_before_correction','source_worker',admit(12),'source_owner',change(12,0),lambda a,b:(a.startswith('accepted\n') and h.admin('SELECT count(*) FROM probe.intents WHERE gift=12;')=='1',dict(first=a,second=b)))
    assert fixture(materialize(12),'source_worker')=='source_changed'
    before=counts();check('repeat_materialization_does_not_repeat_effect',materialize(4),'receipt:materialized',role='source_worker');unchanged(before)
    fixture(capture(13,100,c='JPY'),'source_owner');fixture(capture(14,99,c='KWD'),'source_owner')
    check('currency_specific_minor_units_equality_and_below',admit(13)+' '+admit(14),'accepted\nbelow',role='source_worker')


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('fixture_owner','command_executor','policy_editor','source_worker','source_owner','other_tenant','policy_revoker') ORDER BY rolname)r;")))
        save('privileges.json',dict(tables=json.loads(h.admin("SELECT json_agg(t) FROM(SELECT c.relname,r.rolname,has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='probe' AND c.relkind IN('r','v') AND r.rolname IN('policy_editor','other_tenant','source_worker','command_executor') ORDER BY c.relname,r.rolname)t;")),functions=json.loads(h.admin("SELECT json_agg(f) FROM(SELECT p.proname,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='probe' ORDER BY p.proname)f;"))))
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
    result=dict(recorded_at=datetime.now(timezone.utc).isoformat(),scope='Synthetic D22 captured policy revision/generation, prospective amount admission, durable accepted intent and current-authority mechanics only; not Core/financial/recognition/P12/Supabase/Auth/PostgREST qualification.',outcomes=len(h.RESULTS),passed=sum(r['passed'] for r in h.RESULTS),failure=failure,artifact_sha256={n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},helper_sha256=hashlib.sha256(HELPER.read_bytes()).hexdigest(),fixture_steps=FIXTURE_STEPS,results=h.RESULTS)
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure:
        raise SystemExit(1)
