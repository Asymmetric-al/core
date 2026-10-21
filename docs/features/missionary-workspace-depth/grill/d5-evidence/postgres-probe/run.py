#!/usr/bin/env python3
"""D5 synthetic selected-field authority, atomic correction and retry mechanics."""
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
h.NAME = 'phase28-d5-pg'; h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'

def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')

def check(name, query, expected=None, state=None, role='missionary', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)

def snapshot(record):
    return h.admin(f"SELECT phone||':'||email||':'||revision FROM probe.contacts WHERE id={record};")

def scenarios():
    check('selected_field_correction_commits_source_audit_and_receipt', "SELECT probe.correct(1,'missionary',1,1,'phone-one','{\"phone\":\"phone-one\"}'); SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'accepted:2\nphone-one:2')
    check('forbidden_unchanged_field_in_full_snapshot_rejects_whole_patch', "SELECT probe.correct(1,'missionary',2,1,'full-snapshot','{\"phone\":\"phone-two\",\"email\":\"original@example.invalid\"}'); SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'forbidden_fields\nphone-one:2')
    check('changed_only_authorized_patch_succeeds', "SELECT probe.correct(1,'missionary',2,1,'phone-two','{\"phone\":\"phone-two\"}'); SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'accepted:3\nphone-two:3')
    check('editable_row_does_not_allow_tenant_author_or_revision_patch', "SELECT probe.correct(1,'missionary',3,1,'tenant-write','{\"tenant\":2}'); SELECT probe.correct(1,'missionary',3,1,'author-write','{\"source_author\":\"staff\"}'); SELECT probe.correct(1,'missionary',3,1,'version-write','{\"revision\":99}'); SELECT tenant||':'||source_author||':'||revision FROM probe.contacts WHERE id=1;", 'forbidden_fields\nforbidden_fields\nforbidden_fields\n1:missionary:3')
    check('raw_SQL_cannot_bypass_qualified_command', "UPDATE probe.contacts SET tenant=2,source_author='staff' WHERE id=1;", state='42501')
    check('wrong_active_hat_cannot_use_staff_field_authority', "SELECT probe.correct(1,'staff',3,1,'wrong-hat','{\"email\":\"wrong@example.invalid\"}');", 'unavailable')
    check('currently_authorized_staff_can_correct_email', "SELECT probe.correct(1,'staff',3,1,'staff-email','{\"email\":\"staff@example.invalid\"}'); SELECT phone||':'||email||':'||revision FROM probe.contacts WHERE id=1;", 'accepted:4\nphone-two:staff@example.invalid:4', role='staff')
    check('invalid_value_type_does_not_partially_apply_valid_name', "SELECT probe.correct(1,'missionary',4,1,'bad-type','{\"name\":\"Must not persist\",\"phone\":123}'); SELECT name||':'||revision FROM probe.contacts WHERE id=1;", 'invalid\nSynthetic One:4')
    check('database_field_constraint_aborts_whole_patch', "SELECT probe.correct(1,'missionary',4,1,'bad-length',jsonb_build_object('name','Must not persist','phone',repeat('x',33)));", state='23514')
    check('failed_patch_leaves_source_audit_and_receipts_unchanged', "SELECT name||':'||phone||':'||revision FROM probe.contacts WHERE id=1;", 'Synthetic One:phone-two:4')
    check('required_audit_failure_aborts_prior_source_update', "SELECT probe.correct(1,'missionary',4,1,'audit-fault','{\"phone\":\"must-not-persist\"}');", state='23514')
    check('audit_failure_preserves_source_version', "SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'phone-two:4')
    # Verify internal effects without granting audit/receipt contents to the application login.
    state=h.admin('SELECT (SELECT count(*) FROM probe.change_audit)||\':\'||(SELECT count(*) FROM probe.receipts);')
    if state!='3:3': raise AssertionError('Partial audit/receipt effect: '+state)
    h.RESULTS[-1]['internal_admin_readback']={'sql':"SELECT (SELECT count(*) FROM probe.change_audit)||':'||(SELECT count(*) FROM probe.receipts);",'expected':'3:3','actual':state}
    check('accepted_receipt_retry_does_not_overwrite_newer_staff_data', "SELECT probe.correct(1,'missionary',1,1,'phone-one','{\"phone\":\"phone-one\"}'); SELECT phone||':'||email||':'||revision FROM probe.contacts WHERE id=1;", 'accepted-history:2\nphone-two:staff@example.invalid:4')
    check('same_retry_key_different_patch_conflicts', "SELECT probe.correct(1,'missionary',1,1,'phone-one','{\"phone\":\"different\"}');", 'operation_conflict')
    h.concurrent('policy_revoke_first_fences_selected_field_save', 'policy_manager', "UPDATE probe.effective_authority SET allowed_fields=ARRAY['name'],revision=revision+1 WHERE actor='missionary';", 'missionary', "SELECT probe.correct(2,'missionary',1,1,'revoked-save','{\"phone\":\"must-not-persist\"}');", lambda a,b: (b.startswith('forbidden_fields\n') and snapshot(2)=='phone-original:original@example.invalid:1', {'second':b,'final':snapshot(2)}))
    check('revoked_field_authority_blocks_old_write_receipt_recovery', "SELECT probe.correct(1,'missionary',1,1,'phone-one','{\"phone\":\"phone-one\"}'); SELECT count(*) FROM probe.contacts WHERE id=1;", 'forbidden_fields\n1')
    h.admin("UPDATE probe.effective_authority SET allowed_fields=ARRAY['name','phone'],revision=revision+1 WHERE actor='missionary';")
    check('authority_A_B_A_detects_stale_fresh_command_evidence', "SELECT probe.correct(1,'missionary',4,1,'aba-stale','{\"phone\":\"must-not-persist\"}'); SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'authority_conflict\nphone-two:4')
    check('current_authority_can_recover_exact_accepted_receipt_after_A_B_A', "SELECT probe.correct(1,'missionary',1,1,'phone-one','{\"phone\":\"phone-one\"}'); SELECT phone||':'||revision FROM probe.contacts WHERE id=1;", 'accepted-history:2\nphone-two:4')
    check('current_authority_does_not_rescue_stale_source_version', "SELECT probe.correct(1,'missionary',3,3,'stale-source','{\"phone\":\"must-not-persist\"}');", 'source_conflict')
    check('fresh_source_and_authority_evidence_allow_correction', "SELECT probe.correct(1,'missionary',4,3,'fresh-save','{\"phone\":\"phone-fresh\"}');", 'accepted:5')
    h.concurrent('save_first_commits_before_waiting_policy_revocation', 'missionary', "SELECT probe.correct(2,'missionary',1,3,'save-before-revoke','{\"phone\":\"accepted-before-revoke\"}');", 'policy_manager', "UPDATE probe.effective_authority SET allowed_fields=ARRAY['name'],revision=revision+1 WHERE actor='missionary'; SELECT allowed_fields::text FROM probe.effective_authority WHERE actor='missionary';", lambda a,b: (a.startswith('accepted:2\n') and b.startswith('{name}\n') and snapshot(2)=='accepted-before-revoke:original@example.invalid:2', {'first':a,'second':b,'final':snapshot(2)}))
    h.admin("UPDATE probe.effective_authority SET allowed_fields=ARRAY['name','phone'],revision=revision+1 WHERE actor='missionary';")
    h.concurrent('same_contact_staff_and_missionary_revision_fence', 'missionary', "SELECT probe.correct(3,'missionary',1,5,'missionary-race','{\"phone\":\"missionary-won\"}');", 'staff', "SELECT probe.correct(3,'staff',1,1,'staff-race','{\"email\":\"must-not-persist@example.invalid\"}');", lambda a,b: (a.startswith('accepted:2\n') and b.startswith('source_conflict\n') and snapshot(3)=='missionary-won:original@example.invalid:2', {'first':a,'second':b,'final':snapshot(3)}))
    check('staff_refresh_changes_only_selected_field_preserving_missionary_edit', "SELECT probe.correct(3,'staff',2,1,'staff-refreshed','{\"email\":\"refreshed@example.invalid\"}'); SELECT phone||':'||email||':'||revision FROM probe.contacts WHERE id=3;", 'accepted:3\nmissionary-won:refreshed@example.invalid:3', role='staff')
    check('unsafe_table_UPDATE_survives_column_revoke_and_row_RLS', "UPDATE probe.unsafe_fields SET protected_classification='unauthorized-change' WHERE id=1; SELECT tenant||':'||actor||':'||protected_classification FROM probe.unsafe_fields WHERE id=1; SELECT has_column_privilege(current_user,'probe.unsafe_fields','protected_classification','UPDATE');", '1:missionary:unauthorized-change\nt', counterexample=True)
    check('all_accepted_source_revisions_have_one_audit_and_receipt', "SELECT (SELECT sum(revision-1) FROM probe.contacts)||':'||(SELECT count(*) FROM probe.change_audit)||':'||(SELECT count(*) FROM probe.receipts);", '7:7:7', role='postgres')


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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('missionary','staff','policy_manager','command_executor') ORDER BY rolname)r;")))
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
    result={'recorded_at':datetime.now(timezone.utc).isoformat(),'scope':'Synthetic D5 effective selected-field authority, atomic corrections and retry mechanics; not Core P12 evaluator/schema/API, Supabase/JWT or consequence qualification.','outcomes':len(h.RESULTS),'passed':sum(r['passed'] for r in h.RESULTS),'failure':failure,'artifact_sha256':{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},'helper_sha256':hashlib.sha256(HELPER.read_bytes()).hexdigest(),'results':h.RESULTS}
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure: raise SystemExit(1)
