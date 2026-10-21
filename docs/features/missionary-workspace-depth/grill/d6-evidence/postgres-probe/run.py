#!/usr/bin/env python3
"""D6 provisional synthetic signup/confirmation lifecycle mechanics."""
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
h.NAME = 'phase28-d6-pg'; h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'

def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')

def check(name, query, expected=None, state=None, role='public_submit', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)

FIXTURE_STEPS=[]
def fixture(query, role='postgres'):
    r=h.sql(query,role)
    FIXTURE_STEPS.append({'role':role,'sql':query,'exit_code':r.returncode,'stdout':r.stdout.strip(),'stderr':r.stderr.strip()})
    if r.returncode: raise RuntimeError(r.stderr)
    return r.stdout.strip()

def intake(address,attempt,tenant=1,purpose='newsletter'):
    return f"SELECT probe.intake({tenant},'{purpose}','address-{address}',1,'{attempt}');"

def token(attempt):
    return h.admin(f"SELECT fixture_token FROM probe.confirmation_intents WHERE tenant=1 AND attempt='{attempt}';")

def confirm(secret,tenant=1,purpose='newsletter'):
    return f"SELECT probe.confirm_post({tenant},'{purpose}','{secret}');"

def withdraw(address):
    return f"SELECT probe.withdraw(1,'newsletter','address-{address}');"

def census_sql(address):
    return f"SELECT COALESCE((SELECT state||':'||generation||':'||consent_revision FROM probe.subscriptions WHERE tenant=1 AND purpose='newsletter' AND address_key='address-{address}'),'absent')||'|'||(SELECT count(*) FROM probe.attempts WHERE tenant=1 AND address_key='address-{address}')||'|'||(SELECT count(*) FROM probe.evidence WHERE tenant=1 AND address_key='address-{address}')||'|'||(SELECT count(*) FROM probe.confirmation_intents WHERE tenant=1 AND address_key='address-{address}');"

def census(address): return h.admin(census_sql(address))

def verify(name,query,address,expected,output='processed',role='public_submit',state=None):
    check(name,query,output,state,role)
    observed=census(address)
    h.RESULTS[-1]['admin_readback']={'sql':census_sql(address),'expected':expected,'actual':observed}
    if observed!=expected:
        h.RESULTS[-1]['passed']=False
        raise AssertionError(name+': '+observed)

def seed(address,attempt):
    assert fixture(intake(address,attempt),'public_submit')=='processed'
    assert census(address)=='pending:1:1|1|1|1'
    return token(attempt)

def scenarios():
    verify('intake_atomically_creates_pending_evidence_and_intent',intake(1,'a'),1,'pending:1:1|1|1|1')
    a=token('a')
    verify('GET_lookup_does_not_confirm_or_mutate',f"SELECT probe.lookup_get(1,'newsletter','{a}');",1,'pending:1:1|1|1|1','confirmation page','public_lookup')
    verify('same_attempt_retry_has_no_duplicate_confirmation_effect',intake(1,'a'),1,'pending:1:1|1|1|1')
    verify('attempt_key_cannot_be_rebound_to_another_address',intake(2,'a'),2,'absent|0|0|0')
    verify('confirmation_is_scoped_to_tenant_and_purpose',confirm(a,2)+confirm(a,1,'other-purpose'),1,'pending:1:1|1|1|1','processed\nprocessed')
    verify('explicit_confirmation_commits_one_confirmed_evidence',confirm(a),1,'confirmed:1:2|1|2|1')
    verify('withdrawal_changes_consent_revision',withdraw(1),1,'withdrawn:1:3|1|3|1',role='withdrawal_authority')
    verify('old_token_and_old_intake_receipt_cannot_reactivate',confirm(a)+intake(1,'a'),1,'withdrawn:1:3|1|3|1','processed\nprocessed')
    verify('new_deliberate_signup_has_new_generation',intake(1,'b'),1,'pending:2:4|2|4|2')
    verify('old_generation_token_cannot_confirm_new_pending_generation',confirm(a),1,'pending:2:4|2|4|2')
    verify('new_generation_requires_its_own_confirmation',confirm(token('b')),1,'confirmed:2:5|2|5|2')
    p=seed(3,'purpose-stop')
    fixture("UPDATE probe.purposes SET purpose_allowed=false,purpose_revision=purpose_revision+1 WHERE tenant=1 AND purpose='newsletter';",'policy_manager')
    verify('purpose_withdrawal_blocks_accepted_pending_confirmation',confirm(p),3,'pending:1:1|1|1|1')
    fixture("UPDATE probe.purposes SET purpose_allowed=true WHERE tenant=1 AND purpose='newsletter';",'policy_manager')
    verify('purpose_reenable_does_not_revive_old_token_evidence',confirm(p),3,'pending:1:1|1|1|1')
    expired=seed(4,'expiry')
    fixture("UPDATE probe.attempts SET expires_at=clock_timestamp()-interval '1 second' WHERE tenant=1 AND attempt='expiry';")
    verify('expired_token_cannot_confirm',confirm(expired),4,'pending:1:1|1|1|1')
    revised=seed(5,'address-revision')
    fixture("UPDATE probe.addresses SET address_revision=2 WHERE tenant=1 AND address_key='address-5';",'policy_manager')
    verify('old_address_revision_token_cannot_confirm',confirm(revised),5,'pending:1:1|1|1|1')
    suppressed=seed(6,'suppression')
    fixture("UPDATE probe.addresses SET suppressed=true WHERE tenant=1 AND address_key='address-6';",'policy_manager')
    verify('suppression_blocks_pending_confirmation',confirm(suppressed),6,'pending:1:1|1|1|1')
    fixture(withdraw(6),'withdrawal_authority')
    verify('fresh_signup_does_not_clear_suppression_or_renew_generation',intake(6,'suppressed-resub'),6,'withdrawn:1:2|1|2|1')
    check('tenant_address_suppression_applies_to_other_purpose',intake(6,'other-purpose-resub',purpose='other-purpose'),'processed')
    observed=h.admin("SELECT suppressed FROM probe.addresses WHERE tenant=1 AND address_key='address-6'; SELECT count(*) FROM probe.subscriptions WHERE tenant=1 AND purpose='other-purpose' AND address_key='address-6';")
    h.RESULTS[-1]['admin_readback']={'expected':'t\n0','actual':observed}
    if observed!='t\n0': raise AssertionError('Suppression scope')
    h.concurrent('public_off_first_fences_fresh_intake','policy_manager',"UPDATE probe.purposes SET intake_on=false WHERE tenant=1 AND purpose='newsletter';",'public_submit',intake(7,'off-first'),lambda a,b:(b.startswith('processed\n') and census(7)=='absent|0|0|0',{'second':b,'final':census(7)}))
    fixture("UPDATE probe.purposes SET intake_on=true WHERE tenant=1 AND purpose='newsletter';",'policy_manager')
    h.concurrent('intake_first_commits_before_public_off','public_submit',intake(8,'intake-first'),'policy_manager',"UPDATE probe.purposes SET intake_on=false WHERE tenant=1 AND purpose='newsletter';",lambda a,b:(a.startswith('processed\n') and census(8)=='pending:1:1|1|1|1',{'first':a,'final':census(8)}))
    verify('display_off_preserves_accepted_pending_confirmation',confirm(token('intake-first')),8,'confirmed:1:2|1|2|1')
    verify('display_off_does_not_unsubscribe_existing_confirmation',intake(8,'while-off'),8,'confirmed:1:2|1|2|1')
    fixture("UPDATE probe.purposes SET intake_on=true WHERE tenant=1 AND purpose='newsletter';",'policy_manager')
    w=seed(9,'withdraw-first')
    h.concurrent('withdraw_first_fences_pending_confirmation','withdrawal_authority',withdraw(9),'public_submit',confirm(w),lambda a,b:(b.startswith('processed\n') and census(9)=='withdrawn:1:2|1|2|1',{'second':b,'final':census(9)}))
    c=seed(10,'confirm-first')
    h.concurrent('confirm_first_then_withdraw_stays_withdrawn','public_submit',confirm(c),'withdrawal_authority',withdraw(10),lambda a,b:(a.startswith('processed\n') and census(10)=='withdrawn:1:3|1|3|1',{'first':a,'final':census(10)}))
    d=seed(11,'double-confirm')
    h.concurrent('concurrent_duplicate_confirmation_one_effect','public_submit',confirm(d),'public_submit',confirm(d),lambda a,b:(a.startswith('processed\n') and b.startswith('processed\n') and census(11)=='confirmed:1:2|1|2|1',{'first':a,'second':b,'final':census(11)}))
    check('public_direct_source_mutation_is_denied',"UPDATE probe.subscriptions SET state='confirmed' WHERE tenant=1;",state='42501')
    check('public_cannot_enumerate_source_rows',"SELECT * FROM probe.subscriptions;",state='42501')
    check('lookup_role_cannot_execute_confirmation_command',confirm(d),state='42501',role='public_lookup')
    check('public_cross_tenant_intake_has_same_noncommittal_result',"SELECT probe.intake(2,'newsletter','tenant-two',1,'cross-tenant');",'processed')
    cross_scope=h.admin("SELECT (SELECT count(*) FROM probe.attempts WHERE tenant=2)||':'||(SELECT count(*) FROM probe.confirmation_intents WHERE tenant=2)||':'||(SELECT state FROM probe.subscriptions WHERE tenant=2);")
    h.RESULTS[-1]['admin_readback']={'expected':'1:1:pending','actual':cross_scope}
    if cross_scope!='1:1:pending': raise AssertionError('Cross-tenant mutation')
    check('composite_intent_FK_rejects_cross_tenant_parent',"INSERT INTO probe.confirmation_intents VALUES(1,'tenant-two-attempt','newsletter','tenant-two',1,1,'synthetic');",state='23503',role='intent_writer')
    check('composite_intent_FK_rejects_changed_purpose',"UPDATE probe.confirmation_intents SET purpose='other-purpose' WHERE tenant=1 AND attempt='a';",state='23503',role='intent_writer')
    check('intent_writer_RLS_hides_other_tenant',"SELECT count(*) FROM probe.confirmation_intents WHERE tenant=2;",'0',role='intent_writer')
    verify('intent_failure_rolls_back_source_attempt_and_evidence',intake(12,'fault'),12,'absent|0|0|0',state='23514')
    check('accepted_pending_generations_have_one_evidence_and_intent',"SELECT (SELECT count(*) FROM probe.attempts WHERE tenant=1)||':'||(SELECT count(*) FROM probe.evidence WHERE tenant=1 AND kind='pending')||':'||(SELECT count(*) FROM probe.confirmation_intents WHERE tenant=1);",'10:10:10',role='postgres')


def main():
    start = h.docker(['run','--name',h.NAME,'--rm','--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','-d',IMAGE])
    if start.returncode: raise RuntimeError(start.stderr)
    container_id=start.stdout.strip()
    cleanup={'container':h.NAME,'container_id':container_id,'volume_names':[]}
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
        save('environment.json',{'recorded_at':datetime.now(timezone.utc).isoformat(),'container':h.NAME,'container_id':container_id,'image':IMAGE,'actual_image_id':details['Image'],'network':details['HostConfig']['NetworkMode'],'published_ports':details['NetworkSettings']['Ports'],'volume_names':cleanup['volume_names'],'server':h.admin('SELECT version();')})
        h.admin((ROOT/'setup.sql').read_text())
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('public_submit','public_lookup','policy_manager','withdrawal_authority','intent_writer','command_executor') ORDER BY rolname)r;")))
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
        cleanup['verified_at']=datetime.now(timezone.utc).isoformat()
        save('cleanup.json',cleanup)

if __name__=='__main__':
    failure=None
    try: main()
    except Exception as exc: failure=repr(exc)
    result={'recorded_at':datetime.now(timezone.utc).isoformat(),'scope':'Provisional synthetic D6 signup/confirmation mechanics; not ratified lifecycle policy, Core/P6 schema/API/provider, human/address-control or Supabase qualification.','outcomes':len(h.RESULTS),'passed':sum(r['passed'] for r in h.RESULTS),'failure':failure,'artifact_sha256':{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},'helper_sha256':hashlib.sha256(HELPER.read_bytes()).hexdigest(),'fixture_steps':FIXTURE_STEPS,'results':h.RESULTS}
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure: raise SystemExit(1)
