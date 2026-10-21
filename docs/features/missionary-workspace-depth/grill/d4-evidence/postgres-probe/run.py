#!/usr/bin/env python3
"""D4 synthetic working-state, exact retry/Undo and identity mechanics only."""
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
h.NAME = 'phase28-d4-pg'; h.RESULTS = []
IMAGE = 'postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3'

def save(name, value):
    (ROOT / name).write_text(json.dumps(value, indent=2) + '\n')

def check(name, query, expected=None, state=None, role='owner_a', counterexample=False):
    h.check(name, query, expected, state, role, counterexample)

def current(record):
    return h.admin(f"SELECT work_state||':'||revision FROM probe.records WHERE id={record};")

def scenarios():
    check('archive_retains_source_identity_and_audience', "SELECT probe.move(1,'archived',1,'archive-a'); SELECT id||':'||actor||':'||canonical_key||':'||work_state||':'||revision FROM probe.records WHERE id=1;", 'applied\n1:owner_a:synthetic-source-1:archived:2')
    check('authorized_matching_includes_archived_source', "SELECT id FROM probe.records WHERE canonical_key='synthetic-source-1';", '1')
    check('archive_does_not_grant_outsider_match_visibility', "SELECT count(*) FROM probe.records WHERE canonical_key='synthetic-source-1';", '0', role='outsider')
    check('exact_transition_undo_restores_same_source', "SELECT probe.move(1,'active',2,'undo-a','archive-a'); SELECT id||':'||work_state||':'||revision FROM probe.records WHERE id=1;", 'applied\n1:active:3')
    check('stale_archive_retry_recovers_history_without_rearchiving', "SELECT probe.move(1,'archived',1,'archive-a'); SELECT work_state||':'||revision FROM probe.records WHERE id=1;", 'replay\nactive:3')
    check('new_retry_key_with_stale_revision_cannot_rearchive', "SELECT probe.move(1,'archived',1,'new-key-old-revision'); SELECT work_state||':'||revision FROM probe.records WHERE id=1;", 'conflict\nactive:3')
    check('later_rearchive_is_a_new_transition', "SELECT probe.move(1,'archived',3,'archive-b'); SELECT work_state||':'||revision FROM probe.records WHERE id=1;", 'applied\narchived:4')
    check('old_undo_cannot_reverse_later_archive_even_with_current_revision', "SELECT probe.move(1,'active',4,'late-undo-a','archive-a'); SELECT work_state||':'||revision FROM probe.records WHERE id=1;", 'conflict\narchived:4')
    check('undo_current_archive_preserves_identity', "SELECT probe.move(1,'active',4,'undo-b','archive-b'); SELECT id||':'||actor||':'||canonical_key||':'||work_state||':'||revision FROM probe.records WHERE id=1;", 'applied\n1:owner_a:synthetic-source-1:active:5')
    check('same_retry_key_changed_meaning_conflicts', "SELECT probe.move(1,'active',1,'archive-a'); SELECT work_state||':'||revision FROM probe.records WHERE id=1;", 'conflict\nactive:5')
    h.concurrent('concurrent_archive_and_stale_restore_serialize', 'owner_a', "SELECT probe.move(2,'archived',1,'race-archive');", 'owner_a', "SELECT probe.move(2,'active',1,'race-restore');", lambda a,b: (a.startswith('applied\n') and b.startswith('conflict\n') and current(2)=='archived:2', {'first':a,'second':b,'final':current(2)}))
    h.concurrent('revocation_first_blocks_restore_after_real_lock_wait', 'gate_manager', "UPDATE probe.gates SET allowed=false WHERE actor='owner_a';", 'owner_a', "SELECT probe.move(2,'active',2,'revoked-restore');", lambda a,b: (b.startswith('unavailable\n') and current(2)=='archived:2' and h.sql('SELECT count(*) FROM probe.records;', 'owner_a').stdout.strip()=='0', {'second':b,'final':current(2),'current_authorized_read_count':h.sql('SELECT count(*) FROM probe.records;', 'owner_a').stdout.strip()}))
    check('revocation_prevents_receipt_replay_and_source_read', "SELECT probe.move(1,'archived',1,'archive-a'); SELECT count(*) FROM probe.records;", 'unavailable\n0')
    # Administrative fixture reset only: a working-state restore never grants authority.
    h.admin("UPDATE probe.gates SET allowed=true WHERE actor='owner_a';")
    h.concurrent('restore_first_commits_before_waiting_revocation', 'owner_a', "SELECT probe.move(2,'active',2,'restore-before-revoke');", 'gate_manager', "UPDATE probe.gates SET allowed=false WHERE actor='owner_a'; SELECT allowed FROM probe.gates WHERE actor='owner_a';", lambda a,b: (a.startswith('applied\n') and b.startswith('f\n') and current(2)=='active:3' and h.sql('SELECT count(*) FROM probe.records;', 'owner_a').stdout.strip()=='0', {'first':a,'second':b,'final':current(2),'current_authorized_read_count':h.sql('SELECT count(*) FROM probe.records;', 'owner_a').stdout.strip()}))
    h.admin("UPDATE probe.gates SET allowed=true WHERE actor='owner_a';")
    check('whole_identity_constraint_prevents_archived_duplicate', "SELECT probe.move(3,'archived',1,'archive-c'); INSERT INTO probe.records VALUES(1,30,'owner_a','synthetic-source-3','active',1,NULL);", state='23505')
    check('failed_duplicate_keeps_single_archived_original', "SELECT count(*) FROM probe.records WHERE canonical_key='synthetic-source-3'; SELECT id||':'||work_state FROM probe.records WHERE canonical_key='synthetic-source-3';", '1\n3:archived')
    check('unsafe_active_only_unique_index_allows_duplicate_canonical_identity', "INSERT INTO probe.unsafe_active_only VALUES(1,1,'synthetic-canonical','active'); UPDATE probe.unsafe_active_only SET work_state='archived' WHERE id=1; INSERT INTO probe.unsafe_active_only VALUES(2,1,'synthetic-canonical','active'); SELECT count(*) FROM probe.unsafe_active_only WHERE canonical_key='synthetic-canonical';", '2', counterexample=True)
    check('unsafe_duplicate_now_blocks_restore_of_original', "UPDATE probe.unsafe_active_only SET work_state='active' WHERE id=1;", state='23505', counterexample=True)
    check('unsafe_active_only_matching_omits_authorized_archived_identity', "SELECT (SELECT count(*) FROM probe.records WHERE canonical_key='synthetic-source-3' AND work_state='active')||':'||(SELECT count(*) FROM probe.records WHERE canonical_key='synthetic-source-3');", '0:1', counterexample=True)

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
        save('roles.json',json.loads(h.admin("SELECT json_agg(r) FROM(SELECT rolname,rolsuper,rolbypassrls,rolcanlogin,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname IN('owner_a','outsider','gate_manager','command_executor') ORDER BY rolname)r;")))
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
    result={'recorded_at':datetime.now(timezone.utc).isoformat(),'scope':'Synthetic D4 working-state/retry/Undo/identity mechanics, not Core implementation or schema, source-producer, Supabase/API/JWT or provider qualification.','outcomes':len(h.RESULTS),'passed':sum(r['passed'] for r in h.RESULTS),'failure':failure,'artifact_sha256':{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in ['setup.sql','run.py','sources.json']},'helper_sha256':hashlib.sha256(HELPER.read_bytes()).hexdigest(),'results':h.RESULTS}
    save('results.json',result)
    print(json.dumps({k:result[k] for k in ['outcomes','passed','failure']}))
    if failure: raise SystemExit(1)
