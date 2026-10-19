"""D18 PostgreSQL counterexamples/mechanics; not P27 or Supabase auth tests."""
from pathlib import Path
import json
import os
import re
import selectors
import subprocess
import time

ROOT = Path(__file__).resolve().parent
NAME = os.environ["D18_LAB_CONTAINER"]
if not NAME.startswith("phase27-d18-list-change-lab-"):
    raise RuntimeError("Only the isolated D18 container is permitted")
ENV = dict(os.environ)
for key in ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"]:
    ENV.pop(key, None)
BASE = ["docker", "--host=unix:///var/run/docker.sock", "exec", "-i", NAME,
        "psql", "-X", "-U", "postgres", "-d", "postgres", "-Atq",
        "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose"]
results = []
sessions = []
version = None
completed = False


def check(name, condition, observed):
    results.append({"test": name, "pass": bool(condition), "observed": observed})
    if not condition:
        raise AssertionError((name, observed))


def error_code(stderr):
    found = re.search(r"ERROR:\s+([0-9A-Z]{5}):", stderr)
    return found.group(1) if found else None


def sql(source, expect_error=None):
    result = subprocess.run(BASE, input="SET statement_timeout='15s';\n" + source,
                            text=True, capture_output=True, env=ENV, timeout=20)
    if expect_error is not None:
        actual = error_code(result.stderr)
        if result.returncode == 0 or actual != expect_error:
            raise AssertionError((expect_error, result.returncode, result.stdout, result.stderr))
        return actual
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def session(name):
    process = subprocess.Popen(BASE, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, text=True, env=ENV, bufsize=1)
    sessions.append(process)
    send(process, f"SET application_name='{name}'; SET statement_timeout='15s'; BEGIN; SELECT pg_backend_pid();")
    return process, int(readline(process))


def send(process, source):
    process.stdin.write(source + "\n")
    process.stdin.flush()


def readline(process):
    with selectors.DefaultSelector() as selector:
        selector.register(process.stdout, selectors.EVENT_READ)
        if not selector.select(timeout=10):
            raise RuntimeError("Transaction output barrier timeout")
    row = process.stdout.readline().strip()
    if not row:
        raise RuntimeError("Unexpected empty transaction output barrier")
    return row


def marker(process, expected):
    actual = readline(process)
    if actual != expected:
        raise AssertionError((expected, actual))


def finish(process, expect_error=None):
    process.stdin.close()
    process.stdin = None
    stdout, stderr = process.communicate(timeout=20)
    if expect_error is not None:
        actual = error_code(stderr)
        if process.returncode == 0 or actual != expect_error:
            raise AssertionError((expect_error, process.returncode, stderr))
        return actual
    if process.returncode:
        raise RuntimeError(stderr)
    return stdout.strip()


def blocked(waiter, blocker):
    deadline = time.monotonic() + 8
    while time.monotonic() < deadline:
        observed = sql(f"""SELECT json_build_object('waiter_pid',pid,'wait_event_type',wait_event_type,
          'blocker_pids',pg_blocking_pids(pid)) FROM pg_stat_activity
          WHERE pid={waiter} AND wait_event_type='Lock'
          AND {blocker}=ANY(pg_blocking_pids(pid));""")
        if observed:
            return json.loads(observed)
        time.sleep(0.05)
    raise RuntimeError(f"No observed wait from {waiter} on expected blocker {blocker}")


def state(scope):
    return json.loads(sql(f"""SELECT json_build_object('journey',to_jsonb(j),
      'history',COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY revision)
        FROM lab.accepted_history h WHERE tenant_id=1 AND scope_id={scope}),'[]'::jsonb),
      'receipts',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY command_key)
        FROM lab.command_receipt r WHERE tenant_id=1 AND scope_id={scope}),'[]'::jsonb))
      FROM lab.journey j WHERE tenant_id=1 AND scope_id={scope} AND id=100;"""))


def call(scope,key,op,revision,target,stage):
    return f"SELECT lab.change_binding(1,{scope},100,'{key}','{op}',{revision},{target},{stage});"


try:
    sql((ROOT/'setup.sql').read_text())
    version=sql('SELECT version();')
    isolation=sql('SHOW transaction_isolation;')

    before=state(1)
    fault=sql(call(1,'fixture-deny-receipt','switch',1,20,201),expect_error='23514')
    rollback_ok=state(1)==before
    first,pid=session('d18_atomic_switch')
    send(first,call(1,'atomic-switch','switch',1,20,201))
    accepted=json.loads(readline(first))
    observer=state(1)
    send(first,'COMMIT;');finish(first)
    after=state(1)
    check('late receipt failure rolls back binding/history; pending accepted switch is invisible until atomic commit',
      fault=='23514' and rollback_ok and observer==before
      and after['journey']==accepted and accepted['list_id']==20
      and accepted['stage_id']==201 and accepted['revision']==2
      and len(after['history'])==1 and len(after['receipts'])==1,
      {'fault_code':fault,'rollback_preserved_all_rows':rollback_ok,
       'observer_saw_complete_old_state':observer==before,'accepted':accepted,
       'history_count':len(after['history']),'receipt_count':len(after['receipts'])})

    first,pid=session('d18_stage_first')
    send(first,call(2,'stage-first','stage',1,10,102));stage_result=json.loads(readline(first))
    second,pid2=session('d18_switch_waits_for_stage')
    send(second,call(2,'switch-stale','switch',1,20,201)+' COMMIT;')
    wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first)
    conflict=finish(second,expect_error='40001')
    after=state(2)
    check('stage edit first: competing list switch waits and cannot overwrite newer assessment',
      conflict=='40001' and after['journey']==stage_result
      and after['journey']['list_id']==10 and after['journey']['stage_id']==102
      and len(after['history'])==1 and len(after['receipts'])==1,
      {'wait':wait,'stale_error':conflict,'current':after['journey']})

    first,pid=session('d18_switch_first')
    send(first,call(3,'switch-first','switch',1,20,201));switch_result=json.loads(readline(first))
    second,pid2=session('d18_stage_waits_for_switch')
    send(second,call(3,'stage-stale','stage',1,10,102)+' COMMIT;')
    wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first)
    conflict=finish(second,expect_error='40001')
    after=state(3)
    check('list switch first: old-list stage edit waits and cannot restore old list or stage',
      conflict=='40001' and after['journey']==switch_result
      and len(after['history'])==1 and len(after['receipts'])==1,
      {'wait':wait,'stale_error':conflict,'current':after['journey']})

    before=state(4)
    first,pid=session('d18_target_withdraw_first')
    send(first,'UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=1 AND scope_id=4 AND id=20 RETURNING id;')
    marker(first,'20')
    second,pid2=session('d18_switch_waits_for_withdraw')
    send(second,call(4,'unavailable-switch','switch',1,20,201)+' COMMIT;')
    wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first)
    denied=finish(second,expect_error='23514')
    check('target withdrawal first: waiting switch observes unavailable target and leaves old binding/history intact',
      denied=='23514' and state(4)==before,
      {'wait':wait,'denial':denied,'journey_state_unchanged':state(4)==before})

    first,pid=session('d18_attachment_first')
    send(first,call(5,'attach-before-withdraw','switch',1,20,201));accepted=json.loads(readline(first))
    second,pid2=session('d18_withdraw_waits_for_attachment')
    send(second,'UPDATE lab.stage_list SET accepts_new=false WHERE tenant_id=1 AND scope_id=5 AND id=20 RETURNING id; COMMIT;')
    wait=blocked(pid2,pid)
    send(first,'COMMIT;');finish(first);withdraw_result=finish(second)
    after=state(5)
    unavailable=sql('SELECT NOT accepts_new FROM lab.stage_list WHERE tenant_id=1 AND scope_id=5 AND id=20;')
    check('list switch first: later withdrawal waits, then preserves the already accepted attachment and history',
      withdraw_result=='20' and unavailable=='t' and after['journey']==accepted
      and len(after['history'])==1 and len(after['receipts'])==1,
      {'wait':wait,'target_withdrawn':unavailable,'current':after['journey']})

    original=state(6)['journey']
    first_result=json.loads(sql(call(6,'first-switch','switch',1,20,201)))
    sql(call(6,'return-switch','switch',2,10,101))
    before=state(6)
    stale=sql(call(6,'old-view-new-command','switch',1,30,301),expect_error='40001')
    replay=json.loads(sql(call(6,'first-switch','switch',1,20,201)))
    payload_conflict=sql(call(6,'first-switch','switch',1,30,301),expect_error='23514')
    check('A to B to A defeats value-only freshness; old accepted replay reports history without reapplying and changed meaning conflicts',
      before['journey']['list_id']==original['list_id']
      and before['journey']['stage_id']==original['stage_id']
      and before['journey']['revision']==3 and stale=='40001'
      and replay==first_result and replay['revision']==2 and replay['list_id']==20
      and payload_conflict=='23514' and state(6)==before and len(before['history'])==2,
      {'stale_error':stale,'payload_conflict':payload_conflict,
       'historical_receipt':replay,'current':before['journey'],
       'history_count':len(before['history']),'replay_preserved_all_rows':state(6)==before})

    sql(call(7,'preserve-earlier-meaning','switch',1,20,201))
    before=state(7)
    sql("UPDATE lab.stage_list SET label='Renamed' WHERE tenant_id=1 AND scope_id=7 AND id=10;")
    stage_delete=sql('DELETE FROM lab.stage WHERE tenant_id=1 AND scope_id=7 AND list_id=10 AND id=101;',expect_error='23503')
    # The old list is no longer current; deleting its stages still encounters history.
    history_identity=before['history'][0]['before_snapshot']['id']
    check('switch history retains old source references and recorded meaning; catalog rename cannot rewrite snapshots or cascade-delete old stage',
      state(7)==before and stage_delete=='23503' and history_identity==100
      and before['history'][0]['from_label']=='Original',
      {'delete_error':stage_delete,'historic_from_label':before['history'][0]['from_label'],
       'current_catalog_label':sql('SELECT label FROM lab.stage_list WHERE tenant_id=1 AND scope_id=7 AND id=10;'),
       'history_unchanged':state(7)==before})

    identities=json.loads(sql("""SELECT json_build_object('journeys',(SELECT count(*) FROM lab.journey),
      'changed_identity_rows',(SELECT count(*) FROM lab.journey WHERE tenant_id<>1
        OR id<>100 OR party_id<>200 OR ministry_id<>300 OR purpose<>'same continuing purpose'),
      'history_identity_mismatches',(SELECT count(*) FROM lab.accepted_history WHERE
        (before_snapshot-'list_id'-'stage_id'-'revision') IS DISTINCT FROM
        (after_snapshot-'list_id'-'stage_id'-'revision')
        OR (before_snapshot->>'id')::int<>journey_id
        OR (before_snapshot->>'scope_id')::int<>scope_id
        OR (before_snapshot->>'tenant_id')::int<>tenant_id));"""))
    check('every accepted fixture change retains journey, party, ministry, continuing purpose and scope without another journey row',
      identities=={'journeys':7,'changed_identity_rows':0,'history_identity_mismatches':0},identities)
    completed=True
finally:
    for process in sessions:
        if process.poll() is None:
            process.kill();process.wait(timeout=5)
    report={'server_version':version,'isolation_level':locals().get('isolation'),
      'completed':completed,'passed':sum(x['pass'] for x in results),'total':len(results),
      'all_pass':completed and all(x['pass'] for x in results),'results':results}
    (ROOT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['passed','total','all_pass']}))


